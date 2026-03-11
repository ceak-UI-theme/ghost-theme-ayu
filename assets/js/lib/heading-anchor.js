(function () {
    'use strict';

    function addHeadingAnchors() {
        var contentRoot = AYU_HEADING_IDS.getPostContentRoot(document.querySelector('.post-toc'));
        if (!contentRoot || !contentRoot.classList.contains('post-content')) {
            return;
        }

        var tocSelector = AYU_HEADING_IDS.getTocHeadingSelector(contentRoot);
        var tocHeadings = Array.prototype.slice.call(contentRoot.querySelectorAll(tocSelector));
        if (tocHeadings.length) {
            AYU_HEADING_IDS.assignHeadingIds(tocHeadings);
        }

        var targetHeadings = Array.prototype.slice.call(contentRoot.querySelectorAll('h2, h3'));
        if (!targetHeadings.length) {
            return;
        }

        AYU_HEADING_IDS.assignHeadingIds(targetHeadings);

        targetHeadings.forEach(function (heading) {
            if (heading.querySelector('.heading-anchor')) {
                return;
            }

            if (!heading.id) {
                return;
            }

            var anchor = document.createElement('a');
            anchor.className = 'heading-anchor';
            anchor.setAttribute('href', '#' + heading.id);
            anchor.setAttribute('aria-hidden', 'true');
            anchor.setAttribute('tabindex', '-1');
            anchor.textContent = '#';

            heading.insertBefore(anchor, heading.firstChild);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addHeadingAnchors);
    } else {
        addHeadingAnchors();
    }
})();
