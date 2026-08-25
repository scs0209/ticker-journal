import { createServerClient } from '@supabase/ssr';
import type { Database } from '@ticker-journal/shared';
import { type NextRequest, NextResponse } from 'next/server';

import { applyAuthCacheHeaders } from '@/lib/supabase/auth-cache-headers';
import { getSupabaseEnv } from '@/lib/supabase/env';

import { resolveAuthCallbackPath } from './redirect';

export const GET = async (request: NextRequest) => {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  let exchangeOk = false;
  const cookiesToSet: { name: string; value: string; options: Parameters<NextResponse['cookies']['set']>[2] }[] = [];
  const responseHeaders: Record<string, string> = {};

  if (code) {
    const { url, key, configured } = getSupabaseEnv();
    if (configured) {
      const supabase = createServerClient<Database>(url, key, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(toSet, headers) {
            for (const { name, value, options } of toSet) {
              cookiesToSet.push({ name, value, options });
            }
            Object.assign(responseHeaders, headers);
          },
        },
      });
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      exchangeOk = !error;
      if (error) {
        console.error('auth callback exchange failed:', error.message);
      }
    }
  }

  const response = applyAuthCacheHeaders(
    NextResponse.redirect(new URL(resolveAuthCallbackPath({ code, exchangeOk, next }), origin)),
  );
  for (const { name, value, options } of cookiesToSet) {
    response.cookies.set(name, value, options);
  }
  for (const [headerName, headerValue] of Object.entries(responseHeaders)) {
    response.headers.set(headerName, headerValue);
  }
  return response;
};
