import React from 'react';
import { X, Sparkles, Keyboard, ShieldCheck, Heart, Radio } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
      <div
        id="about-modal"
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#111622] border border-slate-700 shadow-2xl text-slate-100 flex flex-col"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 sticky top-0 bg-[#111622]/95 backdrop-blur z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <h2 className="text-lg font-bold font-['Chakra_Petch',sans-serif] tracking-wider text-white">
              ACERCA DE TAN FX
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6 text-sm">
          {/* BRAND HERO */}
          <div className="text-center p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/40 text-red-400 text-xs font-mono uppercase tracking-widest font-bold">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              CONSOLA PROFESIONAL EN VIVO
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-white font-['Chakra_Petch',sans-serif]">
              TAN FX
            </h1>
            <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400 font-mono">
              Performance Soundboard
            </p>
            <div className="pt-2 border-t border-slate-800/80">
              <p className="text-sm font-bold text-amber-300">
                Diseñada por Payaso Tan Barbudo
              </p>
              <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto leading-relaxed">
                Una herramienta creada para facilitar el control de música, efectos y sonidos durante presentaciones en vivo.
              </p>
            </div>
          </div>

          {/* AUDIENCE */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Diseñado Especialmente Para
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold text-slate-200">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">🤡 Payasos</div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">🎈 Animadores Infantiles</div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">🎧 DJs</div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">🎩 Magos</div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">⛪ Iglesias</div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">📖 Evangelismo</div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">🎓 Profesores</div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-center">🎪 Artistas en Vivo</div>
            </div>
          </div>

          {/* KEYBOARD SHORTCUTS */}
          <div className="space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-amber-400" />
              Atajos de Teclado para Portátiles (Laptop Live Control)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
              <div className="flex items-center justify-between p-1.5 bg-slate-800/60 rounded border border-slate-750">
                <span>Pads 1 al 6</span>
                <span className="font-mono font-bold text-cyan-300 px-1.5 py-0.5 bg-black/40 rounded">1 - 6</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-slate-800/60 rounded border border-slate-750">
                <span>Pads 7 al 12</span>
                <span className="font-mono font-bold text-cyan-300 px-1.5 py-0.5 bg-black/40 rounded">Q, W, E, R, T, Y</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-slate-800/60 rounded border border-slate-750">
                <span>Pads 13 al 18</span>
                <span className="font-mono font-bold text-cyan-300 px-1.5 py-0.5 bg-black/40 rounded">A, S, D, F, G, H</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-slate-800/60 rounded border border-slate-750">
                <span>Pads 19 al 24</span>
                <span className="font-mono font-bold text-cyan-300 px-1.5 py-0.5 bg-black/40 rounded">Z, X, C, V, B, N</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-red-950/40 rounded border border-red-600/40">
                <span className="text-red-300 font-bold">DETENER TODO (STOP ALL)</span>
                <span className="font-mono font-bold text-white px-2 py-0.5 bg-red-600 rounded">ESPACIO</span>
              </div>
              <div className="flex items-center justify-between p-1.5 bg-slate-800/60 rounded border border-slate-750">
                <span>Pausar / Reanudar Todo</span>
                <span className="font-mono font-bold text-amber-300 px-1.5 py-0.5 bg-black/40 rounded">M</span>
              </div>
            </div>
          </div>

          {/* PRIVACY & OFFLINE NOTE */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <p className="font-bold text-white uppercase tracking-wider">
                100% Local y Seguro (Sin Servidores Ni Nube)
              </p>
              <p className="text-slate-400 leading-relaxed">
                Tus archivos de audio se procesan y almacenan localmente en la base de datos de tu propio navegador (IndexedDB) y mediante el API de archivos. Nada se sube a internet. Funciona totalmente fuera de línea (offline).
              </p>
            </div>
          </div>

          {/* CREDITS FOOTER */}
          <div className="text-center pt-2 text-xs text-slate-500 flex items-center justify-center gap-1 font-mono">
            <span>Creado con</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" />
            <span>para artistas y animadores por Payaso Tan Barbudo</span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-slate-800 bg-[#111622] sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
