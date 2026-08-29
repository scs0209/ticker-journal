import { describe, expect, it } from 'vitest';

import {
  buildEntryTextOrFilter,
  buildTickerOrFilter,
  compareSearchHitsDesc,
  escapeIlikePattern,
  mergeSearchHits,
  parseSearchQuery,
  quotePostgrestFilterValue,
  type SearchEntryHit,
  searchSourceFetchLimit,
  toIlikePattern,
} from '@/lib/search-query';

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

describe('quotePostgrestFilterValue', () => {
  it('PostgREST 예약 문자를 double-quote로 감싼다', () => {
    expect(quotePostgrestFilterValue('%a,b%')).toBe('"%a,b%"');
    expect(quotePostgrestFilterValue('%info.cpe%')).toBe('"%info.cpe%"');
    expect(quotePostgrestFilterValue('%a:b%')).toBe('"%a:b%"');
    expect(quotePostgrestFilterValue('*%foo*%')).toBe('"*%foo*%"');
    expect(quotePostgrestFilterValue('%(x)%')).toBe('"%(x)%"');
  });

  it('따옴표와 백슬래시를 PostgREST 규칙으로 이스케이프한다', () => {
    expect(quotePostgrestFilterValue('%Quote:"%')).toBe('"%Quote:\\"%"');
    expect(quotePostgrestFilterValue('%a\\\\b%')).toBe('"%a\\\\\\\\b%"');
  });
});

describe('buildEntryTextOrFilter', () => {
  it('or 조건 개수가 예약 문자 검색어에도 유지된다', () => {
    const pattern = toIlikePattern('a,b')!;
    const filter = buildEntryTextOrFilter(pattern);
    expect(filter).toBe(
      [
        'body.ilike."%a,b%"',
        'note.ilike."%a,b%"',
        'reason.ilike."%a,b%"',
        'title.ilike."%a,b%"',
        'url.ilike."%a,b%"',
      ].join(','),
    );
  });

  it('ILIKE escape와 PostgREST quoting을 함께 적용한다', () => {
    const pattern = toIlikePattern('100%')!;
    expect(buildEntryTextOrFilter(pattern)).toContain('body.ilike."%100\\\\%%"');
  });
});

describe('buildTickerOrFilter', () => {
  it('종목 필터도 quoted 값을 쓴다', () => {
    expect(buildTickerOrFilter('%(BRK.B)%')).toBe(['symbol.ilike."%(BRK.B)%"', 'name.ilike."%(BRK.B)%"'].join(','));
  });
});

describe('parseSearchQuery', () => {
  it('반복 q는 첫 값만 사용한다', () => {
    expect(parseSearchQuery(['apple', 'banana'])).toBe('apple');
  });

  it('undefined는 빈 문자열이다', () => {
    expect(parseSearchQuery(undefined)).toBe('');
  });
});

describe('searchSourceFetchLimit', () => {
  it('현재 페이지보다 1페이지 더 가져온다', () => {
    expect(searchSourceFetchLimit(1)).toBe(40);
    expect(searchSourceFetchLimit(2)).toBe(60);
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

  it('같은 created_at이 20개 넘어도 중복·누락 없이 페이지를 나눈다', () => {
    const ts = '2026-01-01T00:00:00.000Z';
    const rows = Array.from({ length: 25 }, (_, i) => hit(`id-${String(i).padStart(2, '0')}`, ts));
    const page1 = mergeSearchHits(rows, 1, 20);
    const page2 = mergeSearchHits(rows, 2, 20);
    const allIds = [...page1, ...page2].map((row) => row.id);

    expect(page1).toHaveLength(20);
    expect(page2).toHaveLength(5);
    expect(new Set(allIds).size).toBe(25);
    expect([...allIds].sort()).toEqual(rows.map((row) => row.id).sort());
    expect(page1[0]?.id).toBe('id-24');
  });
});

describe('compareSearchHitsDesc', () => {
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

  it('created_at 동률이면 id 내림차순으로 정렬한다', () => {
    const ts = '2026-01-01T00:00:00.000Z';
    const sorted = [hit('id-01', ts), hit('id-02', ts)].sort(compareSearchHitsDesc);
    expect(sorted.map((row) => row.id)).toEqual(['id-02', 'id-01']);
  });
});
