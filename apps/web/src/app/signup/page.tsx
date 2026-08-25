'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';

type FormState = { message: string | null; error: string | null };
const INITIAL: FormState = { message: null, error: null };

export default function SignUpPage() {
  const { configured } = getSupabaseEnv();

  const signUpAction = async (_prev: FormState, formData: FormData): Promise<FormState> => {
    const email = (formData.get('email') as string)?.trim();
    const password = formData.get('password') as string;
    const confirm = formData.get('confirm-password') as string;

    if (!configured) return { message: null, error: 'NEXT_PUBLIC_SUPABASE_URL / ANON_KEY 가 비어 있습니다.' };
    if (password.length < 6) return { message: null, error: '비밀번호는 6자 이상이어야 합니다.' };
    if (password !== confirm) return { message: null, error: '비밀번호가 일치하지 않습니다.' };

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) return { message: null, error: error.message };
      return { message: '확인 이메일을 보냈습니다. 메일함에서 링크를 열어 주세요.', error: null };
    } catch (err) {
      return { message: null, error: err instanceof Error ? err.message : '회원가입에 실패했습니다.' };
    }
  };

  const [state, action, pending] = useActionState(signUpAction, INITIAL);

  return (
    <main className='min-h-screen bg-zinc-50 text-zinc-900'>
      <div className='mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16'>
        <Link href='/' className='text-sm text-zinc-500 hover:text-zinc-800'>
          ← 홈
        </Link>
        <h1 className='text-3xl font-semibold tracking-tight'>회원가입</h1>

        <form action={action} className='flex flex-col gap-3'>
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

          <label className='text-sm font-medium' htmlFor='password'>
            비밀번호
          </label>
          <input
            id='password'
            name='password'
            type='password'
            autoComplete='new-password'
            required
            className='rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-500'
            placeholder='6자 이상'
          />

          <label className='text-sm font-medium' htmlFor='confirm-password'>
            비밀번호 확인
          </label>
          <input
            id='confirm-password'
            name='confirm-password'
            type='password'
            autoComplete='new-password'
            required
            className='rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-500'
            placeholder='비밀번호 확인'
          />

          <button
            type='submit'
            disabled={pending || !configured}
            className='rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50'
          >
            {pending ? '처리 중…' : '회원가입'}
          </button>
        </form>

        <p className='text-center text-sm text-zinc-600'>
          이미 계정이 있으신가요?{' '}
          <Link href='/login' className='font-medium text-zinc-900 hover:underline'>
            로그인
          </Link>
        </p>

        {!configured ? (
          <p className='text-sm text-amber-700'>apps/web/.env 에 Supabase URL/KEY를 넣은 뒤 next dev를 재시작하세요.</p>
        ) : null}
        {state.message ? <p className='text-sm text-emerald-700'>{state.message}</p> : null}
        {state.error ? <p className='text-sm text-red-700'>{state.error}</p> : null}
      </div>
    </main>
  );
}
