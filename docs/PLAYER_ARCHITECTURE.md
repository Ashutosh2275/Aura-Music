# PWA Audio Player Architecture

## 1. Unidirectional Data Flow

```
[React UI: Home / Search / Library / MiniPlayer / FullPlayerModal]
                   │
                   ▼ (actions: playTrack, pause, seekTo, skipNext)
        [Zustand Player Controller Store]
                   │
                   ▼ (imperative media engine calls)
       [AudioEngine Singleton (HTMLAudioElement)]
          ├── Audio Event Listeners (play, pause, timeupdate, ended)
          └── Media Session API Adapter
                   │
                   ▼
     [iOS Safari / iPhone 16 Media Session]
       ├── Lock Screen Now Playing Widget
       ├── Dynamic Island / Control Center
       └── Remote Action Handlers (play, pause, nexttrack, previoustrack, seekto)
```

## 2. Hard Architectural Invariants

1. **Single Audio Instance Across Navigation**:
   - The `HTMLAudioElement` is initialized as a module-level singleton in `src/audio/audioEngine.ts`.
   - Navigating between pages (`/`, `/search`, `/library`) never re-creates or unmounts the audio element.
2. **iOS Safari Background & Lock-Screen Playback**:
   - iOS Safari natively allows audio to continue playing when the screen locks or when switching tabs **provided playback was initiated via a user gesture** (tap/click).
   - `MediaSession` metadata is updated synchronously with track switches:
     - `title`, `artist`, `album`, `artwork`
   - Action handlers (`play`, `pause`, `nexttrack`, `previoustrack`, `seekbackward`, `seekforward`, `seekto`) are wired to the global audio engine.
3. **No Force-Quit Bypass Claims**:
   - If the user swipes away Safari or force-quits the PWA from the iOS App Switcher, playback stops per iOS security policy. No hacks or broken headless workarounds are attempted.
4. **No Service Worker Audio Hacks**:
   - The service worker is never used to buffer, proxy, or play audio. Audio is handled natively by the browser's hardware-accelerated media pipeline.
5. **State Ownership**:
   - **Player Controller (Zustand)** owns: current track, active queue, queue index, status (`idle` | `loading` | `playing` | `paused` | `error`), duration, position, shuffle, repeat mode (`off` | `track` | `queue`).
   - UI components only subscribe to reactive state slices.
