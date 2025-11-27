import { test, expect } from '@playwright/test';

test.describe('Map search', () => {
  test('search zip codes 63127 then 63128 shows suggestions', async ({ page }) => {
    await page.goto('/');

    const input = page.locator('.leaflet-geosearch-bar input');
    await expect(input).toBeVisible({ timeout: 30000 });

    // search 63127
    await input.fill('63127');
    // typing may trigger suggestions
    const results = page.locator('.leaflet-geosearch-bar .results div');
    await expect(results.first()).toBeVisible({ timeout: 20000 });
    // click first suggestion to perform the search
    await results.first().click();

    // now search 63128
    await input.fill('63128');
    await expect(results.first()).toBeVisible({ timeout: 20000 });
    await results.first().click();
  });
});
