// 7VE Ops service worker: keeps the app opening with no signal.
const V = '7ve-shell-v1';
const PRE = ['/', 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js'];
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(V).then(c => Promise.all(PRE.map(u => c.add(u).catch(() => {})))));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
function timeout(ms) { return new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms)); }
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.endsWith('supabase.co')) return;
  if (url.origin === self.location.origin) {
    const isPage = req.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html';
    if (!isPage) return;
    e.respondWith((async () => {
      const c = await caches.open(V);
      try {
        const r = await Promise.race([fetch(req), timeout(6000)]);
        if (r && r.ok) c.put('/', r.clone());
        return r;
      } catch (err) {
        return (await c.match('/')) || (await c.match(req)) || Response.error();
      }
    })());
    return;
  }
  if (/jsdelivr|cdnjs|googleapis|gstatic/.test(url.hostname)) {
    e.respondWith((async () => {
      const c = await caches.open(V); const hit = await c.match(req);
      const net = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(() => null);
      return hit || (await net) || Response.error();
    })());
  }
});
