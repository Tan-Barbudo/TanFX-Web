import React, { useRef } from 'react';
import { Play, Pause, Square, RotateCw, Volume2, Flame, Upload, Music, ArrowDown, ChevronDown, ChevronUp } from 'lucide-react';
import { BgmConfig, BgmPlaybackStatus } from '../types';

interface BackgroundMusicBarProps {
  config: BgmConfig;
  status: BgmPlaybackStatus;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onVolumeChange: (vol: number) => void;
  onLoopToggle: (loop: boolean) => void;
  onDuckLevelChange: (level: number) => void;
  onFadeOut: (seconds: number) => void;
  onLoadTrack: (file: File) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const BackgroundMusicBar: React.FC<BackgroundMusicBarProps> = ({
  config,
  status,
  onPlay,
  onPause,
  onStop,
  onVolumeChange,
  onLoopToggle,
  onDuckLevelChange,
  onFadeOut,
  onLoadTrack,
  isOpen,
  onToggleOpen,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onLoadTrack(file);
    }
  };

  return (
    <div
      id="background-music-section"
      className="bg-[#0c1018] border-t border-slate-800 transition-all select-none shadow-2xl"
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*,.mp3,.wav,.ogg,.m4a,.aac"
        onChange={handleFile}
        className="hidden"
      />

      {/* TOP TOGGLE TAB / MINI STATUS BAR */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-800/60 bg-[#0e131d]">
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleOpen}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-cyan-400 transition"
          >
            <Music className={`w-3.5 h-3.5 text-cyan-400 ${status.isPlaying ? 'animate-pulse' : ''}`} />
            <span className="font-['Chakra_Petch',sans-serif] tracking-wider uppercase">
              BACKGROUND MUSIC (MÚSICA DE FONDO)
            </span>
            {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          {/* DUCKING STATUS BADGE */}
          {status.isDucked && (
            <span
              id="bgm-ducking-badge"
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/80 border border-amber-500/60 text-[10px] font-bold text-amber-300 animate-pulse"
              title="Auto-ducking activado: El volumen de la música está atenuado temporalmente por un efecto o voz"
            >
              <ArrowDown className="w-3 h-3 text-amber-400" />
              AUTO-DUCKING ACTIVO
            </span>
          )}

          {config.fileName && (
            <span className="text-[11px] text-slate-400 truncate max-w-[140px] sm:max-w-xs font-mono">
              {config.fileName}
            </span>
          )}
        </div>

        {/* QUICK MINI CONTROLS (ALWAYS ACCESSIBLE EVEN IF COLLAPSED) */}
        <div className="flex items-center gap-2">
          {config.fileId && (
            <>
              {status.isPlaying ? (
                <button
                  onClick={onPause}
                  className="p-1 rounded bg-amber-600 hover:bg-amber-500 text-white transition"
                  title="Pausar música"
                >
                  <Pause className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={onPlay}
                  className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition"
                  title="Reproducir música"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                </button>
              )}
              <button
                onClick={onStop}
                className="p-1 rounded bg-red-600 hover:bg-red-500 text-white transition"
                title="Detener música"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
              </button>
            </>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 border border-slate-750"
            title="Cargar archivo de música"
          >
            <Upload className="w-3 h-3" />
            <span className="hidden sm:inline">{config.fileId ? 'CAMBIAR' : 'CARGAR PISTA'}</span>
          </button>
        </div>
      </div>

      {/* FULL PANEL WHEN EXPANDED */}
      {isOpen && (
        <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          {/* TRACK INFO & PROGRESS */}
          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white truncate max-w-[200px]">
                {config.fileName || 'Sin música seleccionada'}
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                {formatTime(status.currentTime)} / {formatTime(status.duration)}
              </span>
            </div>
            {/* Progress line */}
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-cyan-400 h-full transition-all duration-100"
                style={{ width: `${Math.min(100, Math.max(0, status.progress * 100))}%` }}
              />
            </div>
          </div>

          {/* MAIN PLAYBACK BUTTONS */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={onPlay}
              disabled={!config.fileId}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-xs transition active:scale-95 ${
                status.isPlaying
                  ? 'bg-emerald-600 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)] border border-emerald-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              } disabled:opacity-40 disabled:pointer-events-none`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>PLAY</span>
            </button>

            <button
              onClick={onPause}
              disabled={!config.fileId || !status.isPlaying}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>PAUSE</span>
            </button>

            <button
              onClick={onStop}
              disabled={!config.fileId}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 border border-red-600/70 text-red-300 font-bold text-xs transition active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
            >
              <Square className="w-3.5 h-3.5 fill-red-300" />
              <span>STOP</span>
            </button>

            <button
              onClick={() => onLoopToggle(!config.loop)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition ${
                config.loop
                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
              title="Bucle de música"
            >
              <RotateCw className="w-3 h-3" />
              <span>LOOP</span>
            </button>

            <button
              onClick={() => onFadeOut(2.0)}
              disabled={!status.isPlaying}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-600/50 text-indigo-300 text-xs font-bold transition disabled:opacity-40 disabled:pointer-events-none"
              title="Desvanecer suavemente (Fade 2s)"
            >
              <Flame className="w-3 h-3" />
              <span>FADE</span>
            </button>
          </div>

          {/* VOLUME & AUTO-DUCKING SETTINGS */}
          <div className="flex items-center justify-end gap-3">
            {/* Volume slider */}
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-mono text-slate-400">
                  VOL {Math.round(config.volume * 100)}%
                </span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={config.volume}
                  onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                  className="w-20 sm:w-24 h-1.5 accent-cyan-400 bg-slate-700 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Duck level dropdown */}
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-mono text-slate-400">
                NIVEL DUCK
              </span>
              <select
                value={config.duckLevel}
                onChange={(e) => onDuckLevelChange(parseFloat(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded px-1.5 py-0.5 text-[10px] text-amber-300 font-bold focus:outline-none"
                title="Volumen al que baja la música cuando suena un pad con Auto-Ducking"
              >
                <option value={0.15}>15% (Fuerte)</option>
                <option value={0.25}>25% (Estándar)</option>
                <option value={0.4}>40% (Suave)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
