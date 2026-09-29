# Testing & Quality Verification Strategy

## 1. Test Matrix

| Layer | Target | Framework | Focus |
| :--- | :--- | :--- | :--- |
| **Mobile State** | Zustand Stores (Player, Queue, Auth) | Jest | Deterministic state transitions, queue advance, repeat/shuffle logic |
| **Audio Controller** | Audio Engine Adapter | Jest / Mocks | Audio lifecycle, remote command dispatch, error retry backoff |
| **Mobile UI** | React Native Screens & Components | Jest + React Native Testing Library | Render stability, accessibility, theme consistency |
| **Backend API** | FastAPI Endpoints | Pytest + HTTPX TestClient | Endpoint contract, auth validation, error responses, rate limits |
| **Recommendation**| Scikit-learn Recommender Engine | Pytest | Model candidate generation, similarity metric accuracy, empty-state fallback |
| **E2E / Device** | Physical iPhone 16 | Manual Protocol | Background playback survival, lock-screen scrubbing, Bluetooth AVRCP |

## 2. iPhone 16 Physical Verification Protocol
1. **Background Audio**: Start playback, minimize app to home screen. Verify audio continues without hiccups.
2. **Lock Screen Controls**: Lock phone. Verify Now Playing widget displays track title, artist name, and high-res artwork. Verify play, pause, next, previous, and scrub slider.
3. **Headphone / Bluetooth**: Connect AirPods / Bluetooth headphones. Test hardware stem-clicks / buttons for play/pause and skip.
4. **Queue Auto-Advance**: Let track reach 100% duration. Confirm automatic seamless transition to the next track.
5. **Network Resilience**: Toggle Airplane mode during playback. Verify player detects network stall and recovers gracefully upon reconnection.
