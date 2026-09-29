# Progressive Web App (PWA) Specification & iOS 16 Integration

## 1. iPhone 16 Standalone Experience

Aura Music is architected to run as an installed standalone Progressive Web Application on **iPhone 16** without requiring Apple Developer accounts, Mac hardware, or Xcode.

### Installation Flow
1. Open Aura Music in Safari on iPhone 16 (e.g. `https://aura.local:5173` or public HTTPS URL).
2. Tap the **Share** button (box with upward arrow) in the Safari toolbar.
3. Select **Add to Home Screen**.
4. Launch Aura from the Home Screen:
   - Runs in full standalone display mode without Safari browser chrome or navigation bars.
   - Respects iPhone 16 Dynamic Island and home indicator via `viewport-fit=cover` and CSS safe area variables:
     - `padding-top: env(safe-area-inset-top)`
     - `padding-bottom: env(safe-area-inset-bottom)`

## 2. Web App Manifest & Meta Tags

### Manifest Configuration (`manifest.webmanifest`)
- `display`: `standalone`
- `orientation`: `portrait`
- `theme_color`: `#0a0a0a`
- `background_color`: `#0a0a0a`
- `icons`: standard 192x192 and 512x512 maskable PNGs.

### Apple Safari Meta Tags (`index.html`)
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Aura" />
<link rel="apple-touch-icon" href="/icon-192.png" />
```

## 3. Service Worker & Caching Strategy (`vite-plugin-pwa`)

- **Precached Assets**:
  - Application shell: `index.html`, compiled CSS stylesheets, JS bundles, icons.
- **Runtime Caching**:
  - Image artwork: `StaleWhileRevalidate` with 30-day expiration and 60-entry limit.
  - Track metadata: `NetworkFirst` with 5-second network timeout.
- **Audio Stream Exclusion**:
  - Audio stream URLs are **NOT** precached or intercepted by the service worker to prevent memory bloat and comply with provider streaming licensing.

## 4. iOS Background Audio Playback & Media Session
- **User Gesture Requirement**: Playback must be initiated by an explicit user gesture (tapping Play or selecting a track).
- **Background & Screen-off**: Once initiated, iOS Safari keeps the audio session alive in the background and through screen lock.
- **Lock Screen Controls**: Driven by `navigator.mediaSession` metadata and action handlers (`play`, `pause`, `nexttrack`, `previoustrack`, `seekto`).
