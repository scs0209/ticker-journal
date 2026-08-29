import { redirect } from 'next/navigation';

import { SearchView } from '@/components/search-view';
import { searchEntries } from '@/lib/entries';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { createClient } from '@/lib/supabase/server';

type SearchPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
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

  const params = await searchParams;
  const query = params.q ?? '';
  const result = await searchEntries(supabase, query, params.page);

  return (
    <SearchView
      query={query}
      hits={result.hits}
      page={result.page}
      hasMore={result.hasMore}
      loadError={result.loadError}
      email={user.email}
    />
  );
}
