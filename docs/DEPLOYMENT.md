# Deployment & Build Architecture (Windows 11 → iOS EAS)

## 1. Development & Native Build Topology

Because the development environment is Windows 11 without a local macOS workstation or Xcode, all iOS native binary compilation occurs in cloud-managed infrastructure via **Expo Application Services (EAS Build)**.

```
[Windows 11 Dev Workstation]
       │
       ├── Code Editing (VS Code / Antigravity)
       ├── Type Checking (`tsc`) & Unit Tests (`jest`, `pytest`)
       ├── Expo Config Plugins (`app.json` / `app.config.ts`)
       │
       ▼
   [EAS CLI (`eas build --platform ios --profile development`)]
       │
       ▼
[Expo Cloud macOS Runners (Automated Xcode compilation)]
       │
       ▼
[Apple Developer Portal (Provisions, Certificates, iPhone 16 UDID)]
       │
       ▼
[iOS Ad-hoc / Development Build Artifact (.ipa)]
       │
       ▼
[Physical iPhone 16 (Installed via QR Code / Apple Configurator)]
```

## 2. EAS Build Configuration (`eas.json`)
- **`development` Profile**: Produces an internal development client build (`.ipa`) registered to the human developer's physical iPhone 16 UDID. Enables hot reloading and JS debugging on device with full native audio libraries.
- **`preview` Profile**: Ad-hoc distribution builds for staging.
- **`production` Profile**: App Store Connect distribution builds.

## 3. Backend Deployment
- **Containerization**: Backend packaged via Docker (`Dockerfile`).
- **Cloud Run / Container PaaS**: Scalable, serverless container execution for FastAPI.
- **Secrets Management**: Backend secrets (Firebase Service Account, Redis credentials, Jamendo API Client ID) are supplied via environment variables at runtime, never bundled into mobile app binaries.
