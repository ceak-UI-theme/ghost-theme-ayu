const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('http://172.22.0.199:2368/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(1500);
  const home = await page.evaluate(() => ({
    badges: document.querySelectorAll('[data-post-audio-badge]').length,
    rows: document.querySelectorAll('[data-post-badge-row]').length
  }));

  await page.goto('http://172.22.0.199:2368/gaebal6/', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(1500);
  const post = await page.evaluate(() => {
    const root = document.querySelector('[data-post-audio][data-slug="gaebal6"]');
    const player = root ? root.querySelectorAll('.post-audio-player').length : 0;
    const source = root ? root.querySelector('source[type="audio/mpeg"]') : null;

    return {
      audioRoot: !!root,
      player,
      source: source ? source.getAttribute('src') : null,
      inner: root ? root.innerHTML.slice(0, 500) : ''
    };
  });

  console.log(JSON.stringify({ home, post }));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
