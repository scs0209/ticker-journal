import type { Ticker } from '@ticker-journal/shared';
import { APP_NAME } from '@ticker-journal/shared';
import Link from 'next/link';

import { signOut } from '@/app/login/actions';

type HomeViewProps = {
  email?: string | null;
  tickers?: Ticker[];
  configured?: boolean;
  loadError?: string | null;
};

export function HomeView({ email = null, tickers = [], configured = false, loadError = null }: HomeViewProps) {
  return (
    <main className='min-h-screen bg-zinc-50 text-zinc-900'>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex flex-col gap-2'>
            <p className='text-xs uppercase tracking-[0.14em] text-zinc-500'>{APP_NAME}</p>
            <h1 className='text-4xl font-semibold tracking-tight'>웹 아카이브</h1>
          </div>
          {email ? (
            <div className='flex gap-2'>
              <Link
                href='/settings'
                className='rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100'
              >
                설정
              </Link>
              <form action={signOut}>
                <button
                  type='submit'
                  className='rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100'
                >
                  로그아웃
                </button>
              </form>
            </div>
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
          모바일에서 넣은 종목 타임라인을 같은 Supabase 계정으로 확인합니다. 검색으로 기록을 찾고 종목 상세에서
          차트·CRUD를 사용하세요.
        </p>

        {!configured ? (
          <div className='rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900'>
            Supabase env가 비어 있습니다. <code>apps/web/.env</code>를 확인하세요.
          </div>
        ) : null}

        {email ? (
          <>
            <form action='/search' method='get' className='flex gap-2'>
              <input
                name='q'
                placeholder='메모, 링크, 종목명으로 검색…'
                className='min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-500'
                aria-label='검색어'
              />
              <button
                type='submit'
                className='rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800'
              >
                검색
              </button>
            </form>

            <section className='flex flex-col gap-3'>
              <p className='text-sm text-zinc-600'>
                로그인: <span className='font-medium text-zinc-900'>{email}</span>
              </p>
              <h2 className='text-lg font-semibold'>관심종목</h2>
              {loadError ? (
                <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800'>
                  <p>관심종목을 불러오지 못했습니다. 잠시 후 다시 시도하세요.</p>
                  <p className='mt-2 font-mono text-xs text-red-700'>{loadError}</p>
                </div>
              ) : tickers.length === 0 ? (
                <p className='rounded-lg border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-600'>
                  아직 종목이 없습니다. 모바일 앱에서 먼저 추가하세요.
                </p>
              ) : (
                <ul className='flex flex-col gap-2'>
                  {tickers.map((ticker) => (
                    <li key={ticker.id}>
                      <Link
                        href={`/ticker/${ticker.id}`}
                        className='block rounded-lg border border-zinc-300 bg-white px-4 py-3 hover:border-zinc-400'
                      >
                        <p className='font-semibold'>
                          {ticker.symbol}{' '}
                          <span className='text-xs font-medium uppercase tracking-wide text-zinc-500'>
                            {ticker.market}
                          </span>
                        </p>
                        <p className='text-sm text-zinc-600'>{ticker.name ?? '이름 없음'}</p>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        ) : (
          <div className='rounded-lg border border-zinc-300 bg-white p-4 text-sm text-zinc-700'>
            <p className='font-medium'>시작</p>
            <ul className='mt-2 list-disc space-y-1 pl-5'>
              <li>매직링크 로그인</li>
              <li>모바일과 동일 계정으로 관심종목 조회</li>
              <li>entries 검색 · 종목 상세 (차트 + 타임라인 CRUD)</li>
            </ul>
          </div>
        )}
      </div>
    </main>
  );
}
