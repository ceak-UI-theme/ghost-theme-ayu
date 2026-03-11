function cover() {
    'use strict';

    var image = document.querySelector('.cover-image');
    var coverEl = document.querySelector('.site-cover');

    if (!image || !coverEl) {
        return;
    }

    function markInitialized() {
        coverEl.classList.add('initialized');
        image.removeAttribute('data-ayu-cover-bound');
    }

    if (image.complete) {
        markInitialized();
        return;
    }

    if (image.getAttribute('data-ayu-cover-bound') === 'true') {
        return;
    }
    image.setAttribute('data-ayu-cover-bound', 'true');

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
        if (toggle.getAttribute('data-ayu-theme-bound') === 'true') {
            return;
        }
        toggle.setAttribute('data-ayu-theme-bound', 'true');
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

function postReadingProgress() {
    'use strict';

    if (!document.body || !document.body.classList.contains('post-template')) {
        return;
    }

    var header = document.getElementById('gh-head');
    var progressRoot = header ? header.querySelector('.gh-reading-progress') : null;
    var progressBar = progressRoot ? progressRoot.querySelector('.gh-reading-progress-bar') : null;
    var content = document.querySelector('.post-content');

    if (!header || !progressRoot || !progressBar || !content) {
        return;
    }

    var ticking = false;
    var minDistance = 320;

    function clamp(value, min, max) {
        if (value < min) {
            return min;
        }
        if (value > max) {
            return max;
        }
        return value;
    }

    function computeMetrics() {
        var contentRect = content.getBoundingClientRect();
        var contentTop = contentRect.top + window.scrollY;
        var contentHeight = content.offsetHeight;
        var headerHeight = header.offsetHeight;
        var viewportHeight = window.innerHeight;
        var start = contentTop - headerHeight;
        var end = contentTop + contentHeight - (viewportHeight / 2);
        var distance = end - start;

        return {
            start: start,
            end: end,
            distance: distance
        };
    }

    function render() {
        var metrics = computeMetrics();
        var shouldShow = metrics.end > metrics.start && metrics.distance >= minDistance;
        progressRoot.classList.toggle('is-visible', shouldShow);

        if (shouldShow) {
            var ratio = (window.scrollY - metrics.start) / metrics.distance;
            var progress = clamp(ratio, 0, 1);
            progressBar.style.transform = 'scaleX(' + progress + ')';
        } else {
            progressBar.style.transform = 'scaleX(0)';
        }
    }

    function scheduleRender() {
        if (ticking) {
            return;
        }

        ticking = true;
        window.requestAnimationFrame(function () {
            render();
            ticking = false;
        });
    }

    window.addEventListener('scroll', scheduleRender, {passive: true});
    window.addEventListener('resize', scheduleRender);
    window.addEventListener('load', scheduleRender);
    scheduleRender();
}

function syncStickyHeaderOffset() {
    'use strict';

    var header = document.getElementById('gh-head');
    if (!header) {
        return;
    }

    var root = document.documentElement;
    var ticking = false;

    function applyOffset() {
        var headerHeight = header.offsetHeight;
        root.style.setProperty('--gh-head-height', String(headerHeight) + 'px');
    }

    function scheduleOffset() {
        if (ticking) {
            return;
        }

        ticking = true;
        window.requestAnimationFrame(function () {
            applyOffset();
            ticking = false;
        });
    }

    window.addEventListener('resize', scheduleOffset);
    window.addEventListener('orientationchange', scheduleOffset);
    window.addEventListener('load', scheduleOffset);

    var burger = document.querySelector('.gh-burger');
    if (burger) {
        burger.addEventListener('click', function () {
            window.requestAnimationFrame(scheduleOffset);
        });
    }

    scheduleOffset();
}
