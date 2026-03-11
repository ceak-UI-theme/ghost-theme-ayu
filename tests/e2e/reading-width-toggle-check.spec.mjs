import { test, expect } from '@playwright/test';

const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:2368';

async function resolvePostTargets(page) {
  await page.goto(`${base}/`, { waitUntil: 'domcontentloaded' });

  const paths = await page.$$eval('a[href^="/"]', (anchors) => {
    const skipPrefixes = ['/tag/', '/author/', '/ghost/', '/page/', '/search/', '/series/', '/categories/', '/secondary-tags/', '/explore/'];
    const out = [];
    for (const anchor of anchors) {
      const href = anchor.getAttribute('href');
      if (!href) continue;
      if (!/^\/[a-z0-9-]+\/$/i.test(href)) continue;
      if (skipPrefixes.some((prefix) => href.startsWith(prefix))) continue;
      if (!out.includes(href)) out.push(href);
      if (out.length >= 16) break;
    }
    return out;
  });

  let withTocPath = '';
  let withoutTocPath = '';

  for (const path of paths) {
    await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' });
    const hasPostContent = await page.locator('body.post-template .post-content').count();
    if (!hasPostContent) continue;

    const headingCount = await page.locator('.post-content h2, .post-content h3').count();
    if (headingCount >= 2 && !withTocPath) withTocPath = path;
    if (headingCount < 2 && !withoutTocPath) withoutTocPath = path;
    if (withTocPath && withoutTocPath) break;
  }

  if (!withTocPath && paths.length) withTocPath = paths[0];
  if (!withoutTocPath) withoutTocPath = withTocPath;

  return {
    postWithToc: `${base}${withTocPath}`,
    postWithoutToc: `${base}${withoutTocPath}`
  };
}

async function getContentWidth(page) {
  return await page.locator('.post-content').evaluate((el) => {
    const probe = el.querySelector('p, h2, h3, ul, ol, blockquote') || el.firstElementChild || el;
    return probe.getBoundingClientRect().width;
  });
}

test('reading width toggle behavior across scenarios', async ({ page }) => {
  const consoleErrors = [];
  const pageErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('pageerror', (error) => {
    pageErrors.push(String(error));
  });

  const { postWithToc, postWithoutToc } = await resolvePostTargets(page);
  await page.goto(postWithoutToc, { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.removeItem('ayu-reading-width');
  });

  // 1) TOC 없는 글에서 토글 동작
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(postWithoutToc, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.js-reading-width-toggle')).toBeVisible();
  await page.locator('[data-width-mode="wide"]').click();
  await expect(page.locator('body')).toHaveAttribute('data-reading-width', 'wide');

  // 2) TOC 있는 긴 글 expanded 전환
  await page.goto(postWithToc, { waitUntil: 'domcontentloaded' });
  const tocExists = await page.locator('.post-toc').count();
  await page.locator('[data-width-mode="normal"]').click();
  await expect(page.locator('body')).toHaveAttribute('data-reading-width', 'normal');
  const normalWidth = await getContentWidth(page);
  await page.locator('[data-width-mode="wide"]').click();
  const wideWidth = await getContentWidth(page);
  await page.locator('[data-width-mode="expanded"]').click();
  const expandedWidth1280 = await getContentWidth(page);
  expect(wideWidth).toBeGreaterThan(normalWidth);
  expect(expandedWidth1280).toBeGreaterThan(wideWidth);

  // 3) 1280px에서 expanded
  expect(expandedWidth1280).toBeLessThanOrEqual(1200.5);

  // 4) 1024px에서 expanded + TOC 자동 접힘 확인
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.waitForTimeout(120);
  await expect(page.locator('body')).toHaveAttribute('data-reading-width', 'expanded');
  if (tocExists) {
    await expect(page.locator('.post-toc')).toBeVisible();
    await expect(page.locator('.post-toc')).toHaveClass(/is-collapsed/);
  }
  const expandedWidth1024 = await getContentWidth(page);
  expect(expandedWidth1024).toBeLessThanOrEqual(1024);

  // 5) localStorage expanded + 모바일 진입 => normal 강제 + UI 숨김
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(120);
  await expect(page.locator('body')).toHaveAttribute('data-reading-width', 'normal');
  await expect(page.locator('.js-reading-width-toggle')).toBeHidden();

  // 6) 다른 글 이동 후 설정 유지 (데스크톱 복귀 시 expanded)
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(postWithoutToc, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toHaveAttribute('data-reading-width', 'expanded');

  // 7) 코드블록/이미지/표 포함 시 overflow 없음(페이지 단위)
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth
  }));
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.innerWidth + 1);

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
