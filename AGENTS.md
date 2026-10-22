## Cursor Cloud specific instructions

### Overview
SINEFIX is a Turkish-language movie/TV discovery frontend (React 18 + Vite + TailwindCSS). There are no user accounts. The only backend is one Vercel Function (`api/library.js`) for optional cross-device library sync, backed by Upstash Redis via REST. External services: TMDB API, YouTube IFrame API.

### Services
| Service | Command | Port | Notes |
|---------|---------|------|-------|
| Vite Dev Server | `npm run dev` | 3000 | Main dev server, auto-opens browser |

### Key Commands
- **Dev server**: `npm run dev` (port 3000)
- **Build**: `npm run build`
- **Test**: `npm test` (single run) or `npm run test:watch`
- **Test UI**: `npm run test:ui`
- **Test coverage**: `npm run test:coverage`

### Architecture notes
- Data fetching goes through TanStack Query hooks in `src/hooks/useTmdb.js`; do not call TMDB services directly from pages.
- `src/contexts/AppContext.jsx` is the single source of truth for favorites, watch later and continue watching (persisted to localStorage, synced via `/api/library` when a sync key exists). Do not write those keys from anywhere else.
- The library data model (sanitize + tombstone merge) lives in `src/lib/library.js` and is shared by the browser and `server/libraryHandler.js`.
- In `npm run dev`, a Vite middleware serves `/api/library` with the same handler and an in-memory store (no Vercel CLI needed).
- Shorts: feed engine in `src/services/shorts.js`, hook in `src/hooks/useShortsFeed.js`, YouTube player in `src/components/Shorts/ShortPlayer.jsx`. YouTube is unreachable from the cloud sandbox; E2E tests should stub `https://www.youtube.com/iframe_api`.
- Movies/Series pages share `src/pages/Browse.jsx`; filter → TMDB discover params live in `src/services/browse.js`.
- Movie and TV detail pages share `src/pages/MediaDetail.jsx`.
- Layout breakpoints: sidebar at ≥1024px, top bar + bottom nav below. Shared CSS lives in `src/index.css`.

### Known Issues
- Some legacy files are no longer imported anywhere (e.g. `src/stores/`, `src/ui/`, `src/i18n/`, `src/components/Layout/Header.jsx`, `src/pages/Subscription.jsx`); they are slated for deletion.
- No ESLint config exists; no lint command is available in `package.json`.

### Environment
- Node.js v22+ and npm v10+ (pre-installed via nvm)
- No Docker, no backend, no database required locally
- `.env` contains TMDB credentials (hardcoded fallback API keys also exist in `src/services/tmdb.js`); Supabase entries in it are no longer used
- Sync storage env vars (`KV_REST_API_URL`, `KV_REST_API_TOKEN`) are server-only; never prefix them with `VITE_`
- `vite.config.js` sets `server.open: true` — when running in Cloud Agent, the browser auto-open is harmless
