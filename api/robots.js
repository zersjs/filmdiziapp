// Vercel Function: /robots.txt (site haritasının mutlak adresi ortama göre yazılır).
import { buildRobots } from '../server/sitemap.js';
import { resolveSiteUrl } from '../server/tmdb.js';

export const GET = (request) => new Response(buildRobots(resolveSiteUrl(process.env, request.url)), {
  headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
});
