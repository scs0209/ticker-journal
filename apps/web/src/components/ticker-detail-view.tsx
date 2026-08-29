'use client';

import { buildChartHtml, type Entry, type Ticker, TimelineFilterSchema } from '@ticker-journal/shared';
import Link from 'next/link';
import { useActionState, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { createEntry, deleteEntry, type EntryActionState } from '@/app/ticker/[id]/actions';
import { formatEntryPreview } from '@/lib/entry-format';

const FILTERS = TimelineFilterSchema.options;
const ENTRY_TYPES = ['memo', 'link', 'trade'] as const;
const INITIAL: EntryActionState = { error: null };

type TickerDetailViewProps = {
  ticker: Ticker;
  entries: Entry[];
  filter: (typeof FILTERS)[number];
};

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type='submit'
      disabled={pending}
      className='rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50'
    >
      {pending ? '저장 중…' : '저장'}
    </button>
  );
}

export function TickerDetailView({ ticker, entries, filter }: TickerDetailViewProps) {
  const chartHtml = useMemo(() => buildChartHtml(ticker.market, ticker.symbol), [ticker.market, ticker.symbol]);
  const [modalOpen, setModalOpen] = useState(false);
  const [entryType, setEntryType] = useState<(typeof ENTRY_TYPES)[number]>('memo');
  const [state, formAction] = useActionState(createEntry, INITIAL);

  const closeModal = () => {
    setModalOpen(false);
    setEntryType('memo');
  };

  return (
    <main className='min-h-screen bg-zinc-50 text-zinc-900'>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-10'>
        <Link href='/' className='text-sm text-zinc-500 hover:text-zinc-800'>
          ← 홈
        </Link>

        <header className='flex flex-col gap-1'>
          <h1 className='text-3xl font-semibold tracking-tight'>{ticker.symbol}</h1>
          <p className='text-sm text-zinc-600'>
            {ticker.name ?? '이름 없음'} · {ticker.market}
          </p>
        </header>

        <div className='h-52 overflow-hidden rounded-lg border border-zinc-300 bg-white'>
          <iframe
            title={`${ticker.symbol} chart`}
            srcDoc={chartHtml}
            sandbox='allow-scripts allow-same-origin'
            className='h-full w-full border-0'
          />
        </div>

        <nav className='flex flex-wrap gap-2' aria-label='타임라인 필터'>
          {FILTERS.map((item) => (
            <Link
              key={item}
              href={item === 'all' ? `/ticker/${ticker.id}` : `/ticker/${ticker.id}?filter=${item}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-wide ${
                filter === item
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-300 bg-white text-zinc-600 hover:bg-zinc-100'
              }`}
            >
              {item}
            </Link>
          ))}
        </nav>

        {entries.length === 0 ? (
          <p className='rounded-lg border border-dashed border-zinc-300 bg-white p-4 text-sm text-zinc-600'>
            타임라인이 비어 있습니다.
          </p>
        ) : (
          <ul className='flex flex-col gap-2'>
            {entries.map((entry) => (
              <li key={entry.id} className='rounded-lg border border-zinc-300 bg-white px-4 py-3'>
                <div className='flex items-start justify-between gap-3'>
                  <div className='min-w-0 flex-1'>
                    <p className='text-xs font-medium uppercase tracking-wide text-zinc-500'>{entry.type}</p>
                    <p className='mt-1 whitespace-pre-wrap text-sm leading-6 text-zinc-700'>
                      {formatEntryPreview(entry)}
                    </p>
                  </div>
                  <form action={deleteEntry}>
                    <input type='hidden' name='entry_id' value={entry.id} />
                    <input type='hidden' name='ticker_id' value={ticker.id} />
                    <button
                      type='submit'
                      className='shrink-0 text-xs text-red-600 hover:text-red-800'
                      aria-label='엔트리 삭제'
                    >
                      삭제
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          type='button'
          onClick={() => setModalOpen(true)}
          className='fixed bottom-8 right-8 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-2xl font-semibold text-white shadow-lg hover:bg-zinc-800'
          aria-label='엔트리 추가'
        >
          +
        </button>
      </div>

      {modalOpen ? (
        <div className='fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center'>
          <div className='w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl'>
            <h2 className='text-lg font-semibold'>엔트리 추가</h2>

            <div className='mt-3 flex flex-wrap gap-2'>
              {ENTRY_TYPES.map((type) => (
                <button
                  key={type}
                  type='button'
                  onClick={() => setEntryType(type)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium uppercase ${
                    entryType === type
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-zinc-300 bg-white text-zinc-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <form action={formAction} className='mt-4 flex flex-col gap-3'>
              <input type='hidden' name='ticker_id' value={ticker.id} />
              <input type='hidden' name='entry_type' value={entryType} />

              {entryType === 'memo' ? (
                <textarea
                  name='body'
                  required
                  placeholder='메모'
                  rows={4}
                  className='rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500'
                />
              ) : null}

              {entryType === 'link' ? (
                <>
                  <input
                    name='url'
                    type='url'
                    required
                    placeholder='https://...'
                    className='rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500'
                  />
                  <input
                    name='title'
                    placeholder='제목 (선택)'
                    className='rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500'
                  />
                  <input
                    name='note'
                    placeholder='노트 (선택)'
                    className='rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500'
                  />
                </>
              ) : null}

              {entryType === 'trade' ? (
                <>
                  <div className='flex gap-2'>
                    <label className='flex items-center gap-2 text-sm'>
                      <input type='radio' name='side' value='buy' defaultChecked />
                      buy
                    </label>
                    <label className='flex items-center gap-2 text-sm'>
                      <input type='radio' name='side' value='sell' />
                      sell
                    </label>
                  </div>
                  <textarea
                    name='reason'
                    placeholder='매매 이유 (선택)'
                    rows={3}
                    className='rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-500'
                  />
                </>
              ) : null}

              {state.error ? <p className='text-sm text-red-700'>{state.error}</p> : null}

              <div className='flex justify-end gap-2'>
                <button type='button' onClick={closeModal} className='rounded-lg px-3 py-2 text-sm text-zinc-600'>
                  취소
                </button>
                <SaveButton />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </main>
  );
}
