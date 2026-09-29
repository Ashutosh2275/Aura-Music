# API Specification

All backend endpoints are strictly versioned under `/api/v1` and use standard JSON responses and error envelopes.

## Error Envelope
```json
{
  "detail": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Track 'trk_cc_999' not found."
  }
}
```

## 1. Catalog & Search
- **`GET /api/v1/search?q={query}&limit=20&offset=0`**
  - Searches catalog tracks by title, artist, genre, or mood tags.
- **`GET /api/v1/tracks/{id}`**
  - Retrieves track metadata (title, artist, album, duration, audio URL, artwork URL, license).
- **`GET /api/v1/tracks/{id}/stream`**
  - Returns streaming URL, audio format, and bitrate for direct client playback.
- **`GET /api/v1/artists/{id}`**
  - Retrieves artist details, bio, and catalog tracks.
- **`GET /api/v1/albums/{id}`**
  - Retrieves album details and tracklist.
- **`GET /api/v1/trending?limit=20`**
  - Returns currently trending tracks.

## 2. Recommendations & Discovery
- **`GET /api/v1/recommendations?limit=10`**
  - Returns personalized recommended tracks based on pseudonymous interaction history using Scikit-Learn TF-IDF content similarity.

## 3. Library & User State
- **`GET /api/v1/library`**
  - Returns user's liked tracks, playlists, and recently played list.
- **`DELETE /api/v1/me`**
  - **Privacy Right to Erasure**: Permanently wipes user profile, liked tracks, playlists, and historical telemetry rows from Firestore and Redis caches.
  - **Status Code**: `204 No Content`

## 4. Telemetry & Events
- **`POST /api/v1/events`**
  - Records minimal pseudonymous interaction signals (`search`, `play_start`, `listen_30s`, `complete`, `skip`, `like`, `add_to_playlist`).
  - **Payload**:
    ```json
    {
      "events": [
        {
          "event_type": "play_start",
          "track_id": "trk_cc_01",
          "playback_duration_seconds": 32.5,
          "completed": false,
          "source": "trending"
        }
      ]
    }
    ```
