import React, { useEffect, useRef } from 'react';
import { Edit3, Settings, Upload, Trash2, X } from 'lucide-react';
import { SoundPad } from '../types';

interface PadContextMenuProps {
  pad: SoundPad;
  position: { x: number; y: number };
  onClose: () => void;
  onRename: (pad: SoundPad) => void;
  onOpenSettings: (pad: SoundPad) => void;
  onChangeAudio: (pad: SoundPad) => void;
  onClearAudio: (pad: SoundPad) => void;
}

export const PadContextMenu: React.FC<PadContextMenuProps> = ({
  pad,
  position,
  onClose,
  onRename,
  onOpenSettings,
  onChangeAudio,
  onClearAudio,
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const handlePointerDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // Adjust menu coordinates so it doesn't overflow viewport
  const menuWidth = 200;
  const menuHeight = 180;
  const left = Math.min(position.x, window.innerWidth - menuWidth - 10);
  const top = Math.min(position.y, window.innerHeight - menuHeight - 10);

  return (
    <div
      ref={menuRef}
      id="pad-context-menu"
      style={{ left: `${Math.max(10, left)}px`, top: `${Math.max(10, top)}px` }}
      className="fixed z-50 w-52 rounded-xl bg-[#111622] border border-slate-700 shadow-2xl p-1.5 text-slate-200 select-none animate-in fade-in zoom-in-95 duration-100"
    >
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
        <span className="truncate max-w-[140px]">PAD #{pad.index + 1}: {pad.name}</span>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-white"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="py-1 space-y-0.5 text-xs font-semibold">
        {/* RENOMBRAR - Requirement 10 */}
        <button
          id="context-menu-rename"
          type="button"
          onClick={() => {
            onClose();
            onRename(pad);
          }}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-cyan-950 hover:text-cyan-300 transition text-left text-white"
        >
          <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
          <span>RENOMBRAR</span>
        </button>

        {/* AJUSTES DEL PAD */}
        <button
          id="context-menu-settings"
          type="button"
          onClick={() => {
            onClose();
            onOpenSettings(pad);
          }}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-800 hover:text-slate-100 transition text-left"
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <span>Ajustes del Pad</span>
        </button>

        {/* CAMBIAR AUDIO */}
        <button
          id="context-menu-change-audio"
          type="button"
          onClick={() => {
            onClose();
            onChangeAudio(pad);
          }}
          className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-slate-800 hover:text-slate-100 transition text-left"
        >
          <Upload className="w-3.5 h-3.5 text-slate-400" />
          <span>{pad.fileId ? 'Cambiar Audio' : 'Cargar Audio'}</span>
        </button>

        {/* ELIMINAR AUDIO (IF PRESENT) */}
        {pad.fileId && (
          <button
            id="context-menu-clear-audio"
            type="button"
            onClick={() => {
              onClose();
              if (window.confirm(`¿Quitar el audio asignado a "${pad.name}"?`)) {
                onClearAudio(pad);
              }
            }}
            className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 transition text-left pt-1.5 border-t border-slate-800/80"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Eliminar Audio</span>
          </button>
        )}
      </div>
    </div>
  );
};
