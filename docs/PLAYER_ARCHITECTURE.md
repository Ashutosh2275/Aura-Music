# Audio Player Architecture (iOS & React Native)

## 1. Core Principles & Design

The mobile player architecture adheres to a strict unidirectional flow separated completely from React screen renders:

```
[UI Layer / Screens]
       │
       ▼ (actions: play, pause, seek, skip, setQueue)
[Player Controller / Store (Zustand)]
       │
       ▼ (imperative bridge calls)
[Audio Service Engine (react-native-track-player)]
       │
       ▼ (AVPlayer / AVAudioSession)
[Native iOS Audio Subsystem]
       ├── AVAudioSession (Category: .playback, Mode: .default)
       ├── MPNowPlayingInfoCenter (Track metadata, artwork, scrub position)
       └── MPRemoteCommandCenter (Lock-screen & Bluetooth controls)
```

## 2. Decoupling Rules
1. **Never tie player state to screen lifecycles**: Screens only consume reactive Zustand selectors (`usePlayerStore(state => state.currentTrack)`). Leaving a screen or popping navigation never interrupts audio.
2. **Native iOS Background Audio Configuration**:
   - `UIBackgroundModes`: includes `audio`.
   - Native audio session category configured to `playback` with options for mixing and ducking if required.
   - Remote control events (`remote-play`, `remote-pause`, `remote-next`, `remote-previous`, `remote-seek`) registered directly in a background playback service callback (`service.js` / `playbackService.ts`).
3. **Queue & Auto-advance**:
   - Audio tracks are queued in the native player queue.
   - The native player handles smooth gapless transitions to the next item in the queue.
   - Playback state events (`playback-track-changed`, `playback-state`) update the Zustand store and notify the telemetry service asynchronously.

## 3. Remote Control & Lock-Screen Capabilities
- **Play / Pause / Toggle**: Immediate response, updates `MPNowPlayingInfoCenter` playback rate.
- **Next / Previous**: Advances or rewinds in the active queue.
- **Seek / Scrubbing**: Responds to `MPChangePlaybackPositionCommand` to allow scrubbing on the iOS lock screen and Control Center.
- **Artwork Rendering**: High-resolution album artwork loaded into lock screen via URL or local cache.
- **Bluetooth & Car Controls**: Responds to standard AVRCP commands via `MPRemoteCommandCenter`.

## 4. Error Recovery & Network Resilience
- **Stall & Buffering Detection**: Detects `playback-error` or prolonged buffering.
- **Exponential Backoff Retry**: When network drops or audio streams stall, the player initiates up to 3 retry attempts with exponential backoff before transitioning to an error state.
- **Resume on Interruption**: Handles audio session interruptions (incoming phone calls, Siri) gracefully, pausing and automatically resuming if permitted by iOS.
