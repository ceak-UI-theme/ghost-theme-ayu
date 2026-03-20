import { test, expect } from '@playwright/test';

const postUrl = 'http://172.22.0.199:2368/sirijeu-3-ai-editeoneun-jeongmal-saeroun-geosilgga-copilot-ihu-gaebal-doguyi-byeonhwa/';

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

test('floating audio time updates continuously while playing off-screen', async ({ page }) => {
    await page.goto(postUrl, { waitUntil: 'networkidle' });

    await page.waitForSelector('[data-post-audio]');
    await page.waitForFunction(() => {
        const root = document.querySelector('[data-post-audio]');
        return !!root && !!root.querySelector('media-player');
    });

    await page.evaluate(async () => {
        const media = document.querySelector('[data-post-audio] audio') || document.querySelector('.post-audio-player');

        if (!media) {
            throw new Error('media element not found');
        }

        await media.play();
    });

    await delay(200);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await delay(500);

    const firstTime = await page.locator('[data-post-audio-floating-time]').textContent();
    await delay(2200);
    const secondTime = await page.locator('[data-post-audio-floating-time]').textContent();

    expect(firstTime).toBeTruthy();
    expect(secondTime).toBeTruthy();
    expect(secondTime).not.toBe(firstTime);
});
