import React, { useRef } from 'react';
import { Plus, Settings, RotateCw, Volume2, ArrowDownCircle, ArrowUpCircle, Edit3 } from 'lucide-react';
import { SoundPad, PAD_COLORS, PadPlaybackStatus } from '../types';

interface SoundPadButtonProps {
  pad: SoundPad;
  status?: PadPlaybackStatus;
  keyboardKey?: string;
  onTrigger: (pad: SoundPad) => void;
  onStop: (padId: string) => void;
  onOpenSettings: (pad: SoundPad) => void;
  onRename: (pad: SoundPad) => void;
  onSelectFile: (pad: SoundPad) => void;
  onContextMenuAction: (pad: SoundPad, pos: { x: number; y: number }) => void;
  isEditingLocked: boolean;
  performanceMode: boolean;
}

export const SoundPadButton: React.FC<SoundPadButtonProps> = ({
  pad,
  status,
  keyboardKey,
  onTrigger,
  onStop,
  onOpenSettings,
  onRename,
  onSelectFile,
  onContextMenuAction,
  isEditingLocked,
  performanceMode,
}) => {
  const isPlaying = status?.isPlaying ?? false;
  const progress = status?.progress ?? 0;
  const remaining = status?.remainingTime ?? (pad.duration || 0);
  const colorDef = PAD_COLORS[pad.color] || PAD_COLORS.blue;
  const hasAudio = !!pad.fileId;

  // Touch / pointer handling for HOLD mode
  const isPointerDownRef = useRef(false);
  const longPressTimerRef = useRef<number | null>(null);

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only primary button
    if (e.button !== 0) return;

    if (!hasAudio) {
      if (!isEditingLocked) {
        onSelectFile(pad);
      }
      return;
    }

    // Long press detection to open context menu on touchscreen devices
    if (!performanceMode && !isEditingLocked) {
      const clientX = e.clientX;
      const clientY = e.clientY;
      longPressTimerRef.current = window.setTimeout(() => {
        onContextMenuAction(pad, { x: clientX, y: clientY });
      }, 550);
    }

    if (pad.playbackMode === 'HOLD') {
      isPointerDownRef.current = true;
      onTrigger(pad);
    } else {
      // Toggle or One-Shot
      if (isPlaying && pad.playbackMode === 'TOGGLE') {
        onStop(pad.id);
      } else {
        onTrigger(pad);
      }
    }
  };

  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (pad.playbackMode === 'HOLD' && isPointerDownRef.current) {
      isPointerDownRef.current = false;
      onStop(pad.id);
    }
  };

  const handlePointerCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (pad.playbackMode === 'HOLD' && isPointerDownRef.current) {
      isPointerDownRef.current = false;
      onStop(pad.id);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isEditingLocked) {
      onContextMenuAction(pad, { x: e.clientX, y: e.clientY });
    }
  };

  return (
    <div
      id={`pad-container-${pad.id}`}
      onContextMenu={handleContextMenu}
      className="relative flex flex-col h-full w-full select-none"
    >
      <button
        id={`pad-${pad.id}`}
        type="button"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerCancel}
        onPointerCancel={handlePointerCancel}
        className={`group relative flex flex-col justify-between w-full h-full p-2 rounded-xl transition-all duration-75 overflow-hidden text-left border cursor-pointer ${
          !hasAudio
            ? 'bg-slate-900/40 hover:bg-slate-850/60 border-slate-800/80 hover:border-slate-600 text-slate-400'
            : isPlaying
            ? `${colorDef.activeBg} ${colorDef.activeBorder} ${colorDef.glow} text-white scale-[0.99] border-2 shadow-2xl`
            : `${colorDef.bg} ${colorDef.border} hover:border-opacity-100 text-slate-100 hover:brightness-110 shadow-md`
        }`}
      >
        {/* PROGRESS BAR FILL (WHILE PLAYING) */}
        {isPlaying && (
          <div
            className="absolute inset-0 bg-white/20 pointer-events-none transition-all duration-75 origin-left"
            style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
          />
        )}

        {/* TOP ROW: Pad number, Keyboard shortcut, and Badges */}
        <div className="relative z-10 flex items-center justify-between w-full pointer-events-none">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[10px] font-black font-mono px-1.5 py-0.5 rounded ${
                isPlaying
                  ? 'bg-black/40 text-white'
                  : 'bg-black/30 text-slate-300'
              }`}
            >
              {pad.index + 1}
            </span>

            {keyboardKey && (
              <span
                className="hidden xl:inline text-[9px] font-mono px-1 rounded bg-black/20 text-slate-400 border border-white/10"
                title={`Atajo de teclado: ${keyboardKey}`}
              >
                {keyboardKey}
              </span>
            )}
          </div>

          {/* STATUS PILLS */}
          {hasAudio && (
            <div className="flex items-center gap-1 text-[9px] font-bold">
              {pad.loop && (
                <span
                  className={`flex items-center px-1 rounded ${
                    isPlaying ? 'bg-black/40 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                  title="Bucle activado (Loop)"
                >
                  <RotateCw className="w-2.5 h-2.5 mr-0.5" />
                  LOOP
                </span>
              )}

              {pad.autoDucking && (
                <span
                  className={`flex items-center px-1 rounded ${
                    isPlaying ? 'bg-black/40 text-amber-300' : 'bg-amber-950/60 text-amber-400 border border-amber-500/30'
                  }`}
                  title="Auto Ducking: Atenúa música de fondo"
                >
                  DUCK
                </span>
              )}

              {pad.playbackMode === 'HOLD' && (
                <span
                  className={`flex items-center px-1 rounded ${
                    isPlaying ? 'bg-black/40 text-cyan-200' : 'bg-cyan-950/60 text-cyan-400 border border-cyan-500/30'
                  }`}
                  title="Modo HOLD: Suena mientras mantienes presionado"
                >
                  HOLD
                </span>
              )}

              {(pad.fadeIn > 0 || pad.fadeOut > 0) && (
                <span
                  className="hidden md:flex items-center px-1 rounded bg-black/20 text-slate-300"
                  title={`Fade In: ${pad.fadeIn}s / Fade Out: ${pad.fadeOut}s`}
                >
                  {pad.fadeIn > 0 && <ArrowUpCircle className="w-2.5 h-2.5" />}
                  {pad.fadeOut > 0 && <ArrowDownCircle className="w-2.5 h-2.5" />}
                </span>
              )}

              {pad.volume < 0.95 && (
                <span
                  className="hidden lg:flex items-center text-slate-300 font-mono"
                  title={`Volumen: ${Math.round(pad.volume * 100)}%`}
                >
                  <Volume2 className="w-2.5 h-2.5 mr-0.5" />
                  {Math.round(pad.volume * 100)}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* CENTER CONTENT: PROMINENT CUSTOM PAD NAME (REQUIREMENT 5 & 6) */}
        <div className="relative z-10 my-auto w-full text-center pointer-events-none">
          {hasAudio ? (
            <div className="flex flex-col items-center justify-center">
              <span
                className={`font-black text-sm sm:text-base leading-snug tracking-wide line-clamp-2 px-1 ${
                  isPlaying ? 'text-white drop-shadow-md' : 'text-slate-100'
                }`}
              >
                {pad.name}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-1">
              <Plus className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 transition" />
              <span className="text-[11px] font-bold text-slate-400 group-hover:text-cyan-300 tracking-wider mt-1 uppercase">
                + AGREGAR SONIDO
              </span>
            </div>
          )}
        </div>

        {/* BOTTOM ROW: TIMER READOUT */}
        <div className="relative z-10 flex items-center justify-between w-full pointer-events-none">
          {hasAudio ? (
            <div className="flex items-center justify-between w-full font-mono text-[10px] text-slate-300">
              <span className={isPlaying ? 'text-white font-bold' : 'text-slate-400'}>
                {isPlaying ? formatTime(status?.currentTime || 0) : formatTime(pad.duration)}
              </span>

              {isPlaying && (
                <span className="font-bold text-white tracking-wider animate-pulse">
                  -{formatTime(remaining)}
                </span>
              )}
            </div>
          ) : (
            <div className="w-full text-center text-[9px] text-slate-600 uppercase font-mono">
              MP3 • WAV • OGG
            </div>
          )}
        </div>
      </button>

      {/* QUICK ACTIONS (RENAME & SETTINGS) WHEN NOT LOCKED/PERFORMANCE */}
      {hasAudio && !performanceMode && !isEditingLocked && (
        <div className="absolute top-1.5 right-1.5 z-20 flex items-center gap-1 opacity-40 group-hover:opacity-100 hover:opacity-100 transition">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRename(pad);
            }}
            className="p-1 rounded-md bg-black/60 hover:bg-cyan-900 text-slate-400 hover:text-cyan-300 transition"
            title="Renombrar este pad"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenSettings(pad);
            }}
            className="p-1 rounded-md bg-black/60 hover:bg-black/90 text-slate-400 hover:text-white transition"
            title="Ajustes completos (Click derecho para menú)"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

