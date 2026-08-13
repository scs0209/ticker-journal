import { render, screen } from '@testing-library/react-native';
import WatchlistScreen from '../app/index';

jest.mock('expo-router', () => {
  const React = require('react');
  return {
    Link: ({ children, asChild }: { children: React.ReactNode; asChild?: boolean; href: string }) =>
      asChild ? children : <>{children}</>,
    Stack: {
      Screen: () => null,
    },
  };
});

describe('WatchlistScreen', () => {
  it('shows placeholder tickers', () => {
    render(<WatchlistScreen />);
    expect(screen.getByText('관심종목')).toBeOnTheScreen();
    expect(screen.getByText(/AAPL/)).toBeOnTheScreen();
    expect(screen.getByText(/005930/)).toBeOnTheScreen();
  });
});
