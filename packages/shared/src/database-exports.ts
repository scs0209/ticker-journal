/** `Database`는 `pnpm gen:types`로 재생성한다. 수동 편집하지 말 것. */
import type { Database } from './database';

export type { Database };
export type EntryRow = Database['public']['Tables']['entries']['Row'];
export type EntryInsert = Database['public']['Tables']['entries']['Insert'];
export type TickerRow = Database['public']['Tables']['tickers']['Row'];
export type TickerInsert = Database['public']['Tables']['tickers']['Insert'];
