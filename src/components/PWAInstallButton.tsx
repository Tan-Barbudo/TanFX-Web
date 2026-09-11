import React, { useState } from 'react';
import { Download, Smartphone, Monitor, X, CheckCircle } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showWindowsGuide, setShowWindowsGuide] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, display confirmed badge
  if (isInstalled) {
    return (
      <div
        id="pwa-installed-badge"
        className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-[11px] font-semibold text-emerald-400 tracking-wider uppercase"
        title="TAN FX está ejecutándose como aplicación instalada en Windows"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <CheckCircle className="w-3 h-3 text-emerald-400" />
        <span>APP INSTALADA</span>
      </div>
    );
  }

  const handleButtonClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowWindowsGuide(true);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      setShowWindowsGuide(true);
    }
  };

  return (
    <>
      <button
        id="btn-install-pwa"
        onClick={handleButtonClick}
        className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-cyan-900/70 hover:bg-cyan-800 border border-cyan-500/60 text-xs font-bold text-cyan-200 shadow-sm transition active:scale-95"
        title="Instalar TAN FX como aplicación de escritorio en Windows (Edge / Chrome)"
      >
        <Download className="w-3.5 h-3.5 text-cyan-300" />
        <span className="font-['Chakra_Petch',sans-serif] tracking-wider">INSTALAR APP</span>
      </button>

      {/* WINDOWS / CHROME / EDGE INSTALLATION GUIDE MODAL */}
      {showWindowsGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
          <div
            id="pwa-windows-guide-modal"
            className="w-full max-w-md rounded-2xl bg-[#111622] border border-slate-700 p-5 shadow-2xl text-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white font-['Chakra_Petch',sans-serif]">
                  Instalar TAN FX en Windows
                </h3>
              </div>
              <button
                onClick={() => setShowWindowsGuide(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 space-y-3 leading-relaxed">
              <p className="text-slate-200">
                TAN FX está optimizada para funcionar como una aplicación de escritorio nativa e independiente en Windows a través de <strong>Microsoft Edge</strong> o <strong>Google Chrome</strong>:
              </p>

              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-mono font-bold text-cyan-400 bg-black/50 px-1.5 py-0.5 rounded text-[11px]">1</span>
                  <span>En la barra de direcciones de Edge o Chrome, busca el ícono de instalación <strong className="text-white">(computadora con flecha 📥 o signo +)</strong> en la esquina derecha.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono font-bold text-cyan-400 bg-black/50 px-1.5 py-0.5 rounded text-[11px]">2</span>
                  <span>O haz clic en el menú del navegador <strong>(••• o ⋮)</strong> &gt; <strong>«Aplicaciones»</strong> &gt; <strong>«Instalar TAN FX»</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-mono font-bold text-cyan-400 bg-black/50 px-1.5 py-0.5 rounded text-[11px]">3</span>
                  <span>Selecciona anclar a la <strong>Barra de Tareas</strong> y al <strong>Menú Inicio</strong> para iniciarla en cualquier show sin abrir el navegador.</span>
                </div>
              </div>

              <div className="p-2.5 bg-emerald-950/40 rounded-lg border border-emerald-500/30 text-emerald-300 text-[11px]">
                ✓ Totalmente funcional sin conexión a Internet (Offline Ready).
              </div>
            </div>

            <button
              onClick={() => setShowWindowsGuide(false)}
              className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
            >
              Cerrar y Continuar
            </button>
          </div>
        </div>
      )}

      {/* IOS SAFARI MODAL */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none">
          <div className="w-full max-w-sm rounded-2xl bg-[#111622] border border-slate-700 p-5 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Instalar en iPad / iPhone</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="text-xs text-slate-300 space-y-2">
              <p>1. Pulsa el botón <strong>Compartir</strong> (ícono de caja con flecha arriba) en Safari.</p>
              <p>2. Selecciona <strong>«Agregar a pantalla de inicio»</strong>.</p>
              <p>3. Abre TAN FX a pantalla completa.</p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};

