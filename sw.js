// Sempre que alterares ficheiros, sobe o número da versão (v1 -> v2 ...).
// Sem isto, os aparelhos continuam a mostrar a versão antiga guardada em cache.
const CACHE = "ponto-presenca-v1";

// Lista de ficheiros que ficam disponíveis offline.
// Se acrescentares ficheiros (outro .js, um .css, imagens), adiciona-os aqui.
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Instalar: copiar tudo para a cache.
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activar: apagar caches de versões antigas (inclui a cache da app anterior).
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Pedidos: servir da cache primeiro; se não houver, ir à rede e guardar.
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
        return resp;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
