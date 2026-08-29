import { z } from 'zod';

export const MarketSchema = z.enum(['US', 'KR']);
export type Market = z.infer<typeof MarketSchema>;

export const EntryTypeSchema = z.enum(['memo', 'link', 'trade']);
export type EntryType = z.infer<typeof EntryTypeSchema>;

export const TradeSideSchema = z.enum(['buy', 'sell']);
export type TradeSide = z.infer<typeof TradeSideSchema>;

export const TickerSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  market: MarketSchema,
  symbol: z.string().min(1).max(32),
  name: z.string().min(1).max(128).nullable(),
  created_at: z.string().datetime({ offset: true }).or(z.string().min(1)),
});
export type Ticker = z.infer<typeof TickerSchema>;

export const CreateTickerSchema = z.object({
  market: MarketSchema,
  symbol: z
    .string()
    .min(1)
    .max(32)
    .transform((s) => s.trim().toUpperCase()),
  name: z.string().min(1).max(128).optional().nullable(),
});
export type CreateTickerInput = z.infer<typeof CreateTickerSchema>;

const EntryBaseSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  ticker_id: z.string().uuid(),
  created_at: z.string().datetime({ offset: true }).or(z.string().min(1)),
  updated_at: z.string().datetime({ offset: true }).or(z.string().min(1)),
});

export const MemoEntrySchema = EntryBaseSchema.extend({
  type: z.literal('memo'),
  body: z.string().min(1),
});

export const LinkEntrySchema = EntryBaseSchema.extend({
  type: z.literal('link'),
  url: z.string().url(),
  title: z.string().max(256).optional().nullable(),
  note: z.string().max(2000).optional().nullable(),
});

export const TradeEntrySchema = EntryBaseSchema.extend({
  type: z.literal('trade'),
  side: TradeSideSchema,
  traded_at: z.string().min(1),
  price: z.number().nonnegative().optional().nullable(),
  qty: z.number().positive().optional().nullable(),
  reason: z.string().max(4000).optional().nullable(),
});

export const EntrySchema = z.discriminatedUnion('type', [MemoEntrySchema, LinkEntrySchema, TradeEntrySchema]);
export type Entry = z.infer<typeof EntrySchema>;

export const CreateMemoEntrySchema = z.object({
  type: z.literal('memo'),
  ticker_id: z.string().uuid(),
  body: z.string().min(1),
});

export const CreateLinkEntrySchema = z.object({
  type: z.literal('link'),
  ticker_id: z.string().uuid(),
  url: z.string().url(),
  title: z.string().max(256).optional().nullable(),
  note: z.string().max(2000).optional().nullable(),
});

export const CreateTradeEntrySchema = z.object({
  type: z.literal('trade'),
  ticker_id: z.string().uuid(),
  side: TradeSideSchema,
  traded_at: z.string().min(1),
  price: z.number().nonnegative().optional().nullable(),
  qty: z.number().positive().optional().nullable(),
  reason: z.string().max(4000).optional().nullable(),
});

export const CreateEntrySchema = z.discriminatedUnion('type', [
  CreateMemoEntrySchema,
  CreateLinkEntrySchema,
  CreateTradeEntrySchema,
]);
export type CreateEntryInput = z.infer<typeof CreateEntrySchema>;

export const TimelineFilterSchema = z.enum(['all', 'memo', 'link', 'trade']);
export type TimelineFilter = z.infer<typeof TimelineFilterSchema>;

export const APP_NAME = 'Ticker Journal';

export { buildChartHtml } from './chart';
export type { Database, EntryInsert, EntryRow, TickerInsert, TickerRow } from './database-exports';
