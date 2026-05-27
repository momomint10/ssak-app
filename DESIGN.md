# 싹싹(Ssak-ssak) 디자인 시스템

> **버전**: design.css v3 (2026-05-27 — 입체감·발광 시스템 + 글로벌 hook)
> **레퍼런스 톤**: Toss, Kakao Bank, Daangn (한국 모바일 표준 + 발광 입체감)
> **타겟 사용자**: 30~50대 입주청소 사장님 (다양 연령대 — 노년 친화 over-fit 회피)
> **단일 진실 원본**: `design.css` (이 문서는 그 사람이 읽기 좋게 정리한 사본)

---

## 1. 디자인 원칙 (Output Criteria)

### ✅ Simplicity — 심플
- 페이지당 핵심 정보 4~6개로 제한 (카드: 이름·연락처·핵심태그·금액·상태·시간)
- 부가 정보(⚠️/🔌/📸)는 sub 라인에 dot 압축
- font-weight 800/900 사용 금지 (모두 700으로 통일)
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
- **헤더 배경**: `linear-gradient(160deg, #FFF8F5 0%, #FFFFFF 60%)` — 따뜻한 톤 살짝 침투
- **헤더 하단 라인**: `linear-gradient(90deg, var(--c-pr) 0%, #FC8181 100%)` — 코랄 액센트
- **CTA 통계 카드**: 코랄 그라데이션 (큰 숫자 강조 시)

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

## 12. 변경 이력

| 일자 | 버전 | 주요 변경 |
| --- | --- | --- |
| 2026-05-27 | **v3** | **입체감 + 발광 + 글로벌 hook**: 5단계 elevation (`--sh-xs/sm/md/lg/xl`) + 컬러 그림자 (`--sh-pr/pr-sm/pr-lg/teal`) + highlight (`--hl-top/strong`) + spring transition (`--ease-spring`, `--dur-fast/normal/slow`) / 헤더 A안 풀 (앰비언트 오브 + 메쉬 + 라인 글로우) / 카드·네비·시트 발광 확장 / 14개 페이지 글로벌 hook으로 자동 반영 / 12개 페이지 font-weight 800/900 → 700 일괄 |
| 2026-05-26 | v2 | Toss/Kakao 톤 모던화 (색상 g900 `#222`→`#191F28`, 폰트 lg 16→15px, xl 20→17px, fw 800→700 일괄, ls/lh 토큰 추가) |
| 2026-05-26 | v1.5 | `.ds-page-header / .ds-status-tabs-wrap / .ds-swipe-* / .ds-list-*` 신규 컴포넌트 추가 (quote-list 마이그레이션 동반) |
| 2026-05-02 | v1.0 | 초기 design.css (Airbnb 톤) |

---

> 본 문서의 단일 진실 원본은 `design.css`. 토큰 값이 다르면 design.css가 정답입니다.
> 디자인 검증 시 `snapshots/latest/ssak-app/design.css` 파일을 참조하세요.
