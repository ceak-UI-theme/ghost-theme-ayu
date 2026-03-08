function renderSeriesTags() {
    'use strict';

    var isSeriesPage = /^\/series\/?$/.test(window.location.pathname);
    if (!isSeriesPage) {
        return;
    }

    var featuredGrid = document.getElementById('series-featured-grid');
    var listGrid = document.getElementById('series-list-grid');

    if (!featuredGrid || !listGrid) {
        return;
    }

    var contentKey = typeof getAyuContentApiKey === 'function' ? getAyuContentApiKey() : '';

    featuredGrid.innerHTML = buildLoadingStateHtml();
    listGrid.innerHTML = buildSkeletonCards(2);

    if (!contentKey) {
        if (typeof logAyuWarning === 'function') {
            logAyuWarning('Content hub load failed: missing Content API key (series)');
        } else {
            console.warn('[Ayu Theme] Content hub load failed: missing Content API key (series)');
        }
        featuredGrid.innerHTML = '<div class="term-empty">Content could not be loaded. Please try again later.</div>';
        listGrid.innerHTML = '';
        return;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/\'/g, '&#39;');
    }

    function displayName(name, slug) {
        return AYU_TAG_UTILS.getDisplayName({ name: name, slug: slug }, slug);
    }

    function seriesCardHtml(tagInfo) {
        var title = displayName(tagInfo.name, tagInfo.slug);
        var desc = tagInfo.description ? escapeHtml(tagInfo.description) : 'Series archive';
        var detailUrl = '/tag/' + encodeURIComponent(tagInfo.slug) + '/';

        var defaults = (typeof AYU_DEFAULT_IMAGES !== 'undefined' && AYU_DEFAULT_IMAGES) ? AYU_DEFAULT_IMAGES : {};
        var cardImage = tagInfo.feature_image || defaults.SERIES_TAG || '/assets/images/fallback/series-tag-default.png';

        return [
            '<article class="post category-post">',
            '<div class="post-media">',
            '<div class="u-placeholder square">',
            '<a href="',
            detailUrl,
            '">',
            '<img class="post-image lazyload u-object-fit" src="' + escapeHtml(cardImage) + '" alt="' + escapeHtml(title) + '">',
            '</a>',
            '</div>',
            '</div>',
            '<div class="post-wrapper">',
            '<header class="post-header">',
            '<div class="post-meta"><span class="post-tag">Series</span> | ',
            String(tagInfo.count),
            ' posts</div>',
            '<h3 class="post-title"><a class="post-title-link" href="',
            detailUrl,
            '">',
            escapeHtml(title),
            '</a></h3>',
            '</header>',
            '<div class="post-excerpt">',
            desc,
            '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    fetch('/ghost/api/content/tags/?key=' + encodeURIComponent(contentKey) + '&include=count.posts&limit=all')
        .then(function (res) {
            if (!res.ok) {
                throw new Error('Failed to fetch series tags');
            }
            return res.json();
        })
        .then(function (data) {
            var tags = (data.tags || []).filter(function (tag) {
                return AYU_TAG_UTILS.isSeriesTag(tag) && AYU_TAG_UTILS.isPublicTag(tag);
            }).map(function (tag) {
                return {
                    slug: tag.slug,
                    name: tag.name || '',
                    description: tag.description || '',
                    feature_image: tag.feature_image || '',
                    count: tag.count && tag.count.posts ? tag.count.posts : 0
                };
            }).filter(function (tag) {
                return tag.count > 0;
            });

            if (!tags.length) {
                featuredGrid.innerHTML = '<div class="term-empty">No series found.</div>';
                listGrid.innerHTML = '';
                return;
            }

            tags.sort(function (a, b) {
                if (b.count !== a.count) {
                    return b.count - a.count;
                }
                return displayName(a.name, a.slug).localeCompare(displayName(b.name, b.slug));
            });

            var featuredTag = tags[0];
            featuredGrid.innerHTML = seriesCardHtml(featuredTag);

            var listTags = tags.slice(1);
            if (!listTags.length) {
                listGrid.innerHTML = '<div class="term-empty">No additional series.</div>';
                return;
            }

            listGrid.innerHTML = listTags.map(seriesCardHtml).join('');
            injectPromoSlots(listGrid);
        })
        .catch(function (error) {
            if (typeof logAyuWarning === 'function') {
                logAyuWarning('Content hub load failed (series)', error);
            } else {
                console.error('[Ayu Theme] Content hub load failed (series)', error);
            }
            featuredGrid.innerHTML = '<div class="term-empty">Content could not be loaded. Please try again later.</div>';
            listGrid.innerHTML = '';
        });
}
