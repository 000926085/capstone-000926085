import { test, expect } from '@playwright/test';

test('Modal opens and fetches data from the AniList API.', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await page.getByRole('textbox', { name: 'AniList Username' }).click();
    await page.getByRole('textbox', { name: 'AniList Username' }).fill('mightbespooks');
    await page.getByRole('button', { name: 'Find Recommendations' }).click();
    await page.getByTestId('details-btn').nth(1).click();

    const modalOverlay = page.getByTestId('modal-overlay');
    await expect(modalOverlay).toBeVisible();

    await expect(page.locator('text=Loading trailer...')).not.toBeVisible();
    const iframe = page.getByTestId('trailer-iframe');
    const noTrailerText = page.locator('text=No trailer found');

    const hasIframe = await iframe.isVisible().catch(() => false);
    if (hasIframe) {
        await expect(iframe).toBeVisible();
    } else {
        await expect(noTrailerText).toBeVisible();
    }
});