// Offline support: serve from cache first, refresh the cache in the background.
const CACHE = "rosarium-v2";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./fonts/fonts.css",
  "./fonts/AlegreyaSans-400.woff2",
  "./fonts/AlegreyaSans-500.woff2",
  "./fonts/AlegreyaSans-700.woff2",
  "./fonts/Cinzel-500.woff2",
  "./fonts/EBGaramond-400.woff2",
  "./fonts/EBGaramond-400i.woff2"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  e.respondWith(caches.open(CACHE).then(async cache => {
    const cached = await cache.match(req, { ignoreSearch: true }) ||
      (req.mode === "navigate" ? await cache.match("./index.html") : undefined);
    const network = fetch(req).then(res => {
      if (res.ok || res.type === "opaque") cache.put(req, res.clone());
      return res;
    }).catch(() => cached);
    if (cached) { e.waitUntil(network); return cached; }
    return network;
  }));
});
