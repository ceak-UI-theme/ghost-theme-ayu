import { test } from '@playwright/test';

test('inspect latest audio subtitle state', async ({ page }) => {
  await page.goto('/sirijeu-3-ai-editeoneun-jeongmal-saeroun-geosilgga-copilot-ihu-gaebal-doguyi-byeonhwa/');
  await page.waitForTimeout(2500);
  const state1 = await page.evaluate(() => ({
    title: document.querySelector('.post-audio-title')?.textContent?.trim() || null,
    transcriptExists: !!document.querySelector('[data-post-audio-transcript]'),
    captions: document.querySelector('[data-post-audio-captions]')?.textContent?.trim() || null,
    playerTag: document.querySelector('.post-audio-player')?.tagName || null,
  }));
  console.log('STATE1', JSON.stringify(state1));
  await page.evaluate(async () => {
    const player = document.querySelector('.post-audio-player');
    player.currentTime = 5;
    try { await player.play(); } catch (e) {}
  });
  await page.waitForTimeout(2500);
  const state2 = await page.evaluate(() => ({
    captions: document.querySelector('[data-post-audio-captions]')?.textContent?.trim() || null,
    currentTime: document.querySelector('.post-audio-player')?.currentTime || 0,
  }));
  console.log('STATE2', JSON.stringify(state2));
});
