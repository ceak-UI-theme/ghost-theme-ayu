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
}

function finalizeAyuAsyncRuntime() {
    'use strict';

    renderPostAudioPlayers(document);
    renderPostAudioBadges(document);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapAyuTheme);
} else {
    bootstrapAyuTheme();
}

window.setTimeout(finalizeAyuAsyncRuntime, 0);
window.addEventListener('load', finalizeAyuAsyncRuntime);
