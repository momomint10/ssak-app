/**
 * 싹싹(Ssak-ssak) 공통 유틸리티
 * 모든 페이지에서 공유하는 함수 모음
 */

// ── 상수 ──────────────────────────────────────────────────────
const SERVER = 'https://ssakssak-server-production.up.railway.app';
const REGIONS = ['전체','서울','경기','인천','부산','대구','광주','대전','울산','제주','기타'];
const SKILLS  = ['전체','입주청소','이사청소','사무실청소','상가청소','특수청소','공사후청소','정기청소','소독방역','에어컨청소'];
const DAYS    = ['월','화','수','목','금','토','일'];
const TIMES   = ['오전','오후'];

// ── ID/인증 ────────────────────────────────────────────────────
function getAnon() {
  let id = localStorage.getItem('ssak_anon_id');
  if (!id) {
    id = 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    localStorage.setItem('ssak_anon_id', id);
  }
  return id;
}

function getCfg(key, fallback = '') {
  const cfg = JSON.parse(localStorage.getItem('ssak_cfg') || '{}');
  return key ? (cfg[key] ?? fallback) : cfg;
}

// ── JWT 세션 (Phase 2) ─────────────────────────────────────────
function getJwt() { return localStorage.getItem('ssak_jwt') || ''; }
function setJwt(t) { if (t) localStorage.setItem('ssak_jwt', t); }
function clearJwt() { localStorage.removeItem('ssak_jwt'); localStorage.removeItem('ssak_user'); }
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('ssak_user') || 'null'); } catch (e) { return null; }
}
function setCurrentUser(u) { if (u) localStorage.setItem('ssak_user', JSON.stringify(u)); }

// fetch 래퍼 — JWT 자동 첨부 + 401 시 로그인 페이지 리다이렉트
async function fetchAuth(url, opts = {}) {
  const tok = getJwt();
  const headers = Object.assign({}, opts.headers || {});
  if (tok) headers['Authorization'] = 'Bearer ' + tok;
  if (!headers['Content-Type'] && opts.body && typeof opts.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }
  const r = await fetch(url, Object.assign({}, opts, { headers }));
  if (r.status === 401) {
    clearJwt();
    if (!location.pathname.endsWith('/login.html')) {
      const next = encodeURIComponent(location.pathname + location.search);
      location.replace('/login.html?next=' + next);
    }
  }
  return r;
}

// JWT 페이로드만 디코드 (검증은 서버 책임)
function decodeJwt(tok) {
  try {
    const parts = (tok || getJwt()).split('.');
    if (parts.length !== 3) return null;
    return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
  } catch (e) { return null; }
}

// 페이지 진입 가드 — JWT 없으면 login.html로
function requireAuth() {
  const p = decodeJwt();
  if (!p || (p.exp && p.exp < Math.floor(Date.now()/1000))) {
    clearJwt();
    const next = encodeURIComponent(location.pathname + location.search);
    location.replace('/login.html?next=' + next);
    throw new Error('AUTH_REQUIRED');
  }
  return p;
}

// ── 글로벌 fetch monkey-patch (Phase 2) ───────────────────────
// 싹싹 백엔드 SERVER 요청에 자동으로 JWT 토큰 첨부.
// 401 응답 시 게스트 페이지가 아니면 login.html로 리다이렉트.
// 기존 fetch() 호출 코드 변경 없이 전체 페이지가 인증을 따른다.
(function(){
  if (window.__ssakFetchPatched) return;
  window.__ssakFetchPatched = true;
  const _origFetch = window.fetch.bind(window);

  // 게스트 페이지: 401 자동 리다이렉트 제외
  function isGuestPath() {
    const p = location.pathname || '';
    return p.endsWith('/sign.html') ||
           p.endsWith('/booking.html') ||
           p.endsWith('/booking2.html') ||
           p.endsWith('/login.html') ||
           p.indexOf('/b/') === 0 ||
           p.indexOf('/b/') !== -1;
  }

  window.fetch = function(input, init) {
    init = init || {};
    const url = typeof input === 'string' ? input : (input && input.url) || '';
    // SERVER 도메인 요청에만 토큰 첨부
    if (typeof url === 'string' && url.indexOf(SERVER) === 0) {
      const tok = getJwt();
      if (tok) {
        const h = Object.assign({}, init.headers || {});
        if (!h['Authorization'] && !h['authorization']) {
          h['Authorization'] = 'Bearer ' + tok;
        }
        init = Object.assign({}, init, { headers: h });
      }
    }
    return _origFetch(input, init).then(function(r){
      // 401: 토큰 만료 → 로그인 페이지로 (게스트 페이지 제외)
      if (r && r.status === 401 && typeof url === 'string' && url.indexOf(SERVER) === 0) {
        if (!isGuestPath()) {
          clearJwt();
          const next = encodeURIComponent(location.pathname + location.search);
          // 약간 지연 — 호출자가 응답을 처리하도록
          setTimeout(function(){ location.replace('/login.html?next=' + next); }, 50);
        }
      }
      return r;
    });
  };
})();

// ── 텍스트 유틸 ────────────────────────────────────────────────
function esc(t) {
  return (t || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function ago(ts) {
  const s = Math.floor((Date.now() - new Date(ts)) / 1000);
  if (s < 60)    return '방금';
  if (s < 3600)  return Math.floor(s / 60) + '분 전';
  if (s < 86400) return Math.floor(s / 3600) + '시간 전';
  return Math.floor(s / 86400) + '일 전';
}

function fmtPrice(n) {
  return n ? Number(n).toLocaleString() + '원' : '-';
}

function fmtManwon(n) {
  return n ? Math.round(n / 10000) + '만' : '협의';
}

function fmtDate(str) {
  if (!str) return '-';
  const d = new Date(str);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ── UI 유틸 ────────────────────────────────────────────────────
let _toastTimer;
function toast(msg, duration = 2500, kind) {
  const el = document.getElementById('toast');
  if (!el) return;

  // 메시지 내용으로 자동 분류 (kind 인자 명시 시 우선)
  // - success: 완료/저장/발송/성공/추가/등록/복사/삭제됨 등
  // - error: 실패/오류/에러/없음/잘못 등
  // - info: 그 외 모두 (기본)
  const detect = (text) => {
    const s = String(text || '');
    if (/실패|오류|에러|❌|⚠️|문제|불가|없습니다$|없어요$|잘못|취소됨/.test(s)) return 'error';
    if (/완료|저장|발송|성공|추가|등록|복사|삭제됨|업로드|보냈|✅|🎉|업데이트/.test(s)) return 'success';
    return 'info';
  };
  const k = kind || detect(msg);

  // 기존 토스트 클래스 제거 후 새 클래스 적용
  el.classList.remove('ds-toast-success','ds-toast-error','ds-toast-info');
  el.classList.add('ds-toast-' + k);

  el.textContent = msg;
  el.style.opacity = '1';
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { el.style.opacity = '0'; }, duration);
}

// 명시적 헬퍼 (각 페이지에서 이걸 쓰면 자동 분류 우회)
function toastSuccess(msg, duration = 2500) { toast(msg, duration, 'success'); }
function toastError(msg, duration = 3000)   { toast(msg, duration, 'error'); }
function toastInfo(msg, duration = 2500)    { toast(msg, duration, 'info'); }

/** loading spinner HTML */
function spinnerHtml(paddingPx = 30) {
  return `<div style="text-align:center;padding:${paddingPx}px;"><div class="sp"></div></div>`;
}

/** 빈 상태 HTML */
function emptyHtml(icon, title, sub = '') {
  return `<div class="empty">
    <div class="empty-ico">${icon}</div>
    <div class="empty-ttl">${esc(title)}</div>
    ${sub ? `<div class="empty-sub">${esc(sub)}</div>` : ''}
  </div>`;
}

// ── 푸시 알림 VAPID ────────────────────────────────────────────
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map(c => c.charCodeAt(0)));
}

// ── API 헬퍼 ───────────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const res = await fetch(SERVER + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!data.success && data.error) throw new Error(data.error);
  return data;
}

// ── 고정 헤더 스크롤 감지 ─────────────────────────────────────
// IntersectionObserver로 scroll 이벤트 없이 성능 최적화
// 사용법: DOMContentLoaded 후 initStickyHeader() 호출
// 헤더 요소에 .ds-app-header 클래스가 있으면 자동 적용
function initStickyHeader() {
  if (window._stickyInited) return; // 중복 실행 방지
  const headers = document.querySelectorAll('.ds-app-header');
  if (!headers.length) return;
  window._stickyInited = true;

  // 페이지 최상단에 1px 투명 sentinel 삽입
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;';
  document.body.style.position = 'relative';
  document.body.insertBefore(sentinel, document.body.firstChild);

  new IntersectionObserver(
    ([entry]) => {
      const scrolled = !entry.isIntersecting;
      headers.forEach(h => h.classList.toggle('scrolled', scrolled));
    },
    { threshold: 0 }
  ).observe(sentinel);
}

// ── 자동 실행: 모든 페이지에서 .ds-app-header가 있으면 자동 적용 ──
(function() {
  function _run() { initStickyHeader(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _run);
  } else {
    // 이미 로드됐으면 즉시 실행 (단, 다른 스크립트 완료 후)
    setTimeout(_run, 0);
  }
})();

// ── Phase 3-B: 인앱 메신저 배지 ───────────────────────────────
// 모든 nav 패턴 지원 (ds-nav-item / nav-item / ni)
// 텍스트 "동료" 포함 버튼을 자동 탐색 → 빨간 배지 부착 + 30초 폴링
function _findWorkforceNavButtons() {
  // 4가지 nav 패턴 지원: <nav>, .nav, .ds-nav, .bottom-nav
  const buttons = document.querySelectorAll('nav button, .nav button, .ds-nav button, .bottom-nav button');
  return Array.from(buttons).filter(b => b.textContent.includes('동료'));
}

function _ensureNavBadgeStyle() {
  if (document.getElementById('ssak-nav-badge-style')) return;
  const s = document.createElement('style');
  s.id = 'ssak-nav-badge-style';
  s.textContent = '.ssak-nav-badge{position:absolute;top:4px;right:14px;min-width:16px;height:16px;padding:0 5px;border-radius:9px;background:#FF3B30;color:#fff;font-size:10px;font-weight:700;display:none;align-items:center;justify-content:center;box-shadow:0 1px 3px rgba(0,0,0,.2);pointer-events:none;z-index:1;line-height:1;}.ssak-nav-badge.show{display:flex;}';
  document.head.appendChild(s);
}

function setupNavBadge() {
  _ensureNavBadgeStyle();
  const buttons = _findWorkforceNavButtons();
  buttons.forEach(btn => {
    if (getComputedStyle(btn).position === 'static') {
      btn.style.position = 'relative';
    }
    if (!btn.querySelector('.ssak-nav-badge')) {
      const badge = document.createElement('span');
      badge.className = 'ssak-nav-badge';
      btn.appendChild(badge);
    }
  });
}

async function refreshNavBadge() {
  try {
    if (typeof getAnon !== 'function') return;
    const anonId = getAnon();
    if (!anonId) return;
    const r = await fetch(SERVER + '/api/worker-chats/unread-count?anon_id=' + encodeURIComponent(anonId));
    if (!r.ok) return;
    const j = await r.json();
    const count = (j && j.success && j.count) || 0;
    document.querySelectorAll('.ssak-nav-badge').forEach(b => {
      if (count > 0) {
        b.textContent = count > 9 ? '9+' : String(count);
        b.classList.add('show');
      } else {
        b.classList.remove('show');
      }
    });
  } catch (e) {
    // graceful: 실패 시 변화 없음
  }
}

let _navBadgeInterval = null;
function initNavBadge() {
  if (window._navBadgeInited) return;
  window._navBadgeInited = true;
  setupNavBadge();
  if (!_findWorkforceNavButtons().length) return; // 동료 nav 없는 페이지(sign/booking)는 폴링도 스킵
  refreshNavBadge();
  _navBadgeInterval = setInterval(refreshNavBadge, 30000);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (_navBadgeInterval) { clearInterval(_navBadgeInterval); _navBadgeInterval = null; }
    } else {
      refreshNavBadge();
      if (!_navBadgeInterval) _navBadgeInterval = setInterval(refreshNavBadge, 30000);
    }
  });
}

// ── 자동 실행 ──────────────────────────────────────────────
(function() {
  function _run() { initNavBadge(); }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _run);
  } else {
    setTimeout(_run, 0);
  }
})();
