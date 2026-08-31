import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SettingsView } from '@/components/settings-view';

vi.mock('@/app/login/actions', () => ({
  signOut: vi.fn(),
}));

vi.mock('@/app/settings/actions', () => ({
  deleteAccount: vi.fn(),
}));

describe('SettingsView', () => {
  it('계정 이메일과 삭제 경고를 보여준다', () => {
    render(<SettingsView email='you@example.com' />);
    expect(screen.getByText('you@example.com')).toBeInTheDocument();
    expect(screen.getByText(/되돌릴 수 없습니다/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '계정 삭제' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '개인정보 처리방침' })).toHaveAttribute('href', '/privacy');
  });
});
