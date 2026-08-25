import type { NextResponse } from 'next/server';

/** 세션 쿠키가 실린 응답이 CDN/공유 캐시에 남지 않도록 한다. */
export const applyAuthCacheHeaders = <T extends NextResponse>(response: T): T => {
  response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate, max-age=0');
  response.headers.set('Expires', '0');
  response.headers.set('Pragma', 'no-cache');
  return response;
};
