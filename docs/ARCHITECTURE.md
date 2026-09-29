# System Architecture

## 1. High-Level Overview

This project is a privacy-first, ad-free music streaming and discovery application optimized for iOS (specifically iPhone 16) engineered from a Windows 11 host environment via Expo EAS (Expo Application Services).

```mermaid
flowchart TD
    subgraph Client["iOS Mobile Client (React Native + Expo EAS)"]
        UI["UI Screens (Explore, Search, Library, Player)"]
        State["State Layer (Zustand & TanStack Query)"]
        PlayerController["Global Player Controller Singleton"]
        AudioEngine["Native Audio Engine (react-native-track-player)"]
        NowPlaying["iOS MPRemoteCommandCenter & MPNowPlayingInfoCenter"]
        
        UI --> State
        UI --> PlayerController
        PlayerController --> AudioEngine
        AudioEngine --> NowPlaying
    end

    subgraph ExternalAudio["Permitted Music CDN / Content Providers"]
        Jamendo["Jamendo API / Free Audio CDN"]
        Audius["Audius Decentralized Audio Gateway"]
        Archive["Free Music Archive / Archive.org"]
    end

    subgraph Backend["Scalable Backend (FastAPI / Python 3.11)"]
        API["FastAPI Gateway (/v1)"]
        CatalogSvc["Catalog & Search Service"]
        UserSvc["User & Playlist Service"]
        TelemetrySvc["Pseudonymous Interaction Logger"]
        RecSvc["Recommendation Service (Modular Scikit-Learn Engine)"]
        ProviderAdapter["Music Provider Abstraction Adapter"]
        
        API --> CatalogSvc
        API --> UserSvc
        API --> TelemetrySvc
        API --> RecSvc
        CatalogSvc --> ProviderAdapter
        ProviderAdapter --> ExternalAudio
    end

    subgraph DataLayer["Persistence & Caching"]
        Firestore["Google Cloud Firestore (Metadata & Profiles)"]
        Auth["Firebase Anonymous Auth"]
        Redis["Redis (Hot Caches, Feed Caches, Rate Limits)"]
        
        Backend --> Firestore
        Backend --> Auth
        Backend --> Redis
    end

    AudioEngine -->|Direct Audio Stream (HLS / MP3 / AAC)| ExternalAudio
```

## 2. Architectural Boundaries & Principles

### Separation of Concerns
1. **Client / Audio Engine Isolation**:
   - Audio playback runs as an independent native session (`AVAudioSessionCategoryPlayback`).
   - React components subscribe to playback state via Zustand reactive stores, but never instantiate or control `AVPlayer` instances directly.
   - Background audio, remote control events (lock screen, Bluetooth, Dynamic Island / Now Playing), and queue auto-advance function seamlessly regardless of active UI screens or app minimization.

2. **Data Streaming vs. Metadata**:
   - The backend proxies and standardizes metadata (track title, artist, album art, licensing terms, audio stream URLs) behind a unified schema.
   - The mobile client streams audio **directly** from authorized CDN endpoints. The backend never proxies heavy audio payloads, preserving bandwidth and minimizing latency.

3. **Stateless API & Distributed Cache**:
   - FastAPI backend instances are stateless and containerized.
   - Firestore stores document collections (`users`, `playlists`, `tracks`, `interactions`).
   - Redis caches expensive search queries, catalog lookups, and personalized candidate recommendations with TTL.

4. **Privacy-by-Design**:
   - No PII is collected or stored.
   - Clients authenticate using Firebase Anonymous Auth tokens.
   - All telemetry events are tied to anonymous UID tokens without device fingerprinting or advertising IDs.
