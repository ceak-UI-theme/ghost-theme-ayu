import { test, expect } from '@playwright/test';

const VALID_ROLES = ['category', 'series', 'topic'];
const ROLE_CLASS_CONTRACT = {
  category: ['is-primary-tag', 'tag-category'],
  series: ['is-series-tag', 'tag-series'],
  topic: ['is-secondary-tag', 'tag-topic'],
};

function toPath(value) {
  if (!value) {
    return '';
  }

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
  if (explicit && explicit[1]) {
    return explicit[1];
  }

  const runtime = html.match(/data-key="([a-f0-9]{20,})"/i);
  return runtime ? runtime[1] : '';
}

async function fetchPostsWithTags(request, baseURL, key) {
  const url = `${baseURL}/ghost/api/content/posts/?key=${encodeURIComponent(key)}&include=tags&fields=id,title,slug,url,published_at,excerpt,custom_excerpt&limit=all`;
  const res = await request.get(url);
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  return data.posts || [];
}

async function fetchTags(request, baseURL, key) {
  const url = `${baseURL}/ghost/api/content/tags/?key=${encodeURIComponent(key)}&include=count.posts&limit=all`;
  const res = await request.get(url);
  expect(res.ok()).toBeTruthy();
  const data = await res.json();
  return data.tags || [];
}

async function readTagContracts(page, selector) {
  return page.locator(selector).evaluateAll((els) => {
    return els.map((el) => ({
      text: (el.textContent || '').trim(),
      href: el.getAttribute('href') || '',
      role: (el.getAttribute('data-taxonomy-role') || '').trim(),
      rendered: (el.getAttribute('data-taxonomy-rendered') || '').trim(),
      classes: Array.from(el.classList),
    }));
  });
}

function assertTagContract(items, expectedRendered) {
  expect(items.length).toBeGreaterThan(0);

  for (const item of items) {
    expect(VALID_ROLES).toContain(item.role);
    expect(item.rendered).toBe(expectedRendered);
    expect(item.href.length).toBeGreaterThan(0);
    expect(item.text.length).toBeGreaterThan(0);

    const requiredClasses = ROLE_CLASS_CONTRACT[item.role] || [];
    for (const className of requiredClasses) {
      expect(item.classes).toContain(className);
    }
  }
}

test.describe('Taxonomy contract', () => {
  test('post page server-rendered tags keep taxonomy contract and stay stable after JS init', async ({ page, request, baseURL }) => {
    const resolvedBase = typeof baseURL === 'string' ? baseURL : 'http://172.22.0.199:2368';
    const key = await getContentApiKey(request, resolvedBase);
    expect(key).not.toBe('');

    const posts = await fetchPostsWithTags(request, resolvedBase, key);
    const targetPost = posts.find((post) => Array.isArray(post.tags) && post.tags.some((tag) => tag && tag.visibility === 'public'));
    expect(targetPost).toBeTruthy();

    const path = toPath(targetPost.url || `/${targetPost.slug}/`);
    await page.goto(path);

    const selector = '.post-meta .post-tag';
    await expect(page.locator(selector).first()).toBeVisible();

    const before = await readTagContracts(page, selector);
    assertTagContract(before, 'server');

    await page.waitForTimeout(800);

    const after = await readTagContracts(page, selector);
    assertTagContract(after, 'server');
    expect(after).toEqual(before);
  });

  test('search page client-rendered tags expose taxonomy role/rendered contracts', async ({ page, request, baseURL }) => {
    const resolvedBase = typeof baseURL === 'string' ? baseURL : 'http://172.22.0.199:2368';
    const key = await getContentApiKey(request, resolvedBase);
    expect(key).not.toBe('');

    const posts = await fetchPostsWithTags(request, resolvedBase, key);
    const targetPost = posts.find((post) => {
      const title = String(post.title || '').trim();
      return title.length >= 2 && Array.isArray(post.tags) && post.tags.some((tag) => tag && tag.visibility === 'public');
    });
    expect(targetPost).toBeTruthy();

    const query = String(targetPost.title || '').trim();
    const targetPath = toPath(targetPost.url || `/${targetPost.slug}/`);

    await page.goto('/search/');
    await page.fill('#search-input', query);
    await page.press('#search-input', 'Enter');

    await expect
      .poll(async () => {
        return page.locator('.post .post-title-link').count();
      }, { timeout: 20_000 })
      .toBeGreaterThan(0);

    await expect
      .poll(async () => {
        return page.evaluate((pathNeedle) => {
          return Array.from(document.querySelectorAll('.post .post-title-link')).some((el) => {
            const href = el.getAttribute('href') || '';
            return href.includes(pathNeedle);
          });
        }, targetPath);
      }, { timeout: 20_000 })
      .toBeTruthy();

    const contracts = await page.evaluate((pathNeedle) => {
      const cards = Array.from(document.querySelectorAll('.post'));
      const card = cards.find((el) => {
        const link = el.querySelector('.post-title-link');
        const href = link ? (link.getAttribute('href') || '') : '';
        return href.includes(pathNeedle);
      });

      if (!card) {
        return [];
      }

      return Array.from(card.querySelectorAll('.post-meta .post-tag')).map((el) => ({
        text: (el.textContent || '').trim(),
        href: el.getAttribute('href') || '',
        role: (el.getAttribute('data-taxonomy-role') || '').trim(),
        rendered: (el.getAttribute('data-taxonomy-rendered') || '').trim(),
        classes: Array.from(el.classList),
      }));
    }, targetPath);

    assertTagContract(contracts, 'client');
  });

  test('JS-disabled post page still keeps server taxonomy meaning in DOM', async ({ browser, request, baseURL }) => {
    const resolvedBase = typeof baseURL === 'string' ? baseURL : 'http://172.22.0.199:2368';
    const key = await getContentApiKey(request, resolvedBase);
    expect(key).not.toBe('');

    const posts = await fetchPostsWithTags(request, resolvedBase, key);
    const targetPost = posts.find((post) => Array.isArray(post.tags) && post.tags.some((tag) => tag && tag.visibility === 'public'));
    expect(targetPost).toBeTruthy();

    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    try {
      await page.goto(resolvedBase + toPath(targetPost.url || `/${targetPost.slug}/`));
      await expect(page.locator('.post-meta .post-tag').first()).toBeVisible();
      const tags = await readTagContracts(page, '.post-meta .post-tag');
      assertTagContract(tags, 'server');
    } finally {
      await context.close();
    }
  });

  test('tag header normalization keeps category/series prefix from leaking into user-facing heading', async ({ browser, page, request, baseURL }) => {
    const resolvedBase = typeof baseURL === 'string' ? baseURL : 'http://172.22.0.199:2368';
    const key = await getContentApiKey(request, resolvedBase);
    expect(key).not.toBe('');

    const tags = await fetchTags(request, resolvedBase, key);
    const prefixedTag = tags.find((tag) => {
      const slug = String(tag.slug || '');
      const hasPosts = tag.count && typeof tag.count.posts === 'number' ? tag.count.posts > 0 : true;
      return hasPosts && (slug.startsWith('category-') || slug.startsWith('series-'));
    });
    expect(prefixedTag).toBeTruthy();

    const tagPath = `/tag/${encodeURIComponent(prefixedTag.slug)}/`;

    const noJsContext = await browser.newContext({ javaScriptEnabled: false });
    const noJsPage = await noJsContext.newPage();
    let noJsHeading = '';

    try {
      await noJsPage.goto(resolvedBase + tagPath);
      noJsHeading = ((await noJsPage.locator('.term-name').first().textContent()) || '').trim();
    } finally {
      await noJsContext.close();
    }

    await page.goto(tagPath);
    const jsHeading = ((await page.locator('.term-name').first().textContent()) || '').trim();

    expect(jsHeading.length).toBeGreaterThan(0);

    const lower = jsHeading.toLowerCase();
    const startsWithPrefix = lower.startsWith('category-') || lower.startsWith('series-');
    if (noJsHeading.toLowerCase().startsWith('category-') || noJsHeading.toLowerCase().startsWith('series-')) {
      expect(startsWithPrefix).toBeFalsy();
    }
  });
});
