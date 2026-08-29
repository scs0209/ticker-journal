import { notFound, redirect } from 'next/navigation';
import { TickerDetailView } from '@/components/ticker-detail-view';
import { getTickerById, listEntriesForTicker } from '@/lib/entries';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { createClient } from '@/lib/supabase/server';
import { parseTimelineFilter } from '@/lib/timeline-filter';

type TickerPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filter?: string }>;
};

export default async function TickerPage({ params, searchParams }: TickerPageProps) {
  const { configured } = getSupabaseEnv();
  if (!configured) {
    redirect('/');
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { id } = await params;
  const { filter: filterRaw } = await searchParams;
  const filter = parseTimelineFilter(filterRaw);

  const ticker = await getTickerById(supabase, id);
  if (!ticker) {
    notFound();
  }

  const entries = await listEntriesForTicker(supabase, id, filter);

  return <TickerDetailView ticker={ticker} entries={entries} filter={filter} />;
}
