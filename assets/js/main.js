function bootstrapAyuTheme() {
    'use strict';

    cover();
    player();
    themeToggle();
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

var AYU_DEFAULT_IMAGES = {
    POST: '/assets/images/fallback/post-default.png',
    PRIMARY_TAG: '/assets/images/fallback/primary-tag-default.png',
    SERIES_TAG: '/assets/images/fallback/series-tag-default.png',
    SECONDARY_TAG: '/assets/images/fallback/secondary-tag-default.png'
};

var AYU_GLOBALS = {
    PAGINATION_PAGE_SIZE: 10,
    PROMO_INSERT_EVERY: 5,
    MOBILE_BREAKPOINT: 767
};

var AYU_TAG_PREFIX = {
    CATEGORY: 'category-',
    SERIES: 'series-'
};

var AYU_TAXONOMY = {
    ROLE: {
        CATEGORY: 'category',
        SERIES: 'series',
        TOPIC: 'topic'
    },
    ROLE_CLASS: {
        category: ['is-primary-tag', 'tag-category'],
        series: ['is-series-tag', 'tag-series'],
        topic: ['is-secondary-tag', 'tag-topic']
    }
};

var AYU_USER_MESSAGES = {
    HUB_LOADING: 'Loading content...',
    HUB_LOAD_FAILED: 'Content could not be loaded. Please try again later.',
    SEARCH_UNAVAILABLE: 'Search is currently unavailable. Please try again later.'
};

function resolveTaxonomyRoleFromSlug(slug) {
    'use strict';

    if (AYU_TAG_UTILS.isCategoryTag(slug)) {
        return AYU_TAXONOMY.ROLE.CATEGORY;
    }

    if (AYU_TAG_UTILS.isSeriesTag(slug)) {
        return AYU_TAXONOMY.ROLE.SERIES;
    }

    return AYU_TAXONOMY.ROLE.TOPIC;
}

function applyTaxonomyRoleClasses(tagEl, role) {
    'use strict';

    var classes = AYU_TAXONOMY.ROLE_CLASS[role] || AYU_TAXONOMY.ROLE_CLASS.topic;
    classes.forEach(function (className) {
        tagEl.classList.add(className);
    });
}

function buildLoadingStateHtml(message) {
    'use strict';

    return '<div class="term-loading" role="status" aria-live="polite">' + String(message || AYU_USER_MESSAGES.HUB_LOADING) + '</div>';
}

function buildSkeletonCards(count) {
    'use strict';

    var size = typeof count === 'number' && count > 0 ? count : 3;
    var html = [];
    var i;

    for (i = 0; i < size; i += 1) {
        html.push('<div class="term-skeleton-card" aria-hidden="true"></div>');
    }

    return '<div class="term-skeleton-grid">' + html.join('') + '</div>';
}

function getAyuContentApiKey() {
    'use strict';

    var themeScript = document.querySelector('#ayu-content-key');
    var themeKey = themeScript ? String(themeScript.getAttribute('data-key') || '').trim() : '';
    if (themeKey) {
        return themeKey;
    }

    // Fallback for Ghost-provided runtime scripts (Portal / Sodo Search).
    var runtimeScript = document.querySelector('script[data-api*="/ghost/api/content/"][data-key], script[src*="portal"][data-key], script[src*="sodo-search"][data-key]');
    var runtimeKey = runtimeScript ? String(runtimeScript.getAttribute('data-key') || '').trim() : '';

    return runtimeKey;
}

function buildTermErrorHtml(message) {
    'use strict';

    return '<div class="term-empty">' + String(message || AYU_USER_MESSAGES.HUB_LOAD_FAILED) + '</div>';
}

function buildTermErrorListItemHtml(message) {
    'use strict';

    return '<li class="term-empty">' + String(message || AYU_USER_MESSAGES.HUB_LOAD_FAILED) + '</li>';
}

function logAyuWarning(message, error) {
    'use strict';

    if (error) {
        console.error('[Ayu Theme] ' + String(message), error);
        return;
    }

    console.warn('[Ayu Theme] ' + String(message));
}

// Taxonomy helpers (Category / Series / Topic) based on slug prefixes.
var AYU_TAG_UTILS = {
    getSlug: function (tag) {
        if (!tag) {
            return '';
        }

        if (typeof tag === 'string') {
            return tag;
        }

        return tag.slug || '';
    },
    isPublicTag: function (tag) {
        var slug = this.getSlug(tag);
        if (!slug) {
            return false;
        }

        if (!tag || typeof tag === 'string' || typeof tag.visibility === 'undefined') {
            return true;
        }

        return tag.visibility === 'public';
    },
    isCategoryTag: function (tag) {
        var slug = this.getSlug(tag);
        return slug.indexOf(AYU_TAG_PREFIX.CATEGORY) === 0;
    },
    isSeriesTag: function (tag) {
        var slug = this.getSlug(tag);
        return slug.indexOf(AYU_TAG_PREFIX.SERIES) === 0;
    },
    isTopicTag: function (tag) {
        return this.isPublicTag(tag) && !this.isCategoryTag(tag) && !this.isSeriesTag(tag);
    },
    // Backward-compatible alias; prefer isTopicTag in new code.
    isSecondaryTag: function (tag) {
        return this.isTopicTag(tag);
    },
    extractSeriesSlug: function (tag) {
        var slug = this.getSlug(tag);
        if (slug.indexOf(AYU_TAG_PREFIX.SERIES) === 0) {
            return slug.substring(AYU_TAG_PREFIX.SERIES.length);
        }

        return slug;
    },
    getDisplayName: function (tag, fallback) {
        var rawName = tag && typeof tag === 'object' && tag.name ? String(tag.name).trim() : '';
        if (rawName) {
            return rawName;
        }

        var slug = this.getSlug(tag) || String(fallback || '');
        var normalized = slug;

        if (normalized.indexOf(AYU_TAG_PREFIX.CATEGORY) === 0) {
            normalized = normalized.substring(AYU_TAG_PREFIX.CATEGORY.length);
        } else if (normalized.indexOf(AYU_TAG_PREFIX.SERIES) === 0) {
            normalized = normalized.substring(AYU_TAG_PREFIX.SERIES.length);
        }

        normalized = normalized.replace(/-/g, ' ').trim();
        if (!normalized) {
            normalized = 'Untitled';
        }

        return normalized.split(/\s+/).map(function (word) {
            return word.charAt(0).toUpperCase() + word.substring(1);
        }).join(' ');
    },
    classifyPostTags: function (post) {
        var self = this;
        var allTags = Array.isArray(post && post.tags) ? post.tags.filter(function (tag) {
            return self.isPublicTag(tag);
        }) : [];

        function dedupeBySlug(items) {
            var seen = {};
            return items.filter(function (tag) {
                var slug = self.getSlug(tag);
                if (!slug || seen[slug]) {
                    return false;
                }

                seen[slug] = true;
                return true;
            });
        }

        var categoryTags = dedupeBySlug(allTags.filter(function (tag) {
            return self.isCategoryTag(tag);
        }));
        var seriesTags = dedupeBySlug(allTags.filter(function (tag) {
            return self.isSeriesTag(tag);
        }));
        var secondaryTags = dedupeBySlug(allTags.filter(function (tag) {
            return self.isTopicTag(tag);
        }));

        var ordered = categoryTags.concat(seriesTags, secondaryTags);

        return {
            primary: categoryTags.length ? categoryTags[0] : null,
            categories: categoryTags,
            series: seriesTags,
            secondary: secondaryTags,
            ordered: ordered
        };
    }
};
function buildPostTagsHtml(post, escapeHtml, maxCount) {
    'use strict';

    var classified = AYU_TAG_UTILS.classifyPostTags(post);
    var tags = classified.ordered;

    if (typeof maxCount === 'number' && maxCount >= 0) {
        tags = tags.slice(0, maxCount);
    }

    return tags.map(function (tag) {
        var slug = AYU_TAG_UTILS.getSlug(tag);
        var href = '/tag/' + encodeURIComponent(slug) + '/';
        var cls = 'post-tag post-tag-' + escapeHtml(slug);
        var displayName = AYU_TAG_UTILS.getDisplayName(tag, slug);
        var role = resolveTaxonomyRoleFromSlug(slug);
        var roleClasses = AYU_TAXONOMY.ROLE_CLASS[role] || AYU_TAXONOMY.ROLE_CLASS.topic;
        cls += ' ' + roleClasses.join(' ');

        return '<a class="' + cls + '" href="' + href + '" title="' + escapeHtml(displayName) + '">' + escapeHtml(displayName) + '</a>';
    }).join('');
}
function getAdSlotConfig(slotType) {
    'use strict';

    var configs = {
        'list-inline': {
            wrapperTag: 'article',
            wrapperClass: 'post post-promo ayu-ad-slot ayu-ad-slot--list-inline',
            label: 'Promo',
            copy: 'This is a promo slot.'
        },
        'post-top': {
            wrapperTag: 'aside',
            wrapperClass: 'post-ad-slot ayu-ad-slot ayu-ad-slot--post-top',
            label: 'Sponsored',
            copy: 'Reserved area for post top advertisement.'
        },
        'post-bottom': {
            wrapperTag: 'aside',
            wrapperClass: 'post-ad-slot ayu-ad-slot ayu-ad-slot--post-bottom',
            label: 'Sponsored',
            copy: 'Reserved area for post bottom advertisement.'
        }
    };

    return configs[slotType] || configs['list-inline'];
}

function buildAdSlotInnerHtml(slotType) {
    'use strict';

    var config = getAdSlotConfig(slotType);

    return [
        '<div class="post-wrapper post-promo-wrapper">',
        '<div class="post-promo-label">',
        config.label,
        '</div>',
        '<p class="post-promo-copy">',
        config.copy,
        '</p>',
        '</div>'
    ].join('');
}

function createAdSlotElement(slotType) {
    'use strict';

    var config = getAdSlotConfig(slotType);
    var element = document.createElement(config.wrapperTag);

    element.className = config.wrapperClass;
    element.setAttribute('aria-label', 'Advertisement');
    element.setAttribute('data-ad-slot-rendered', slotType);
    element.innerHTML = buildAdSlotInnerHtml(slotType);

    return element;
}

function renderAdSlots(root) {
    'use strict';

    var scope = root || document;
    if (!scope || !scope.querySelectorAll) {
        return;
    }

    var slots = Array.prototype.slice.call(scope.querySelectorAll('.js-ad-slot[data-ad-slot]'));
    slots.forEach(function (slot) {
        var slotType = slot.getAttribute('data-ad-slot');
        if (!slotType || slot.getAttribute('data-ad-slot-rendered')) {
            return;
        }

        slot.classList.add('ayu-ad-slot');
        slot.classList.add('ayu-ad-slot--' + slotType);
        slot.setAttribute('aria-label', 'Advertisement');
        slot.setAttribute('data-ad-slot-rendered', slotType);
        slot.innerHTML = buildAdSlotInnerHtml(slotType);
    });
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
            if (el.classList && el.classList.contains('ayu-ad-slot--list-inline')) {
                el.remove();
            }
        });

        var posts = Array.prototype.slice.call(feed.children).filter(function (el) {
            return el.classList && el.classList.contains('post') && !el.classList.contains('ayu-ad-slot--list-inline');
        });

        posts.forEach(function (postEl, index) {
            var visibleIndex = index + 1;
            if (visibleIndex % AYU_GLOBALS.PROMO_INSERT_EVERY !== 0) {
                return;
            }

            var promoNode = createAdSlotElement('list-inline');
            postEl.insertAdjacentElement('afterend', promoNode);
        });
    });
}
function normalizePostTaxonomyTags(root) {
    'use strict';

    var scope = root || document;
    var tags = scope.querySelectorAll ? scope.querySelectorAll('.post-meta-tags .post-tag, .post-meta .post-tag') : [];

    Array.prototype.slice.call(tags).forEach(function (tagEl) {
        if (!tagEl || !tagEl.getAttribute) {
            return;
        }

        var href = tagEl.getAttribute('href') || '';
        var cls = tagEl.className || '';
        var slug = tagEl.getAttribute('data-tag-slug') || '';
        var tagName = tagEl.getAttribute('data-tag-name') || '';

        if (!slug) {
            var slugMatch = cls.match(/(?:^|\s)post-tag-([^\s]+)/);
            slug = slugMatch ? slugMatch[1] : '';
        }

        if (!slug && href.indexOf('/tag/') !== -1) {
            var path = href.split('?')[0];
            var m = path.match(/\/tag\/([^/]+)\/?$/);
            slug = m ? decodeURIComponent(m[1]) : '';
        }

        var visibility = (tagEl.getAttribute('data-tag-visibility') || '').trim();
        var isPublic = visibility ? visibility === 'public' : AYU_TAG_UTILS.isPublicTag(slug);
        if (!isPublic) {
            tagEl.remove();
            return;
        }

        var role = (tagEl.getAttribute('data-taxonomy-role') || '').trim();
        if (!role) {
            role = resolveTaxonomyRoleFromSlug(slug);
            tagEl.setAttribute('data-taxonomy-role', role);
        }

        if (!tagEl.classList.contains('is-primary-tag') && !tagEl.classList.contains('is-series-tag') && !tagEl.classList.contains('is-secondary-tag')) {
            applyTaxonomyRoleClasses(tagEl, role);
        }

        if (!slug) {
            return;
        }

        var renderedMode = tagEl.getAttribute('data-taxonomy-rendered') || '';
        if (renderedMode === 'server') {
            if (!tagEl.getAttribute('title')) {
                tagEl.setAttribute('title', (tagEl.textContent || '').trim());
            }
            return;
        }

        applyTaxonomyRoleClasses(tagEl, role);

        tagEl.setAttribute('href', '/tag/' + encodeURIComponent(slug) + '/');

        var displayName = AYU_TAG_UTILS.getDisplayName({
            slug: slug,
            name: tagName
        }, slug);
        tagEl.textContent = displayName;
        tagEl.setAttribute('title', displayName);
    });

    var containers = scope.querySelectorAll ? scope.querySelectorAll('.post-meta-tags') : [];
    Array.prototype.slice.call(containers).forEach(function (container) {
        if (!container.querySelector('.post-tag')) {
            container.remove();
        }
    });
}
function normalizeTagHeaderName(root) {
    'use strict';

    var isTagPage = /^\/tag\/([^/]+)\/?$/.exec(window.location.pathname);
    if (!isTagPage || !isTagPage[1]) {
        return;
    }

    var slug = decodeURIComponent(isTagPage[1]);
    if (!AYU_TAG_UTILS.isCategoryTag(slug) && !AYU_TAG_UTILS.isSeriesTag(slug)) {
        return;
    }

    var scope = root || document;
    var titleEl = scope.querySelector ? scope.querySelector('.term-name') : null;
    if (!titleEl) {
        return;
    }

    var currentName = (titleEl.textContent || '').trim();
    titleEl.textContent = AYU_TAG_UTILS.getDisplayName({
        slug: slug,
        name: currentName
    }, slug);
}
function cover() {
    'use strict';

    var image = document.querySelector('.cover-image');
    var coverEl = document.querySelector('.site-cover');

    if (!image || !coverEl) {
        return;
    }

    function markInitialized() {
        coverEl.classList.add('initialized');
    }

    if (image.complete) {
        markInitialized();
        return;
    }

    image.addEventListener('load', markInitialized, { once: true });
    image.addEventListener('error', markInitialized, { once: true });
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

    var SEARCH_PAGE_SIZE = AYU_GLOBALS.PAGINATION_PAGE_SIZE;
    var SEARCH_HINT_TEXT = 'Search titles and excerpts (2+ characters).';

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

    var contentKey = getAyuContentApiKey();

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
        var tagsHtml = buildPostTagsHtml(post, escapeHtml, 3);

        var mediaHtml;
        if (post.feature_image) {
            mediaHtml = '<img class="post-image lazyload u-object-fit" src="' + escapeHtml(post.feature_image) + '" alt="' + title + '">';
        } else {
            mediaHtml = '<img class="post-image lazyload u-object-fit" src="' + escapeHtml(AYU_DEFAULT_IMAGES.POST) + '" alt="' + title + '">';
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
        normalizePostTaxonomyTags(resultsEl);

        if (paginationEl) {
            paginationEl.innerHTML = buildPaginationHtml(safePage, totalPages);
        }

        setState(currentResults.length + ' results found. Page ' + safePage + ' of ' + totalPages + '.', 'success');
        setUrlQuery(currentQuery, safePage);
    }

    function runSearch(raw, page) {
        var query = (raw || '').trim();

        if (query.length === 0) {
            currentResults = [];
            currentQuery = '';
            resultsEl.innerHTML = '';
            if (paginationEl) {
                paginationEl.innerHTML = '';
            }
            setUrlQuery('');
            setState(SEARCH_HINT_TEXT, 'idle');
            return Promise.resolve();
        }

        if (query.length < 2) {
            currentResults = [];
            currentQuery = '';
            resultsEl.innerHTML = '';
            if (paginationEl) {
                paginationEl.innerHTML = '';
            }
            setUrlQuery('');
            setState('Enter at least 2 characters.', 'empty');
            return Promise.resolve();
        }

        if (!contentKey) {
            currentResults = [];
            currentQuery = '';
            resultsEl.innerHTML = '';
            if (paginationEl) {
                paginationEl.innerHTML = '';
            }
            logAyuWarning('Search initialization failed: missing Content API key');
            setState(AYU_USER_MESSAGES.SEARCH_UNAVAILABLE, 'error');
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
                    setState('No posts found.', 'empty');
                    return;
                }

                currentResults = posts;
                currentQuery = query;
                renderResultPage(page || 1);
            })
            .catch(function (error) {
                currentResults = [];
                currentQuery = query;
                resultsEl.innerHTML = '';
                if (paginationEl) {
                    paginationEl.innerHTML = '';
                }
                logAyuWarning('Search request failed', error);
                setState(AYU_USER_MESSAGES.SEARCH_UNAVAILABLE, 'error');
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
    } else if (initialQuery.trim().length === 1) {
        setState('Enter at least 2 characters.', 'empty');
    } else {
        setState(SEARCH_HINT_TEXT, 'idle');
    }
}

function player() {
    'use strict';
    var player = document.querySelector('.player');
    var playerAudio = player ? player.querySelector('.player-audio') : null;
    var playerProgress = player ? player.querySelector('.player-progress') : null;
    var timeCurrent = player ? player.querySelector('.player-time-current') : null;
    var timeDuration = player ? player.querySelector('.player-time-duration') : null;
    var playButton = player ? player.querySelector('.button-play') : null;
    var backwardButton = player ? player.querySelector('.player-backward') : null;
    var forwardButton = player ? player.querySelector('.player-forward') : null;
    var playerSpeed = 1;
    var speedButton = player ? player.querySelector('.player-speed') : null;
    var site = document.querySelector('.site');

    if (!player || !playerAudio || !site) {
        return;
    }

    function removePlayingFromPost(postId) {
        if (!postId) {
            return;
        }

        var selector = '.post[data-id="' + postId + '"] .post-play';
        var postPlay = document.querySelector(selector);
        if (postPlay) {
            postPlay.classList.remove('playing');
        }
    }

    function syncPlayerFromEpisode(episode) {
        if (!episode) {
            return;
        }

        var nextId = episode.getAttribute('data-id') || '';
        var currentId = player.getAttribute('data-playing') || '';

        if (currentId !== nextId) {
            removePlayingFromPost(currentId);
            player.setAttribute('data-playing', nextId);
        }

        var audioUrl = episode.getAttribute('data-url') || '';
        if (audioUrl) {
            playerAudio.setAttribute('src', audioUrl);
        }

        var episodeImage = episode.querySelector('.post-image');
        var playerImage = player.querySelector('.post-image');
        if (episodeImage && playerImage) {
            playerImage.setAttribute('src', episodeImage.getAttribute('src') || '');
        }

        var episodeTitle = episode.querySelector('.post-title');
        var playerTitle = player.querySelector('.post-title');
        if (episodeTitle && playerTitle) {
            playerTitle.textContent = episodeTitle.textContent || '';
        }

        var episodeTime = episode.querySelector('.post-meta-date time');
        var playerTime = player.querySelector('.post-meta time');
        if (episodeTime && playerTime) {
            playerTime.setAttribute('datetime', episodeTime.getAttribute('datetime') || '');
            playerTime.textContent = episodeTime.textContent || '';
        }
    }

    site.addEventListener('click', function (event) {
        var clicked = event.target.closest('.js-play');
        if (!clicked || !site.contains(clicked)) {
            return;
        }

        if (clicked.classList.contains('post-play')) {
            syncPlayerFromEpisode(clicked.closest('.post'));
        }

        if (playerAudio.paused) {
            var playPromise = playerAudio.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(function () {
                        clicked.classList.add('playing');
                        if (playButton) {
                            playButton.classList.add('playing');
                        }

                        var activeId = player.getAttribute('data-playing') || '';
                        var activeSelector = '.post[data-id="' + activeId + '"] .post-play';
                        var activePostPlay = activeId ? document.querySelector(activeSelector) : null;
                        if (activePostPlay) {
                            activePostPlay.classList.add('playing');
                        }

                        document.body.classList.add('player-opened');
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }
        } else {
            playerAudio.pause();
            clicked.classList.remove('playing');
            if (playButton) {
                playButton.classList.remove('playing');
            }
            removePlayingFromPost(player.getAttribute('data-playing') || '');
        }
    });

    playerAudio.addEventListener('timeupdate', function () {
        var duration = isNaN(playerAudio.duration) ? 0 : playerAudio.duration;
        if (timeDuration) {
            timeDuration.textContent = new Date(duration * 1000).toISOString().substring(11, 19);
        }
        if (timeCurrent) {
            timeCurrent.textContent = new Date(playerAudio.currentTime * 1000).toISOString().substring(11, 19);
        }
        if (playerProgress) {
            var progress = playerAudio.duration ? (playerAudio.currentTime / playerAudio.duration) * 100 : 0;
            playerProgress.style.width = progress + '%';
        }
    });

    if (backwardButton) {
        backwardButton.addEventListener('click', function () {
            playerAudio.currentTime = playerAudio.currentTime - 10;
        });
    }

    if (forwardButton) {
        forwardButton.addEventListener('click', function () {
            playerAudio.currentTime = playerAudio.currentTime + 30;
        });
    }

    if (speedButton) {
        speedButton.addEventListener('click', function () {
            if (playerSpeed < 2) {
                playerSpeed += 0.5;
            } else {
                playerSpeed = 1;
            }

            playerAudio.playbackRate = playerSpeed;
            speedButton.textContent = playerSpeed + 'x';
        });
    }
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

        return fetch(tagsUrl)
            .then(function (res) {
                if (!res.ok) {
                    throw new Error('Failed to fetch tags for categories');
                }
                return res.json();
            })
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


function renderSecondaryTags() {
    'use strict';

    var isSecondaryTagsPage = /^\/secondary-tags\/?$/.test(window.location.pathname);
    if (!isSecondaryTagsPage) {
        return;
    }

    var featuredSection = document.getElementById('secondary-tags-featured');
    var grid = document.getElementById('secondary-tags-grid');

    if (!featuredSection || !grid) {
        return;
    }

    var contentKey = getAyuContentApiKey();

    featuredSection.hidden = false;
    featuredSection.innerHTML = buildLoadingStateHtml();
    grid.innerHTML = buildSkeletonCards(8);

    if (!contentKey) {
        logAyuWarning('Content hub load failed: missing Content API key (secondary-tags)');
        featuredSection.innerHTML = buildTermErrorHtml();
        grid.innerHTML = '';
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

    function featuredHtml(tagInfo) {
        var link = '/tag/' + encodeURIComponent(tagInfo.slug) + '/';
        var imageSource = tagInfo.feature_image || AYU_DEFAULT_IMAGES.SECONDARY_TAG;
        var image = [
            '<div class="tag-header-image-wrap">',
            '<a href="',
            link,
            '">',
            '<img class="tag-header-image" src="',
            escapeHtml(imageSource),
            '" alt="',
            escapeHtml(tagInfo.name),
            '">',
            '</a>',
            '</div>'
        ].join('');

        return [
            image,
            '<div class="secondary-tags-featured-body">',
            '<h2 class="term-name"><a href="',
            link,
            '">',
            escapeHtml(tagInfo.name),
            '</a></h2>',
            '<div class="term-description">',
            escapeHtml(tagInfo.description || 'Most-used topic archive.'),
            '</div>',
            '</div>'
        ].join('');
    }

    function gridCardHtml(tagInfo) {
        var thumbSource = tagInfo.feature_image || AYU_DEFAULT_IMAGES.SECONDARY_TAG;
        var thumb = [
            '<img class="secondary-tag-thumb-image" src="',
            escapeHtml(thumbSource),
            '" alt="',
            escapeHtml(tagInfo.name),
            '">'
        ].join('');

        return [
            '<a class="secondary-tag-card" href="/tag/',
            encodeURIComponent(tagInfo.slug),
            '/" title="',
            escapeHtml(tagInfo.name),
            '">',
            '<span class="secondary-tag-thumb">',
            thumb,
            '</span>',
            '<span class="secondary-tag-name">',
            escapeHtml(tagInfo.name),
            '</span>',
            '</a>'
        ].join('');
    }

    fetch('/ghost/api/content/tags/?key=' + encodeURIComponent(contentKey) + '&include=count.posts&limit=all')
        .then(function (res) {
            if (!res.ok) {
                throw new Error('Failed to fetch tags for topics');
            }
            return res.json();
        })
        .then(function (data) {
            var tags = (data.tags || []).filter(function (tag) {
                return AYU_TAG_UTILS.isTopicTag(tag);
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

            if (!tags.length) {
                featuredSection.hidden = false;
                featuredSection.innerHTML = '<div class="term-empty">No topics found.</div>';
                grid.innerHTML = '';
                return;
            }

            tags.sort(function (a, b) {
                if (b.count !== a.count) {
                    return b.count - a.count;
                }

                return a.name.localeCompare(b.name);
            });

            var featured = tags[0];
            var rest = tags.slice(1);

            featuredSection.hidden = false;
            featuredSection.innerHTML = featuredHtml(featured);
            grid.innerHTML = rest.length ? rest.map(gridCardHtml).join('') : '<div class="term-empty">No additional topics.</div>';
        })
        .catch(function (error) {
            logAyuWarning('Content hub load failed (secondary-tags)', error);
            featuredSection.innerHTML = buildTermErrorHtml();
            grid.innerHTML = '';
        });
}
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
        fetch(tagUrl).then(function (res) {
            if (!res.ok) {
                throw new Error('Failed to fetch series tag');
            }

            return res.json();
        }),
        fetch(postsUrl).then(function (res) {
            if (!res.ok) {
                throw new Error('Failed to fetch series posts');
            }

            return res.json();
        })
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
























function renderExplorePage() {
    'use strict';

    var isExplorePage = /^\/explore\/?$/.test(window.location.pathname);
    if (!isExplorePage) {
        return;
    }

    var categoriesGrid = document.getElementById('explore-categories-grid');
    var seriesList = document.getElementById('explore-series-list');
    var topicsGrid = document.getElementById('explore-topics-grid');
    var recentList = document.getElementById('explore-recent-list');

    if (!categoriesGrid || !seriesList || !topicsGrid || !recentList) {
        return;
    }

    var contentKey = getAyuContentApiKey();

    categoriesGrid.innerHTML = buildLoadingStateHtml();
    seriesList.innerHTML = buildLoadingStateHtml();
    topicsGrid.innerHTML = buildLoadingStateHtml();
    recentList.innerHTML = '<li class="term-loading" role="status" aria-live="polite">' + AYU_USER_MESSAGES.HUB_LOADING + '</li>';

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
        var url = '/ghost/api/content/posts/?key=' + encodeURIComponent(contentKey) + '&fields=id,title,slug,url,published_at&limit=5&order=published_at%20desc';
        return fetch(url)
            .then(function (res) {
                if (!res.ok) {
                    throw new Error('Failed to fetch recent posts');
                }
                return res.json();
            })
            .then(function (data) {
                return data.posts || [];
            });
    }

    Promise.all([
        fetch('/ghost/api/content/tags/?key=' + encodeURIComponent(contentKey) + '&limit=all&include=count.posts').then(function (res) {
            if (!res.ok) {
                throw new Error('Failed to fetch tags');
            }
            return res.json();
        }),
        fetchRecentPosts()
    ])
        .then(function (results) {
            var tags = results[0] && results[0].tags ? results[0].tags : [];
            var recent = results[1] || [];

            var categories = tags.filter(function (tag) {
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

            var series = tags.filter(function (tag) {
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

            var topics = tags.filter(function (tag) {
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

            categoriesGrid.innerHTML = categories.length ? categories.slice(0, 6).map(categoryCardHtml).join('') : '<div class="term-empty">No categories yet.</div>';
            seriesList.innerHTML = series.length ? series.slice(0, 3).map(seriesCardHtml).join('') : '<div class="term-empty">No series yet.</div>';
            topicsGrid.innerHTML = topics.length ? topics.slice(0, 10).map(topicCardHtml).join('') : '<div class="term-empty">No topics yet.</div>';
            recentList.innerHTML = recent.length ? recent.map(recentItemHtml).join('') : '<li class="term-empty">No recent posts.</li>';
        })
        .catch(function (error) {
            logAyuWarning('Content hub load failed (explore)', error);
            categoriesGrid.innerHTML = buildTermErrorHtml();
            seriesList.innerHTML = buildTermErrorHtml();
            topicsGrid.innerHTML = buildTermErrorHtml();
            recentList.innerHTML = buildTermErrorListItemHtml();
        });
}





