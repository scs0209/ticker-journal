import { createServerClient } from '@supabase/ssr';
import type { Database } from '@ticker-journal/shared';
import { type NextRequest, NextResponse } from 'next/server';

import { applyAuthCacheHeaders } from './auth-cache-headers';
import { getSupabaseEnv } from './env';

export const updateSession = async (request: NextRequest) => {
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });
  const { url, key, configured } = getSupabaseEnv();

  if (!configured) {
    return supabaseResponse;
  }

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        supabaseResponse = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
        for (const [headerName, headerValue] of Object.entries(headers)) {
          supabaseResponse.headers.set(headerName, headerValue);
        }
        if (cookiesToSet.length > 0) {
          applyAuthCacheHeaders(supabaseResponse);
        }
      },
    },
  });

  await supabase.auth.getUser();
  return supabaseResponse;
};
