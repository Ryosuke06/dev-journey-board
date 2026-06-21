import { expect, test } from '@playwright/test';

test('opens the SpecLens Timeline shell without login', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'SpecLens Timeline' })).toBeVisible();
  await expect(page.getByText('ログインなしで利用できます')).toBeVisible();
});
