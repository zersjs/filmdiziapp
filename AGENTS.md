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
- **Test**: `npm run test` or `npx vitest run`
- **Test UI**: `npm run test:ui`
- **Test coverage**: `npm run test:coverage`

### Known Issues
- `src/stores/authStore.js` imports `../api/auth` which does not exist — this file will crash at import time. The app uses `src/contexts/AuthContext.jsx` (Supabase-based) instead.
- One test (`useApi > should execute manually`) has a pre-existing failure due to missing `act()` wrapping.
- No ESLint config exists; no lint command is available in `package.json`.

### Environment
- Node.js v22+ and npm v10+ (pre-installed via nvm)
- No Docker, no backend, no database required locally
- `.env` contains TMDB and Supabase credentials (hardcoded fallback API keys also exist in `src/services/tmdb.js`)
- `vite.config.js` sets `server.open: true` — when running in Cloud Agent, the browser auto-open is harmless
