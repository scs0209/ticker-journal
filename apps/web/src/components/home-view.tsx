import type { Ticker } from '@ticker-journal/shared';
import { APP_NAME } from '@ticker-journal/shared';
import Link from 'next/link';

import { signOut } from '@/app/login/actions';

type HomeViewProps = {
  email?: string | null;
  tickers?: Ticker[];
  configured?: boolean;
  loadError?: boolean;
};

export function HomeView({ email = null, tickers = [], configured = false, loadError = false }: HomeViewProps) {
  return (
    <main className='min-h-screen bg-zinc-50 text-zinc-900'>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex flex-col gap-2'>
            <p className='text-xs uppercase tracking-[0.14em] text-zinc-500'>{APP_NAME}</p>
            <h1 className='text-4xl font-semibold tracking-tight'>웹 아카이브</h1>
          </div>
          {email ? (
            <form action={signOut}>
              <button
                type='submit'
                className='rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100'
              >
                로그아웃
              </button>
            </form>
          ) : (
            <Link
              href='/login'
              className='rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800'
            >
              로그인
            </Link>
          )}
        </div>

        <p className='max-w-xl text-base leading-7 text-zinc-600'>
          모바일에서 넣은 종목 타임라인을 같은 Supabase 계정으로 확인합니다. Phase 1에서 검색·상세를 확장합니다.
        </p>

        {!configured ? (
          <div className='rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900'>
            Supabase env가 비어 있습니다. <code>apps/web/.env</code>를 확인하세요.
          </div>
        ) : null}

        {email ? (
          <section className='flex flex-col gap-3'>
            <p className='text-sm text-zinc-600'>
              로그인: <span className='font-medium text-zinc-900'>{email}</span>
            </p>
            <h2 className='text-lg font-semibold'>관심종목</h2>
            {loadError ? (
              <p className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800'>
                관심종목을 불러오지 못했습니다. 잠시 후 다시 시도하세요.
              </p>
            ) : tickers.length === 0 ? (
              <p className='rounded-lg border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-600'>
                아직 종목이 없습니다. 모바일 앱에서 먼저 추가하세요.
              </p>
            ) : (
              <ul className='flex flex-col gap-2'>
                {tickers.map((ticker) => (
                  <li key={ticker.id} className='rounded-lg border border-zinc-300 bg-white px-4 py-3'>
                    <p className='font-semibold'>
                      {ticker.symbol}{' '}
                      <span className='text-xs font-medium uppercase tracking-wide text-zinc-500'>{ticker.market}</span>
                    </p>
                    <p className='text-sm text-zinc-600'>{ticker.name ?? '이름 없음'}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          <div className='rounded-lg border border-zinc-300 bg-white p-4 text-sm text-zinc-700'>
            <p className='font-medium'>시작</p>
            <ul className='mt-2 list-disc space-y-1 pl-5'>
              <li>매직링크 로그인</li>
              <li>모바일과 동일 계정으로 관심종목 조회</li>
              <li>Phase 1: entries 검색 · 종목 상세</li>
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
