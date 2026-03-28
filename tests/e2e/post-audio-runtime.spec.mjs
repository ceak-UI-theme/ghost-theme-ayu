import { test, expect } from '@playwright/test';

test.describe('Post audio runtime', () => {
  test('keeps audio player on posts without list badges', async ({ page }) => {
    await page.goto('/');

    const withAudioBadge = page.locator('article[data-slug="gaebal6"] [data-post-audio-badge]');
    const withoutAudioBadge = page.locator('article[data-slug="gaebal5"] [data-post-audio-badge]');

    await expect(withAudioBadge).toHaveCount(0);
    await expect(withoutAudioBadge).toHaveCount(0);

    await page.goto('/gaebal6/');

    const audioRoot = page.locator('[data-post-audio][data-slug="gaebal6"]');
    const player = audioRoot.locator('audio.post-audio-player');
    const source = player.locator('source[type="audio/mpeg"]');
    const track = player.locator('track[kind="subtitles"]');

    await expect(audioRoot).toBeVisible();
    await expect(player).toHaveCount(1);
    await expect(source).toHaveAttribute('src', '/content/media/audio/gaebal6.mp3');
    await expect(track).toHaveAttribute('src', '/content/media/audio/gaebal6.vtt');

    await page.goto('/gaebal5/');

    const noAudioRoot = page.locator('[data-post-audio][data-slug="gaebal5"]');
    await expect(noAudioRoot).toBeHidden();
    await expect(noAudioRoot.locator('audio')).toHaveCount(0);
  });
});
