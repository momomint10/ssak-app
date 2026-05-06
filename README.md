# 싹싹(Ssak-ssak) 모바일웹앱

입주청소 업주를 위한 SaaS 모바일웹. 순수 HTML/CSS/JS, 프레임워크 미사용.

**배포**: GitHub Pages → https://ssakapp.co.kr (CNAME)
**백엔드**: https://github.com/momomint10/ssakssak-server (Railway)

---

## 📱 페이지 구조

| 파일 | 역할 |
|---|---|
| `index.html` | 홈 화면 (오늘 할 일, 빠른 실행 4버튼, 이달 실적) |
| `ssak-quote.html` | **고객케어** — 견적발송 / 계약서 / 완료보고서 / 발송이력 (메인 작업 페이지) |
| `sign.html` | 비대면 계약서 (사장님 → 고객 SMS 서명 링크) |
| `booking.html` | 고객용 예약 신청 폼 |
| `b/index.html` | 단축 URL redirect (`/b/?t=xxx` → `/booking.html?t=xxx`) |
| `schedule.html` | 캘린더 + 예약 관리 |
| `my.html` | 이달 현황 |
| `workforce.html` | 인력매칭 (워커/공고/메신저) |
| `community.html` | 커뮤니티 피드 |
| `market.html` | 중고거래 + 안심채팅 |

## 🛠 공통 파일

- `utils.js`: SERVER URL, REGIONS, SKILLS, DAYS, TIMES 상수 / `getAnon()`, `esc()`, `toast()`, `apiFetch()` 등 공통 함수 + 인앱 메신저 배지 자동 init
- `design.css`: 디자인 토큰 (`--c-pr:#00C896`), 카드/버튼/네비/배지 컴포넌트
- `sw.js`: Service Worker (Web Push 핸들러, API 요청은 캐시 안 함)
- `manifest.json`: PWA 매니페스트

## 🚀 핵심 기능

### 고객케어 (`ssak-quote.html`)
- ⚡ **견적발송**: 평수 입력 → 자동 계산 → SMS 발송
  - 발송 옵션 칩 (홍보영상/예약링크/안내사항/후기링크/카카오)
  - 8개 안내사항 자동 포함 (모든 항목 한 줄, 부드러운 톤)
  - 예약 링크 단축 URL (`https://ssakapp.co.kr/b/?t=xxx`, 33자)
  - 임시저장 (`💾 저장` / `📂 불러오기` / `🆕 새로`) — 다중 고객 응대
- 📄 **계약서**: 비대면 서명 워크플로 (sign.html로 이동)
- 📸 **완료보고서**: 전/후 사진 + PDF → 고객/업주 SMS
- 📋 **발송이력**: 단일 리스트 (4 카테고리 필터: 견적발송/계약서/완료보고서/임시저장), 행별 [🗑] 개별 삭제

### 인력매칭 (`workforce.html`)
- 인력 찾기 / 채용공고 / 내 현황
- Web Push 알림 (사장님이 청소 중에도 메시지 인지)
- 메신저 인앱 배지 (모든 페이지 하단 네비)

## 🔧 개발 / 배포

GitHub Pages 정적 호스팅. main 브랜치 푸시 → 1~2분 후 반영.

```bash
# 코드 수정 후
git add .
git commit -m "..."
git push origin main
```

캐시 비우기 (모바일 검증 시):
```
https://ssakapp.co.kr/ssak-quote.html?v=NEW   # 쿼리 파라미터로 우회
```

## 📂 데이터

- localStorage: `ssak_anon_id` (사용자 식별), `ssak_cfg` (설정), `ssak_history` (발송이력), `ssak_drafts_quote/report` (임시저장)
- 서버 API: `https://ssakssak-server-production.up.railway.app`
- DB: Supabase (`ezzydgtbuknamwibjhcl`)

## 🔒 보안

- HTTPS only (GitHub Pages 강제)
- 백엔드 API 키 (CoolSMS 등) 클라이언트 노출 X
- adminKey 검증 (사장님 데이터 조회/수정 시)
- 본인 검증 (anon_id 기반)
