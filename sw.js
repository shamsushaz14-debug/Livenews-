const CACHE_NAME = 'news-tv-v39';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = req.url;

  // ലൈവ് സ്ട്രീമുകൾ, Worker, streams.json എന്നിവ ഒരിക്കലും SW കാഷെ ചെയ്യരുത്
  if (
    url.includes('.m3u8') ||
    url.includes('.ts') ||
    url.includes('.m4s') ||
    url.includes('streams.json') ||
    url.includes('workers.dev') ||
    url.includes('youtube')
  ) {
    return;
  }

  // index.html & പേജുകൾക്ക് Network-First (എപ്പോഴും പുതിയ വേർഷൻ കിട്ടാൻ)
  if (req.mode === 'navigate' || url.endsWith('index.html')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // ലോഗോകൾക്കും സ്റ്റാറ്റിക് ഫയലുകൾക്കും Cache-First
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
