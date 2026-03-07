(function () {
    'use strict';

    function getMobileBreakpoint() {
        if (typeof window !== 'undefined' && window.AYU_GLOBALS && window.AYU_GLOBALS.MOBILE_BREAKPOINT) {
            return Number(window.AYU_GLOBALS.MOBILE_BREAKPOINT) || 767;
        }

        return 767;
    }

    function slugify(text) {
        return String(text || '')
            .toLowerCase()
            .normalize('NFKD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^\p{L}\p{N}\s-]/gu, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '') || 'section';
    }

    function buildToc() {
        var tocRoot = document.querySelector('.post-toc');
        var contentRoot = document.querySelector('.post-content');

        if (!tocRoot || !contentRoot) {
            return;
        }

        var headings = Array.prototype.slice.call(contentRoot.querySelectorAll('h1, h2, h3'));
        if (!headings.length) {
            return;
        }

        var usedIds = {};
        headings.forEach(function (heading) {
            var baseId = heading.id ? heading.id : slugify(heading.textContent);
            var nextId = baseId;
            var suffix = 2;

            while (usedIds[nextId] || document.getElementById(nextId) && document.getElementById(nextId) !== heading) {
                nextId = baseId + '-' + suffix;
                suffix += 1;
            }

            heading.id = nextId;
            usedIds[nextId] = true;
        });

        var listItems = headings.map(function (heading, index) {
            var tagName = heading.tagName.toLowerCase();
            var levelClass = 'toc-h2';
            if (tagName === 'h1') {
                levelClass = 'toc-h1';
            } else if (tagName === 'h3') {
                levelClass = 'toc-h3';
            }
            return '<li class="' + levelClass + '" data-toc-index="' + index + '"><a href="#' + heading.id + '">' + heading.textContent + '</a></li>';
        }).join('');

        tocRoot.innerHTML = [
            '<div class="post-toc-inner">',
            '<div class="toc-title">On this page</div>',
            '<ul class="post-toc-list">',
            listItems,
            '</ul>',
            '</div>'
        ].join('');

        tocRoot.hidden = false;

        var tocItems = Array.prototype.slice.call(tocRoot.querySelectorAll('li[data-toc-index]'));

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
        window.addEventListener('resize', onScroll);
        refreshActive();

        var touchLike = window.matchMedia('(pointer: coarse)').matches;
        if (touchLike) {
            return;
        }

        var dragging = false;
        var offsetX = 0;
        var offsetY = 0;
        var startX = 0;
        var startY = 0;

        tocRoot.addEventListener('mousedown', function (event) {
            if (window.innerWidth <= getMobileBreakpoint()) {
                return;
            }

            if (event.target && event.target.closest('a')) {
                return;
            }

            var rect = tocRoot.getBoundingClientRect();
            dragging = true;
            startX = event.clientX;
            startY = event.clientY;
            offsetX = startX - rect.left;
            offsetY = startY - rect.top;

            tocRoot.classList.add('is-dragging');
            tocRoot.style.left = rect.left + 'px';
            tocRoot.style.top = rect.top + 'px';
            tocRoot.style.right = 'auto';
            tocRoot.style.bottom = 'auto';
            event.preventDefault();
        });

        window.addEventListener('mousemove', function (event) {
            if (!dragging) {
                return;
            }

            var nextLeft = event.clientX - offsetX;
            var nextTop = event.clientY - offsetY;
            var maxLeft = window.innerWidth - tocRoot.offsetWidth;
            var maxTop = window.innerHeight - tocRoot.offsetHeight;

            if (nextLeft < 0) {
                nextLeft = 0;
            }
            if (nextTop < 0) {
                nextTop = 0;
            }
            if (nextLeft > maxLeft) {
                nextLeft = maxLeft;
            }
            if (nextTop > maxTop) {
                nextTop = maxTop;
            }

            tocRoot.style.left = nextLeft + 'px';
            tocRoot.style.top = nextTop + 'px';
        });

        window.addEventListener('mouseup', function (event) {
            if (!dragging) {
                return;
            }

            dragging = false;
            tocRoot.classList.remove('is-dragging');

            var moved = Math.abs(event.clientX - startX) + Math.abs(event.clientY - startY);
            if (moved < 4) {
                tocRoot.style.left = '';
                tocRoot.style.top = '';
                tocRoot.style.right = '';
                tocRoot.style.bottom = '';
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildToc);
    } else {
        buildToc();
    }
})();

