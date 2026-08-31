# 테스트 기준

테스트를 추가하기 전에 아래 질문을 통과해야 한다. 통과 못하면 작성하지 않는다.

1. **깨지면 사용자가 알아채는가?** (스키마 변환, 잘못된 화면, 잘못된 리다이렉트)
2. **이미 위 레이어가 같은 동작을 보는가?** (E2E가 커버하면 컴포넌트/단위를 중복하지 않는다)
3. **성공 조건이 목 호출인가?** 그러면 잘못된 테스트다. 화면 텍스트, URL, 순수 함수 반환값만 assert한다.
4. **환경마다 달라지는가?** `toLocaleString`·타임존·날짜 “지금”·랜덤·OR로 “뭐든 통과”하는 assert는 flaky/무의미 → 작성하지 않는다.

`describe`/`it`/`test` 설명은 **한국어**. 대상 이름(`CreateTickerSchema`, `HomeView`)만 영어 식별자를 쓴다.

## 레이어

현재 **4계층**이다. (모바일 화면 Maestro E2E는 예정이라 아직 세지 않는다.)

| 레이어 | 대상 | 도구 | 하지 않는 것 |
|--------|------|------|----------------|
| shared 단위 | Zod 스키마, `buildChartHtml` | Vitest | supabase/OTP를 목킹하고 `toHaveBeenCalled` |
| mobile 단위 | (Maestro E2E 예정) | jest-expo | expo-router/Auth를 목킹한 화면 테스트 |
| 웹 컴포넌트 | 웹 순수 뷰만 (`HomeView` props → 텍스트) | RTL | 라우터/Auth를 목킹한 화면 테스트 |
| 웹 E2E | 웹 사용자 플로우: 홈, 로그인, `/search` 비로그인 가드 | Playwright | 매직링크 메일·실세션 (인박스 없음) |

웹 페이지 플로우 = Playwright. 웹 RTL은 **props → 텍스트**인 순수 뷰만 (예: 로그인된 `HomeView` 종목). 라우팅·폼 제출·Auth는 E2E.

## 지금 허용된 테스트

- `packages/shared` — 스키마 정규화/거부, `buildChartHtml` (US 위젯 / KR fallback)
- `apps/web` `resolveAuthCallbackPath` — 콜백 성공/실패 경로 (웹 단위)
- `apps/web` `HomeView` — 로그인된 종목 표시, 조회 실패 메시지 (E2E에 세션 없음)
- `apps/web` `SearchView` — 검색 실패 vs 빈 결과 구분 (E2E에 세션 없음)
- `apps/web` `SettingsView` — 계정 이메일·삭제 경고·프라이버시 링크
- `apps/web` `search-query` — ILIKE escape, merge·페이지 (deterministic)
- Playwright — `/`, `/login`, `/search` 비로그인 가드, `/privacy`, `/settings` → `/login` (dev 서버에 Supabase placeholder env)

Playwright `webServer`는 `NEXT_PUBLIC_SUPABASE_*` placeholder를 넣어 `configured=true`·세션 없음 상태를 만든다. CI에 실 Supabase/매직링크 세션은 없다.

모바일 화면(관심종목·상세)은 라우터 없이 마운트되지 않는다. 구현 mock으로 목록을 그리는 테스트는 하지 않고, Maestro E2E에서 다룬다.

## 명령

```bash
pnpm test              # 단위 + 컴포넌트
pnpm test:coverage     # 단위·컴포넌트 커버리지(정량 %)
pnpm test:e2e          # Playwright (web)
pnpm run ci            # Biome + typecheck + unit (pre-commit 훅과 동일)
```

### 커버리지(정량)

`pnpm test:coverage`로 **라인/브랜치 %**를 본다. HTML은 각 패키지 `coverage/index.html`.

측정 범위는 `docs/testing.md` 허용 대상(단위·컴포넌트)이다. 화면·Auth·라우팅은 E2E/Maestro 영역이라 여기 %에 넣지 않는다. **%를 올리려고 목킹 테스트를 추가하지 않는다.**

| 패키지 | 포함 파일 | Lines (참고) |
|--------|-----------|--------------|
| shared | `src/index.ts`, `src/chart.ts` | ~100% |
| web | `redirect.ts`, `HomeView`, `SearchView`, `search-query` | 참고 |
| mobile | (Maestro 예정) | — |

로컬: Husky `pre-commit`은 `pnpm run ci`만 실행한다 (`check` + `typecheck` + `test`).  
GitHub Actions는 여기에 **`test:coverage` · `check:db-types`(local Supabase) · Playwright E2E**를 더 돌린다. 커밋이 통과해도 CI가 더 넓은 게이트다.
