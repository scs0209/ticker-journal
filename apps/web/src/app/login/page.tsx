'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

import { createClient } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';

const CALLBACK_ERROR = '로그인에 실패했습니다. 매직링크는 요청한 같은 브라우저에서 열어 주세요.';

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
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(searchParams.get('error') === 'auth' ? CALLBACK_ERROR : null);
  const [pending, setPending] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setError(null);
    setPending(true);
    try {
      if (!configured) {
        throw new Error('NEXT_PUBLIC_SUPABASE_URL / ANON_KEY 가 비어 있습니다.');
      }
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (signInError) throw signInError;
      setMessage('매직링크를 보냈습니다. 메일함에서 링크를 열어 주세요.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 요청에 실패했습니다.');
    } finally {
      setPending(false);
    }
  };

  return (
    <main className='min-h-screen bg-zinc-50 text-zinc-900'>
      <div className='mx-auto flex w-full max-w-md flex-col gap-6 px-6 py-16'>
        <Link href='/' className='text-sm text-zinc-500 hover:text-zinc-800'>
          ← 홈
        </Link>
        <h1 className='text-3xl font-semibold tracking-tight'>로그인</h1>
        <p className='text-sm leading-6 text-zinc-600'>
          모바일과 같은 Supabase 계정입니다. Auth redirect에{' '}
          <code className='rounded bg-zinc-200 px-1'>http://localhost:3000/auth/callback</code> 을 등록하세요.
        </p>

        <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
          <label className='text-sm font-medium' htmlFor='email'>
            이메일
          </label>
          <input
            id='email'
            type='email'
            autoComplete='email'
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className='rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-500'
            placeholder='you@example.com'
          />
          <button
            type='submit'
            disabled={pending || !configured}
            className='rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50'
          >
            {pending ? '보내는 중…' : '매직링크 보내기'}
          </button>
        </form>

        {!configured ? (
          <p className='text-sm text-amber-700'>apps/web/.env 에 Supabase URL/KEY를 넣은 뒤 next dev를 재시작하세요.</p>
        ) : null}
        {message ? <p className='text-sm text-emerald-700'>{message}</p> : null}
        {error ? <p className='text-sm text-red-700'>{error}</p> : null}
      </div>
    </main>
  );
}
