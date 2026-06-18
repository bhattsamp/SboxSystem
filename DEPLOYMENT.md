# InfyPOS — Windows Server Deployment Guide

Deploys InfyPOS behind a single domain with SSL:

```
Browser
  │  https://sboxsystem.online
  ▼
IIS (site root = infypos-frontend/dist)
  ├─ static files (HTML/JS/CSS/images)           → served directly
  ├─ /api/*       ─┐
  ├─ /socket.io/* ─┼─ reverse proxy ─► Node backend on 127.0.0.1:5000
  ├─ /uploads/*   ─┘                         │
  └─ everything else → /index.html (SPA)     ▼
                                          MongoDB (localhost:27017)
```

This guide is configured for the domain **sboxsystem.online** (already set in `.env.production` and `.env.production.example`).

---

## 1. One-time server prerequisites

Install these on the Windows Server (run as Administrator):

1. **Node.js LTS** (v18 or v20) — https://nodejs.org
2. **MongoDB Community Server** — during install, check **"Install MongoDB as a Service"**.
3. **IIS modules** (required for the reverse proxy):
   - **URL Rewrite Module 2.1** — https://www.iis.net/downloads/microsoft/url-rewrite
   - **Application Request Routing (ARR) 3.0** — https://www.iis.net/downloads/microsoft/application-request-routing
   - After installing ARR, open **IIS Manager** → click the **server node** (top of the tree, not a site) → **Application Request Routing Cache** → in the right-hand **Actions** pane click **Server Proxy Settings** → check **"Enable proxy"** → **Apply**. Without this step, the `/api`, `/socket.io`, `/uploads` rewrite rules will return 502.
4. **WebSocket Protocol** IIS feature (needed for Socket.io):
   - Server Manager → Add Roles and Features → Web Server (IIS) → Application Development → check **WebSocket Protocol**.
5. **PM2** (keeps the Node backend running as a service and restarts it on crash/reboot):
   ```powershell
   npm install -g pm2 pm2-windows-startup
   pm2 -v
   
   ```
6. **win-acme** (free Let's Encrypt SSL for IIS) — download the zip from https://www.win-acme.com/ and extract it somewhere like `C:\tools\win-acme` (no install needed).

---

## 2. Build the apps (on your dev machine)

### Backend

```powershell
cd infypos-backend
npm ci --omit=dev
```

Copy `.env.production.example` to `.env` and fill in real values:

```powershell
copy .env.production.example .env
```

Edit `.env`:
- `MONGO_URI=mongodb://localhost:27017/infypos`
- `JWT_SECRET=` — generate a unique secret:
  ```powershell
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- `CLIENT_URL=https://sboxsystem.online` (already set in `.env.production.example`)

### Frontend

`infypos-frontend/.env.production` is already configured:

```env
VITE_API_URL=/api
VITE_SOCKET_URL=https://sboxsystem.online
```

Then build:

```powershell
cd infypos-frontend
npm ci
npm run build
```

This produces `infypos-frontend/dist/`, which includes `web.config` (copied automatically from `public/`).

---

## 3. Copy files to the server

- **Frontend**: copy the contents of `infypos-frontend/dist/` to the IIS site's physical path, e.g. `C:\inetpub\wwwroot\infypos\`.
- **Backend**: copy the whole `infypos-backend/` folder (including your new `.env`, but `node_modules` is optional — see next step) to e.g. `C:\apps\infypos-backend\`, along with the `uploads/` folder if it has existing data.

---

## 4. MongoDB setup (on the server)

Verify the service is running:

```powershell
Get-Service MongoDB
```

From `C:\apps\infypos-backend`, install dependencies (run on the server to ensure native modules like `sharp` match the server's platform) and optionally seed demo data:

```powershell
cd C:\apps\infypos-backend
npm install --omit=dev
npm run seed
```

> Seeding creates the demo admin user (`admin@infy-pos.com` / `123456`). **Change this password immediately after first login.**

---

## 5. Start the backend with PM2

```powershell
cd C:\apps\infypos-backend
pm2 start ecosystem.config.js
pm2 save
```

`pm2 save` persists the process list so `pm2-windows-startup` resurrects it after a reboot.

Verify it's healthy:

```powershell
pm2 logs infypos-backend --lines 50
curl http://localhost:5000/api/health
```

You should see `MongoDB Connected` in the logs and a JSON response from the health check.

---

## 6. Create the IIS site

1. Open **IIS Manager** → right-click **Sites** → **Add Website**.
2. **Site name**: `InfyPOS`
3. **Application pool**: create a new dedicated pool (e.g. `InfyPOS`), set **.NET CLR version** to **"No Managed Code"** (this is a static site + reverse proxy, no .NET runtime needed).
4. **Physical path**: `C:\inetpub\wwwroot\infypos`
5. **Binding**: type `http`, port `80`, host name `sboxsystem.online`.

Since the server already hosts other sites, this hostname-based binding lets it coexist on port 80/443 without conflicting with existing sites.

---

## 7. SSL with win-acme

Make sure:
- DNS: an A record for `sboxsystem.online` points to this server's public IP.
- Firewall: ports 80 and 443 are open inbound.

Then, as Administrator:

```powershell
cd C:\tools\win-acme
.\wacs.exe
```

- Choose **"N: Create certificate (default settings)"**.
- Select the `InfyPOS` site/binding when prompted.

win-acme will request the certificate, add an HTTPS (443) binding to the site, and schedule a renewal task automatically.

---

## 8. End-to-end verification

- `https://sboxsystem.online/api/health` → returns the backend's JSON health payload.
- `https://sboxsystem.online` → InfyPOS login page loads.
- Log in with `admin@infy-pos.com` / `123456` (then change the password).
- Open browser dev tools → confirm no CORS errors and the socket connects (Network tab → `socket.io` requests succeed).
- Upload a product image → confirm it loads from `https://sboxsystem.online/uploads/...`.
- Navigate to a nested route (e.g. `/products`) and **refresh the page** → should load correctly, not 404 (confirms the SPA fallback rule).

---

## 9. Security notes

- Do **not** create any firewall rule that exposes port `5000` externally. The Node backend should only be reachable via `127.0.0.1` from IIS on the same machine.
- Change the default JWT secret and seeded admin password before going live (see steps above).

---

## 10. Redeploying updates

**Frontend:**
```powershell
cd infypos-frontend
npm run build
# copy dist/* contents over C:\inetpub\wwwroot\infypos
```

**Backend:**
```powershell
cd C:\apps\infypos-backend
# copy updated source files
npm install --omit=dev   # only if dependencies changed
pm2 restart infypos-backend
```

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| 502 Bad Gateway on `/api/*` | Backend not running (`pm2 logs infypos-backend`), or ARR "Enable proxy" not checked (step 1.3) |
| 500.19 IIS config error | URL Rewrite or ARR module not installed |
| Refreshing a page (e.g. `/products`) gives 404 | `web.config` missing from `dist/` or SPA fallback rule not applied — confirm `infypos-frontend/public/web.config` exists before building |
| Socket.io fails to connect / falls back to polling only | WebSocket Protocol IIS feature not enabled (step 1.4) |
| CORS errors in browser console | `CLIENT_URL` in backend `.env` doesn't exactly match `https://sboxsystem.online` (scheme + host must match) |
| Images/uploads 404 | `uploads/` folder missing on server, or `/uploads` rewrite rule not matching — check `infypos-backend/uploads/` exists and contains `products/`, `brands/`, `settings/` |
