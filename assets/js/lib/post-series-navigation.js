function renderPostSeriesNavigation() {
    'use strict';

    if (!document.body.classList.contains('post-template')) {
        return;
    }

    var navSection = document.getElementById('post-series-nav');
    var navTitle = document.getElementById('post-series-nav-title');
    var navList = document.getElementById('post-series-nav-list');

    if (!navSection || !navTitle || !navList) {
        return;
    }
    // Template emits raw series candidates. Policy: first-series-wins.
    var rawSeriesListValue = (navSection.getAttribute('data-series-slugs') || '').trim().toLowerCase();
    var rawSeriesTokens = rawSeriesListValue ? rawSeriesListValue.split(/\s+/).filter(Boolean) : [];
    var seriesCandidates = rawSeriesTokens.filter(function (slug) {
        return slug.indexOf(AYU_TAG_PREFIX.SERIES) === 0;
    });
    navSection.setAttribute('data-series-count', String(seriesCandidates.length));

    if (!seriesCandidates.length) {
        if (rawSeriesTokens.length) {
            navSection.setAttribute('data-series-nav-state', 'invalid-series-slug');
            logAyuWarning('Series navigation skipped: invalid series slug list on #post-series-nav (' + rawSeriesListValue + ')');
        } else {
            navSection.setAttribute('data-series-nav-state', 'missing-series-slug');
            logAyuWarning('Series navigation skipped: missing data-series-slugs on #post-series-nav');
        }
        navSection.hidden = true;
        return;
    }

    var selectedState = 'ready';
    if (seriesCandidates.length > 1) {
        selectedState = 'multiple-series-tags-first-used';
        logAyuWarning('Series navigation found multiple series tags; using first (' + seriesCandidates[0] + ')');
    }
    if (selectedState === 'multiple-series-tags-first-used') {
        navSection.setAttribute('data-series-nav-warning', selectedState);
    } else {
        navSection.removeAttribute('data-series-nav-warning');
    }

    var rawSeriesSlug = seriesCandidates[0];
    navSection.setAttribute('data-series-slug', rawSeriesSlug);

    var seriesSlug = rawSeriesSlug.substring(AYU_TAG_PREFIX.SERIES.length);
    if (!seriesSlug) {
        navSection.setAttribute('data-series-nav-state', 'empty-series-slug');
        logAyuWarning('Series navigation skipped: empty series suffix after prefix');
        navSection.hidden = true;
        return;
    }

    var currentSlug = (navSection.getAttribute('data-post-slug') || window.location.pathname.replace(/^\/+|\/+$/g, '')).toLowerCase();
    var contentKey = getAyuContentApiKey();

    if (!contentKey) {
        navSection.setAttribute('data-series-nav-state', 'missing-content-key');
        logAyuWarning('Series navigation initialization failed: missing Content API key');
        navSection.hidden = true;
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

    function displaySeriesName(tag) {
        return AYU_TAG_UTILS.getDisplayName(tag, seriesSlug);
    }

    function postUrl(post) {
        if (post.url) {
            return post.url;
        }

        return '/' + encodeURIComponent(post.slug || '') + '/';
    }

    var seriesTagSlug = AYU_TAG_PREFIX.SERIES + seriesSlug;
    var tagUrl = '/ghost/api/content/tags/?key=' + encodeURIComponent(contentKey) + '&filter=slug:' + encodeURIComponent(seriesTagSlug) + '&limit=1';
    var postsUrl = '/ghost/api/content/posts/?key=' + encodeURIComponent(contentKey) + '&filter=tag:' + encodeURIComponent(seriesTagSlug) + '&fields=id,title,slug,url,published_at&order=published_at%20asc&limit=all';

    Promise.all([
        fetchAyuContentApiJson(tagUrl, { contentKey: contentKey }),
        fetchAyuContentApiJson(postsUrl, { contentKey: contentKey })
    ])
        .then(function (results) {
            var tag = results[0] && results[0].tags ? results[0].tags[0] : null;
            var posts = results[1] && results[1].posts ? results[1].posts : [];

            if (!posts.length) {
                navSection.setAttribute('data-series-nav-state', 'empty-series-posts');
                navSection.hidden = true;
                return;
            }

            var seriesName = displaySeriesName(tag);
            navTitle.innerHTML = 'Series: <a href="/tag/' + encodeURIComponent(seriesTagSlug) + '/">' + escapeHtml(seriesName) + '</a>';

            navList.innerHTML = posts.map(function (post) {
                var slug = (post.slug || '').toLowerCase();
                var isCurrent = slug === currentSlug;
                var itemClass = isCurrent ? ' class="is-active"' : '';
                var safeTitle = escapeHtml(post.title || 'Untitled');

                if (isCurrent) {
                    return '<li' + itemClass + '><span>' + safeTitle + '</span></li>';
                }

                return '<li' + itemClass + '><a href="' + escapeHtml(postUrl(post)) + '">' + safeTitle + '</a></li>';
            }).join('');

            navSection.setAttribute('data-series-nav-state', selectedState);
            navSection.hidden = false;
        })
        .catch(function (error) {
            navSection.setAttribute('data-series-nav-state', 'fetch-failed');
            logAyuWarning('Series navigation load failed: ' + seriesTagSlug, error);
            navSection.hidden = true;
        });
}
