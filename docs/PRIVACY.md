# Privacy Architecture & Data Minimization

## 1. Zero-PII Policy

This application is strictly ad-free and privacy-first. We collect the bare minimum telemetry required to deliver audio streams, retain playlists, and provide relevant track recommendations.

| Category | Policy | Implementation |
| :--- | :--- | :--- |
| **Real Identity** | NEVER COLLECTED | No name, email, phone number, address, or social logins |
| **Authentication** | Anonymous | Firebase Anonymous Authentication (`uid` only) |
| **Device Identifiers** | NEVER COLLECTED | No IDFA (Identifier for Advertisers), IDFV tracking, IMEI, MAC address |
| **Location Data** | NEVER COLLECTED | No GPS, coarse location, or Wi-Fi network scanning |
| **Advertising / SDKs** | ZERO | No Facebook SDK, Google AdMob, Adjust, Branch, or tracking pixels |
| **Behavioral Logs** | Pseudonymous Only | Only music events (play, pause, like, playlist add) linked to anonymous `uid` |

## 2. User Data Lifecycle & Deletion

Users have full autonomy over their data:
- **Anonymous Session**: Users can generate a fresh anonymous identity at any time.
- **Data Erasure**: Invoking `DELETE /v1/me` atomically wipes:
  - Firestore user record
  - User's created playlists
  - User's likes and playback history
  - Historical recommendation interaction rows in analytics caches
- **No Residual Profiling**: Deleted user hashes are never cross-referenced or retained in ghost graphs.
