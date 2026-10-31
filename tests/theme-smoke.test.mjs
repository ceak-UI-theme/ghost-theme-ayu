import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import vm from 'node:vm';
import {test} from 'node:test';

const require = createRequire(import.meta.url);
const {H, render} = require('./hub-fixture.cjs');
const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const routes = read('routes.yaml');
const hubs = [
    ['categories', 'hub-category-pages', "slug:~^'category-'", '카테고리', 'Categories'],
    ['series', 'hub-series-pages', "slug:~^'series-'", '시리즈', 'Series'],
    ['secondary-tags', 'hub-topic-pages', "slug:-~^'category-'+slug:-~^'series-'", '주제 태그', 'Topics'],
    ['explore', 'hub-explore-card', 'visibility:public', '탐색', 'Explore']
];

// Keep the old tag-detail intent, using the current collection pagination and
// featured/fallback branches rather than the retired fixed three-post query.
test('tag detail keeps featured, latest, fallback and pagination', () => {
    const source = read('tag.hbs');
    H.parse(source);
    assert.match(source, /Featured post/);
    assert.match(source, /Latest posts/);
    assert.match(source, /filter="tag:\{\{tag\.slug\}\}\+featured:true"/);
    assert.match(source, /include="tags,authors" limit="1"/);
    assert.match(source, /#if pagination\.prev/);
    assert.match(source, /#unless featured/);
    assert.match(source, /#foreach \.\.\/posts from="2"/);
    assert.match(source, /> "ayu-pagination" pagination=pagination/);
    assert.match(source, /js-promo-feed/);
});

test('legacy archive/ad styles and current shared promo placement remain', () => {
    const css = read('assets/css/site/term.css');
    for (const name of ['category-featured', 'category-post-list', 'category-ad-inline', 'category-ad-inline-text', 'hub-more-tags']) {
        assert(css.includes('.' + name), name);
    }
    const source = read('assets/js/lib/dom-utils.js');
    assert.match(source, /PROMO_INSERT_EVERY:\s*5/);
    assert.match(source, /visibleIndex % AYU_GLOBALS\.PROMO_INSERT_EVERY/);
    assert.match(read('assets/js/main.js'), /injectPromoSlots\(document\)/);
});

for (const [name, partial, filter, ko, en] of hubs) {
    test(`${name}: current route, blocks, taxonomy and partial graph`, () => {
        const source = read('page-' + name + '.hbs');
        H.parse(source);
        assert.match(routes, new RegExp('/' + name + '/:\\s+template: page-' + name));
        assert.match(source, /\{\{!< default\}\}/);
        assert.match(source, /#contentFor "hub-title"/);
        assert.match(source, /#contentFor "hub-meta"/);
        assert.match(source, /@custom\.site_locale "ko"/);
        assert.match(source, /data-hub-locale=/);
        assert(source.includes(filter));
        assert(source.includes('"' + partial + '"'));
        const seo = [...source.matchAll(/> "hub-seo" title="([^"]+)" description="([^"]+)" path="([^"]+)"/g)];
        assert.equal(seo.length, 2);
        assert.equal(seo[0][1], ko);
        assert.equal(seo[1][1], en);
        assert.notEqual(seo[0][2], seo[1][2]);
        assert(seo.every(x => x[3] === '/' + name + '/'));
        assert.doesNotMatch(source, /rel="canonical"/);
        const archive = read('partials/' + partial + '.hbs');
        H.parse(archive);
        if (name !== 'explore') {
            assert.match(archive, /#get "tags"/);
            assert.match(archive, /limit="100" page=page/);
            assert.match(archive, /pagination\.next/);
            assert(archive.includes('> "' + partial + '"'));
            assert.match(archive, /<details/);
        } else {
            assert.match(source, /#get "posts"/);
            for (const kind of ['category', 'series', 'topic']) assert(source.includes('kind="' + kind + '"'));
        }
    });

    test(`${name}: compiled SSR exposes real public links in ko/en`, () => {
        for (const locale of ['ko', 'en']) {
            const html = render(name, locale);
            const links = [...html.matchAll(/href="(\/tag\/[^"#]+\/)"/g)].map(x => x[1]);
            assert(links.length > 0);
            assert(links.every(x => !/zero|internal|javascript:/.test(x)));
            assert(html.includes(locale === 'ko' ? ko : en));
            assert.doesNotMatch(html, /<script\b|term-skeleton-grid|term-loading/);
        }
    });
}

for (const [name] of hubs) {
    test(`${name}: enhancement uses validated data and preserves SSR on failure`, () => {
        const source = read('assets/js/lib/' + name + '-page.js');
        new vm.Script(source);
        assert.match(source, /fetchAyuContentApiCollection\(/);
        assert.match(source, /\.then\(function/);
        assert.doesNotMatch(source, /buildSkeletonCards\(|buildLoadingStateHtml\(/);
        const catchBody = source.match(/\.catch\(function \(error\) \{([\s\S]*)\}\);/);
        assert(catchBody);
        assert.doesNotMatch(catchBody[1], /innerHTML\s*=|replaceChildren\(|\.remove\(/);
        assert.match(catchBody[1], /logAyuWarning|console\.error/);
    });
}

test('hub SEO keeps Ghost canonical/schema while replacing social metadata', () => {
    const layout = read('default.hbs'), seo = read('partials/hub-seo.hbs');
    H.parse(layout);
    H.parse(seo);
    assert.match(layout, /ghost_head exclude="social_data"/);
    assert.doesNotMatch(layout, /ghost_head exclude="[^"]*(?:schema|metadata)/);
    assert.match(layout, /block "hub-title"/);
    assert.match(layout, /block "hub-meta"/);
    assert.match(seo, /#unless meta_description/);
    assert.match(seo, /property="og:url" content="\{\{@site\.url\}\}\{\{path\}\}"/);
    assert.match(seo, /property="og:title"/);
    assert.doesNotMatch(seo, /rel="canonical"|hreflang/);
});

test('shared Content API contract retains completeness proof and collection caps', () => {
    const source = read('assets/js/lib/content-api.js');
    new vm.Script(source);
    for (const name of ['validateAyuContentApiPage', 'validateAyuPostTagReferences', 'verifyAyuPublicTagCoverage', 'fetchAyuContentApiCollection']) {
        assert.equal([...source.matchAll(new RegExp('function ' + name + '\\(', 'g'))].length, 1, name);
    }
    assert.match(source, /result\.length !== p\.total/);
    assert.match(source, /return verifyAyuPublicTagCoverage\(/);
    assert.match(source, /memoryOnly: true/);
    assert.match(source, /100000/);
    assert.match(source, /1000/);
});

test('search and paginated hubs initialize query restoration and user history', () => {
    const source = read('assets/js/lib/search-page.js');
    new vm.Script(source);
    assert.match(read('page-search.hbs'), /id="search-input"/);
    assert.match(routes, /\/search\/:\s+template: page-search/);
    assert.match(source, /fetchAyuContentApiCollection\(apiUrl, 'posts'/);
    assert.match(source, /version !== searchVersion/);
    assert.match(source, /restoreSearch\(\);/);
    for (const name of ['categories', 'series', 'search']) {
        const code = read('assets/js/lib/' + name + '-page.js');
        assert.match(code, /'pushState' : 'replaceState'/);
        assert.match(code, /addEventListener\('popstate'/);
    }
});

test('theme bootstrap still initializes every hub and search', () => {
    const source = read('assets/js/main.js');
    new vm.Script(source);
    for (const name of ['renderPrimaryCategories', 'renderSeriesTags', 'renderSecondaryTags', 'renderExplorePage', 'renderSearchPage']) {
        assert.match(source, new RegExp(name + '\\(\\);'));
    }
    assert.match(source, /DOMContentLoaded.*bootstrapAyuTheme/);
});
