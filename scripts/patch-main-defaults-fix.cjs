const fs = require('fs');
const path = 'D:/workspace/02.works/ghost-theme-ayu/assets/js/main.js';
let raw = fs.readFileSync(path, 'utf8');

raw = raw.replace(
`    function cardHtml(tagInfo) {
        var desc = tagInfo.description ? escapeHtml(tagInfo.description) : 'Primary category archive';
        var initial = escapeHtml((tagInfo.name || '?').charAt(0));

        return [
            '<article class="post category-post">',
            '<div class="post-media">',
            '<div class="u-placeholder square">',
            '<a href="/tag/',
            encodeURIComponent(tagInfo.slug),
            '/">',
            '<span class="letter">',
            initial,
            '</span>',
            '</a>',
            '</div>',
            '</div>',`,
`    function cardHtml(tagInfo) {
        var desc = tagInfo.description ? escapeHtml(tagInfo.description) : 'Primary category archive';

        return [
            '<article class="post category-post">',
            '<div class="post-media">',
            '<div class="u-placeholder square">',
            '<a href="/tag/',
            encodeURIComponent(tagInfo.slug),
            '/">',
            '<img class="post-image lazyload u-object-fit" src="' + escapeHtml(AYU_DEFAULT_IMAGES.PRIMARY_TAG) + '" alt="' + escapeHtml(tagInfo.name) + '">',
            '</a>',
            '</div>',
            '</div>',`
);

raw = raw.replace(
`    function gridCardHtml(tagInfo) {
        var initial = escapeHtml((tagInfo.name || '?').charAt(0));
        var thumb = [
            '<img class="secondary-tag-thumb-image" src="',
            escapeHtml(tagInfo.feature_image),
            '" alt="',
            escapeHtml(tagInfo.name),
            '">' 
        ].join('');`,
`    function gridCardHtml(tagInfo) {
        var thumbSource = tagInfo.feature_image || AYU_DEFAULT_IMAGES.SECONDARY_TAG;
        var thumb = [
            '<img class="secondary-tag-thumb-image" src="',
            escapeHtml(thumbSource),
            '" alt="',
            escapeHtml(tagInfo.name),
            '">' 
        ].join('');`
);

// normalize accidental spacing variant
raw = raw.replace("'\\">' \n        ].join('');", "'\\">'\n        ].join('');");

fs.writeFileSync(path, raw, 'utf8');