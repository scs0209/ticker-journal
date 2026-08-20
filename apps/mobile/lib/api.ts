import {
  type CreateEntryInput,
  CreateEntrySchema,
  type CreateTickerInput,
  CreateTickerSchema,
  type Entry,
  EntrySchema,
  type Ticker,
  TickerSchema,
  type TimelineFilter,
} from '@ticker-journal/shared';
import type { z } from 'zod';

import { supabase } from './supabase';

const EntryRowSchema = EntrySchema;
type EntryRow = z.infer<typeof EntryRowSchema>;

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
  return (data ?? []).map((row) => EntryRowSchema.parse(normalizeEntryRow(row)));
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
  const { data, error } = await supabase
    .from('entries')
    .insert(payload as Record<string, unknown>)
    .select('*')
    .single();
  if (error) throw error;
  return EntryRowSchema.parse(normalizeEntryRow(data as Record<string, unknown>));
};

export const deleteEntry = async (id: string): Promise<void> => {
  const { error } = await supabase.from('entries').delete().eq('id', id);
  if (error) throw error;
};

const toInsertPayload = (parsed: CreateEntryInput, userId: string) => {
  const base = {
    user_id: userId,
    ticker_id: parsed.ticker_id,
    type: parsed.type,
    body: null as string | null,
    url: null as string | null,
    title: null as string | null,
    note: null as string | null,
    side: null as 'buy' | 'sell' | null,
    traded_at: null as string | null,
    price: null as number | null,
    qty: null as number | null,
    reason: null as string | null,
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

const normalizeEntryRow = (row: Record<string, unknown>): EntryRow => {
  const type = row.type;
  if (type === 'memo') {
    return {
      id: String(row.id),
      user_id: String(row.user_id),
      ticker_id: String(row.ticker_id),
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
      type: 'memo',
      body: String(row.body ?? ''),
    };
  }
  if (type === 'link') {
    return {
      id: String(row.id),
      user_id: String(row.user_id),
      ticker_id: String(row.ticker_id),
      created_at: String(row.created_at),
      updated_at: String(row.updated_at),
      type: 'link',
      url: String(row.url ?? ''),
      title: (row.title as string | null) ?? null,
      note: (row.note as string | null) ?? null,
    };
  }
  return {
    id: String(row.id),
    user_id: String(row.user_id),
    ticker_id: String(row.ticker_id),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
    type: 'trade',
    side: row.side === 'sell' ? 'sell' : 'buy',
    traded_at: String(row.traded_at ?? ''),
    price: row.price == null ? null : Number(row.price),
    qty: row.qty == null ? null : Number(row.qty),
    reason: (row.reason as string | null) ?? null,
  };
};
