import { test, expect } from '@playwright/test';

test('Verify that the login interface behaves as expected.', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    // check that an error message appears when provided with invalid credntials.
    await page.getByTestId('username-input').click();
    await page.getByTestId('username-input').fill('roland');
    await page.getByTestId('password-input').click();
    await page.getByTestId('password-input').fill('wrongpassword');
    await page.getByTestId('sign-in-button').click();
    const message = page.getByTestId('error-msg');
    await expect(message).toHaveText('Invalid credentials. Please try again.');

    // check that the visibility toggle works as intended.
    const passwordInput = page.getByTestId('password-input');
    const toggleButton = page.getByTestId('toggle-visibility');
    await expect(passwordInput).toHaveAttribute('type', 'password');
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'text');
    await toggleButton.click();
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // check that we are redirected upon providing correct credentials.
    await page.getByTestId('password-input').click();
    await page.getByTestId('password-input').fill('password');
    await page.getByTestId('sign-in-button').click();
    await expect(page).toHaveURL('http://localhost:5173/admin-dashboard');

    // logout and check that the admin dashboard cannot be visited without being logged in, proving that the session was destroyed.
    const logout = page.getByTestId("logout");
    await logout.click();
    await expect(page).toHaveURL('http://localhost:5173/login');
    await page.goto('http://localhost:5173/admin-dashboard');
    await expect(page).toHaveURL('http://localhost:5173/login'); 
});