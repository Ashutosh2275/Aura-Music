import { create } from 'zustand';
import type { Track, PlayerState, RepeatMode, PlaybackStatus } from '../audio/types';
import { audioEngine } from '../audio/audioEngine';
import {
  initAnonymousAuth,
  syncLikeToFirestore,
  syncRecentToFirestore,
} from '../services/firebase';

interface PlayerActions {
  initialize: () => void;
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlayPause: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
  seekTo: (seconds: number) => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  toggleLike: (trackId: string) => void;
  isLiked: (trackId: string) => boolean;
  recentlyPlayed: Track[];
  likes: string[];
}

export const usePlayerStore = create<PlayerState & PlayerActions>((set, get) => ({
  currentTrack: null,
  queue: [],
  queueIndex: 0,
  status: 'idle',
  duration: 0,
  position: 0,
  buffered: 0,
  isShuffle: false,
  repeatMode: 'off',
  error: null,
  recentlyPlayed: [],
  likes: [],

  initialize: () => {
    // 1. Connect Audio Engine events to Player Store
    audioEngine.setCallbacks({
      onStatusChange: (status: PlaybackStatus) => {
        set({ status });
      },
      onTimeUpdate: (position: number, duration: number) => {
        set({ position, duration });
      },
      onTrackEnded: () => {
        const { repeatMode, skipNext } = get();
        if (repeatMode === 'track') {
          const current = get().currentTrack;
          if (current) audioEngine.loadAndPlay(current);
        } else {
          skipNext();
        }
      },
      onError: (errorMsg: string) => {
        set({ error: errorMsg, status: 'error' });
      },
      onNextTrackRequested: () => {
        get().skipNext();
      },
      onPreviousTrackRequested: () => {
        get().skipPrevious();
      },
    });

    // 2. Hydrate local cache
    try {
      const savedLikes = localStorage.getItem('aura_likes');
      if (savedLikes) set({ likes: JSON.parse(savedLikes) });

      const savedRecent = localStorage.getItem('aura_recent');
      if (savedRecent) set({ recentlyPlayed: JSON.parse(savedRecent) });
    } catch {}

    // 3. Initialize Firebase Anonymous Auth in background
    if (typeof window !== 'undefined') {
      initAnonymousAuth().catch(() => {});
    }
  },

  playTrack: (track: Track, newQueue?: Track[]) => {
    const activeQueue = newQueue && newQueue.length > 0 ? newQueue : [track];
    const trackIndex = activeQueue.findIndex((t) => t.id === track.id);
    const safeIndex = trackIndex >= 0 ? trackIndex : 0;

    // Update recently played locally
    const recent = [track, ...get().recentlyPlayed.filter((t) => t.id !== track.id)].slice(0, 20);
    try {
      localStorage.setItem('aura_recent', JSON.stringify(recent));
    } catch {}

    set({
      currentTrack: track,
      queue: activeQueue,
      queueIndex: safeIndex,
      position: 0,
      duration: track.duration,
      error: null,
      recentlyPlayed: recent,
    });

    // Sync to Firestore
    syncRecentToFirestore(track).catch(() => {});

    audioEngine.loadAndPlay(track);
  },

  togglePlayPause: () => {
    const { status, currentTrack, queue } = get();
    if (!currentTrack && queue.length > 0) {
      get().playTrack(queue[0], queue);
      return;
    }
    if (status === 'playing') {
      audioEngine.pause();
    } else {
      audioEngine.play();
    }
  },

  skipNext: () => {
    const { queue, queueIndex, isShuffle, repeatMode } = get();
    if (queue.length === 0) return;

    let nextIndex: number;
    if (isShuffle && queue.length > 1) {
      let rand = Math.floor(Math.random() * queue.length);
      while (rand === queueIndex) {
        rand = Math.floor(Math.random() * queue.length);
      }
      nextIndex = rand;
    } else {
      nextIndex = queueIndex + 1;
      if (nextIndex >= queue.length) {
        if (repeatMode === 'queue') {
          nextIndex = 0;
        } else {
          return;
        }
      }
    }

    const nextTrack = queue[nextIndex];
    if (nextTrack) {
      set({ queueIndex: nextIndex, currentTrack: nextTrack, position: 0 });
      audioEngine.loadAndPlay(nextTrack);
    }
  },

  skipPrevious: () => {
    const { queue, queueIndex, position } = get();
    if (position > 3) {
      audioEngine.seekTo(0);
      set({ position: 0 });
      return;
    }

    if (queue.length === 0) return;
    const prevIndex = queueIndex > 0 ? queueIndex - 1 : queue.length - 1;
    const prevTrack = queue[prevIndex];
    if (prevTrack) {
      set({ queueIndex: prevIndex, currentTrack: prevTrack, position: 0 });
      audioEngine.loadAndPlay(prevTrack);
    }
  },

  seekTo: (seconds: number) => {
    audioEngine.seekTo(seconds);
    set({ position: seconds });
  },

  toggleShuffle: () => {
    set((s) => ({ isShuffle: !s.isShuffle }));
  },

  cycleRepeatMode: () => {
    const current = get().repeatMode;
    const next: RepeatMode = current === 'off' ? 'queue' : current === 'queue' ? 'track' : 'off';
    set({ repeatMode: next });
  },

  toggleLike: (trackId: string) => {
    const { likes } = get();
    const isNowLiked = !likes.includes(trackId);
    const updated = isNowLiked
      ? [...likes, trackId]
      : likes.filter((id) => id !== trackId);

    try {
      localStorage.setItem('aura_likes', JSON.stringify(updated));
    } catch {}

    set({ likes: updated });

    // Sync to Firestore
    syncLikeToFirestore(trackId, isNowLiked).catch(() => {});
  },

  isLiked: (trackId: string) => {
    return get().likes.includes(trackId);
  },
}));
