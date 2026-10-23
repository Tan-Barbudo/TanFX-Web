import { Show } from '../types';

export function resolveInitialShow(shows: Show[], storedActiveId: string | null): Show | undefined {
  return shows.find((show) => show.id === storedActiveId) || shows[0];
}

export function duplicateShow(source: Show, id: string, now = Date.now()): Show {
  return {
    ...source,
    id,
    name: `${source.name} (COPIA)`,
    createdAt: now,
    updatedAt: now,
  };
}

export async function persistAndActivateShow(
  show: Show,
  deps: { saveShow: (show: Show) => Promise<void>; addShow: (show: Show) => void; activate: (show: Show) => Promise<void> },
): Promise<void> {
  await deps.saveShow(show);
  deps.addShow(show);
  await deps.activate(show);
}

interface ShowActivationDependencies {
  storage: { setActiveShowId: (id: string) => Promise<void> };
  audioEngine: {
    stopAll: (includeBgm?: boolean) => void;
    setMasterVolume: (volume: number) => void;
    setBgmTrack: (fileId: string) => Promise<unknown>;
    clearBgmTrack: () => void;
    setBgmVolume: (volume: number) => void;
    setBgmLoop: (loop: boolean) => void;
    setBgmDuckLevel: (level: number) => void;
  };
  setActiveShowId: (id: string) => void;
  setActiveBankId: (id: string) => void;
  setMasterVolume: (volume: number) => void;
}

export async function activateShow(show: Show, deps: ShowActivationDependencies): Promise<void> {
  // Switching a live show must never carry pads or background music into the next one.
  deps.audioEngine.stopAll(true);
  deps.setActiveShowId(show.id);
  deps.setActiveBankId(show.activeBankId || show.banks[0]?.id || '');
  const masterVolume = show.masterVolume ?? 1;
  deps.setMasterVolume(masterVolume);
  deps.audioEngine.setMasterVolume(masterVolume);

  if (show.bgm.fileId) {
    deps.audioEngine.setBgmVolume(show.bgm.volume);
    deps.audioEngine.setBgmLoop(show.bgm.loop);
    deps.audioEngine.setBgmDuckLevel(show.bgm.duckLevel);
    deps.audioEngine.setBgmTrack(show.bgm.fileId).catch(console.error);
  } else {
    deps.audioEngine.clearBgmTrack();
  }

  await deps.storage.setActiveShowId(show.id);
}
