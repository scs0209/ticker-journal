export const SEARCH_PAGE_SIZE = 20;

/** ILIKE 와일드카드(% _)와 백슬래시를 이스케이프한다. */
export const escapeIlikePattern = (raw: string): string =>
  raw.replaceAll('\\', '\\\\').replaceAll('%', '\\%').replaceAll('_', '\\_');

/** trim 후 비어 있으면 null, 아니면 %…% 패턴. */
export const toIlikePattern = (query: string): string | null => {
  const trimmed = query.trim();
  if (!trimmed) return null;
  return `%${escapeIlikePattern(trimmed)}%`;
};

/** PostgREST `.or()` 필터 문자열 (entries 텍스트 컬럼). */
export const buildEntryTextOrFilter = (pattern: string): string =>
  [
    `body.ilike.${pattern}`,
    `note.ilike.${pattern}`,
    `reason.ilike.${pattern}`,
    `title.ilike.${pattern}`,
    `url.ilike.${pattern}`,
  ].join(',');

/** PostgREST `.or()` 필터 문자열 (tickers symbol/name). */
export const buildTickerOrFilter = (pattern: string): string =>
  [`symbol.ilike.${pattern}`, `name.ilike.${pattern}`].join(',');

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

/** id 기준 dedupe 후 created_at 내림차순, 페이지 슬라이스. */
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
  const sorted = [...byId.values()].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const start = (safePage - 1) * pageSize;
  return sorted.slice(start, start + pageSize);
};

export const parseSearchPage = (raw: string | string[] | undefined): number => {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const parsed = Number.parseInt(value ?? '1', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
};
