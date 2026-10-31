function renderPrimaryCategories() {
    'use strict';

    var isCategoriesPage = /^\/categories\/?$/.test(window.location.pathname);
    if (!isCategoriesPage) {
        return;
    }

    var featuredGrid = document.getElementById('primary-featured-grid');
    var listGrid = document.getElementById('primary-list-grid');
    var paginationEl = document.getElementById('primary-list-pagination');

    if (!featuredGrid || !listGrid || !paginationEl) {
        return;
    }

    var contentKey = getAyuContentApiKey();

    if (!contentKey) {
        logAyuWarning('Content hub load failed: missing Content API key (categories)');
        return;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function cardHtml(tagInfo) {
        var desc = tagInfo.description ? escapeHtml(tagInfo.description) : ayuHubText('Category archive', '카테고리 글 모음');

        return [
            '<article class="post category-post">',
            '<div class="post-media">',
            '<div class="u-placeholder square">',
            '<a href="/tag/',
            encodeURIComponent(tagInfo.slug),
            '/">',
            '<img class="post-image lazyload u-object-fit" src="' + escapeHtml(tagInfo.feature_image || AYU_DEFAULT_IMAGES.PRIMARY_TAG) + '" alt="' + escapeHtml(tagInfo.name) + '">',
            '</a>',
            '</div>',
            '</div>',
            '<div class="post-wrapper">',
            '<header class="post-header">',
            '<div class="post-meta"><span class="post-tag">' + ayuHubText('Category', '카테고리') + '</span> | ',
            String(tagInfo.count),
            ayuHubText(' posts</div>', '개 글</div>'),
            '<h3 class="post-title"><a class="post-title-link" href="/tag/',
            encodeURIComponent(tagInfo.slug),
            '/">',
            escapeHtml(tagInfo.name),
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

    function updatePageUrl(page, userAction) {
        var url = new URL(window.location.href);

        if (page > 1) {
            url.searchParams.set('page', String(page));
        } else {
            url.searchParams.delete('page');
        }

        if (url.href !== window.location.href) {
            window.history[userAction ? 'pushState' : 'replaceState']({}, '', url.pathname + url.search + url.hash);
        }
    }

    window.addEventListener('popstate', function () {
        if (window.__ayuPrimaryCategoryList) { renderPaginatedList(window.__ayuPrimaryCategoryList); }
    });

    function buildPaginationHtml(currentPage, totalPages) {
        var html = [];
        var page;

        if (totalPages < 2) {
            return '';
        }

        if (currentPage > 1) {
            html.push('<button class="ayu-page-link" type="button" aria-label="' + ayuHubText('Previous page', '이전 페이지') + '" data-page="' + String(currentPage - 1) + '">&lt;</button>');
        }

        for (page = 1; page <= totalPages; page += 1) {
            if (page === currentPage) {
                html.push('<span class="ayu-page-link is-active" aria-current="page">' + String(page) + '</span>');
            } else {
                html.push('<button class="ayu-page-link" type="button" data-page="' + String(page) + '">' + String(page) + '</button>');
            }
        }

        if (currentPage < totalPages) {
            html.push('<button class="ayu-page-link" type="button" aria-label="' + ayuHubText('Next page', '다음 페이지') + '" data-page="' + String(currentPage + 1) + '">&gt;</button>');
        }

        return html.join('');
    }

    function renderPaginatedList(tags, requestedPage, userAction) {
        var pageSize = AYU_GLOBALS.PAGINATION_PAGE_SIZE;
        var totalPages = Math.max(1, Math.ceil(tags.length / pageSize));
        var currentPage = typeof requestedPage === 'number' ? requestedPage : getCurrentPage(totalPages);
        var normalizedPage = currentPage < 1 ? 1 : (currentPage > totalPages ? totalPages : currentPage);
        var startIndex = (normalizedPage - 1) * pageSize;
        var pageTags = tags.slice(startIndex, startIndex + pageSize);

        listGrid.innerHTML = pageTags.map(cardHtml).join('');
        injectPromoSlots(listGrid);
        paginationEl.innerHTML = buildPaginationHtml(normalizedPage, totalPages);
        updatePageUrl(normalizedPage, userAction);
    }

    paginationEl.addEventListener('click', function (event) {
        var target = event.target.closest('[data-page]');
        if (!target) {
            return;
        }

        var nextPage = parseInt(target.getAttribute('data-page'), 10);
        if (!nextPage || nextPage < 1 || !window.__ayuPrimaryCategoryList) {
            return;
        }

        renderPaginatedList(window.__ayuPrimaryCategoryList, nextPage, true);
    });

    function fetchPrimaryCategories() {
        var tagsUrl = '/ghost/api/content/tags/?key=' + encodeURIComponent(contentKey) + '&include=count.posts&limit=all&order=name%20asc,slug%20asc';

        return fetchAyuContentApiCollection(tagsUrl, 'tags', { contentKey: contentKey })
            .then(function (tags) {
                return (tags || []).filter(function (tag) {
                    return AYU_TAG_UTILS.isCategoryTag(tag) && AYU_TAG_UTILS.isPublicTag(tag);
                }).map(function (tag) {
                    return {
                        slug: tag.slug,
                        name: AYU_TAG_UTILS.getDisplayName(tag, tag.slug),
                        description: tag.description || '',
                        feature_image: tag.feature_image || '',
                        count: tag.count && typeof tag.count.posts === 'number' ? tag.count.posts : 0
                    };
                }).filter(function (tag) {
                    return tag.count > 0;
                });
            });
    }

    fetchPrimaryCategories()
        .then(function (tags) {
            if (!tags.length) {
                featuredGrid.innerHTML = '<div class="term-empty">' + ayuHubText('No categories found.', '카테고리가 없습니다.') + '</div>';
                listGrid.innerHTML = '';
                return;
            }

            // API name order is also the SSR list order. Pick the largest count
            // without re-sorting names in the browser (Ghost owns collation).
            var featuredTag = tags.reduce(function (best, tag) {
                return tag.count > best.count ? tag : best;
            }, tags[0]);

            featuredGrid.innerHTML = cardHtml(featuredTag);

            var listTags = tags.filter(function (tag) {
                return tag.slug !== featuredTag.slug;
            });

            if (!listTags.length) {
                listGrid.innerHTML = '<div class="term-empty">' + ayuHubText('No additional categories.', '추가 카테고리가 없습니다.') + '</div>';
                paginationEl.innerHTML = '';
                return;
            }

            window.__ayuPrimaryCategoryList = listTags;
            renderPaginatedList(listTags);
        })
        .catch(function (error) {
            logAyuWarning('Content hub load failed (categories)', error);
        });
}
