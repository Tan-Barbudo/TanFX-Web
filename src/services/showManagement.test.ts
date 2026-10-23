import assert from 'node:assert/strict';
import test from 'node:test';
import { Show } from '../types';
import { activateShow, duplicateShow, persistAndActivateShow, resolveInitialShow } from './showManagement';

function show(id: string, fileId: string | null = null): Show {
  return {
    id,
    name: `Show ${id}`,
    banks: [{ id: `${id}-bank`, name: 'BANCO A', pads: [] }],
    activeBankId: `${id}-bank`,
    bgm: { fileId, fileName: fileId ? `${fileId}.mp3` : null, volume: 0.6, loop: true, duckLevel: 0.3, fadeOut: 1 },
    masterVolume: 0.7,
    createdAt: 1,
    updatedAt: 1,
  };
}

function activationHarness() {
  const calls: Array<[string, ...unknown[]]> = [];
  const deps = {
    storage: { setActiveShowId: async (id: string) => { calls.push(['persistActive', id]); } },
    audioEngine: {
      stopAll: (includeBgm?: boolean) => calls.push(['stopAll', includeBgm]),
      setMasterVolume: (volume: number) => calls.push(['masterVolume', volume]),
      setBgmTrack: async (fileId: string) => { calls.push(['bgmTrack', fileId]); },
      clearBgmTrack: () => calls.push(['clearBgmTrack']),
      setBgmVolume: (volume: number) => calls.push(['bgmVolume', volume]),
      setBgmLoop: (loop: boolean) => calls.push(['bgmLoop', loop]),
      setBgmDuckLevel: (level: number) => calls.push(['bgmDuckLevel', level]),
    },
    setActiveShowId: (id: string) => calls.push(['activeShow', id]),
    setActiveBankId: (id: string) => calls.push(['activeBank', id]),
    setMasterVolume: (volume: number) => calls.push(['stateMasterVolume', volume]),
  };
  return { calls, deps };
}

test('creation persists, inserts, then activates the newly created show directly', async () => {
  const created = show('new');
  const calls: string[] = [];
  await persistAndActivateShow(created, {
    saveShow: async (item) => { calls.push(`save:${item.id}`); },
    addShow: (item) => { calls.push(`add:${item.id}`); },
    activate: async (item) => { calls.push(`activate:${item.id}`); },
  });
  assert.deepEqual(calls, ['save:new', 'add:new', 'activate:new']);
});

test('duplication creates a new identity while retaining the show setup, then activates it', async () => {
  const original = show('original', 'theme-song');
  const copied = duplicateShow(original, 'copy', 1234);
  assert.equal(copied.id, 'copy');
  assert.equal(copied.name, 'Show original (COPIA)');
  assert.equal(copied.createdAt, 1234);
  assert.equal(copied.bgm.fileId, original.bgm.fileId);
  assert.equal(copied.banks, original.banks);

  let activated = '';
  await persistAndActivateShow(copied, {
    saveShow: async () => {},
    addShow: () => {},
    activate: async (item) => { activated = item.id; },
  });
  assert.equal(activated, 'copy');
});

test('selection stops prior pads and BGM before configuring and persisting the selected show', async () => {
  const { calls, deps } = activationHarness();
  await activateShow(show('next', 'new-track'), deps);
  assert.deepEqual(calls.slice(0, 4), [
    ['stopAll', true], ['activeShow', 'next'], ['activeBank', 'next-bank'], ['stateMasterVolume', 0.7],
  ]);
  assert.ok(calls.some(([name, value]) => name === 'bgmTrack' && value === 'new-track'));
  assert.ok(calls.some(([name, value]) => name === 'persistActive' && value === 'next'));
  assert.ok(calls.every(([name]) => name !== 'clearBgmTrack'));
});

test('selecting a show without BGM clears the previous track', async () => {
  const { calls, deps } = activationHarness();
  await activateShow(show('silent'), deps);
  assert.ok(calls.some(([name]) => name === 'stopAll' && name && calls[0][1] === true));
  assert.ok(calls.some(([name]) => name === 'clearBgmTrack'));
  assert.ok(calls.every(([name]) => !['bgmTrack', 'bgmVolume', 'bgmLoop', 'bgmDuckLevel'].includes(name)));
});

test('recovery chooses the stored show and falls back to the first valid show', async () => {
  const shows = [show('first'), show('saved', 'saved-track')];
  const restored = resolveInitialShow(shows, 'saved');
  assert.equal(restored?.id, 'saved');
  assert.equal(resolveInitialShow(shows, 'deleted')?.id, 'first');
  assert.equal(resolveInitialShow([], 'deleted'), undefined);

  const { calls, deps } = activationHarness();
  await activateShow(restored!, deps);
  assert.ok(calls.some(([name, value]) => name === 'bgmTrack' && value === 'saved-track'));
});
