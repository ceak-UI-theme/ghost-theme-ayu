$(function () {
    'use strict';
    cover();
    player();
    themeToggle();
    renderAyuPagination();
    renderPrimaryCategories();
    renderSeriesTags();
    renderSeriesDetail();
    renderSearchPage();
    injectPromoSlots(document);
    normalizeInternalPostTags(document);
});

function buildPromoCardHtml() {
    'use strict';

    return [
        '<article class="post post-promo" aria-label="Promotion">',
        '<div class="post-wrapper post-promo-wrapper">',
        '<div class="post-promo-label">Promo</div>',
        '<p class="post-promo-copy">This is a promo slot.</p>',
        '</div>',
        '</article>'
    ].join('');
}

function injectPromoSlots(root) {
    'use strict';

    var scope = root || document;
    var feeds = [];

    if (scope && scope.nodeType === 1 && scope.classList && scope.classList.contains('js-promo-feed')) {
        feeds = [scope];
    } else if (scope && scope.querySelectorAll) {
        feeds = Array.prototype.slice.call(scope.querySelectorAll('.js-promo-feed'));
    }

    if (!feeds.length) {
        return;
    }

    feeds.forEach(function (feed) {
        if (!feed || !feed.children) {
            return;
        }

        var children = Array.prototype.slice.call(feed.children);
        children.forEach(function (el) {
            if (el.classList && el.classList.contains('post') && el.classList.contains('post-promo')) {
                el.remove();
            }
        });

        var posts = Array.prototype.slice.call(feed.children).filter(function (el) {
            return el.classList && el.classList.contains('post') && !el.classList.contains('post-promo');
        });

        posts.forEach(function (postEl, index) {
            var visibleIndex = index + 1;
            if (visibleIndex % 5 !== 0) {
                return;
            }

            var promoWrap = document.createElement('div');
            promoWrap.innerHTML = buildPromoCardHtml();
            var promoNode = promoWrap.firstElementChild;

            if (!promoNode) {
                return;
            }

            postEl.insertAdjacentElement('afterend', promoNode);
        });
    });
}

function normalizeInternalPostTags(root) {
    'use strict';

    var scope = root || document;
    var tags = scope.querySelectorAll ? scope.querySelectorAll('.post-meta-tags .post-tag, .post-meta .post-tag') : [];

    Array.prototype.slice.call(tags).forEach(function (tagEl) {
        if (!tagEl || !tagEl.getAttribute) {
            return;
        }

        var href = tagEl.getAttribute('href') || '';
        var cls = tagEl.className || '';
        var text = (tagEl.textContent || '').trim();
        var slugMatch = cls.match(/(?:^|\s)post-tag-([^\s]+)/);
        var slug = slugMatch ? slugMatch[1] : '';

        if (!slug && href.indexOf('/tag/') !== -1) {
            var path = href.split('?')[0];
            var m = path.match(/\/tag\/([^/]+)\/?$/);
            slug = m ? decodeURIComponent(m[1]) : '';
        }

        var isInternalHash = slug.indexOf('hash-') === 0 || text.indexOf('#') === 0 || href.indexOf('/tag/hash-') !== -1;
        var isSeriesInternal = slug.indexOf('hash-series-') === 0 || text.indexOf('#series-') === 0;

        if (!isInternalHash) {
            return;
        }

        if (!isSeriesInternal) {
            tagEl.remove();
            return;
        }

        var seriesSlug = '';
        if (slug.indexOf('hash-series-') === 0) {
            seriesSlug = slug.substring('hash-series-'.length);
        } else if (text.indexOf('#series-') === 0) {
            seriesSlug = text.substring('#series-'.length);
        }

        if (!seriesSlug) {
            return;
        }

        tagEl.setAttribute('href', '/series/?series=' + encodeURIComponent(seriesSlug));
        tagEl.classList.add('is-internal-series');
        tagEl.textContent = seriesSlug;
        tagEl.setAttribute('title', seriesSlug);
    });

    var containers = scope.querySelectorAll ? scope.querySelectorAll('.post-meta-tags') : [];
    Array.prototype.slice.call(containers).forEach(function (container) {
        if (!container.querySelector('.post-tag')) {
            container.remove();
        }
    });

    var posts = scope.querySelectorAll ? scope.querySelectorAll('article.post') : [];
    Array.prototype.slice.call(posts).forEach(function (postEl) {
        if (!postEl || !postEl.className) {
            return;
        }

        var match = postEl.className.match(/(?:^|\s)tag-hash-series-([a-z0-9-]+)(?:\s|$)/i);
        if (!match || !match[1]) {
            return;
        }

        var seriesSlug = match[1].toLowerCase();
        var metaEl = postEl.querySelector('.post-meta');
        if (!metaEl) {
            return;
        }

        var tagsWrap = metaEl.querySelector('.post-meta-tags');
        if (!tagsWrap) {
            tagsWrap = document.createElement('span');
            tagsWrap.className = 'post-meta-item post-meta-tags';
            metaEl.appendChild(tagsWrap);
        }

        var exists = tagsWrap.querySelector('a.post-tag.is-internal-series[href="/series/?series=' + seriesSlug + '"]');
        if (exists) {
            return;
        }

        var link = document.createElement('a');
        link.className = 'post-tag post-tag-hash-series-' + seriesSlug + ' is-internal-series';
        link.setAttribute('href', '/series/?series=' + encodeURIComponent(seriesSlug));
        link.setAttribute('title', seriesSlug);
        link.textContent = seriesSlug;
        tagsWrap.appendChild(link);
    });
}

function cover() {
    'use strict';

    var image = $('.cover-image');
    if (!image) return;

    image.imagesLoaded(function () {
        $('.site-cover').addClass('initialized');
    });
}

function renderAyuPagination() {
    'use strict';

    var paginations = document.querySelectorAll('.js-ayu-pagination');

    if (!paginations.length) {
        return;
    }

    paginations.forEach(function (paginationEl) {
        var currentPage = parseInt(paginationEl.getAttribute('data-current-page'), 10);
        var totalPages = parseInt(paginationEl.getAttribute('data-total-pages'), 10);

        if (!currentPage || !totalPages || totalPages < 2) {
            paginationEl.innerHTML = '';
            return;
        }

        var path = window.location.pathname;
        var basePath = path.replace(/\/page\/\d+\/?$/, '/');
        if (!basePath.endsWith('/')) {
            basePath += '/';
        }

        function pageUrl(page) {
            if (page === 1) {
                return basePath;
            }

            return basePath + 'page/' + page + '/';
        }

        var html = [];

        if (currentPage > 1) {
            html.push('<a class="ayu-page-link" href="' + pageUrl(currentPage - 1) + '">&lt;</a>');
        }

        for (var page = 1; page <= totalPages; page += 1) {
            if (page === currentPage) {
                html.push('<span class="ayu-page-link is-active" aria-current="page">' + page + '</span>');
            } else {
                html.push('<a class="ayu-page-link" href="' + pageUrl(page) + '">' + page + '</a>');
            }
        }

        if (currentPage < totalPages) {
            html.push('<a class="ayu-page-link" href="' + pageUrl(currentPage + 1) + '">&gt;</a>');
        }

        paginationEl.innerHTML = html.join('');
    });
}

function themeToggle() {
    'use strict';

    var root = document.documentElement;
    var toggles = document.querySelectorAll('.js-theme-toggle');
    var storageKey = 'theme-preference';

    if (!toggles.length) {
        return;
    }

    function setTheme(theme) {
        var nextTheme = theme === 'dark' ? 'dark' : 'light';
        var isDark = nextTheme === 'dark';

        root.setAttribute('data-theme', nextTheme);
        root.classList.toggle('theme-dark', isDark);

        toggles.forEach(function (toggle) {
            toggle.setAttribute('aria-pressed', isDark ? 'true' : 'false');
            toggle.textContent = isDark ? 'Light' : 'Dark';
            toggle.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
        });
    }

    var savedTheme = null;
    try {
        savedTheme = localStorage.getItem(storageKey);
    } catch (error) {
        savedTheme = null;
    }

    setTheme(savedTheme === 'dark' ? 'dark' : (root.getAttribute('data-theme') || 'light'));


    toggles.forEach(function (toggle) {
        toggle.addEventListener('click', function () {
            var nextTheme = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            setTheme(nextTheme);

            try {
                localStorage.setItem(storageKey, nextTheme);
            } catch (error) {
                // Ignore storage errors in restricted environments.
            }
        });
    });
}


function renderSearchPage() {
    'use strict';

    var SEARCH_PAGE_SIZE = 10;

    var isSearchPage = /^\/search\/?$/.test(window.location.pathname);
    if (!isSearchPage) {
        return;
    }

    var formEl = document.querySelector('.search-form');
    var inputEl = document.getElementById('search-input');
    var stateEl = document.getElementById('search-state');
    var resultsEl = document.getElementById('search-results');
    var paginationEl = document.getElementById('search-pagination');

    if (!formEl || !inputEl || !stateEl || !resultsEl) {
        return;
    }

    var keyScript = document.querySelector('script[data-key]');
    var contentKey = keyScript ? keyScript.getAttribute('data-key') : '';

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatDate(value) {
        if (!value) {
            return '';
        }

        return new Date(value).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).toUpperCase();
    }

    function postUrl(post) {
        if (post.url) {
            return post.url;
        }

        return '/' + encodeURIComponent(post.slug || '') + '/';
    }

    function buildPostHtml(post) {
        var title = escapeHtml(post.title || 'Untitled');
        var excerptText = post.custom_excerpt || post.excerpt || '';
        var excerpt = excerptText ? '<div class="post-excerpt">' + escapeHtml(excerptText) + '</div>' : '';
        var dateIso = post.published_at ? post.published_at.substring(0, 10) : '';
        var dateText = post.published_at ? formatDate(post.published_at) : '';
        var tagsHtml = (post.tags || []).filter(function (tag) {
            var slug = tag && tag.slug ? tag.slug : '';
            return slug.indexOf('hash-') !== 0 || slug.indexOf('hash-series-') === 0;
        }).slice(0, 3).map(function (tag) {
            var slug = tag && tag.slug ? tag.slug : '';
            var name = tag && tag.name ? tag.name : '';
            var href = '/tag/' + encodeURIComponent(slug) + '/';
            var cls = 'post-tag post-tag-' + escapeHtml(slug);
            var displayName = name;

            if (slug.indexOf('hash-series-') === 0) {
                href = '/series/?series=' + encodeURIComponent(slug.substring('hash-series-'.length));
                cls += ' is-internal-series';
                if (displayName.indexOf('#series-') === 0) {
                    displayName = displayName.substring('#series-'.length);
                }
            }

            return '<a class="' + cls + '" href="' + href + '" title="' + escapeHtml(name) + '">' + escapeHtml(displayName) + '</a>';
        }).join('');

        var mediaHtml;
        if (post.feature_image) {
            mediaHtml = '<img class="post-image lazyload u-object-fit" src="' + escapeHtml(post.feature_image) + '" alt="' + title + '">';
        } else {
            mediaHtml = '<span class="letter">' + escapeHtml((post.title || '?').charAt(0)) + '</span>';
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

    function setState(text, type) {
        stateEl.textContent = text;
        stateEl.setAttribute('data-state', type || 'idle');
    }

    function setUrlQuery(query, page) {
        var next = new URL(window.location.href);
        if (query) {
            next.searchParams.set('q', query);
        } else {
            next.searchParams.delete('q');
        }

        if (page && page > 1) {
            next.searchParams.set('page', String(page));
        } else {
            next.searchParams.delete('page');
        }

        window.history.replaceState({}, '', next.pathname + (next.searchParams.toString() ? '?' + next.searchParams.toString() : ''));
    }

    function buildPaginationHtml(currentPage, totalPages) {
        if (totalPages < 2) {
            return '';
        }

        var html = [];
        if (currentPage > 1) {
            html.push('<button class="ayu-page-link" type="button" data-search-page="' + String(currentPage - 1) + '">&lt;</button>');
        }

        for (var page = 1; page <= totalPages; page += 1) {
            if (page === currentPage) {
                html.push('<span class="ayu-page-link is-active" aria-current="page">' + String(page) + '</span>');
            } else {
                html.push('<button class="ayu-page-link" type="button" data-search-page="' + String(page) + '">' + String(page) + '</button>');
            }
        }

        if (currentPage < totalPages) {
            html.push('<button class="ayu-page-link" type="button" data-search-page="' + String(currentPage + 1) + '">&gt;</button>');
        }

        return html.join('');
    }

    var currentResults = [];
    var currentQuery = '';

    function renderResultPage(page) {
        if (!currentResults.length || !currentQuery) {
            resultsEl.innerHTML = '';
            if (paginationEl) {
                paginationEl.innerHTML = '';
            }
            return;
        }

        var totalPages = Math.max(1, Math.ceil(currentResults.length / SEARCH_PAGE_SIZE));
        var safePage = page;

        if (!safePage || safePage < 1) {
            safePage = 1;
        }
        if (safePage > totalPages) {
            safePage = totalPages;
        }

        var start = (safePage - 1) * SEARCH_PAGE_SIZE;
        var end = start + SEARCH_PAGE_SIZE;
        var pagePosts = currentResults.slice(start, end);

        resultsEl.innerHTML = pagePosts.map(buildPostHtml).join('');
        injectPromoSlots(resultsEl);
        normalizeInternalPostTags(resultsEl);

        if (paginationEl) {
            paginationEl.innerHTML = buildPaginationHtml(safePage, totalPages);
        }

        setState(currentResults.length + ' results found. Page ' + safePage + ' of ' + totalPages + '.', 'success');
        setUrlQuery(currentQuery, safePage);
    }

    function runSearch(raw, page) {
        var query = (raw || '').trim();

        if (query.length < 2) {
            currentResults = [];
            currentQuery = '';
            resultsEl.innerHTML = '';
            if (paginationEl) {
                paginationEl.innerHTML = '';
            }
            setUrlQuery('');
            setState('Enter a query and press Search.', 'idle');
            return Promise.resolve();
        }

        if (!contentKey) {
            currentResults = [];
            currentQuery = '';
            resultsEl.innerHTML = '';
            if (paginationEl) {
                paginationEl.innerHTML = '';
            }
            setState('Search unavailable: missing content API key.', 'error');
            return Promise.resolve();
        }

        setState('Searching...', 'loading');

        var apiUrl = '/ghost/api/content/posts/?key=' + encodeURIComponent(contentKey) + '&include=tags,authors&fields=id,title,slug,url,published_at,excerpt,custom_excerpt,feature_image,feature_image_alt&limit=all';

        return fetch(apiUrl)
            .then(function (res) {
                if (!res.ok) {
                    throw new Error('Failed to search posts');
                }
                return res.json();
            })
            .then(function (data) {
                var allPosts = data && data.posts ? data.posts : [];
                var keyword = query.toLowerCase();
                var posts = allPosts.filter(function (post) {
                    var title = (post.title || '').toLowerCase();
                    var excerpt = (post.excerpt || '').toLowerCase();
                    var customExcerpt = (post.custom_excerpt || '').toLowerCase();
                    return title.indexOf(keyword) !== -1 || excerpt.indexOf(keyword) !== -1 || customExcerpt.indexOf(keyword) !== -1;
                });

                if (!posts.length) {
                    currentResults = [];
                    currentQuery = query;
                    resultsEl.innerHTML = '';
                    if (paginationEl) {
                        paginationEl.innerHTML = '';
                    }
                    setUrlQuery(query);
                    setState('No results found.', 'empty');
                    return;
                }

                currentResults = posts;
                currentQuery = query;
                renderResultPage(page || 1);
            })
            .catch(function () {
                currentResults = [];
                currentQuery = query;
                resultsEl.innerHTML = '';
                if (paginationEl) {
                    paginationEl.innerHTML = '';
                }
                setState('Search failed. Please try again.', 'error');
            });
    }

    formEl.addEventListener('submit', function (event) {
        event.preventDefault();
        runSearch(inputEl.value, 1);
    });

    if (paginationEl) {
        paginationEl.addEventListener('click', function (event) {
            var target = event.target;
            if (!target || !target.hasAttribute('data-search-page')) {
                return;
            }

            var nextPage = parseInt(target.getAttribute('data-search-page'), 10);
            if (!nextPage || nextPage < 1) {
                return;
            }

            renderResultPage(nextPage);
        });
    }

    var urlSearch = new URLSearchParams(window.location.search);
    var initialQuery = urlSearch.get('q') || '';
    var initialPage = parseInt(urlSearch.get('page') || '1', 10);
    inputEl.value = initialQuery;

    if (initialQuery.trim().length >= 2) {
        runSearch(initialQuery, initialPage);
    } else {
        setState('Enter a query and press Search.', 'idle');
    }
}

function player() {
    'use strict';
    var player = jQuery('.player');
    var playerAudio = jQuery('.player-audio');
    var playerProgress = jQuery('.player-progress');
    var timeCurrent = jQuery('.player-time-current');
    var timeDuration = jQuery('.player-time-duration');
    var playButton = jQuery('.button-play');
    var backwardButton = jQuery('.player-backward');
    var forwardButton = jQuery('.player-forward');
    var playerSpeed = 1;
    var speedButton = jQuery('.player-speed');

    jQuery('.site').on('click', '.js-play', function () {
        var clicked = jQuery(this);

        if (clicked.hasClass('post-play')) {
            var episode = clicked.closest('.post');
            if (player.attr('data-playing') !== episode.attr('data-id')) {
                playerAudio.attr('src', episode.attr('data-url'));
                jQuery('.post[data-id="' + player.attr('data-playing') + '"]').find('.post-play').removeClass('playing');
                player.attr('data-playing', episode.attr('data-id'));
                player.find('.post-image').attr('src', episode.find('.post-image').attr('src'));
                player.find('.post-title').text(episode.find('.post-title').text());
                player.find('.post-meta time').attr('datetime', episode.find('.post-meta-date time').attr('datetime'));
                player.find('.post-meta time').text(episode.find('.post-meta-date time').text());
            }
        }

        if (playerAudio[0].paused) {
            var playPromise = playerAudio[0].play();
            if (playPromise !== undefined) {
                playPromise
                    .then(function () {
                        clicked.addClass('playing');
                        playButton.addClass('playing');
                        jQuery('.post[data-id="' + player.attr('data-playing') + '"]').find('.post-play').addClass('playing');
                        jQuery('body').addClass('player-opened');
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }
        } else {
            playerAudio[0].pause();
            clicked.removeClass('playing');
            playButton.removeClass('playing');
            jQuery('.post[data-id="' + player.attr('data-playing') + '"]').find('.post-play').removeClass('playing');
        }
    });

    playerAudio.on('timeupdate', function () {
        const duration = isNaN(playerAudio[0].duration) ? 0 : playerAudio[0].duration;
        timeDuration.text(
            new Date(duration * 1000).toISOString().substring(11, 19)
        );
        playerAudio[0].addEventListener('timeupdate', function (e) {
            timeCurrent.text(
                new Date(e.target.currentTime * 1000)
                    .toISOString()
                    .substring(11, 19)
            );
            playerProgress.css(
                'width',
                (e.target.currentTime / playerAudio[0].duration) * 100 + '%'
            );
        });
    });

    backwardButton.on('click', function () {
        playerAudio[0].currentTime = playerAudio[0].currentTime - 10;
    });

    forwardButton.on('click', function () {
        playerAudio[0].currentTime = playerAudio[0].currentTime + 30;
    });

    speedButton.on('click', function () {
        if (playerSpeed < 2) {
            playerSpeed += 0.5;
        } else {
            playerSpeed = 1;
        }

        playerAudio[0].playbackRate = playerSpeed;
        speedButton.text(playerSpeed + 'x');
    });
}




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

    var keyScript = document.querySelector('script[data-key]');
    var contentKey = keyScript ? keyScript.getAttribute('data-key') : '';

    if (!contentKey) {
        featuredGrid.innerHTML = '<div class="term-empty">Failed to load categories.</div>';
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
        var desc = tagInfo.description ? escapeHtml(tagInfo.description) : 'Primary category archive';
        var initial = escapeHtml((tagInfo.name || '?').charAt(0));

        return [
            '<article class="post category-post">',
            '<div class="post-media">',
            '<div class="u-placeholder square">',
            '<a href="/tag/',
            encodeURIComponent(tagInfo.slug),
            '/">',
            '<span class="letter">',
            initial,
            '</span>',
            '</a>',
            '</div>',
            '</div>',
            '<div class="post-wrapper">',
            '<header class="post-header">',
            '<div class="post-meta"><span class="post-tag">Primary</span> | ',
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

    function fetchAllPrimaryTags(page, tagMap) {
        var apiUrl = [
            '/ghost/api/content/posts/?key=',
            encodeURIComponent(contentKey),
            '&include=tags&limit=100&page=',
            String(page),
            '&fields=id,slug,title'
        ].join('');

        return fetch(apiUrl)
            .then(function (res) {
                if (!res.ok) {
                    throw new Error('Failed to fetch posts for categories');
                }
                return res.json();
            })
            .then(function (data) {
                (data.posts || []).forEach(function (post) {
                    var primaryTag = post.primary_tag || (post.tags && post.tags.length ? post.tags[0] : null);
                    if (!primaryTag || primaryTag.visibility !== 'public' || !primaryTag.slug) {
                        return;
                    }

                    if (!tagMap[primaryTag.slug]) {
                        tagMap[primaryTag.slug] = {
                            slug: primaryTag.slug,
                            name: primaryTag.name || primaryTag.slug,
                            description: primaryTag.description || '',
                            count: 0
                        };
                    }

                    tagMap[primaryTag.slug].count += 1;
                });

                var pages = data.meta && data.meta.pagination ? data.meta.pagination.pages : 1;
                if (page < pages) {
                    return fetchAllPrimaryTags(page + 1, tagMap);
                }

                return tagMap;
            });
    }

    fetchAllPrimaryTags(1, {})
        .then(function (tagMap) {
            var tags = Object.keys(tagMap).map(function (slug) {
                return tagMap[slug];
            });

            if (!tags.length) {
                featuredGrid.innerHTML = '<div class="term-empty">nothing happened</div>';
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
        .catch(function () {
            featuredGrid.innerHTML = '<div class="term-empty">Failed to load categories.</div>';
            listGrid.innerHTML = '';
        });
}


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
        if (tagSlug && tagSlug.indexOf('hash-series-') === 0) {
            return tagSlug.substring('hash-series-'.length);
        }

        return tagSlug || '';
    }

    function displayName(name, slug) {
        if (name && name.indexOf('#series-') === 0) {
            return name.substring('#series-'.length);
        }

        if (name && name.indexOf('series-') === 0) {
            return name.substring('series-'.length);
        }

        if (slug && slug.indexOf('hash-series-') === 0) {
            return slug.substring('hash-series-'.length);
        }

        return name || slug || 'series';
    }

    function seriesCardHtml(tagInfo) {
        var title = displayName(tagInfo.name, tagInfo.slug);
        var desc = tagInfo.description ? escapeHtml(tagInfo.description) : 'Series archive';
        var initial = escapeHtml((title || '?').charAt(0));
        var detailSlug = seriesSlugFromTagSlug(tagInfo.slug);

        return [
            '<article class="post category-post">',
            '<div class="post-media">',
            '<div class="u-placeholder square">',
            '<a href="/series/?series=',
            encodeURIComponent(detailSlug),
            '">',
            '<span class="letter">',
            initial,
            '</span>',
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
            var tags = (data.tags || []).filter(function (tag) {
                return tag && tag.slug && tag.slug.indexOf('hash-series-') === 0;
            }).map(function (tag) {
                return {
                    slug: tag.slug,
                    name: tag.name || '',
                    description: tag.description || '',
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
    var featuredSection = document.getElementById('series-detail-featured-section');
    var featuredFeed = document.getElementById('series-detail-featured-feed');
    var listSection = document.getElementById('series-detail-list-section');
    var postFeed = document.getElementById('series-detail-post-feed');
    var paginationEl = document.getElementById('series-detail-pagination');

    if (!headerEl || !nameEl || !descEl || !featuredSection || !featuredFeed || !listSection || !postFeed || !paginationEl) {
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
        if (!tag) {
            return detailSlug;
        }

        if (tag.name && tag.name.indexOf('#series-') === 0) {
            return tag.name.substring('#series-'.length);
        }

        if (tag.name && tag.name.indexOf('series-') === 0) {
            return tag.name.substring('series-'.length);
        }

        return tag.name || detailSlug;
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
        var tagsHtml = (post.tags || []).filter(function (tag) {
            var tagSlug = tag && tag.slug ? tag.slug : '';
            return tagSlug.indexOf('hash-') !== 0 || tagSlug.indexOf('hash-series-') === 0;
        }).map(function (tag) {
            var tagSlug = tag && tag.slug ? tag.slug : '';
            var tagName = tag && tag.name ? tag.name : '';
            var href = '/tag/' + encodeURIComponent(tagSlug) + '/';
            var isSeriesInternal = tagSlug.indexOf('hash-series-') === 0;
            var displayTagName = tagName;
            var tagClass = 'post-tag post-tag-' + escapeHtml(tagSlug);

            if (isSeriesInternal) {
                href = '/series/?series=' + encodeURIComponent(tagSlug.substring('hash-series-'.length));

                if (displayTagName.indexOf('#series-') === 0) {
                    displayTagName = displayTagName.substring('#series-'.length);
                } else if (displayTagName.indexOf('series-') === 0) {
                    displayTagName = displayTagName.substring('series-'.length);
                } else {
                    displayTagName = tagSlug.substring('hash-series-'.length);
                }

                tagClass += ' is-internal-series';
            }

            return '<a class="' + tagClass + '" href="' + href + '" title="' + escapeHtml(tagName) + '">' + escapeHtml(displayTagName) + '</a>';
        }).join('');
        var mediaHtml;

        if (post.feature_image) {
            mediaHtml = '<img class="post-image lazyload u-object-fit" src="' + escapeHtml(post.feature_image) + '" alt="' + title + '">';
        } else {
            mediaHtml = '<span class="letter">' + escapeHtml((post.title || '?').charAt(0)) + '</span>';
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
    var featuredUrl = '/ghost/api/content/posts/?key=' + encodeURIComponent(contentKey) + '&include=tags,authors&filter=tag:' + encodeURIComponent(internalSlug) + '+featured:true&limit=1';
    var postsUrl = '/ghost/api/content/posts/?key=' + encodeURIComponent(contentKey) + '&include=tags,authors&filter=tag:' + encodeURIComponent(internalSlug) + '&limit=10&page=' + String(page);

    Promise.all([
        fetch(tagUrl).then(function (res) { return res.ok ? res.json() : null; }),
        fetch(featuredUrl).then(function (res) { return res.ok ? res.json() : null; }),
        fetch(postsUrl).then(function (res) { return res.ok ? res.json() : null; })
    ])
        .then(function (results) {
            var tagData = results[0] && results[0].tags ? results[0].tags[0] : null;
            var featuredPosts = results[1] && results[1].posts ? results[1].posts : [];
            var postData = results[2] && results[2].posts ? results[2].posts : [];
            var pagination = results[2] && results[2].meta && results[2].meta.pagination ? results[2].meta.pagination : { page: 1, pages: 1 };

            if (!tagData) {
                nameEl.textContent = 'Series not found';
                descEl.textContent = '';
                featuredFeed.innerHTML = '<div class="term-empty">Series not found.</div>';
                postFeed.innerHTML = '';
                paginationEl.innerHTML = '';
                return;
            }

            nameEl.textContent = toDisplayName(tagData);
            descEl.textContent = tagData.description || '';
            if (!tagData.description) {
                descEl.style.display = 'none';
            }

            if (tagData.feature_image && !headerEl.querySelector('.tag-header-image-wrap')) {
                var imgWrap = document.createElement('div');
                imgWrap.className = 'tag-header-image-wrap';
                imgWrap.innerHTML = '<img class="tag-header-image" src="' + escapeHtml(tagData.feature_image) + '" alt="' + escapeHtml(nameEl.textContent) + '">';
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
            featuredFeed.innerHTML = '<div class="term-empty">Failed to load series.</div>';
            postFeed.innerHTML = '';
            paginationEl.innerHTML = '';
        });
}







