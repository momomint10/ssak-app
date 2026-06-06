// 싹싹 앱 Service Worker v2.0 (Web Push 지원)
// V1.6 디자인 통일 cache bust — 2026-06-04
// V13: fetch 옵션 cache:'no-store' 추가 — Safari standard cache 우회
// V14: V1.7.1 prioritization A — 홈 5 영역 제거 (KPI/Weekly/Recent/Timeline/FAB)
// V15: V1.7.1 balance — 고객케어 카드 sandwich (2 tile + 고객케어 + 2 tile)
// V16: V1.7.2 weather always-on — 일정 0건이어도 weather hero 표시
// V17: V1.7.2 DEV BYPASS — 로그인 가드 일시 비활성화
// V18: 캐시 prefetch 제거 + navigation cache 잔존 fix — SW가 옛 페이지 stuck 차단
const CACHE_NAME = 'ssak-v18';
const STATIC_ASSETS = []; // ← V18: prefetch 제거. SW는 transparent network passthrough만.

// ── 설치 ──────────────────────────────────────────────────────
self.addEventListener('install', event => {
  // V18: prefetch 없이 즉시 skipWaiting (SW transparent mode)
  event.waitUntil(self.skipWaiting());
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

  // V18: cache write/fallback 모두 제거 — pure network passthrough
  // 옛 페이지 잔존 위험 차단 (push notification은 별도 이벤트라 영향 없음)
  event.respondWith(
    fetch(event.request, fetchOpts).catch(() =>
      new Response('네트워크 연결을 확인해주세요', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
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
