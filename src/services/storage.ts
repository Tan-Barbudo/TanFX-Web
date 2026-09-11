/**
 * TAN FX - Storage Service
 * IndexedDB persistence for Shows, Banks, Pads, and Audio Blobs
 */

import { Show, Bank, SoundPad, BgmConfig } from '../types';

const DB_NAME = 'TAN_FX_DB';
const DB_VERSION = 1;

export interface StoredAudio {
  fileId: string;
  fileName: string;
  fileType: string;
  blob: Blob;
  duration: number;
  updatedAt: number;
}

// Generate an empty bank with 24 pads
export function createEmptyBank(id: string, name: string): Bank {
  const defaultColors = ['blue', 'cyan', 'emerald', 'lime', 'amber', 'orange', 'red', 'rose', 'purple', 'yellow', 'indigo', 'steel'];
  const pads: SoundPad[] = [];

  for (let i = 0; i < 24; i++) {
    // Distribute nice default palette across rows
    const colorKey = defaultColors[i % defaultColors.length];
    pads.push({
      id: `${id}_pad_${i + 1}`,
      index: i,
      name: `PAD ${i + 1}`,
      color: colorKey,
      fileId: null,
      fileName: null,
      duration: 0,
      volume: 1.0,
      loop: false,
      fadeIn: 0,
      fadeOut: 0,
      playbackMode: 'TOGGLE',
      autoDucking: false,
    });
  }

  return {
    id,
    name,
    pads,
  };
}

export function createDefaultShow(id: string, name: string): Show {
  const banks: Bank[] = [
    createEmptyBank(`${id}_bank_a`, 'BANCO A'),
    createEmptyBank(`${id}_bank_b`, 'BANCO B'),
    createEmptyBank(`${id}_bank_c`, 'BANCO C'),
    createEmptyBank(`${id}_bank_d`, 'BANCO D'),
  ];

  const bgm: BgmConfig = {
    fileId: null,
    fileName: null,
    volume: 0.8,
    loop: true,
    duckLevel: 0.25,
    fadeOut: 1.0,
  };

  return {
    id,
    name,
    banks,
    activeBankId: banks[0].id,
    bgm,
    masterVolume: 1.0,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// Standard show presets requested
export const SHOW_PRESETS: { id: string; name: string }[] = [
  { id: 'show_infantil', name: 'SHOW INFANTIL' },
  { id: 'show_iglesia', name: 'IGLESIA' },
  { id: 'show_evangelismo', name: 'EVANGELISMO' },
  { id: 'show_magia', name: 'MAGIA' },
  { id: 'show_cumpleanos', name: 'CUMPLEAÑOS' },
  { id: 'show_evento', name: 'EVENTO' },
];

class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not supported in this environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains('shows')) {
          db.createObjectStore('shows', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('audioBlobs')) {
          db.createObjectStore('audioBlobs', { keyPath: 'fileId' });
        }
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    return this.dbPromise;
  }

  // --- Audio Blobs ---
  async saveAudioBlob(fileId: string, file: Blob, metadata: { fileName: string; fileType: string; duration: number }): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('audioBlobs', 'readwrite');
      const store = tx.objectStore('audioBlobs');
      const record: StoredAudio = {
        fileId,
        fileName: metadata.fileName,
        fileType: metadata.fileType || file.type || 'audio/mpeg',
        blob: file,
        duration: metadata.duration,
        updatedAt: Date.now(),
      };
      const req = store.put(record);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getAudioBlob(fileId: string): Promise<StoredAudio | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('audioBlobs', 'readonly');
      const store = tx.objectStore('audioBlobs');
      const req = store.get(fileId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async deleteAudioBlob(fileId: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('audioBlobs', 'readwrite');
      const store = tx.objectStore('audioBlobs');
      const req = store.delete(fileId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // --- Shows ---
  async getAllShows(): Promise<Show[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('shows', 'readonly');
      const store = tx.objectStore('shows');
      const req = store.getAll();
      req.onsuccess = () => {
        const shows = req.result as Show[];
        if (!shows || shows.length === 0) {
          // Initialize with default shows
          const initialShow = createDefaultShow('show_infantil', 'SHOW INFANTIL');
          this.saveShow(initialShow).then(() => resolve([initialShow])).catch(reject);
        } else {
          resolve(shows);
        }
      };
      req.onerror = () => reject(req.error);
    });
  }

  async getShow(id: string): Promise<Show | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('shows', 'readonly');
      const store = tx.objectStore('shows');
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async saveShow(show: Show): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('shows', 'readwrite');
      const store = tx.objectStore('shows');
      const updatedShow = { ...show, updatedAt: Date.now() };
      const req = store.put(updatedShow);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async deleteShow(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('shows', 'readwrite');
      const store = tx.objectStore('shows');
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  // Active show ID
  async getActiveShowId(): Promise<string | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('metadata', 'readonly');
      const store = tx.objectStore('metadata');
      const req = store.get('activeShowId');
      req.onsuccess = () => resolve(req.result ? req.result.value : null);
      req.onerror = () => reject(req.error);
    });
  }

  async setActiveShowId(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('metadata', 'readwrite');
      const store = tx.objectStore('metadata');
      const req = store.put({ key: 'activeShowId', value: id });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}

export const storage = new StorageService();
