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
    renderAyuPagination();
    renderPrimaryCategories();
    renderSecondaryTags();
    renderSeriesTags();
    renderPostSeriesNavigation();
    renderSearchPage();
    renderExplorePage();
    injectPromoSlots(document);
    normalizePostTaxonomyTags(document);
    normalizeTagHeaderName(document);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootstrapAyuTheme);
} else {
    bootstrapAyuTheme();
}
