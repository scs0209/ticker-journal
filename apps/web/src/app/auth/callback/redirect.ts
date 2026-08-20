const LOGIN_ERROR_PATH = '/login?error=auth';

const isSafeNextPath = (next: string): boolean => next.startsWith('/') && !next.startsWith('//');

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
