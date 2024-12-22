const VERSION = "1.3"; // Incremented version number
const CACHE_NAME = `iching-explorer-v${VERSION}`; // Incremented cache name
const BASE_NAME = "/iching-explorer-public";
const HEXAGRAM_COUNT = 64;

// URLs to cache
const urlsToCache = [
  `${BASE_NAME}/?v=${VERSION}`,
  `${BASE_NAME}/index.html?v=${VERSION}`,
  `${BASE_NAME}/manifest.json?v=${VERSION}`,
  ...Array.from(
    { length: HEXAGRAM_COUNT },
    (_, i) => `${BASE_NAME}/hexagramJSONS/hexagram${i + 1}.json?v=${VERSION}`
  ),
];

// Check if we are in production
const isProduction = !self.location.hostname.includes("localhost");

// Install event - Cache essential assets only in production
self.addEventListener("install", (event) => {
  if (!isProduction) return;

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event - Handle requests from the cache or network
self.addEventListener("fetch", (event) => {
  // Disable service worker in development
  if (!isProduction) return;

  // Ignore non-GET requests and non-HTTP requests
  if (event.request.method !== "GET" || !event.request.url.startsWith("http")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if found, else fetch from network
      return (
        cachedResponse ||
        fetch(event.request).then((networkResponse) => {
          // Check if the network response is valid
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          // Clone and cache the response
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
      );
    })
  );
});

// Activate event - Clean up old caches and take control immediately
self.addEventListener("activate", (event) => {
  if (!isProduction) return;

  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!cacheWhitelist.includes(cacheName)) {
              console.log(`Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Old caches cleared. Claiming clients.");
        return self.clients.claim(); // Activate new service worker immediately
      })
  );
});

// Notify user of new service worker
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// For development: Unregister existing service workers
if (!isProduction) {
  self.addEventListener("activate", () => {
    self.registration.unregister().then(() => {
      console.log("Service worker unregistered in development mode.");
    });
  });
}
