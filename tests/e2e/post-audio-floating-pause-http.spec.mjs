import { test, expect } from '@playwright/test';

const postUrl = 'http://172.22.0.199:2368/sirijeu-3-ai-editeoneun-jeongmal-saeroun-geosilgga-copilot-ihu-gaebal-doguyi-byeonhwa/';

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

test('floating audio remains visible when paused off-screen and hides after dismiss', async ({ page }) => {
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

    const whilePlaying = await page.evaluate(() => {
        const floating = document.querySelector('[data-post-audio-floating]');

        return {
            hidden: floating ? floating.hidden : null,
            status: document.querySelector('[data-post-audio-floating-status]')?.textContent?.trim() || null
        };
    });

    expect(whilePlaying.hidden).toBeFalsy();
    expect(whilePlaying.status).toBe('듣는 중');

    await page.evaluate(() => {
        const media = document.querySelector('[data-post-audio] audio') || document.querySelector('.post-audio-player');

        if (!media) {
            throw new Error('media element not found');
        }

        media.pause();
    });

    await delay(300);

    const whilePaused = await page.evaluate(() => {
        const floating = document.querySelector('[data-post-audio-floating]');

        return {
            hidden: floating ? floating.hidden : null,
            ariaHidden: floating ? floating.getAttribute('aria-hidden') : null,
            status: document.querySelector('[data-post-audio-floating-status]')?.textContent?.trim() || null
        };
    });

    expect(whilePaused.hidden).toBeFalsy();
    expect(whilePaused.ariaHidden).toBe('false');
    expect(whilePaused.status).toBe('일시정지');

    await page.locator('[data-post-audio-floating-dismiss]').click();
    await delay(300);

    const afterDismiss = await page.evaluate(() => {
        const floating = document.querySelector('[data-post-audio-floating]');

        return {
            hidden: floating ? floating.hidden : null,
            ariaHidden: floating ? floating.getAttribute('aria-hidden') : null
        };
    });

    expect(afterDismiss.hidden).toBeTruthy();
    expect(afterDismiss.ariaHidden).toBe('true');
});
