const CACHE = 'fs24-pwa-v13';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache =>
      cache.addAll(['./', './index.html', './manifest.webmanifest', './icon.png'])
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// 网络优先：HTML/资源每次先取线上最新版，失败时回退缓存（离线可用），保证更新即时生效
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).then(netResp => {
      const c = netResp.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, c));
      return netResp;
    }).catch(() =>
      caches.match(event.request).then(resp => resp || caches.match('./'))
    )
  );
});
