import type { Track, PlaybackStatus } from './types';

export interface AudioEngineCallbacks {
  onStatusChange: (status: PlaybackStatus) => void;
  onTimeUpdate: (position: number, duration: number) => void;
  onTrackEnded: () => void;
  onError: (error: string) => void;
  onNextTrackRequested: () => void;
  onPreviousTrackRequested: () => void;
}

class AudioEngine {
  private audio: HTMLAudioElement;
  private callbacks: AudioEngineCallbacks | null = null;
  private currentTrack: Track | null = null;

  constructor() {
    if (typeof Audio !== 'undefined') {
      this.audio = new Audio();
      this.audio.preload = 'metadata';
      this.setupListeners();
    } else {
      this.audio = {} as HTMLAudioElement;
    }
  }

  public setCallbacks(callbacks: AudioEngineCallbacks) {
    this.callbacks = callbacks;
    this.setupMediaSessionHandlers();
  }

  private setupListeners() {
    if (!this.audio.addEventListener) return;

    this.audio.addEventListener('play', () => {
      this.callbacks?.onStatusChange('playing');
      this.updateMediaSessionPlaybackState('playing');
    });

    this.audio.addEventListener('pause', () => {
      this.callbacks?.onStatusChange('paused');
      this.updateMediaSessionPlaybackState('paused');
    });

    this.audio.addEventListener('waiting', () => {
      this.callbacks?.onStatusChange('loading');
    });

    this.audio.addEventListener('canplay', () => {
      if (!this.audio.paused) {
        this.callbacks?.onStatusChange('playing');
      }
    });

    this.audio.addEventListener('timeupdate', () => {
      const position = this.audio.currentTime || 0;
      const duration = this.audio.duration || this.currentTrack?.duration || 0;
      this.callbacks?.onTimeUpdate(position, duration);
      this.updateMediaSessionPositionState(position, duration);
    });

    this.audio.addEventListener('ended', () => {
      this.callbacks?.onTrackEnded();
    });

    this.audio.addEventListener('error', () => {
      const errCode = this.audio.error?.code;
      const errMsg = this.audio.error?.message || `Playback error (code ${errCode})`;
      console.error('[AudioEngine] HTMLAudioElement error:', errMsg);
      this.callbacks?.onError(errMsg);
      this.callbacks?.onStatusChange('error');
    });
  }

  private setupMediaSessionHandlers() {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.setActionHandler('play', () => {
        this.play();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        this.pause();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        this.callbacks?.onNextTrackRequested();
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        this.callbacks?.onPreviousTrackRequested();
      });

      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const offset = details.seekOffset || 10;
        this.seekTo(Math.max(this.audio.currentTime - offset, 0));
      });

      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const offset = details.seekOffset || 10;
        this.seekTo(Math.min(this.audio.currentTime + offset, this.audio.duration || 0));
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && details.seekTime !== null) {
          this.seekTo(details.seekTime);
        }
      });
    } catch (e) {
      console.warn('[AudioEngine] MediaSession action registration failed:', e);
    }
  }

  public async loadAndPlay(track: Track): Promise<void> {
    this.currentTrack = track;
    this.callbacks?.onStatusChange('loading');

    this.updateMediaSessionMetadata(track);

    if (this.audio && typeof this.audio.load === 'function') {
      this.audio.src = track.audioUrl;
      this.audio.load();

      try {
        await this.audio.play();
      } catch (err: any) {
        if (err.name === 'NotAllowedError') {
          console.warn('[AudioEngine] Autoplay prevented: user interaction required.');
        } else {
          console.error('[AudioEngine] Play request failed:', err);
        }
        this.callbacks?.onError(err.message || 'Failed to start audio playback');
      }
    }
  }

  public async play(): Promise<void> {
    if (this.audio && typeof this.audio.play === 'function') {
      try {
        await this.audio.play();
      } catch (err: any) {
        console.error('[AudioEngine] Play failed:', err);
      }
    }
  }

  public pause(): void {
    if (this.audio && typeof this.audio.pause === 'function') {
      this.audio.pause();
    }
  }

  public seekTo(seconds: number): void {
    if (this.audio && Number.isFinite(seconds)) {
      this.audio.currentTime = seconds;
    }
  }

  private updateMediaSessionMetadata(track: Track) {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: track.title,
        artist: track.artist.name,
        album: track.album?.title || 'Aura Stream',
        artwork: track.artworkUrl
          ? [
              {
                src: track.artworkUrl,
                sizes: '512x512',
                type: 'image/jpeg',
              },
            ]
          : [],
      });
    } catch {
      // Ignore
    }
  }

  private updateMediaSessionPlaybackState(state: 'playing' | 'paused') {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    try {
      navigator.mediaSession.playbackState = state;
    } catch {
      // Ignore
    }
  }

  private updateMediaSessionPositionState(position: number, duration: number) {
    if (
      typeof navigator === 'undefined' ||
      !('mediaSession' in navigator) ||
      !('setPositionState' in navigator.mediaSession)
    )
      return;
    if (duration > 0 && position <= duration) {
      try {
        navigator.mediaSession.setPositionState({
          duration: duration,
          playbackRate: this.audio.playbackRate || 1,
          position: position,
        });
      } catch {
        // Ignore minor discrepancies
      }
    }
  }
}

// Global application-level singleton instance
export const audioEngine = new AudioEngine();
