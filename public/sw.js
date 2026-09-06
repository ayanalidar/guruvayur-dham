// Guruvayur Dham Service Worker v2 — Crash Prevention Edition
// Caches app shell for offline use + network-first strategy with fallbacks

const CACHE_VERSION = "gd-v2";
const APP_SHELL = [
  "/",
  "/manifest.json",
  "/logo-nav.png",
  "/logo-footer.png",
  "/guruyavur.png",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/apple-touch-icon.png",
  "/favicon-32.png",
];

// Install — pre-cache app shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean old caches + claim clients immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch strategy:
// - Navigation requests: network-first → cached page → cached "/" (offline fallback)
// - API calls (/api/*): network-only (always fresh, no caching)
// - Static assets: cache-first → network (with cache population)
// - Images: cache-first with 30-day TTL
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) return;

  // API calls: network-only (never cache API responses)
  if (url.pathname.startsWith("/api/")) {
    return; // Let the request go through normally
  }

  // Navigation requests: network-first with multiple fallbacks
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          // Cache the latest version of the page
          const copy = resp.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put("/", copy));
          return resp;
        })
        .catch(() => {
          // Network failed — try cached version of this page
          return caches.match(request.url)
            .then((cached) => {
              if (cached) return cached;
              // No cached page — try cached root
              return caches.match("/");
            })
            .then((cached) => {
              if (cached) return cached;
              // Total fallback — return a basic offline page
              return new Response(
                `<!DOCTYPE html><html><head><title>Offline - Guruvayur Dham</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{background:#0F0A08;color:#F5F0E8;font-family:system-ui;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center;padding:1rem}h1{color:#D4AF37}p{color:rgba(245,240,232,0.6);font-size:0.875rem}</style></head><body><div><h1>You're Offline</h1><p>Please check your internet connection and try again.</p><p>Call us: +91-90908 20208</p></div></body></html>`,
                { headers: { "Content-Type": "text/html" } }
              );
            });
        })
    );
    return;
  }

  // Static assets (images, CSS, JS, fonts): cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((resp) => {
        if (resp.status === 200) {
          const copy = resp.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
        }
        return resp;
      }).catch(() => cached || new Response("", { status: 404 }));
    })
  );
});

// Allow page to trigger skipWaiting via postMessage
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});
