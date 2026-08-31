export type AuthErrorLike = {
  message?: string;
  code?: string;
};

const AUTH_ERROR_BY_CODE: Record<string, string> = {
  invalid_credentials:
    '이메일 또는 비밀번호가 올바르지 않습니다. 입력을 확인하거나 매직링크·Google 로그인을 이용해 주세요.',
  email_not_confirmed: '이메일 인증이 필요합니다. 가입 시 받은 확인 메일의 링크를 먼저 열어 주세요.',
  user_already_registered: '이미 가입된 이메일입니다. 로그인하거나 다른 이메일을 사용해 주세요.',
  weak_password: '비밀번호가 너무 약합니다. 6자 이상으로 설정해 주세요.',
  over_request_rate_limit: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
  too_many_requests: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.',
};

const AUTH_ERROR_BY_MESSAGE: Record<string, string> = {
  'Invalid login credentials': AUTH_ERROR_BY_CODE.invalid_credentials,
  'Email not confirmed': AUTH_ERROR_BY_CODE.email_not_confirmed,
  'User already registered': AUTH_ERROR_BY_CODE.user_already_registered,
  'Password should be at least 6 characters': AUTH_ERROR_BY_CODE.weak_password,
};

const hasHangul = (text: string): boolean => /[\u3131-\uD79D]/.test(text);

/** Supabase Auth 오류를 사용자용 한국어 메시지로 바꾼다. */
export const formatAuthError = (error: unknown, fallback: string): string => {
  if (!error) return fallback;
  if (typeof error === 'string') {
    return AUTH_ERROR_BY_MESSAGE[error] ?? (hasHangul(error) ? error : fallback);
  }

  const record = error as AuthErrorLike;
  const code = record.code?.trim();
  if (code && AUTH_ERROR_BY_CODE[code]) {
    return AUTH_ERROR_BY_CODE[code];
  }

  const message = record.message?.trim();
  if (!message) return fallback;
  if (AUTH_ERROR_BY_MESSAGE[message]) return AUTH_ERROR_BY_MESSAGE[message];
  if (hasHangul(message)) return message;

  return fallback;
};
