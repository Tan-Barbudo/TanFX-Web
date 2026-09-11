/**
 * TAN FX - Performance Soundboard
 * Designed by Payaso Tan Barbudo
 * Shared TypeScript Definitions
 */

export type PlaybackMode = 'TOGGLE' | 'ONE_SHOT' | 'HOLD';

export interface PadColor {
  id: string;
  name: string;
  bg: string;
  border: string;
  activeBg: string;
  activeBorder: string;
  glow: string;
  text: string;
  accent: string;
}

export interface SoundPad {
  id: string;
  index: number; // 0 to 23
  name: string;
  color: string; // key in PAD_COLORS
  fileId: string | null;
  fileName: string | null;
  fileSize?: number;
  duration: number; // in seconds
  volume: number; // 0 to 1
  loop: boolean;
  fadeIn: number; // in seconds (0, 0.5, 1, 2, 3, 5)
  fadeOut: number; // in seconds (0, 0.5, 1, 2, 3, 5)
  playbackMode: PlaybackMode;
  autoDucking: boolean;
}

export interface Bank {
  id: string;
  name: string;
  pads: SoundPad[];
}

export interface BgmConfig {
  fileId: string | null;
  fileName: string | null;
  volume: number; // 0 to 1
  loop: boolean;
  duckLevel: number; // 0.1 to 0.5, default 0.25
  fadeOut: number;
}

export interface Show {
  id: string;
  name: string;
  banks: Bank[];
  activeBankId: string;
  bgm: BgmConfig;
  masterVolume: number;
  createdAt: number;
  updatedAt: number;
}

export interface PadPlaybackStatus {
  padId: string;
  bankId: string;
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  progress: number; // 0 to 1
  remainingTime: number; // in seconds
}

export interface BgmPlaybackStatus {
  isPlaying: boolean;
  isPaused: boolean;
  currentTime: number;
  duration: number;
  progress: number;
  isDucked: boolean;
}

export const PAD_COLORS: Record<string, PadColor> = {
  blue: {
    id: 'blue',
    name: 'Azul Eléctrico',
    bg: 'bg-blue-950/40',
    border: 'border-blue-500/40',
    activeBg: 'bg-blue-600',
    activeBorder: 'border-blue-300',
    glow: 'shadow-[0_0_24px_rgba(59,130,246,0.6)]',
    text: 'text-blue-400',
    accent: '#3b82f6',
  },
  cyan: {
    id: 'cyan',
    name: 'Cian Neón',
    bg: 'bg-cyan-950/40',
    border: 'border-cyan-500/40',
    activeBg: 'bg-cyan-500',
    activeBorder: 'border-cyan-200',
    glow: 'shadow-[0_0_24px_rgba(6,182,212,0.6)]',
    text: 'text-cyan-400',
    accent: '#06b6d4',
  },
  emerald: {
    id: 'emerald',
    name: 'Verde Esmeralda',
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-500/40',
    activeBg: 'bg-emerald-600',
    activeBorder: 'border-emerald-300',
    glow: 'shadow-[0_0_24px_rgba(16,185,129,0.6)]',
    text: 'text-emerald-400',
    accent: '#10b981',
  },
  lime: {
    id: 'lime',
    name: 'Verde Lima',
    bg: 'bg-lime-950/40',
    border: 'border-lime-500/40',
    activeBg: 'bg-lime-600',
    activeBorder: 'border-lime-300',
    glow: 'shadow-[0_0_24px_rgba(132,204,22,0.6)]',
    text: 'text-lime-400',
    accent: '#84cc16',
  },
  amber: {
    id: 'amber',
    name: 'Ámbar Cálido',
    bg: 'bg-amber-950/40',
    border: 'border-amber-500/40',
    activeBg: 'bg-amber-600',
    activeBorder: 'border-amber-300',
    glow: 'shadow-[0_0_24px_rgba(245,158,11,0.6)]',
    text: 'text-amber-400',
    accent: '#f59e0b',
  },
  orange: {
    id: 'orange',
    name: 'Naranja Vivo',
    bg: 'bg-orange-950/40',
    border: 'border-orange-500/40',
    activeBg: 'bg-orange-600',
    activeBorder: 'border-orange-300',
    glow: 'shadow-[0_0_24px_rgba(249,115,22,0.6)]',
    text: 'text-orange-400',
    accent: '#f97316',
  },
  red: {
    id: 'red',
    name: 'Rojo Alerta',
    bg: 'bg-red-950/40',
    border: 'border-red-500/40',
    activeBg: 'bg-red-600',
    activeBorder: 'border-red-300',
    glow: 'shadow-[0_0_24px_rgba(239,68,68,0.7)]',
    text: 'text-red-400',
    accent: '#ef4444',
  },
  rose: {
    id: 'rose',
    name: 'Rosa Brillante',
    bg: 'bg-rose-950/40',
    border: 'border-rose-500/40',
    activeBg: 'bg-rose-600',
    activeBorder: 'border-rose-300',
    glow: 'shadow-[0_0_24px_rgba(244,63,94,0.6)]',
    text: 'text-rose-400',
    accent: '#f43f5e',
  },
  purple: {
    id: 'purple',
    name: 'Púrpura Escénico',
    bg: 'bg-purple-950/40',
    border: 'border-purple-500/40',
    activeBg: 'bg-purple-600',
    activeBorder: 'border-purple-300',
    glow: 'shadow-[0_0_24px_rgba(168,85,247,0.6)]',
    text: 'text-purple-400',
    accent: '#a855f7',
  },
  yellow: {
    id: 'yellow',
    name: 'Amarillo Show',
    bg: 'bg-yellow-950/40',
    border: 'border-yellow-500/40',
    activeBg: 'bg-yellow-500 text-black',
    activeBorder: 'border-yellow-200',
    glow: 'shadow-[0_0_24px_rgba(234,179,8,0.7)]',
    text: 'text-yellow-400',
    accent: '#eab308',
  },
  indigo: {
    id: 'indigo',
    name: 'Índigo Profundo',
    bg: 'bg-indigo-950/40',
    border: 'border-indigo-500/40',
    activeBg: 'bg-indigo-600',
    activeBorder: 'border-indigo-300',
    glow: 'shadow-[0_0_24px_rgba(99,102,241,0.6)]',
    text: 'text-indigo-400',
    accent: '#6366f1',
  },
  steel: {
    id: 'steel',
    name: 'Acero Neutro',
    bg: 'bg-slate-900/60',
    border: 'border-slate-600/40',
    activeBg: 'bg-slate-600',
    activeBorder: 'border-slate-300',
    glow: 'shadow-[0_0_20px_rgba(148,163,184,0.4)]',
    text: 'text-slate-300',
    accent: '#94a3b8',
  },
};
