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
