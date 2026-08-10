# Ticker Journal — 포트폴리오

> 목적: 이력서/포트폴리오에 붙일 **과정 · 어려웠던 점 · 배운 점** 기록.  
> 기능 구현이 끝날 때마다 이 문서를 갱신한다.

| 항목 | 내용 |
|------|------|
| 기간 | 2026-08 ~ (진행 중) |
| 역할 | 개인 프로젝트 (기획 · 설계 · 풀스택 · 모바일 · 배포) |
| 스택 | Expo (React Native), Expo Router, Next.js, TypeScript, Zod, pnpm monorepo, Turborepo, WebView, Vitest, RTL, jest-expo, Playwright, (예정) Supabase, EAS Submit |
| 레포 | `~/Projects/ticker-journal` |
| 설계 문서 | `~/.gstack/projects/ayaan/ayaan-unknown-design-20260811-074915.md` |

---

## 한 줄 요약

노션·시트에 흩어진 주식 리서치·매매 이유를 **종목 타임라인**으로 묶고, **모바일(앱)에서 빠르게 입력 · 웹에서 검색·정리**하며, **App Store / Play Store 배포**까지 가는 React Native 학습·포트폴리오 프로젝트.

---

## 1. 과정 (Process)

### 1.1 문제 정의

- 학습 목표: React Native를 “만들면서” 배우기 + 이력서에 모바일·스토어 배포 어필
- 실제 불편: 관심 종목 관련 링크/메모/매매 이유가 노션·메모장·시트에 분산
- 제품 쐐기: **종목 단위 리서치 저널** (스크랩 + 매매 기록 타임라인)
- 의도적으로 하지 않은 것: Tradervue식 브로커 연동·승률 SaaS (범위 폭발 방지)

### 1.2 설계 결정 (Office Hours)

- **Builder 모드**로 목표를 Learning + Having fun + 이력서 신호로 고정
- 대안 비교 후 **B-lite** 채택: `apps/mobile` + `apps/web` + `packages/shared` 모노레포, MVP 화면은 얇게, 스토어는 iOS·Android 둘 다
- WebView만 감싼 래퍼(Approach C)는 “RN을 얼마나 짰나” 면접 리스크 때문에 기각
- Premises: AI 주간 브리핑은 v2, 차트는 WebView 임베드, 스토어 등록이 성공 조건
- 와이어프레임으로 앱 목록 → 종목 상세(차트+타임라인) → 웹 검색 루프 확정

### 1.3 스캐폴드 (2026-08-11)

- `pnpm` workspace + Turborepo
- Expo blank-typescript → **Expo Router** + `react-native-webview` 로 화면 뼈대
- Next.js App Router 웹 랜딩
- `@ticker-journal/shared`에 tickers/entries Zod 스키마 (memo | link | trade)
- Metro monorepo `watchFolders` / Next `transpilePackages` 연결
- typecheck(shared/web/mobile) · Next production build 통과 확인

### 1.4 테스트 계층 (2026-08-11)

- `shared`: Vitest (Zod 스키마 단위)
- `web`: Vitest + Testing Library (컴포넌트), Playwright (E2E)
- `mobile`: **jest-expo + RNTL** (Expo 공식 경로; RN은 Vitest 대신 Jest)
- 문서: `docs/testing.md`

### 1.5 이후 로드맵 (체크리스트)

- [ ] Phase 0: Supabase Auth(매직링크) + tickers/entries CRUD (앱)
- [ ] Phase 1: 웹 검색·종목 상세·동일 계정
- [ ] Phase 2: 프라이버시 정책 · 데모 계정 · EAS → App Store / Play Store
- [ ] v1.1 공유 시트 / v2 AI 주간 브리핑

---

## 2. 어려웠던 점 (Challenges)

| 시점 | 어려움 | 대응 |
|------|--------|------|
| 기획 | “RN 학습용”만 하면 Todo 클론이 되고, “주식 SaaS”로 가면 범위가 커짐 | 본인 워크플로(노션+시트) 구멍만 제품화. 브로커 연동 제외 |
| 아키텍처 | WebView 중심이 편하지만 이력서·면접에서 감점 가능 | **네이티브 셸(네비·리스트·입력) + WebView 차트** 하이브리드 |
| 성공 조건 | 내부 배포만으로는 이력서 신호가 약함 | **양 스토어 리스팅**을 Success Criteria에 포함, 기능은 더 얇게 |
| 모노레포 | Expo·Next가 각자 lock/workspace를 만들며 충돌 가능 | 루트 `pnpm-workspace`만 유지, 앱 내부 lock 제거, Metro/Next에 shared 해석 설정 |
| 스키마 | KR(`005930`) + US(`AAPL`) + 차트 제공자 미결정 | MVP: `market + symbol`, US 차트 우선, KR은 fallback 링크로 ADR화 |
| 테스트 | 웹 RTL이 빈 DOM만 렌더 (heading 못 찾음) | Expo React `19.2.3`과 Next `react-dom` `19.2.8` 혼선 → `pnpm.overrides`로 React 정렬 |
| RN 테스트 | Vitest로 RN까지 통일하고 싶었으나 Expo 모킹·preset이 Jest 중심 | **계층 분리**: shared/web=Vitest, mobile=jest-expo+RNTL |

*(Phase 0 이후: Auth deep link, WebView nested scroll, 스토어 심사 이슈를 이 표에 추가)*

---

## 3. 배운 점 (Learnings)

- **포트폴리오용 모바일은 “기능 수”보다 “배포·네이티브 표면”이 신호다.** 스토어 URL·딥링크·WebView·공유 스키마가 Todo 앱보다 설득력이 크다.
- **대체재를 정확히 짚으면 경쟁사가 바뀐다.** 경쟁은 Tradervue가 아니라 노션+시트 분산이었다.
- **모노레포는 이력서 스토리와 학습 밀도에 유리하다.** 웹·앱이 같은 Zod/타입을 쓰면 “풀스택 모바일” 한 줄이 생긴다.
- **Office Hours식 premises/대안 비교**로 “하고 싶은 것”과 “2–3주에 스토어까지”를 분리할 수 있었다.
- 기술: Expo Router 파일 기반 라우팅, pnpm workspace + Turborepo, Metro monorepo resolve, Next `transpilePackages`.
- **모노레포에서 React 버전을 강제로 맞추지 않으면 RTL이 조용히 빈 트리를 그린다.** `pnpm.overrides`가 품질 게이트의 일부다.
- **도구 통일보다 계층이 맞는지가 중요하다.** RN은 jest-expo, 웹/공용은 Vitest+Playwright로 이력서에도 “단위·컴포넌트·E2E”로 말할 수 있다.

---

## 4. 포트폴리오 본문 초안 (복붙용)

### 프로젝트 소개

Ticker Journal은 주식 리서치 스크랩과 매매 이유를 종목 타임라인으로 관리하는 크로스플랫폼 앱입니다. 모바일에서는 빠른 입력과 WebView 차트를, 웹에서는 동일 계정의 검색·정리를 제공합니다. React Native 학습과 스토어 배포 경험을 목표로 Expo·Next.js 모노레포로 구현 중입니다.

### 내가 한 일

- 문제 정의 및 MVP 범위 설정 (브로커 SaaS 제외, 종목 타임라인 쐐기)
- pnpm/Turborepo 모노레포 설계 (`mobile` / `web` / `shared`)
- Expo Router 기반 관심종목·종목 상세 화면 뼈대, WebView 차트 플레이스홀더
- Zod 기반 ticker/entry 스키마로 웹·앱 공유 계약 정의
- (예정) Supabase Auth·CRUD, EAS 스토어 제출

### 성과 / 임팩트

- *(스토어 URL, 실사용 종목 수, 데모 영상 링크 — Phase 2 이후 기입)*

---

## 5. 갱신 로그

| 날짜 | 무엇이 바뀌었나 |
|------|----------------|
| 2026-08-11 | 설계 승인, 모노레포 스캐폴드, 이 문서 최초 작성 |
| 2026-08-11 | Vitest/RTL/Playwright + jest-expo 테스트 계층 추가, React 버전 충돌 해결 |
| 2026-08-11 | 이력서 문구를 구현 나열 → **수치·임팩트 지표** 중심으로 재작성 |
