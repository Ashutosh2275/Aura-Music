export type RepeatMode = 'off' | 'track' | 'queue';

export interface TrackMetadata {
  id: string;
  url: string;
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  duration?: number; // In seconds
  license?: string;
  sourceProvider: 'jamendo' | 'fma' | 'audius' | 'archive' | 'custom';
}

export type PlaybackStatus = 'idle' | 'loading' | 'buffering' | 'ready' | 'playing' | 'paused' | 'stopped' | 'error';

export interface PlayerState {
  currentTrack: TrackMetadata | null;
  status: PlaybackStatus;
  position: number;
  duration: number;
  bufferedPosition: number;
  queue: TrackMetadata[];
  queueIndex: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  error: string | null;
  isEngineReady: boolean;
}
