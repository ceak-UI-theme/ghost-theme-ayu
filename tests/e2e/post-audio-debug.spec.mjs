import { test } from '@playwright/test';

test('debug post audio target page', async ({ page }) => {
  await page.goto('/sirijeu-3-ai-editeoneun-jeongmal-saeroun-geosilgga-copilot-ihu-gaebal-doguyi-byeonhwa/');
  await page.waitForTimeout(1500);

  const info = await page.evaluate(async () => {
    const root = document.querySelector('[data-post-audio]');
    const audio = root ? root.querySelector('audio') : null;
    const source = audio ? audio.querySelector('source') : null;
    const track = audio ? audio.querySelector('track') : null;
    const rootStyle = root ? getComputedStyle(root) : null;
    const audioStyle = audio ? getComputedStyle(audio) : null;
    const status = typeof window.fetchAudioAssetStatus === 'function'
      ? await window.fetchAudioAssetStatus('sirijeu-3-ai-editeoneun-jeongmal-saeroun-geosilgga-copilot-ihu-gaebal-doguyi-byeonhwa')
      : null;

    return {
      status,
      rootOuterHTML: root ? root.outerHTML : null,
      audioOuterHTML: audio ? audio.outerHTML : null,
      rootHidden: root ? root.hidden : null,
      rootClientHeight: root ? root.clientHeight : null,
      rootDisplay: rootStyle ? rootStyle.display : null,
      rootVisibility: rootStyle ? rootStyle.visibility : null,
      audioClientHeight: audio ? audio.clientHeight : null,
      audioDisplay: audioStyle ? audioStyle.display : null,
      audioVisibility: audioStyle ? audioStyle.visibility : null,
      audioControls: audio ? audio.hasAttribute('controls') : null,
      audioReadyState: audio ? audio.readyState : null,
      audioNetworkState: audio ? audio.networkState : null,
      sourceSrc: source ? source.getAttribute('src') : null,
      trackSrc: track ? track.getAttribute('src') : null
    };
  });

  console.log(JSON.stringify(info, null, 2));
});
