import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@ticker-journal/shared';

import { getSupabaseEnv } from './env';

export const createClient = () => {
  const { url, key } = getSupabaseEnv();
  return createBrowserClient<Database>(url || 'https://placeholder.supabase.co', key || 'placeholder');
};
