# Aura Music

Privacy-first, ad-free music streaming & discovery Progressive Web Application (PWA) engineered for **iPhone 16** (Safari → Add to Home Screen), developed entirely from **Windows 11**.

No Mac, Xcode, Apple Developer accounts, or native mobile wrappers (React Native / Expo / Swift) are used.

## Architecture Highlights
- **PWA Frontend (`frontend/`)**: React, TypeScript, Vite, Tailwind CSS, React Router, Zustand, TanStack Query, `vite-plugin-pwa`.
- **Audio Architecture**: Single application-level `HTMLAudioElement` singleton in `src/audio/audioEngine.ts` decoupled from screen navigation, integrated with the `Media Session API` for iOS lock-screen controls, Control Center, and background playback.
- **Backend (`backend/`)**: Asynchronous, containerized Python FastAPI service exposing `/api/v1` routes with provider abstraction (`MusicProvider`), Scikit-Learn content recommendation, and privacy right-to-erasure (`DELETE /api/v1/me`).
- **Data & Caching**: Firestore as system of record for user profiles, playlists, and catalog metadata. Redis for recommendation, search, and trending caches.
- **Privacy Model**: Zero-PII guarantee (no names, emails, phone numbers, location, or advertising IDs). 100% ad-free with zero third-party trackers.

## Directory Structure
```
├── frontend/                # Vite React TypeScript PWA
│   ├── vite.config.ts       # Vite configuration with PWA manifest & Workbox precaching
│   ├── index.html           # iOS Safari PWA meta tags (standalone, status-bar, viewport-fit)
│   ├── src/
│   │   ├── audio/           # HTMLAudioElement singleton & MediaSession API bridge
│   │   ├── store/           # Zustand player controller store (queue, shuffle, repeat)
│   │   ├── services/        # TanStack Query API client & permitted CC stream catalog
│   │   ├── components/      # UI components (MiniPlayer, FullPlayerModal, BottomNav, TrackRow)
│   │   ├── pages/           # Primary views (HomePage, SearchPage, LibraryPage)
│   │   └── App.tsx          # Root routing and player initialization
│   └── package.json
├── backend/                 # FastAPI Python Backend
│   ├── app/
│   │   ├── api/v1/          # Versioned REST endpoints (/api/v1)
│   │   ├── adapters/        # MusicProvider abstraction interface
│   │   ├── services/        # Scikit-Learn TF-IDF recommendation engine
│   │   ├── models/          # Pydantic schemas (Track, User, Telemetry)
│   │   └── core/            # Configuration & settings
│   ├── tests/               # Pytest automated test suite
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile           # Backend containerization
├── docs/                    # Technical & Architectural Documentation
│   ├── ARCHITECTURE.md      # High-level architecture & data flow
│   ├── API.md               # Versioned REST API documentation
│   ├── DATA_MODEL.md        # Firestore document schema & IndexedDB offline models
│   ├── PLAYER_ARCHITECTURE.md # Audio engine, lock-screen & background playback
│   ├── RECOMMENDATION.md    # Multi-stage Scikit-Learn recommendation architecture
│   ├── PRIVACY.md           # Zero-PII policy & right to erasure
│   ├── PWA.md               # PWA manifest, service worker, and iOS 16 integration
│   ├── DEPLOYMENT.md        # Windows 11 development and iPhone 16 testing guide
│   └── TESTING.md           # Verification protocol for physical iPhone 16
└── RULES.md                 # Permanent engineering rules
```

## Running Locally on Windows 11

### 1. Frontend PWA
```powershell
cd frontend
npm install
npm run build    # Verify type-checking & PWA bundle generation
npm run dev -- --host
```
Vite will expose the app on your local network (e.g. `http://192.168.1.X:5173`).

### 2. Backend API
```powershell
# From repository root
python -m pytest backend/tests   # Run 11 automated API tests
uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

## Installing on iPhone 16
1. Connect your iPhone 16 to the same Wi-Fi network as your Windows 11 PC (or use a secure tunnel via `npx localtunnel --port 5173`).
2. Open Safari on iPhone 16 and navigate to the frontend URL.
3. Tap the **Share** button in Safari → select **Add to Home Screen**.
4. Tap the **Aura** icon on your Home Screen.
5. Experience the standalone, ad-free music player with lock-screen media controls and background playback!
