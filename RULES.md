# Permanent Engineering Rules & Architecture Discipline

These rules govern all architectural, design, and code contributions to Aura Music. All agents and human contributors must adhere strictly to these principles.

## 1. Platform & Tooling Constraints
- **PWA Only**: Do NOT build a native iOS application. Do NOT introduce React Native, Expo, Swift, Xcode, or Apple Developer tooling.
- **Windows 11 Sufficient**: All development and local testing must be fully executable from a Windows 11 host.
- **iPhone 16 Safari Target**: The application must be installable through Safari → Add to Home Screen as a standalone PWA.
- **No Force-Quit Hacks**: Never attempt to bypass iOS browser/PWA lifecycle restrictions. Never claim guaranteed playback after a user force-quits the PWA/browser process.

## 2. Audio Engine & Media Session Architecture
- **Single Application-Level Audio Engine**: Use one application-level audio engine (`src/audio/audioEngine.ts`) wrapping `HTMLAudioElement`.
- **Never Recreate Audio on Navigation**: The audio element must not be recreated or interrupted when navigating between screens.
- **No Service Worker Audio**: Do NOT use service workers to implement or proxy the audio engine. Audio runs on the browser's hardware-accelerated media pipeline.
- **Media Session Integration**: Synchronize track metadata (`title`, `artist`, `album`, `artwork`) with `navigator.mediaSession` and implement action handlers (`play`, `pause`, `nexttrack`, `previoustrack`, `seekbackward`, `seekforward`, `seekto`).
- **Progressive Enhancement**: If Media Session is unavailable, player must still function normally.

## 3. Domain & Content Compliance
- **Permitted Sources Only**: Use strictly licensed, permitted music sources (e.g. Jamendo, Free Music Archive, Audius, or authorized Creative Commons streams).
- **Zero Copyright Infringement**: Never scrape, rip, proxy, download, or reverse-engineer YouTube, Spotify, Apple Music, SoundCloud, or any other proprietary copyrighted services.
- **Provider Abstraction**: All provider-specific logic stays behind `MusicProvider` (`search_tracks`, `get_track`, `get_artist`, `get_album`, `get_stream`, `get_trending`) in the backend. Never expose provider secrets in frontend code.

## 4. Privacy & Data Minimization
- **Default Identity**: Firebase Anonymous Authentication.
- **Strictly No PII**: Never collect or persist name, phone number, address, location, contacts, or advertising IDs.
- **Zero Third-Party Trackers**: No ads, ad SDKs, tracking pixels, or invasive analytics.
- **Pseudonymous Interaction Telemetry**: Behavioral events (`search`, `play_start`, `listen_30s`, `complete`, `skip`, `like`, `add_to_playlist`) use pseudonymous user IDs.
- **Right to Erasure**: Complete purge of all user records, likes, history, and playlists via `DELETE /api/v1/me`.

## 5. Backend & Data Architecture
- **Versioned APIs**: All HTTP endpoints live under `/api/v1/...`.
- **FastAPI + Pydantic**: Strict typing, data validation, and automated OpenAPI documentation.
- **Firestore as Source of Truth**: User metadata, playlists, interaction logs, and track catalog metadata. Never store audio files in Firestore.
- **Redis as Cache**: Redis is hot cache (recommendation cache, trending cache, search cache, rate limiting), never the system of record.
- **Replaceable Recommendation Engine**: Stage 1 (heuristic/trending/recent), Stage 2 (content similarity using Scikit-Learn TF-IDF). Keep candidate generation and ranking separate. Do not use LLMs or deep learning.
- **Separately Deployable**: Frontend and backend are separately deployable.

## 6. Engineering Quality
- **Strict TypeScript & Python Type Hinting**: No `any` escapes in TypeScript; use clean types in Python.
- **Automated Verification**: Linting, unit tests, and schema validation must pass before code commits.
