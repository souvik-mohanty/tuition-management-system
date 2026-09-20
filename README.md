# Classops

- `backend/` Spring Boot API (PostgreSQL, Redis)
- `frontend/` React + TypeScript app

## Login (Firebase phone OTP)

Firebase sends and verifies the SMS OTP in the browser. The frontend then sends the Firebase ID token to
`POST /api/auth/firebase`; the backend verifies it against Google's public keys, checks the phone belongs to a
registered user, and returns its own JWT plus the user's tuition memberships. Redis holds login rate limits,
single-use markers for ID tokens, and the server-side session behind each JWT (logout revokes it).

Users cannot self-register: the phone number (E.164, e.g. `+919000000001`) must already exist in `users`.

### Firebase console (one-time)
1. Authentication > Sign-in method: enable **Phone**.
2. Authentication > Settings > Authorized domains: make sure your frontend domain is listed (`localhost` is by default).
3. For development, add **test phone numbers** (Authentication > Sign-in method > Phone) to avoid sending real SMS.
   Real SMS requires the Blaze plan.

### Backend
```
cd backend
cp .env.example .env      # fill in DB_*, JWT_SECRET; optional SEED_OWNER_PHONE=+91XXXXXXXXXX
mvn spring-boot:run       # http://localhost:8089, needs Redis on localhost:6379
```
Setting `SEED_OWNER_PHONE` creates a demo tuition center with that number as its owner on startup.
`backend/.env` is git-ignored. Never commit database credentials or `JWT_SECRET`.

### Frontend
```
cd frontend
npm install
npm run dev               # http://localhost:5173
```
`frontend/.env.development` uses real Firebase login against the backend, with feature data still mocked.
Set `VITE_USE_MOCK_AUTH=true` to use the offline demo login instead.

## Deployment

The stack is nginx (serves the SPA and proxies `/api` to the backend) -> Spring Boot -> Redis, with PostgreSQL
external (e.g. Neon). The backend and Redis are not published to the host.

```
cp .env.example .env      # DB_*, JWT_SECRET (32+ chars), REDIS_PASSWORD; optional SEED_OWNER_PHONE
docker compose up -d --build
```

The app is then served on `HTTP_PORT` (default 80). Put TLS in front of it (a load balancer, Caddy, Cloudflare,
etc.); Firebase phone auth (reCAPTCHA) expects HTTPS in production.

Before going live:
- Add your production domain to Firebase > Authentication > Settings > **Authorized domains**.
- Restrict the Firebase web API key to your domain in Google Cloud Console.
- Database schema is managed by Flyway (`backend/src/main/resources/db/migration`); the `prod` profile runs
  Hibernate in `validate` mode, so every new entity needs a migration.
- Per-IP rate limiting reads `X-Forwarded-For`. If another proxy/load balancer sits in front of nginx, make sure it
  sets that header, and never expose the backend port directly.
- The frontend has no Content-Security-Policy yet. Add one once the final third-party origins (Firebase, reCAPTCHA,
  Razorpay) are settled.

CI (`.github/workflows/ci.yml`) builds and tests the backend against Postgres and Redis service containers, builds
the frontend, and builds both Docker images.

## Deploy: Vercel (frontend) + Render (backend)

The Docker Compose setup above is the self-hosted option. The hosted setup is:

**1. Backend on Render** (`render.yaml` Blueprint at the repo root)
0. Create a free Redis at Upstash (or any TLS Redis). Note its endpoint host, port and password.
1. Render dashboard > New > **Blueprint** > connect this repo. It creates one web service, `classops-api` (Docker, from
   `backend/`), so it needs only one free Render slot.
2. When prompted, enter `DB_URL` (`jdbc:postgresql://<neon-host>/<db>?sslmode=require`), `DB_USERNAME`, `DB_PASSWORD`,
   `REDIS_HOST`, `REDIS_PASSWORD` (from Upstash; `REDIS_PORT` defaults to 6379 and `REDIS_SSL` to true) and
   `CORS_ALLOWED_ORIGINS` (your Vercel URL, e.g. `https://classops.vercel.app`; comma-separate several).
   `JWT_SECRET` is generated for you. Optionally add `SEED_OWNER_PHONE` to create a first owner.
3. Note the service URL (e.g. `https://classops-api.onrender.com`). Health check: `/actuator/health`.

**2. Frontend on Vercel** (`frontend/vercel.json`)
1. Vercel > Add New Project > import this repo and set **Root Directory** to `frontend`.
2. Environment variables:
   - `VITE_API_BASE_URL` = the Render service URL (no trailing slash)
   - `VITE_USE_MOCK_AUTH` = `false`
   - `VITE_USE_MOCK_API` = `true` only if you want mock feature data (see note below), otherwise `false`
   - `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID` (already set in `.env.production`)
3. Add the Vercel domain to Firebase > Authentication > Settings > **Authorized domains**, then update
   `CORS_ALLOWED_ORIGINS` on Render if the domain changes.

Notes:
- Only login is wired to the real backend so far. The owner dashboard and other modules still need their backend
  endpoints; with `VITE_USE_MOCK_API=false` they show an error state instead of data.
- Render's free web service sleeps when idle (first request after a pause is slow) and Redis holds login sessions, so if
  your Redis loses data everyone is signed out. Use paid plans for production.
- Frontend and API are on different origins, so CORS must list the exact Vercel origin (no wildcard).
