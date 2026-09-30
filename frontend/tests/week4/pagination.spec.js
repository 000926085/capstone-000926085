import { test, expect } from '@playwright/test';

test('Verify the amount of recommendations shown reflects the pagination selection.', async ({ page }) => {
    await page.goto('http://localhost:5173/recommendations/mightbespooks');
    
    let cardLocators = page.getByTestId('anime-card');
    await expect(cardLocators).toHaveCount(10);

    await page.getByRole('radio', { name: '25' }).check();

    cardLocators = page.getByTestId('anime-card');
    await expect(cardLocators).toHaveCount(25);
});