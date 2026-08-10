# Ticker Journal

종목 단위 리서치 저널 — Expo(React Native) + Next.js 모노레포.

디자인 문서: `~/.gstack/projects/ayaan/ayaan-unknown-design-20260811-074915.md`

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
```

## 테스트

계층·RN 선택 이유: `docs/testing.md`

## 환경 변수

`.env.example` 참고. Supabase 키는 Phase 0에서 연결.

## 이력서 · 포트폴리오

구현과 함께 문서를 갱신한다.

- `docs/portfolio.md` — 과정 / 어려웠던 점 / 배운 점
- `docs/resume-bullets.md` — 이력서 복붙용 불릿

## 로드맵

- Phase 0: Auth + CRUD (앱)
- Phase 1: 웹 검색/상세
- Phase 2: App Store + Play Store
- v1.1 공유 시트 / v2 AI 주간 브리핑
