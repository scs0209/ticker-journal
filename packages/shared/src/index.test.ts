import { describe, expect, it } from 'vitest';
import { CreateEntrySchema, CreateTickerSchema, TimelineFilterSchema } from './index';

describe('CreateTickerSchema', () => {
  it('심볼을 대문자로 만들고 공백을 제거한다', () => {
    const parsed = CreateTickerSchema.parse({
      market: 'US',
      symbol: ' aapl ',
      name: 'Apple',
    });
    expect(parsed.symbol).toBe('AAPL');
  });

  it('빈 심볼을 거부한다', () => {
    expect(() => CreateTickerSchema.parse({ market: 'KR', symbol: '' })).toThrow();
  });
});

describe('CreateEntrySchema', () => {
  const tickerId = '11111111-1111-1111-1111-111111111111';

  it('memo 타입을 허용한다', () => {
    const parsed = CreateEntrySchema.parse({
      type: 'memo',
      ticker_id: tickerId,
      body: '실적 전 분할매수 메모',
    });
    expect(parsed.type).toBe('memo');
  });

  it('url이 있는 link를 허용한다', () => {
    const parsed = CreateEntrySchema.parse({
      type: 'link',
      ticker_id: tickerId,
      url: 'https://example.com/aapl',
      title: 'earnings',
    });
    expect(parsed.type).toBe('link');
  });

  it('url이 없는 link를 거부한다', () => {
    expect(() =>
      CreateEntrySchema.parse({
        type: 'link',
        ticker_id: tickerId,
      }),
    ).toThrow();
  });

  it('side가 있는 trade를 허용한다', () => {
    const parsed = CreateEntrySchema.parse({
      type: 'trade',
      ticker_id: tickerId,
      side: 'buy',
      traded_at: '2026-08-10T12:00:00.000Z',
      reason: '가이던스 상향',
    });
    expect(parsed.type).toBe('trade');
  });
});

describe('TimelineFilterSchema', () => {
  it('필터 칩 옵션을 모두 허용한다', () => {
    expect(TimelineFilterSchema.options).toEqual(['all', 'memo', 'link', 'trade']);
  });
});
