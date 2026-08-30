# Ticker Journal — 이력서 문구 (수치 중심)

> 원칙: **기술 나열 < 측정 가능한 결과**.  
> 불릿 1개 = `행동 + 대상 + 수치/범위 + (가능하면) 전후 비교`.  
> 스택은 Skills 한 줄에만 두고, Projects 불릿에는 숫자를 넣는다.  
> 마일스톤마다 이 파일 + `docs/portfolio.md`를 **같이** 갱신한다.

---

## 지금 당장 쓸 수 있는 수치 (Phase 0 기준)

- 웹·모바일 **2앱** + 공유 패키지 **1개** 모노레포로 도메인 스키마를 한곳(`packages/shared`)에 두고, 테스트 **4계층**(shared 단위 · mobile 단위 · 웹 컴포넌트 · 웹 E2E) + **GitHub Actions CI** (`check` / `typecheck` / `test` / Playwright)
- 관심종목 → 종목 상세(WebView) → 웹 아카이브까지 **핵심 루프 3화면**으로 MVP 고정, 브로커 SaaS 범위는 제외
- Supabase **Auth(이메일/비번 + 매직링크 + Google OAuth) + RLS**로 앱·웹 **동일 계정** 경로 확보: 모바일 CRUD(관심종목·memo/link/trade) + 웹 관심종목 조회
- 차트는 TradingView WebView(US) / KR fallback으로 분리해 네이티브 차트 공수를 제외하고 Phase 0 일정 유지

*(실사용 종목 수·스토어 URL이 생기면 아래 표의 숫자를 채운 뒤 불릿을 교체한다.)*

---

## 출시 후 채워야 할 임팩트 지표 (이게 본게임)

출시·실사용 전에 이력서에 “구현했다”만 쓰지 말고, 아래를 **매주 기록**한다.

| 지표 | 목표 예시 | 이력서 문장 틀 | 현재 |
|------|-----------|----------------|------|
| 스토어 | App Store + Play **2곳** 라이브 | “iOS·Android 스토어 **2곳** 배포 완료 (URL)” | 미착수 |
| 본인 실사용 | 관심종목 **≥10**, 주간 entry **≥20** | “본인 워크플로로 종목 N개·주간 기록 M건 운영” | 마이그레이션 적용 후 채움 |
| 입력 속도 | 노션 대비 기록 시간 **X%↓** 또는 **N초** | “모바일 입력으로 스크랩·매매 이유 기록 평균 Ns” | 미측정 |
| 검색 회수 | 웹에서 과거 메모 찾기 **성공률** / 시간 | “웹 검색으로 과거 리서치 회수 시간 Y분→Z분” | **2026-08-30** 실계정 스모크 **4항목 통과**; 자동 측정(8/29) `/search` **~1.3s**. Before(노션/시트) 미측정 |
| 품질 | 테스트 **N건**, CI 통과, 크래시 **0** | “단위·E2E N건·스토어 심사용 경로 충족” | 테스트 **20+3건**, Lines shared/mobile **100%** · web **~81%**, GitHub Actions CI 통과, Phase 0 실계정 스모크 완료 |
| 범위 통제 | 제외한 기능 **K개**, 출시까지 **D주** | “브로커 연동 등 K개 제외, D주 내 스토어 제출” | 브로커·AI 브리핑 제외 |

---

## 나쁜 예 → 좋은 예

| 약함 (구현 나열) | 강함 (수치·결과) |
|------------------|------------------|
| Expo Router로 네비게이션 구성 | 핵심 플로우 **3화면**으로 MVP 고정 후 스토어 **2곳** 배포 목표 |
| Vitest, Playwright 도입 | 테스트 **4계층** + GitHub Actions CI로 회귀 방지, React·TS 버전 정렬 후 전 패키지 green |
| Supabase CRUD 구현 | 앱·웹 **동일 계정** + RLS로 종목 목록 동기화 경로 확보 |
| WebView로 차트 넣음 | 차트는 WebView로 분리해 네이티브 범위 **축소**, Phase 0에서 US embed / KR fallback |

---

## Phase별 불릿 템플릿 (숫자 채우기)

### Phase 0 (Auth·CRUD·웹 세션) — 완료

- `[x]` Expo·Next **동일 Supabase 프로젝트**에 Auth(이메일/비번·매직링크·Google)를 붙이고, Postgres `tickers`/`entries` + RLS로 모바일 CRUD·웹 관심종목 조회까지 연결
- `[x]` 관심종목·엔트리(memo/link/trade) 입력 경로를 Zod 공유 스키마로 검증하고, US TradingView WebView / KR fallback으로 차트 표면을 분리
- `[x]` 모노레포 테스트 **4계층** + 커버리지(`pnpm test:coverage`) + GitHub Actions(`check`/`typecheck`/`test`/E2E) + Biome + TypeScript 7으로 품질 게이트 유지
- `[x]` 본인 계정으로 관심종목 **3**개·entry 입력 후 웹에서 **동일 관심종목 목록** 수동 스모크 완료

### Phase 1 (웹 검색·상세) — 완료

- `[x]` 웹 `/search?q=` ILIKE 검색(페이지 20) + 결과 → 종목 상세 Link
- `[x]` `/ticker/[id]` TradingView iframe(US) / KR fallback + 타임라인 필터 + 엔트리 CRUD
- `[x]` 앱 입력 → 웹 검색·종목 상세·CRUD **실계정 스모크 4항목** 수동 확인 (2026-08-30)
- `[x]` 웹 검색 지연 **평균 ~1.2s** · 홈→검색 UX **~1.1s** (Playwright, `docs/assets/search-retrieval-metrics.json`)

### Phase 2 (스토어 = 이력서 임팩트 피크)

- `[ ]` **App Store + Google Play 2곳** 배포 (링크)
- `[ ]` 심사 대응: 빈 상태·에러·로그아웃·계정 삭제 경로 **4종** 충족, 데모 계정 제공
- `[ ]` 출시 후 **__주**간 본인 실사용: 종목 **__** / 주간 기록 **__** / 크래시 **0**

### 면접 30초 (숫자만 남기기)

1. 문제: 노션+시트에 리서치가 흩어짐  
2. 결과: 종목 타임라인 앱+웹, (목표) 스토어 **2곳**, 실사용 종목 **N**·주간 **M**  
3. 어떻게: MVP **3화면**, 테스트 **4계층 + CI**, Zod 1곳, Supabase Auth+RLS  
4. 링크: 레포 / 웹 / (스토어)

---

## Skills (여기만 기술 나열)

`React Native` · `Expo` · `Next.js` · `TypeScript` · `Zod` · `Monorepo` · `Biome` · `Vitest` · `Playwright` · `Jest` · `Supabase` · `EAS` / Store(예정)

---

## 갱신 규칙

1. 코드 마일스톤이 끝나면 **숫자부터** 이 파일을 고친다.  
2. 과정·어려움·배운 점은 `docs/portfolio.md`에만 길게 쓴다.  
3. 커밋 시 문서 변경을 같은 커밋(또는 직전 `docs:`)에 포함한다.
