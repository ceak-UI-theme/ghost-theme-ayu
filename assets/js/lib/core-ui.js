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
