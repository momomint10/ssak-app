# 싹싹(Ssak-ssak) 디자인 시스템

> **버전**: design.css v7 (2026-06-11 — V1.9 Pure White + Twin Tabs + 날씨 연동)
> **레퍼런스 톤**: Toss, Kakao Bank, Daangn, Blind (한국 모바일 표준 + Pure White 미니멀)
> **타겟 사용자**: 30~50대 입주청소 사장님 (다양 연령대 — 노년 친화 over-fit 회피)
> **단일 진실 원본**: `design.css` (이 문서는 그 사람이 읽기 좋게 정리한 사본)

---

## 1. 디자인 원칙 (Output Criteria)

### ✅ Simplicity — 심플
- 페이지당 핵심 정보 4~6개로 제한 (카드: 이름·연락처·핵심태그·금액·상태·시간)
- 부가 정보(⚠️/🔌/📸)는 sub 라인에 dot 압축
- font-weight: 본문·라벨은 700 통일. **통계 큰 숫자(Bento 통계·KPI hero)는 800/900 허용** (V1.9 — 수치 강조 시각 임팩트)
- 인라인 CSS 대신 `.ds-*` 컴포넌트 클래스 활용 (페이지당 인라인 CSS 50% 이하 목표)

### ✅ Readability — 가독성
- Pretendard Variable (한글 최적화) + system fallback
- Line-height 1.5 (body), 1.25 (title) — 한글 가독성 확보
- Letter-spacing -0.015em (body), -0.025em (title) — Pretendard 권장
- 대비 비율 WCAG AA 충족 (`--c-g900` `#191F28` vs `--c-bg` `#F7F8FA`)

### ✅ Usability — 효용성
- 터치 영역 최소 44px (iOS HIG)
- CTA 버튼은 페이지 우측 상단 또는 하단 고정
- 스와이프(좌측 슬라이드)로 빠른 액션 — schedule/quote-list 일관 적용
- 상태별 배지 색상 차별화 (amber/blue/teal/pr/gray)

---

## 2. 색상 (Color)

### 2.1 Brand

| 토큰 | HEX | 사용처 |
| --- | --- | --- |
| `--c-pr` | `#FF385C` | Primary 액센트, CTA, 헤더 그라데이션 라인 |
| `--c-pr-d` | `#E31C5F` | Primary hover/active 상태 |
| `--c-pr-l` | `#FFF0F3` | Primary 배경 (배지, 카드 배경) |
| `--c-pr-xl` | `#FFF8F9` | Primary 헤더 그라데이션 시작점 |

### 2.2 Secondary (성공/완료)

| 토큰 | HEX | 사용처 |
| --- | --- | --- |
| `--c-teal` | `#00C896` | 견적 완료 배지 텍스트, 성공 액션 |
| `--c-teal-d` | `#00A87A` | 견적 완료 배지 강조 |
| `--c-teal-l` | `#E6FAF5` | 견적 완료 배지 배경 |

### 2.3 Neutral (Toss 톤)

| 토큰 | HEX | 사용처 |
| --- | --- | --- |
| `--c-bg` | `#F7F8FA` | 앱 배경 (살짝 푸르스름) |
| `--c-white` | `#FFFFFF` | 카드/모달 배경 |
| `--c-g100` | `#F2F4F6` | divider, chip background |
| `--c-g200` | `#E5E8EB` | border, input border |
| `--c-g300` | `#D1D6DB` | disabled border |
| `--c-g400` | `#B0B8C1` | placeholder, 비활성 텍스트 |
| `--c-g500` | `#8B95A1` | secondary text (보조 설명) |
| `--c-g700` | `#4E5968` | body text |
| `--c-g900` | `#191F28` | title text, 강조 |

### 2.4 Semantic

| 토큰 | HEX | 사용처 |
| --- | --- | --- |
| `--c-red` | `#F04438` | 에러, 삭제, 위험 |
| `--c-amber` | `#F79009` | 경고, 대기 (pending) |
| `--c-blue` | `#3B82F6` | 정보, 신규 (submitted) |

### 2.5 Status Mapping (견적요청서 등)

| 상태 | 배지 클래스 | 의미 |
| --- | --- | --- |
| pending | `.ds-badge-amber` | ⏳ 미입력 |
| submitted | `.ds-badge-blue` | 📥 정보 도착 |
| quoted | `.ds-badge-teal` | ✅ 견적 완료 |
| contracted | `.ds-badge-pr` | 🤝 계약 |
| cancelled | `.ds-badge-gray` | ❌ 취소 |

---

## 3. 텍스처 (Texture)

### 3.1 글래스모피즘 (Glass Morphism)
- **`.ds-nav` (하단 네비)**: `backdrop-filter: blur(20px)` + 반투명 배경
- 모바일 사파리 PWA 환경에서 부드러운 깊이감

### 3.2 페이퍼 (Card)
- 카드는 `box-shadow: var(--sh-sm)` + `background: var(--c-white)`
- `border-radius: var(--r-md)` 12px — 모서리 부드럽게
- 미세한 그림자로 종이 위에 떠 있는 느낌

### 3.3 그라데이션 (Gradient)
- **헤더 배경 (V1.9)**: `#FFFFFF` Pure White — 전 페이지 통일. (구 v3: 살구 그라데 `160deg #FFF8F5→#FFF` 폐기)
- **헤더 하단 (V1.9)**: `border-bottom: 1px solid var(--gray-100)` — 회색 보더. (구 v3: 코랄 라인 폐기)
- **날씨 연동 hero (V1.9.28)**: 홈/스케줄 hero-card 배경이 날씨 scene 따라 변함 (맑음 블루 / 비 청회 / 흐림 회색 / 눈 청백 / 밤 다크블루). 홈 `design.css .ds-today-fc` 색을 단일 진실로 공유
- **CTA 통계 카드**: 코랄 그라데이션 (큰 숫자 강조 시), 활동량 Bento는 level별 (여유 블루 / 순조 살구 / 활기 코랄)

### 3.4 Metal/메탈 — 미사용
> 청소업 모바일 앱에는 메탈 텍스처 미적용. 따뜻한 페이퍼 톤이 브랜드와 맞음.

---

## 4. 그림자 (Shadow / Depth)

### 다층 시스템 (Airbnb 3-layer)

| 토큰 | 값 | 사용처 |
| --- | --- | --- |
| `--sh-sm` | 1px ring + 2px blur + 4px blur | 카드 기본 (`.ds-card`, `.ds-swipe-wrap`) |
| `--sh-md` | 1px ring + 4px blur + 8px blur | 떠있는 카드, FAB |
| `--sh-lg` | 1px ring + 8px blur + 16px blur | 모달, 드롭다운 |

```css
--sh-sm: rgba(0,0,0,0.02) 0px 0px 0px 1px,
         rgba(0,0,0,0.04) 0px 2px 6px,
         rgba(0,0,0,0.08) 0px 4px 8px;
--sh-md: rgba(0,0,0,0.02) 0px 0px 0px 1px,
         rgba(0,0,0,0.05) 0px 4px 12px,
         rgba(0,0,0,0.12) 0px 8px 16px;
--sh-lg: rgba(0,0,0,0.02) 0px 0px 0px 1px,
         rgba(0,0,0,0.06) 0px 8px 20px,
         rgba(0,0,0,0.14) 0px 16px 32px;
```

### 사용 가이드
- `--sh-sm`: 평면 위 떠있는 카드 (기본). 너무 강하지 않게.
- `--sh-md`: 사용자가 만지고 있는 요소 (active state)
- `--sh-lg`: 모달, 시트 (위계 명확히)

---

## 5. 조명 (Lighting)

> 정적 CSS 환경이라 실제 조명 시뮬레이션은 아닌, **시각 위계 표현 가이드**:

- **상단 강조**: 헤더 그라데이션이 상단에서 빛이 비치는 느낌
- **카드 떠오름**: 다층 그림자가 자연광 아래 종이가 떠있는 효과
- **active state**: `transform: scale(.97)` + `opacity: .85` — 눌렀을 때 살짝 가라앉는 인상
- **그라데이션 CTA**: 코랄 그라데이션은 상단이 살짝 더 밝아 입체감

---

## 6. 타이포그래피 (Typography)

### 6.1 Font Family
```
"Pretendard Variable", Pretendard,
-apple-system, BlinkMacSystemFont, system-ui,
"Noto Sans KR", sans-serif
```
- **Pretendard Variable**: 한글 모바일 표준, 가변 폰트
- jsdelivr CDN: `pretendardvariable-dynamic-subset.min.css`

### 6.2 Font Size Scale

| 토큰 | 값 | 사용처 |
| --- | --- | --- |
| `--f-xs` | 11.5px | meta, label, badge |
| `--f-sm` | 12.5px | caption, tab, helper |
| `--f-md` | 14px | body (default) |
| `--f-lg` | 15px | body-emphasis, button |
| `--f-xl` | 17px | subtitle, card title |
| `--f-2xl` | 19px | section title |
| `--f-3xl` | 22px | page title |
| `--f-4xl` | 26px | hero (rare) |

### 6.3 Font Weight

| 토큰 | 값 | 사용처 |
| --- | --- | --- |
| `--fw-regular` | 400 | body 본문 |
| `--fw-medium` | 500 | meta, caption |
| `--fw-semibold` | 600 | button, subtitle |
| `--fw-bold` | 700 | title, 강조 |

> ⚠️ **800/900 사용 금지** — 한글 환경에서 촌스러운 인상을 줌. 모든 강조는 700으로.

### 6.4 Line-height

| 토큰 | 값 | 사용처 |
| --- | --- | --- |
| `--lh-tight` | 1.25 | title (한글 압축) |
| `--lh-normal` | 1.5 | body (한글 표준) |
| `--lh-loose` | 1.7 | description (긴 본문) |

### 6.5 Letter-spacing

| 토큰 | 값 | 사용처 |
| --- | --- | --- |
| `--ls-tight` | -0.025em | title (Pretendard 권장) |
| `--ls-normal` | -0.015em | body (Pretendard 권장) |
| `--ls-loose` | 0 | small caps, 영문 |

---

## 7. 간격 & 반경 (Spacing & Radius)

### 7.1 Radius

| 토큰 | 값 | 사용처 |
| --- | --- | --- |
| `--r-sm` | 8px | input, small button |
| `--r-md` | 12px | card, button-primary |
| `--r-lg` | 16px | hero card |
| `--r-xl` | 20px | bottom sheet 상단 |
| `--r-full` | 9999px | pill, badge |

### 7.2 Spacing

| 토큰 | 값 | 사용처 |
| --- | --- | --- |
| `--sp-xs` | 4px | inline gap |
| `--sp-sm` | 8px | element 간 좁은 gap |
| `--sp-md` | 16px | 카드 padding, 페이지 좌우 margin |
| `--sp-lg` | 24px | section 간 gap |

---

## 8. 컴포넌트 카탈로그

### 8.1 페이지 헤더 (`.ds-page-header`)
- 그라데이션 배경 + sticky top + 하단 코랄 라인 3px
- 좌측 back 버튼, 중앙 제목+부제, 우측 액션 슬롯
- 클래스: `.ds-page-header > .ds-page-header-row > .ds-page-back / .ds-page-titles (.ds-page-title + .ds-page-h-sub) / .ds-page-actions`

### 8.2 상태 탭 (`.ds-status-tabs-wrap`)
- 가로 스크롤 + 우측 fade 그라데이션 (더 있는 탭 hint)
- 활성 탭: 검정 배경 + 흰 글씨
- 카운트 배지: 같은 톤의 반투명 원형

### 8.3 스와이프 카드 (`.ds-swipe-wrap`)
- 좌측 슬라이드(-76px) → 우측 🗑 삭제 버튼 노출
- 카드는 z-index:1, 액션은 z-index:0 (평상시 가림)
- `.is-new` 변형: 좌측 코랄 3px 바 (신규 강조)

### 8.4 카드 콘텐츠 (`.ds-list-*`)
- `.ds-list-row` (상태 배지 + 시간)
- `.ds-list-name` (15px 700)
- `.ds-list-sub` (13px 일반)
- `.ds-list-tags` + `.ds-list-tag` (핵심 태그)
- `.ds-list-amount` (15px 700, --c-g900)

### 8.5 버튼

| 클래스 | 색상 | 사용처 |
| --- | --- | --- |
| `.ds-btn-primary` | 코랄 배경 + 흰 글씨 | 메인 CTA |
| `.ds-btn-secondary` | 회색 배경 + 진회색 | 보조 |
| `.ds-btn-ghost` | 투명 + 코랄 테두리 | 취소·뒤로 |
| `.ds-btn-danger` | 빨강 배경 | 삭제·위험 |
| `.ds-header-cta` | 코랄 둥근 알약 | 헤더 우측 + 새 요청 |
| `.ds-icon-btn` | 투명, 아이콘만 | 헤더 우측 휴지통 등 |

### 8.6 배지 (`.ds-badge`)
7가지 색상 변형 — `green / amber / red / blue / gray / pr / teal`

### 8.7 바텀 시트 (`.ds-overlay` + `.ds-sheet`)
- 오버레이 0.45 알파 + 시트 max-height 90vh
- 핸들 → 헤드(타이틀 + 닫기) → 바디(스크롤) → 푸터(고정 CTA)

### 8.8 빈 상태 (`.ds-empty`)
- 큰 이모지 + 타이틀 + 보조 설명
- 모달 안 / 목록 비었을 때

### 8.9 하단 네비 (`.ds-nav`)
- 글래스모피즘 (backdrop-filter blur 20px)
- 5탭 (홈/견적/스케줄/동료/MY)
- 활성: 코랄 색상

---

## 9. 디바이스 환경 (Device Frame)

- **타겟**: iPhone Safari 16.4+ PWA, Android Chrome PWA
- **최대 너비**: 480px (`.shell { max-width: 480px }`)
- **safe area**: `padding-bottom: max(24px, env(safe-area-inset-bottom))`
- **메타**: `<meta name="theme-color" content="#FF385C">` (브라우저 chrome 색)

---

## 10. 결과물 충족 조건 평가 (Self-check)

- [x] **심플 (Simplicity)**: 페이지당 정보 6개 이하, font-weight 800 제거, 인라인 CSS 50% 이상 축소 목표 (`quote-list.html` 달성: 59% 축소)
- [x] **가독성 (Readability)**: Pretendard + line-height 1.5 + letter-spacing -0.015em, WCAG AA 대비 충족
- [x] **효용성 (Usability)**: 44px 이상 터치 영역, 스와이프 빠른 액션, 상태별 색상 차별화, 가로 스크롤 fade hint

---

## 11. 외부 도구 연동

### Figma
- 색상 토큰 그대로 복사해 Figma color style 등록 가능
- Pretendard Variable: Figma에서 동일 폰트 사용 가능

### 3D 목업 생성 (PNG/JPG 필요 시)
- **Smartmockups** / **Mockup World**: 모바일 스크린샷 → iPhone 3D mockup 자동 합성
- **Rotato**: 3D iPhone + 회전 비디오
- **Mockuuups Studio** (Figma 플러그인): 디자인 → 디바이스 합성

### 디자인 시스템 export
- 이 문서를 Figma의 "Design Tokens" 형태로 변환 가능
- `style-dictionary` 같은 도구로 토큰을 Android/iOS native 형식으로 빌드 가능

---

---

## 13. 브랜드 정체성 가이드 (v4 — 2026-06-03)

### 13.1 현 진단

| 발견 | 영향 | 결정 |
|---|---|---|
| 코랄 `#FF385C`가 Airbnb/Toss/카카오뱅크와 동일 | 싹싹 고유성 약함 | 차별화 후보 `#FF4D6D` (살짝 핑크 hint) 검토 중 |
| 마스코트 빗자루 로봇이 `login.html`에만 활용 | 브랜드 자산 활용도 ↓ | AI 마스코트 시리즈 확장 예정 (작업/만족/대기 표정) |
| `--c-mint` / `--c-teal` 두 비슷한 색 공존 | 디자인 시스템 모호 | **`teal`은 "완료/성공" 단일 의미**로 통일, `mint`는 활용 자제 |
| 사진 hero가 Unsplash 외국 인테리어 | 한국 청소업 컨텍스트 약함 | 사장님 회사 사진 업로드 권장 (이미 구현됨) |

### 13.2 컬러 사용 규칙 (mint/teal 정리)

| 색 | 의미 | 용처 |
|---|---|---|
| `--c-pr` 코랄 | Primary 액션, 브랜드 액센트 | CTA, 활성 상태, hero 카드 |
| `--c-teal` | **완료/성공 단일 의미** | 견적 완료 배지, 매칭 확정, 업로드 성공 토스트 |
| `--c-mint` (deprecated) | (활용 자제) | 신규 컴포넌트에선 사용 안 함, 기존 컴포넌트는 점진 `--c-teal` 로 교체 |
| `--c-amber` | 대기/주의 | 미입력 배지, 경고 토스트 |
| `--c-blue` | 정보/신규 | 정보 도착 배지, 신규 알림 |
| `--c-red` | 위험/삭제 | 삭제 액션, 오류 토스트, 앱 초기화 |

### 13.3 마스코트 활용 가이드라인

**현재**: `img/hero-mascot.png/.webp` 1장 (login.html 배경)

**활용 확장 계획** (AI 생성 예정):
| 변종 | 용처 | 표정/포즈 |
|---|---|---|
| **happy** | 성공 토스트 ("✅ 저장됨"), 완료 보고서 발송 | 미소, 양손 들기 |
| **wow** | 에러 토스트 ("❌ 실패"), 오류 모달 | 놀란 눈, 동그란 입 |
| **default** | 일반 안내 토스트, 인사 메시지 | 차분한 표정 |
| **sleeping** | 빈 상태 ("오늘 예약 없음") | 눈 감음, 옆에 zZz |
| **broom** | login.html hero (현재) | 빗자루 들고 청소 자세 |

**파일 위치**: `img/mascot-{변종}.webp` + PNG fallback

### 13.4 사진 hero 가이드라인

**원칙**: 가능하면 사장님 본인 회사 사진 (`/api/user/hero-image` 업로드).

**fallback stock 선정 기준**:
- 한국 거주 환경 (한옥/아파트 인테리어) 우선
- 인물 없는 환경 사진 (개인정보·인종 이슈 회피)
- 청소 도구가 자연스럽게 배치된 깔끔한 공간

**현재 fallback**: Unsplash 모던 인테리어 (`1556909114-f6e7ad7d3136`)
**검토 후보**: 한국 inverter 사진 + 청소 도구 인덱싱

### 13.5 Voice / Tone 가이드 (한국어 카피)

#### 5.1 호칭
- **사장님**: 사용자 호칭 표준 ("김 사장님", "수고하셨어요 사장님")
- **고객**: 청소 의뢰인 ("고객님" 아님 — 사장님 관점에서 "고객")
- **동료**: 같은 청소업 사장님 (workforce.html)

#### 5.2 톤 원칙
- ✅ **친절하지만 짧게** — 토스 톤 차용 (이모지 1개까지)
- ✅ **명령형 < 권유형** — "하세요" < "해 보세요" / "확인하세요" < "확인해 보세요"
- ✅ **숫자 + 단위** — "3건" "240만원" "오전 10시" (tabular-nums)
- ❌ 영문 raw error 노출 금지 (`friendlyFetchError` 사용)
- ❌ "오류 발생" 같은 generic 메시지 — 페이지별 컨텍스트 ("동료 목록을 불러올 수 없어요")

#### 5.3 카피 표준
| 상황 | 카피 |
|---|---|
| 로딩 | "불러오는 중…" (말줄임표 …, not ...) |
| 저장 성공 | "✅ 저장됐어요" |
| 삭제 확인 | "이 ○○을(를) 삭제할까요?" |
| 네트워크 에러 | "잠시 후 다시 시도해 주세요. 인터넷 연결을 확인하시거나 새로고침해 보세요." |
| 인증 만료 | "다시 로그인해 주세요." |
| 빈 상태 (오늘) | "여유로운 하루예요 ☀️" (긍정적 톤) |
| 빈 상태 (목록) | "아직 ○○이 없어요. ○○해 보세요!" (액션 유도) |

### 13.6 차별화 검토 중 (사용자 결정 필요)

| 옵션 | 코랄 변경 | 영향 |
|---|---|---|
| **유지** (현재) | `#FF385C` | Airbnb/Toss 동일 — 변경 없음 |
| 살짝 따뜻하게 | `#FF4D6D` (Hue +3, Saturation -5) | 핑크 hint, 살짝 친근 |
| Coral red 강화 | `#FF5A60` (orange 쪽) | 따뜻함 강조, 청소 "깨끗" 이미지와 어울림 |
| 보수적 차별 | `#F03861` (Hue -2) | 미세 차이, 기존 자산 호환 |

---

## 14. 홈 V1.5 — Action Hub 패턴 (v5 — 2026-06-03)

직전 "심플하지만 단촐"한 홈 화면 피드백을 반영한 새 패턴.
4 액션 + 정보 그룹화로 풍성함과 통일감을 동시에 확보한다.

### 14.1 구조 (위에서 아래)

1. **Hero** — 인사 + 이름 + 회사 칩 (매출 노출 ✗ — 사장님 정서 부담 ↓)
2. **status-card** — 오늘 일정 한 줄 문장 (`📋 오늘 예약 3건 / 오전 10시 신가족 입주청소부터`)
   - 빈 상태: `여유로운 하루예요 ☀️ / 탭해서 새 견적을 받아볼까요?` → 탭 시 `quote.html`로 분기
3. **고객케어 hero** — primary 단일 카드 (견적·계약·완료 한 진입점)
4. **`.tile-grid` 2×2** — 보조 액션 4개 (단촐 해소 핵심)
5. **`.kpi-inline`** — 완료·확정·대기 압축 stat (데이터 0건이면 자동 숨김)
6. **recent-card** — 커뮤니티 / 중고거래

### 14.2 `.tile-grid` 4 tile

| Tile | 아이콘 배경 | 아이콘 색 | 라우팅 |
| --- | --- | --- | --- |
| 📅 예약 확정 | `#EFF6FF` | `#3B82F6` (블루 = 일정) | `schedule.html` |
| 📝 견적함 | `#FFF7ED` | `#F59E0B` (앰버 = 문서) | `quote-list.html` |
| 👥 동료 | `#F0FDF4` | `#22C55E` (그린 = 사람) | `workforce.html` |
| 💰 정산 | `#FAF5FF` | `#A855F7` (보라 = 금융) | `my.html` (매출 통계 영역) |

### 14.3 F 색 정책 — "정보 / 알림" 두 채널 분리

**숫자 = 정보 채널 → 다크 한 색 통일**
- `.tile-sub b { color: var(--c-g900) }` — 5건이든 50건이든 시각 안정
- 값 변경에도 색이 흔들리지 않음

**뱃지 = 알림 채널 → 의미별 색**
- `.tile-badge`: `--c-pr` 코랄 (응답 필요 — 예약 확정, 견적 대기)
- `.tile-badge.green`: `#22C55E` (긍정 도착 — 지원자)
- 뱃지 없음: 조회용 정보 (정산)

**근거**: 카톡·슬랙·인스타의 빨간 뱃지 = 알림 멘탈 모델 활용. 숫자가 동적으로 바뀌어도 사장님이 "지금 빨간 게 있나?"만 보면 됨.

### 14.4 정산 sparkline

- 데이터: `GET /api/stats/weekly?weeks=6` (만원 단위 반올림)
- 색: `#FF385C` 코랄 (line + dot + area gradient stop) — 매출 = 브랜드 핵심 시그널
- fallback: monthly `revenue_change_pct` 방향으로 단조 추정 곡선
- 0 또는 미응답이면 SVG 통째로 숨김

### 14.5 빈 데이터 자동 숨김 (정서적 안정)

- `.ds-hero-rev-row` (구 매출 row) — 완전 제거
- `.kpi-inline` — `doneN + bookN + pendingCt + revN` 모두 0이면 숨김
- `.tile-spark` — weekly 합산 0이면 숨김
- `.tile-badge` — 수치 0이면 숨김
- 첫 진입 사장님 화면이 무리하게 비지 않도록 액션 4 tile은 항상 유지

### 14.6 데이터 소스 매핑

| 영역 | API | 비고 |
| --- | --- | --- |
| 오늘 일정 | `GET /api/bookings?status=pending` | 첫 건 시간·고객·종류 표시 |
| 매출/실적 | `GET /api/stats/monthly` | `done`, `revenue`, `confirmed`, `revenue_change_pct` |
| sparkline | `GET /api/stats/weekly?weeks=6` | `weekly_revenue: number[]` (만원) |
| 동료 지원자 | `GET /api/jobs/my/posted?anon_id=` | 본인 글 + `applicant_count` 합산 |

---

## 15. V1.7 — 매출 정책 + 접근성 + 차분함 (v6 — 2026-06-05)

V1.6 톤(Toss 분할, D nav indicator, 발광 ✗)을 그대로 두되, 두 가지를 추가:
**사장님 정서 보호 (매출 표시 ✗)** + **접근성 글로벌 강화**.

### 15.1 매출 표시 정책 (절대 규칙)

사장님 직접 명시: *"매출이 강조되면 사장님 입장에서 기분이 안 좋을 것 같아"*

| 영역 | 표시 가능 여부 |
|---|---|
| 홈 hero | ✗ — 매출 단어/숫자 금지 |
| tile-grid 4번째 자리 | ✗ — 정산 tile 제거, **커뮤니티 tile로 교체** (V1.7) |
| sparkline (매출 추세) | ✗ — 모든 페이지에서 제거 |
| 어제 대비 매출 % | ✗ |
| 주간 매출 막대 | ✗ — 단, "일정 건수 막대"는 OK |
| my.html 통계 페이지 | ⚠ 검색해 들어간 페이지는 노출 가능 (사장님이 의도) |
| schedule.html 매출 영역 | ⚠ 작게 (페이지 정체성 일부) |

**원칙**: 사장님이 홈 화면을 첫 진입할 때 매출 숫자를 마주치지 않게 한다. 매출이 정말 필요하면 사장님이 직접 my.html에 들어가서 확인한다.

### 15.2 접근성 글로벌 (design.css `:where()` 적용)

```css
/* 키보드 포커스 — 모든 인터랙티브 요소 */
:where(button, a, input, textarea, select, [role="button"]):focus-visible {
  outline: 2px solid var(--c-pr);
  outline-offset: 2px;
}
/* 터치 타겟 44×44 — Apple HIG / Material */
:where(button, .ds-tap, .ds-nav-item, .ds-icon-btn) {
  min-height: 44px; min-width: 44px;
}
/* 예외 — 작은 inline 칩/뱃지 */
:where(.tile-badge, .ds-chip-sm, .badge-inline) {
  min-height: 0; min-width: 0;
}
/* 모션 민감 사용자 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 15.3 V1.7 홈 tile-grid (정산 → 커뮤니티 교체)

| Tile | Before V1.6 | After V1.7 |
|---|---|---|
| 1번 | 📅 예약 확정 | 📅 예약 확정 (그대로) |
| 2번 | 📝 견적함 | 📝 견적함 (그대로) |
| 3번 | 👥 동료 | 👥 동료 (그대로) |
| 4번 | 💰 정산 (240만 + sparkline) | 💬 **커뮤니티** (새 글 N건 + 코랄 뱃지) |

### 15.4 향후 검토 (Today Forecast 패턴)

별도 mockup `today-features-20260605`에서 "오늘의 하루" weather pattern 검증.
production 적용 시 Stage 2로 진행. 매출 정책 ✗을 그대로 따름.

---

## 12. 변경 이력

| 일자 | 버전 | 주요 변경 |
| --- | --- | --- |
| 2026-06-11 | **v7** | **V1.9 — Pure White + Twin Tabs + 날씨 연동**: 전 페이지 헤더 Pure White 통일 (살구 그라데·코랄 라인 폐기) / Twin Tabs 패턴 (커뮤니티·동료·활동량 시트 — 텍스트+underline, 이모지 ✗) / 검색+필터아이콘+드로어 패턴 (커뮤니티·중고거래) / 글래스 FAB 통일 (스케줄·커뮤니티·중고) / 날씨 연동 hero (홈↔스케줄 색 동기화) / 활동량 Bento 통계 시트 (일/주/월/년, level별 컬러) / 커뮤니티 HOT 티커 / 통계 큰 숫자 800/900 허용 |
| 2026-06-05 | **v6** | **V1.7 — 매출 정책 + 접근성 (섹션 15)**: 정산 tile → 커뮤니티 tile 교체 / 매출 단어·숫자·sparkline 홈에서 ✗ / focus-visible + min-height 44px + prefers-reduced-motion 글로벌 / DESIGN.md에 매출 정책 명문화 |
| 2026-06-03 | **v5** | **홈 V1.5 — Action Hub (섹션 14)**: hero 매출 제거 / `.tile-grid` 2×2 / F 색 정책 (숫자 다크 통일 + 뱃지 의미별) / 정산 sparkline 코랄 / `/api/stats/weekly` 신규 endpoint / 빈 상태 status-card → quote 분기 |
| 2026-06-03 | **v4** | **브랜드 정체성 가이드 (섹션 13)**: 코랄 차별화 옵션 / mint/teal 통합 결정 / 마스코트 변종 5종 계획 / 사진 hero 한국 컨텍스트 / voice·tone 가이드 |
| 2026-05-27 | **v3** | **입체감 + 발광 + 글로벌 hook**: 5단계 elevation (`--sh-xs/sm/md/lg/xl`) + 컬러 그림자 (`--sh-pr/pr-sm/pr-lg/teal`) + highlight (`--hl-top/strong`) + spring transition (`--ease-spring`, `--dur-fast/normal/slow`) / 헤더 A안 풀 (앰비언트 오브 + 메쉬 + 라인 글로우) / 카드·네비·시트 발광 확장 / 14개 페이지 글로벌 hook으로 자동 반영 / 12개 페이지 font-weight 800/900 → 700 일괄 |
| 2026-05-26 | v2 | Toss/Kakao 톤 모던화 (색상 g900 `#222`→`#191F28`, 폰트 lg 16→15px, xl 20→17px, fw 800→700 일괄, ls/lh 토큰 추가) |
| 2026-05-26 | v1.5 | `.ds-page-header / .ds-status-tabs-wrap / .ds-swipe-* / .ds-list-*` 신규 컴포넌트 추가 (quote-list 마이그레이션 동반) |
| 2026-05-02 | v1.0 | 초기 design.css (Airbnb 톤) |

---

> 본 문서의 단일 진실 원본은 `design.css`. 토큰 값이 다르면 design.css가 정답입니다.
> 디자인 검증 시 `snapshots/latest/ssak-app/design.css` 파일을 참조하세요.
