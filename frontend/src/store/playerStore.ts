import { create } from 'zustand';
import type { Track, Playlist, PlayerState, RepeatMode, PlaybackStatus } from '../audio/types';
import { audioEngine } from '../audio/audioEngine';
import {
  syncLikeToFirestore,
  syncRecentToFirestore,
  fetchLikedTracksFromFirestore,
  fetchRecentTracksFromFirestore,
  fetchPlaylistsFromFirestore,
  savePlaylistToFirestore,
  deletePlaylistFromFirestore,
} from '../services/firebase';
import {
  startPlaybackSession,
  pausePlaybackSession,
  setRemoteSupersededCallback,
} from '../services/session';

interface PlayerActions {
  initialize: () => void;
  playTrack: (track: Track, newQueue?: Track[]) => void;
  togglePlayPause: () => void;
  skipNext: () => void;
  skipPrevious: () => void;
  seekTo: (seconds: number) => void;
  toggleShuffle: () => void;
  cycleRepeatMode: () => void;
  toggleLike: (track: Track) => void;
  isLiked: (trackId: string) => boolean;
  createPlaylist: (title: string, description?: string) => Playlist;
  deletePlaylist: (playlistId: string) => void;
  renamePlaylist: (playlistId: string, newTitle: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  dismissSupersededNotice: () => void;
  recentlyPlayed: Track[];
  likes: string[];
  likedTracks: Track[];
  playlists: Playlist[];
  supersededNotice: boolean;
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
  likedTracks: [],
  playlists: [],
  supersededNotice: false,

  initialize: () => {
    // 1. Connect Audio Engine events to Player Store
    audioEngine.setCallbacks({
      onStatusChange: (status: PlaybackStatus) => {
        set({ status });
        const { currentTrack } = get();
        if (currentTrack) {
          if (status === 'playing') {
            startPlaybackSession(currentTrack.id);
          } else if (status === 'paused' || status === 'idle') {
            pausePlaybackSession(currentTrack.id);
          }
        }
      },
      onTimeUpdate: (position: number, duration: number) => {
        set({ position, duration });
      },
      onTrackEnded: () => {
        const { repeatMode, skipNext, currentTrack } = get();
        if (currentTrack) pausePlaybackSession(currentTrack.id);

        if (repeatMode === 'track') {
          if (currentTrack) audioEngine.loadAndPlay(currentTrack);
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

    // 2. Register single-device superseded callback
    setRemoteSupersededCallback(() => {
      set({ supersededNotice: true, status: 'paused' });
    });

    // 3. Hydrate local cache
    try {
      const savedLikes = localStorage.getItem('aura_likes');
      if (savedLikes) set({ likes: JSON.parse(savedLikes) });

      const savedLikedTracks = localStorage.getItem('aura_liked_tracks');
      if (savedLikedTracks) set({ likedTracks: JSON.parse(savedLikedTracks) });

      const savedRecent = localStorage.getItem('aura_recent');
      if (savedRecent) set({ recentlyPlayed: JSON.parse(savedRecent) });

      const savedPlaylists = localStorage.getItem('aura_playlists');
      if (savedPlaylists) set({ playlists: JSON.parse(savedPlaylists) });
    } catch {}

    // 4. Hydrate from Firestore in background
    fetchLikedTracksFromFirestore()
      .then((tracks) => {
        if (tracks.length > 0) {
          set({
            likedTracks: tracks,
            likes: tracks.map((t) => t.id),
          });
          localStorage.setItem('aura_likes', JSON.stringify(tracks.map((t) => t.id)));
          localStorage.setItem('aura_liked_tracks', JSON.stringify(tracks));
        }
      })
      .catch(() => {});

    fetchRecentTracksFromFirestore()
      .then((tracks) => {
        if (tracks.length > 0) {
          set({ recentlyPlayed: tracks });
          localStorage.setItem('aura_recent', JSON.stringify(tracks));
        }
      })
      .catch(() => {});

    fetchPlaylistsFromFirestore()
      .then((pls) => {
        if (pls.length > 0) {
          set({ playlists: pls });
          localStorage.setItem('aura_playlists', JSON.stringify(pls));
        }
      })
      .catch(() => {});
  },

  dismissSupersededNotice: () => {
    set({ supersededNotice: false });
  },

  playTrack: (track: Track, newQueue?: Track[]) => {
    const activeQueue = newQueue && newQueue.length > 0 ? newQueue : [track];
    const trackIndex = activeQueue.findIndex((t) => t.id === track.id);
    const safeIndex = trackIndex >= 0 ? trackIndex : 0;

    // Update recently played
    const recent = [track, ...get().recentlyPlayed.filter((t) => t.id !== track.id)].slice(0, 30);
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
      supersededNotice: false,
    });

    // Sync to Firestore & Session
    syncRecentToFirestore(track).catch(() => {});
    startPlaybackSession(track.id);

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
      if (currentTrack) pausePlaybackSession(currentTrack.id);
    } else {
      audioEngine.play();
      if (currentTrack) startPlaybackSession(currentTrack.id);
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
      startPlaybackSession(nextTrack.id);
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
      startPlaybackSession(prevTrack.id);
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

  toggleLike: (track: Track) => {
    const { likes, likedTracks } = get();
    const isNowLiked = !likes.includes(track.id);

    const updatedLikes = isNowLiked
      ? [...likes, track.id]
      : likes.filter((id) => id !== track.id);

    const updatedLikedTracks = isNowLiked
      ? [track, ...likedTracks.filter((t) => t.id !== track.id)]
      : likedTracks.filter((t) => t.id !== track.id);

    try {
      localStorage.setItem('aura_likes', JSON.stringify(updatedLikes));
      localStorage.setItem('aura_liked_tracks', JSON.stringify(updatedLikedTracks));
    } catch {}

    set({ likes: updatedLikes, likedTracks: updatedLikedTracks });

    // Sync to Firestore
    syncLikeToFirestore(track, isNowLiked).catch(() => {});
  },

  isLiked: (trackId: string) => {
    return get().likes.includes(trackId);
  },

  createPlaylist: (title: string, description?: string) => {
    const newPlaylist: Playlist = {
      id: 'pl_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      title: title.trim() || 'My Playlist',
      description: description?.trim() || '',
      tracks: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newPlaylist, ...get().playlists];
    set({ playlists: updated });
    try {
      localStorage.setItem('aura_playlists', JSON.stringify(updated));
    } catch {}

    savePlaylistToFirestore(newPlaylist).catch(() => {});
    return newPlaylist;
  },

  deletePlaylist: (playlistId: string) => {
    const updated = get().playlists.filter((p) => p.id !== playlistId);
    set({ playlists: updated });
    try {
      localStorage.setItem('aura_playlists', JSON.stringify(updated));
    } catch {}

    deletePlaylistFromFirestore(playlistId).catch(() => {});
  },

  renamePlaylist: (playlistId: string, newTitle: string) => {
    const updated = get().playlists.map((p) => {
      if (p.id === playlistId) {
        const modified = { ...p, title: newTitle.trim(), updatedAt: new Date().toISOString() };
        savePlaylistToFirestore(modified).catch(() => {});
        return modified;
      }
      return p;
    });
    set({ playlists: updated });
    try {
      localStorage.setItem('aura_playlists', JSON.stringify(updated));
    } catch {}
  },

  addTrackToPlaylist: (playlistId: string, track: Track) => {
    const updated = get().playlists.map((p) => {
      if (p.id === playlistId) {
        if (p.tracks.some((t) => t.id === track.id)) return p;
        const modified = {
          ...p,
          tracks: [...p.tracks, track],
          artworkUrl: p.artworkUrl || track.artworkUrl,
          updatedAt: new Date().toISOString(),
        };
        savePlaylistToFirestore(modified).catch(() => {});
        return modified;
      }
      return p;
    });
    set({ playlists: updated });
    try {
      localStorage.setItem('aura_playlists', JSON.stringify(updated));
    } catch {}
  },

  removeTrackFromPlaylist: (playlistId: string, trackId: string) => {
    const updated = get().playlists.map((p) => {
      if (p.id === playlistId) {
        const modified = {
          ...p,
          tracks: p.tracks.filter((t) => t.id !== trackId),
          updatedAt: new Date().toISOString(),
        };
        savePlaylistToFirestore(modified).catch(() => {});
        return modified;
      }
      return p;
    });
    set({ playlists: updated });
    try {
      localStorage.setItem('aura_playlists', JSON.stringify(updated));
    } catch {}
  },
}));
