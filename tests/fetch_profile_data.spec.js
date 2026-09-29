import { test, expect } from '@playwright/test';

test('Verify that data is returned from providing a username', async ({ page }) => {
  await page.goto('http://localhost:5173/');

  // Type the username and submit
  await page.getByRole('textbox', { name: 'AniList Username' }).fill('Andyroid17');
  await page.getByRole('button', { name: 'Find Recommendations' }).click();

  // Verify headings exist on the recommendations page
  await expect(page.getByRole('heading', { name: 'Recommendations for Andyroid17' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /Last Updated:/ })).toBeVisible();
});