import { create } from 'zustand';
import TrackPlayer, {
  Event,
  State as RNTPState,
} from 'react-native-track-player';
import { PlayerState, PlaybackStatus, TrackMetadata, RepeatMode } from '../audio/types';
import { setupPlayerEngine, loadQueueAndPlay, setPlayerRepeatMode } from '../audio/playerEngine';

interface PlayerActions {
  initialize: () => Promise<void>;
  playTrack: (track: TrackMetadata, queue?: TrackMetadata[]) => Promise<void>;
  togglePlayPause: () => Promise<void>;
  skipNext: () => Promise<void>;
  skipPrevious: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  toggleShuffle: () => void;
  cycleRepeatMode: () => Promise<void>;
  updateProgress: (position: number, duration: number) => void;
}

function mapRNTPStateToStatus(state?: RNTPState): PlaybackStatus {
  switch (state) {
    case RNTPState.Playing:
      return 'playing';
    case RNTPState.Paused:
      return 'paused';
    case RNTPState.Buffering:
    case RNTPState.Loading:
      return 'buffering';
    case RNTPState.Ready:
      return 'ready';
    case RNTPState.Stopped:
      return 'stopped';
    default:
      return 'idle';
  }
}

export const usePlayerStore = create<PlayerState & PlayerActions>((set, get) => ({
  currentTrack: null,
  status: 'idle',
  position: 0,
  duration: 0,
  bufferedPosition: 0,
  queue: [],
  queueIndex: 0,
  isShuffle: false,
  repeatMode: 'off',
  error: null,
  isEngineReady: false,

  initialize: async () => {
    if (get().isEngineReady) return;

    const ready = await setupPlayerEngine();
    if (!ready) {
      set({ error: 'Failed to initialize native audio engine' });
      return;
    }

    set({ isEngineReady: true, error: null });

    // Listen for state changes
    TrackPlayer.addEventListener(Event.PlaybackState, (event) => {
      const status = mapRNTPStateToStatus(event.state);
      set({ status });
    });

    // Listen for track changes
    TrackPlayer.addEventListener(Event.PlaybackTrackChanged, async (event) => {
      if (event.nextTrack !== undefined) {
        const queue = get().queue;
        const nextTrack = queue[event.nextTrack] ?? null;
        set({
          queueIndex: event.nextTrack,
          currentTrack: nextTrack,
          position: 0,
          duration: nextTrack?.duration ?? 0,
        });
      }
    });

    // Listen for playback error
    TrackPlayer.addEventListener(Event.PlaybackError, (event) => {
      set({
        error: `Playback error: ${event.message || 'Stream connection failed'}`,
        status: 'error',
      });
    });
  },

  playTrack: async (track: TrackMetadata, newQueue?: TrackMetadata[]) => {
    try {
      const activeQueue = newQueue && newQueue.length > 0 ? newQueue : [track];
      const trackIndex = activeQueue.findIndex((t) => t.id === track.id);
      const safeIndex = trackIndex >= 0 ? trackIndex : 0;

      set({
        queue: activeQueue,
        queueIndex: safeIndex,
        currentTrack: track,
        status: 'buffering',
        error: null,
      });

      await loadQueueAndPlay(activeQueue, safeIndex);
    } catch (err: any) {
      console.error('[PlayerStore] Error playing track:', err);
      set({
        error: err?.message || 'Could not start audio playback',
        status: 'error',
      });
    }
  },

  togglePlayPause: async () => {
    try {
      const { status } = get();
      if (status === 'playing') {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
    } catch (err: any) {
      console.error('[PlayerStore] Toggle play/pause error:', err);
    }
  },

  skipNext: async () => {
    try {
      await TrackPlayer.skipToNext();
    } catch (err: any) {
      // If at end of queue
      console.warn('[PlayerStore] Skip next failed (end of queue?):', err);
    }
  },

  skipPrevious: async () => {
    try {
      const { position } = get();
      if (position > 3) {
        // Rewind to beginning of track if played for more than 3s
        await TrackPlayer.seekTo(0);
      } else {
        await TrackPlayer.skipToPrevious();
      }
    } catch (err: any) {
      console.warn('[PlayerStore] Skip previous failed:', err);
    }
  },

  seekTo: async (seconds: number) => {
    try {
      await TrackPlayer.seekTo(seconds);
      set({ position: seconds });
    } catch (err: any) {
      console.error('[PlayerStore] Seek error:', err);
    }
  },

  toggleShuffle: () => {
    set((state) => ({ isShuffle: !state.isShuffle }));
  },

  cycleRepeatMode: async () => {
    const current = get().repeatMode;
    const nextMode: RepeatMode =
      current === 'off' ? 'queue' : current === 'queue' ? 'track' : 'off';
    await setPlayerRepeatMode(nextMode);
    set({ repeatMode: nextMode });
  },

  updateProgress: (position: number, duration: number) => {
    set({ position, duration });
  },
}));
