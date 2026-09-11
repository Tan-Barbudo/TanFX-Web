import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Show, Bank, SoundPad, PadPlaybackStatus, BgmPlaybackStatus } from './types';
import { storage, createEmptyBank, createDefaultShow } from './services/storage';
import { audioEngine } from './services/audioEngine';
import { Header } from './components/Header';
import { BankBar } from './components/BankBar';
import { PadGrid } from './components/PadGrid';
import { PadSettingsModal } from './components/PadSettingsModal';
import { BackgroundMusicBar } from './components/BackgroundMusicBar';
import { ShowsModal } from './components/ShowsModal';
import { AboutModal } from './components/AboutModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { NameAudioModal } from './components/NameAudioModal';
import { PadContextMenu } from './components/PadContextMenu';

// 24 Keys mapped across rows 1..4
const KEY_MAP: Record<string, number> = {
  '1': 0, '2': 1, '3': 2, '4': 3, '5': 4, '6': 5,
  'q': 6, 'w': 7, 'e': 8, 'r': 9, 't': 10, 'y': 11,
  'a': 12, 's': 13, 'd': 14, 'f': 15, 'g': 16, 'h': 17,
  'z': 18, 'x': 19, 'c': 20, 'v': 21, 'b': 22, 'n': 23,
};

export default function App() {
  const [shows, setShows] = useState<Show[]>([]);
  const [activeShowId, setActiveShowId] = useState<string>('');
  const [activeBankId, setActiveBankId] = useState<string>('');

  // Performance & Locks
  const [performanceMode, setPerformanceMode] = useState<boolean>(false);
  const [isEditingLocked, setIsEditingLocked] = useState<boolean>(false);

  // Modals & Panels
  const [selectedPadForSettings, setSelectedPadForSettings] = useState<SoundPad | null>(null);
  const [isShowsModalOpen, setIsShowsModalOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);
  const [isBgmBarOpen, setIsBgmBarOpen] = useState<boolean>(false);

  // Custom Audio Naming & Context Menu (Requirements 1, 2, 3, 4, 9, 10)
  const [pendingAudioLoad, setPendingAudioLoad] = useState<{
    pad: SoundPad;
    fileId: string;
    fileName: string;
    duration: number;
    initialName: string;
  } | null>(null);
  const [padToRename, setPadToRename] = useState<SoundPad | null>(null);
  const [contextMenuState, setContextMenuState] = useState<{
    pad: SoundPad;
    position: { x: number; y: number };
  } | null>(null);

  const appFileInputRef = useRef<HTMLInputElement | null>(null);
  const targetFilePadRef = useRef<SoundPad | null>(null);

  // Audio Playback Tracking
  const [activeStatuses, setActiveStatuses] = useState<Map<string, PadPlaybackStatus>>(new Map());
  const [bgmStatus, setBgmStatus] = useState<BgmPlaybackStatus>({
    isPlaying: false,
    isPaused: false,
    currentTime: 0,
    duration: 0,
    progress: 0,
    isDucked: false,
  });
  const [masterVolume, setMasterVolume] = useState<number>(1.0);

  // 1. Load initial shows & configuration from IndexedDB
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const loadedShows = await storage.getAllShows();
        if (!isMounted) return;

        setShows(loadedShows);
        const storedActiveId = await storage.getActiveShowId();
        const initialShow = (storedActiveId && loadedShows.find((s) => s.id === storedActiveId)) || loadedShows[0];

        if (initialShow) {
          setActiveShowId(initialShow.id);
          setActiveBankId(initialShow.activeBankId || initialShow.banks[0]?.id || '');
          setMasterVolume(initialShow.masterVolume ?? 1.0);
          audioEngine.setMasterVolume(initialShow.masterVolume ?? 1.0);

          // Configure BGM if saved
          if (initialShow.bgm.fileId) {
            audioEngine.setBgmTrack(initialShow.bgm.fileId).catch(console.error);
            audioEngine.setBgmVolume(initialShow.bgm.volume);
            audioEngine.setBgmLoop(initialShow.bgm.loop);
            audioEngine.setBgmDuckLevel(initialShow.bgm.duckLevel);
          }
        }
      } catch (err) {
        console.error('Failed to initialize shows from storage:', err);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Subscribe to AudioEngine real-time playhead updates
  useEffect(() => {
    const unsubscribe = audioEngine.subscribe((statusMap, currentBgmStatus) => {
      setActiveStatuses(statusMap);
      setBgmStatus(currentBgmStatus);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Current active show and active bank
  const currentShow = useMemo(() => {
    return shows.find((s) => s.id === activeShowId) || shows[0];
  }, [shows, activeShowId]);

  const currentBank = useMemo(() => {
    if (!currentShow) return null;
    return currentShow.banks.find((b) => b.id === activeBankId) || currentShow.banks[0];
  }, [currentShow, activeBankId]);

  // Save current show state helper
  const updateCurrentShow = useCallback((updater: (prev: Show) => Show) => {
    setShows((prevShows) => {
      return prevShows.map((show) => {
        if (show.id === activeShowId) {
          const updated = updater(show);
          storage.saveShow(updated).catch(console.error);
          return updated;
        }
        return show;
      });
    });
  }, [activeShowId]);

  // Master Volume Handler
  const handleMasterVolumeChange = (vol: number) => {
    setMasterVolume(vol);
    audioEngine.setMasterVolume(vol);
    updateCurrentShow((s) => ({ ...s, masterVolume: vol }));
  };

  // Master Action Handlers
  const handleStopAll = () => {
    audioEngine.stopAll(false);
  };

  const handleFadeAll = () => {
    audioEngine.fadeAll(1.8);
  };

  const handlePauseAll = () => {
    audioEngine.pauseAll();
  };

  // Pad Trigger Handler
  const handleTriggerPad = async (pad: SoundPad) => {
    if (!currentBank) return;
    await audioEngine.triggerPad(pad, currentBank.id);
  };

  const handleStopPad = (padId: string) => {
    audioEngine.stopPad(padId);
  };

  // Load Audio File to Pad -> Automatically prompt for Custom Audio Name (Requirements 1, 2, 3, 4, 15)
  const handleLoadAudioFile = async (pad: SoundPad, file: File) => {
    try {
      const { fileId, duration } = await audioEngine.registerFile(file);
      // Pre-fill the field using filename without extension (e.g. magia_final.mp3 -> magia_final)
      const cleanName = file.name.replace(/\.[^/.]+$/, '');

      // Open small modal dialog asking "NOMBRE DEL AUDIO"
      setPendingAudioLoad({
        pad,
        fileId,
        fileName: file.name,
        duration,
        initialName: cleanName,
      });
    } catch (err) {
      console.error('Error loading audio file:', err);
      alert('No se pudo decodificar el archivo de audio. Verifica que sea un archivo MP3, WAV, OGG o M4A compatible.');
    }
  };

  // Commit Custom Audio Name after user confirms or provides name
  const handleCommitAudioLoad = (
    pending: { pad: SoundPad; fileId: string; fileName: string; duration: number; initialName: string },
    customName: string
  ) => {
    // If user does not enter a custom name, automatically use the filename without its extension (Requirement 15)
    const finalName = customName.trim() || pending.initialName;

    updateCurrentShow((show) => {
      const banks = show.banks.map((b) => {
        if (b.id !== currentBank?.id) return b;
        const pads = b.pads.map((p) => {
          if (p.id !== pending.pad.id) return p;
          return {
            ...p,
            fileId: pending.fileId,
            fileName: pending.fileName,
            name: finalName,
            duration: pending.duration,
          };
        });
        return { ...b, pads };
      });
      return { ...show, banks };
    });

    if (selectedPadForSettings && selectedPadForSettings.id === pending.pad.id) {
      setSelectedPadForSettings((prev) =>
        prev
          ? {
              ...prev,
              fileId: pending.fileId,
              fileName: pending.fileName,
              name: finalName,
              duration: pending.duration,
            }
          : null
      );
    }

    setPendingAudioLoad(null);
  };

  // Rename Pad at any time (Requirements 9 & 10)
  const handleRenamePad = (pad: SoundPad, newName: string) => {
    const fallback = pad.fileName
      ? pad.fileName.replace(/\.[^/.]+$/, '')
      : `PAD ${pad.index + 1}`;
    const cleanName = newName.trim() || fallback;

    updateCurrentShow((show) => {
      const banks = show.banks.map((b) => {
        if (b.id !== currentBank?.id) return b;
        const pads = b.pads.map((p) => (p.id === pad.id ? { ...p, name: cleanName } : p));
        return { ...b, pads };
      });
      return { ...show, banks };
    });

    if (selectedPadForSettings && selectedPadForSettings.id === pad.id) {
      setSelectedPadForSettings((prev) => (prev ? { ...prev, name: cleanName } : null));
    }
  };

  // Trigger file selection for a specific pad from context menu
  const handlePromptAudioFile = (pad: SoundPad) => {
    targetFilePadRef.current = pad;
    if (appFileInputRef.current) {
      appFileInputRef.current.value = '';
      appFileInputRef.current.click();
    }
  };

  // Update Pad Settings
  const handleUpdatePad = (updatedPad: SoundPad) => {
    updateCurrentShow((show) => {
      const banks = show.banks.map((b) => {
        if (b.id !== currentBank?.id) return b;
        const pads = b.pads.map((p) => (p.id === updatedPad.id ? updatedPad : p));
        return { ...b, pads };
      });
      return { ...show, banks };
    });
  };

  // Clear Audio from Pad
  const handleClearAudio = (pad: SoundPad) => {
    audioEngine.stopPad(pad.id);
    updateCurrentShow((show) => {
      const banks = show.banks.map((b) => {
        if (b.id !== currentBank?.id) return b;
        const pads = b.pads.map((p) => {
          if (p.id !== pad.id) return p;
          return {
            ...p,
            fileId: null,
            fileName: null,
            name: `PAD ${p.index + 1}`,
            duration: 0,
          };
        });
        return { ...b, pads };
      });
      return { ...show, banks };
    });

    if (selectedPadForSettings && selectedPadForSettings.id === pad.id) {
      setSelectedPadForSettings((prev) =>
        prev
          ? {
              ...prev,
              fileId: null,
              fileName: null,
              name: `PAD ${prev.index + 1}`,
              duration: 0,
            }
          : null
      );
    }
  };

  // Duplicate Pad (Requirement 14: When duplicating a pad, duplicate its custom name and add: "Copia")
  const handleDuplicatePad = (sourcePad: SoundPad, targetPadId: string) => {
    const duplicatedName = `${sourcePad.name} Copia`;
    updateCurrentShow((show) => {
      const banks = show.banks.map((b) => {
        if (b.id !== currentBank?.id) return b;
        const pads = b.pads.map((p) => {
          if (p.id !== targetPadId) return p;
          return {
            ...sourcePad,
            id: p.id,
            index: p.index,
            name: duplicatedName,
          };
        });
        return { ...b, pads };
      });
      return { ...show, banks };
    });
  };

  // Bank Management
  const handleSelectBank = (bankId: string) => {
    setActiveBankId(bankId);
    updateCurrentShow((s) => ({ ...s, activeBankId: bankId }));
  };

  const handleRenameBank = (bankId: string, newName: string) => {
    updateCurrentShow((show) => {
      const banks = show.banks.map((b) => (b.id === bankId ? { ...b, name: newName } : b));
      return { ...show, banks };
    });
  };

  const handleDuplicateBank = (bankId: string) => {
    if (!currentShow) return;
    const target = currentShow.banks.find((b) => b.id === bankId);
    if (!target) return;

    const newId = `bank_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const clonedPads = target.pads.map((p, idx) => ({
      ...p,
      id: `${newId}_pad_${idx + 1}`,
    }));

    const newBank: Bank = {
      id: newId,
      name: `${target.name} (COPIA)`,
      pads: clonedPads,
    };

    updateCurrentShow((show) => ({
      ...show,
      banks: [...show.banks, newBank],
      activeBankId: newId,
    }));
    setActiveBankId(newId);
  };

  const handleCreateBank = () => {
    if (!currentShow) return;
    const count = currentShow.banks.length;
    const bankLetter = String.fromCharCode(65 + count);
    const newId = `bank_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newBank = createEmptyBank(newId, `BANCO ${bankLetter}`);

    updateCurrentShow((show) => ({
      ...show,
      banks: [...show.banks, newBank],
      activeBankId: newId,
    }));
    setActiveBankId(newId);
  };

  const handleDeleteBank = (bankId: string) => {
    if (!currentShow || currentShow.banks.length <= 1) return;
    const filtered = currentShow.banks.filter((b) => b.id !== bankId);
    const newActive = filtered[0].id;

    updateCurrentShow((show) => ({
      ...show,
      banks: filtered,
      activeBankId: newActive,
    }));
    setActiveBankId(newActive);
  };

  const handleMoveBank = (bankId: string, direction: 'left' | 'right') => {
    if (!currentShow) return;
    const index = currentShow.banks.findIndex((b) => b.id === bankId);
    if (index === -1) return;

    const newBanks = [...currentShow.banks];
    if (direction === 'left' && index > 0) {
      [newBanks[index - 1], newBanks[index]] = [newBanks[index], newBanks[index - 1]];
    } else if (direction === 'right' && index < newBanks.length - 1) {
      [newBanks[index], newBanks[index + 1]] = [newBanks[index + 1], newBanks[index]];
    }

    updateCurrentShow((show) => ({ ...show, banks: newBanks }));
  };

  // Background Music (BGM) Handlers
  const handleLoadBgmTrack = async (file: File) => {
    try {
      const { fileId } = await audioEngine.registerFile(file);
      await audioEngine.setBgmTrack(fileId, file);

      updateCurrentShow((show) => ({
        ...show,
        bgm: {
          ...show.bgm,
          fileId,
          fileName: file.name,
        },
      }));
    } catch (err) {
      console.error('Error loading BGM file:', err);
      alert('Error cargando la pista de música de fondo.');
    }
  };

  const handleBgmPlay = () => audioEngine.playBgm();
  const handleBgmPause = () => audioEngine.pauseBgm();
  const handleBgmStop = () => audioEngine.stopBgm();
  const handleBgmFade = (dur: number) => audioEngine.fadeBgm(dur);

  const handleBgmVolumeChange = (volume: number) => {
    audioEngine.setBgmVolume(volume);
    updateCurrentShow((show) => ({
      ...show,
      bgm: { ...show.bgm, volume },
    }));
  };

  const handleBgmLoopToggle = (loop: boolean) => {
    audioEngine.setBgmLoop(loop);
    updateCurrentShow((show) => ({
      ...show,
      bgm: { ...show.bgm, loop },
    }));
  };

  const handleBgmDuckLevelChange = (duckLevel: number) => {
    audioEngine.setBgmDuckLevel(duckLevel);
    updateCurrentShow((show) => ({
      ...show,
      bgm: { ...show.bgm, duckLevel },
    }));
  };

  // Show Management Handlers
  const handleSelectShow = async (showId: string) => {
    const targetShow = shows.find((s) => s.id === showId);
    if (!targetShow) return;

    setActiveShowId(targetShow.id);
    setActiveBankId(targetShow.activeBankId || targetShow.banks[0]?.id || '');
    setMasterVolume(targetShow.masterVolume ?? 1.0);
    audioEngine.setMasterVolume(targetShow.masterVolume ?? 1.0);
    await storage.setActiveShowId(targetShow.id);

    if (targetShow.bgm.fileId) {
      audioEngine.setBgmTrack(targetShow.bgm.fileId).catch(console.error);
      audioEngine.setBgmVolume(targetShow.bgm.volume);
      audioEngine.setBgmLoop(targetShow.bgm.loop);
      audioEngine.setBgmDuckLevel(targetShow.bgm.duckLevel);
    }
  };

  const handleCreateShow = async (name: string) => {
    const newId = `show_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newShow = createDefaultShow(newId, name);
    await storage.saveShow(newShow);

    setShows((prev) => [...prev, newShow]);
    await handleSelectShow(newId);
  };

  const handleRenameShow = async (showId: string, newName: string) => {
    setShows((prev) => {
      return prev.map((s) => {
        if (s.id === showId) {
          const updated = { ...s, name: newName, updatedAt: Date.now() };
          storage.saveShow(updated).catch(console.error);
          return updated;
        }
        return s;
      });
    });
  };

  const handleDuplicateShow = async (showId: string) => {
    const source = shows.find((s) => s.id === showId);
    if (!source) return;

    const newId = `show_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newShow: Show = {
      ...source,
      id: newId,
      name: `${source.name} (COPIA)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storage.saveShow(newShow);
    setShows((prev) => [...prev, newShow]);
    await handleSelectShow(newId);
  };

  const handleDeleteShow = async (showId: string) => {
    if (shows.length <= 1) return;
    await storage.deleteShow(showId);
    const remaining = shows.filter((s) => s.id !== showId);
    setShows(remaining);
    if (activeShowId === showId) {
      await handleSelectShow(remaining[0].id);
    }
  };

  const handleExportShow = (show: Show) => {
    const jsonStr = JSON.stringify(show, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${show.name.replace(/\s+/g, '_').toLowerCase()}_tan_fx.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportShow = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Show;
      if (!parsed.banks || !parsed.name) {
        throw new Error('Archivo de show no válido');
      }

      const importedId = `show_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const importedShow: Show = {
        ...parsed,
        id: importedId,
        name: `${parsed.name} (IMPORTADO)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await storage.saveShow(importedShow);
      setShows((prev) => [...prev, importedShow]);
      await handleSelectShow(importedId);
      setIsShowsModalOpen(false);
      alert(`Show "${importedShow.name}" importado con éxito.`);
    } catch (err) {
      console.error('Error importing show:', err);
      alert('No se pudo importar el archivo JSON del show.');
    }
  };

  // Keyboard Shortcuts for live performance
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is in an input field
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          (activeEl as HTMLElement).isContentEditable)
      ) {
        return;
      }

      // SPACEBAR -> STOP ALL IMMEDIATELY
      if (e.code === 'Space') {
        e.preventDefault();
        handleStopAll();
        return;
      }

      // 'M' -> MASTER PAUSE / RESUME
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        handlePauseAll();
        return;
      }

      // Sound pads mapped 1-24
      const key = e.key.toLowerCase();
      if (key in KEY_MAP && currentBank) {
        const padIndex = KEY_MAP[key];
        const targetPad = currentBank.pads[padIndex];
        if (targetPad) {
          e.preventDefault();
          handleTriggerPad(targetPad);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentBank]);

  if (!currentShow || !currentBank) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0a0d14] text-slate-300 font-mono">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
          <span>INICIALIZANDO TAN FX PERFORMANCE SOUNDBOARD...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      id="tan-fx-app-root"
      className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a0d14] text-slate-100 select-none"
    >
      {/* 1. TOP CONSOLE HEADER */}
      <Header
        currentShowName={currentShow.name}
        masterVolume={masterVolume}
        onMasterVolumeChange={handleMasterVolumeChange}
        onStopAll={handleStopAll}
        onFadeAll={handleFadeAll}
        onPauseAll={handlePauseAll}
        performanceMode={performanceMode}
        onTogglePerformanceMode={() => setPerformanceMode((prev) => !prev)}
        isEditingLocked={isEditingLocked}
        onToggleLockEditing={() => {
          if (isEditingLocked) {
            // Deliberate unlock
            setIsEditingLocked(false);
          } else {
            setIsEditingLocked(true);
          }
        }}
        onOpenShows={() => setIsShowsModalOpen(true)}
        onOpenAbout={() => setIsAboutModalOpen(true)}
        onToggleBgmBar={() => setIsBgmBarOpen((prev) => !prev)}
        isBgmPlaying={bgmStatus.isPlaying}
        activeSoundsCount={activeStatuses.size}
      />

      {/* 2. BANK NAVIGATION BAR (BANCO A, B, C, D...) */}
      <BankBar
        banks={currentShow.banks}
        activeBankId={currentBank.id}
        onSelectBank={handleSelectBank}
        onRenameBank={handleRenameBank}
        onDuplicateBank={handleDuplicateBank}
        onCreateBank={handleCreateBank}
        onDeleteBank={handleDeleteBank}
        onMoveBank={handleMoveBank}
        getActivePadsCount={(bId) => audioEngine.getActivePadsCountInBank(bId)}
        isEditingLocked={isEditingLocked || performanceMode}
      />

      {/* 3. 24 SOUND PADS MATRIX (6 COLUMNS X 4 ROWS) */}
      <main className="flex-1 w-full overflow-hidden flex flex-col min-h-0 bg-[#090c12]">
        <PadGrid
          pads={currentBank.pads}
          bankId={currentBank.id}
          activeStatuses={activeStatuses}
          onTriggerPad={handleTriggerPad}
          onStopPad={handleStopPad}
          onOpenSettings={(pad) => setSelectedPadForSettings(pad)}
          onRenamePad={(pad) => setPadToRename(pad)}
          onLoadAudioFile={handleLoadAudioFile}
          onContextMenuAction={(pad, pos) => setContextMenuState({ pad, position: pos })}
          isEditingLocked={isEditingLocked}
          performanceMode={performanceMode}
        />
      </main>

      {/* HIDDEN FILE INPUT FOR CONTEXT MENU CAMBIAR AUDIO */}
      <input
        ref={appFileInputRef}
        type="file"
        accept="audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/aac,audio/*,.mp3,.wav,.ogg,.m4a,.aac"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && targetFilePadRef.current) {
            handleLoadAudioFile(targetFilePadRef.current, file);
          }
        }}
        className="hidden"
      />

      {/* 4. BACKGROUND MUSIC SECTION (INDEPENDENT WITH AUTO-DUCKING) */}
      <BackgroundMusicBar
        config={currentShow.bgm}
        status={bgmStatus}
        onPlay={handleBgmPlay}
        onPause={handleBgmPause}
        onStop={handleBgmStop}
        onVolumeChange={handleBgmVolumeChange}
        onLoopToggle={handleBgmLoopToggle}
        onDuckLevelChange={handleBgmDuckLevelChange}
        onFadeOut={handleBgmFade}
        onLoadTrack={handleLoadBgmTrack}
        isOpen={isBgmBarOpen}
        onToggleOpen={() => setIsBgmBarOpen((prev) => !prev)}
      />

      {/* 5. PAD SETTINGS MODAL */}
      {selectedPadForSettings && (
        <PadSettingsModal
          pad={selectedPadForSettings}
          allPads={currentBank.pads}
          onClose={() => setSelectedPadForSettings(null)}
          onUpdatePad={handleUpdatePad}
          onReplaceAudio={handleLoadAudioFile}
          onClearAudio={handleClearAudio}
          onDuplicatePad={handleDuplicatePad}
          onTestPlay={handleTriggerPad}
          isPlaying={activeStatuses.get(selectedPadForSettings.id)?.isPlaying ?? false}
        />
      )}

      {/* 6. CONTEXT MENU FOR PADS (RIGHT CLICK / LONG PRESS) */}
      {contextMenuState && (
        <PadContextMenu
          pad={contextMenuState.pad}
          position={contextMenuState.position}
          onClose={() => setContextMenuState(null)}
          onRename={(pad) => setPadToRename(pad)}
          onOpenSettings={(pad) => setSelectedPadForSettings(pad)}
          onChangeAudio={(pad) => handlePromptAudioFile(pad)}
          onClearAudio={(pad) => handleClearAudio(pad)}
        />
      )}

      {/* 7. NEW AUDIO NAME MODAL (AUTO TRIGGERED ON LOAD - REQUIREMENTS 1, 2, 3, 4, 15) */}
      {pendingAudioLoad && (
        <NameAudioModal
          title="NOMBRE DEL AUDIO"
          initialName={pendingAudioLoad.initialName}
          fileName={pendingAudioLoad.fileName}
          padNumber={pendingAudioLoad.pad.index + 1}
          onSave={(customName) => handleCommitAudioLoad(pendingAudioLoad, customName)}
          onCancel={() => setPendingAudioLoad(null)}
        />
      )}

      {/* 8. RENAME PAD MODAL (TRIGGERED ANYTIME VIA CONTEXT MENU OR PAD BUTTON - REQUIREMENTS 9 & 10) */}
      {padToRename && (
        <NameAudioModal
          title="RENOMBRAR PAD"
          initialName={padToRename.name}
          fileName={padToRename.fileName}
          padNumber={padToRename.index + 1}
          onSave={(newName) => {
            handleRenamePad(padToRename, newName);
            setPadToRename(null);
          }}
          onCancel={() => setPadToRename(null)}
        />
      )}

      {/* 9. MIS SHOWS MODAL */}
      {isShowsModalOpen && (
        <ShowsModal
          shows={shows}
          activeShowId={currentShow.id}
          onClose={() => setIsShowsModalOpen(false)}
          onSelectShow={handleSelectShow}
          onCreateShow={handleCreateShow}
          onRenameShow={handleRenameShow}
          onDuplicateShow={handleDuplicateShow}
          onDeleteShow={handleDeleteShow}
          onExportShow={handleExportShow}
          onImportShow={handleImportShow}
        />
      )}

      {/* 7. ABOUT MODAL */}
      {isAboutModalOpen && (
        <AboutModal onClose={() => setIsAboutModalOpen(false)} />
      )}

      {/* 8. PWA OFFLINE CONNECTIVITY INDICATOR */}
      <OfflineIndicator />
    </div>
  );
}

