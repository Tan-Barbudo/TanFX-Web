import React, { useState, useRef } from 'react';
import { X, Plus, FolderOpen, Edit2, Copy, Trash2, Download, Upload, Check, Sparkles } from 'lucide-react';
import { Show } from '../types';
import { SHOW_PRESETS } from '../services/storage';

interface ShowsModalProps {
  shows: Show[];
  activeShowId: string;
  onClose: () => void;
  onSelectShow: (showId: string) => void;
  onCreateShow: (name: string) => void;
  onRenameShow: (showId: string, newName: string) => void;
  onDuplicateShow: (showId: string) => void;
  onDeleteShow: (showId: string) => void;
  onExportShow: (show: Show) => void;
  onImportShow: (file: File) => void;
}

export const ShowsModal: React.FC<ShowsModalProps> = ({
  shows,
  activeShowId,
  onClose,
  onSelectShow,
  onCreateShow,
  onRenameShow,
  onDuplicateShow,
  onDeleteShow,
  onExportShow,
  onImportShow,
}) => {
  const [newShowName, setNewShowName] = useState('');
  const [editingShowId, setEditingShowId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCreate = (nameToUse?: string) => {
    const finalName = (nameToUse || newShowName).trim();
    if (finalName) {
      onCreateShow(finalName);
      setNewShowName('');
    }
  };

  const handleSaveRename = (showId: string) => {
    if (editName.trim()) {
      onRenameShow(showId, editName.trim());
    }
    setEditingShowId(null);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportShow(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div
        id="shows-modal"
        className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-[#111622] border border-slate-700 shadow-2xl text-slate-100 flex flex-col"
      >
        {/* Hidden file input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImportFile}
          className="hidden"
        />

        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#111622]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
            <div>
              <h2 className="text-lg font-bold font-['Chakra_Petch',sans-serif] tracking-wider text-white">
                MIS SHOWS (CONFIGURACIONES)
              </h2>
              <p className="text-xs text-slate-400">
                Organiza bancos, pads, audios y volumen para cada tipo de presentación.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* BODY */}
        <div className="p-5 overflow-y-auto space-y-5 text-sm">
          {/* CREATE NEW SHOW ROW */}
          <div className="bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Crear Nuevo Show
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newShowName}
                onChange={(e) => setNewShowName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Ej. CUMPLEAÑOS, SHOW INFANTIL, MAGIA..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold text-sm focus:border-amber-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleCreate()}
                className="flex items-center gap-1 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>NUEVO SHOW</span>
              </button>
            </div>

            {/* PRESETS QUICK CHIPS */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1 mr-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Plantillas:
              </span>
              {SHOW_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleCreate(preset.name)}
                  className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-amber-300 font-semibold transition"
                >
                  +{preset.name}
                </button>
              ))}
            </div>
          </div>

          {/* SHOWS LIST */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider px-1">
              <span>Shows Guardados ({shows.length})</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition"
                  title="Importar show desde archivo JSON"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Importar Show</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {shows.map((show) => {
                const isActive = show.id === activeShowId;
                const isEditing = editingShowId === show.id;

                return (
                  <div
                    key={show.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition ${
                      isActive
                        ? 'bg-slate-800/90 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2 flex-1 mr-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename(show.id);
                            if (e.key === 'Escape') setEditingShowId(null);
                          }}
                          autoFocus
                          className="flex-1 bg-slate-800 border border-amber-400 rounded-lg px-2.5 py-1 text-sm font-bold text-white outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveRename(show.id)}
                          className="p-1 rounded bg-emerald-600 text-white"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingShowId(null)}
                          className="p-1 rounded bg-slate-700 text-slate-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div
                          className={`p-2 rounded-lg ${
                            isActive
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          <FolderOpen className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-white truncate">
                              {show.name}
                            </span>
                            {isActive && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-black font-mono">
                                ACTIVO
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-mono">
                            {show.banks.length} bancos • {show.banks.reduce((acc, b) => acc + b.pads.filter(p => !!p.fileId).length, 0)} sonidos cargados
                          </span>
                        </div>
                      </div>
                    )}

                    {/* SHOW ACTIONS */}
                    {!isEditing && (
                      <div className="flex items-center gap-1.5">
                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectShow(show.id);
                              onClose();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
                          >
                            ABRIR
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setEditingShowId(show.id);
                            setEditName(show.name);
                          }}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                          title="Renombrar Show"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDuplicateShow(show.id)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                          title="Duplicar Show"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onExportShow(show)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-cyan-400 transition"
                          title="Exportar configuración (.json)"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        {shows.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`¿Estás seguro de eliminar el show "${show.name}"?`)) {
                                onDeleteShow(show.id);
                              }
                            }}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition"
                            title="Eliminar Show"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-slate-800 bg-[#111622]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
