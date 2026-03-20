import { test, expect } from '@playwright/test';

const postUrl = 'http://172.22.0.199:2368/sirijeu-3-ai-editeoneun-jeongmal-saeroun-geosilgga-copilot-ihu-gaebal-doguyi-byeonhwa/';

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

test('floating audio player works on deployed Ghost post', async ({ page }) => {
    await page.goto(postUrl, { waitUntil: 'networkidle' });

    await page.waitForSelector('[data-post-audio]');
    await page.waitForFunction(() => {
        const root = document.querySelector('[data-post-audio]');
        return !!root && !!root.querySelector('media-player');
    });

    await expect(page.locator('[data-post-audio-floating]')).toHaveCount(1);

    const beforePlay = await page.evaluate(() => {
        const media = document.querySelector('[data-post-audio] audio') || document.querySelector('.post-audio-player');
        const floating = document.querySelector('[data-post-audio-floating]');

        return {
            mediaFound: !!media,
            floatingHidden: floating ? floating.hidden : null
        };
    });

    expect(beforePlay.mediaFound).toBeTruthy();
    expect(beforePlay.floatingHidden).toBeTruthy();

    await page.evaluate(async () => {
        const media = document.querySelector('[data-post-audio] audio') || document.querySelector('.post-audio-player');

        if (!media) {
            throw new Error('media element not found');
        }

        await media.play();
    });

    await delay(150);

    const afterPlay = await page.evaluate(() => {
        const media = document.querySelector('[data-post-audio] audio') || document.querySelector('.post-audio-player');

        return {
            paused: media ? media.paused : null,
            currentTime: media ? media.currentTime : null,
            ended: media ? media.ended : null,
            duration: media ? media.duration : null
        };
    });

    expect(afterPlay.duration).toBeGreaterThan(10);
    expect(afterPlay.currentTime).toBeGreaterThan(0);
    expect(afterPlay.paused).toBeFalsy();
    expect(afterPlay.ended).toBeFalsy();

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await delay(350);

    const afterScrollDown = await page.evaluate(() => {
        const floating = document.querySelector('[data-post-audio-floating]');
        const root = document.querySelector('[data-post-audio]');
        const media = document.querySelector('[data-post-audio] audio') || document.querySelector('.post-audio-player');

        return {
            hidden: floating ? floating.hidden : null,
            ariaHidden: floating ? floating.getAttribute('aria-hidden') : null,
            status: document.querySelector('[data-post-audio-floating-status]')?.textContent?.trim() || null,
            time: document.querySelector('[data-post-audio-floating-time]')?.textContent?.trim() || null,
            playerBottom: root ? root.getBoundingClientRect().bottom : null,
            paused: media ? media.paused : null,
            ended: media ? media.ended : null,
            duration: media ? media.duration : null
        };
    });

    expect(afterScrollDown.playerBottom).toBeLessThan(0);

    expect(afterScrollDown.hidden).toBeFalsy();
    expect(afterScrollDown.ariaHidden).toBe('false');
    expect(afterScrollDown.status).toBe('듣는 중');
    expect(afterScrollDown.time).toContain('/');

    await page.evaluate(() => {
        const root = document.querySelector('[data-post-audio]');

        if (root) {
            root.scrollIntoView({ block: 'center', behavior: 'instant' });
        }
    });
    await delay(500);

    const afterScrollUp = await page.evaluate(() => {
        const floating = document.querySelector('[data-post-audio-floating]');
        const root = document.querySelector('[data-post-audio]');

        return {
            hidden: floating ? floating.hidden : null,
            ariaHidden: floating ? floating.getAttribute('aria-hidden') : null,
            scrollY: window.scrollY,
            playerTop: root ? root.getBoundingClientRect().top : null,
            playerBottom: root ? root.getBoundingClientRect().bottom : null
        };
    });

    expect(afterScrollUp.hidden).toBeTruthy();
    expect(afterScrollUp.ariaHidden).toBe('true');

    await page.evaluate(async () => {
        const media = document.querySelector('[data-post-audio] audio') || document.querySelector('.post-audio-player');

        if (!media) {
            throw new Error('media element not found');
        }

        media.currentTime = 0;
        await media.play();
    });

    await delay(150);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await delay(250);

    const floatingVisibleBeforeDismiss = await page.evaluate(() => {
        const floating = document.querySelector('[data-post-audio-floating]');

        return {
            hidden: floating ? floating.hidden : null
        };
    });

    expect(floatingVisibleBeforeDismiss.hidden).toBeFalsy();

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

    await page.evaluate(() => window.scrollTo(0, 0));
    await delay(500);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await delay(1000);

    const afterDismissRescroll = await page.evaluate(() => {
        const floating = document.querySelector('[data-post-audio-floating]');

        return {
            hidden: floating ? floating.hidden : null,
            ariaHidden: floating ? floating.getAttribute('aria-hidden') : null
        };
    });

    expect(afterDismissRescroll.hidden).toBeTruthy();
    expect(afterDismissRescroll.ariaHidden).toBe('true');
});
