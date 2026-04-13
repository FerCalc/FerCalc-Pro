const CACHE_NAME = 'fercalc-v2';
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png', '/favicon.ico'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // ── Solo manejar requests del mismo origen (Vercel) ──
  // Nunca interceptar llamadas a la API del backend (Render u otro dominio)
  if (url.origin !== self.location.origin) return;

  // Solo GET
  if (event.request.method !== 'GET') return;

  // No interceptar rutas de API aunque estén en el mismo origen
  if (url.pathname.startsWith('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
