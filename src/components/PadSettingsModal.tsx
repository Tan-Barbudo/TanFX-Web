import React, { useState, useRef } from 'react';
import { X, Volume2, RotateCw, Trash2, Copy, FileAudio, ArrowDownCircle, ArrowUpCircle, Play, Mic } from 'lucide-react';
import { SoundPad, PAD_COLORS, PlaybackMode } from '../types';

interface PadSettingsModalProps {
  pad: SoundPad;
  allPads: SoundPad[];
  onClose: () => void;
  onUpdatePad: (updated: SoundPad) => void;
  onReplaceAudio: (pad: SoundPad, file: File) => void;
  onClearAudio: (pad: SoundPad) => void;
  onDuplicatePad: (sourcePad: SoundPad, targetPadId: string) => void;
  onTestPlay: (pad: SoundPad) => void;
  isPlaying: boolean;
}

const FADE_OPTIONS = [
  { label: 'Desactivado', value: 0 },
  { label: '0.5 seg', value: 0.5 },
  { label: '1.0 seg', value: 1.0 },
  { label: '2.0 seg', value: 2.0 },
  { label: '3.0 seg', value: 3.0 },
  { label: '5.0 seg', value: 5.0 },
];

export const PadSettingsModal: React.FC<PadSettingsModalProps> = ({
  pad,
  allPads,
  onClose,
  onUpdatePad,
  onReplaceAudio,
  onClearAudio,
  onDuplicatePad,
  onTestPlay,
  isPlaying,
}) => {
  const [name, setName] = useState(pad.name);
  const [color, setColor] = useState(pad.color);
  const [volume, setVolume] = useState(pad.volume);
  const [loop, setLoop] = useState(pad.loop);
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>(pad.playbackMode);
  const [fadeIn, setFadeIn] = useState(pad.fadeIn);
  const [fadeOut, setFadeOut] = useState(pad.fadeOut);
  const [autoDucking, setAutoDucking] = useState(pad.autoDucking);
  const [targetDuplicateId, setTargetDuplicateId] = useState(
    allPads.find((p) => p.id !== pad.id)?.id || ''
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSave = () => {
    const fallback = pad.fileName
      ? pad.fileName.replace(/\.[^/.]+$/, '')
      : `PAD ${pad.index + 1}`;
    onUpdatePad({
      ...pad,
      name: name.trim() || fallback,
      color,
      volume,
      loop,
      playbackMode,
      fadeIn,
      fadeOut,
      autoDucking,
    });
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onReplaceAudio(pad, file);
      // Auto-rename if name was default
      if (name.startsWith('PAD ') || !name) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        setName(cleanName);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div
        id="pad-settings-modal"
        className="w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#111622] border border-slate-700 shadow-2xl text-slate-100 flex flex-col"
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/aac,audio/*,.mp3,.wav,.ogg,.m4a,.aac"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 sticky top-0 bg-[#111622]/95 backdrop-blur z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <h2 className="text-lg font-bold font-['Chakra_Petch',sans-serif] tracking-wider text-white">
              AJUSTES DE PAD #{pad.index + 1}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 space-y-5 text-sm">
          {/* NAME FIELD & SOURCE FILE INFO (REQUIREMENT 8) */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-4">
            {/* NOMBRE */}
            <div className="space-y-1.5">
              <label
                htmlFor="pad-settings-name-input"
                className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between"
              >
                <span>Nombre:</span>
                <span className="text-[10px] text-slate-500 lowercase font-normal">
                  (nombre visible en el pad)
                </span>
              </label>
              <input
                id="pad-settings-name-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`PAD ${pad.index + 1}`}
                maxLength={40}
                className="w-full bg-slate-950 border-2 border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-white font-black text-lg focus:outline-none transition shadow-inner tracking-wide"
              />
            </div>

            {/* ARCHIVO */}
            <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-400 shrink-0">
                  <FileAudio className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    Archivo:
                  </span>
                  <p className="font-mono font-medium text-cyan-300 text-sm truncate max-w-[240px] sm:max-w-xs mt-0.5">
                    {pad.fileName || '(Ningún archivo cargado)'}
                  </p>
                  {pad.duration > 0 && (
                    <span className="text-[11px] text-slate-400 font-mono">
                      Duración: {Math.floor(pad.duration / 60)}:{(Math.floor(pad.duration % 60)).toString().padStart(2, '0')} min
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                {pad.fileId && (
                  <button
                    type="button"
                    onClick={() => onTestPlay(pad)}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-2 rounded-lg border text-xs font-bold transition ${
                      isPlaying
                        ? 'bg-amber-600 border-amber-400 text-white animate-pulse'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isPlaying ? 'DETENER' : 'PROBAR'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
                >
                  {pad.fileId ? 'REEMPLAZAR' : 'ELEGIR AUDIO'}
                </button>
              </div>
            </div>
          </div>

          {/* COLOR PALETTE */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Color de Iluminación
            </label>
            <div className="grid grid-cols-6 gap-2">
              {Object.values(PAD_COLORS).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  style={{ backgroundColor: c.accent }}
                  className={`h-9 rounded-lg transition-transform flex items-center justify-center relative ${
                    color === c.id
                      ? 'ring-4 ring-white scale-105 shadow-lg'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.name}
                >
                  {color === c.id && <span className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />}
                </button>
              ))}
            </div>
          </div>

          {/* VOLUME SLIDER */}
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                Volumen Individual
              </span>
              <span className="font-mono font-bold text-cyan-400 text-sm">
                {Math.round(volume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-2 accent-cyan-400 bg-slate-700 rounded cursor-pointer"
            />
          </div>

          {/* PLAYBACK MODE */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Modo de Disparo (Playback Mode)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPlaybackMode('TOGGLE')}
                className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                  playbackMode === 'TOGGLE'
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div>TOGGLE</div>
                <div className="text-[10px] font-normal text-slate-400 mt-0.5">Click inicia / Click detiene</div>
              </button>

              <button
                type="button"
                onClick={() => setPlaybackMode('ONE_SHOT')}
                className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                  playbackMode === 'ONE_SHOT'
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div>ONE SHOT</div>
                <div className="text-[10px] font-normal text-slate-400 mt-0.5">Dispara hasta el final</div>
              </button>

              <button
                type="button"
                onClick={() => setPlaybackMode('HOLD')}
                className={`p-2.5 rounded-xl border text-center font-bold text-xs transition ${
                  playbackMode === 'HOLD'
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div>HOLD</div>
                <div className="text-[10px] font-normal text-slate-400 mt-0.5">Suena al mantener presionado</div>
              </button>
            </div>
          </div>

          {/* LOOP & AUTO-DUCKING ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* LOOP TOGGLE */}
            <button
              type="button"
              onClick={() => setLoop(!loop)}
              className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${
                loop
                  ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <RotateCw className={`w-4 h-4 ${loop ? 'text-emerald-400' : ''}`} />
                <div>
                  <div className="font-bold text-xs text-white">REPETICIÓN CONTINUA (LOOP)</div>
                  <div className="text-[11px] text-slate-400">Bucle infinito sin pausas</div>
                </div>
              </div>
              <span className={`text-xs font-bold ${loop ? 'text-emerald-400' : 'text-slate-500'}`}>
                {loop ? 'ON' : 'OFF'}
              </span>
            </button>

            {/* AUTO DUCKING TOGGLE */}
            <button
              type="button"
              onClick={() => setAutoDucking(!autoDucking)}
              className={`flex items-center justify-between p-3 rounded-xl border text-left transition ${
                autoDucking
                  ? 'bg-amber-950/60 border-amber-500 text-amber-300'
                  : 'bg-slate-900 border-slate-700 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <Mic className={`w-4 h-4 ${autoDucking ? 'text-amber-400' : ''}`} />
                <div>
                  <div className="font-bold text-xs text-white">AUTO DUCKING</div>
                  <div className="text-[11px] text-slate-400">Atenúa música de fondo al sonar</div>
                </div>
              </div>
              <span className={`text-xs font-bold ${autoDucking ? 'text-amber-400' : 'text-slate-500'}`}>
                {autoDucking ? 'ON' : 'OFF'}
              </span>
            </button>
          </div>

          {/* FADE IN & FADE OUT CONTROLS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Fade In */}
            <div className="space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ArrowUpCircle className="w-4 h-4 text-emerald-400" />
                Fade In (Aparición)
              </label>
              <select
                value={fadeIn}
                onChange={(e) => setFadeIn(parseFloat(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none"
              >
                {FADE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Fade Out */}
            <div className="space-y-1 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <ArrowDownCircle className="w-4 h-4 text-rose-400" />
                Fade Out (Desvanecimiento)
              </label>
              <select
                value={fadeOut}
                onChange={(e) => setFadeOut(parseFloat(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none"
              >
                {FADE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* DUPLICATE PAD OPTION */}
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Copy className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold uppercase text-slate-300">Duplicar este pad a:</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={targetDuplicateId}
                onChange={(e) => setTargetDuplicateId(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none flex-1 sm:flex-none"
              >
                {allPads
                  .filter((p) => p.id !== pad.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      Pad #{p.index + 1}: {p.name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={() => {
                  if (targetDuplicateId) {
                    onDuplicatePad(pad, targetDuplicateId);
                    alert(`Pad duplicado con éxito.`);
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-bold text-white transition"
              >
                Duplicar
              </button>
            </div>
          </div>

          {/* DELETE / CLEAR AUDIO */}
          {pad.fileId && (
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`¿Quitar el audio asignado a ${pad.name}?`)) {
                    onClearAudio(pad);
                    onClose();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/50 text-xs font-bold transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Eliminar Audio del Pad</span>
              </button>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-slate-800 bg-[#111622] sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg transition"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};
