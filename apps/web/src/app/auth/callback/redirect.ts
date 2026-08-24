const LOGIN_ERROR_PATH = '/login?error=auth';

/** 상대 경로만 허용. `//host`, `/\host` 등 open-redirect 패턴은 거부. */
export const isSafeNextPath = (next: string): boolean =>
  next.startsWith('/') && !next.startsWith('//') && !next.startsWith('/\\') && !next.includes('\\');

export const resolveAuthCallbackPath = ({
  code,
  exchangeOk,
  next = '/',
}: {
  code: string | null;
  exchangeOk: boolean;
  next?: string;
}): string => {
  if (code && exchangeOk) {
    return isSafeNextPath(next) ? next : '/';
  }
  return LOGIN_ERROR_PATH;
};
