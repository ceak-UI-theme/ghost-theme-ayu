import { test, expect } from '@playwright/test';

const postUrl = 'http://172.22.0.199:2368/sirijeu-3-ai-editeoneun-jeongmal-saeroun-geosilgga-copilot-ihu-gaebal-doguyi-byeonhwa/';

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

test('dismissing floating audio also pauses playback', async ({ page }) => {
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

    await delay(250);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await delay(500);

    await expect(page.locator('[data-post-audio-floating]')).toBeVisible();
    await page.locator('[data-post-audio-floating-dismiss]').click();
    await delay(300);

    const state = await page.evaluate(() => {
        const media = document.querySelector('[data-post-audio] audio') || document.querySelector('.post-audio-player');
        const floating = document.querySelector('[data-post-audio-floating]');

        return {
            paused: media ? media.paused : null,
            ended: media ? media.ended : null,
            floatingHidden: floating ? floating.hidden : null
        };
    });

    expect(state.paused).toBeTruthy();
    expect(state.ended).toBeFalsy();
    expect(state.floatingHidden).toBeTruthy();
});
