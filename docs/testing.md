# 테스트 전략

| 영역 | 도구 | 이유 |
|------|------|------|
| `packages/shared` | **Vitest** | Zod/순수 로직. 가장, RN 불필요 |
| `apps/web` 컴포넌트 | **Vitest + RTL** | Next/React DOM과 궁합 좋음 |
| `apps/web` E2E | **Playwright** | 브라우저 실사용 플로우 |
| `apps/mobile` | **jest-expo + RNTL** | Expo 공식 경로. Vitest는 RN 네이티브 모듈/모킹이 아직 번거로움 |

## RN을 Vitest로 안 간 이유

- Expo/RN 생태계 예제·모킹(`jest-expo`)이 Jest 기준
- `react-native` / Expo Router / WebView는 Jest transform·preset이 검증됨
- 이력서에는 “계층별 테스트(단위·컴포넌트·E2E)”가 도구 통일보다 설득력 있음

E2E 모바일은 나중에 **Maestro** 또는 Detox를 검토 (스토어 전 스모크).

## 명령

```bash
pnpm test              # 전 패키지 unit/component
pnpm test:e2e          # Playwright (web)
pnpm --filter @ticker-journal/mobile test
```
