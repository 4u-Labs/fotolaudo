const CACHE_NAME = 'fotolaudo-v2.3';
const ASSETS_TO_CACHE = [
  './',
  './index.php',
  './style.css',
  './i18n.js',
  './app.js',
  './tutorial.php',
  './suporte.php',
  './privacidade.php',
  './termos.php',
  './manifest.json',
  './favicon.ico',
  './assets/apple-touch-icon.png',
  './assets/favicon-32x32.png',
  './assets/favicon-16x16.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Retorna cache e busca atualização em background
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('./index.php');
        }
      });
    })
  );
});
