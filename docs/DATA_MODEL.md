# Data Models & Schemas

## 1. Firestore Document Hierarchy (Backend Source of Truth)

Firestore collections are organized around pseudonymous user references and provider-agnostic music entities:

```
users/{userId}
  ├── profile (document)
  ├── library (subcollection)
  │     ├── likes/{trackId}
  │     └── history/{eventId}
  └── playlists/{playlistId}
        └── tracks/{trackItem}

tracks/{trackId} (catalog metadata cache)
artists/{artistId}
albums/{albumId}

events/{eventId} (pseudonymous interaction stream)
```

## 2. Core Entities

### User Document (`users/{userId}`)
```typescript
interface UserProfile {
  userId: string;          // Anonymous Firebase UID
  createdAt: string;       // ISO 8601
  preferences: {
    audioQuality: 'normal' | 'high';
    privateSession: boolean;
  };
}
```

### Track Metadata (`tracks/{trackId}`)
```typescript
interface Track {
  id: string;              // e.g. "trk_cc_01"
  title: string;
  artist: {
    id: string;
    name: string;
  };
  album?: {
    id: string;
    title: string;
  };
  durationSeconds: number;
  audioUrl: string;        // Direct audio CDN URL
  artworkUrl?: string;     // High-res image URL
  license: string;         // e.g. "Creative Commons CC-BY 4.0"
  sourceProvider: string;  // e.g. "creative_commons"
  genre: string[];
  tags: string[];
}
```

### Interaction Telemetry (`events/{eventId}`)
Used strictly to power recommendations without collecting PII:
```typescript
interface InteractionEvent {
  eventType: 'search' | 'play_start' | 'listen_30s' | 'complete' | 'skip' | 'like' | 'add_to_playlist';
  trackId: string;
  timestamp: string;
  playbackDurationSeconds: number;
  completed: boolean;
}
```

## 3. PWA Client Offline Persistence (IndexedDB & LocalStorage)
- `aura_likes`: List of track IDs marked as favorites.
- `aura_recent`: List of the last 20 played tracks with full metadata for offline replay.
- `aura_preferences`: Client playback settings (shuffle, repeat mode).
