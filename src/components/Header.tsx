import React from 'react';
import { Volume2, VolumeX, Square, Pause, Flame, Lock, Unlock, FolderOpen, Info, Music } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentShowName: string;
  masterVolume: number;
  onMasterVolumeChange: (vol: number) => void;
  onStopAll: () => void;
  onFadeAll: () => void;
  onPauseAll: () => void;
  performanceMode: boolean;
  onTogglePerformanceMode: () => void;
  isEditingLocked: boolean;
  onToggleLockEditing: () => void;
  onOpenShows: () => void;
  onOpenAbout: () => void;
  onToggleBgmBar: () => void;
  isBgmPlaying: boolean;
  activeSoundsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentShowName,
  masterVolume,
  onMasterVolumeChange,
  onStopAll,
  onFadeAll,
  onPauseAll,
  performanceMode,
  onTogglePerformanceMode,
  isEditingLocked,
  onToggleLockEditing,
  onOpenShows,
  onOpenAbout,
  onToggleBgmBar,
  isBgmPlaying,
  activeSoundsCount,
}) => {
  return (
    <header
      id="main-header"
      className="bg-[#0e131d] border-b border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-3 shadow-lg select-none"
    >
      {/* BRANDING SECTION */}
      <div className="flex items-center gap-3">
        <div className="flex items-baseline gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse" />
            <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white font-['Chakra_Petch',sans-serif]">
              TAN FX
            </h1>
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-cyan-400 font-mono hidden md:inline">
            Performance Soundboard
          </span>
        </div>

        <div className="hidden lg:flex flex-col border-l border-slate-700/80 pl-3">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">
            Designed by Payaso Tan Barbudo
          </span>
        </div>

        {/* CURRENT SHOW BADGE */}
        <button
          id="btn-open-shows"
          onClick={onOpenShows}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/90 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-xs text-amber-300 font-semibold transition"
          title="Ver y cambiar shows (Mis Shows)"
        >
          <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
          <span className="truncate max-w-[120px] sm:max-w-[160px]">{currentShowName}</span>
        </button>
      </div>

      {/* MASTER CONTROLS SECTION */}
      <div className="flex items-center flex-wrap gap-2 lg:gap-3">
        {/* Active sounds counter indicator */}
        {activeSoundsCount > 0 && (
          <div
            id="active-sounds-indicator"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/70 border border-amber-500/50 text-[11px] font-bold text-amber-300 animate-pulse"
            title={`${activeSoundsCount} sonido(s) activo(s)`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>{activeSoundsCount} SONANDO</span>
          </div>
        )}

        {/* Master Volume */}
        <div className="flex items-center gap-2 bg-slate-900/90 px-2.5 py-1 rounded-lg border border-slate-800">
          <button
            id="btn-master-mute-toggle"
            onClick={() => onMasterVolumeChange(masterVolume > 0 ? 0 : 1)}
            className="text-slate-400 hover:text-white transition"
            title={masterVolume > 0 ? 'Silenciar Master' : 'Restablecer Master'}
          >
            {masterVolume > 0 ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-red-400" />
            )}
          </button>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400 -mb-0.5">
              MASTER {Math.round(masterVolume * 100)}%
            </span>
            <input
              id="input-master-volume"
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => onMasterVolumeChange(parseFloat(e.target.value))}
              className="w-20 sm:w-24 h-1.5 accent-cyan-400 bg-slate-700 rounded cursor-pointer"
              title="Volumen Master"
            />
          </div>
        </div>

        {/* BGM Toggle button */}
        <button
          id="btn-toggle-bgm"
          onClick={onToggleBgmBar}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
            isBgmPlaying
              ? 'bg-emerald-950 border-emerald-500/80 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
              : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
          }`}
          title="Abrir / Controlar Música de Fondo"
        >
          <Music className={`w-3.5 h-3.5 ${isBgmPlaying ? 'text-emerald-400 animate-spin' : ''}`} />
          <span className="hidden sm:inline">MÚSICA</span>
        </button>

        {/* PAUSE ALL */}
        <button
          id="btn-pause-all"
          onClick={onPauseAll}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/50 text-amber-300 hover:text-amber-200 text-xs font-bold transition active:scale-95"
          title="Pausar o reanudar todo el audio"
        >
          <Pause className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">PAUSE ALL</span>
        </button>

        {/* FADE ALL */}
        <button
          id="btn-fade-all"
          onClick={onFadeAll}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-600/50 text-indigo-300 hover:text-indigo-200 text-xs font-bold transition active:scale-95"
          title="Desvanecer suavemente todos los sonidos activos (Fade All)"
        >
          <Flame className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">FADE ALL</span>
        </button>

        {/* STOP ALL (MUST BE VERY VISIBLE AND RED) */}
        <button
          id="btn-stop-all"
          onClick={onStopAll}
          className="flex items-center gap-1.5 px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-red-600 hover:bg-red-500 active:bg-red-700 border-2 border-red-300 text-white font-black text-xs sm:text-sm tracking-wider shadow-[0_0_20px_rgba(239,68,68,0.7)] transition transform active:scale-95"
          title="DETENER TODOS LOS SONIDOS INMEDIATAMENTE (Espacio)"
        >
          <Square className="w-4 h-4 fill-white" />
          <span>STOP ALL</span>
        </button>

        {/* PERFORMANCE MODE & LOCK CONTROLS */}
        <div className="flex items-center gap-1 border-l border-slate-700/80 pl-2">
          <button
            id="btn-performance-mode"
            onClick={onTogglePerformanceMode}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition active:scale-95 ${
              performanceMode
                ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]'
                : 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title="Modo Actuación: Oculta edición y maximiza pantalla para el show"
          >
            <span>{performanceMode ? 'MODO EN VIVO' : 'EN VIVO'}</span>
          </button>

          <button
            id="btn-lock-editing"
            onClick={onToggleLockEditing}
            className={`p-1.5 rounded-lg border transition ${
              isEditingLocked
                ? 'bg-red-950/60 border-red-600/60 text-red-400'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title={isEditingLocked ? 'Edición Bloqueada (Click para desbloquear)' : 'Bloquear Edición de Pads'}
          >
            {isEditingLocked ? <Lock className="w-4 h-4 text-red-400" /> : <Unlock className="w-4 h-4" />}
          </button>
        </div>

        {/* PWA INSTALL & ABOUT */}
        <div className="flex items-center gap-1 border-l border-slate-700/80 pl-2">
          <PWAInstallButton />

          <button
            id="btn-about"
            onClick={onOpenAbout}
            className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition"
            title="Acerca de TAN FX / Atajos de Teclado"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
