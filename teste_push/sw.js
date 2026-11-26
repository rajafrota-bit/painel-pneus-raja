// Service worker do painel de pneus: SO recebe os avisos (push) e abre o painel ao tocar. Nao guarda nada em cache,
// entao o painel continua exatamente como antes (dados sempre da rede).
const VERSAO = 'push-v1';   // troque ao editar este arquivo (o navegador precisa ver um sw.js diferente para atualizar)

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});   // sem cache: deixa a rede responder (necessario so para o navegador oferecer "Instalar app")

// conteudo: {titulo, texto, url, tag, nivel}. tag = mesma ocorrencia substitui a anterior em vez de empilhar
self.addEventListener('push', (event) => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = { texto: event.data ? event.data.text() : '' }; }
  event.waitUntil(self.registration.showNotification(d.titulo || 'Painel de Pneus RAJA', {
    body: d.texto || '',
    icon: 'icon-192.png',
    badge: 'badge-96.png',   // silhueta branca em fundo transparente (senao vira quadrado branco no Android)
    tag: d.tag || undefined,
    renotify: !!d.tag,
    requireInteraction: d.nivel === 'critico',
    data: { url: d.url || './' },
  }));
});

// toque: abre o painel (reaproveita a janela ja aberta). So abre enderecos do proprio site.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  let alvo;
  try { alvo = new URL((event.notification.data && event.notification.data.url) || './', self.registration.scope); } catch (e) { return; }
  if (alvo.origin !== self.location.origin) return;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((janelas) => {
    for (const j of janelas) if ('focus' in j) return j.focus();
    return self.clients.openWindow(alvo.href);
  }));
});
