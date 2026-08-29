import type { SupabaseClient } from '@supabase/supabase-js';
import {
  type CreateEntryInput,
  CreateEntrySchema,
  type Database,
  type Entry,
  type EntryInsert,
  type EntryRow,
  EntrySchema,
  type Ticker,
  TickerSchema,
  type TimelineFilter,
} from '@ticker-journal/shared';

import { formatEntryPreview } from '@/lib/entry-format';
import {
  buildEntryTextOrFilter,
  buildTickerOrFilter,
  mergeSearchHits,
  parseSearchPage,
  SEARCH_PAGE_SIZE,
  type SearchEntryHit,
  toIlikePattern,
} from '@/lib/search-query';

export const normalizeEntryRow = (row: EntryRow): Entry => {
  if (row.type === 'memo') {
    return {
      id: row.id,
      user_id: row.user_id,
      ticker_id: row.ticker_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      type: 'memo',
      body: row.body ?? '',
    };
  }
  if (row.type === 'link') {
    return {
      id: row.id,
      user_id: row.user_id,
      ticker_id: row.ticker_id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      type: 'link',
      url: row.url ?? '',
      title: row.title,
      note: row.note,
    };
  }
  if (row.type !== 'trade') {
    throw new Error(`알 수 없는 엔트리 타입: ${String(row.type)}`);
  }
  return {
    id: row.id,
    user_id: row.user_id,
    ticker_id: row.ticker_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    type: 'trade',
    side: row.side === 'sell' ? 'sell' : 'buy',
    traded_at: row.traded_at ?? '',
    price: row.price,
    qty: row.qty,
    reason: row.reason,
  };
};

type EntryWithTickerRow = EntryRow & {
  tickers: { id: string; symbol: string; name: string | null; market: string } | null;
};

const rowToSearchHit = (row: EntryWithTickerRow): SearchEntryHit | null => {
  const ticker = row.tickers;
  if (!ticker) return null;
  let entry: Entry;
  try {
    entry = EntrySchema.parse(normalizeEntryRow(row));
  } catch {
    return null;
  }
  return {
    id: entry.id,
    ticker_id: entry.ticker_id,
    type: entry.type,
    created_at: entry.created_at,
    preview: formatEntryPreview(entry),
    ticker_symbol: ticker.symbol,
    ticker_name: ticker.name,
    ticker_market: ticker.market,
  };
};

export const getTickerById = async (supabase: SupabaseClient<Database>, id: string): Promise<Ticker | null> => {
  const { data, error } = await supabase.from('tickers').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const parsed = TickerSchema.safeParse(data);
  return parsed.success ? parsed.data : null;
};

export const listEntriesForTicker = async (
  supabase: SupabaseClient<Database>,
  tickerId: string,
  filter: TimelineFilter = 'all',
): Promise<Entry[]> => {
  let query = supabase.from('entries').select('*').eq('ticker_id', tickerId).order('created_at', { ascending: false });
  if (filter !== 'all') {
    query = query.eq('type', filter);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).flatMap((row) => {
    try {
      return [EntrySchema.parse(normalizeEntryRow(row))];
    } catch {
      return [];
    }
  });
};

export type SearchEntriesResult = {
  hits: SearchEntryHit[];
  page: number;
  pageSize: number;
  hasMore: boolean;
  loadError: string | null;
};

export const searchEntries = async (
  supabase: SupabaseClient<Database>,
  query: string,
  pageRaw: string | string[] | undefined,
): Promise<SearchEntriesResult> => {
  const page = parseSearchPage(pageRaw);
  const pattern = toIlikePattern(query);
  if (!pattern) {
    return { hits: [], page: 1, pageSize: SEARCH_PAGE_SIZE, hasMore: false, loadError: null };
  }

  const fetchLimit = page * SEARCH_PAGE_SIZE;
  const entryOr = buildEntryTextOrFilter(pattern);
  const tickerOr = buildTickerOrFilter(pattern);

  try {
    const [byText, matchingTickers] = await Promise.all([
      supabase
        .from('entries')
        .select('*, tickers(id, symbol, name, market)')
        .or(entryOr)
        .order('created_at', { ascending: false })
        .limit(fetchLimit),
      supabase.from('tickers').select('id').or(tickerOr).limit(fetchLimit),
    ]);

    if (byText.error) throw byText.error;
    if (matchingTickers.error) throw matchingTickers.error;

    const tickerIds = (matchingTickers.data ?? []).map((row) => row.id);
    let byTicker: EntryWithTickerRow[] = [];
    if (tickerIds.length > 0) {
      const { data, error } = await supabase
        .from('entries')
        .select('*, tickers(id, symbol, name, market)')
        .in('ticker_id', tickerIds)
        .order('created_at', { ascending: false })
        .limit(fetchLimit);
      if (error) throw error;
      byTicker = (data ?? []) as EntryWithTickerRow[];
    }

    const mergedRows = [...((byText.data ?? []) as EntryWithTickerRow[]), ...byTicker];
    const allHits = mergedRows.flatMap((row) => {
      const hit = rowToSearchHit(row);
      return hit ? [hit] : [];
    });
    const hits = mergeSearchHits(allHits, page);
    const totalUnique = new Map(allHits.map((h) => [h.id, h])).size;
    const hasMore = totalUnique > page * SEARCH_PAGE_SIZE;

    return { hits, page, pageSize: SEARCH_PAGE_SIZE, hasMore, loadError: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : '검색에 실패했습니다.';
    return { hits: [], page, pageSize: SEARCH_PAGE_SIZE, hasMore: false, loadError: message };
  }
};

export const toInsertPayload = (parsed: CreateEntryInput, userId: string): EntryInsert => {
  const base: EntryInsert = {
    user_id: userId,
    ticker_id: parsed.ticker_id,
    type: parsed.type,
    body: null,
    url: null,
    title: null,
    note: null,
    side: null,
    traded_at: null,
    price: null,
    qty: null,
    reason: null,
  };

  if (parsed.type === 'memo') {
    return { ...base, body: parsed.body };
  }
  if (parsed.type === 'link') {
    return {
      ...base,
      url: parsed.url,
      title: parsed.title ?? null,
      note: parsed.note ?? null,
    };
  }
  return {
    ...base,
    side: parsed.side,
    traded_at: parsed.traded_at,
    price: parsed.price ?? null,
    qty: parsed.qty ?? null,
    reason: parsed.reason ?? null,
  };
};

export const createEntryRecord = async (
  supabase: SupabaseClient<Database>,
  userId: string,
  input: CreateEntryInput,
): Promise<Entry> => {
  const parsed = CreateEntrySchema.parse(input);
  const payload = toInsertPayload(parsed, userId);
  const { data, error } = await supabase.from('entries').insert(payload).select('*').single();
  if (error) throw error;
  return EntrySchema.parse(normalizeEntryRow(data));
};

export const deleteEntryRecord = async (supabase: SupabaseClient<Database>, entryId: string): Promise<void> => {
  const { error } = await supabase.from('entries').delete().eq('id', entryId);
  if (error) throw error;
};
