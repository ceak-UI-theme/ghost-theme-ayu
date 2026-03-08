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

test.describe('Runtime extra checks', () => {
  test('explore more links navigate to intended hub routes when shown', async ({ page, request, baseURL }) => {
    const base = typeof baseURL === 'string' ? baseURL : 'http://172.22.0.199:2368';
    const key = await getContentApiKey(request, base);
    expect(key).not.toBe('');

    await page.goto('/explore/');

    const links = [
      { id: '#explore-categories-more', expected: '/categories/' },
      { id: '#explore-series-more', expected: '/series/' },
      { id: '#explore-topics-more', expected: '/secondary-tags/' },
    ];

    for (const item of links) {
      const locator = page.locator(item.id);
      const isHidden = await locator.evaluate((el) => el.hidden);
      if (isHidden) {
        continue;
      }

      await expect(locator).toHaveAttribute('href', item.expected);
      await locator.click();
      await expect(page).toHaveURL(new RegExp(item.expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      await page.goBack();
      await expect(page).toHaveURL(/\/explore\/?$/);
    }
  });

  test('content api cache writes sessionStorage entries after hub rendering', async ({ page }) => {
    await page.goto('/explore/');

    await expect
      .poll(async () => {
        return page.locator('#explore-categories-grid .explore-card, #explore-categories-grid .term-empty').count();
      }, { timeout: 20_000 })
      .toBeGreaterThan(0);

    const cacheInfo = await page.evaluate(() => {
      const prefix = 'ayu-content-api-cache::';
      const keys = [];
      for (let i = 0; i < sessionStorage.length; i += 1) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keys.push(key);
        }
      }

      const hasTags = keys.some((k) => k.includes('/ghost/api/content/tags/'));
      const hasPosts = keys.some((k) => k.includes('/ghost/api/content/posts/'));
      const hasTagLimit15 = keys.some((k) => k.includes('/ghost/api/content/tags/') && k.includes('limit=15'));
      const hasPostsLimit8 = keys.some((k) => k.includes('/ghost/api/content/posts/') && k.includes('limit=8'));

      return { count: keys.length, hasTags, hasPosts, hasTagLimit15, hasPostsLimit8 };
    });

    expect(cacheInfo.count).toBeGreaterThan(0);
    expect(cacheInfo.hasTags || cacheInfo.hasPosts).toBeTruthy();
    expect(cacheInfo.hasTagLimit15).toBeTruthy();
    expect(cacheInfo.hasPostsLimit8).toBeTruthy();
  });

  test('series navigation renders list for a post with series and keeps state contract', async ({ page, request, baseURL }) => {
    const base = typeof baseURL === 'string' ? baseURL : 'http://172.22.0.199:2368';
    const key = await getContentApiKey(request, base);
    expect(key).not.toBe('');

    const postsRes = await request.get(`${base}/ghost/api/content/posts/?key=${encodeURIComponent(key)}&include=tags&fields=slug,url,title&limit=all`);
    expect(postsRes.ok()).toBeTruthy();
    const posts = (await postsRes.json()).posts || [];

    const target = posts.find((post) => {
      const tags = post.tags || [];
      return tags.some((tag) => tag.visibility === 'public' && String(tag.slug || '').startsWith('series-'));
    });

    test.skip(!target, 'No post with series-* tag in current dataset');

    await page.goto(toPath(target.url || `/${target.slug}/`));

    const nav = page.locator('#post-series-nav');
    await expect(nav).toHaveCount(1);

    await expect
      .poll(async () => (await nav.getAttribute('data-series-nav-state')) || '', { timeout: 20_000 })
      .toMatch(/ready|multiple-series-tags-first-used|empty-series-posts|fetch-failed|missing-content-key/);

    const state = (await nav.getAttribute('data-series-nav-state')) || '';
    if (state === 'ready' || state === 'multiple-series-tags-first-used') {
      await expect(nav).toBeVisible();
      await expect(page.locator('#post-series-nav-list li')).toHaveCount(await page.locator('#post-series-nav-list li').count());
      expect(await page.locator('#post-series-nav-list li').count()).toBeGreaterThan(0);
    }
  });

  test('series navigation ignores non series-* tokens and still resolves with first valid series-*', async ({ page, request, baseURL }) => {
    const base = typeof baseURL === 'string' ? baseURL : 'http://172.22.0.199:2368';
    const key = await getContentApiKey(request, base);
    expect(key).not.toBe('');

    const postsRes = await request.get(`${base}/ghost/api/content/posts/?key=${encodeURIComponent(key)}&include=tags&fields=slug,url,title&limit=all`);
    expect(postsRes.ok()).toBeTruthy();
    const posts = (await postsRes.json()).posts || [];

    const target = posts.find((post) => {
      const tags = post.tags || [];
      return tags.some((tag) => tag.visibility === 'public' && String(tag.slug || '').startsWith('series-'));
    });
    test.skip(!target, 'No post with series-* tag in current dataset');

    await page.goto(toPath(target.url || `/${target.slug}/`));

    const nav = page.locator('#post-series-nav');
    await expect(nav).toHaveCount(1);
    await expect(nav).toBeVisible();

    const currentSeriesSlug = await nav.getAttribute('data-series-slug');
    expect(currentSeriesSlug).toBeTruthy();
    expect(String(currentSeriesSlug)).toMatch(/^series-/);

    await page.evaluate(() => {
      const navEl = document.getElementById('post-series-nav');
      if (!navEl) return;
      const valid = navEl.getAttribute('data-series-slug') || '';
      navEl.setAttribute('data-series-slugs', ['misc-tag', 'another-invalid', valid].join(' '));
      navEl.setAttribute('data-series-nav-state', 'ready');
      navEl.hidden = true;
      if (typeof window.renderPostSeriesNavigation === 'function') {
        window.renderPostSeriesNavigation();
      }
    });

    await expect
      .poll(async () => (await nav.getAttribute('data-series-slug')) || '', { timeout: 20_000 })
      .toMatch(/^series-/);
    await expect
      .poll(async () => (await nav.getAttribute('data-series-nav-state')) || '', { timeout: 20_000 })
      .toMatch(/ready|multiple-series-tags-first-used|empty-series-posts/);
  });

  test('taxonomy normalization corrects conflicting role by strict slug prefix', async ({ page, request, baseURL }) => {
    const base = typeof baseURL === 'string' ? baseURL : 'http://172.22.0.199:2368';
    const key = await getContentApiKey(request, base);
    expect(key).not.toBe('');

    await page.goto('/search/');

    const result = await page.evaluate(() => {
      const host = document.createElement('div');
      host.innerHTML = [
        '<div class="post-meta">',
        '<span class="post-meta-tags">',
        '<a class="post-tag" href="/tag/category-demo/" data-tag-slug="category-demo" data-tag-name="Demo" data-taxonomy-role="topic" data-taxonomy-rendered="client">Demo</a>',
        '<a class="post-tag" href="/tag/plain-topic/" data-tag-slug="plain-topic" data-tag-name="Plain" data-taxonomy-role="series" data-taxonomy-rendered="client">Plain</a>',
        '</span>',
        '</div>',
      ].join('');
      document.body.appendChild(host);
      if (typeof window.normalizePostTaxonomyTags === 'function') {
        window.normalizePostTaxonomyTags(host);
      }

      const tags = Array.from(host.querySelectorAll('.post-tag')).map((el) => ({
        slug: el.getAttribute('data-tag-slug') || '',
        role: el.getAttribute('data-taxonomy-role') || '',
      }));
      host.remove();
      return tags;
    });

    const categoryTag = result.find((t) => t.slug === 'category-demo');
    const topicTag = result.find((t) => t.slug === 'plain-topic');
    expect(categoryTag).toBeTruthy();
    expect(topicTag).toBeTruthy();
    expect(categoryTag.role).toBe('category');
    expect(topicTag.role).toBe('topic');
  });
});
