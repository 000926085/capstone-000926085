import { test, expect } from '@playwright/test';

test('Modal opens and fetches data from the AniList API.', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.getByRole('textbox', { name: 'AniList Username' }).click();
    await page.getByRole('textbox', { name: 'AniList Username' }).fill('mightbespooks');
    await page.getByRole('button', { name: 'Find Recommendations' }).click();
    await page.getByTestId('details-btn').nth(1).click();

    const modalOverlay = page.locator('.modal-overlay.open');
    await expect(modalOverlay).toBeVisible();

    const iframe = page.locator('.trailer-container iframe');
    const noTrailerText = page.locator('text=No trailer found');
    await Promise.race([
        expect(iframe).toBeVisible({ timeout: 10000 }),
        expect(noTrailerText).toBeVisible({ timeout: 10000 })
    ]);
});