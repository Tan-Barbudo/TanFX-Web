import React, { useState, useEffect, useRef } from 'react';
import { Tag, FileAudio, Check, X } from 'lucide-react';

interface NameAudioModalProps {
  initialName: string;
  fileName?: string | null;
  title?: string;
  padNumber?: number;
  onSave: (customName: string) => void;
  onCancel: () => void;
}

export const NameAudioModal: React.FC<NameAudioModalProps> = ({
  initialName,
  fileName,
  title = 'NOMBRE DEL AUDIO',
  padNumber,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState(initialName);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-focus and auto-select text so typing immediately replaces it
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const handleSave = () => {
    const trimmed = name.trim();
    // If user left it blank, fallback to the initial filename without extension
    const finalName = trimmed || initialName.trim() || 'AUDIO';
    onSave(finalName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  return (
    <div
      id="name-audio-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-in fade-in duration-100"
      onKeyDown={handleKeyDown}
    >
      <div
        id="name-audio-dialog"
        className="w-full max-w-md rounded-2xl bg-[#111622] border border-cyan-500/40 p-5 shadow-[0_0_30px_rgba(6,182,212,0.2)] text-slate-100 space-y-4"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white tracking-wider font-['Chakra_Petch',sans-serif] uppercase">
                {title}
              </h3>
              {padNumber !== undefined && (
                <span className="text-[11px] font-mono text-cyan-400">
                  PAD #{padNumber}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Cancelar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="space-y-3">
          {/* SOURCE FILE INFO */}
          {fileName && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-400">
              <FileAudio className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="overflow-hidden">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Archivo origen:
                </span>
                <span className="font-mono text-slate-300 truncate block">
                  {fileName}
                </span>
              </div>
            </div>
          )}

          {/* INPUT FIELD */}
          <div className="space-y-1">
            <label
              htmlFor="custom-pad-name-input"
              className="text-xs font-bold uppercase tracking-wider text-slate-300 block"
            >
              Nombre para el Pad:
            </label>
            <input
              id="custom-pad-name-input"
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. APLAUSOS, EFECTO MAGIA..."
              maxLength={40}
              className="w-full bg-slate-950 border-2 border-cyan-500/60 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white font-black text-lg focus:outline-none shadow-inner tracking-wide"
            />
            <p className="text-[11px] text-slate-400 pt-0.5">
              Este nombre se mostrará en grande en el botón del pad durante el show.
            </p>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            id="btn-cancel-name-audio"
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition active:scale-95"
          >
            CANCELAR
          </button>

          <button
            id="btn-save-name-audio"
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-black font-black text-xs transition shadow-[0_0_15px_rgba(6,182,212,0.4)] active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>GUARDAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
