/**
 * TAN FX - Audio Engine
 * High-performance Web Audio API engine for live show soundboards
 * Designed for low latency, simultaneous playback, auto ducking, fading, and loops.
 */

import { SoundPad, PadPlaybackStatus, BgmPlaybackStatus } from '../types';
import { storage } from './storage';

type StatusListener = (activePads: Map<string, PadPlaybackStatus>, bgmStatus: BgmPlaybackStatus) => void;

interface ActivePadInstance {
  padId: string;
  bankId: string;
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  buffer: AudioBuffer;
  startedAt: number; // AudioContext.currentTime when started
  offset: number; // offset in seconds when resumed/started
  duration: number;
  loop: boolean;
  autoDucking: boolean;
  fadeOut: number;
  isStopping: boolean;
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private masterVolume: number = 1.0;

  // Buffer cache: fileId -> AudioBuffer
  private bufferCache: Map<string, AudioBuffer> = new Map();

  // Active playing pads: padId -> ActivePadInstance
  private activePads: Map<string, ActivePadInstance> = new Map();

  // BGM playback
  private bgmAudio: HTMLAudioElement | null = null;
  private bgmSource: MediaElementAudioSourceNode | null = null;
  private bgmFileId: string | null = null;
  private bgmTargetVolume: number = 0.8;
  private bgmDuckLevel: number = 0.25;
  private bgmIsLoop: boolean = true;
  private bgmIsPlaying: boolean = false;
  private bgmIsPaused: boolean = false;

  // Auto Ducking tracking: Set of active padIds currently ducking the BGM
  private duckingPads: Set<string> = new Set();

  // Subscribers for real-time playhead/progress
  private listeners: Set<StatusListener> = new Set();
  private tickerId: number | null = null;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  public initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx({ latencyHint: 'interactive' });

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmTargetVolume, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(console.error);
    }

    this.startTicker();
    return this.ctx;
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.03);
    }
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  // --- Buffer Loading & Decoding ---
  public async loadAudioBuffer(fileId: string, fileBlob?: Blob): Promise<AudioBuffer | null> {
    if (this.bufferCache.has(fileId)) {
      return this.bufferCache.get(fileId)!;
    }

    let blob = fileBlob;
    if (!blob) {
      const stored = await storage.getAudioBlob(fileId);
      if (stored) {
        blob = stored.blob;
      }
    }

    if (!blob) return null;

    const ctx = this.initContext();
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const decodedBuffer = await ctx.decodeAudioData(arrayBuffer);
      this.bufferCache.set(fileId, decodedBuffer);
      return decodedBuffer;
    } catch (err) {
      console.error('Error decoding audio data for fileId', fileId, err);
      return null;
    }
  }

  // Pre-cache an AudioBuffer directly from a File
  public async registerFile(file: File): Promise<{ fileId: string; duration: number; buffer: AudioBuffer }> {
    const ctx = this.initContext();
    const arrayBuffer = await file.arrayBuffer();
    const decodedBuffer = await ctx.decodeAudioData(arrayBuffer.slice(0));
    const fileId = `audio_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    this.bufferCache.set(fileId, decodedBuffer);

    // Persist to IndexedDB
    await storage.saveAudioBlob(fileId, file, {
      fileName: file.name,
      fileType: file.type,
      duration: decodedBuffer.duration,
    });

    return {
      fileId,
      duration: decodedBuffer.duration,
      buffer: decodedBuffer,
    };
  }

  // --- Sound Pad Playback ---
  public async triggerPad(pad: SoundPad, bankId: string): Promise<boolean> {
    const ctx = this.initContext();
    if (!pad.fileId) return false;

    // Check if already playing
    if (this.activePads.has(pad.id)) {
      if (pad.playbackMode === 'TOGGLE') {
        this.stopPad(pad.id, pad.fadeOut);
        return false;
      } else if (pad.playbackMode === 'ONE_SHOT') {
        // Re-trigger from beginning: stop existing first
        this.stopPad(pad.id, 0.02);
      }
    }

    const buffer = await this.loadAudioBuffer(pad.fileId);
    if (!buffer) {
      console.warn(`Could not load audio buffer for pad ${pad.id}`);
      return false;
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = pad.loop;

    const gainNode = ctx.createGain();
    const now = ctx.currentTime;
    const targetVol = Math.max(0, Math.min(1, pad.volume));

    if (pad.fadeIn > 0) {
      gainNode.gain.setValueAtTime(0.0001, now);
      gainNode.gain.linearRampToValueAtTime(targetVol, now + pad.fadeIn);
    } else {
      gainNode.gain.setValueAtTime(targetVol, now);
    }

    gainNode.connect(this.masterGain!);
    source.connect(gainNode);

    const instance: ActivePadInstance = {
      padId: pad.id,
      bankId,
      source,
      gainNode,
      buffer,
      startedAt: now,
      offset: 0,
      duration: buffer.duration,
      loop: pad.loop,
      autoDucking: pad.autoDucking,
      fadeOut: pad.fadeOut,
      isStopping: false,
    };

    source.onended = () => {
      // Clean up pad when finished naturally
      if (this.activePads.get(pad.id)?.source === source) {
        this.cleanupPad(pad.id);
      }
    };

    source.start(0);
    this.activePads.set(pad.id, instance);

    // Auto Ducking
    if (pad.autoDucking) {
      this.duckingPads.add(pad.id);
      this.applyDucking();
    }

    this.notifyStatus();
    return true;
  }

  public stopPad(padId: string, fadeDurationOverride?: number): void {
    const instance = this.activePads.get(padId);
    if (!instance || !this.ctx || instance.isStopping) return;

    instance.isStopping = true;
    const now = this.ctx.currentTime;
    const fade = fadeDurationOverride !== undefined ? fadeDurationOverride : instance.fadeOut;

    if (fade > 0.05) {
      instance.gainNode.gain.setValueAtTime(instance.gainNode.gain.value, now);
      instance.gainNode.gain.linearRampToValueAtTime(0.0001, now + fade);
      setTimeout(() => {
        try {
          instance.source.stop();
        } catch {
          // already stopped
        }
        this.cleanupPad(padId);
      }, Math.round(fade * 1000) + 20);
    } else {
      try {
        instance.source.stop();
      } catch {
        // already stopped
      }
      this.cleanupPad(padId);
    }
  }

  private cleanupPad(padId: string) {
    const instance = this.activePads.get(padId);
    if (instance) {
      try {
        instance.gainNode.disconnect();
      } catch {
        // already disconnected
      }
      this.activePads.delete(padId);
    }

    if (this.duckingPads.has(padId)) {
      this.duckingPads.delete(padId);
      this.applyDucking();
    }

    this.notifyStatus();
  }

  public isPadPlaying(padId: string): boolean {
    return this.activePads.has(padId);
  }

  public getActivePadsCountInBank(bankId: string): number {
    let count = 0;
    for (const inst of this.activePads.values()) {
      if (inst.bankId === bankId) count++;
    }
    return count;
  }

  // --- Master Stop / Fade / Pause ---
  public stopAll(includeBgm: boolean = false): void {
    if (!this.ctx) return;

    // Immediately stop all pads
    const padIds = Array.from(this.activePads.keys());
    for (const id of padIds) {
      this.stopPad(id, 0.02);
    }

    if (includeBgm) {
      this.stopBgm();
    }

    this.notifyStatus();
  }

  public fadeAll(duration: number = 1.5): void {
    if (!this.ctx) return;

    const padIds = Array.from(this.activePads.keys());
    for (const id of padIds) {
      this.stopPad(id, duration);
    }

    // Also smoothly fade BGM if playing
    if (this.bgmIsPlaying && this.bgmAudio) {
      this.fadeBgm(duration);
    }
  }

  public pauseAll(): void {
    if (!this.ctx) return;

    if (this.ctx.state === 'running') {
      this.ctx.suspend().catch(console.error);
      if (this.bgmAudio && !this.bgmAudio.paused) {
        this.bgmAudio.pause();
        this.bgmIsPaused = true;
      }
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(console.error);
      if (this.bgmAudio && this.bgmIsPaused) {
        this.bgmAudio.play().catch(console.error);
        this.bgmIsPaused = false;
      }
    }
  }

  // --- Background Music (BGM) Channel ---
  public async setBgmTrack(fileId: string, blob?: Blob): Promise<boolean> {
    this.stopBgm();
    this.bgmFileId = fileId;

    let fileBlob = blob;
    if (!fileBlob) {
      const stored = await storage.getAudioBlob(fileId);
      if (stored) fileBlob = stored.blob;
    }

    if (!fileBlob) return false;

    const ctx = this.initContext();
    const url = URL.createObjectURL(fileBlob);

    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.src = '';
    }

    this.bgmAudio = new Audio(url);
    this.bgmAudio.loop = this.bgmIsLoop;
    this.bgmAudio.crossOrigin = 'anonymous';

    // Hook to Web Audio API via createMediaElementSource
    try {
      this.bgmSource = ctx.createMediaElementSource(this.bgmAudio);
      this.bgmSource.connect(this.bgmGain!);
    } catch {
      // If already connected or not supported
    }

    this.bgmAudio.onended = () => {
      this.bgmIsPlaying = false;
      this.notifyStatus();
    };

    return true;
  }

  public playBgm(): void {
    if (!this.bgmAudio) return;
    this.initContext();
    this.bgmAudio.loop = this.bgmIsLoop;
    this.bgmAudio.play().then(() => {
      this.bgmIsPlaying = true;
      this.bgmIsPaused = false;
      this.applyDucking();
      this.notifyStatus();
    }).catch(console.error);
  }

  public pauseBgm(): void {
    if (!this.bgmAudio) return;
    this.bgmAudio.pause();
    this.bgmIsPlaying = false;
    this.bgmIsPaused = true;
    this.notifyStatus();
  }

  public stopBgm(): void {
    if (!this.bgmAudio) return;
    this.bgmAudio.pause();
    this.bgmAudio.currentTime = 0;
    this.bgmIsPlaying = false;
    this.bgmIsPaused = false;
    this.notifyStatus();
  }

  public setBgmVolume(volume: number): void {
    this.bgmTargetVolume = Math.max(0, Math.min(1, volume));
    this.applyDucking();
  }

  public setBgmLoop(loop: boolean): void {
    this.bgmIsLoop = loop;
    if (this.bgmAudio) {
      this.bgmAudio.loop = loop;
    }
  }

  public setBgmDuckLevel(duckLevel: number): void {
    this.bgmDuckLevel = Math.max(0.05, Math.min(0.8, duckLevel));
    this.applyDucking();
  }

  public fadeBgm(duration: number = 2.0): void {
    if (!this.bgmGain || !this.ctx || !this.bgmAudio) return;
    const now = this.ctx.currentTime;
    this.bgmGain.gain.setValueAtTime(this.bgmGain.gain.value, now);
    this.bgmGain.gain.linearRampToValueAtTime(0.0001, now + duration);

    setTimeout(() => {
      this.stopBgm();
      // Restore gain node level for next playback
      if (this.bgmGain && this.ctx) {
        this.bgmGain.gain.setValueAtTime(this.bgmTargetVolume, this.ctx.currentTime);
      }
    }, Math.round(duration * 1000) + 30);
  }

  private applyDucking() {
    if (!this.bgmGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    const isDucked = this.duckingPads.size > 0;
    const target = isDucked ? this.bgmTargetVolume * this.bgmDuckLevel : this.bgmTargetVolume;

    // Smooth ramp: quick duck in (0.15s), smooth restore (0.4s)
    const rampTime = isDucked ? 0.15 : 0.45;
    this.bgmGain.gain.setTargetAtTime(target, now, rampTime / 3);
  }

  // --- Real-time Ticker & Status ---
  private startTicker() {
    if (this.tickerId !== null) return;

    const tick = () => {
      this.notifyStatus();
      this.tickerId = requestAnimationFrame(tick);
    };

    this.tickerId = requestAnimationFrame(tick);
  }

  public subscribe(listener: StatusListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyStatus() {
    if (this.listeners.size === 0) return;

    const now = this.ctx ? this.ctx.currentTime : 0;
    const statusMap = new Map<string, PadPlaybackStatus>();

    for (const [padId, instance] of this.activePads.entries()) {
      const elapsed = Math.max(0, now - instance.startedAt);
      const duration = instance.duration;
      const progress = duration > 0 ? (instance.loop ? (elapsed % duration) / duration : Math.min(1, elapsed / duration)) : 0;
      const current = instance.loop ? elapsed % duration : Math.min(duration, elapsed);
      const remaining = Math.max(0, duration - current);

      statusMap.set(padId, {
        padId,
        bankId: instance.bankId,
        isPlaying: true,
        isPaused: false,
        currentTime: current,
        duration,
        progress,
        remainingTime: remaining,
      });
    }

    const bgmStatus: BgmPlaybackStatus = {
      isPlaying: this.bgmIsPlaying,
      isPaused: this.bgmIsPaused,
      currentTime: this.bgmAudio?.currentTime || 0,
      duration: this.bgmAudio?.duration || 0,
      progress: this.bgmAudio && this.bgmAudio.duration ? (this.bgmAudio.currentTime / this.bgmAudio.duration) : 0,
      isDucked: this.duckingPads.size > 0,
    };

    for (const listener of this.listeners) {
      listener(statusMap, bgmStatus);
    }
  }
}

export const audioEngine = new AudioEngine();
