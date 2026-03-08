function renderExplorePage() {
    'use strict';

    var EXPLORE_SECTION_MAX = 10;
    var EXPLORE_RECENT_MAX = 5;
    var EXPLORE_TAG_FETCH_LIMIT = 15;
    var EXPLORE_RECENT_FETCH_LIMIT = 8;
    var isExplorePage = /^\/explore\/?$/.test(window.location.pathname);
    if (!isExplorePage) {
        return;
    }

    var categoriesGrid = document.getElementById('explore-categories-grid');
    var seriesList = document.getElementById('explore-series-list');
    var topicsGrid = document.getElementById('explore-topics-grid');
    var recentList = document.getElementById('explore-recent-list');
    var categoriesMore = document.getElementById('explore-categories-more');
    var seriesMore = document.getElementById('explore-series-more');
    var topicsMore = document.getElementById('explore-topics-more');

    if (!categoriesGrid || !seriesList || !topicsGrid || !recentList) {
        return;
    }

    var contentKey = getAyuContentApiKey();

    categoriesGrid.innerHTML = buildLoadingStateHtml();
    seriesList.innerHTML = buildLoadingStateHtml();
    topicsGrid.innerHTML = buildLoadingStateHtml();
    recentList.innerHTML = '<li class="term-loading" role="status" aria-live="polite">' + AYU_USER_MESSAGES.HUB_LOADING + '</li>';
    if (categoriesMore) {
        categoriesMore.hidden = true;
    }
    if (seriesMore) {
        seriesMore.hidden = true;
    }
    if (topicsMore) {
        topicsMore.hidden = true;
    }

    if (!contentKey) {
        logAyuWarning('Content hub load failed: missing Content API key (explore)');
        categoriesGrid.innerHTML = buildTermErrorHtml();
        seriesList.innerHTML = buildTermErrorHtml();
        topicsGrid.innerHTML = buildTermErrorHtml();
        recentList.innerHTML = buildTermErrorListItemHtml();
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

    function pluralPosts(count) {
        return String(count) + ' post' + (count === 1 ? '' : 's');
    }

    function formatDate(value) {
        if (!value) {
            return '';
        }

        return new Date(value).toISOString().slice(0, 10);
    }

    function postUrl(post) {
        if (post.url) {
            return post.url;
        }

        return '/' + encodeURIComponent(post.slug || '') + '/';
    }

    function categoryCardHtml(item) {
        return [
            '<article class="explore-card explore-card-category">',
            '<a class="explore-card-media" href="/tag/', encodeURIComponent(item.slug), '/">',
            '<img class="explore-card-image" src="', escapeHtml(item.image || AYU_DEFAULT_IMAGES.PRIMARY_TAG), '" alt="', escapeHtml(item.name), '">',
            '</a>',
            '<div class="explore-card-body">',
            '<h3 class="explore-card-title"><a href="/tag/', encodeURIComponent(item.slug), '/">', escapeHtml(item.name), '</a></h3>',
            '<p class="explore-card-desc">', escapeHtml(item.description || 'Category archive.'), '</p>',
            '<p class="explore-card-count">', pluralPosts(item.count), '</p>',
            '</div>',
            '</article>'
        ].join('');
    }

    function seriesCardHtml(item) {
        return [
            '<article class="explore-card explore-card-series">',
            '<a class="explore-card-media" href="/tag/', encodeURIComponent(item.slug), '/">',
            '<img class="explore-card-image" src="', escapeHtml(item.image || AYU_DEFAULT_IMAGES.SERIES_TAG), '" alt="', escapeHtml(item.name), '">',
            '</a>',
            '<div class="explore-card-body">',
            '<h3 class="explore-card-title"><a href="/tag/', encodeURIComponent(item.slug), '/">', escapeHtml(item.name), '</a></h3>',
            '<p class="explore-card-desc">', escapeHtml(item.description || 'Series archive.'), '</p>',
            '<p class="explore-card-count">', pluralPosts(item.count), '</p>',
            '</div>',
            '</article>'
        ].join('');
    }

    function topicCardHtml(item) {
        return [
            '<a class="explore-topic-card" href="/tag/', encodeURIComponent(item.slug), '/">',
            '<span class="explore-topic-icon"><img src="', escapeHtml(item.image || AYU_DEFAULT_IMAGES.SECONDARY_TAG), '" alt="', escapeHtml(item.name), '"></span>',
            '<span class="explore-topic-name">', escapeHtml(item.name), '</span>',
            '<span class="explore-topic-count">', pluralPosts(item.count), '</span>',
            '</a>'
        ].join('');
    }

    function recentItemHtml(post) {
        return [
            '<li class="explore-recent-item">',
            '<a class="explore-recent-link" href="', escapeHtml(postUrl(post)), '">',
            '<span class="explore-recent-arrow" aria-hidden="true">&rarr;</span>',
            '<span class="explore-recent-title">', escapeHtml(post.title || 'Untitled'), '</span>',
            '<time class="explore-recent-date" datetime="', escapeHtml((post.published_at || '').slice(0, 10)), '">', escapeHtml(formatDate(post.published_at)), '</time>',
            '</a>',
            '</li>'
        ].join('');
    }

    function fetchRecentPosts() {
        var url = '/ghost/api/content/posts/?key=' + encodeURIComponent(contentKey) + '&fields=id,title,slug,url,published_at&limit=' + String(EXPLORE_RECENT_FETCH_LIMIT) + '&order=published_at%20desc';
        return fetchAyuContentApiJson(url, { contentKey: contentKey })
            .then(function (data) {
                return data.posts || [];
            });
    }

    function fetchTagBatch() {
        var url = '/ghost/api/content/tags/?key=' + encodeURIComponent(contentKey) + '&limit=' + String(EXPLORE_TAG_FETCH_LIMIT) + '&include=count.posts&order=count.posts%20desc';
        return fetchAyuContentApiJson(url, { contentKey: contentKey })
            .then(function (data) {
                return data.tags || [];
            });
    }

    Promise.all([
        fetchTagBatch(),
        fetchTagBatch(),
        fetchTagBatch(),
        fetchRecentPosts()
    ])
        .then(function (results) {
            var categoryTags = results[0] || [];
            var seriesTags = results[1] || [];
            var topicTags = results[2] || [];
            var recent = results[3] || [];

            var categories = categoryTags.filter(function (tag) {
                return AYU_TAG_UTILS.isCategoryTag(tag) && AYU_TAG_UTILS.isPublicTag(tag);
            }).map(function (tag) {
                return {
                    slug: tag.slug,
                    name: AYU_TAG_UTILS.getDisplayName(tag, tag.slug),
                    description: tag.description || '',
                    image: tag.feature_image || '',
                    count: tag.count && typeof tag.count.posts === 'number' ? tag.count.posts : 0
                };
            }).filter(function (item) {
                return item.count > 0;
            });

            var series = seriesTags.filter(function (tag) {
                return AYU_TAG_UTILS.isSeriesTag(tag) && AYU_TAG_UTILS.isPublicTag(tag);
            }).map(function (tag) {
                return {
                    slug: tag.slug,
                    seriesSlug: AYU_TAG_UTILS.extractSeriesSlug(tag),
                    name: AYU_TAG_UTILS.getDisplayName(tag, tag.slug),
                    description: tag.description || '',
                    image: tag.feature_image || '',
                    count: tag.count && typeof tag.count.posts === 'number' ? tag.count.posts : 0
                };
            }).filter(function (item) {
                return item.count > 0;
            });

            var topics = topicTags.filter(function (tag) {
                return AYU_TAG_UTILS.isTopicTag(tag);
            }).map(function (tag) {
                return {
                    slug: tag.slug,
                    name: AYU_TAG_UTILS.getDisplayName(tag, tag.slug),
                    image: tag.feature_image || '',
                    count: tag.count && typeof tag.count.posts === 'number' ? tag.count.posts : 0
                };
            }).filter(function (item) {
                return item.count > 0;
            });

            categories.sort(function (a, b) {
                if (b.count !== a.count) {
                    return b.count - a.count;
                }
                return a.name.localeCompare(b.name);
            });
            series.sort(function (a, b) {
                if (b.count !== a.count) {
                    return b.count - a.count;
                }
                return a.name.localeCompare(b.name);
            });
            topics.sort(function (a, b) {
                if (b.count !== a.count) {
                    return b.count - a.count;
                }
                return a.name.localeCompare(b.name);
            });

            categoriesGrid.innerHTML = categories.length ? categories.slice(0, EXPLORE_SECTION_MAX).map(categoryCardHtml).join('') : '<div class="term-empty">No categories yet.</div>';
            seriesList.innerHTML = series.length ? series.slice(0, EXPLORE_SECTION_MAX).map(seriesCardHtml).join('') : '<div class="term-empty">No series yet.</div>';
            topicsGrid.innerHTML = topics.length ? topics.slice(0, EXPLORE_SECTION_MAX).map(topicCardHtml).join('') : '<div class="term-empty">No topics yet.</div>';
            recentList.innerHTML = recent.length ? recent.slice(0, EXPLORE_RECENT_MAX).map(recentItemHtml).join('') : '<li class="term-empty">No recent posts.</li>';

            if (categoriesMore) {
                categoriesMore.hidden = categories.length <= EXPLORE_SECTION_MAX;
            }
            if (seriesMore) {
                seriesMore.hidden = series.length <= EXPLORE_SECTION_MAX;
            }
            if (topicsMore) {
                topicsMore.hidden = topics.length <= EXPLORE_SECTION_MAX;
            }
        })
        .catch(function (error) {
            logAyuWarning('Content hub load failed (explore)', error);
            categoriesGrid.innerHTML = buildTermErrorHtml();
            seriesList.innerHTML = buildTermErrorHtml();
            topicsGrid.innerHTML = buildTermErrorHtml();
            recentList.innerHTML = buildTermErrorListItemHtml();
        });
}
