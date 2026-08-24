import type { Database } from './database';

export type { Database };
export type EntryRow = Database['public']['Tables']['entries']['Row'];
export type EntryInsert = Database['public']['Tables']['entries']['Insert'];
export type TickerRow = Database['public']['Tables']['tickers']['Row'];
export type TickerInsert = Database['public']['Tables']['tickers']['Insert'];
