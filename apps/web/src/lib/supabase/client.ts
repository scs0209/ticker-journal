import { createBrowserClient } from '@supabase/ssr';

import { getSupabaseEnv } from './env';

export const createClient = () => {
  const { url, key } = getSupabaseEnv();
  return createBrowserClient(url || 'https://placeholder.supabase.co', key || 'placeholder');
};
