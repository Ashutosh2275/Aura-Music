import type { Track } from '../audio/types';
import { PERMITTED_TRACKS } from './mockData';

const API_BASE = '/api/v1';

export async function fetchTrendingTracks(): Promise<Track[]> {
  try {
    const res = await fetch(`${API_BASE}/trending`);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (e) {
    // Graceful offline / fallback to permitted catalog
    return PERMITTED_TRACKS;
  }
}

export async function fetchRecommendations(): Promise<Track[]> {
  try {
    const res = await fetch(`${API_BASE}/recommendations`);
    if (!res.ok) throw new Error('Network error');
    return await res.json();
  } catch (e) {
    return [PERMITTED_TRACKS[2], PERMITTED_TRACKS[0], PERMITTED_TRACKS[3]];
  }
}

export async function searchCatalog(query: string): Promise<Track[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    return data.tracks || [];
  } catch (e) {
    const q = query.toLowerCase();
    return PERMITTED_TRACKS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.name.toLowerCase().includes(q) ||
        t.genre?.some((g) => g.toLowerCase().includes(q))
    );
  }
}

export async function logEvent(
  eventType: string,
  trackId: string,
  playbackDuration: number = 0,
  completed: boolean = false
): Promise<void> {
  try {
    await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        events: [
          {
            event_type: eventType,
            track_id: trackId,
            playback_duration_seconds: playbackDuration,
            completed,
          },
        ],
      }),
    });
  } catch (e) {
    // Silent fail for telemetry to avoid disrupting playback
  }
}

export async function deleteUserData(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/me`, { method: 'DELETE' });
    localStorage.removeItem('aura_likes');
    localStorage.removeItem('aura_recent');
    return res.ok;
  } catch (e) {
    localStorage.removeItem('aura_likes');
    localStorage.removeItem('aura_recent');
    return true;
  }
}
