function renderExplorePage() {
    'use strict';

    var EXPLORE_SECTION_MAX = 10;
    var EXPLORE_RECENT_MAX = 5;
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

    if (!contentKey) {
        logAyuWarning('Content hub load failed: missing Content API key (explore)');
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
        return String(count) + ayuHubText(' post' + (count === 1 ? '' : 's'), '개 글');
    }

    function resolveTagName(tag) {
        return AYU_TAG_UTILS.getDisplayName(tag, tag && tag.slug);
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
            '<p class="explore-card-desc">', escapeHtml(item.description || ayuHubText('Category archive.', '카테고리 글 모음')), '</p>',
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
            '<p class="explore-card-desc">', escapeHtml(item.description || ayuHubText('Series archive.', '시리즈 글 모음')), '</p>',
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
            '<span class="explore-recent-title">', escapeHtml(post.title || ayuHubText('Untitled', '제목 없음')), '</span>',
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

    function fetchAllTags() {
        var url = '/ghost/api/content/tags/?key=' + encodeURIComponent(contentKey) + '&limit=all&include=count.posts';
        return fetchAyuContentApiCollection(url, 'tags', { contentKey: contentKey });
    }

    Promise.all([
        fetchAllTags(),
        fetchRecentPosts()
    ])
        .then(function (results) {
            var allTags = results[0] || [];
            var recent = results[1] || [];

            var categories = allTags.filter(function (tag) {
                return AYU_TAG_UTILS.isCategoryTag(tag) && AYU_TAG_UTILS.isPublicTag(tag);
            }).map(function (tag) {
                return {
                    slug: tag.slug,
                    name: resolveTagName(tag),
                    description: tag.description || '',
                    image: tag.feature_image || '',
                    count: tag.count && typeof tag.count.posts === 'number' ? tag.count.posts : 0
                };
            }).filter(function (item) {
                return item.count > 0;
            });

            var series = allTags.filter(function (tag) {
                return AYU_TAG_UTILS.isSeriesTag(tag) && AYU_TAG_UTILS.isPublicTag(tag);
            }).map(function (tag) {
                return {
                    slug: tag.slug,
                    seriesSlug: AYU_TAG_UTILS.extractSeriesSlug(tag),
                    name: resolveTagName(tag),
                    description: tag.description || '',
                    image: tag.feature_image || '',
                    count: tag.count && typeof tag.count.posts === 'number' ? tag.count.posts : 0
                };
            }).filter(function (item) {
                return item.count > 0;
            });

            var topics = allTags.filter(function (tag) {
                return AYU_TAG_UTILS.isTopicTag(tag);
            }).map(function (tag) {
                return {
                    slug: tag.slug,
                    name: resolveTagName(tag),
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

            categoriesGrid.innerHTML = categories.length ? categories.slice(0, EXPLORE_SECTION_MAX).map(categoryCardHtml).join('') : '<div class="term-empty">' + ayuHubText('No categories yet.', '아직 카테고리가 없습니다.') + '</div>';
            seriesList.innerHTML = series.length ? series.slice(0, EXPLORE_SECTION_MAX).map(seriesCardHtml).join('') : '<div class="term-empty">' + ayuHubText('No series yet.', '아직 시리즈가 없습니다.') + '</div>';
            topicsGrid.innerHTML = topics.length ? topics.slice(0, EXPLORE_SECTION_MAX).map(topicCardHtml).join('') : '<div class="term-empty">' + ayuHubText('No topics yet.', '아직 주제가 없습니다.') + '</div>';
            recentList.innerHTML = recent.length ? recent.slice(0, EXPLORE_RECENT_MAX).map(recentItemHtml).join('') : '<li class="term-empty">' + ayuHubText('No recent posts.', '최근 글이 없습니다.') + '</li>';

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
        });
}
