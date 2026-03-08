function renderPrimaryCategories() {
    'use strict';

    var isCategoriesPage = /^\/categories\/?$/.test(window.location.pathname);
    if (!isCategoriesPage) {
        return;
    }

    var featuredGrid = document.getElementById('primary-featured-grid');
    var listGrid = document.getElementById('primary-list-grid');

    if (!featuredGrid || !listGrid) {
        return;
    }

    var contentKey = getAyuContentApiKey();

    featuredGrid.innerHTML = buildLoadingStateHtml();
    listGrid.innerHTML = buildSkeletonCards(2);

    if (!contentKey) {
        logAyuWarning('Content hub load failed: missing Content API key (categories)');
        featuredGrid.innerHTML = buildTermErrorHtml();
        listGrid.innerHTML = '';
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
        var desc = tagInfo.description ? escapeHtml(tagInfo.description) : 'Category archive';

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
            '<div class="post-meta"><span class="post-tag">Category</span> | ',
            String(tagInfo.count),
            ' posts</div>',
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

    function fetchPrimaryCategories() {
        var tagsUrl = '/ghost/api/content/tags/?key=' + encodeURIComponent(contentKey) + '&include=count.posts&limit=all';

        return fetchAyuContentApiJson(tagsUrl, { contentKey: contentKey })
            .then(function (data) {
                return (data.tags || []).filter(function (tag) {
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
                featuredGrid.innerHTML = '<div class="term-empty">No categories found.</div>';
                listGrid.innerHTML = '';
                return;
            }

            tags.sort(function (a, b) {
                return b.count - a.count;
            });

            var featuredTag = tags[0];
            featuredGrid.innerHTML = cardHtml(featuredTag);

            var listTags = tags.filter(function (tag) {
                return tag.slug !== featuredTag.slug;
            });

            listTags.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });

            if (!listTags.length) {
                listGrid.innerHTML = '<div class="term-empty">No additional categories.</div>';
                return;
            }

            listGrid.innerHTML = listTags.map(cardHtml).join('');
            injectPromoSlots(listGrid);
        })
        .catch(function (error) {
            logAyuWarning('Content hub load failed (categories)', error);
            featuredGrid.innerHTML = buildTermErrorHtml();
            listGrid.innerHTML = '';
        });
}
