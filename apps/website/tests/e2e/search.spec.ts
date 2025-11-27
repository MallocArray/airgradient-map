import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Map search', () => {
  test('search zip codes 63127 then 63128 shows suggestions (deterministic)', async ({ page }) => {
    // Load fixtures
    const fixturesDir = path.resolve(__dirname, '..', 'fixtures');
    const geocode63127 = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'geocode-63127.json'), 'utf8'));
    const geocode63128 = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'geocode-63128.json'), 'utf8'));

    // Intercept Nominatim geocoding requests and return deterministic fixtures
    await page.route('https://nominatim.openstreetmap.org/*', async (route) => {
      const url = route.request().url();
      if (url.includes('63127')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(geocode63127)
        });
        return;
      }

      if (url.includes('63128')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(geocode63128)
        });
        return;
      }

      // default: return empty array to avoid external calls
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('/');

    const input = page.locator('.leaflet-geosearch-bar input');
    await expect(input).toBeVisible({ timeout: 30000 });

    // get initial map center
    const initialCenter = await page.evaluate(() => (window as any).__TEST_MAP_CENTER || null);

    // search 63127
    await input.fill('63127');
    // typing may trigger suggestions
    const results = page.locator('.leaflet-geosearch-bar .results div');
    await expect(results.first()).toBeVisible({ timeout: 20000 });
    // click first suggestion to perform the search
    await results.first().click();

    // wait for the map center to change from initial
    await page.waitForFunction(
      (prev) => {
        // @ts-ignore - run in browser context
        const cur = (window as any).__TEST_MAP_CENTER;
        if (!cur) return false;
        if (!prev) return true;
        return cur.lat !== prev.lat || cur.lng !== prev.lng || cur.zoom !== prev.zoom;
      },
      initialCenter,
      { timeout: 20000 }
    );

    const centerAfterFirst = await page.evaluate(() => (window as any).__TEST_MAP_CENTER || null);
    expect(centerAfterFirst).not.toEqual(initialCenter);

    // now search 63128
    // clear input first (simulate user)
    await input.fill('');
    const beforeSecond = centerAfterFirst;
    await input.fill('63128');
    await expect(results.first()).toBeVisible({ timeout: 20000 });
    await results.first().click();

    // wait for the map center to change from beforeSecond
    await page.waitForFunction(
      (prev) => {
        // @ts-ignore - run in browser context
        const cur = (window as any).__TEST_MAP_CENTER;
        if (!cur) return false;
        if (!prev) return true;
        return cur.lat !== prev.lat || cur.lng !== prev.lng || cur.zoom !== prev.zoom;
      },
      beforeSecond,
      { timeout: 20000 }
    );

    const centerAfterSecond = await page.evaluate(() => (window as any).__TEST_MAP_CENTER || null);
    expect(centerAfterSecond).not.toEqual(beforeSecond);
  });
});
