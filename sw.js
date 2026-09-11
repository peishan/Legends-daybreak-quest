const CACHE="daybreak-20260911-tavern-v8";
const CORE=[
  "./",
  "./index.html",
  "./css/daybreak.css?v=20260911-8",
  "./css/adventure.css?v=20260911-8",
  "./js/app.js?v=20260911-8",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  const isAppAsset = url.origin === self.location.origin &&
    (url.pathname.endsWith("/") || url.pathname.endsWith("index.html") || url.pathname.endsWith("app.js") || url.pathname.endsWith("daybreak.css") || url.pathname.endsWith("adventure.css"));

  if (isAppAsset) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
      return response;
    }))
  );
});
