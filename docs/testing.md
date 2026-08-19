# 테스트 기준

테스트를 추가하기 전에 아래 질문을 통과해야 한다. 통과 못하면 작성하지 않는다.

1. **깨지면 사용자가 알아채는가?** (스키마 변환, 잘못된 화면, 잘못된 리다이렉트)
2. **이미 위 레이어가 같은 동작을 보는가?** (E2E가 커버하면 컴포넌트/단위를 중복하지 않는다)
3. **성공 조건이 목 호출인가?** 그러면 잘못된 테스트다. 화면 텍스트, URL, 순수 함수 반환값만 assert한다.

`describe`/`it`/`test` 설명은 **한국어**. 대상 이름(`CreateTickerSchema`, `HomeView`)만 영어 식별자를 쓴다.

## 레이어

| 레이어 | 대상 | 도구 | 하지 않는 것 |
|--------|------|------|----------------|
| 단위 | Zod, `buildChartHtml`, `resolveAuthCallbackPath` | Vitest / Jest | supabase/OTP를 목킹하고 `toHaveBeenCalled` |
| 컴포넌트 | 웹 순수 뷰만 (`HomeView` props → 텍스트) | RTL | 라우터/Auth를 목킹한 화면 테스트 |
| E2E | 웹 사용자 플로우: 홈, 로그인 페이지 | Playwright | 매직링크 메일·실세션 (인박스 없음). 모바일은 Maestro 전까지 E2E 없음 |

웹 페이지 플로우 = Playwright. 웹 RTL은 **props → 텍스트**인 순수 뷰만 (예: 로그인된 `HomeView` 종목). 라우팅·폼 제출·Auth는 E2E.

## 지금 허용된 테스트

- `packages/shared` — 스키마 정규화/거부
- `apps/mobile/lib/chart.ts` — US 위젯 / KR fallback HTML
- `apps/web` `HomeView` — 로그인된 종목 표시, 조회 실패 메시지 (E2E에 세션 없음)
- `resolveAuthCallbackPath` — 콜백 성공/실패 경로
- Playwright — `/`, `/login`이 뜨는지

모바일 화면(관심종목·상세)은 라우터 없이 마운트되지 않는다. 구현 mock으로 목록을 그리는 테스트는 하지 않고, Maestro E2E에서 다룬다.

## 명령

```bash
pnpm test              # 단위 + 컴포넌트
pnpm test:e2e          # Playwright (web)
pnpm run ci            # Biome + typecheck + unit (pre-commit 훅과 동일)
```

로컬: Husky `pre-commit`이 `pnpm run ci`를 실행한다. Playwright E2E는 브라우저 설치 때문에 커밋 훅에 넣지 않고 GitHub Actions만 돌린다.
