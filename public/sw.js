// Service Worker mínimo do IMPÉRIO Academia
// Propositalmente NÃO faz cache agressivo de arquivos (JS/CSS) para evitar
// telas travadas com versão antiga do app depois de cada atualização.
// Ele existe só para o app ser instalável (critério exigido pelo Chrome/Android).

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// Passthrough: sempre busca da rede, sem interceptar/cachear nada.
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
