function readingWidthToggle() {
    'use strict';

    if (!document.body || !document.body.classList.contains('post-template')) {
        return;
    }

    var content = document.querySelector('.post-content');
    var toggleRoot = document.querySelector('.js-reading-width-toggle');
    if (!content || !toggleRoot) {
        return;
    }

    var storageKey = 'ayu-reading-width';
    var validModes = ['normal', 'wide'];
    var mode = 'normal';
    var breakpoint = typeof window !== 'undefined' && window.AYU_GLOBALS && window.AYU_GLOBALS.MOBILE_BREAKPOINT
        ? Number(window.AYU_GLOBALS.MOBILE_BREAKPOINT) || 767
        : 767;

    function isMobileView() {
        return window.innerWidth <= breakpoint;
    }

    function applyModeToDom(nextMode) {
        var effectiveMode = isMobileView() ? 'normal' : nextMode;
        document.body.setAttribute('data-reading-width', effectiveMode);

        var buttons = toggleRoot.querySelectorAll('.reading-width-btn');
        Array.prototype.forEach.call(buttons, function (button) {
            var isActive = button.getAttribute('data-width-mode') === effectiveMode;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }

    function setMode(nextMode, saveToStorage) {
        mode = validModes.indexOf(nextMode) >= 0 ? nextMode : 'normal';
        if (saveToStorage) {
            try {
                localStorage.setItem(storageKey, mode);
            } catch (error) {
                // Ignore storage errors in restricted environments.
            }
        }
        applyModeToDom(mode);
    }

    try {
        var stored = localStorage.getItem(storageKey);
        if (validModes.indexOf(stored) >= 0) {
            mode = stored;
        }
    } catch (error) {
        mode = 'normal';
    }

    toggleRoot.addEventListener('click', function (event) {
        var button = event.target.closest('.reading-width-btn');
        if (!button) {
            return;
        }

        var nextMode = button.getAttribute('data-width-mode');
        if (validModes.indexOf(nextMode) < 0) {
            return;
        }

        setMode(nextMode, true);
    });

    var resizeTicking = false;
    window.addEventListener('resize', function () {
        if (resizeTicking) {
            return;
        }

        resizeTicking = true;
        window.requestAnimationFrame(function () {
            applyModeToDom(mode);
            resizeTicking = false;
        });
    });

    setMode(mode, false);
}
