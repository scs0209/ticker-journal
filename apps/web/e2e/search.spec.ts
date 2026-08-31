import { expect, test } from '@playwright/test';

test('검색 페이지는 로그인으로 리다이렉트한다', async ({ page }) => {
  await page.goto('/search?q=test');
  await expect(page).toHaveURL(/\/login/);
});
