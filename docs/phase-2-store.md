# Phase 2 — App Store · Play Store

> 목표: EAS Build/Submit으로 **iOS + Android 2곳** 라이브.  
> 코드·문서 기준선: `feat/phase-2-store`

---

## 완료 정의

| 항목 | 상태 |
|------|------|
| 프라이버시 정책 URL (`/privacy`) | ✅ 웹 페이지 |
| 로그아웃 (앱·웹) | ✅ Phase 0~1 |
| 계정 삭제 (앱·웹) | ✅ `delete_own_account` RPC |
| 빈 상태·에러 UI | ✅ Phase 0~1 |
| EAS `eas.json` 프로필 | ✅ development / preview / production |
| Apple Developer · Play Console 계정 | ⬜ 수동 |
| EAS 프로젝트 연결 (`eas init`) | ⬜ 수동 |
| 스토어 메타·스크린샷·데모 계정 | ⬜ 수동 |
| iOS + Android 라이브 URL | ⬜ 제출 후 |

---

## 선행 체크리스트 (수동)

### 계정·비용

- [ ] [Apple Developer Program](https://developer.apple.com/programs/) ($99/yr)
- [ ] [Google Play Console](https://play.google.com/console) ($25 일회)

### Supabase

- [ ] `supabase db push` 또는 Dashboard에서 `20260831100000_delete_own_account.sql` 적용
- [ ] Auth redirect URL에 **프로덕션** 추가:
  - `tickerjournal://auth/callback`
  - `https://<web-domain>/auth/callback`
- [ ] 심사용 **데모 계정** (이메일/비번) — Play/App Store 리뷰 노트에 기재

### 웹 (Vercel)

- [ ] 프로덕션 URL 확정 → `NEXT_PUBLIC_SITE_URL` / `EXPO_PUBLIC_WEB_URL`
- [ ] App Store Connect · Play Console **Privacy Policy URL** = `https://<web-domain>/privacy`

### EAS

```bash
cd apps/mobile
pnpm dlx eas-cli login
pnpm dlx eas-cli init          # projectId → app.json extra.eas
pnpm dlx eas-cli build --platform ios --profile production
pnpm dlx eas-cli build --platform android --profile production
pnpm dlx eas-cli submit --platform ios --latest
pnpm dlx eas-cli submit --platform android --latest
```

환경 변수(EAS Secrets 또는 `eas.json` env):

| 이름 | 용도 |
|------|------|
| `EXPO_PUBLIC_SUPABASE_URL` | 앱 빌드 |
| `EXPO_PUBLIC_SUPABASE_KEY` | 앱 빌드 (anon) |
| `EXPO_PUBLIC_WEB_URL` | 설정 화면 프라이버시 링크 |

---

## 심사 대응 (4종 경로)

1. **빈 목록** — 관심종목 0개 안내 (`apps/mobile/app/index.tsx`, 웹 홈)
2. **에러** — API 실패 메시지 (목록·상세)
3. **로그아웃** — 웹 홈·설정, 앱 설정
4. **계정 삭제** — 웹 `/settings`, 앱 설정 → 확인 다이얼로그 → RPC

데모 계정으로 **2분 플로우** 녹화/기재:

로그인 → 관심종목 → 종목 상세(차트+엔트리) → (웹) 검색 회수

---

## 스토어 메타 초안

| 필드 | 초안 |
|------|------|
| 앱 이름 | Ticker Journal |
| 부제 | 종목 타임라인 리서치 저널 |
| 카테고리 | Finance / Productivity |
| 연령 | 4+ (금융 데이터 표시, 투자 조언 없음) |
| Privacy Policy | `https://<web-domain>/privacy` |

---

## 일정 버퍼

기능 동결 후 심사·수정 **2–4주** 가정 (`docs/design.md` Distribution Plan).

---

## 갱신 로그

| 날짜 | 내용 |
|------|------|
| 2026-08-31 | Phase 2 착수: RPC·설정·프라이버시·EAS 스캐폴드 |
