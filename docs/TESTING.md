# Testing & Quality Verification Strategy

## 1. Automated Test Matrix

| Layer | Target | Framework | Command | Focus |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend State** | Zustand `playerStore` | Vitest | `npm test` (in `frontend/`) | Queue management, repeat modes (`off`, `queue`, `track`), shuffle, likes persistence |
| **Frontend Static** | TypeScript & Oxlint | `tsc -b --noEmit` & `oxlint` | `npm run typecheck && npm run lint` | Strict type validation, zero warnings, dead-code detection |
| **Frontend Build** | Vite + PWA Plugin | Vite | `npm run build` | Asset bundling, Workbox service worker precache, PWA manifest generation |
| **Backend API** | FastAPI (`/api/v1`) | Pytest + HTTPX AsyncClient | `python -m pytest backend/tests` | Catalog search, stream URLs, telemetry ingestion, security headers, privacy erasure |
| **Recommendation**| Scikit-learn Engine | Pytest | `python -m pytest backend/tests` | Content similarity TF-IDF vectorizer, candidate ranking, self-exclusion |

---

## 2. iPhone 16 Physical Verification Protocol

Use this manual checklist to validate native iOS Safari and standalone PWA behavior on a physical iPhone 16:

- [ ] **1. Safari Playback**:
  - Open Safari on iPhone 16.
  - Navigate to Aura URL (`https://...` or local network IP).
  - Tap any track to initiate playback (user gesture).
  - Verify audio starts cleanly with no lag or distorted buffering.
- [ ] **2. Add to Home Screen**:
  - Tap the Safari **Share** icon.
  - Tap **Add to Home Screen**.
  - Verify Aura app icon appears correctly with dark theme branding.
- [ ] **3. Home-Screen Standalone Launch**:
  - Launch Aura from the Home Screen.
  - Verify app opens in standalone mode without Safari address bar or navigation buttons.
  - Verify top safe area clears the iPhone 16 Dynamic Island.
  - Verify bottom safe area (`pb-safe`) clears the Home Indicator.
- [ ] **4. Screen Lock & Background Playback**:
  - Start playback, then lock the iPhone 16 screen.
  - Verify audio continues playing without interruption.
  - Verify the Lock Screen displays the Now Playing widget with track title, artist name, and album artwork.
- [ ] **5. Switching Applications**:
  - While music is playing, swipe up to return to Home or switch to another app (e.g. Messages, Notes).
  - Verify audio playback continues uninterrupted in the background.
- [ ] **6. Media Controls (Lock Screen & Control Center)**:
  - From the Lock Screen and Control Center, test the Play and Pause buttons.
  - Verify immediate audio toggle response and button icon synchronization.
- [ ] **7. Scrubber / Seek**:
  - Drag the scrubber slider on the Lock Screen or in the Aura Full Player.
  - Verify playback position jumps smoothly to the selected timestamp.
- [ ] **8. Next / Previous Track**:
  - Press the Next button on the Lock Screen / Control Center / Full Player.
  - Verify queue advances to the next track and metadata updates instantly.
  - Press the Previous button to restart the track or return to the preceding track.
- [ ] **9. Bluetooth / Headphone Controls**:
  - Connect AirPods or Bluetooth headphones.
  - Squeeze / tap the headphone stem or press hardware play/pause.
  - Verify play/pause and track skip actions are recognized via `navigator.mediaSession`.
- [ ] **10. Audio Interruption Behavior**:
  - Simulate an interruption (e.g., incoming phone call, Siri activation, or navigation audio prompt).
  - Verify Aura audio ducks/pauses during the prompt and resumes when permitted.
- [ ] **11. Network Loss & Recovery**:
  - Toggle Airplane Mode during playback.
  - Verify player displays graceful loading/error state without freezing.
  - Re-enable Wi-Fi / cellular: verify playback resumes upon reconnection.
