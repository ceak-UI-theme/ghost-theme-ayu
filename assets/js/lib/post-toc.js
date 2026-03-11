(function () {
    'use strict';

    function getMobileBreakpoint() {
        if (typeof window !== 'undefined' && window.AYU_GLOBALS && window.AYU_GLOBALS.MOBILE_BREAKPOINT) {
            return Number(window.AYU_GLOBALS.MOBILE_BREAKPOINT) || 767;
        }

        return 767;
    }

    function buildToc() {
        var tocRoot = document.querySelector('.post-toc');
        var contentRoot = AYU_HEADING_IDS.getPostContentRoot(tocRoot);
        var modeWidths = {
            normal: 720,
            wide: 920,
            expanded: 1200
        };
        var fallbackCollapseWidth = 1400;
        var safetyMargin = 24;
        var overlapMargin = 16;

        if (!tocRoot || !contentRoot) {
            return;
        }

        var headingSelector = AYU_HEADING_IDS.getTocHeadingSelector(contentRoot);
        var headings = Array.prototype.slice.call(contentRoot.querySelectorAll(headingSelector));
        if (!headings.length) {
            return;
        }

        AYU_HEADING_IDS.assignHeadingIds(headings);

        var listItems = headings.map(function (heading, index) {
            var tagName = heading.tagName.toLowerCase();
            var levelClass = 'toc-h2';
            if (tagName === 'h1') {
                levelClass = 'toc-h1';
            } else if (tagName === 'h3') {
                levelClass = 'toc-h3';
            }
            return '<li class="' + levelClass + '" data-toc-index="' + index + '"><a href="#' + heading.id + '">' + AYU_HEADING_IDS.getHeadingText(heading) + '</a></li>';
        }).join('');

        tocRoot.innerHTML = [
            '<div class="post-toc-inner">',
            '<div class="toc-header-row">',
            '<div class="toc-title">On this page</div>',
            '<button class="post-toc-toggle" type="button" aria-label="Collapse table of contents" aria-expanded="true">−</button>',
            '</div>',
            '<ul class="post-toc-list">',
            listItems,
            '</ul>',
            '</div>'
        ].join('');

        tocRoot.hidden = false;

        var toggleButton = tocRoot.querySelector('.post-toc-toggle');
        var tocItems = Array.prototype.slice.call(tocRoot.querySelectorAll('li[data-toc-index]'));
        var manualCollapsed = false;
        var manualOverride = false;
        var autoHidden = false;
        var lastMode = '';

        function getEffectiveMode() {
            var mode = (document.body && document.body.getAttribute('data-reading-width')) || 'normal';
            if (!modeWidths[mode]) {
                mode = 'normal';
            }
            return mode;
        }

        function getCollapseThresholdByMode(mode) {
            var rootStyle = window.getComputedStyle(document.documentElement);
            var gap = parseFloat(rootStyle.getPropertyValue('--gap')) || 36;
            var tocStyle = window.getComputedStyle(tocRoot);
            var tocWidth = parseFloat(tocStyle.getPropertyValue('--toc-panel-width')) || 280;
            var tocRight = parseFloat(tocStyle.right) || 40;
            var inner = document.querySelector('.gh-inner');
            var innerMax = inner ? parseFloat(window.getComputedStyle(inner).maxWidth) : NaN;
            if (!Number.isFinite(innerMax) || innerMax <= 0) {
                innerMax = modeWidths.expanded;
            }
            var contentTarget = Math.min(modeWidths[mode] || modeWidths.normal, innerMax);
            return contentTarget + tocWidth + tocRight + gap + safetyMargin;
        }

        function getContentRightEdge() {
            var nodes = contentRoot.querySelectorAll('p, h2, h3, ul, ol, blockquote, pre, table');
            var contentRight = 0;
            var idx;

            for (idx = 0; idx < nodes.length; idx += 1) {
                var rect = nodes[idx].getBoundingClientRect();
                if (rect.width <= 0 || rect.height <= 0) {
                    continue;
                }
                contentRight = Math.max(contentRight, rect.right);
            }

            if (!contentRight) {
                contentRight = contentRoot.getBoundingClientRect().right;
            }

            return contentRight;
        }

        function shouldCollapseForOverlap() {
            var tocStyle = window.getComputedStyle(tocRoot);
            var tocWidth = parseFloat(tocStyle.getPropertyValue('--toc-panel-width')) || 280;
            var tocRight = parseFloat(tocStyle.right) || 40;
            var tocLeft = window.innerWidth - tocRight - tocWidth;
            var contentRight = getContentRightEdge();

            return tocLeft < (contentRight + overlapMargin);
        }

        function updateToggleUi() {
            if (!toggleButton) {
                return;
            }

            var expanded = !(manualCollapsed || autoHidden);
            toggleButton.textContent = expanded ? '−' : '+';
            toggleButton.setAttribute('aria-expanded', expanded ? 'true' : 'false');
            toggleButton.setAttribute('aria-label', expanded ? 'Collapse table of contents' : 'Expand table of contents');
        }

        function evaluateTocLayout() {
            autoHidden = window.innerWidth <= getMobileBreakpoint();
            tocRoot.classList.toggle('is-auto-hidden', autoHidden);

            if (autoHidden) {
                tocRoot.classList.remove('is-collapsed');
                updateToggleUi();
                return;
            }

            var mode = getEffectiveMode();
            var threshold = getCollapseThresholdByMode(mode);
            var overlapCollapse = shouldCollapseForOverlap();
            if (!manualOverride) {
                manualCollapsed = window.innerWidth <= Math.max(fallbackCollapseWidth, threshold) || overlapCollapse;
            }

            tocRoot.classList.toggle('is-collapsed', manualCollapsed);
            updateToggleUi();
            lastMode = mode;
        }

        function refreshActive() {
            var probeY = window.scrollY + 140;
            var activeIndex = 0;

            headings.forEach(function (heading, idx) {
                var top = heading.getBoundingClientRect().top + window.scrollY;
                if (top <= probeY) {
                    activeIndex = idx;
                }
            });

            tocItems.forEach(function (item, idx) {
                item.classList.toggle('active', idx === activeIndex);
            });
        }

        var ticking = false;
        function onScroll() {
            if (ticking) {
                return;
            }

            ticking = true;
            window.requestAnimationFrame(function () {
                refreshActive();
                ticking = false;
            });
        }

        window.addEventListener('scroll', onScroll, {passive: true});
        window.addEventListener('resize', function () {
            onScroll();
            evaluateTocLayout();
        });
        refreshActive();
        evaluateTocLayout();

        if (toggleButton) {
            toggleButton.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                if (autoHidden) {
                    return;
                }
                manualOverride = true;
                manualCollapsed = !manualCollapsed;
                tocRoot.classList.toggle('is-collapsed', manualCollapsed);
                updateToggleUi();
            });
        }

        var observer = new MutationObserver(function () {
            var mode = getEffectiveMode();
            if (mode !== lastMode) {
                manualOverride = false;
            }
            onScroll();
        });
        observer.observe(document.body, {attributes: true, attributeFilter: ['data-reading-width']});
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildToc);
    } else {
        buildToc();
    }
})();

