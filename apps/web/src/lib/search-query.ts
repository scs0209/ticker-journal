export const SEARCH_PAGE_SIZE = 20;

/** ILIKE 와일드카드(% _)와 백슬래시를 이스케이프한다. */
export const escapeIlikePattern = (raw: string): string =>
  raw.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_');

/** PostgREST filter 값 — `"`·`\` 이스케이프 후 double-quote로 감싼다. */
export const quotePostgrestFilterValue = (value: string): string => {
  const escaped = value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
  return `"${escaped}"`;
};

/** trim 후 비어 있으면 null, 아니면 %…% 패턴. */
export const toIlikePattern = (query: string): string | null => {
  const trimmed = query.trim();
  if (!trimmed) return null;
  return `%${escapeIlikePattern(trimmed)}%`;
};

/** PostgREST `.or()` 필터 문자열 (entries 텍스트 컬럼). */
export const buildEntryTextOrFilter = (pattern: string): string => {
  const quoted = quotePostgrestFilterValue(pattern);
  return [
    `body.ilike.${quoted}`,
    `note.ilike.${quoted}`,
    `reason.ilike.${quoted}`,
    `title.ilike.${quoted}`,
    `url.ilike.${quoted}`,
  ].join(',');
};

/** PostgREST `.or()` 필터 문자열 (tickers symbol/name). */
export const buildTickerOrFilter = (pattern: string): string => {
  const quoted = quotePostgrestFilterValue(pattern);
  return [`symbol.ilike.${quoted}`, `name.ilike.${quoted}`].join(',');
};

export type SearchEntryHit = {
  id: string;
  ticker_id: string;
  type: string;
  created_at: string;
  preview: string;
  ticker_symbol: string;
  ticker_name: string | null;
  ticker_market: string;
};

/** created_at 내림차순, 동률이면 id 내림차순 (안정 정렬·페이지네이션). */
export const compareSearchHitsDesc = (a: SearchEntryHit, b: SearchEntryHit): number => {
  const at = new Date(a.created_at).getTime();
  const bt = new Date(b.created_at).getTime();
  if (at !== bt) return bt - at;
  return b.id.localeCompare(a.id);
};

/** id 기준 dedupe 후 created_at·id 내림차순, 페이지 슬라이스. */
export const mergeSearchHits = (
  rows: SearchEntryHit[],
  page: number,
  pageSize = SEARCH_PAGE_SIZE,
): SearchEntryHit[] => {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const byId = new Map<string, SearchEntryHit>();
  for (const row of rows) {
    byId.set(row.id, row);
  }
  const sorted = [...byId.values()].sort(compareSearchHitsDesc);
  const start = (safePage - 1) * pageSize;
  return sorted.slice(start, start + pageSize);
};

/** 소스별 조회 상한 — 현재 페이지 + 1페이지 lookahead (merge·dedupe 여유). */
export const searchSourceFetchLimit = (page: number, pageSize = SEARCH_PAGE_SIZE): number => {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  return safePage * pageSize + pageSize;
};

export const parseSearchPage = (raw: string | string[] | undefined): number => {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};

/** 반복 `q` 등 searchParams 값을 단일 문자열로 만든다. */
export const parseSearchQuery = (raw: string | string[] | undefined): string => {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value ?? '';
};
