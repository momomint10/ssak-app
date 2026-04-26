// 싹싹 앱 Service Worker v1.0
const CACHE_NAME = 'ssak-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/ssak-quote.html',
  '/booking.html',
  '/schedule.html',
  '/my.html',
  '/sign.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// 설치: 핵심 파일 캐시
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 활성화: 구버전 캐시 삭제
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: 네트워크 우선, 실패 시 캐시
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API 요청은 캐시하지 않음
  if (url.hostname.includes('ssakssak-server') ||
      url.hostname.includes('supabase') ||
      url.hostname.includes('coolsms')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 성공하면 캐시 업데이트
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // 네트워크 실패 시 캐시에서
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // HTML 요청이면 오프라인 페이지로
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
        });
      })
  );
});
