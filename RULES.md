# Permanent Engineering Rules & Architecture Discipline

These rules govern all architectural, design, and code contributions to this repository. All agents and human contributors must adhere strictly to these principles.

## 1. Domain & Content Compliance
- **Permitted Sources Only**: Use strictly licensed, permitted music sources (e.g. Jamendo, Free Music Archive, Audius, or direct authorized CC streams).
- **Zero Copyright Infringement**: Never scrape, rip, proxy, download, or reverse-engineer YouTube, Spotify, Apple Music, SoundCloud, or any other proprietary copyrighted services.
- **Provider Abstraction**: All music provider integrations must reside behind a clean interface/adapter pattern (`MusicProviderAdapter`). No provider-specific leaks into UI or storage models.

## 2. Privacy & Data Minimization
- **Default Identity**: Firebase Anonymous Authentication. No sign-up barriers, passwords, or emails required to stream.
- **Strictly No PII**: Never request or persist real names, phone numbers, email addresses, physical addresses, contacts, advertising identifiers (IDFA/GAID), or precise geolocation.
- **Zero Third-Party Trackers**: No analytics SDKs (Google Analytics, Firebase Analytics with tracking, Facebook SDK, Adjust, AppsFlyer), no tracking pixels, no ad networks.
- **Pseudonymous Interaction Telemetry**: All behavioral events (search, play, meaningful duration, skip, completion, like) are keyed strictly by pseudonymous ID (`userId`).
- **Right to Erasure**: Complete purge of all user records, likes, history, and playlists upon user request via an automated endpoint (`DELETE /v1/me`).

## 3. Audio & Player Integrity (iOS First)
- **Decoupled Audio Engine**: The audio playback controller lives outside the React component lifecycle at the application root / native boundary. Never instantiate audio player instances inside screens or navigation routes.
- **Native iOS Background Playback**: Utilize native iOS background audio modes (`audio` in UIBackgroundModes) via `react-native-track-player`. No JS timer hacks or headless keepalive tricks.
- **Lock-Screen & Remote Commands**: Lock-screen playback metadata (Now Playing info), Remote Command Center (play, pause, next, prev, seek), and Bluetooth/CarPlay AVRCP signals must be handled deterministically.
- **State Separation**:
  - UI State (local ephemeral screen state, animations, tabs)
  - Playback State (Zustand: active track, queue, status, position, buffering, shuffle, repeat)
  - Server State (TanStack Query: cached network calls, invalidate on mutations)
  - Persistent State (AsyncStorage/SecureStore: preferences, offline fallback queue)

## 4. Backend & Data Architecture
- **Versioned APIs**: All HTTP endpoints live under `/v1/...`.
- **FastAPI + Pydantic**: Strict typing, data validation, and automated OpenAPI documentation.
- **Firestore as Document Store**: User metadata, playlists, interaction logs, and track catalog metadata.
- **Audio File Separation**: Firebase is NOT the audio storage or CDN layer. Audio streams stream directly from permitted content delivery networks / provider audio URLs.
- **Redis as Cache**: Redis is ephemeral cache and fast session state, never the system of record.
- **Replaceable Recommendation Engine**: Stage 1 (heuristic/trending/recent), Stage 2 (content similarity), Stage 3 (collaborative filtering), Stage 4 (hybrid). Logic must remain modular and independently deployable.

## 5. Mobile Build & Windows Workflow
- **No Local Mac**: Development is driven on Windows 11. iOS native builds and testing are run via Expo Application Services (EAS Build / EAS Update).
- **Expo Config Plugins**: All native iOS capabilities (background modes, audio session categories, lock-screen remote controls) are configured declaratively in `app.json` / `app.config.ts` via plugins.
- **Secrets Management**: Provider API keys, Firebase service accounts, and EAS tokens must never be hardcoded or bundled into the client app bundle. Client-side secrets use EAS secret injection or runtime backend proxying.

## 6. Engineering Quality
- **Strict TypeScript & Python Type Hinting**: No `any` escapes in TypeScript; use `mypy` / `pyright` clean types in Python.
- **Automated Verification**: Linting, unit tests, and schema validation must pass before code commits.
