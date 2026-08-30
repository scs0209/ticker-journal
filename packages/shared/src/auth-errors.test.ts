import { describe, expect, it } from 'vitest';

import { formatAuthError } from './auth-errors';

describe('formatAuthError', () => {
  it('잘못된 비밀번호를 한국어로 안내한다', () => {
    expect(
      formatAuthError({ code: 'invalid_credentials', message: 'Invalid login credentials' }, 'fallback'),
    ).toContain('이메일 또는 비밀번호');
  });

  it('영문 message만 있어도 매핑한다', () => {
    expect(formatAuthError({ message: 'Invalid login credentials' }, 'fallback')).toContain('매직링크');
  });

  it('이미 한국어 메시지는 그대로 둔다', () => {
    expect(formatAuthError({ message: '비밀번호를 입력해 주세요.' }, 'fallback')).toBe('비밀번호를 입력해 주세요.');
  });

  it('알 수 없는 오류는 fallback을 쓴다', () => {
    expect(formatAuthError({ message: 'Something broke' }, '로그인에 실패했습니다.')).toBe('로그인에 실패했습니다.');
  });
});
