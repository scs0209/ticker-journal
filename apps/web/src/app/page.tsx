import { type Ticker, TickerSchema } from '@ticker-journal/shared';

import { HomeView } from '@/components/home-view';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const { configured } = getSupabaseEnv();

  if (!configured) {
    return <HomeView configured={false} />;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let tickers: Ticker[] = [];
  let loadError = false;
  if (user) {
    const { data, error } = await supabase.from('tickers').select('*').order('created_at', { ascending: false });
    if (error) {
      loadError = true;
    } else if (data) {
      tickers = data.flatMap((row) => {
        const parsed = TickerSchema.safeParse(row);
        return parsed.success ? [parsed.data] : [];
      });
    }
  }

  return <HomeView configured email={user?.email ?? null} tickers={tickers} loadError={loadError} />;
}
