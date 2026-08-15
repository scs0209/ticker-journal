import { expect, test } from '@playwright/test';

test('로그인 페이지가 열린다', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
  await expect(page.getByLabel('이메일')).toBeVisible();
  await expect(page.getByRole('button', { name: '매직링크 보내기' })).toBeVisible();
});
