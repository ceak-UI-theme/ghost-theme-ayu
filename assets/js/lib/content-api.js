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
