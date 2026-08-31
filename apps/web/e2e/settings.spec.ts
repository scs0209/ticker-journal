import { expect, test } from '@playwright/test';

test('개인정보 처리방침 페이지가 열린다', async ({ page }) => {
  await page.goto('/privacy');
  await expect(page.getByRole('heading', { name: '개인정보 처리방침' })).toBeVisible();
  await expect(page.getByText(/계정 삭제/)).toBeVisible();
});

test('설정은 비로그인 시 로그인으로 보낸다', async ({ page }) => {
  await page.goto('/settings');
  await expect(page).toHaveURL(/\/login/);
});
