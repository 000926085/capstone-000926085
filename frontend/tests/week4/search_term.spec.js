import { test, expect } from '@playwright/test';

test('Verify that the recommendations reflect the search term.', async ({ page }) => {
    const searchTerm = "mahou";

    await page.goto('http://localhost:5173/recommendations/mightbespooks');

    const searchInput = page.getByTestId('title-search-input');
    await searchInput.fill(searchTerm);

    // extract all titles of the anime shown and check against the search input.
    const titleLocators = page.getByTestId('anime-card-title');
    const titles = await titleLocators.allTextContents();
    for (const title of titles) {
        expect(title.toLowerCase()).toContain(searchTerm.toLowerCase());
    }
});