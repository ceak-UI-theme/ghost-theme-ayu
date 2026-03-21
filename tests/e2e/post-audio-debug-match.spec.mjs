import { test } from '@playwright/test';

test('debug subtitle cue matching', async ({ page }) => {
  await page.goto('/sirijeu-3-ai-editeoneun-jeongmal-saeroun-geosilgga-copilot-ihu-gaebal-doguyi-byeonhwa/');
  await page.waitForTimeout(2500);
  await page.evaluate(async () => {
    const player = document.querySelector('.post-audio-player');
    player.currentTime = 5;
    try { await player.play(); } catch (e) {}
  });
  await page.waitForTimeout(2500);
  const data = await page.evaluate(async () => {
    const player = document.querySelector('.post-audio-player');
    const cues = await window.fetchVttCues('/content/media/audio/sirijeu-3-ai-editeoneun-jeongmal-saeroun-geosilgga-copilot-ihu-gaebal-doguyi-byeonhwa.vtt');
    const currentTime = Number(player.currentTime) || 0;
    const active = cues.find((cue) => currentTime >= cue.start && currentTime <= cue.end) || null;
    return { currentTime, firstFive: cues.slice(0, 5), active, captions: document.querySelector('[data-post-audio-captions]')?.textContent?.trim() || null };
  });
  console.log(JSON.stringify(data, null, 2));
});
