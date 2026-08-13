import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HomeView } from '@/components/home-view';

describe('HomeView', () => {
  it('renders archive scaffold copy', () => {
    render(<HomeView />);
    expect(screen.getByRole('heading', { name: '웹 아카이브 뼈대' })).toBeInTheDocument();
    expect(screen.getByText(/Ticker Journal/i)).toBeInTheDocument();
  });
});
