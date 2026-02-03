// sw.js - POPRAWIONA WERSJA
const CACHE_NAME = 'journalist-v2';  

const urlsToCache = [
  '/',  
  'index.html',
  'style.css',
  '/fonts/lora.css',  
  'index.js',
  'manifest.json',
  'fonts/Lora-Regular.ttf',
  'fonts/Lora-Bold.ttf',
  'fonts/Lora-Italic.ttf',
  'fonts/Lora-BoldItalic.ttf',
  'fonts/Lora-Medium.ttf',
  'fonts/Lora-Semibold.ttf',
  'fonts/Lora-MediumItalic.ttf',
  'fonts/Lora-SemiboldItalic.ttf',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});

// STRATEGY: Network First z fallback na cache (najlepsze dla dev + PWA)
self.addEventListener('fetch', event => {
  // Bypass tylko dla POST/nie-CSS (bezpieczne)
  if (event.request.method !== 'GET' || event.request.destination === 'style') {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clone odpowiedzi żeby cachować
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Offline: cache fallback
        return caches.match(event.request).then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          // Fallback dla HTML
          return caches.match('/index.html');
        });
      })
  );
});
