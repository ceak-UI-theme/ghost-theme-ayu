var AYU_HEADING_IDS = window.AYU_HEADING_IDS || (window.AYU_HEADING_IDS = {});

AYU_HEADING_IDS.slugify = function slugifyHeadingText(text) {
    'use strict';

    return String(text || '')
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\p{L}\p{N}\s-]/gu, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '') || 'section';
};

AYU_HEADING_IDS.getHeadingText = function getHeadingText(heading) {
    'use strict';

    if (!heading) {
        return '';
    }

    var clone = heading.cloneNode(true);
    var anchorLinks = clone.querySelectorAll('.heading-anchor');
    Array.prototype.forEach.call(anchorLinks, function (anchor) {
        anchor.remove();
    });

    return clone.textContent || '';
};

AYU_HEADING_IDS.getPostContentRoot = function getPostContentRoot(anchorRoot) {
    'use strict';

    var articleRoot = anchorRoot && anchorRoot.closest('article.single')
        ? anchorRoot.closest('article.single')
        : document.querySelector('article.single');

    if (articleRoot) {
        return articleRoot.querySelector('.post-content') || articleRoot.querySelector('.gh-content');
    }

    return document.querySelector('.post-content') || document.querySelector('.gh-content');
};

AYU_HEADING_IDS.getTocHeadingSelector = function getTocHeadingSelector(contentRoot) {
    'use strict';

    var hasH1 = Boolean(contentRoot && contentRoot.querySelector('h1'));
    return hasH1 ? 'h1, h2' : 'h2, h3';
};

AYU_HEADING_IDS.assignHeadingIds = function assignHeadingIds(headings) {
    'use strict';

    var usedIds = {};

    headings.forEach(function (heading) {
        var baseId = heading.id ? heading.id : AYU_HEADING_IDS.slugify(AYU_HEADING_IDS.getHeadingText(heading));
        var nextId = baseId;
        var suffix = 2;

        while (usedIds[nextId] || document.getElementById(nextId) && document.getElementById(nextId) !== heading) {
            nextId = baseId + '-' + suffix;
            suffix += 1;
        }

        heading.id = nextId;
        usedIds[nextId] = true;
    });
};
