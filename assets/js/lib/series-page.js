function renderSeriesTags() {
    'use strict';

    var isSeriesPage = /^\/series\/?$/.test(window.location.pathname);
    if (!isSeriesPage) {
        return;
    }

    var featuredGrid = document.getElementById('series-featured-grid');
    var listGrid = document.getElementById('series-list-grid');
    var paginationEl = document.getElementById('series-list-pagination');

    if (!featuredGrid || !listGrid || !paginationEl) {
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

    function getCurrentPage(totalPages) {
        var params = new URLSearchParams(window.location.search);
        var page = parseInt(params.get('page') || '1', 10);

        if (!page || page < 1) {
            return 1;
        }

        if (totalPages && page > totalPages) {
            return totalPages;
        }

        return page;
    }

    function updatePageUrl(page) {
        var url = new URL(window.location.href);

        if (page > 1) {
            url.searchParams.set('page', String(page));
        } else {
            url.searchParams.delete('page');
        }

        window.history.replaceState({}, '', url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : ''));
    }

    function buildPaginationHtml(currentPage, totalPages) {
        var html = [];
        var page;

        if (totalPages < 2) {
            return '';
        }

        if (currentPage > 1) {
            html.push('<button class="ayu-page-link" type="button" data-page="' + String(currentPage - 1) + '">&lt;</button>');
        }

        for (page = 1; page <= totalPages; page += 1) {
            if (page === currentPage) {
                html.push('<span class="ayu-page-link is-active" aria-current="page">' + String(page) + '</span>');
            } else {
                html.push('<button class="ayu-page-link" type="button" data-page="' + String(page) + '">' + String(page) + '</button>');
            }
        }

        if (currentPage < totalPages) {
            html.push('<button class="ayu-page-link" type="button" data-page="' + String(currentPage + 1) + '">&gt;</button>');
        }

        return html.join('');
    }

    function renderPaginatedList(tags, requestedPage) {
        var pageSize = AYU_GLOBALS.PAGINATION_PAGE_SIZE;
        var totalPages = Math.max(1, Math.ceil(tags.length / pageSize));
        var currentPage = typeof requestedPage === 'number' ? requestedPage : getCurrentPage(totalPages);
        var normalizedPage = currentPage < 1 ? 1 : (currentPage > totalPages ? totalPages : currentPage);
        var startIndex = (normalizedPage - 1) * pageSize;
        var pageTags = tags.slice(startIndex, startIndex + pageSize);

        listGrid.innerHTML = pageTags.map(seriesCardHtml).join('');
        injectPromoSlots(listGrid);
        paginationEl.innerHTML = buildPaginationHtml(normalizedPage, totalPages);
        updatePageUrl(normalizedPage);
    }

    paginationEl.addEventListener('click', function (event) {
        var target = event.target.closest('[data-page]');
        if (!target) {
            return;
        }

        var nextPage = parseInt(target.getAttribute('data-page'), 10);
        if (!nextPage || nextPage < 1 || !window.__ayuSeriesTagList) {
            return;
        }

        renderPaginatedList(window.__ayuSeriesTagList, nextPage);
    });

    fetchAyuContentApiJson('/ghost/api/content/tags/?key=' + encodeURIComponent(contentKey) + '&include=count.posts&limit=all', { contentKey: contentKey })
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
                paginationEl.innerHTML = '';
                return;
            }

            window.__ayuSeriesTagList = listTags;
            renderPaginatedList(listTags);
        })
        .catch(function (error) {
            if (typeof logAyuWarning === 'function') {
                logAyuWarning('Content hub load failed (series)', error);
            } else {
                console.error('[Ayu Theme] Content hub load failed (series)', error);
            }
            featuredGrid.innerHTML = '<div class="term-empty">Content could not be loaded. Please try again later.</div>';
            listGrid.innerHTML = '';
            paginationEl.innerHTML = '';
        });
}
