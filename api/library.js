// Vercel Function: /api/library
// Depolama yapılandırılmamışsa (KV_REST_API_URL / KV_REST_API_TOKEN yok) 503 döner;
// uygulama bu durumda tamamen yerel çalışmaya devam eder.
import { handleLibraryRequest } from '../server/libraryHandler.js';
import { createStoreFromEnv } from '../server/store.js';

const store = createStoreFromEnv(process.env);

const handle = (request) => handleLibraryRequest(request, { store });

export const GET = handle;
export const PUT = handle;
export const DELETE = handle;
