import { expect, test } from '@playwright/test';

test('로그인 페이지가 열린다', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
  await expect(page.getByLabel('이메일')).toBeVisible();
  await expect(page.getByRole('button', { name: '로그인' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Google로 계속하기' })).toBeVisible();
});

test('콜백 실패 시 안내를 보여준다', async ({ page }) => {
  await page.goto('/login?error=auth');
  await expect(page.getByText('로그인에 실패했습니다')).toBeVisible();
});
