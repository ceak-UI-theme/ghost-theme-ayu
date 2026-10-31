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

var AYU_CONTENT_API_CACHE = window.__ayuContentApiCache || (window.__ayuContentApiCache = {});
var AYU_CONTENT_API_REQUESTS = window.__ayuContentApiRequests || (window.__ayuContentApiRequests = {});
var AYU_CONTENT_API_COLLECTIONS = window.__ayuContentApiCollections || (window.__ayuContentApiCollections = {});
var AYU_CONTENT_API_COLLECTION_REQUESTS = window.__ayuContentApiCollectionRequests || (window.__ayuContentApiCollectionRequests = {});
var AYU_CONTENT_API_CACHE_STORAGE_KEY = 'ayu-content-api-cache::';
var AYU_CONTENT_API_TTL_MS = {
    SETTINGS: 30 * 60 * 1000,
    TAGS: 10 * 60 * 1000,
    POSTS: 10 * 60 * 1000,
    DEFAULT: 5 * 60 * 1000
};

function resolveAyuContentApiUrl(pathOrUrl, contentKey) {
    'use strict';

    var input = String(pathOrUrl || '').trim();
    if (!input) {
        return '';
    }

    var url = input;
    if (url.indexOf('/ghost/api/content/') !== 0 && !/^https?:\/\//i.test(url)) {
        url = '/ghost/api/content/' + url.replace(/^\/+/, '');
    }

    var hasKey = /(?:\?|&)key=/.test(url);
    if (!hasKey && contentKey) {
        url += (url.indexOf('?') === -1 ? '?' : '&') + 'key=' + encodeURIComponent(contentKey);
    }

    return url;
}

function getAyuContentApiCacheTtl(url, ttlOverride) {
    'use strict';

    if (typeof ttlOverride === 'number' && ttlOverride > 0) {
        return ttlOverride;
    }

    if (url.indexOf('/settings/') !== -1) {
        return AYU_CONTENT_API_TTL_MS.SETTINGS;
    }
    if (url.indexOf('/tags/') !== -1) {
        return AYU_CONTENT_API_TTL_MS.TAGS;
    }
    if (url.indexOf('/posts/') !== -1) {
        return AYU_CONTENT_API_TTL_MS.POSTS;
    }

    return AYU_CONTENT_API_TTL_MS.DEFAULT;
}

function readAyuSessionCache(cacheKey) {
    'use strict';

    try {
        var raw = sessionStorage.getItem(cacheKey);
        if (!raw) {
            return null;
        }

        var parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') {
            return null;
        }

        return parsed;
    } catch (error) {
        return null;
    }
}

function writeAyuSessionCache(cacheKey, payload) {
    'use strict';

    try {
        sessionStorage.setItem(cacheKey, JSON.stringify(payload));
    } catch (error) {
        // Ignore storage failures and keep runtime flow on network fallback.
    }
}

function fetchAyuContentApiJson(pathOrUrl, options) {
    'use strict';

    var opts = options || {};
    var contentKey = String(opts.contentKey || getAyuContentApiKey() || '').trim();
    var requestUrl = resolveAyuContentApiUrl(pathOrUrl, contentKey);
    if (!requestUrl) {
        return Promise.reject(new Error('Invalid Content API request URL'));
    }

    var cacheKey = AYU_CONTENT_API_CACHE_STORAGE_KEY + requestUrl;
    var ttl = getAyuContentApiCacheTtl(requestUrl, opts.ttl);
    var now = Date.now();
    var memoryEntry = AYU_CONTENT_API_CACHE[cacheKey];

    if (memoryEntry && memoryEntry.expiresAt > now) {
        return Promise.resolve(memoryEntry.data);
    }

    var sessionEntry = opts.memoryOnly ? null : readAyuSessionCache(cacheKey);
    if (sessionEntry && sessionEntry.expiresAt > now) {
        AYU_CONTENT_API_CACHE[cacheKey] = sessionEntry;
        return Promise.resolve(sessionEntry.data);
    }

    var requestKey = cacheKey + (opts.memoryOnly ? '::memory' : '::session');
    if (AYU_CONTENT_API_REQUESTS[requestKey]) {
        return AYU_CONTENT_API_REQUESTS[requestKey];
    }
    var request = fetch(requestUrl)
        .then(function (res) {
            if (!res.ok) {
                throw new Error('Failed to fetch Content API data');
            }
            return res.json();
        })
        .then(function (data) {
            var payload = {
                expiresAt: Date.now() + ttl,
                data: data
            };

            AYU_CONTENT_API_CACHE[cacheKey] = payload;
            if (!opts.memoryOnly) { writeAyuSessionCache(cacheKey, payload); }

            return data;
        });
    var shared = request.then(function (data) {
        delete AYU_CONTENT_API_REQUESTS[requestKey];
        return data;
    }, function (error) {
        delete AYU_CONTENT_API_REQUESTS[requestKey];
        throw error;
    });
    AYU_CONTENT_API_REQUESTS[requestKey] = shared;
    return shared;
}

// Validate each page before exposing any collection to the UI. A verified total=0
// is authoritative; a missing array/meta or an incomplete page is an error.
function validateAyuContentApiPage(data, key, requestedPage, deferTagLength) {
    function integer(n) { return Number.isInteger(n) && n >= 0; }
    var items = data && data[key];
    var p = data && data.meta && data.meta.pagination;
    if (!Array.isArray(items) || !p || !integer(p.page) || p.page < 1 ||
        !integer(p.limit) || p.limit < 1 || !integer(p.pages) || !integer(p.total) ||
        p.page !== requestedPage || (p.total > 0 && p.pages !== Math.ceil(p.total / p.limit)) ||
        (p.total === 0 && (p.page !== 1 || p.pages > 1)) ||
        (p.total > 0 && p.page > p.pages) ||
        p.next !== (p.page < p.pages ? p.page + 1 : null) ||
        p.prev !== (p.page > 1 ? p.page - 1 : null) ||
        (items.length !== Math.min(p.limit, Math.max(0, p.total - (p.page - 1) * p.limit)) &&
            !(key === 'tags' && deferTagLength && items.length < Math.min(p.limit, Math.max(0, p.total - (p.page - 1) * p.limit))))) {
        throw new Error('Invalid or incomplete Content API pagination');
    }
    var seen = Object.create(null);
    items.forEach(function (item) {
        if (!item || typeof item.id !== 'string' || !item.id || seen[item.id] ||
            typeof item.slug !== 'string' || !item.slug ||
            (key === 'posts' && (typeof item.title !== 'string' || typeof item.url !== 'string')) ||
            (key === 'tags' && (typeof item.name !== 'string' ||
                ['public', 'internal'].indexOf(item.visibility) === -1 ||
                !item.count || !integer(item.count.posts)))) {
            throw new Error('Invalid Content API ' + key + ' item');
        }
        seen[item.id] = true;
    });
    return p;
}

function forgetAyuContentApiPage(pathOrUrl, options) {
    var contentKey = options && options.contentKey || getAyuContentApiKey();
    var cacheKey = AYU_CONTENT_API_CACHE_STORAGE_KEY + resolveAyuContentApiUrl(pathOrUrl, contentKey);
    delete AYU_CONTENT_API_CACHE[cacheKey];
    try { sessionStorage.removeItem(cacheKey); } catch (ignored) { /* Storage may be unavailable. */ }
}

function fetchAyuContentApiPage(pathOrUrl, key, options, deferTagLength) {
    var url = new URL(pathOrUrl, window.location.href);
    var page = Number(url.searchParams.get('page') || 1);
    return fetchAyuContentApiJson(pathOrUrl, options).then(function (data) {
        try {
            validateAyuContentApiPage(data, key, page, deferTagLength);
            if (key === 'posts' && options && options.requireTagReferences) {
                data.posts.forEach(validateAyuPostTagReferences);
            }
        } catch (error) {
            // A malformed successful response must not poison the session cache.
            forgetAyuContentApiPage(pathOrUrl, options);
            throw error;
        }
        return data;
    });
}

// An absent tags relation cannot prove that a post is untagged.
function validateAyuPostTagReferences(post) {
    if (!Array.isArray(post.tags)) { throw new Error('Missing Content API post tags'); }
    var seen = Object.create(null);
    post.tags.forEach(function (tag) {
        if (!tag || typeof tag.id !== 'string' || !tag.id || seen[tag.id] ||
            typeof tag.slug !== 'string' || !tag.slug || typeof tag.name !== 'string' ||
            ['public', 'internal'].indexOf(tag.visibility) === -1) {
            throw new Error('Invalid Content API post tag reference');
        }
        seen[tag.id] = true;
    });
}

function ayuContentApiCollectionUrl(pathOrUrl, options) {
    var opts = options || {};
    var url = new URL(resolveAyuContentApiUrl(pathOrUrl, opts.contentKey || getAyuContentApiKey()), window.location.href);
    url.searchParams.delete('page');
    url.searchParams.set('limit', '100');
    url.searchParams.sort();
    return url;
}

function ayuContentApiCollectionKey(url, key, options) {
    var opts = options || {};
    return key + '::' + url.href + '::' + Math.min(opts.maxPages || 1000, 1000) +
        '::' + Boolean(opts.memoryOnly) + '::' + Boolean(opts.requireTagReferences);
}

function forgetAyuContentApiCollection(cacheKey, options) {
    var entry = AYU_CONTENT_API_COLLECTIONS[cacheKey];
    if (entry) {
        entry.pageUrls.forEach(function (url) { forgetAyuContentApiPage(url, options); });
        delete AYU_CONTENT_API_COLLECTIONS[cacheKey];
    }
}

// Ghost can count unused/draft-only tags in total without returning them.
// Only a separately complete published-post collection can certify active tags.
function verifyAyuPublicTagCoverage(tags, tagUrl, options) {
    var url = new URL(tagUrl.href);
    url.pathname = url.pathname.replace(/\/tags\/?$/, '/posts/');
    url.search = '';
    url.searchParams.set('include', 'tags');
    url.searchParams.set('fields', 'id,title,slug,url');
    url.searchParams.set('order', 'id asc');
    var opts = {
        contentKey: options.contentKey || tagUrl.searchParams.get('key') || getAyuContentApiKey(),
        maxPages: options.maxPages,
        memoryOnly: true,
        requireTagReferences: true
    };
    var proofUrl = ayuContentApiCollectionUrl(url.href, opts);
    var proofKey = ayuContentApiCollectionKey(proofUrl, 'posts', opts);
    return fetchAyuContentApiCollection(proofUrl.href, 'posts', opts).then(function (posts) {
        var references = Object.create(null), actual = Object.create(null);
        posts.forEach(function (post) {
            post.tags.forEach(function (tag) {
                if (tag.visibility !== 'public') { return; }
                var ref = references[tag.id];
                if (ref && (ref.slug !== tag.slug || ref.name !== tag.name)) { throw new Error('Content API post tag slug changed'); }
                if (!ref) { ref = references[tag.id] = {slug: tag.slug, name: tag.name, count: 0}; }
                ref.count += 1;
            });
        });
        tags.forEach(function (tag) {
            if (tag.visibility !== 'public' || tag.count.posts === 0) { return; }
            var ref = references[tag.id];
            if (!ref || ref.slug !== tag.slug || ref.name !== tag.name || ref.count !== tag.count.posts) {
                throw new Error('Content API public tag coverage mismatch');
            }
            actual[tag.id] = true;
        });
        if (Object.keys(references).some(function (id) { return !actual[id]; })) {
            throw new Error('Missing active public Content API tag');
        }
        var cached = AYU_CONTENT_API_COLLECTIONS[proofKey];
        return {posts: posts.length, activePublicTags: Object.keys(references).length,
            expiresAt: cached ? cached.expiresAt : Date.now()};
    }).catch(function (error) {
        // Contradictory snapshots must not pin the next attempt to stale evidence.
        forgetAyuContentApiCollection(proofKey, opts);
        throw error;
    });
}

function fetchAyuContentApiCollection(pathOrUrl, collectionKey, options) {
    'use strict';
    var opts = options || {};
    var key = String(collectionKey || '').trim();
    if (['tags', 'posts'].indexOf(key) === -1) {
        return Promise.reject(new Error('Unsupported Content API collection'));
    }
    var url = ayuContentApiCollectionUrl(pathOrUrl, opts);
    // Hub callers request the whole tag catalog. A narrower filter cannot prove
    // coverage of every active public tag and must not accidentally be approved.
    if (key === 'tags' && url.searchParams.has('filter') && url.searchParams.get('filter') !== 'visibility:public') {
        return Promise.reject(new Error('Unsupported Content API tag coverage filter'));
    }
    var cacheKey = ayuContentApiCollectionKey(url, key, opts);
    var cached = AYU_CONTENT_API_COLLECTIONS[cacheKey];
    if (cached && cached.expiresAt > Date.now()) { return Promise.resolve(cached.data); }
    if (AYU_CONTENT_API_COLLECTION_REQUESTS[cacheKey]) { return AYU_CONTENT_API_COLLECTION_REQUESTS[cacheKey]; }
    var result = [], seen = Object.create(null), firstMeta, visitedUrls = [];
    var expiresAt = Date.now() + getAyuContentApiCacheTtl(url.href, opts.ttl);
    var maxPages = Math.min(opts.maxPages || 1000, 1000), proof;
    function fetchPage(page) {
        if (page > maxPages) { return Promise.reject(new Error('Content API collection page limit exceeded')); }
        url.searchParams.set('page', String(page));
        url.searchParams.sort();
        visitedUrls.push(url.href);
        return fetchAyuContentApiPage(url.href, key, opts, key === 'tags').then(function (data) {
            var p = data.meta.pagination;
            var pageCache = AYU_CONTENT_API_CACHE[AYU_CONTENT_API_CACHE_STORAGE_KEY + url.href];
            if (pageCache) { expiresAt = Math.min(expiresAt, pageCache.expiresAt); }
            if (p.pages > maxPages || p.total > 100000) { throw new Error('Content API collection limit exceeded'); }
            if (firstMeta && (p.total !== firstMeta.total || p.pages !== firstMeta.pages || p.limit !== firstMeta.limit)) {
                throw new Error('Content API collection changed during pagination');
            }
            firstMeta = firstMeta || p;
            data[key].forEach(function (item) {
                if (seen[item.id]) { throw new Error('Duplicate Content API item across pages'); }
                seen[item.id] = true;
                result.push(item);
            });
            if (p.next !== null) { return fetchPage(p.next); }
            if (key === 'posts') {
                if (result.length !== p.total) { throw new Error('Incomplete Content API collection'); }
                return result;
            }
            // Every tag result, even a matching total or total=0, needs evidence.
            return verifyAyuPublicTagCoverage(result, url, opts).then(function (verified) {
                proof = verified;
                expiresAt = Math.min(expiresAt, verified.expiresAt);
                return result;
            });
        });
    }
    var request = fetchPage(1).then(function (items) {
        AYU_CONTENT_API_COLLECTIONS[cacheKey] = {data: items, expiresAt: expiresAt,
            pageUrls: visitedUrls, proof: proof};
        return items;
    }).catch(function (error) {
        visitedUrls.forEach(function (pageUrl) { forgetAyuContentApiPage(pageUrl, opts); });
        delete AYU_CONTENT_API_COLLECTIONS[cacheKey];
        throw error;
    });
    var shared = request.then(function (items) {
        delete AYU_CONTENT_API_COLLECTION_REQUESTS[cacheKey];
        return items;
    }, function (error) {
        delete AYU_CONTENT_API_COLLECTION_REQUESTS[cacheKey];
        throw error;
    });
    AYU_CONTENT_API_COLLECTION_REQUESTS[cacheKey] = shared;
    return shared;
}
