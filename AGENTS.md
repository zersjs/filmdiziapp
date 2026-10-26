## Cursor Cloud specific instructions

### Overview
SINEFIX is a Turkish-language movie/TV discovery frontend (React 18 + Vite + TailwindCSS). There are no user accounts. Vercel Functions in `api/`: `library.js` (optional cross-device library sync, Upstash Redis via REST), `render.js` (per-URL SEO HTML), `sitemap.js`, `robots.js`. External services: TMDB API, YouTube IFrame API.

### Services
| Service | Command | Port | Notes |
|---------|---------|------|-------|
| Vite Dev Server | `npm run dev` | 3000 | Main dev server, auto-opens browser |
| Vite Preview | `npm run build && npm run preview` | 4173 | Production build with the SEO render function, sitemap and robots.txt emulated |

### Key Commands
- **Dev server**: `npm run dev` (port 3000)
- **Build**: `npm run build`
- **Test**: `npm test` (single run) or `npm run test:watch`
- **Test UI**: `npm run test:ui`
- **Test coverage**: `npm run test:coverage`

### Architecture notes
- Data fetching goes through TanStack Query hooks in `src/hooks/useTmdb.js`; do not call TMDB services directly from pages.
- `src/contexts/AppContext.jsx` is the single source of truth for favorites, watch later, continue watching and watched (movies + per-episode `"SxE"` keys for shows; persisted to localStorage, synced via `/api/library` when a sync key exists). Do not write those keys from anywhere else. Episode updates go through the `episodes` reducer action so delayed toast actions never use stale state; episode ordering/progress/next-up helpers live in `src/lib/episodes.js`.
- The library data model (sanitize + tombstone merge) lives in `src/lib/library.js` and is shared by the browser and `server/libraryHandler.js`.
- In `npm run dev`, a Vite middleware serves `/api/library` with the same handler and an in-memory store (no Vercel CLI needed).
- Shorts: feed engine in `src/services/shorts.js`, hook in `src/hooks/useShortsFeed.js`, YouTube player in `src/components/Shorts/ShortPlayer.jsx`. YouTube is unreachable from the cloud sandbox; E2E tests should stub `https://www.youtube.com/iframe_api`.
- Movies/Series pages share `src/pages/Browse.jsx`; filter → TMDB discover params live in `src/services/browse.js`.
- Movie and TV detail pages share `src/pages/MediaDetail.jsx`.
- Layout: fixed top header for all sizes (`src/components/Layout/SiteHeader.jsx`: sliding nav pill, Filmler/Diziler mega menu, library popover; auto-hides on scroll below 1024px), bottom nav below 1024px. Routes in `hasHeroBehindHeader` (`navigation.js`) render under a transparent header; everything else gets top padding. Sticky elements must use `top: var(--sticky-top)`. Shared CSS lives in `src/index.css`.
- Motion primitives: `useIndicator` (measures the active element for sliding pills/boxes), `Segmented` (radio group with sliding thumb; use it instead of raw `.segmented` markup), `SlideTransition` + `useSlideDirection` (direction-aware panel swap, optional touch swipe via `useSwipe`). Animations that drive logic via `animationend` (hero progress) must be disabled under `prefers-reduced-motion`.
- SEO: page meta/JSON-LD builders live in `src/lib/seo.js` and are shared by the `<Seo>` component (Helmet) and `server/render.js`. Pages must use `<Seo>` (or `StaticSeo`), not raw `<Helmet>` meta tags. Server-rendered tags carry `data-rh="true"` so Helmet adopts them. `index.html` keeps the `<!--seo-head-->`/`<!--seo-body-->` markers; do not remove them.
- Modules imported by server code (`src/lib/*`, `src/utils/helpers.js`) must stay browser/Node neutral and use explicit `.js` import extensions (Vercel runs them unbundled).
- Genre URLs are `/movies/genre/<slug>` and `/series/genre/<slug>` (`src/lib/genres.js`); slugs are permanent. Detail/person URLs are canonicalized to `createSlug`/`getPersonPath` (301 on the server, replace-navigation on the client); keep both in sync when changing slug rules.
- "Ne izlesem?" engine: `src/services/recommend.js`; new-episode tracking: `src/lib/airing.js`.

### Known Issues
- No ESLint config exists; no lint command is available in `package.json`.

### Environment
- Node.js v22+ and npm v10+ (pre-installed via nvm)
- No Docker, no backend, no database required locally
- `.env` mirrors `.env.example` (all values optional); fallback TMDB keys live in `src/lib/tmdbConfig.js` and placeholder keys are ignored
- `VITE_SITE_URL` sets the canonical origin; on Vercel it falls back to `VERCEL_PROJECT_PRODUCTION_URL`
- Sync storage env vars (`KV_REST_API_URL`, `KV_REST_API_TOKEN`) are server-only; never prefix them with `VITE_`
- `vite.config.js` sets `server.open: true` — when running in Cloud Agent, the browser auto-open is harmless
