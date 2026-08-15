import { describe, expect, it } from 'vitest';

import { resolveAuthCallbackPath } from './redirect';

describe('resolveAuthCallbackPath', () => {
  it('교환에 성공하면 next 경로로 보낸다', () => {
    expect(
      resolveAuthCallbackPath({
        code: 'abc',
        exchangeOk: true,
        next: '/tickers',
      }),
    ).toBe('/tickers');
  });

  it('next가 없으면 홈으로 보낸다', () => {
    expect(resolveAuthCallbackPath({ code: 'abc', exchangeOk: true })).toBe('/');
  });

  it('코드가 없으면 로그인 에러로 보낸다', () => {
    expect(resolveAuthCallbackPath({ code: null, exchangeOk: false })).toBe('/login?error=auth');
  });

  it('교환에 실패하면 로그인 에러로 보낸다', () => {
    expect(resolveAuthCallbackPath({ code: 'abc', exchangeOk: false })).toBe('/login?error=auth');
  });

  it('외부 URL next는 홈으로 보낸다', () => {
    expect(
      resolveAuthCallbackPath({
        code: 'abc',
        exchangeOk: true,
        next: 'https://evil.example',
      }),
    ).toBe('/');
  });
});
