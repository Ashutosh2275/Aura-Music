import type { Track, Artist, Album } from '../audio/types';
import { PERMITTED_TRACKS } from './mockData';
import { getCurrentUserId, deleteUserFirebaseData } from './firebase';

const API_BASE = '/api/v1';

function getAuthHeaders(): Record<string, string> {
  const uid = getCurrentUserId();
  return {
    'Content-Type': 'application/json',
    ...(uid ? { Authorization: `Bearer ${uid}` } : {}),
  };
}

function mapBackendTrack(raw: any): Track {
  return {
    id: raw.id,
    title: raw.title,
    artist: raw.artist,
    album: raw.album,
    duration: raw.duration ?? raw.duration_seconds ?? 0,
    audioUrl: raw.audioUrl ?? raw.audio_url,
    artworkUrl: raw.artworkUrl ?? raw.artwork_url,
    license: raw.license,
    sourceProvider: raw.sourceProvider ?? raw.source_provider ?? 'creative_commons',
    genre: raw.genre ?? [],
    tags: raw.tags ?? [],
  };
}

export async function fetchTrendingTracks(): Promise<Track[]> {
  try {
    const res = await fetch(`${API_BASE}/trending`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    return Array.isArray(data) ? data.map(mapBackendTrack) : PERMITTED_TRACKS;
  } catch {
    return PERMITTED_TRACKS;
  }
}

export async function fetchRecommendations(): Promise<Track[]> {
  try {
    const res = await fetch(`${API_BASE}/recommendations`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    return Array.isArray(data) ? data.map(mapBackendTrack) : [PERMITTED_TRACKS[2], PERMITTED_TRACKS[0]];
  } catch {
    return [PERMITTED_TRACKS[2], PERMITTED_TRACKS[0], PERMITTED_TRACKS[3]];
  }
}

export async function searchCatalog(query: string): Promise<Track[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    return Array.isArray(data.tracks) ? data.tracks.map(mapBackendTrack) : [];
  } catch {
    const q = query.toLowerCase();
    return PERMITTED_TRACKS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.artist.name.toLowerCase().includes(q) ||
        t.genre?.some((g) => g.toLowerCase().includes(q))
    );
  }
}

export async function fetchArtist(artistId: string): Promise<Artist | null> {
  try {
    const res = await fetch(`${API_BASE}/artists/${artistId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    return {
      ...data,
      tracks: Array.isArray(data.tracks) ? data.tracks.map(mapBackendTrack) : [],
    };
  } catch {
    const artistTracks = PERMITTED_TRACKS.filter((t) => t.artist.id === artistId);
    if (artistTracks.length === 0) return null;
    return {
      id: artistId,
      name: artistTracks[0].artist.name,
      bio: 'Independent artist contributing to open-access streaming catalogs.',
      artworkUrl: artistTracks[0].artworkUrl,
      tracks: artistTracks,
    };
  }
}

export async function fetchAlbum(albumId: string): Promise<Album | null> {
  try {
    const res = await fetch(`${API_BASE}/albums/${albumId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Network error');
    const data = await res.json();
    return {
      ...data,
      tracks: Array.isArray(data.tracks) ? data.tracks.map(mapBackendTrack) : [],
    };
  } catch {
    const albumTracks = PERMITTED_TRACKS.filter((t) => t.album && t.album.id === albumId);
    if (albumTracks.length === 0) return null;
    return {
      id: albumId,
      title: albumTracks[0].album?.title || 'Album',
      artist: albumTracks[0].artist,
      artworkUrl: albumTracks[0].artworkUrl,
      tracks: albumTracks,
      releaseDate: '2024',
    };
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
      headers: getAuthHeaders(),
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
  } catch {
    // Silent fail for telemetry to avoid disrupting playback
  }
}

export async function deleteUserData(): Promise<boolean> {
  try {
    await deleteUserFirebaseData();
    const res = await fetch(`${API_BASE}/me`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    localStorage.removeItem('aura_likes');
    localStorage.removeItem('aura_recent');
    return res.ok;
  } catch {
    localStorage.removeItem('aura_likes');
    localStorage.removeItem('aura_recent');
    return true;
  }
}
