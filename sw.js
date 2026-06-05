// 싹싹 앱 Service Worker v2.0 (Web Push 지원)
// V1.6 디자인 통일 cache bust — 2026-06-04
// V13: fetch 옵션 cache:'no-store' 추가 — Safari standard cache 우회
// V14: V1.7.1 prioritization A — 홈 5 영역 제거 (KPI/Weekly/Recent/Timeline/FAB)
const CACHE_NAME = 'ssak-v14';
const STATIC_ASSETS = [
  '/',
  '/index.html?v=8',
  '/ssak-quote.html',
  '/schedule.html',
  '/my.html',
  '/community.html',
  '/market.html',
  '/workforce.html',
  '/login.html',
  '/sign.html',
  '/design.css',
  '/utils.js',
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

// ── 활성화 (강제 캐시 비우기 + 모든 클라이언트 새로고침) ──────────
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // 1) 모든 캐시 삭제 (현재 버전 포함 — 완전 초기화)
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    // 2) 모든 클라이언트 제어권 즉시 획득
    await self.clients.claim();
    // 3) 모든 열린 페이지 강제 새로고침 (옛 booking.html 등 즉시 교체)
    const clients = await self.clients.matchAll({ includeUncontrolled: true });
    for (const c of clients) {
      try {
        // sw 컨텍스트에서 navigate로 reload 트리거
        if ('navigate' in c) await c.navigate(c.url);
      } catch (e) {}
    }
  })());
});

// ── Fetch: 네트워크 우선 ────────────────────────────────────────
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.hostname.includes('ssakssak-server') ||
      url.hostname.includes('supabase') ||
      url.hostname.includes('coolsms')) return;

  // 동적 페이지(booking, sign) + 단축 URL(b/) — network-only (캐싱 안 함)
  const isDynamic = /\/(booking|sign)\.html/.test(url.pathname) || url.pathname.startsWith('/b/');
  if (isDynamic) {
    event.respondWith(fetch(event.request, { cache: 'no-store' }).catch(() => new Response('서버 연결 오류', { status: 503 })));
    return;
  }

  // HTML/CSS/JS는 Safari browser cache를 우회 — cache:'no-store'로 매번 fresh fetch
  // 정적 자산이 GitHub Pages max-age=600에 묶여도 SW가 강제로 fresh 받음
  const isStatic = /\.(html|css|js)(\?|$)/i.test(url.pathname + url.search) || url.pathname.endsWith('/');
  const fetchOpts = isStatic ? { cache: 'no-store' } : undefined;

  event.respondWith(
    fetch(event.request, fetchOpts).then(response => {
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
