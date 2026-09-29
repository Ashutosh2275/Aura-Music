# Data Models & Schemas

## 1. Firestore Document Hierarchy

Firestore collections are organized around pseudonymous user references and provider-agnostic music entities:

```
users/{userId}
  ├── profile (document)
  ├── library (subcollection)
  │     ├── likes/{trackId}
  │     └── history/{eventId}
  └── playlists/{playlistId}
        └── tracks/{trackItem}

tracks/{trackId} (catalog cache)
artists/{artistId}
albums/{albumId}

interactions/{interactionId} (anonymized append-only event stream)
```

## 2. Core Entities

### User Document (`users/{userId}`)
```typescript
interface UserProfile {
  userId: string;          // Anonymous Firebase UID
  createdAt: string;       // ISO 8601
  lastActiveAt: string;    // ISO 8601
  preferences: {
    audioQuality: 'normal' | 'high';
    explicitAllowed: boolean;
  };
}
```

### Track Metadata (`tracks/{trackId}`)
```typescript
interface Track {
  id: string;              // e.g. "jamendo:182940"
  title: string;
  artistId: string;
  artistName: string;
  albumId?: string;
  albumTitle?: string;
  durationSeconds: number;
  streamUrl: string;       // Direct audio CDN URL
  artworkUrl: string;      // Image URL
  genre: string[];
  tags: string[];
  bpm?: number;
  license: string;         // e.g. "Creative Commons BY-NC-SA 4.0"
  provider: 'jamendo' | 'audius' | 'freemusicarchive' | 'custom';
  sourceId: string;
  createdAt: string;
}
```

### Interaction Telemetry (`interactions/{interactionId}`)
Used strictly to power user discovery and the recommendation engine:
```typescript
interface UserInteractionEvent {
  id: string;
  userId: string;          // Anonymous UID
  trackId: string;
  eventType: 'impression' | 'search' | 'play_start' | 'listen_30s' | 'complete' | 'skip' | 'like' | 'unlike' | 'add_to_playlist';
  playbackDurationSeconds: number;
  timestamp: string;       // ISO 8601
  context: 'discovery' | 'search' | 'playlist' | 'queue' | 'recommendations';
}
```

### Playlist Document (`users/{userId}/playlists/{playlistId}`)
```typescript
interface Playlist {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  isPublic: boolean;
  artworkUrl?: string;
  trackCount: number;
  createdAt: string;
  updatedAt: string;
}
```
