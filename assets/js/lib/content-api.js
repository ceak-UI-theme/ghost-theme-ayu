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

    var sessionEntry = readAyuSessionCache(cacheKey);
    if (sessionEntry && sessionEntry.expiresAt > now) {
        AYU_CONTENT_API_CACHE[cacheKey] = sessionEntry;
        return Promise.resolve(sessionEntry.data);
    }

    return fetch(requestUrl)
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
            writeAyuSessionCache(cacheKey, payload);

            return data;
        });
}

function fetchAyuContentApiCollection(pathOrUrl, collectionKey, options) {
    'use strict';

    var opts = options || {};
    var key = String(collectionKey || '').trim();
    if (!key) {
        return Promise.reject(new Error('Missing Content API collection key'));
    }

    function mergePageItems(result, data) {
        var pageItems = data && Array.isArray(data[key]) ? data[key] : [];
        var meta = data && data.meta && data.meta.pagination ? data.meta.pagination : null;

        return {
            items: result.items.concat(pageItems),
            meta: meta
        };
    }

    function fetchPage(pageNumber, result) {
        var input = String(pathOrUrl || '').trim();
        var separator = input.indexOf('?') === -1 ? '?' : '&';
        var pagedUrl = input + separator + 'page=' + String(pageNumber);

        return fetchAyuContentApiJson(pagedUrl, opts)
            .then(function (data) {
                var nextResult = mergePageItems(result, data);
                var meta = nextResult.meta;
                var hasNext = meta && meta.next;

                if (!hasNext) {
                    return nextResult.items;
                }

                return fetchPage(meta.next, nextResult);
            });
    }

    return fetchPage(1, { items: [], meta: null });
}
