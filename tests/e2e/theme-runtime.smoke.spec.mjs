import { test, expect } from '@playwright/test';

const HUB_ROUTES = [
  { path: '/categories/', selectors: ['#primary-featured-grid', '#primary-list-grid'] },
  { path: '/series/', selectors: ['#series-featured-grid', '#series-list-grid'] },
  { path: '/secondary-tags/', selectors: ['#secondary-tags-featured', '#secondary-tags-grid'] },
  { path: '/explore/', selectors: ['#explore-categories-grid', '#explore-series-list', '#explore-topics-grid', '#explore-recent-list'] },
  { path: '/search/', selectors: ['#search-input', '#search-state', '#search-results'] },
];

async function getContentApiKey(request, baseURL) {
  const res = await request.get(baseURL + '/');
  expect(res.ok()).toBeTruthy();
  const html = await res.text();

  const explicit = html.match(/<script id="ayu-content-key"[^>]*data-key="([^"]*)"/);
  if (explicit && explicit[1]) {
    return explicit[1];
  }

  const portalOrSodo = html.match(/data-key="([a-f0-9]{20,})"/i);
  return portalOrSodo ? portalOrSodo[1] : '';
}

test.describe('Theme runtime smoke', () => {
  test('home loads with runtime script and theme toggle', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('script#ayu-content-key')).toHaveCount(1);
    await expect(page.locator('.js-theme-toggle').first()).toBeVisible();
  });

  for (const route of HUB_ROUTES) {
    test(`${route.path} mounts expected containers`, async ({ page }) => {
      await page.goto(route.path);
      for (const selector of route.selectors) {
        await expect(page.locator(selector)).toHaveCount(1);
      }
    });
  }

  test('search enforces min 2 characters and updates state', async ({ page }) => {
    await page.goto('/search/');

    const input = page.locator('#search-input');
    const state = page.locator('#search-state');

    await expect(input).toBeVisible();
    await expect(state).toContainText('2+ characters');

    await input.fill('a');
    await input.press('Enter');
    await expect(state).toContainText('Enter at least 2 characters.');

    await input.fill('ai');
    await input.press('Enter');

    await expect
      .poll(async () => {
        return (await state.textContent())?.trim() || '';
      }, { timeout: 20_000 })
      .toMatch(/results found|No posts found|Search is currently unavailable/i);
  });

  test('series post renders navigation container with explicit data attributes', async ({ page, request, baseURL }) => {
    const resolvedBaseUrl = typeof baseURL === 'string' ? baseURL : 'http://172.22.0.199:2368';
    const key = await getContentApiKey(request, resolvedBaseUrl);
    expect(key).not.toBe('');

    const tagsRes = await request.get(`${resolvedBaseUrl}/ghost/api/content/tags/?key=${encodeURIComponent(key)}&include=count.posts&limit=all`);
    expect(tagsRes.ok()).toBeTruthy();
    const tagsJson = await tagsRes.json();

    const seriesTag = (tagsJson.tags || []).find((tag) => typeof tag.slug === 'string' && tag.slug.startsWith('series-'));
    test.skip(!seriesTag, 'No series-* tag available for runtime series nav test');

    const postsRes = await request.get(`${resolvedBaseUrl}/ghost/api/content/posts/?key=${encodeURIComponent(key)}&filter=tag:${encodeURIComponent(seriesTag.slug)}&fields=slug,url,title&limit=1`);
    expect(postsRes.ok()).toBeTruthy();
    const postsJson = await postsRes.json();

    const post = (postsJson.posts || [])[0];
    test.skip(!post || !post.url, 'No post found for selected series tag');

    const postUrl = new URL(post.url).pathname;
    await page.goto(postUrl);

    const nav = page.locator('#post-series-nav');
    await expect(nav).toHaveCount(1);
    await expect(nav).toHaveAttribute('data-series-slugs', /series-/i);
    await expect(nav).toHaveAttribute('data-post-slug', /.+/);

    await expect
      .poll(async () => (await nav.getAttribute('data-series-nav-state')) || '', { timeout: 20_000 })
      .toMatch(/ready|multiple-series-tags-first-used|empty-series-posts|fetch-failed|missing-content-key/);
  });
});
