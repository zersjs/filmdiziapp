## Cursor Cloud specific instructions

### Overview
SINEFIX is a Turkish-language movie/TV streaming frontend (React 18 + Vite + TailwindCSS). No backend exists in this repo — external services are TMDB API and Supabase (BaaS).

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
- `src/contexts/AppContext.jsx` is the single source of truth for favorites, watch later and continue watching (persisted to localStorage). Do not write those keys from anywhere else.
- Movies/Series pages share `src/pages/Browse.jsx`; filter → TMDB discover params live in `src/services/browse.js`.
- Movie and TV detail pages share `src/pages/MediaDetail.jsx`.
- Layout breakpoints: sidebar at ≥1024px, top bar + bottom nav below. Shared CSS lives in `src/index.css`.

### Known Issues
- Some legacy files are no longer imported anywhere (e.g. `src/stores/`, `src/ui/`, `src/i18n/`, `src/components/Layout/Header.jsx`, `src/pages/Subscription.jsx`); they are slated for deletion.
- No ESLint config exists; no lint command is available in `package.json`.

### Environment
- Node.js v22+ and npm v10+ (pre-installed via nvm)
- No Docker, no backend, no database required locally
- `.env` contains TMDB and Supabase credentials (hardcoded fallback API keys also exist in `src/services/tmdb.js`)
- `vite.config.js` sets `server.open: true` — when running in Cloud Agent, the browser auto-open is harmless
