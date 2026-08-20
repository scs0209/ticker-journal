import { expect, test } from '@playwright/test';

test('홈에 아카이브 스캐폴드가 보인다', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '웹 아카이브' })).toBeVisible();
  await expect(page.getByText('Ticker Journal')).toBeVisible();
});
