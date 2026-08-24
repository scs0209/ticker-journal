export type Database = {
  public: {
    Tables: {
      tickers: {
        Row: {
          id: string;
          user_id: string;
          market: 'US' | 'KR';
          symbol: string;
          name: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          market: 'US' | 'KR';
          symbol: string;
          name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          market?: 'US' | 'KR';
          symbol?: string;
          name?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      entries: {
        Row: {
          id: string;
          user_id: string;
          ticker_id: string;
          type: 'memo' | 'link' | 'trade';
          body: string | null;
          url: string | null;
          title: string | null;
          note: string | null;
          side: 'buy' | 'sell' | null;
          traded_at: string | null;
          price: number | null;
          qty: number | null;
          reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ticker_id: string;
          type: 'memo' | 'link' | 'trade';
          body?: string | null;
          url?: string | null;
          title?: string | null;
          note?: string | null;
          side?: 'buy' | 'sell' | null;
          traded_at?: string | null;
          price?: number | null;
          qty?: number | null;
          reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ticker_id?: string;
          type?: 'memo' | 'link' | 'trade';
          body?: string | null;
          url?: string | null;
          title?: string | null;
          note?: string | null;
          side?: 'buy' | 'sell' | null;
          traded_at?: string | null;
          price?: number | null;
          qty?: number | null;
          reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      market: 'US' | 'KR';
      entry_type: 'memo' | 'link' | 'trade';
      trade_side: 'buy' | 'sell';
    };
    CompositeTypes: Record<string, never>;
  };
};
