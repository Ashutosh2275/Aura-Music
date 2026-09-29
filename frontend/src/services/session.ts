import { updateActivePlaybackSession, subscribeToActivePlaybackSession, getCurrentUserId } from './firebase';
import { audioEngine } from '../audio/audioEngine';

// Stable device ID stored in localStorage
export function getDeviceId(): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    let devId = window.localStorage.getItem('aura_device_id');
    if (!devId) {
      devId = 'dev_' + Math.random().toString(36).substring(2, 12);
      window.localStorage.setItem('aura_device_id', devId);
    }
    return devId;
  }
  return 'dev_default';
}

let currentSessionId: string | null = null;
let heartbeatInterval: any = null;
let unsubscribeSessionListener: (() => void) | null = null;
let onRemoteSupersededCallback: (() => void) | null = null;

export function setRemoteSupersededCallback(cb: () => void) {
  onRemoteSupersededCallback = cb;
}

export function startPlaybackSession(trackId: string) {
  const uid = getCurrentUserId();
  if (!uid) return;

  const deviceId = getDeviceId();
  currentSessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

  // 1. Write active playback session to Firestore
  updateActivePlaybackSession(currentSessionId, deviceId, trackId, 'active').catch(() => {});

  // 2. Clear old heartbeat
  if (heartbeatInterval) clearInterval(heartbeatInterval);

  // 3. Heartbeat every 15 seconds while playing
  heartbeatInterval = setInterval(() => {
    if (currentSessionId) {
      updateActivePlaybackSession(currentSessionId, deviceId, trackId, 'active').catch(() => {});
    }
  }, 15000);

  // 4. Listen for other devices taking over
  if (unsubscribeSessionListener) unsubscribeSessionListener();
  unsubscribeSessionListener = subscribeToActivePlaybackSession((remoteSession) => {
    if (
      remoteSession &&
      remoteSession.status === 'active' &&
      remoteSession.sessionId !== currentSessionId
    ) {
      // Another device/tab has taken over active playback!
      stopActiveSessionLocally();
      audioEngine.pause();
      if (onRemoteSupersededCallback) {
        onRemoteSupersededCallback();
      }
    }
  });
}

export function pausePlaybackSession(trackId: string) {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
  if (currentSessionId) {
    const deviceId = getDeviceId();
    updateActivePlaybackSession(currentSessionId, deviceId, trackId, 'paused').catch(() => {});
  }
}

export function stopActiveSessionLocally() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}
