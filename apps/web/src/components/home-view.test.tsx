import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { HomeView } from '@/components/home-view';

vi.mock('@/app/login/actions', () => ({
  signOut: vi.fn(),
}));

describe('HomeView', () => {
  it('로그인하면 관심종목을 보여준다', () => {
    render(
      <HomeView
        configured
        email='you@example.com'
        tickers={[
          {
            id: '11111111-1111-4111-8111-111111111111',
            user_id: '00000000-0000-4000-8000-000000000001',
            market: 'US',
            symbol: 'AAPL',
            name: 'Apple',
            created_at: '2026-08-13T00:00:00.000Z',
          },
        ]}
      />,
    );
    expect(screen.getByText(/AAPL/)).toBeInTheDocument();
    expect(screen.getByText('you@example.com')).toBeInTheDocument();
  });
});
