# Aura Music

Privacy-first, ad-free music streaming and discovery application engineered for iPhone 16 from a Windows 11 host.

## Architecture Highlights
- **Client (iOS / React Native / Expo)**: Decoupled native audio playback using `react-native-track-player`. Configured for iOS `UIBackgroundModes: ["audio"]`, lock-screen scrubbing (`MPNowPlayingInfoCenter`), and remote controls (`MPRemoteCommandCenter`).
- **State Management**: Reactive Zustand player store with complete queue, shuffle, and repeat modes.
- **Backend (Python / FastAPI)**: Asynchronous, containerized micro-service supporting versioned endpoints under `/v1`, privacy right-to-erasure (`DELETE /v1/me`), pseudonymous telemetry, and Scikit-Learn content recommendation.
- **Licensing & Compliance**: Strictly permitted Creative Commons and licensed audio streams. Zero scraping, ripping, or proxying of restricted services.

## Directory Structure
```
├── mobile/                  # React Native + Expo iOS Mobile Client
│   ├── app.json             # Expo configuration (UIBackgroundModes: audio)
│   ├── eas.json             # EAS Build profiles (development client for iPhone 16)
│   ├── src/
│   │   ├── audio/           # Native player engine and background playback service
│   │   ├── store/           # Zustand player & queue store
│   │   ├── services/        # Permitted music catalog service
│   │   └── components/      # UI components (MiniPlayer, FullPlayerModal, Diagnostics)
│   └── App.tsx              # Main entrypoint
├── backend/                 # FastAPI Python Backend
│   ├── app/
│   │   ├── api/v1/          # Versioned REST endpoints
│   │   ├── adapters/        # Music provider abstraction interface
│   │   ├── services/        # Scikit-learn recommendation engine
│   │   └── models/          # Pydantic schemas (Track, User, Telemetry)
│   ├── tests/               # Pytest automated API test suite
│   ├── requirements.txt     # Python dependencies
│   └── Dockerfile           # Backend containerization
├── docs/                    # Architectural Specifications
│   ├── ARCHITECTURE.md      # High-level system architecture
│   ├── API.md               # Versioned REST API documentation
│   ├── DATA_MODEL.md        # Firestore document schema & entities
│   ├── PLAYER_ARCHITECTURE.md # Audio engine, lock-screen & background playback
│   ├── RECOMMENDATION.md    # Multi-stage recommendation architecture
│   ├── PRIVACY.md           # Zero-PII policy & right to erasure
│   ├── DEPLOYMENT.md        # Windows 11 -> EAS cloud build -> iPhone 16 workflow
│   └── TESTING.md           # Verification protocol for physical iPhone 16
└── RULES.md                 # Permanent engineering rules
```

## Running & Verification

### Mobile Development
```bash
cd mobile
# Type check TypeScript
npx tsc --noEmit

# Start Metro dev server
npx expo start
```

### Building for iPhone 16 via EAS (from Windows)
```bash
cd mobile

# 1. Install EAS CLI globally if not already installed
npm install -g eas-cli

# 2. Log in with your Expo account
eas login

# 3. Configure Apple Developer credentials and register your physical iPhone 16 UDID
eas device:create

# 4. Trigger cloud build on Expo macOS runners
eas build --platform ios --profile development
```
After the build completes, download and install the development build `.ipa` directly to your iPhone 16 using the generated QR code or Apple Configurator.
