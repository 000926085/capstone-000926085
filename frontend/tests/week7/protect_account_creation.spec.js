import { test, expect } from '@playwright/test';

test('Admin setup page is restricted to Director role only', async ({ page }) => {
    await page.goto('http://localhost:5173/login');
    await page.getByTestId('username-input').fill('malkuth');
    await page.getByTestId('password-input').fill('password');
    await page.getByTestId('sign-in-button').click();
    
    await expect(page).toHaveURL('http://localhost:5173/admin-dashboard');
    await page.goto('http://localhost:5173/admin-setup');
    await expect(page).toHaveURL('http://localhost:5173/admin-dashboard');

    await page.getByTestId('logout').click();

    await expect(page).toHaveURL('http://localhost:5173/login');

    await page.getByTestId('username-input').fill('roland');
    await page.getByTestId('password-input').fill('password');
    await page.getByTestId('sign-in-button').click();

    await expect(page).toHaveURL('http://localhost:5173/admin-dashboard');
    await page.goto('http://localhost:5173/admin-setup');
    await expect(page).toHaveURL('http://localhost:5173/admin-setup');
});