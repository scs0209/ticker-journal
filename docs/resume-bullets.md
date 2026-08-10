# Ticker Journal — 이력서 문구

> 지원 포지션에 맞게 **2~4줄만** 골라 쓴다.  
> 진행 중 항목은 배포/수치 나오면 `[예정]`을 실제 성과로 교체.

---

## 한 줄 (Projects 섹션 타이틀용)

**Ticker Journal** — 종목 리서치·매매 기록을 타임라인으로 묶는 Expo/Next.js 크로스플랫폼 앱 (스토어 배포 목표)

---

## 불릿 (권장 3~5개)

### 지금 바로 쓸 수 있는 것 (스캐폴드 기준)

- 주식 리서치·매매 이유가 노션/시트에 분산되는 문제를 정의하고, 종목 단위 타임라인 MVP로 범위를 좁혀 기획·설계
- Expo(React Native) + Next.js + 공유 Zod 스키마 기반 **pnpm/Turborepo 모노레포**로 웹·모바일 동일 도메인 모델 구성
- Expo Router로 관심종목·종목 상세 네비게이션을 구성하고, 차트 영역은 **WebView**로 분리해 네이티브 셸 + 임베드 하이브리드 구조 적용
- TypeScript strict + 패키지 typecheck / Next production build로 모노레포 기본 품질 게이트 구축
- **Vitest**(shared/web) · **Testing Library** · **Playwright**(웹 E2E) · **jest-expo + RNTL**(모바일)로 단위·컴포넌트·E2E 계층 구성; 모노레포 React 버전 충돌을 `pnpm.overrides`로 해결

### Phase 0~1 이후 추가할 문구

- `[예정]` Supabase 매직링크 인증과 RLS 기반 tickers/entries CRUD로 앱·웹 동일 계정 데이터 동기화
- `[예정]` 웹 검색(아카이브)과 모바일 입력을 한 API/스키마로 연결해 풀스택 모바일 사이클 구현

### Phase 2 이후 추가할 문구 (이력서 임팩트 핵심)

- `[예정]` EAS Build/Submit로 **App Store · Google Play** 배포 및 심사용 빈 상태·계정 삭제·프라이버시 정책 대응
- `[예정]` (수치) 실사용 관심종목 N개, 주간 기록 M건, 스토어/웹 URL

---

## Skills / Tech 키워드

`React Native` · `Expo` · `Expo Router` · `TypeScript` · `Next.js` · `Zod` · `Monorepo` · `pnpm` · `Turborepo` · `WebView` · `Vitest` · `Testing Library` · `Playwright` · `Jest` · `Supabase`(예정) · `EAS` / App Store / Play Store(예정)

---

## 면접에서 말할 스토리 (30초)

1. **왜:** RN을 배우면서 이력서에 모바일·스토어를 남기고 싶었고, 본인이 노션+시트로 주식 메모를 흩뜨려 쓰고 있었다.  
2. **무엇을:** 종목 타임라인 저널. 차트는 WebView, 입력·목록은 네이티브. 웹에서 같은 데이터 검색.  
3. **어떻게:** 모노레포로 스키마 공유. SaaS로 안 가고 MVP를 얇게 유지한 뒤 스토어를 성공 조건으로 둠.  
4. **결과:** *(배포 URL · 데모 · 배운 점 한 줄)*

---

## 갱신 규칙

기능 마일스톤(Auth 완료, 첫 CRUD, 스토어 제출 등)마다:

1. 위 불릿의 `[예정]`을 과거형·성과형으로 바꾸고  
2. `docs/portfolio.md`의 과정/어려움/배운 점에 2~4줄 추가한다.
