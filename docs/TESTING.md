# Testing & Quality Verification Strategy

## 1. Testing Matrix

| Layer | Target | Framework | Focus |
| :--- | :--- | :--- | :--- |
| **PWA Client Build** | React, TypeScript, Vite, Tailwind | `tsc -b && vite build` | Type-safety, zero compilation errors, PWA service worker asset generation |
| **Audio Engine** | `AudioEngine`, `HTMLAudioElement`, `MediaSession` | Manual & Unit Mock | Media session metadata, play/pause toggles, seek, queue progression |
| **Client State** | Zustand `playerStore` | Manual & Unit | Queue management, repeat modes (`off`, `queue`, `track`), shuffle, likes persistence |
| **Backend API** | FastAPI (`/api/v1`) | Pytest + AsyncClient | Search, catalog endpoints, stream URLs, telemetry events, right-to-erasure |
| **Recommendation**| Scikit-learn Recommender Engine | Pytest | Content similarity matching, cosine similarity ranking, fallback to trending |
| **iPhone 16 Safari** | Physical iPhone 16 | Manual Safari Protocol | Standalone PWA installation, lock-screen controls, background audio continuation |

## 2. iPhone 16 Physical Verification Protocol

1. **Standalone Installation**:
   - Open Safari on iPhone 16, visit Aura Music, tap Share → "Add to Home Screen".
   - Confirm Aura opens from home screen without Safari browser chrome/URL bar.
2. **Dynamic Island & Safe Areas**:
   - Confirm UI elements do not overlap the Dynamic Island at the top or home bar at the bottom.
3. **Audio Playback**:
   - Tap Play on a track. Verify audio streams smoothly from authorized CDN.
4. **Lock-Screen & Background Playback**:
   - Lock iPhone 16. Verify audio continues playing with screen off.
   - Verify lock-screen Now Playing widget shows title, artist, artwork, and scrub bar.
   - Test Play, Pause, Next, Previous from lock screen and Control Center.
5. **Queue Auto-Advance**:
   - Allow track to play to completion or seek to the end. Verify the next queue item begins playing automatically.
6. **Privacy Erasure**:
   - Navigate to Library, click "Delete All My Data". Confirm data is purged.
