import Link from 'next/link';

import { signOut } from '@/app/login/actions';
import { deleteAccount } from '@/app/settings/actions';

type SettingsViewProps = {
  email: string;
  privacyPolicyPath?: string;
};

export function SettingsView({ email, privacyPolicyPath = '/privacy' }: SettingsViewProps) {
  return (
    <main className='min-h-screen bg-zinc-50 text-zinc-900'>
      <div className='mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-16'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex flex-col gap-2'>
            <p className='text-xs uppercase tracking-[0.14em] text-zinc-500'>설정</p>
            <h1 className='text-3xl font-semibold tracking-tight'>계정</h1>
          </div>
          <Link
            href='/'
            className='rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100'
          >
            홈
          </Link>
        </div>

        <p className='text-sm text-zinc-600'>
          로그인: <span className='font-medium text-zinc-900'>{email}</span>
        </p>

        <section className='flex flex-col gap-3 rounded-lg border border-zinc-300 bg-white p-4'>
          <h2 className='text-base font-semibold'>세션</h2>
          <form action={signOut}>
            <button
              type='submit'
              className='rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100'
            >
              로그아웃
            </button>
          </form>
        </section>

        <section className='flex flex-col gap-3 rounded-lg border border-zinc-300 bg-white p-4'>
          <h2 className='text-base font-semibold'>법적 고지</h2>
          <Link href={privacyPolicyPath} className='text-sm text-zinc-700 underline hover:text-zinc-900'>
            개인정보 처리방침
          </Link>
        </section>

        <section className='flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4'>
          <h2 className='text-base font-semibold text-red-900'>계정 삭제</h2>
          <p className='text-sm leading-6 text-red-800'>관심종목·타임라인 기록이 모두 삭제되며 되돌릴 수 없습니다.</p>
          <form action={deleteAccount}>
            <button
              type='submit'
              className='rounded-lg bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-800'
            >
              계정 삭제
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
