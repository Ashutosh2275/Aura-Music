import TrackPlayer, { Event } from 'react-native-track-player';

/**
 * Service callback registered with TrackPlayer.registerPlaybackService.
 * Handles remote lock-screen, Dynamic Island, Notification Center, and Bluetooth AVRCP events.
 */
export async function playbackService(): Promise<void> {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    TrackPlayer.skipToNext().catch((err) => {
      console.warn('[PlaybackService] Skip to next failed:', err);
    });
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    TrackPlayer.skipToPrevious().catch((err) => {
      console.warn('[PlaybackService] Skip to previous failed:', err);
    });
  });

  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => {
    TrackPlayer.seekTo(event.position);
  });

  TrackPlayer.addEventListener(Event.RemoteStop, () => {
    TrackPlayer.stop();
  });

  TrackPlayer.addEventListener(Event.RemoteDuck, (event) => {
    if (event.paused || event.permanent) {
      TrackPlayer.pause();
    } else {
      TrackPlayer.play();
    }
  });

  TrackPlayer.addEventListener(Event.PlaybackError, (error) => {
    console.error('[PlaybackService] Native playback error encountered:', error);
  });
}
