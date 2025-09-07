// Service Worker for SINEFIX
const CACHE_NAME = 'sinefix-v1.0.0';
const STATIC_CACHE = 'sinefix-static-v1.0.0';
const DYNAMIC_CACHE = 'sinefix-dynamic-v1.0.0';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/offline.html',
  // Add other critical static assets
];

// Dynamic assets patterns
const DYNAMIC_PATTERNS = [
  /^https:\/\/api\.themoviedb\.org\/3\//, // TMDB API
  /^https:\/\/image\.tmdb\.org\/t\/p\//, // TMDB Images
  /\.(jpg|jpeg|png|gif|webp|svg)$/, // Images
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
  
  // Handle API requests
  if (DYNAMIC_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle static assets
  event.respondWith(handleStaticRequest(request));
});

// Handle navigation requests (HTML pages)
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    // If network fails, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If cache fails, return offline page
    return caches.match('/offline.html');
  }
}

// Handle API requests with cache-first strategy for images, network-first for data
async function handleApiRequest(request) {
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/.test(request.url);
  
  if (isImage) {
    // Cache-first for images
    return handleCacheFirst(request);
  } else {
    // Network-first for API data
    return handleNetworkFirst(request);
  }
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request) {
  return handleCacheFirst(request);
}

// Cache-first strategy
async function handleCacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    // Cache the response for future use
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Request failed:', request.url);
    throw error;
  }
}

// Network-first strategy
async function handleNetworkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // If network fails, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-favorites') {
    event.waitUntil(syncFavorites());
  }
  
  if (event.tag === 'background-sync-watch-later') {
    event.waitUntil(syncWatchLater());
  }
});

// Sync favorites when online
async function syncFavorites() {
  try {
    // Get pending favorites from IndexedDB
    const pendingFavorites = await getPendingFavorites();
    
    // Sync each pending favorite
    for (const favorite of pendingFavorites) {
      // Sync logic here
      console.log('[SW] Syncing favorite:', favorite);
    }
  } catch (error) {
    console.error('[SW] Failed to sync favorites:', error);
  }
}

// Sync watch later when online
async function syncWatchLater() {
  try {
    // Get pending watch later items from IndexedDB
    const pendingWatchLater = await getPendingWatchLater();
    
    // Sync each pending item
    for (const item of pendingWatchLater) {
      // Sync logic here
      console.log('[SW] Syncing watch later:', item);
    }
  } catch (error) {
    console.error('[SW] Failed to sync watch later:', error);
  }
}

// Helper functions for IndexedDB operations
async function getPendingFavorites() {
  // Implementation would depend on your IndexedDB setup
  return [];
}

async function getPendingWatchLater() {
  // Implementation would depend on your IndexedDB setup
  return [];
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  const options = {
    body: event.data ? event.data.text() : 'Yeni içerikler mevcut!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-96x96.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Keşfet',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Kapat',
        icon: '/icons/icon-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('SINEFIX', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});