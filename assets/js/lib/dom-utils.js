var AYU_RUNTIME_FLAGS = window.__ayuRuntimeFlags || (window.__ayuRuntimeFlags = {});

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

var AYU_USER_MESSAGES = {
    HUB_LOADING: 'Loading content...',
    HUB_LOAD_FAILED: 'Content could not be loaded. Please try again later.',
    SEARCH_UNAVAILABLE: 'Search is currently unavailable. Please try again later.'
};

var AYU_ADSENSE_LAYOUT_KEYS = {
    LIST_INLINE: '-fc+5u+6g-jf+cg'
};

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

function getAyuAdConfig() {
    'use strict';

    if (window.__ayuAdConfig) {
        return window.__ayuAdConfig;
    }

    var configEl = document.getElementById('ayu-ad-config');
    var config = {
        adsenseClient: '',
        slots: {
            'list-inline': '',
            'post-mid': '',
            'post-bottom': ''
        }
    };

    if (configEl) {
        config.adsenseClient = (configEl.getAttribute('data-adsense-client') || '').trim();
        config.slots['list-inline'] = (configEl.getAttribute('data-ad-slot-list-inline') || '').trim();
        config.slots['post-mid'] = (configEl.getAttribute('data-ad-slot-post-mid') || '').trim();
        config.slots['post-bottom'] = (configEl.getAttribute('data-ad-slot-post-bottom') || '').trim();
    }

    config.enabled = Boolean(config.adsenseClient);
    window.__ayuAdConfig = config;

    return config;
}

function canRenderAdSlot(slotType) {
    'use strict';

    var config = getAyuAdConfig();
    return Boolean(config.enabled && config.slots[slotType]);
}

function initializeAdsByGoogle(scope) {
    'use strict';

    var root = scope && scope.nodeType === 1 ? scope : document;
    if (!root || !root.querySelectorAll) {
        return;
    }

    var blocks = Array.prototype.slice.call(root.querySelectorAll('ins.adsbygoogle[data-ayu-ad-ready="false"]'));
    if (!blocks.length) {
        return;
    }

    blocks.forEach(function (block) {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            block.setAttribute('data-ayu-ad-ready', 'true');
        } catch (error) {
            logAyuWarning('AdSense initialization failed', error);
        }
    });
}

function getAdSlotConfig(slotType) {
    'use strict';

    var configs = {
        'list-inline': {
            wrapperTag: 'article',
            wrapperClass: 'post post-promo ayu-ad-slot ayu-ad-slot--list-inline'
        },
        'post-mid': {
            wrapperTag: 'aside',
            wrapperClass: 'post-ad-slot ayu-ad-slot ayu-ad-slot--post-mid'
        },
        'post-bottom': {
            wrapperTag: 'aside',
            wrapperClass: 'post-ad-slot ayu-ad-slot ayu-ad-slot--post-bottom'
        }
    };

    return configs[slotType] || configs['list-inline'];
}

function buildAdSlotInnerHtml(slotType) {
    'use strict';

    var adConfig = getAyuAdConfig();
    var slotId = adConfig.slots[slotType] || '';
    var attributes = [
        ' class="adsbygoogle"',
        ' data-ad-client="' + adConfig.adsenseClient + '"',
        ' data-ad-slot="' + slotId + '"',
        ' data-ad-format="fluid"',
        ' data-ayu-ad-ready="false"'
    ];

    if (slotType === 'list-inline') {
        attributes.push(' style="display:block"');
        attributes.push(' data-ad-layout-key="' + AYU_ADSENSE_LAYOUT_KEYS.LIST_INLINE + '"');
    } else {
        attributes.push(' style="display:block; text-align:center;"');
        attributes.push(' data-ad-layout="in-article"');
    }

    return '<ins' + attributes.join('') + '></ins>';
}

function createAdSlotElement(slotType) {
    'use strict';

    if (!canRenderAdSlot(slotType)) {
        return null;
    }

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
        if (!slotType) {
            return;
        }

        if (!canRenderAdSlot(slotType)) {
            slot.remove();
            return;
        }

        if (slot.getAttribute('data-ad-slot-rendered')) {
            return;
        }

        slot.classList.add('ayu-ad-slot');
        slot.classList.add('ayu-ad-slot--' + slotType);
        slot.setAttribute('aria-label', 'Advertisement');
        slot.setAttribute('data-ad-slot-rendered', slotType);
        slot.innerHTML = buildAdSlotInnerHtml(slotType);
        initializeAdsByGoogle(slot);
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

        if (!canRenderAdSlot('list-inline')) {
            return;
        }

        var posts = Array.prototype.slice.call(feed.children).filter(function (el) {
            return el.classList && el.classList.contains('post') && !el.classList.contains('ayu-ad-slot--list-inline');
        });

        posts.forEach(function (postEl, index) {
            var visibleIndex = index + 1;
            if (visibleIndex % AYU_GLOBALS.PROMO_INSERT_EVERY !== 0) {
                return;
            }

            var promoNode = createAdSlotElement('list-inline');
            if (!promoNode) {
                return;
            }
            postEl.insertAdjacentElement('afterend', promoNode);
            initializeAdsByGoogle(promoNode);
        });
    });
}

function injectPostMidAd(root) {
    'use strict';

    var scope = root || document;
    if (!scope || !scope.querySelector) {
        return;
    }

    if (!document.body || !document.body.classList.contains('post-template')) {
        return;
    }

    if (!canRenderAdSlot('post-mid')) {
        return;
    }

    var content = scope.querySelector('.post-content');
    if (!content) {
        return;
    }

    if (content.querySelector('.ayu-ad-slot--post-mid')) {
        return;
    }

    var contentTextLength = (content.textContent || '').length;
    if (contentTextLength < 1200) {
        return;
    }

    var paragraphs = Array.prototype.slice.call(content.querySelectorAll(':scope > p')).filter(function (paragraph) {
        return !paragraph.closest('.kg-callout-card, .kg-bookmark-card, .kg-toggle-card');
    });

    if (paragraphs.length < 4) {
        return;
    }

    var targetIndex = 1;
    var secondLength = ((paragraphs[1] && paragraphs[1].textContent) || '').trim().length;
    var thirdLength = ((paragraphs[2] && paragraphs[2].textContent) || '').trim().length;
    if (secondLength > 0 && secondLength < 80 && thirdLength >= 80) {
        targetIndex = 2;
    }

    var targetParagraph = paragraphs[targetIndex];
    if (!targetParagraph || !targetParagraph.parentNode) {
        return;
    }

    var adNode = createAdSlotElement('post-mid');
    if (!adNode) {
        return;
    }

    targetParagraph.insertAdjacentElement('afterend', adNode);
    initializeAdsByGoogle(adNode);
}
