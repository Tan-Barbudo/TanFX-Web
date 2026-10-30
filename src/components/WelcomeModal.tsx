import React from 'react';
import { ArrowUpRight, Music2, X } from 'lucide-react';

const SOCIAL_LINKS = [
  { label: 'TikTok', href: 'https://www.tiktok.com/@payasotanbarbudo', color: 'hover:border-white/50' },
  { label: 'YouTube', href: 'https://youtube.com/@payasotanbarbudo', color: 'hover:border-red-400/70' },
  { label: 'Instagram', href: 'https://www.instagram.com/payasotanbarbudo', color: 'hover:border-pink-400/70' },
  { label: 'Facebook', href: 'https://www.facebook.com/share/1CyiA78nQJ/', color: 'hover:border-blue-400/70' },
];

interface WelcomeModalProps {
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 select-none">
    <section
      id="welcome-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      className="relative w-full max-w-md overflow-hidden rounded-3xl border border-cyan-500/40 bg-[#101725] text-center text-slate-100 shadow-[0_0_50px_rgba(6,182,212,0.16)]"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500" />
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar bienvenida"
        className="absolute right-3 top-3 rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="px-6 pb-6 pt-8 sm:px-8">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-cyan-400/50 bg-slate-900 shadow-[0_0_28px_rgba(6,182,212,0.2)]">
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" className="h-16 w-16" />
        </div>
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300">Bienvenido a</p>
        <h2 id="welcome-title" className="font-['Chakra_Petch',sans-serif] text-3xl font-black tracking-wider text-white">
          TAN FX
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          Consola de sonidos para presentaciones en vivo, diseñada por
        </p>
        <p className="mt-1 text-lg font-extrabold text-amber-300">Payaso Tan Barbudo</p>

        <div className="mt-6">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-slate-400">Sígueme en mis redes</p>
          <div className="grid grid-cols-2 gap-2">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-3 text-sm font-bold text-slate-100 transition hover:bg-slate-800 ${social.color}`}
              >
                {social.label}
                <ArrowUpRight className="h-3.5 w-3.5 text-slate-400" />
              </a>
            ))}
          </div>
        </div>

        <a
          href="https://whatsapp.com/channel/0029VadZPwbC6ZveKodyvh41"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-emerald-400/60 bg-emerald-500/15 px-4 py-3 text-sm font-extrabold text-emerald-200 transition hover:bg-emerald-500/25"
        >
          <span aria-hidden="true">●</span>
          Únete a mi canal de WhatsApp
          <ArrowUpRight className="h-4 w-4" />
        </a>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-sm font-black tracking-wide text-slate-950 transition hover:bg-cyan-300 active:scale-[0.99]"
        >
          <Music2 className="h-4 w-4" />
          ENTRAR A TAN FX
        </button>
      </div>
    </section>
  </div>
);
