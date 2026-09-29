import TrackPlayer, {
  Capability,
  AppKilledPlaybackBehavior,
  RepeatMode as RNTPRepeatMode,
  Track as RNTPTrack,
  State as RNTPState,
} from 'react-native-track-player';
import { TrackMetadata, RepeatMode } from './types';

let isSetupInitialized = false;

export async function setupPlayerEngine(): Promise<boolean> {
  if (isSetupInitialized) {
    return true;
  }

  try {
    await TrackPlayer.setupPlayer({
      autoHandleInterruptions: true,
    });

    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
        Capability.Stop,
      ],
      compactCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
      ],
      notificationCapabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.SkipToNext,
        Capability.SkipToPrevious,
        Capability.SeekTo,
      ],
    });

    isSetupInitialized = true;
    return true;
  } catch (error: any) {
    // If player was already initialized (e.g. fast refresh during development)
    if (error?.message?.includes('already been initialized')) {
      isSetupInitialized = true;
      return true;
    }
    console.error('[PlayerEngine] Failed to setup TrackPlayer engine:', error);
    return false;
  }
}

export function toRNTPTrack(track: TrackMetadata): RNTPTrack {
  return {
    id: track.id,
    url: track.url,
    title: track.title,
    artist: track.artist,
    album: track.album,
    artwork: track.artwork,
    duration: track.duration,
  };
}

export async function loadQueueAndPlay(tracks: TrackMetadata[], startIndex: number = 0): Promise<void> {
  await setupPlayerEngine();
  await TrackPlayer.reset();
  const rntpTracks = tracks.map(toRNTPTrack);
  await TrackPlayer.add(rntpTracks);
  if (startIndex > 0 && startIndex < tracks.length) {
    await TrackPlayer.skip(startIndex);
  }
  await TrackPlayer.play();
}

export async function playTrackImmediate(track: TrackMetadata): Promise<void> {
  await setupPlayerEngine();
  await TrackPlayer.reset();
  await TrackPlayer.add(toRNTPTrack(track));
  await TrackPlayer.play();
}

export async function setPlayerRepeatMode(mode: RepeatMode): Promise<void> {
  switch (mode) {
    case 'track':
      await TrackPlayer.setRepeatMode(RNTPRepeatMode.Track);
      break;
    case 'queue':
      await TrackPlayer.setRepeatMode(RNTPRepeatMode.Queue);
      break;
    case 'off':
    default:
      await TrackPlayer.setRepeatMode(RNTPRepeatMode.Off);
      break;
  }
}
