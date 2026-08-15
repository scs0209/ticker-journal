import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

import { resolveAuthCallbackPath } from './redirect';

export const GET = async (request: Request) => {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  let exchangeOk = false;
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    exchangeOk = !error;
  }

  return NextResponse.redirect(new URL(resolveAuthCallbackPath({ code, exchangeOk, next }), origin));
};
