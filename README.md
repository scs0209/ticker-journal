# Ticker Journal

종목 단위 리서치 저널 — Expo(React Native) + Next.js 모노레포.

- 설계: [`docs/design.md`](docs/design.md)
- 아키텍처 (Phase 0 기준선): [`docs/architecture.md`](docs/architecture.md)

## 구조

```
apps/mobile   Expo Router + WebView 차트 자리
apps/web      Next.js App Router (검색/아카이브)
packages/shared  zod 스키마 (tickers / entries)
```

## 시작

```bash
pnpm install
pnpm --filter @ticker-journal/shared build
pnpm dev:web      # http://localhost:3000
pnpm dev:mobile   # Expo
pnpm test         # Vitest + jest-expo
pnpm test:e2e     # Playwright (web)
pnpm ci           # Biome + typecheck + unit
pnpm check        # Biome lint + format check
pnpm check:fix   # Biome auto-fix
pnpm typecheck
```

## 린트 · 포맷

[3d-blog](https://github.com/scs0209/3d-blog)와 같은 Biome 2.5.7 설정 (`biome.json`). VS Code는 `.vscode/settings.json`에서 Biome 기본 포맷터를 사용한다.

| 스크립트 | 설명 |
|----------|------|
| `pnpm format` | 포맷 적용 |
| `pnpm format:check` | 포맷만 검사 |
| `pnpm lint:biome` | 린트 |
| `pnpm check` / `check:fix` | 린트+포맷 |

## 테스트

계층·RN 선택 이유: `docs/testing.md`

## 환경 변수

`.env.example` 참고. Supabase 키는 Phase 0에서 연결.

## 이력서 · 포트폴리오

구현과 함께 문서를 갱신한다.

- `docs/design.md` — office-hours 설계 (범위·스키마·화면)
- `docs/architecture.md` — Phase 0 아키텍처 기준선
- `docs/portfolio.md` — 과정 / 어려웠던 점 / 배운 점 / **와이어·머메이드**
- `docs/resume-bullets.md` — 이력서 복붙용 수치 불릿
- `docs/assets/` — 와이어프레임 PNG·HTML

## 로드맵

- Phase 0: Auth + CRUD (앱) — 브랜치 `feat/phase-0-auth-crud`
- Phase 1: 웹 검색/상세
- Phase 2: App Store + Play Store
- v1.1 공유 시트 / v2 AI 주간 브리핑

### Phase 0 로컬 설정

1. [Supabase](https://supabase.com) 프로젝트 생성
2. SQL Editor 또는 CLI로 `supabase/migrations/20260813100000_init.sql` 적용
3. Auth → URL Configuration에 추가:
   - `tickerjournal://auth/callback` (모바일)
   - `http://localhost:3000/auth/callback` (웹)
4. `apps/mobile/.env` — `EXPO_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_KEY`
5. `apps/web/.env` — `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. `pnpm dev:mobile` / `pnpm dev:web` 후 매직링크 로그인
