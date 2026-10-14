/*
  Service worker de la app de regadores.
  Al publicar una versión nueva: cambiar CACHE_VERSION (r1 -> r2...).
  Estrategia: la app y sus librerías, primero de la caché (y se refrescan por detrás);
  Supabase y las teselas del mapa, siempre de la red.
*/
const CACHE_VERSION = "regadores-r4";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js",
  "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js",
  "https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&family=Barlow+Semi+Condensed:wght@600;700&display=swap"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_VERSION).then(cache =>
    Promise.all(APP_SHELL.map(url => cache.add(url).catch(() => {})))
  ));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(nombres => Promise.all(nombres.filter(n => n !== CACHE_VERSION).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if(event.request.method !== "GET") return;
  if(url.hostname.includes("supabase.co")) return;
  if(url.hostname.includes("ign.es")) return;

  event.respondWith(
    caches.match(event.request).then(cacheada => {
      const deRed = fetch(event.request).then(resp => {
        if(resp && resp.ok && (resp.type === "basic" || resp.type === "cors")){
          const copia = resp.clone();
          caches.open(CACHE_VERSION).then(c => c.put(event.request, copia)).catch(() => {});
        }
        return resp;
      });
      if(cacheada){ deRed.catch(() => {}); return cacheada; }
      return deRed.catch(() => {
        if(event.request.mode === "navigate") return caches.match("./index.html");
        return new Response("", {status: 503, statusText: "Sin conexión"});
      });
    })
  );
});

self.addEventListener("message", event => {
  if(event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});
