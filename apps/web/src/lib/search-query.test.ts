import { describe, expect, it } from 'vitest';

import { escapeIlikePattern, mergeSearchHits, type SearchEntryHit, toIlikePattern } from '@/lib/search-query';

describe('toIlikePattern', () => {
  it('공백만 있으면 null을 반환한다', () => {
    expect(toIlikePattern('   ')).toBeNull();
  });

  it('와일드카드를 이스케이프한다', () => {
    expect(toIlikePattern('100%')).toBe('%100\\%%');
  });
});

describe('escapeIlikePattern', () => {
  it('백슬래시와 _를 이스케이프한다', () => {
    expect(escapeIlikePattern('a\\b_c')).toBe('a\\\\b\\_c');
  });
});

describe('mergeSearchHits', () => {
  const hit = (id: string, createdAt: string): SearchEntryHit => ({
    id,
    ticker_id: '22222222-2222-4222-8222-222222222222',
    type: 'memo',
    created_at: createdAt,
    preview: 'preview',
    ticker_symbol: 'AAPL',
    ticker_name: 'Apple',
    ticker_market: 'US',
  });

  it('id 기준 dedupe 후 최신순으로 정렬한다', () => {
    const merged = mergeSearchHits(
      [
        hit('a', '2026-01-01T00:00:00.000Z'),
        hit('a', '2026-01-01T00:00:00.000Z'),
        hit('b', '2026-02-01T00:00:00.000Z'),
      ],
      1,
      20,
    );
    expect(merged.map((row) => row.id)).toEqual(['b', 'a']);
  });

  it('페이지 슬라이스를 적용한다', () => {
    const rows = Array.from({ length: 25 }, (_, i) =>
      hit(`id-${i}`, `2026-01-${String(i + 1).padStart(2, '0')}T00:00:00.000Z`),
    );
    const page2 = mergeSearchHits(rows, 2, 20);
    expect(page2).toHaveLength(5);
  });
});
