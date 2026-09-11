import React, { useRef } from 'react';
import { SoundPad, PadPlaybackStatus } from '../types';
import { SoundPadButton } from './SoundPadButton';

interface PadGridProps {
  pads: SoundPad[];
  bankId: string;
  activeStatuses: Map<string, PadPlaybackStatus>;
  onTriggerPad: (pad: SoundPad) => void;
  onStopPad: (padId: string) => void;
  onOpenSettings: (pad: SoundPad) => void;
  onRenamePad: (pad: SoundPad) => void;
  onLoadAudioFile: (pad: SoundPad, file: File) => void;
  onContextMenuAction: (pad: SoundPad, pos: { x: number; y: number }) => void;
  isEditingLocked: boolean;
  performanceMode: boolean;
}

// 24 keys layout for desktop performance
const KEYBOARD_KEYS = [
  '1', '2', '3', '4', '5', '6',
  'Q', 'W', 'E', 'R', 'T', 'Y',
  'A', 'S', 'D', 'F', 'G', 'H',
  'Z', 'X', 'C', 'V', 'B', 'N',
];

export const PadGrid: React.FC<PadGridProps> = ({
  pads,
  activeStatuses,
  onTriggerPad,
  onStopPad,
  onOpenSettings,
  onRenamePad,
  onLoadAudioFile,
  onContextMenuAction,
  isEditingLocked,
  performanceMode,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const targetPadRef = useRef<SoundPad | null>(null);

  const handleSelectFile = (pad: SoundPad) => {
    targetPadRef.current = pad;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && targetPadRef.current) {
      onLoadAudioFile(targetPadRef.current, file);
    }
  };

  return (
    <div
      id="sound-pad-grid-container"
      className="flex-1 w-full h-full p-2 sm:p-3 overflow-hidden flex flex-col min-h-0"
    >
      {/* Hidden file picker input supporting all common formats */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/aac,audio/*,.mp3,.wav,.ogg,.m4a,.aac"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* 6 columns x 4 rows matrix */}
      <div
        id="sound-pads-matrix"
        className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 grid-rows-8 sm:grid-rows-6 md:grid-rows-4 gap-2 sm:gap-2.5 w-full h-full min-h-0"
      >
        {pads.map((pad, idx) => (
          <SoundPadButton
            key={pad.id}
            pad={pad}
            status={activeStatuses.get(pad.id)}
            keyboardKey={KEYBOARD_KEYS[idx]}
            onTrigger={onTriggerPad}
            onStop={onStopPad}
            onOpenSettings={onOpenSettings}
            onRename={onRenamePad}
            onSelectFile={handleSelectFile}
            onContextMenuAction={onContextMenuAction}
            isEditingLocked={isEditingLocked}
            performanceMode={performanceMode}
          />
        ))}
      </div>
    </div>
  );
};
