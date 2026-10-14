# Home Surveillance VMS (MERN)

A video management app for home surveillance built with MongoDB, Express, React and Node.

Live view works by having MediaMTX pull each camera's RTSP stream and republish it as HLS, which the React client plays with `hls.js`. MongoDB stores only metadata (users, cameras, recordings), never video.

## Structure

```
server/   Express API (auth, cameras, MediaMTX sync)
client/   React (Vite) app: login, camera list, live view
mediamtx.yml   Media server config
docker-compose.yml   MongoDB + MediaMTX
```

## Quick start

1. Start MongoDB and MediaMTX:
   ```bash
   docker compose up -d
   ```
2. Start the API:
   ```bash
   cd server
   cp .env.example .env     # then edit secrets
   npm install
   npm run dev
   ```
3. Start the client:
   ```bash
   cd client
   npm install
   npm run dev
   ```
4. Open http://localhost:5173, register the first account (it becomes admin), and add a camera with its RTSP URL, e.g. `rtsp://user:pass@192.168.1.50:554/stream1`.

Generate a 32-byte encryption key for `.env`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## API

| Method | Route | Notes |
|---|---|---|
| POST | /api/auth/register | First user becomes admin; later registration is admin-only |
| POST | /api/auth/login | Returns JWT |
| GET | /api/cameras | List cameras with HLS URLs |
| POST | /api/cameras | Admin: add camera, registers it in MediaMTX |
| DELETE | /api/cameras/:id | Admin: remove camera |

## Roadmap

- [x] Phase 1: auth, camera CRUD, encrypted RTSP credentials
- [x] Phase 2: live view via MediaMTX + HLS (basic)
- [ ] Phase 3: segmented recording with FFmpeg, timeline playback, retention job
- [ ] Phase 4: motion detection, events feed, push notifications
- [ ] Phase 5: hardening (HTTPS, 2FA, audit log, authenticated HLS)
- [ ] Phase 6: PWA, backups, health dashboard

## Security notes

- Do not expose cameras, MediaMTX or this app directly to the internet. Use a VPN (WireGuard/Tailscale) or a reverse proxy with auth.
- In this starter, the HLS endpoint (port 8888) is not authenticated. Restrict it to your LAN or add MediaMTX auth before wider use.
- Change `JWT_SECRET` and `CAMERA_KEY` before real use.
