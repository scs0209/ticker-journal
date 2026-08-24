'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useActionState, useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';

type AuthMode = 'password' | 'magic';
type FormState = { message: string | null; error: string | null };

const CALLBACK_ERROR = '로그인에 실패했습니다. 매직링크는 요청한 같은 브라우저에서 열어 주세요.';
const INITIAL: FormState = { message: null, error: null };

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { configured } = getSupabaseEnv();
  const searchParams = useSearchParams();
  const callbackError = searchParams.get('error') === 'auth' ? CALLBACK_ERROR : null;
  const [oauthError, setOauthError] = useState<string | null>(null);

  const passwordAction = async (_prev: FormState, formData: FormData): Promise<FormState> => {
    const email = (formData.get('email') as string)?.trim();
    const password = formData.get('password') as string;
    if (!configured) return { message: null, error: 'NEXT_PUBLIC_SUPABASE_URL / ANON_KEY 가 비어 있습니다.' };
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { message: null, error: error.message };
      window.location.href = '/';
      return { message: null, error: null };
    } catch (err) {
      return { message: null, error: err instanceof Error ? err.message : '로그인에 실패했습니다.' };
    }
  };

  const magicAction = async (_prev: FormState, formData: FormData): Promise<FormState> => {
    const email = (formData.get('email') as string)?.trim();
    if (!configured) return { message: null, error: 'NEXT_PUBLIC_SUPABASE_URL / ANON_KEY 가 비어 있습니다.' };
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) return { message: null, error: error.message };
      return { message: '매직링크를 보냈습니다. 메일함에서 링크를 열어 주세요.', error: null };
    } catch (err) {
      return { message: null, error: err instanceof Error ? err.message : '로그인 요청에 실패했습니다.' };
    }
  };

  const [pwState, pwAction, pwPending] = useActionState(passwordAction, INITIAL);
  const [mlState, mlAction, mlPending] = useActionState(magicAction, INITIAL);

  const [mode, setMode] = useActionState((_prev: AuthMode, next: AuthMode) => next, 'password' as AuthMode);

  const state = mode === 'password' ? pwState : mlState;
  const pending = pwPending || mlPending;

  const handleGoogle = async () => {
    setOauthError(null);
    if (!configured) {
      setOauthError('NEXT_PUBLIC_SUPABASE_URL / ANON_KEY 가 비어 있습니다.');
      return;
    }
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setOauthError(error.message);
      }
    } catch (err) {
      setOauthError(err instanceof Error ? err.message : 'Google 로그인에 실패했습니다.');
    }
  };

  return (
    <main className='min-h-screen bg-zinc-50 text-zinc-900'>
      <div className='mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16'>
        <Link href='/' className='text-sm text-zinc-500 hover:text-zinc-800'>
          ← 홈
        </Link>
        <h1 className='text-3xl font-semibold tracking-tight'>로그인</h1>

        <div className='flex overflow-hidden rounded-lg border border-zinc-300'>
          <button
            type='button'
            onClick={() => setMode('password')}
            className={`flex-1 py-2.5 text-sm font-medium ${mode === 'password' ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'}`}
          >
            이메일/비밀번호
          </button>
          <button
            type='button'
            onClick={() => setMode('magic')}
            className={`flex-1 py-2.5 text-sm font-medium ${mode === 'magic' ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-zinc-600 hover:bg-zinc-100'}`}
          >
            매직링크
          </button>
        </div>

        <form action={mode === 'password' ? pwAction : mlAction} className='flex flex-col gap-3'>
          <label className='text-sm font-medium' htmlFor='email'>
            이메일
          </label>
          <input
            id='email'
            name='email'
            type='email'
            autoComplete='email'
            required
            className='rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-500'
            placeholder='you@example.com'
          />

          {mode === 'password' ? (
            <>
              <label className='text-sm font-medium' htmlFor='password'>
                비밀번호
              </label>
              <input
                id='password'
                name='password'
                type='password'
                autoComplete='current-password'
                required
                className='rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-500'
                placeholder='비밀번호'
              />
            </>
          ) : null}

          <button
            type='submit'
            disabled={pending || !configured}
            className='rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50'
          >
            {pending ? '처리 중…' : mode === 'password' ? '로그인' : '매직링크 보내기'}
          </button>
        </form>

        {mode === 'password' ? (
          <p className='text-center text-sm text-zinc-600'>
            계정이 없으신가요?{' '}
            <Link href='/signup' className='font-medium text-zinc-900 hover:underline'>
              회원가입
            </Link>
          </p>
        ) : null}

        <div className='flex items-center gap-3'>
          <div className='h-px flex-1 bg-zinc-200' />
          <span className='text-xs text-zinc-400'>또는</span>
          <div className='h-px flex-1 bg-zinc-200' />
        </div>

        <button
          type='button'
          onClick={handleGoogle}
          disabled={pending || !configured}
          className='rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50'
        >
          Google로 계속하기
        </button>

        {!configured ? (
          <p className='text-sm text-amber-700'>apps/web/.env 에 Supabase URL/KEY를 넣은 뒤 next dev를 재시작하세요.</p>
        ) : null}
        {state.message ? <p className='text-sm text-emerald-700'>{state.message}</p> : null}
        {(state.error ?? oauthError ?? callbackError) ? (
          <p className='text-sm text-red-700'>{state.error ?? oauthError ?? callbackError}</p>
        ) : null}
      </div>
    </main>
  );
}
