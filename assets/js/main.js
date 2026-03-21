function bootstrapAyuTheme() {
    'use strict';

    if (AYU_RUNTIME_FLAGS.bootstrapped) {
        return;
    }
    AYU_RUNTIME_FLAGS.bootstrapped = true;

    cover();
    themeToggle();
    syncStickyHeaderOffset();
    postReadingProgress();
    readingWidthToggle();
    highlightPostCodeBlocks(document);
    enhancePostCodeBlocks(document);
    renderAyuPagination();
    renderPrimaryCategories();
    renderSecondaryTags();
    renderSeriesTags();
    renderPostSeriesNavigation();
    renderSearchPage();
    renderExplorePage();
    injectPromoSlots(document);
    injectPostMidAd(document);
    renderAdSlots(document);
    normalizePostTaxonomyTags(document);
    normalizeTagHeaderName(document);
    renderPostAudioPlayers(document);
    renderPostAudioBadges(document);
    renderPostLanguageSwitch(document);
}

function finalizeAyuAsyncRuntime() {
    'use strict';

    renderPostAudioPlayers(document);
    renderPostAudioBadges(document);
}

function renderPostLanguageSwitch(root) {
    'use strict';

    var container = root.querySelector('[data-post-language-switch]');

    if (!container) {
        return;
    }

    container.textContent = '';

    var slug = container.dataset.currentSlug;
    var linkedBlogUrl = container.dataset.linkedBlogUrl;
    var linkedBlogLocale = container.dataset.linkedBlogLocale;
    var linkedBlogContentApiKey = container.dataset.linkedBlogContentApiKey;

    if (!slug || !linkedBlogUrl || !linkedBlogLocale || !linkedBlogContentApiKey) {
        return;
    }

    var normalizedBaseUrl = linkedBlogUrl.replace(/\/+$/, '');
    var apiUrl = normalizedBaseUrl + '/ghost/api/content/posts/slug/' + encodeURIComponent(slug) + '/?key=' + encodeURIComponent(linkedBlogContentApiKey);
    var abortController = new AbortController();
    var timeoutId = window.setTimeout(function () {
        abortController.abort();
    }, 3000);

    fetch(apiUrl, {
        signal: abortController.signal
    })
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Request failed');
            }

            return response.json();
        })
        .then(function (data) {
            if (!data || !Array.isArray(data.posts) || data.posts.length === 0) {
                return;
            }

            var anchor = document.createElement('a');
            var badge = document.createElement('span');
            var text = document.createElement('span');

            anchor.href = normalizedBaseUrl + '/' + slug + '/';
            anchor.className = 'post-language-switch-link';

            badge.className = 'post-language-switch-badge';
            text.className = 'post-language-switch-text';

            if (linkedBlogLocale === 'ko') {
                badge.textContent = 'KO';
                text.textContent = '한국어로 읽기';
                anchor.setAttribute('aria-label', '이 글을 한국어로 읽기');
            } else {
                badge.textContent = 'EN';
                text.textContent = 'Read in English';
                anchor.setAttribute('aria-label', 'Read this post in English');
            }

            anchor.appendChild(badge);
            anchor.appendChild(text);
            container.appendChild(anchor);
        })
        .finally(function () {
            window.clearTimeout(timeoutId);
        })
        .catch(function () {});
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapAyuTheme);
} else {
    bootstrapAyuTheme();
}

window.setTimeout(finalizeAyuAsyncRuntime, 0);
window.addEventListener('load', finalizeAyuAsyncRuntime);
