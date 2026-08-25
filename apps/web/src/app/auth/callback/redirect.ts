const LOGIN_ERROR_PATH = '/login?error=auth';

/** C0(0x00–0x1F) · DEL(0x7F). `new URL`이 개행 등으로 경로를 깨뜨리는 케이스 차단. */
const hasForbiddenControlChars = (value: string): boolean => {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (code <= 0x1f || code === 0x7f) return true;
  }
  return false;
};

/** 상대 경로만 허용. `//host`, `/\host`, 제어문자 등 open-redirect 패턴은 거부. */
export const isSafeNextPath = (next: string): boolean =>
  !hasForbiddenControlChars(next) &&
  next.startsWith('/') &&
  !next.startsWith('//') &&
  !next.startsWith('/\\') &&
  !next.includes('\\');

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
