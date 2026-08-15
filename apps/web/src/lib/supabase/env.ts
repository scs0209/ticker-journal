const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_KEY ?? '';

export const getSupabaseEnv = () => ({
  url: supabaseUrl,
  key: supabaseKey,
  configured: Boolean(supabaseUrl && supabaseKey),
});
