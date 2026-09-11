import React, { useState } from 'react';
import { Plus, Edit2, Copy, Trash2, ChevronLeft, ChevronRight, Check, X, Volume2 } from 'lucide-react';
import { Bank } from '../types';

interface BankBarProps {
  banks: Bank[];
  activeBankId: string;
  onSelectBank: (bankId: string) => void;
  onRenameBank: (bankId: string, newName: string) => void;
  onDuplicateBank: (bankId: string) => void;
  onCreateBank: () => void;
  onDeleteBank: (bankId: string) => void;
  onMoveBank: (bankId: string, direction: 'left' | 'right') => void;
  getActivePadsCount: (bankId: string) => number;
  isEditingLocked: boolean;
}

export const BankBar: React.FC<BankBarProps> = ({
  banks,
  activeBankId,
  onSelectBank,
  onRenameBank,
  onDuplicateBank,
  onCreateBank,
  onDeleteBank,
  onMoveBank,
  getActivePadsCount,
  isEditingLocked,
}) => {
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [menuBankId, setMenuBankId] = useState<string | null>(null);

  const startRename = (bank: Bank) => {
    if (isEditingLocked) return;
    setEditingBankId(bank.id);
    setEditName(bank.name);
    setMenuBankId(null);
  };

  const saveRename = (bankId: string) => {
    if (editName.trim()) {
      onRenameBank(bankId, editName.trim());
    }
    setEditingBankId(null);
  };

  return (
    <div
      id="bank-bar"
      className="bg-[#0b0f17] border-b border-slate-800/80 px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto select-none"
    >
      {/* BANK BUTTONS ROW */}
      <div className="flex items-center gap-1.5 flex-nowrap min-w-max">
        {banks.map((bank, index) => {
          const isActive = bank.id === activeBankId;
          const activeSounds = getActivePadsCount(bank.id);
          const isEditing = editingBankId === bank.id;

          return (
            <div key={bank.id} className="relative flex items-center">
              {isEditing ? (
                <div className="flex items-center gap-1 bg-slate-800 px-2 py-1 rounded-lg border border-cyan-500 shadow-md">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveRename(bank.id);
                      if (e.key === 'Escape') setEditingBankId(null);
                    }}
                    autoFocus
                    className="bg-transparent text-xs font-bold text-white outline-none w-24 uppercase"
                  />
                  <button
                    onClick={() => saveRename(bank.id)}
                    className="p-1 text-emerald-400 hover:text-emerald-300"
                    title="Guardar nombre"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEditingBankId(null)}
                    className="p-1 text-slate-400 hover:text-slate-200"
                    title="Cancelar"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center group">
                  <button
                    id={`btn-bank-${bank.id}`}
                    onClick={() => onSelectBank(bank.id)}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (!isEditingLocked) {
                        setMenuBankId(menuBankId === bank.id ? null : bank.id);
                      }
                    }}
                    className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-t-lg font-bold text-xs tracking-wider transition uppercase ${
                      isActive
                        ? 'bg-slate-800 text-cyan-300 border-t-2 border-x border-cyan-400 shadow-[0_-2px_10px_rgba(6,182,212,0.2)]'
                        : 'bg-slate-900/60 hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                  >
                    <span>{bank.name}</span>

                    {/* Active sound playing in this bank indicator */}
                    {activeSounds > 0 && (
                      <span
                        className="flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-emerald-950 border border-emerald-500 text-[10px] text-emerald-400 animate-pulse font-mono"
                        title={`${activeSounds} sonido(s) sonando en este banco`}
                      >
                        <Volume2 className="w-2.5 h-2.5" />
                        <span>{activeSounds}</span>
                      </span>
                    )}
                  </button>

                  {/* Bank options trigger when active and not locked */}
                  {isActive && !isEditingLocked && (
                    <div className="flex items-center bg-slate-800/90 rounded-r-lg border-y border-r border-cyan-400/40 px-1 py-1 gap-0.5 text-slate-400">
                      <button
                        onClick={() => startRename(bank)}
                        className="p-0.5 hover:text-cyan-300 transition"
                        title="Renombrar Banco"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => onDuplicateBank(bank.id)}
                        className="p-0.5 hover:text-cyan-300 transition"
                        title="Duplicar Banco"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                      {index > 0 && (
                        <button
                          onClick={() => onMoveBank(bank.id, 'left')}
                          className="p-0.5 hover:text-white transition"
                          title="Mover a la izquierda"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                      )}
                      {index < banks.length - 1 && (
                        <button
                          onClick={() => onMoveBank(bank.id, 'right')}
                          className="p-0.5 hover:text-white transition"
                          title="Mover a la derecha"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                      {banks.length > 1 && (
                        <button
                          onClick={() => {
                            if (window.confirm(`¿Eliminar ${bank.name}?`)) {
                              onDeleteBank(bank.id);
                            }
                          }}
                          className="p-0.5 hover:text-red-400 transition"
                          title="Eliminar Banco"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Bank Button */}
        {!isEditingLocked && (
          <button
            id="btn-create-bank"
            onClick={onCreateBank}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-dashed border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition"
            title="Crear nuevo banco"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">NUEVO BANCO</span>
          </button>
        )}
      </div>

      <div className="text-[11px] font-mono text-slate-500 hidden md:block">
        24 PADS POR BANCO • 6 COLUMNAS × 4 FILAS
      </div>
    </div>
  );
};
