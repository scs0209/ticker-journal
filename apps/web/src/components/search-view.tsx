import { APP_NAME } from '@ticker-journal/shared';
import Link from 'next/link';

import type { SearchEntryHit } from '@/lib/search-query';

type SearchViewProps = {
  query: string;
  hits: SearchEntryHit[];
  page: number;
  hasMore: boolean;
  loadError?: string | null;
  email?: string | null;
};

export function SearchView({ query, hits, page, hasMore, loadError = null, email = null }: SearchViewProps) {
  const trimmed = query.trim();
  const prevPage = page > 1 ? page - 1 : null;
  const nextPage = hasMore ? page + 1 : null;

  return (
    <main className='min-h-screen bg-zinc-50 text-zinc-900'>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16'>
        <div className='flex flex-col gap-2'>
          <Link href='/' className='text-sm text-zinc-500 hover:text-zinc-800'>
            ← {APP_NAME}
          </Link>
          <h1 className='text-3xl font-semibold tracking-tight'>아카이브 검색</h1>
          {email ? <p className='text-sm text-zinc-600'>로그인: {email}</p> : null}
        </div>

        <form action='/search' method='get' className='flex gap-2'>
          <input
            name='q'
            defaultValue={query}
            placeholder='메모, 링크, 매매 이유, 종목명…'
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

        {!trimmed ? (
          <p className='rounded-lg border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-600'>
            검색어를 입력하면 타임라인 기록을 찾습니다.
          </p>
        ) : loadError ? (
          <div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800'>
            <p>검색에 실패했습니다.</p>
            <p className='mt-2 font-mono text-xs text-red-700'>{loadError}</p>
          </div>
        ) : hits.length === 0 ? (
          <p className='rounded-lg border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-600'>
            「{trimmed}」에 맞는 기록이 없습니다.
          </p>
        ) : (
          <ul className='flex flex-col gap-2'>
            {hits.map((hit) => (
              <li key={hit.id}>
                <Link
                  href={`/ticker/${hit.ticker_id}`}
                  className='block rounded-lg border border-zinc-300 bg-white px-4 py-3 hover:border-zinc-400'
                >
                  <p className='text-xs font-medium uppercase tracking-wide text-zinc-500'>
                    {hit.type} · {hit.ticker_symbol}{' '}
                    <span className='normal-case text-zinc-400'>({hit.ticker_market})</span>
                  </p>
                  <p className='mt-1 font-semibold text-zinc-900'>{hit.ticker_name ?? hit.ticker_symbol}</p>
                  <p className='mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-600'>{hit.preview}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {trimmed && !loadError && (prevPage || nextPage) ? (
          <nav className='flex items-center justify-between gap-4 text-sm'>
            {prevPage ? (
              <Link
                href={`/search?q=${encodeURIComponent(trimmed)}&page=${prevPage}`}
                className='rounded-lg border border-zinc-300 bg-white px-3 py-2 hover:bg-zinc-100'
              >
                이전
              </Link>
            ) : (
              <span />
            )}
            <span className='text-zinc-500'>{page}페이지</span>
            {nextPage ? (
              <Link
                href={`/search?q=${encodeURIComponent(trimmed)}&page=${nextPage}`}
                className='rounded-lg border border-zinc-300 bg-white px-3 py-2 hover:bg-zinc-100'
              >
                다음
              </Link>
            ) : (
              <span />
            )}
          </nav>
        ) : null}
      </div>
    </main>
  );
}
