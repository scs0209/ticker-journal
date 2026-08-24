import {
  type CreateEntryInput,
  CreateEntrySchema,
  type CreateTickerInput,
  CreateTickerSchema,
  type Entry,
  type EntryInsert,
  type EntryRow,
  EntrySchema,
  type Ticker,
  TickerSchema,
  type TimelineFilter,
} from '@ticker-journal/shared';

import { supabase } from './supabase';

export const listTickers = async (): Promise<Ticker[]> => {
  const { data, error } = await supabase.from('tickers').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => TickerSchema.parse(row));
};

export const createTicker = async (input: CreateTickerInput): Promise<Ticker> => {
  const parsed = CreateTickerSchema.parse(input);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('로그인이 필요합니다.');

  const { data, error } = await supabase
    .from('tickers')
    .insert({
      user_id: user.id,
      market: parsed.market,
      symbol: parsed.symbol,
      name: parsed.name ?? null,
    })
    .select('*')
    .single();

  if (error) throw error;
  return TickerSchema.parse(data);
};

export const deleteTicker = async (id: string): Promise<void> => {
  const { error } = await supabase.from('tickers').delete().eq('id', id);
  if (error) throw error;
};

export const getTicker = async (id: string): Promise<Ticker> => {
  const { data, error } = await supabase.from('tickers').select('*').eq('id', id).single();
  if (error) throw error;
  return TickerSchema.parse(data);
};

export const listEntries = async (tickerId: string, filter: TimelineFilter = 'all'): Promise<Entry[]> => {
  let query = supabase.from('entries').select('*').eq('ticker_id', tickerId).order('created_at', { ascending: false });
  if (filter !== 'all') {
    query = query.eq('type', filter);
  }
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((row) => EntrySchema.parse(normalizeEntryRow(row)));
};

export const createEntry = async (input: CreateEntryInput): Promise<Entry> => {
  const parsed = CreateEntrySchema.parse(input);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!user) throw new Error('로그인이 필요합니다.');

  const payload = toInsertPayload(parsed, user.id);
  const { data, error } = await supabase.from('entries').insert(payload).select('*').single();
  if (error) throw error;
  return EntrySchema.parse(normalizeEntryRow(data));
};

export const deleteEntry = async (id: string): Promise<void> => {
  const { error } = await supabase.from('entries').delete().eq('id', id);
  if (error) throw error;
};

const toInsertPayload = (parsed: CreateEntryInput, userId: string): EntryInsert => {
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

const normalizeEntryRow = (row: EntryRow): Entry => {
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
