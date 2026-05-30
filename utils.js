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
// base64url → padding 추가 → atob → UTF-8 decode → JSON
// 한글 페이로드(예: name='사장님 (Owner)') 안전 처리
function decodeJwt(tok) {
  try {
    const parts = (tok || getJwt()).split('.');
    if (parts.length !== 3) return null;
    let p64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (p64.length % 4) p64 += '=';
    const bin = atob(p64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return JSON.parse(new TextDecoder('utf-8').decode(bytes));
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

// ── 성능 최적화: 글로벌 img 자동 lazy + decoding async ────────
// DOMContentLoaded 시 loading 속성 없는 모든 <img>에 'lazy' 자동 적용,
// decoding='async'로 메인 스레드 부담 ↓. 모바일 첫 로드 LCP 개선.
// IntersectionObserver 기반이라 첫 viewport 이미지는 즉시 로드됨.
(function autoLazyImages() {
  function apply() {
    const imgs = document.querySelectorAll('img:not([loading])');
    for (let i = 0; i < imgs.length; i++) {
      imgs[i].setAttribute('loading', 'lazy');
      if (!imgs[i].hasAttribute('decoding')) imgs[i].setAttribute('decoding', 'async');
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', apply);
  } else {
    apply();
  }
  // SPA 스타일 동적 삽입 후에도 작동 — MutationObserver
  if (window.MutationObserver) {
    const mo = new MutationObserver(muts => {
      for (const m of muts) {
        for (const n of m.addedNodes) {
          if (n.nodeType !== 1) continue;
          if (n.tagName === 'IMG' && !n.hasAttribute('loading')) {
            n.setAttribute('loading', 'lazy');
            if (!n.hasAttribute('decoding')) n.setAttribute('decoding', 'async');
          } else if (n.querySelectorAll) {
            n.querySelectorAll('img:not([loading])').forEach(img => {
              img.setAttribute('loading', 'lazy');
              if (!img.hasAttribute('decoding')) img.setAttribute('decoding', 'async');
            });
          }
        }
      }
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  }
})();

// ── 성능 최적화: 외부 도메인 preconnect 자동 부착 ─────────────
// head에 link[rel=preconnect] 없을 때 동적 삽입.
// 효과는 약하지만 (이미 head parse 후), 후속 fetch에서는 DNS+TLS 재사용.
(function autoPreconnect() {
  const hosts = [
    'https://ssakssak-server-production.up.railway.app',
    'https://ezzydgtbuknamwibjhcl.supabase.co',
    'https://cdn.jsdelivr.net'
  ];
  hosts.forEach(href => {
    if (!document.head.querySelector(`link[rel="preconnect"][href="${href}"]`)) {
      const l = document.createElement('link');
      l.rel = 'preconnect';
      l.href = href;
      l.crossOrigin = '';
      document.head.appendChild(l);
    }
  });
})();

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
           p.endsWith('/quote.html') ||
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
      // 401: JWT 인증 실패 (code='AUTH_REQUIRED')만 자동 리다이렉트.
      // ADMIN_KEY 401 등 다른 401은 호출자가 처리 (false-positive 방지).
      if (r && r.status === 401 && typeof url === 'string' && url.indexOf(SERVER) === 0 && !isGuestPath()) {
        return r.clone().json().then(function(body){
          if (body && (body.code === 'AUTH_REQUIRED' || body.code === 'AUTH_USER_GONE' || body.code === 'AUTH_DISABLED')) {
            clearJwt();
            const next = encodeURIComponent(location.pathname + location.search);
            setTimeout(function(){ location.replace('/login.html?next=' + next); }, 50);
          }
          return r;
        }).catch(function(){ return r; });  // body 파싱 실패 시 그냥 응답 반환
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

// ── 전화번호 포맷 (5개 페이지 중복 제거 — 2026-05-23) ────────
// 입력: '+821012345678' / '01012345678' / '010-1234-5678' / null
// 출력: '010-1234-5678' (11자) or '010-123-4567' (10자) or 원본
function fmtPhone(p) {
  if (!p) return '';
  let s = String(p);
  // E.164 +82 → 0
  if (s.startsWith('+82')) s = '0' + s.slice(3);
  const n = s.replace(/\D/g, '');
  if (n.length === 11) return n.slice(0,3)+'-'+n.slice(3,7)+'-'+n.slice(7);
  if (n.length === 10) return n.slice(0,3)+'-'+n.slice(3,6)+'-'+n.slice(6);
  return p;
}
// 호환 alias (my.html 등에서 fmtPhoneE164 사용)
const fmtPhoneE164 = fmtPhone;

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

  // 마스코트 자동 부착 (2026-05-27): success → happy, error → wow, 기본 → default
  // 페이지에서 명시적으로 끄려면 toast(msg, dur, kind, { mascot: false })
  if (typeof mascot === 'function' && typeof MASCOT_SVG === 'object') {
    const mascotExpr = k === 'success' ? 'happy' : (k === 'error' ? 'wow' : 'default');
    const svg = mascot(mascotExpr, { size: 28 });
    el.innerHTML = '<span style="display:inline-flex;align-items:center;gap:8px;">' +
      '<span style="display:inline-block;width:28px;height:28px;flex-shrink:0;">' + svg + '</span>' +
      '<span>' + msg.replace(/</g,'&lt;').replace(/>/g,'&gt;') + '</span>' +
      '</span>';
  } else {
    el.textContent = msg;
  }
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

/* ════════════════════════════════════════════════════════════════
 * 청소 도구 SVG 아이콘 시스템 (2026-05-27 추가, 자체 저작 100% 안전)
 * 사용: svgIcon('spray', { size: 80, color: 'var(--c-pr)' })
 *       또는 직접: SVG_ICONS.spray, SVG_ICONS.bucket 등
 * ════════════════════════════════════════════════════════════════ */
const SVG_ICONS = {
  // 종이 비행기 (Paper plane) — 견적요청서 빈 상태 (메시지 발송 메타포)
  paperplane: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" stroke-linejoin="round" stroke-linecap="round">
    <path d="M88 14 L12 46 L42 58 L88 14 Z" fill="currentColor" fill-opacity=".15" stroke="currentColor" stroke-width="3"/>
    <path d="M42 58 L52 86 L66 62 L42 58 Z" fill="currentColor" fill-opacity=".28" stroke="currentColor" stroke-width="3"/>
    <path d="M88 14 L42 58 L66 62" stroke="currentColor" stroke-width="3" fill="none"/>
    <path d="M14 76 L24 70 M18 86 L30 80 M30 92 L40 84" stroke="currentColor" stroke-width="2.5" opacity=".5"/>
  </svg>`,
  // spray는 paperplane의 alias (하위 호환, 새 코드는 paperplane 사용)
  get spray() { return this.paperplane; },

  // 마이크로파이버 천 (Microfiber cloth) — 완료보고서 빈 상태
  microfiber: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- 천 본체 (살짝 기울임) -->
    <path d="M20 30 L78 22 L84 78 L26 86 Z" fill="currentColor" opacity=".18"/>
    <path d="M20 30 L78 22 L84 78 L26 86 Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
    <!-- 줄무늬 (마이크로파이버 결) -->
    <line x1="28" y1="42" x2="80" y2="34" stroke="currentColor" stroke-width="1.5" opacity=".4"/>
    <line x1="30" y1="52" x2="82" y2="44" stroke="currentColor" stroke-width="1.5" opacity=".4"/>
    <line x1="31" y1="62" x2="83" y2="54" stroke="currentColor" stroke-width="1.5" opacity=".4"/>
    <line x1="33" y1="72" x2="84" y2="64" stroke="currentColor" stroke-width="1.5" opacity=".4"/>
    <!-- 모서리 접힘 -->
    <path d="M70 22 L78 22 L74 30 Z" fill="currentColor" opacity=".3"/>
  </svg>`,

  // 양동이 (Bucket) — 휴지통 빈 상태 (깨끗함 메타포)
  bucket: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- 손잡이 -->
    <path d="M28 32 Q28 18 50 18 Q72 18 72 32" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/>
    <!-- 양동이 본체 (사다리꼴) -->
    <path d="M22 32 L78 32 L72 84 Q72 88 68 88 L32 88 Q28 88 28 84 Z" fill="currentColor" opacity=".18"/>
    <path d="M22 32 L78 32 L72 84 Q72 88 68 88 L32 88 Q28 88 28 84 Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
    <!-- 윗면 타원 -->
    <ellipse cx="50" cy="32" rx="28" ry="4" fill="currentColor" opacity=".25"/>
    <ellipse cx="50" cy="32" rx="28" ry="4" stroke="currentColor" stroke-width="2.5" fill="none"/>
    <!-- 측면 디테일 -->
    <line x1="32" y1="46" x2="68" y2="46" stroke="currentColor" stroke-width="1.5" opacity=".3"/>
    <!-- 작은 거품 (깨끗함) -->
    <circle cx="38" cy="58" r="2.5" fill="currentColor" opacity=".3"/>
    <circle cx="55" cy="62" r="3" fill="currentColor" opacity=".25"/>
    <circle cx="48" cy="70" r="2" fill="currentColor" opacity=".35"/>
  </svg>`,

  // 브룸 (Broom) — 일정/인력 빈 상태
  broom: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- 막대기 (대각선) -->
    <line x1="22" y1="22" x2="58" y2="58" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <!-- 막대기 끝 (손잡이) -->
    <circle cx="22" cy="22" r="3" fill="currentColor"/>
    <!-- 빗자루 부분 묶음 -->
    <path d="M52 52 L70 64 L66 78 L42 70 Z" fill="currentColor" opacity=".25"/>
    <path d="M52 52 L70 64 L66 78 L42 70 Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
    <!-- 빗자루 끝 가지들 -->
    <line x1="46" y1="68" x2="38" y2="84" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="50" y1="70" x2="46" y2="86" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="56" y1="72" x2="54" y2="88" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="62" y1="74" x2="62" y2="88" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <line x1="68" y1="76" x2="70" y2="86" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
    <!-- 묶음 띠 -->
    <path d="M48 58 L68 70" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
  </svg>`,

  // 청소 카트 (Cart) — 인력매칭/통계 빈 상태
  cart: `<svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <!-- 손잡이 -->
    <path d="M20 20 L20 40" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M20 20 L32 20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <!-- 카트 본체 -->
    <rect x="22" y="40" width="60" height="36" rx="3" fill="currentColor" opacity=".15"/>
    <rect x="22" y="40" width="60" height="36" rx="3" stroke="currentColor" stroke-width="2.5"/>
    <!-- 분무기 (카트 안) -->
    <rect x="30" y="46" width="10" height="20" rx="2" fill="currentColor" opacity=".4"/>
    <!-- 마이크로파이버 천 묶음 -->
    <rect x="44" y="50" width="14" height="16" rx="1.5" fill="currentColor" opacity=".3"/>
    <line x1="46" y1="55" x2="56" y2="55" stroke="currentColor" stroke-width="1" opacity=".5"/>
    <line x1="46" y1="59" x2="56" y2="59" stroke="currentColor" stroke-width="1" opacity=".5"/>
    <!-- 양동이 (카트 우측) -->
    <path d="M62 50 L76 50 L74 66 L64 66 Z" fill="currentColor" opacity=".35"/>
    <!-- 바퀴 2개 -->
    <circle cx="32" cy="82" r="6" fill="currentColor" opacity=".25"/>
    <circle cx="32" cy="82" r="6" stroke="currentColor" stroke-width="2"/>
    <circle cx="32" cy="82" r="1.5" fill="currentColor"/>
    <circle cx="72" cy="82" r="6" fill="currentColor" opacity=".25"/>
    <circle cx="72" cy="82" r="6" stroke="currentColor" stroke-width="2"/>
    <circle cx="72" cy="82" r="1.5" fill="currentColor"/>
  </svg>`
};

/** SVG 아이콘 헬퍼
 * @param {string} name - spray|microfiber|bucket|broom|cart
 * @param {object} opts - { size:96, color:'var(--c-pr)' }
 * @returns {string} HTML 문자열 (inline SVG wrapper)
 */
function svgIcon(name, opts = {}) {
  const svg = SVG_ICONS[name];
  if (!svg) return '';
  const size = opts.size || 96;
  const color = opts.color || 'var(--c-pr, #FF385C)';
  return `<span style="display:inline-block;width:${size}px;height:${size}px;color:${color};" aria-hidden="true">${svg}</span>`;
}

/** 빈 상태 (SVG 아이콘 포함) HTML
 * @param {string} iconName - spray|microfiber|bucket|broom|cart  OR  이모지/HTML
 * @param {string} title - 메인 메시지
 * @param {string} sub - 보조 메시지
 * @param {object} opts - { color:'var(--c-pr)', size:96 }
 */
function emptySvg(iconName, title, sub = '', opts = {}) {
  const icon = SVG_ICONS[iconName]
    ? svgIcon(iconName, { size: opts.size || 96, color: opts.color || 'var(--c-pr)' })
    : `<div style="font-size:48px;">${iconName}</div>`;
  return `<div class="ds-empty">
    <div class="ds-empty-svg">${icon}</div>
    <div class="ds-empty-title">${esc(title)}</div>
    ${sub ? `<div class="ds-empty-sub">${esc(sub)}</div>` : ''}
  </div>`;
}

// ── 친근한 에러 메시지 — fetch/network 실패 시 영문 raw 노출 방지
function friendlyFetchError(err, fallback) {
  const msg = (err && err.message) || '';
  if (/fetch|network|NetworkError|Failed to fetch|aborted/i.test(msg)) {
    return '잠시 후 다시 시도해 주세요. 인터넷 연결을 확인하시거나 새로고침해 보세요.';
  }
  return fallback || '잠시 후 다시 시도해 주세요.';
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

/* ════════════════════════════════════════════════════════════════
 * 하단 네비 SVG 아이콘 시스템 (2026-05-27 추가)
 * 모든 페이지의 .nav-icon (이모지)를 라인 SVG로 자동 변환
 * 24x24 viewBox, stroke 2px, currentColor (활성 시 코랄)
 * ════════════════════════════════════════════════════════════════ */
const NAV_ICONS = {
  home: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 11L12 4L21 11V19.5C21 20.3284 20.3284 21 19.5 21H15V14H9V21H4.5C3.67157 21 3 20.3284 3 19.5V11Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  care: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M13 2L4 14H11.5L10.5 22L20 10H12.5L13 2Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/></svg>`,
  schedule: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" stroke-width="2"/><path d="M3 9.5H21" stroke="currentColor" stroke-width="2"/><path d="M8 3V7M16 3V7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="8" cy="14" r="1.2" fill="currentColor"/><circle cx="12" cy="14" r="1.2" fill="currentColor"/><circle cx="16" cy="14" r="1.2" fill="currentColor"/><circle cx="8" cy="17.5" r="1.2" fill="currentColor"/><circle cx="12" cy="17.5" r="1.2" fill="currentColor"/></svg>`,
  team: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="9" cy="8" r="3.5" stroke="currentColor" stroke-width="2"/><path d="M2.5 21C2.5 17.4101 5.41015 14.5 9 14.5C12.5899 14.5 15.5 17.4101 15.5 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="17" cy="9.5" r="2.5" stroke="currentColor" stroke-width="2"/><path d="M16.5 21C16.5 18.5147 18.7386 16.5 21 16.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  my: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 21C4 16.5817 7.58172 13 12 13C16.4183 13 20 16.5817 20 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
};
const NAV_EMOJI_MAP = {
  '🏠': 'home', '🏡': 'home',
  '⚡': 'care', '⚡️': 'care',
  '📅': 'schedule', '📆': 'schedule',
  '👥': 'team', '👫': 'team',
  '👤': 'my', '👨': 'my', '👩': 'my'
};
function initNavIcons() {
  // 3가지 클래스 시스템 모두 커버: .nav-icon / .ni-ico / .ds-nav-ico
  // (페이지마다 다른 네비 컴포넌트를 써서 SVG 변환이 한 곳에만 적용되던 버그 fix)
  document.querySelectorAll('.nav-icon, .ni-ico, .ds-nav-ico').forEach(el => {
    if (el.dataset.svgApplied) return;
    // 이모지(VS16 U+FE0F 제거)로 키 찾기
    const raw = (el.textContent || '').trim();
    const text = raw.replace(/️/g, '');
    const key = NAV_EMOJI_MAP[text] || NAV_EMOJI_MAP[raw];
    if (key && NAV_ICONS[key]) {
      el.innerHTML = NAV_ICONS[key];
      el.dataset.svgApplied = '1';
      el.classList.add('nav-icon-svg');
    }
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNavIcons);
} else {
  initNavIcons();
}

/* ════════════════════════════════════════════════════════════════
 * 싹싹이 마스코트 SVG (2026-05-27)
 * 분무기 본체에 얼굴 + 다양한 표정 (Botanical 영감, 100% 자체 저작)
 *
 * 사용: mascot('happy', { size: 140, color: 'var(--c-pr)' })
 * 표정: default | happy | sleep | cheer | wow
 * ════════════════════════════════════════════════════════════════ */
const MASCOT_SVG = {
  // 기본 (살짝 미소)
  default: `<svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <!-- 트리거 / 노즐 -->
    <path d="M30 32 L52 32 L54 38 L46 42 L30 42 Z" fill="currentColor" opacity=".18"/>
    <path d="M30 32 L52 32 L54 38 L46 42 L30 42 Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M54 34 L78 30" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <!-- 분사 미스트 -->
    <circle cx="84" cy="24" r="2" fill="currentColor" opacity=".5"/>
    <circle cx="92" cy="30" r="1.5" fill="currentColor" opacity=".4"/>
    <circle cx="90" cy="20" r="1.5" fill="currentColor" opacity=".4"/>
    <!-- 병 본체 (얼굴이 들어갈 큰 면) -->
    <path d="M28 42 L52 42 L58 54 Q62 60 62 70 L62 122 Q62 130 54 130 L26 130 Q18 130 18 122 L18 70 Q18 60 22 54 Z"
          fill="white"/>
    <path d="M28 42 L52 42 L58 54 Q62 60 62 70 L62 122 Q62 130 54 130 L26 130 Q18 130 18 122 L18 70 Q18 60 22 54 Z"
          stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
    <!-- 액체 (하단) -->
    <path d="M19 100 L61 100 L61 122 Q61 129 54 129 L26 129 Q19 129 19 122 Z"
          fill="currentColor" opacity=".18"/>
    <!-- 얼굴: 눈 (default: 보통 점) -->
    <circle cx="32" cy="78" r="2.5" fill="currentColor"/>
    <circle cx="48" cy="78" r="2.5" fill="currentColor"/>
    <!-- 얼굴: 미소 (default) -->
    <path d="M34 90 Q40 95 46 90" stroke="currentColor" stroke-width="2" stroke-linecap="round" fill="none"/>
    <!-- 볼터치 (코랄 톤) -->
    <circle cx="26" cy="86" r="3" fill="currentColor" opacity=".22"/>
    <circle cx="54" cy="86" r="3" fill="currentColor" opacity=".22"/>
  </svg>`,

  // happy (활짝 웃음 — 응원)
  happy: `<svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M30 32 L52 32 L54 38 L46 42 L30 42 Z" fill="currentColor" opacity=".18"/>
    <path d="M30 32 L52 32 L54 38 L46 42 L30 42 Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M54 34 L78 30" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <!-- 더 밝은 미스트 (강한 표현) -->
    <circle cx="84" cy="24" r="2.5" fill="currentColor" opacity=".6"/>
    <circle cx="92" cy="30" r="2" fill="currentColor" opacity=".5"/>
    <circle cx="90" cy="20" r="2" fill="currentColor" opacity=".5"/>
    <circle cx="98" cy="26" r="1.5" fill="currentColor" opacity=".3"/>
    <path d="M28 42 L52 42 L58 54 Q62 60 62 70 L62 122 Q62 130 54 130 L26 130 Q18 130 18 122 L18 70 Q18 60 22 54 Z" fill="white"/>
    <path d="M28 42 L52 42 L58 54 Q62 60 62 70 L62 122 Q62 130 54 130 L26 130 Q18 130 18 122 L18 70 Q18 60 22 54 Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M19 100 L61 100 L61 122 Q61 129 54 129 L26 129 Q19 129 19 122 Z" fill="currentColor" opacity=".22"/>
    <!-- 눈: 반달 (행복) -->
    <path d="M28 78 Q32 73 36 78" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <path d="M44 78 Q48 73 52 78" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <!-- 입: 큰 웃음 -->
    <path d="M30 88 Q40 100 50 88" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="currentColor" opacity=".15"/>
    <path d="M30 88 Q40 100 50 88" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <!-- 볼터치 강화 -->
    <circle cx="26" cy="86" r="4" fill="currentColor" opacity=".30"/>
    <circle cx="54" cy="86" r="4" fill="currentColor" opacity=".30"/>
  </svg>`,

  // sleep (잠 — Z Z)
  sleep: `<svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M30 32 L52 32 L54 38 L46 42 L30 42 Z" fill="currentColor" opacity=".15"/>
    <path d="M30 32 L52 32 L54 38 L46 42 L30 42 Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M54 34 L78 30" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <!-- Zzz -->
    <text x="86" y="22" font-family="sans-serif" font-size="12" font-weight="700" fill="currentColor" opacity=".7">z</text>
    <text x="92" y="14" font-family="sans-serif" font-size="9" font-weight="700" fill="currentColor" opacity=".5">z</text>
    <path d="M28 42 L52 42 L58 54 Q62 60 62 70 L62 122 Q62 130 54 130 L26 130 Q18 130 18 122 L18 70 Q18 60 22 54 Z" fill="white"/>
    <path d="M28 42 L52 42 L58 54 Q62 60 62 70 L62 122 Q62 130 54 130 L26 130 Q18 130 18 122 L18 70 Q18 60 22 54 Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M19 100 L61 100 L61 122 Q61 129 54 129 L26 129 Q19 129 19 122 Z" fill="currentColor" opacity=".18"/>
    <!-- 눈: 닫힘 (선) -->
    <path d="M28 78 L36 78" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M44 78 L52 78" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
    <!-- 입: 작은 평온 -->
    <circle cx="40" cy="92" r="2" fill="currentColor" opacity=".5"/>
  </svg>`,

  // wow (놀람 — 큰 눈)
  wow: `<svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path d="M30 32 L52 32 L54 38 L46 42 L30 42 Z" fill="currentColor" opacity=".18"/>
    <path d="M30 32 L52 32 L54 38 L46 42 L30 42 Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M54 34 L78 30" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    <!-- 강한 미스트 -->
    <circle cx="84" cy="24" r="3" fill="currentColor" opacity=".6"/>
    <circle cx="92" cy="30" r="2" fill="currentColor" opacity=".5"/>
    <path d="M28 42 L52 42 L58 54 Q62 60 62 70 L62 122 Q62 130 54 130 L26 130 Q18 130 18 122 L18 70 Q18 60 22 54 Z" fill="white"/>
    <path d="M28 42 L52 42 L58 54 Q62 60 62 70 L62 122 Q62 130 54 130 L26 130 Q18 130 18 122 L18 70 Q18 60 22 54 Z" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M19 100 L61 100 L61 122 Q61 129 54 129 L26 129 Q19 129 19 122 Z" fill="currentColor" opacity=".18"/>
    <!-- 눈: 크게 (놀람) -->
    <circle cx="32" cy="78" r="4" fill="white" stroke="currentColor" stroke-width="2"/>
    <circle cx="32" cy="78" r="2" fill="currentColor"/>
    <circle cx="48" cy="78" r="4" fill="white" stroke="currentColor" stroke-width="2"/>
    <circle cx="48" cy="78" r="2" fill="currentColor"/>
    <!-- 입: O 모양 -->
    <circle cx="40" cy="92" r="4" fill="white" stroke="currentColor" stroke-width="2"/>
  </svg>`
};

/** 마스코트 SVG 렌더링
 * @param {string} mood - default|happy|sleep|wow
 * @param {object} opts - { size:120, color:'var(--c-pr)' }
 */
function mascot(mood = 'default', opts = {}) {
  const svg = MASCOT_SVG[mood] || MASCOT_SVG.default;
  const size = opts.size || 120;
  const color = opts.color || 'var(--c-pr)';
  return `<span class="ds-mascot" style="display:inline-block;width:${size}px;color:${color};" aria-hidden="true">${svg}</span>`;
}

/* ════════════════════════════════════════════════════════════════
 * 2026 트렌드 헬퍼 (260528)
 * - countUp: 숫자 카운트업 (토스/카뱅 시그니처)
 * - navigate: View Transitions API wrapper (Chrome 111+/Safari 18+)
 * - confetti: 완료 화면 입자 폭발 (자체 구현, 외부 의존 0)
 * ════════════════════════════════════════════════════════════════ */

/** 숫자 카운트업 애니메이션
 * @param {HTMLElement} el - 대상 엘리먼트
 * @param {number} target - 최종 숫자
 * @param {object} opts - { duration:800, start:0, prefix:'', suffix:'', format:fn }
 */
function countUp(el, target, opts = {}) {
  if (!el || typeof target !== 'number') return;
  const duration = opts.duration || 800;
  const start = opts.start ?? 0;
  const prefix = opts.prefix || '';
  const suffix = opts.suffix || '';
  const format = opts.format || (n => Math.round(n).toLocaleString('ko-KR'));
  const easeOut = t => 1 - Math.pow(1 - t, 4);
  const startTime = performance.now();
  function tick(now) {
    const t = Math.min(1, (now - startTime) / duration);
    const v = start + (target - start) * easeOut(t);
    el.textContent = prefix + format(v) + suffix;
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/** View Transitions API 래퍼 — 페이지 이동 시 morph 트랜지션
 *  지원 안 되는 브라우저는 즉시 이동 (fallback 자동)
 * @param {string} url - 이동할 URL
 */
function navigate(url) {
  if (document.startViewTransition) {
    document.startViewTransition(() => { location.href = url; });
  } else {
    location.href = url;
  }
}

/** Confetti 입자 폭발 — 완료/축하 화면용 (자체 구현, ~3KB)
 * @param {object} opts - { count:60, colors:[…], origin:{x:.5,y:.5}, duration:2400 }
 */
function confetti(opts = {}) {
  const count = opts.count || 60;
  const colors = opts.colors || ['#FF385C', '#FC8181', '#14B8A6', '#FFB800', '#A78BFA', '#5EEAD4'];
  const origin = opts.origin || { x: 0.5, y: 0.5 };
  const totalDur = opts.duration || 2400;
  const container = document.createElement('div');
  container.setAttribute('aria-hidden', 'true');
  container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999;overflow:hidden;';
  document.body.appendChild(container);
  const cx = window.innerWidth * origin.x;
  const cy = window.innerHeight * origin.y;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    const size = 6 + Math.random() * 8;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const angle = (Math.PI / 2) + (Math.random() - 0.5) * Math.PI * 0.85;
    const velocity = 220 + Math.random() * 380;
    const dir = Math.random() < 0.5 ? -1 : 1;
    const vx = Math.cos(angle) * velocity * dir;
    const vy = -Math.sin(angle) * velocity;
    const rotation = Math.random() * 720 - 360;
    const shape = Math.random() > 0.5 ? '50%' : '2px';
    const w = size, h = Math.random() > 0.3 ? size * 0.55 : size;
    p.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;width:${w}px;height:${h}px;background:${color};border-radius:${shape};transform:translate(-50%,-50%);will-change:transform,opacity;`;
    container.appendChild(p);
    p.animate([
      { transform: 'translate(-50%,-50%) rotate(0deg)', opacity: 1 },
      { transform: `translate(calc(-50% + ${vx}px), calc(-50% + ${vy * 0.7}px)) rotate(${rotation/2}deg)`, opacity: 1, offset: 0.5 },
      { transform: `translate(calc(-50% + ${vx * 1.15}px), calc(-50% + ${vy + 380}px)) rotate(${rotation}deg)`, opacity: 0 }
    ], { duration: totalDur + Math.random() * 800, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' });
  }
  setTimeout(() => container.remove(), totalDur + 1200);
}

/* ════════════════════════════════════════════════════════════════
 * 글로벌 아바타 헬퍼 (260528) — design.css .ds-avatar와 짝
 * 사용:
 *   const cls = avatarColor(user.nickname);
 *   `<div class="ds-avatar ds-avatar-md ${cls}">${user.nickname[0]}</div>`
 * ════════════════════════════════════════════════════════════════ */
const AVATAR_COLORS = ['av-coral', 'av-mint', 'av-amber', 'av-blue', 'av-purple'];
function avatarColor(seed) {
  if (!seed) return AVATAR_COLORS[0];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

/** 아바타 HTML 생성 — 사진 있으면 img, 없으면 첫글자
 * @param {string} nickname
 * @param {string} photoUrl
 * @param {string} size 'xs'|'sm'|'md'|'lg'|'xl' (default 'md')
 * @param {boolean} verified — true면 우하단 ✓ 마크
 */
function avatarHtml(nickname, photoUrl, size = 'md', verified = false) {
  const cls = avatarColor(nickname);
  const sizeCls = 'ds-avatar-' + size;
  const v = verified ? '<span class="ds-verified">✓</span>' : '';
  if (photoUrl) {
    return `<div class="ds-avatar ${sizeCls} ${cls}"><img loading="lazy" src="${esc(photoUrl)}" alt="">${v}</div>`;
  }
  const initial = (nickname || '?').trim().charAt(0);
  return `<div class="ds-avatar ${sizeCls} ${cls}">${esc(initial)}${v}</div>`;
}

// ══════════════════════════════════════════════════════════════════
// 푸시 알림 UX — priming · denied 가이드 · iOS PWA 안내 (Phase 5-B)
// ══════════════════════════════════════════════════════════════════
// 설계 메모:
// · 브라우저 native prompt는 한 번 거부되면 코드에서 다시 띄울 수 없음 → soft priming 필수
// · iOS Safari는 PWA(홈화면 추가) 상태에서만 push 가능
// · 모든 페이지에서 동일한 priming UX를 쓰도록 utils.js에 집중

function pushSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}
function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true;
}
function pushPermission() {
  if (!pushSupported()) return 'unsupported';
  if (isIOS() && !isStandalone()) return 'ios-no-pwa';
  return Notification.permission; // 'default' | 'granted' | 'denied'
}

/** native prompt → 서버 구독 등록까지 한 번에. 호출 전에 priming UI를 보여줬다고 가정 */
async function ssakSubscribePush({ hour = 8, minute = 0, reminder_enabled = true } = {}) {
  if (!pushSupported()) return { ok: false, err: 'unsupported' };
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return { ok: false, err: permission };
    const keyRes = await fetch(SERVER + '/api/push/vapid-key').then(r => r.json());
    const vapidKey = urlBase64ToUint8Array(keyRes.publicKey);
    sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: vapidKey });
  }
  const { endpoint } = sub;
  const keys = sub.toJSON().keys;
  const cfg = JSON.parse(localStorage.getItem('ssak_cfg') || '{}');
  await fetch(SERVER + '/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint, p256dh: keys.p256dh, auth: keys.auth,
      anon_id: getAnon(),
      deviceId: cfg.company || 'unknown',
      reminder_hour: hour, reminder_minute: minute
    })
  });
  await fetch(SERVER + '/api/push/reminder', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint, reminder_enabled, reminder_hour: hour, reminder_minute: minute })
  });
  localStorage.setItem('ssak_push_primed', '1');
  return { ok: true, sub };
}

function _ssakInjectPushStyles() {
  if (document.getElementById('ds-push-modal-style')) return;
  // CSS는 design.css에 정의됨 — 이 함수는 안전장치(개발 중 design.css 누락 대비)
  return;
}
function _ssakRemovePushModal() {
  const el = document.getElementById('ds-push-modal');
  if (el) el.remove();
}

/**
 * Soft priming 모달. native prompt 전에 가치 제안.
 * @param {Object} opts
 * @param {string} opts.title  헤더 카피
 * @param {string} opts.body   설명
 * @param {string} opts.cta    수락 버튼
 * @param {string} opts.deny   거부 버튼 (default '나중에')
 * @param {Function} opts.onAccept  사용자 수락 시 호출
 * @param {Function} opts.onDeny    사용자 거부 시 호출 (optional)
 */
function ssakShowPushPrime(opts = {}) {
  _ssakInjectPushStyles();
  _ssakRemovePushModal();
  const title = opts.title || '🔔 알림을 받아볼까요?';
  const body  = opts.body  || '매일 아침 그날 일정과 새 예약·문의를 알려드려요. 한 건도 놓치지 않으려고요.';
  const cta   = opts.cta   || '네, 켤게요';
  const deny  = opts.deny  || '나중에';
  const html = `
    <div id="ds-push-modal" class="ds-push-overlay" role="dialog" aria-modal="true">
      <div class="ds-push-card">
        <div class="ds-push-emoji">🔔</div>
        <div class="ds-push-title">${esc(title)}</div>
        <div class="ds-push-body">${esc(body)}</div>
        <ul class="ds-push-bullets">
          <li><span>📅</span><span>매일 아침 오늘 일정 요약</span></li>
          <li><span>📬</span><span>새 예약·문의 도착 시</span></li>
          <li><span>🔕</span><span>언제든 끄거나 시간 바꾸기</span></li>
        </ul>
        <div class="ds-push-actions">
          <button class="ds-push-btn-ghost" id="ds-push-deny">${esc(deny)}</button>
          <button class="ds-push-btn-primary" id="ds-push-accept">${esc(cta)}</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById('ds-push-deny').onclick = () => {
    _ssakRemovePushModal();
    localStorage.setItem('ssak_push_primed', '1'); // 1회 제시 기록 (재반복 방지)
    if (typeof opts.onDeny === 'function') opts.onDeny();
  };
  document.getElementById('ds-push-accept').onclick = async () => {
    const btn = document.getElementById('ds-push-accept');
    btn.disabled = true; btn.textContent = '설정 중…';
    if (typeof opts.onAccept === 'function') {
      await opts.onAccept();
    }
    _ssakRemovePushModal();
  };
}

/** 권한이 이미 거부됐을 때 — 브라우저 설정 복구 가이드 */
function ssakShowPushDeniedGuide() {
  _ssakRemovePushModal();
  const isiOS = isIOS();
  const isAndroid = /Android/i.test(navigator.userAgent);
  let steps = '';
  if (isiOS) {
    steps = '<li>설정 앱 → Safari → 웹사이트 설정 → 알림</li><li>"ssakapp.co.kr" 항목 → "허용" 선택</li>';
  } else if (isAndroid) {
    steps = '<li>크롬 주소창 왼쪽 🔒 자물쇠 아이콘 탭</li><li>"권한" → "알림" → 허용</li>';
  } else {
    steps = '<li>주소창 왼쪽 🔒 자물쇠 아이콘 클릭</li><li>"알림" 항목을 "허용"으로 변경</li><li>페이지 새로고침</li>';
  }
  const html = `
    <div id="ds-push-modal" class="ds-push-overlay" role="dialog" aria-modal="true">
      <div class="ds-push-card">
        <div class="ds-push-emoji">🔕</div>
        <div class="ds-push-title">알림이 차단돼 있어요</div>
        <div class="ds-push-body">이전에 거부되어 브라우저 설정에서 직접 허용해야 해요.</div>
        <ol class="ds-push-steps">${steps}</ol>
        <div class="ds-push-actions">
          <button class="ds-push-btn-primary" id="ds-push-accept">확인</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById('ds-push-accept').onclick = _ssakRemovePushModal;
}

/** iOS Safari + 비-PWA 상태 — 홈화면 추가 안내 */
function ssakShowIOSInstallGuide() {
  _ssakRemovePushModal();
  const html = `
    <div id="ds-push-modal" class="ds-push-overlay" role="dialog" aria-modal="true">
      <div class="ds-push-card">
        <div class="ds-push-emoji">📲</div>
        <div class="ds-push-title">홈 화면에 추가해 주세요</div>
        <div class="ds-push-body">아이폰은 홈 화면에 설치된 상태에서만 푸시 알림을 받을 수 있어요.</div>
        <ol class="ds-push-steps">
          <li>아래 공유 버튼 <b>⬆️</b> 탭</li>
          <li>"홈 화면에 추가" 선택</li>
          <li>홈 화면 아이콘으로 다시 열고 알림 켜기</li>
        </ol>
        <div class="ds-push-actions">
          <button class="ds-push-btn-primary" id="ds-push-accept">알겠어요</button>
        </div>
      </div>
    </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
  document.getElementById('ds-push-accept').onclick = _ssakRemovePushModal;
}

// ══════════════════════════════════════════════════════════════════
// 홈 사진 hero — 사장님 회사 사진 업로드 (Phase 6 follow-up)
// ══════════════════════════════════════════════════════════════════

/** File → base64 (server endpoint용) */
function _fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result; // data:image/jpeg;base64,xxxxx
      const comma = dataUrl.indexOf(',');
      resolve(dataUrl.slice(comma + 1));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** 회사 사진 업로드. 성공 시 { ok:true, url } 반환 */
async function ssakUploadHeroImage(file) {
  if (!file) return { ok: false, err: '파일이 없습니다' };
  if (!/^image\/(jpeg|png|webp|heic|heif)$/.test(file.type)) {
    return { ok: false, err: '지원되지 않는 형식 (jpeg/png/webp/heic/heif)' };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { ok: false, err: '이미지는 5MB 이하만 가능해요' };
  }
  try {
    const imageBase64 = await _fileToBase64(file);
    const r = await fetchAuth(SERVER + '/api/user/hero-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64, imageMime: file.type })
    });
    const d = await r.json();
    if (!d.success) return { ok: false, err: d.error || '업로드 실패' };
    // 로컬 캐시 — index.html이 같은 디바이스에서 즉시 반영
    try { localStorage.setItem('ssak_hero_url', d.url); } catch (e) {}
    return { ok: true, url: d.url };
  } catch (e) {
    return { ok: false, err: e.message };
  }
}

/** 회사 사진 제거 */
async function ssakRemoveHeroImage() {
  try {
    const r = await fetchAuth(SERVER + '/api/user/hero-image', { method: 'DELETE' });
    const d = await r.json();
    if (!d.success) return { ok: false, err: d.error || '제거 실패' };
    try { localStorage.removeItem('ssak_hero_url'); } catch (e) {}
    return { ok: true };
  } catch (e) {
    return { ok: false, err: e.message };
  }
}

/** 현재 사용자의 hero URL — localStorage 캐시 우선, 없으면 빈 문자열 */
function ssakGetHeroUrl() {
  try { return localStorage.getItem('ssak_hero_url') || ''; } catch (e) { return ''; }
}

// ══════════════════════════════════════════════════════════════════
// 글로벌 모달 confirm/alert — 모바일 친화 (브라우저 native 교체)
// ══════════════════════════════════════════════════════════════════
function _ssakModalEnsureStyles() {
  if (document.getElementById('ds-modal-style')) return;
  const css = `
    .ds-modal-ov{position:fixed;inset:0;background:rgba(15,23,32,.55);display:flex;
      align-items:center;justify-content:center;z-index:1200;animation:dsmFade .15s ease-out;}
    @keyframes dsmFade{from{opacity:0}to{opacity:1}}
    @keyframes dsmPop{from{transform:scale(.94);opacity:0}to{transform:scale(1);opacity:1}}
    .ds-modal-card{background:#fff;border-radius:18px;max-width:340px;width:calc(100% - 36px);
      padding:22px 22px 18px;box-shadow:0 24px 60px rgba(0,0,0,.22);
      animation:dsmPop .18s cubic-bezier(.22,1,.36,1);}
    .ds-modal-ico{font-size:34px;text-align:center;margin-bottom:6px;line-height:1;}
    .ds-modal-ttl{font-size:16px;font-weight:800;color:#1A1F2C;text-align:center;
      letter-spacing:-.01em;margin-bottom:6px;}
    .ds-modal-msg{font-size:13.5px;color:#6B7684;text-align:center;line-height:1.55;
      margin-bottom:18px;font-weight:500;}
    .ds-modal-acts{display:flex;gap:8px;}
    .ds-modal-btn{flex:1;padding:12px 14px;border-radius:11px;font-size:14.5px;
      font-weight:700;cursor:pointer;border:none;font-family:inherit;transition:transform .08s;}
    .ds-modal-btn:active{transform:scale(.97);}
    .ds-modal-btn-ghost{background:#fff;color:#6B7684;border:1px solid #E4E9EE;}
    .ds-modal-btn-primary{background:#FF385C;color:#fff;box-shadow:0 3px 12px rgba(255,56,92,.28);}
    .ds-modal-btn-danger{background:#EF4444;color:#fff;box-shadow:0 3px 12px rgba(239,68,68,.30);}`;
  const st = document.createElement('style');
  st.id = 'ds-modal-style'; st.textContent = css;
  document.head.appendChild(st);
}

/**
 * 모바일 친화 confirm — Promise<boolean>
 * @param {string} message
 * @param {{title?:string, ok?:string, cancel?:string, danger?:boolean, icon?:string}} opts
 */
function ssakConfirm(message, opts = {}) {
  _ssakModalEnsureStyles();
  return new Promise(resolve => {
    const ov = document.createElement('div');
    ov.className = 'ds-modal-ov';
    const icon = opts.icon || (opts.danger ? '⚠️' : '🤔');
    const title = opts.title || '확인이 필요해요';
    const ok = opts.ok || '확인';
    const cancel = opts.cancel || '취소';
    const okClass = opts.danger ? 'ds-modal-btn-danger' : 'ds-modal-btn-primary';
    ov.innerHTML = `
      <div class="ds-modal-card" role="alertdialog" aria-modal="true">
        <div class="ds-modal-ico">${icon}</div>
        <div class="ds-modal-ttl">${esc(title)}</div>
        <div class="ds-modal-msg">${esc(message || '')}</div>
        <div class="ds-modal-acts">
          <button class="ds-modal-btn ds-modal-btn-ghost" data-act="0">${esc(cancel)}</button>
          <button class="ds-modal-btn ${okClass}" data-act="1">${esc(ok)}</button>
        </div>
      </div>`;
    const close = (v) => { ov.remove(); document.removeEventListener('keydown', onKey); resolve(v); };
    const onKey = (e) => { if (e.key === 'Escape') close(false); else if (e.key === 'Enter') close(true); };
    ov.addEventListener('click', e => {
      if (e.target.dataset.act === '1') close(true);
      else if (e.target.dataset.act === '0' || e.target === ov) close(false);
    });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(ov);
    requestAnimationFrame(() => {
      const okBtn = ov.querySelector('[data-act="1"]'); okBtn && okBtn.focus();
    });
  });
}

/** 모바일 친화 alert — Promise<void> */
function ssakAlert(message, opts = {}) {
  _ssakModalEnsureStyles();
  return new Promise(resolve => {
    const ov = document.createElement('div');
    ov.className = 'ds-modal-ov';
    const icon = opts.icon || (opts.kind === 'error' ? '⚠️' : 'ℹ️');
    const title = opts.title || '안내';
    const ok = opts.ok || '확인';
    ov.innerHTML = `
      <div class="ds-modal-card" role="alertdialog" aria-modal="true">
        <div class="ds-modal-ico">${icon}</div>
        <div class="ds-modal-ttl">${esc(title)}</div>
        <div class="ds-modal-msg">${esc(message || '')}</div>
        <div class="ds-modal-acts">
          <button class="ds-modal-btn ds-modal-btn-primary" data-act="1" style="flex:1;">${esc(ok)}</button>
        </div>
      </div>`;
    const close = () => { ov.remove(); document.removeEventListener('keydown', onKey); resolve(); };
    const onKey = (e) => { if (e.key === 'Escape' || e.key === 'Enter') close(); };
    ov.addEventListener('click', e => { if (e.target.dataset.act === '1' || e.target === ov) close(); });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(ov);
    requestAnimationFrame(() => ov.querySelector('[data-act="1"]').focus());
  });
}
