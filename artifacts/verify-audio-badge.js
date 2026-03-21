const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch({ headless: true });
  async function inspect(viewport) {
    const page = await browser.newPage({ viewport });
    await page.goto('http://172.22.0.199:2368/', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.post-feed .post[data-slug]');
    await page.waitForTimeout(1500);

    const card = page
      .locator('.post-feed .post[data-slug]')
      .filter({ has: page.locator('.post-media .post-audio-badge') })
      .first();

    const result = await card.evaluate((node) => {
      const badge = node.querySelector('.post-media .post-audio-badge');
      const badgeWrap = node.querySelector('.post-media-badges');

      return {
        badgeText: badge ? badge.textContent.trim() : null,
        badgeInMedia: !!badge,
        badgeOutsideMedia: !!node.querySelector('.post-header .post-audio-badge'),
        badgeWrapTop: badgeWrap ? getComputedStyle(badgeWrap).top : null,
        badgeWrapLeft: badgeWrap ? getComputedStyle(badgeWrap).left : null,
        badgeFontSize: badge ? getComputedStyle(badge).fontSize : null,
        badgePadding: badge ? getComputedStyle(badge).padding : null,
        badgeBackground: badge ? getComputedStyle(badge).backgroundColor : null
      };
    });

    await page.close();
    return result;
  }

  const desktop = await inspect({ width: 1280, height: 900 });
  const mobile = await inspect({ width: 390, height: 844 });

  console.log(JSON.stringify({ desktop, mobile }, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
