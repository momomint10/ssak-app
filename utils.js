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
function toast(msg, duration = 2500) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.style.opacity = '1';
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { el.style.opacity = '0'; }, duration);
}

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
