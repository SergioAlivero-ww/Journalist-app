const CACHE_NAME = 'journalist-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/index.js',
  '/icon-192.png',
  '/icon-512.png',
  '/fonts/lora.css',
   '/fonts/Lora-Regular.ttf',
   '/fonts/Lora-Bold.ttf',
   '/fonts/Lora-BoldItalic.ttf',
   '/fonts/Lora-Italic.ttf',
   '/fonts/Lora-Medium.ttf',
'/fonts/Lora-Semibold.ttf',  // jeśli masz Semibold
    // lub Lora.ttf jeśli tak nazywa się Regular


];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
