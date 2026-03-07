function renderSeriesTags() {
    'use strict';

    var isSeriesPage = /^\/series\/?$/.test(window.location.pathname);
    var params = new URLSearchParams(window.location.search);
    if (!isSeriesPage || params.get('series')) {
        return;
    }

    var featuredGrid = document.getElementById('series-featured-grid');
    var listGrid = document.getElementById('series-list-grid');

    if (!featuredGrid || !listGrid) {
        return;
    }

    var keyScript = document.querySelector('script[data-key]');
    var contentKey = keyScript ? keyScript.getAttribute('data-key') : '';

    if (!contentKey) {
        featuredGrid.innerHTML = '<div class="term-empty">Failed to load series.</div>';
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

    function seriesSlugFromTagSlug(tagSlug) {
        return AYU_TAG_UTILS.getSeriesSlug(tagSlug) || tagSlug || '';
    }

    function displayName(name, slug) {
        return AYU_TAG_UTILS.getSeriesDisplayName({ name: name, slug: slug }, slug);
    }


    function seriesCardHtml(tagInfo) {
        var title = displayName(tagInfo.name, tagInfo.slug);
        var desc = tagInfo.description ? escapeHtml(tagInfo.description) : 'Series archive';
        var initial = escapeHtml((title || '?').charAt(0));
        var detailSlug = seriesSlugFromTagSlug(tagInfo.slug);
        var mediaHtml = '';

        var defaults = (typeof AYU_DEFAULT_IMAGES !== 'undefined' && AYU_DEFAULT_IMAGES) ? AYU_DEFAULT_IMAGES : {};
        var cardImage = tagInfo.feature_image || tagInfo.fallback_feature_image || defaults.SERIES_TAG || '/assets/images/fallback/series-tag-default.png';

        mediaHtml = '<img class="post-image lazyload u-object-fit" src="' + escapeHtml(cardImage) + '" alt="' + escapeHtml(title) + '">';

        return [
            '<article class="post category-post">',
            '<div class="post-media">',
            '<div class="u-placeholder square">',
            '<a href="/series/?series=',
            encodeURIComponent(detailSlug),
            '">',
            mediaHtml,
            '</a>',
            '</div>',
            '</div>',
            '<div class="post-wrapper">',
            '<header class="post-header">',
            '<div class="post-meta"><span class="post-tag">Series</span> | ',
            String(tagInfo.count),
            ' posts</div>',
            '<h3 class="post-title"><a class="post-title-link" href="/series/?series=',
            encodeURIComponent(detailSlug),
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
            var allTags = data.tags || [];
            var publicTagImageBySlug = {};

            allTags.forEach(function (tag) {
                if (!tag || !tag.slug || tag.slug.indexOf('hash-') === 0) {
                    return;
                }

                if (tag.feature_image) {
                    publicTagImageBySlug[tag.slug] = tag.feature_image;
                }
            });

            var tags = allTags.filter(function (tag) {
                return AYU_TAG_UTILS.isSeriesInternalTag(tag);
            }).map(function (tag) {
                var seriesSlug = seriesSlugFromTagSlug(tag.slug);

                return {
                    slug: tag.slug,
                    name: tag.name || '',
                    description: tag.description || '',
                    feature_image: tag.feature_image || '',
                    fallback_feature_image: publicTagImageBySlug[seriesSlug] || '',
                    count: tag.count && tag.count.posts ? tag.count.posts : 0
                };
            });

            if (!tags.length) {
                featuredGrid.innerHTML = '<div class="term-empty">No series tags found.</div>';
                listGrid.innerHTML = '';
                return;
            }

            tags.sort(function (a, b) {
                return b.count - a.count;
            });

            var featuredTag = tags[0];
            featuredGrid.innerHTML = seriesCardHtml(featuredTag);

            var listTags = tags.filter(function (tag) {
                return tag.slug !== featuredTag.slug;
            });

            listTags.sort(function (a, b) {
                return displayName(a.name, a.slug).localeCompare(displayName(b.name, b.slug));
            });

            if (!listTags.length) {
                listGrid.innerHTML = '<div class="term-empty">No additional series.</div>';
                return;
            }

            listGrid.innerHTML = listTags.map(seriesCardHtml).join('');
            injectPromoSlots(listGrid);
        })
        .catch(function () {
            featuredGrid.innerHTML = '<div class="term-empty">Failed to load series.</div>';
            listGrid.innerHTML = '';
        });
}

function renderSeriesDetail() {
    'use strict';

    var isSeriesPage = /^\/series\/?$/.test(window.location.pathname);
    if (!isSeriesPage) {
        return;
    }

    var params = new URLSearchParams(window.location.search);
    var detailSlug = params.get('series');
    if (!detailSlug) {
        return;
    }

    var page = parseInt(params.get('page') || '1', 10);
    if (!page || page < 1) {
        page = 1;
    }

    var internalSlug = 'hash-series-' + detailSlug;

    var listHeader = document.getElementById('series-list-header');
    var listFeatured = document.getElementById('series-list-featured');
    var listAll = document.getElementById('series-list-all');
    var headerEl = document.getElementById('series-detail-header');
    var nameEl = document.getElementById('series-detail-name');
    var descEl = document.getElementById('series-detail-description');
    var countEl = document.getElementById('series-detail-count');
    var featuredSection = document.getElementById('series-detail-featured-section');
    var featuredFeed = document.getElementById('series-detail-featured-feed');
    var listSection = document.getElementById('series-detail-list-section');
    var postFeed = document.getElementById('series-detail-post-feed');
    var paginationEl = document.getElementById('series-detail-pagination');

    if (!headerEl || !nameEl || !descEl || !countEl || !featuredSection || !featuredFeed || !listSection || !postFeed || !paginationEl) {
        return;
    }

    if (listHeader) {
        listHeader.hidden = true;
    }
    if (listFeatured) {
        listFeatured.hidden = true;
    }
    if (listAll) {
        listAll.hidden = true;
    }

    headerEl.hidden = false;
    featuredSection.hidden = false;
    listSection.hidden = false;
    paginationEl.hidden = false;

    var keyScript = document.querySelector('script[data-key]');
    var contentKey = keyScript ? keyScript.getAttribute('data-key') : '';

    if (!contentKey) {
        countEl.textContent = '';
        featuredFeed.innerHTML = '<div class="term-empty">Failed to load series.</div>';
        postFeed.innerHTML = '';
        paginationEl.innerHTML = '';
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

    function toDisplayName(tag) {
        return AYU_TAG_UTILS.getSeriesDisplayName(tag, detailSlug);
    }


    function postUrl(post) {
        if (post.url) {
            return post.url;
        }

        return '/' + encodeURIComponent(post.slug || '') + '/';
    }

    function buildPostHtml(post) {
        var title = escapeHtml(post.title || 'Untitled');
        var excerpt = post.excerpt ? '<div class="post-excerpt">' + escapeHtml(post.excerpt) + '</div>' : '';
        var dateIso = post.published_at ? post.published_at.substring(0, 10) : '';
        var dateText = post.published_at ? new Date(post.published_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).toUpperCase() : '';
        var tagsHtml = buildPostTagsHtml(post, escapeHtml);
        var mediaHtml;

        if (post.feature_image) {
            mediaHtml = '<img class="post-image lazyload u-object-fit" src="' + escapeHtml(post.feature_image) + '" alt="' + title + '">';
        } else {
            var defaultPostImage = (typeof AYU_DEFAULT_IMAGES !== 'undefined' && AYU_DEFAULT_IMAGES.POST) ? AYU_DEFAULT_IMAGES.POST : '/assets/images/fallback/post-default.png';
            mediaHtml = '<img class="post-image lazyload u-object-fit" src="' + escapeHtml(defaultPostImage) + '" alt="' + title + '">';
        }

        return [
            '<article class="post">',
            '<div class="post-media">',
            '<div class="u-placeholder square">',
            '<a href="',
            escapeHtml(postUrl(post)),
            '">',
            mediaHtml,
            '</a>',
            '</div>',
            '</div>',
            '<div class="post-wrapper">',
            '<header class="post-header">',
            '<div class="post-meta">',
            '<span class="post-meta-item post-meta-date"><time datetime="',
            dateIso,
            '">',
            dateText,
            '</time></span>',
            tagsHtml ? '<span class="post-meta-item post-meta-tags">' + tagsHtml + '</span>' : '',
            '</div>',
            '<h2 class="post-title"><a class="post-title-link" href="',
            escapeHtml(postUrl(post)),
            '">',
            title,
            '</a></h2>',
            '</header>',
            excerpt,
            '</div>',
            '</article>'
        ].join('');
    }

    function renderSeriesQueryPagination(currentPage, totalPages) {
        if (!totalPages || totalPages < 2) {
            paginationEl.innerHTML = '';
            return;
        }

        var html = [];
        function pageHref(targetPage) {
            return '/series/?series=' + encodeURIComponent(detailSlug) + '&page=' + targetPage;
        }

        if (currentPage > 1) {
            html.push('<a class="ayu-page-link" href="' + pageHref(currentPage - 1) + '">&lt;</a>');
        }

        for (var p = 1; p <= totalPages; p += 1) {
            if (p === currentPage) {
                html.push('<span class="ayu-page-link is-active" aria-current="page">' + p + '</span>');
            } else {
                html.push('<a class="ayu-page-link" href="' + pageHref(p) + '">' + p + '</a>');
            }
        }

        if (currentPage < totalPages) {
            html.push('<a class="ayu-page-link" href="' + pageHref(currentPage + 1) + '">&gt;</a>');
        }

        paginationEl.innerHTML = html.join('');
    }

    var tagUrl = '/ghost/api/content/tags/?key=' + encodeURIComponent(contentKey) + '&filter=slug:' + encodeURIComponent(internalSlug) + '&limit=1';
    var publicTagUrl = '/ghost/api/content/tags/?key=' + encodeURIComponent(contentKey) + '&filter=slug:' + encodeURIComponent(detailSlug) + '&limit=1';
    var featuredUrl = '/ghost/api/content/posts/?key=' + encodeURIComponent(contentKey) + '&include=tags,authors&filter=tag:' + encodeURIComponent(internalSlug) + '+featured:true&limit=1';
    var postsUrl = '/ghost/api/content/posts/?key=' + encodeURIComponent(contentKey) + '&include=tags,authors&filter=tag:' + encodeURIComponent(internalSlug) + '&order=published_at%20desc&limit=' + String(AYU_GLOBALS.PAGINATION_PAGE_SIZE) + '&page=' + String(page);

    Promise.all([
        fetch(tagUrl).then(function (res) { return res.ok ? res.json() : null; }),
        fetch(publicTagUrl).then(function (res) { return res.ok ? res.json() : null; }),
        fetch(featuredUrl).then(function (res) { return res.ok ? res.json() : null; }),
        fetch(postsUrl).then(function (res) { return res.ok ? res.json() : null; })
    ])
        .then(function (results) {
            var tagData = results[0] && results[0].tags ? results[0].tags[0] : null;
            var publicTagData = results[1] && results[1].tags ? results[1].tags[0] : null;
            var featuredPosts = results[2] && results[2].posts ? results[2].posts : [];
            var postData = results[3] && results[3].posts ? results[3].posts : [];
            var pagination = results[3] && results[3].meta && results[3].meta.pagination ? results[3].meta.pagination : { page: 1, pages: 1 };

            if (!tagData) {
                nameEl.textContent = 'Series not found';
                descEl.textContent = '';
                countEl.textContent = '';
                featuredFeed.innerHTML = '<div class="term-empty">Series not found.</div>';
                postFeed.innerHTML = '';
                paginationEl.innerHTML = '';
                return;
            }

            nameEl.textContent = toDisplayName(tagData);
            descEl.textContent = tagData.description || '';
            countEl.textContent = String(pagination.total || postData.length || 0) + ' posts';
            if (!tagData.description) {
                descEl.style.display = 'none';
            } else {
                descEl.style.display = '';
            }

            var defaults = (typeof AYU_DEFAULT_IMAGES !== 'undefined' && AYU_DEFAULT_IMAGES) ? AYU_DEFAULT_IMAGES : {};
            var headerImage = tagData.feature_image || (publicTagData && publicTagData.feature_image ? publicTagData.feature_image : '') || defaults.SERIES_TAG || '/assets/images/fallback/series-tag-default.png';

            if (headerImage && !headerEl.querySelector('.tag-header-image-wrap')) {
                var imgWrap = document.createElement('div');
                imgWrap.className = 'tag-header-image-wrap';
                imgWrap.innerHTML = '<img class="tag-header-image" src="' + escapeHtml(headerImage) + '" alt="' + escapeHtml(nameEl.textContent) + '">';
                headerEl.insertBefore(imgWrap, nameEl);
            }

            var featuredPost = featuredPosts.length ? featuredPosts[0] : (postData.length ? postData[0] : null);
            var featuredId = featuredPost ? featuredPost.id : '';

            if (featuredPost) {
                featuredFeed.innerHTML = buildPostHtml(featuredPost);
            } else {
                featuredFeed.innerHTML = '<div class="term-empty">No posts in this series.</div>';
            }

            var listPosts = postData.filter(function (post, index) {
                if (!featuredId) {
                    return index > 0;
                }

                return post.id !== featuredId;
            });

            postFeed.innerHTML = listPosts.length ? listPosts.map(buildPostHtml).join('') : '<div class="term-empty">No additional posts.</div>';
            injectPromoSlots(postFeed);
            normalizeInternalPostTags(featuredFeed);
            normalizeInternalPostTags(postFeed);
            renderSeriesQueryPagination(pagination.page || 1, pagination.pages || 1);
        })
        .catch(function () {
            nameEl.textContent = 'Series';
            descEl.textContent = '';
            countEl.textContent = '';
            featuredFeed.innerHTML = '<div class="term-empty">Failed to load series.</div>';
            postFeed.innerHTML = '';
            paginationEl.innerHTML = '';
        });
}



