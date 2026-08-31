import { APP_NAME } from '@ticker-journal/shared';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className='min-h-screen bg-zinc-50 text-zinc-900'>
      <div className='mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-16'>
        <div className='flex flex-col gap-2'>
          <p className='text-xs uppercase tracking-[0.14em] text-zinc-500'>{APP_NAME}</p>
          <h1 className='text-3xl font-semibold tracking-tight'>개인정보 처리방침</h1>
          <p className='text-sm text-zinc-500'>최종 갱신: 2026-08-31</p>
        </div>

        <section className='flex flex-col gap-3 text-base leading-7 text-zinc-700'>
          <h2 className='text-lg font-semibold text-zinc-900'>수집하는 정보</h2>
          <p>{APP_NAME}은(는) 서비스 제공을 위해 아래 정보를 수집·저장합니다.</p>
          <ul className='list-disc space-y-1 pl-5'>
            <li>계정: 이메일 주소 (Supabase Auth)</li>
            <li>사용자 콘텐츠: 관심종목, 메모·링크·매매 기록</li>
            <li>기술 정보: 로그인 세션 토큰 (기기 로컬 저장)</li>
          </ul>
        </section>

        <section className='flex flex-col gap-3 text-base leading-7 text-zinc-700'>
          <h2 className='text-lg font-semibold text-zinc-900'>이용 목적</h2>
          <ul className='list-disc space-y-1 pl-5'>
            <li>동일 계정으로 모바일 입력·웹 검색을 연결</li>
            <li>종목 타임라인 저장·조회·삭제</li>
            <li>인증 및 보안 (RLS로 본인 데이터만 접근)</li>
          </ul>
        </section>

        <section className='flex flex-col gap-3 text-base leading-7 text-zinc-700'>
          <h2 className='text-lg font-semibold text-zinc-900'>보관·처리 위탁</h2>
          <p>
            데이터는 Supabase(Postgres, Auth)에 저장됩니다. 차트는 TradingView embed(WebView)를 사용하며, 차트 제공자는
            별도 정책이 적용될 수 있습니다.
          </p>
        </section>

        <section className='flex flex-col gap-3 text-base leading-7 text-zinc-700'>
          <h2 className='text-lg font-semibold text-zinc-900'>제3자 제공</h2>
          <p>사용자 데이터를 판매하거나 광고 목적으로 제공하지 않습니다.</p>
        </section>

        <section className='flex flex-col gap-3 text-base leading-7 text-zinc-700'>
          <h2 className='text-lg font-semibold text-zinc-900'>계정 삭제</h2>
          <p>
            앱·웹 설정에서 계정을 삭제할 수 있습니다. 삭제 시 tickers·entries 등 사용자 데이터는 함께 제거되며 복구할 수
            없습니다.
          </p>
        </section>

        <section className='flex flex-col gap-3 text-base leading-7 text-zinc-700'>
          <h2 className='text-lg font-semibold text-zinc-900'>문의</h2>
          <p>개인정보 관련 문의: 레포 이슈 또는 프로젝트 maintainer 이메일로 연락해 주세요.</p>
        </section>

        <Link href='/' className='text-sm text-zinc-600 underline hover:text-zinc-900'>
          홈으로
        </Link>
      </div>
    </main>
  );
}
