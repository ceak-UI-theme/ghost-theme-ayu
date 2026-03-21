import { test } from '@playwright/test';

test('screenshot post audio target page', async ({ page }) => {
  await page.goto('/sirijeu-3-ai-editeoneun-jeongmal-saeroun-geosilgga-copilot-ihu-gaebal-doguyi-byeonhwa/');
  await page.waitForTimeout(1500);
  await page.locator('[data-post-audio]').screenshot({ path: 'artifacts/post-audio-target.png' });
});
