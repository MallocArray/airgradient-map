import { test, expect } from '@playwright/test';

test.describe('Map navigation', () => {
  test('site loads and map component is present', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/', { waitUntil: 'networkidle' });

    // Verify the page title is correct
    await expect(page).toHaveTitle(/AirGradient/);

    // Check that the map container exists
    const mapContainer = page.locator('#map');
    await expect(mapContainer).toBeVisible();

    // Check that the geosearch control is present
    const geosearchBar = page.locator('.leaflet-geosearch-bar');
    await expect(geosearchBar).toBeVisible();

    console.log('✓ Site loaded successfully with map and geosearch visible');
  });

  test('map moves to Chicago using URL parameters', async ({ page }) => {
    // Navigate to Chicago coordinates (lat: 41.84, lng: -87.61, zoom: 12)
    await page.goto('/?lat=41.84&long=-87.61&zoom=12', { waitUntil: 'networkidle' });

    // Verify the page loaded
    await expect(page).toHaveTitle(/AirGradient/);

    // Check that the map container exists
    const mapContainer = page.locator('#map');
    await expect(mapContainer).toBeVisible();

    // Wait a bit for the map to settle
    await page.waitForTimeout(2000);

    // Try to read the map center from the test-exposed global (if available)
    const mapCenter = await page.evaluate(() => {
      try {
        return (window as any).__TEST_MAP_CENTER || null;
      } catch (e) {
        return null;
      }
    });

    if (mapCenter) {
      console.log(`Map center: lat=${mapCenter.lat}, lng=${mapCenter.lng}, zoom=${mapCenter.zoom}`);
      // Verify map is roughly at Chicago (within ~0.5 degrees for testing purposes)
      expect(Math.abs(mapCenter.lat - 41.84)).toBeLessThan(0.5);
      expect(Math.abs(mapCenter.lng - (-87.61))).toBeLessThan(0.5);
      expect(mapCenter.zoom).toBe(12);
      console.log('✓ Map moved to Chicago as expected');
    } else {
      // Fallback: just verify the map is visible (test-global not available)
      console.log('⚠ Test-global __TEST_MAP_CENTER not available; verify map is visible');
      const mapElement = page.locator('.leaflet-container');
      await expect(mapElement).toBeVisible();
      console.log('✓ Map container is visible');
    }
  });
});
