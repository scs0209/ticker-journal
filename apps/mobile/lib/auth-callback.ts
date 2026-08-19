export type AuthCallbackPayload =
  | { type: 'code'; code: string }
  | { type: 'tokens'; access_token: string; refresh_token: string };

export const parseAuthCallbackUrl = (url: string): AuthCallbackPayload | null => {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  const code = parsed.searchParams.get('code');
  if (code) {
    return { type: 'code', code };
  }

  const hashParams = new URLSearchParams(parsed.hash.startsWith('#') ? parsed.hash.slice(1) : parsed.hash);
  const accessToken = hashParams.get('access_token') ?? parsed.searchParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token') ?? parsed.searchParams.get('refresh_token');
  if (accessToken && refreshToken) {
    return { type: 'tokens', access_token: accessToken, refresh_token: refreshToken };
  }

  return null;
};
