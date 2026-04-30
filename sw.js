// 싹싹 앱 Service Worker v2.0 (Web Push 지원)
const CACHE_NAME = 'ssak-v6';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/ssak-quote.html',
  '/booking.html',
  '/schedule.html',
  '/my.html',
  '/sign.html',
  '/community.html',
  '/market.html',
  '/workforce.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// ── 설치 ──────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── 활성화 ─────────────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: 네트워크 우선 ────────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.hostname.includes('ssakssak-server') ||
      url.hostname.includes('supabase') ||
      url.hostname.includes('coolsms')) return;

  event.respondWith(
    fetch(event.request).then(response => {
      if (response.ok && event.request.method === 'GET') {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
      }
      return response;
    }).catch(() =>
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        if (event.request.headers.get('accept')?.includes('text/html'))
          return caches.match('/index.html');
      })
    )
  );
});

// ── Push 수신 ───────────────────────────────────────────────────
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data.json(); } catch(e) { data = { title: '싹싹', body: event.data?.text() || '' }; }

  const title   = data.title || '🧹 싹싹';
  const options = {
    body:    data.body   || '',
    icon:    data.icon   || '/icon-192.png',
    badge:   data.badge  || '/icon-192.png',
    tag:     data.tag    || 'ssak-push',
    data:    { url: data.url || '/index.html' },
    vibrate: [100, 50, 100],
    requireInteraction: false,
    actions: [
      { action: 'open',    title: '확인하기' },
      { action: 'dismiss', title: '닫기' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ── 알림 클릭 ───────────────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/index.html';
  const fullUrl   = 'https://ssakapp.co.kr' + targetUrl;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // 이미 열린 탭이 있으면 포커스
      const existing = windowClients.find(c => c.url.startsWith('https://ssakapp.co.kr'));
      if (existing) {
        existing.focus();
        existing.navigate(fullUrl);
      } else {
        clients.openWindow(fullUrl);
      }
    })
  );
});

// ── Push 구독 변경 감지 ─────────────────────────────────────────
self.addEventListener('pushsubscriptionchange', event => {
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: event.oldSubscription?.options?.applicationServerKey
    }).then(sub => {
      const { endpoint, keys } = sub.toJSON();
      return fetch('https://ssakssak-server-production.up.railway.app/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint, p256dh: keys.p256dh, auth: keys.auth })
      });
    })
  );
});
