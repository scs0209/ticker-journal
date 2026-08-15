import { render, screen, waitFor } from '@testing-library/react-native';

import WatchlistScreen from '../app/index';

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    Link: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean; href: string }) =>
      asChild ? children : <>{children}</>,
    Redirect: () => null,
    useFocusEffect: (cb: () => void | (() => void)) => {
      React.useEffect(() => {
        const cleanup = cb();
        return typeof cleanup === 'function' ? cleanup : undefined;
      }, []);
    },
    Stack: {
      Screen: () => null,
    },
  };
});

jest.mock('../lib/auth', () => ({
  useAuth: () => ({
    session: { user: { id: '00000000-0000-4000-8000-000000000001' } },
    loading: false,
    configured: true,
    signInWithMagicLink: jest.fn(),
    signOut: jest.fn(),
  }),
}));

jest.mock('../lib/api', () => ({
  listTickers: jest.fn(async () => [
    {
      id: '11111111-1111-4111-8111-111111111111',
      user_id: '00000000-0000-4000-8000-000000000001',
      market: 'US',
      symbol: 'AAPL',
      name: 'Apple',
      created_at: '2026-08-13T00:00:00.000Z',
    },
    {
      id: '22222222-2222-4222-8222-222222222222',
      user_id: '00000000-0000-4000-8000-000000000001',
      market: 'KR',
      symbol: '005930',
      name: '삼성전자',
      created_at: '2026-08-13T00:00:00.000Z',
    },
  ]),
  createTicker: jest.fn(),
  deleteTicker: jest.fn(),
}));

describe('WatchlistScreen', () => {
  it('shows tickers from api', async () => {
    render(<WatchlistScreen />);
    await waitFor(() => {
      expect(screen.getByText('관심종목')).toBeOnTheScreen();
      expect(screen.getByText(/AAPL/)).toBeOnTheScreen();
      expect(screen.getByText(/005930/)).toBeOnTheScreen();
    });
  });
});
