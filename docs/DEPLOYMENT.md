# Deployment & Testing Architecture (Windows 11 → iPhone 16 PWA)

## 1. Local Development on Windows 11

All development is carried out locally on Windows 11. No Mac, Xcode, or Apple Developer tooling is required.

```
[Windows 11 Development Machine]
       │
       ├── Frontend Dev Server (`npm run dev -- --host`)
       │    └── Serves Vite PWA on local Wi-Fi port (e.g. `http://192.168.1.X:5173`)
       │
       ├── Backend Dev Server (`uvicorn backend.app.main:app --host 0.0.0.0 --port 8000`)
       │    └── Serves FastAPI `/api/v1` routes
       │
       ▼ (Direct Wi-Fi / Local Network or Cloudflare Tunnel)
[Physical iPhone 16 (Safari)]
       │
       └── Tap Share ➔ "Add to Home Screen" ➔ Standalone PWA Installed
```

## 2. Testing on Physical iPhone 16 from Windows 11

### Option A: Local Wi-Fi Network
1. Ensure Windows 11 PC and iPhone 16 are on the same local Wi-Fi network.
2. In Windows terminal, find your local IP address:
   ```powershell
   ipconfig
   # Note IPv4 Address (e.g., 192.168.1.100)
   ```
3. Start frontend with host exposed:
   ```powershell
   cd frontend
   npm run dev -- --host
   ```
4. On iPhone 16, open Safari and navigate to:
   `http://<YOUR_WINDOWS_IP>:5173`
5. Tap Share → **Add to Home Screen**.

### Option B: Cloudflare Tunnel (HTTPS for PWA & Service Workers)
Service workers and Media Session require secure origins (`localhost` or `https://`). For full PWA testing over Wi-Fi, run a zero-setup Cloudflare tunnel:
```powershell
# Using cloudflared or localtunnel
npx localtunnel --port 5173
```
Open the generated `https://*.loca.lt` URL in iPhone 16 Safari.

## 3. Production Deployment

- **Frontend**: Deploy static dist output (`frontend/dist`) to Cloudflare Pages, Vercel, or AWS S3 + CloudFront.
- **Backend**: Deploy containerized FastAPI application via Docker (`backend/Dockerfile`) to Google Cloud Run, Fly.io, or Railway.
- **Data**: Connect Google Cloud Firestore and Redis Cloud via environment variables.
