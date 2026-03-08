import { test, expect } from '@playwright/test';

function toPath(value) {
  if (!value) return '';
  try {
    return new URL(value).pathname;
  } catch {
    return String(value);
  }
}

async function getContentApiKey(request, baseURL) {
  const res = await request.get(baseURL + '/');
  expect(res.ok()).toBeTruthy();
  const html = await res.text();

  const explicit = html.match(/<script id="ayu-content-key"[^>]*data-key="([^"]*)"/i);
  if (explicit && explicit[1]) return explicit[1];

  const runtime = html.match(/data-key="([a-f0-9]{20,})"/i);
  return runtime ? runtime[1] : '';
}

test.describe('UI round checks', () => {
  test('/explore summary hub limits each section to max 10 and toggles More links', async ({ page, request, baseURL }) => {
    const base = typeof baseURL === 'string' ? baseURL : 'http://172.22.0.199:2368';
    const key = await getContentApiKey(request, base);
    expect(key).not.toBe('');

    const tagsRes = await request.get(`${base}/ghost/api/content/tags/?key=${encodeURIComponent(key)}&include=count.posts&limit=all`);
    expect(tagsRes.ok()).toBeTruthy();
    const tagsJson = await tagsRes.json();
    const tags = tagsJson.tags || [];

    const categoriesTotal = tags.filter((t) => t.visibility === 'public' && String(t.slug || '').startsWith('category-') && (t.count?.posts || 0) > 0).length;
    const seriesTotal = tags.filter((t) => t.visibility === 'public' && String(t.slug || '').startsWith('series-') && (t.count?.posts || 0) > 0).length;
    const topicsTotal = tags.filter((t) => t.visibility === 'public' && !String(t.slug || '').startsWith('category-') && !String(t.slug || '').startsWith('series-') && (t.count?.posts || 0) > 0).length;

    await page.goto('/explore/');

    const categoryCards = page.locator('#explore-categories-grid .explore-card-category');
    const seriesCards = page.locator('#explore-series-list .explore-card-series');
    const topicCards = page.locator('#explore-topics-grid .explore-topic-card');

    await expect(categoryCards).toHaveCount(Math.min(categoriesTotal, 10));
    await expect(seriesCards).toHaveCount(Math.min(seriesTotal, 10));
    await expect(topicCards).toHaveCount(Math.min(topicsTotal, 10));

    const categoriesMore = page.locator('#explore-categories-more');
    const seriesMore = page.locator('#explore-series-more');
    const topicsMore = page.locator('#explore-topics-more');

    if (categoriesTotal > 10) {
      await expect(categoriesMore).not.toHaveAttribute('hidden', '');
      await expect(categoriesMore).toHaveAttribute('href', '/categories/');
    } else {
      await expect(categoriesMore).toHaveAttribute('hidden', '');
    }

    if (seriesTotal > 10) {
      await expect(seriesMore).not.toHaveAttribute('hidden', '');
      await expect(seriesMore).toHaveAttribute('href', '/series/');
    } else {
      await expect(seriesMore).toHaveAttribute('hidden', '');
    }

    if (topicsTotal > 10) {
      await expect(topicsMore).not.toHaveAttribute('hidden', '');
      await expect(topicsMore).toHaveAttribute('href', '/secondary-tags/');
    } else {
      await expect(topicsMore).toHaveAttribute('hidden', '');
    }
  });

  test('multi-series tags keep first active and mark the rest inactive', async ({ page, request, baseURL }) => {
    const base = typeof baseURL === 'string' ? baseURL : 'http://172.22.0.199:2368';
    const key = await getContentApiKey(request, base);
    expect(key).not.toBe('');

    const postsRes = await request.get(`${base}/ghost/api/content/posts/?key=${encodeURIComponent(key)}&include=tags&limit=all`);
    expect(postsRes.ok()).toBeTruthy();
    const postsJson = await postsRes.json();
    const posts = postsJson.posts || [];

    const target = posts.find((post) => {
      const tags = post.tags || [];
      const seriesTags = tags.filter((tag) => tag.visibility === 'public' && String(tag.slug || '').startsWith('series-'));
      return seriesTags.length > 1;
    });

    test.skip(!target, 'No post with multiple series-* tags in current dataset');

    await page.goto(toPath(target.url || `/${target.slug}/`));

    const seriesTags = page.locator('.post-meta .post-tag[data-taxonomy-role="series"]');
    const count = await seriesTags.count();
    expect(count).toBeGreaterThan(1);

    await expect(seriesTags.first()).not.toHaveClass(/is-inactive-series-tag/);
    await expect(seriesTags.first()).not.toHaveAttribute('aria-disabled', 'true');

    for (let i = 1; i < count; i += 1) {
      const tag = seriesTags.nth(i);
      await expect(tag).toHaveClass(/is-inactive-series-tag/);
      await expect(tag).toHaveAttribute('aria-disabled', 'true');
      await expect(tag).toHaveAttribute('tabindex', '-1');
    }
  });

  test('player/audio UI hooks are removed from home and post pages', async ({ page, request, baseURL }) => {
    const base = typeof baseURL === 'string' ? baseURL : 'http://172.22.0.199:2368';
    const key = await getContentApiKey(request, base);
    expect(key).not.toBe('');

    await page.goto('/');
    await expect(page.locator('.player')).toHaveCount(0);
    await expect(page.locator('.post-play, .js-play')).toHaveCount(0);

    const postsRes = await request.get(`${base}/ghost/api/content/posts/?key=${encodeURIComponent(key)}&limit=1&fields=slug,url`);
    expect(postsRes.ok()).toBeTruthy();
    const post = (await postsRes.json()).posts?.[0];
    expect(post).toBeTruthy();

    await page.goto(toPath(post.url || `/${post.slug}/`));
    await expect(page.locator('.player')).toHaveCount(0);
    await expect(page.locator('.post-play, .js-play')).toHaveCount(0);
    await expect(page.locator('.post-header .post-meta')).toHaveCount(1);
  });
});
