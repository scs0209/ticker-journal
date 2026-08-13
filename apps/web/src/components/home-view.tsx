import { APP_NAME } from '@ticker-journal/shared';

export function HomeView() {
  return (
    <main className='min-h-screen bg-zinc-50 text-zinc-900'>
      <div className='mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-16'>
        <p className='text-xs uppercase tracking-[0.14em] text-zinc-500'>{APP_NAME}</p>
        <h1 className='text-4xl font-semibold tracking-tight'>웹 아카이브 뼈대</h1>
        <p className='max-w-xl text-base leading-7 text-zinc-600'>
          모바일에서 넣은 종목 타임라인(메모·링크·매매 이유)을 같은 계정으로 검색·정리하는 Next.js 앱입니다. Phase 1에서
          Supabase Auth + 검색을 붙입니다.
        </p>
        <div className='rounded-lg border border-zinc-300 bg-white p-4 text-sm text-zinc-700'>
          <p className='font-medium'>다음</p>
          <ul className='mt-2 list-disc space-y-1 pl-5'>
            <li>매직링크 로그인</li>
            <li>entries 검색 (q, page size 20)</li>
            <li>종목 상세 + TradingView embed</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
