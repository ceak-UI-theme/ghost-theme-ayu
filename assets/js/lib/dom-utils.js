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

function injectPostMidAd(root) {
    'use strict';

    var scope = root || document;
    if (!scope || !scope.querySelector) {
        return;
    }

    if (!document.body || !document.body.classList.contains('post-template')) {
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

    var adNode = createAdSlotElement('post-top');
    adNode.classList.remove('ayu-ad-slot--post-top');
    adNode.classList.add('ayu-ad-slot--post-mid');
    adNode.setAttribute('data-ad-slot-rendered', 'post-mid');

    targetParagraph.insertAdjacentElement('afterend', adNode);
}
