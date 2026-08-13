import { expect, test } from '@playwright/test';

test('home shows archive scaffold', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '웹 아카이브 뼈대' })).toBeVisible();
  await expect(page.getByText('Ticker Journal')).toBeVisible();
});
