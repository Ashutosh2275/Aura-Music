# System Architecture

## 1. High-Level Architecture Overview

**Aura Music** is a minimal, privacy-first, ad-free music streaming and discovery Progressive Web Application (PWA) engineered specifically for **iPhone 16** (Safari → Add to Home Screen), developed entirely from a **Windows 11** development workstation.

```mermaid
flowchart TD
    subgraph Client["iPhone 16 PWA Client (Safari Standalone)"]
        UI["React UI (Home, Search, Library, Mini & Full Player)"]
        State["State Layer (Zustand & TanStack Query)"]
        PlayerController["Global Player Controller (Store)"]
        AudioEngine["Audio Engine Singleton (HTMLAudioElement)"]
        MediaSession["Media Session API (iOS Lock Screen / Control Center)"]
        SW["Service Worker (App Shell Precache & Offline Fallback)"]
        
        UI --> State
        UI --> PlayerController
        PlayerController --> AudioEngine
        AudioEngine --> MediaSession
    end

    subgraph CDN["Permitted Music Streaming CDN"]
        CCStream["Direct Licensed / CC Audio Stream CDN"]
    end

    subgraph Backend["Scalable Backend (FastAPI / Python 3.11)"]
        API["FastAPI Gateway (/api/v1)"]
        Provider["MusicProvider Adapter Abstraction"]
        RecEngine["Scikit-Learn Recommendation Engine"]
        UserSvc["Pseudonymous User & Library Service"]
        EventSvc["Minimal Telemetry Logger"]
        
        API --> Provider
        API --> RecEngine
        API --> UserSvc
        API --> EventSvc
        Provider --> CCStream
    end

    subgraph Storage["Persistence & Caching"]
        Firestore["Firestore (User Libraries, Playlists, Tracks)"]
        Redis["Redis (Cache, Trending, Rate Limits)"]
        Auth["Firebase Anonymous Authentication"]
        
        Backend --> Firestore
        Backend --> Redis
        Backend --> Auth
    end

    AudioEngine -->|Direct Audio Stream (MP3 / AAC)| CCStream
```

## 2. Core Architectural Pillars

### PWA & Client-Side Media Pipeline
1. **Single Application-Level Audio Engine**:
   - One global `HTMLAudioElement` instance lives in `src/audio/audioEngine.ts`.
   - Audio is decoupled from React component tree renders; route navigation (`/`, `/search`, `/library`) never destroys or re-instantiates the audio element.
2. **Media Session API & iOS Lock-Screen**:
   - Updates `navigator.mediaSession.metadata` (title, artist, album, artwork).
   - Binds action handlers (`play`, `pause`, `nexttrack`, `previoustrack`, `seekbackward`, `seekforward`, `seekto`).
   - Progressive enhancement: if Media Session is unsupported, standard HTML5 audio playback continues without disruption.
3. **No Service Worker Audio Hacks**:
   - Audio streaming is handled exclusively by `HTMLAudioElement` on the main media pipeline.
   - Service worker is strictly restricted to caching the application shell (HTML, CSS, JS, icons) and metadata responses.

### Backend & Separation of Concerns
1. **Separately Deployable**: Frontend (Vite static PWA) and Backend (FastAPI container) operate as independently deployable services.
2. **Direct CDN Streaming**: The client streams music directly from authorized CDN URLs. The backend proxies metadata and generates recommendations, never wasting bandwidth proxying heavy audio payloads.
3. **Provider Abstraction**: All external music catalog logic lives behind `MusicProvider` (`search_tracks`, `get_track`, `get_artist`, `get_album`, `get_stream`, `get_trending`).
