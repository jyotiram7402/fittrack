// FitTrack service worker — lightweight offline cache.
const CACHE = "fittrack-v1";
const PRECACHE = ["/", "/offline", "/manifest.json", "/data/exercises.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);

  // Never cache auth or API/supabase calls.
  if (url.pathname.startsWith("/auth") || url.hostname.includes("supabase")) return;

  // Cache-first for the static exercise dataset & images.
  if (url.pathname.startsWith("/data/") || url.hostname.includes("githubusercontent")) {
    event.respondWith(
      caches.match(request).then((hit) => hit || fetch(request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
        return res;
      }))
    );
    return;
  }

  // Network-first for navigations, falling back to offline page.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/offline").then((r) => r || caches.match("/"))));
  }
});
