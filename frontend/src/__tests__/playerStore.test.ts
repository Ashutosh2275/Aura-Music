import { describe, it, expect, beforeEach, vi } from 'vitest';
import { usePlayerStore } from '../store/playerStore';
import { PERMITTED_TRACKS } from '../services/mockData';

// Mock Audio and Navigator MediaSession for headless node environment
(globalThis as any).Audio = class {
  src = '';
  preload = 'metadata';
  currentTime = 0;
  duration = 200;
  paused = true;
  addEventListener = vi.fn();
  removeEventListener = vi.fn();
  load = vi.fn();
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
} as any;

describe('Player Store & Queue Management', () => {
  beforeEach(() => {
    usePlayerStore.setState({
      currentTrack: null,
      queue: [],
      queueIndex: 0,
      status: 'idle',
      duration: 0,
      position: 0,
      isShuffle: false,
      repeatMode: 'off',
      error: null,
      likes: [],
      recentlyPlayed: [],
    });
  });

  it('initializes with default state', () => {
    const state = usePlayerStore.getState();
    expect(state.currentTrack).toBeNull();
    expect(state.queue).toEqual([]);
    expect(state.repeatMode).toBe('off');
    expect(state.isShuffle).toBe(false);
  });

  it('plays a track and populates the queue', () => {
    const track = PERMITTED_TRACKS[0];
    usePlayerStore.getState().playTrack(track, PERMITTED_TRACKS);

    const state = usePlayerStore.getState();
    expect(state.currentTrack?.id).toBe(track.id);
    expect(state.queue.length).toBe(PERMITTED_TRACKS.length);
    expect(state.recentlyPlayed.length).toBe(1);
    expect(state.recentlyPlayed[0].id).toBe(track.id);
  });

  it('advances to next track in queue', () => {
    usePlayerStore.getState().playTrack(PERMITTED_TRACKS[0], PERMITTED_TRACKS);
    expect(usePlayerStore.getState().queueIndex).toBe(0);

    usePlayerStore.getState().skipNext();
    expect(usePlayerStore.getState().queueIndex).toBe(1);
    expect(usePlayerStore.getState().currentTrack?.id).toBe(PERMITTED_TRACKS[1].id);
  });

  it('cycles repeat mode: off -> queue -> track -> off', () => {
    expect(usePlayerStore.getState().repeatMode).toBe('off');

    usePlayerStore.getState().cycleRepeatMode();
    expect(usePlayerStore.getState().repeatMode).toBe('queue');

    usePlayerStore.getState().cycleRepeatMode();
    expect(usePlayerStore.getState().repeatMode).toBe('track');

    usePlayerStore.getState().cycleRepeatMode();
    expect(usePlayerStore.getState().repeatMode).toBe('off');
  });

  it('toggles shuffle mode', () => {
    expect(usePlayerStore.getState().isShuffle).toBe(false);
    usePlayerStore.getState().toggleShuffle();
    expect(usePlayerStore.getState().isShuffle).toBe(true);
    usePlayerStore.getState().toggleShuffle();
    expect(usePlayerStore.getState().isShuffle).toBe(false);
  });

  it('toggles likes correctly', () => {
    const trackId = PERMITTED_TRACKS[0].id;
    expect(usePlayerStore.getState().isLiked(trackId)).toBe(false);

    usePlayerStore.getState().toggleLike(trackId);
    expect(usePlayerStore.getState().isLiked(trackId)).toBe(true);

    usePlayerStore.getState().toggleLike(trackId);
    expect(usePlayerStore.getState().isLiked(trackId)).toBe(false);
  });
});
