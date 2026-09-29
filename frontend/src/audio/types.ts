export type RepeatMode = 'off' | 'track' | 'queue';

export interface Track {
  id: string;
  title: string;
  artist: {
    id: string;
    name: string;
  };
  album?: {
    id: string;
    title: string;
  };
  duration: number; // in seconds
  audioUrl: string;
  artworkUrl?: string;
  license: string;
  sourceProvider: string;
  genre?: string[];
  tags?: string[];
}

export interface Artist {
  id: string;
  name: string;
  bio?: string;
  artworkUrl?: string;
  tracks: Track[];
}

export interface Album {
  id: string;
  title: string;
  artist: {
    id: string;
    name: string;
  };
  artworkUrl?: string;
  tracks: Track[];
  releaseDate?: string;
}

export type PlaybackStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  queueIndex: number;
  status: PlaybackStatus;
  duration: number;
  position: number;
  buffered: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  error: string | null;
}
