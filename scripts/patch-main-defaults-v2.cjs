const fs = require('fs');
const path = 'D:/workspace/02.works/ghost-theme-ayu/assets/js/main.js';
let raw = fs.readFileSync(path, 'utf8');

if (!raw.includes('var AYU_DEFAULT_IMAGES = {')) {
  raw = raw.replace(
    'var AYU_GLOBALS = {',
`var AYU_DEFAULT_IMAGES = {
    POST: '/assets/images/fallback/post-default.png',
    PRIMARY_TAG: '/assets/images/fallback/primary-tag-default.png',
    SERIES_TAG: '/assets/images/fallback/series-tag-default.png',
    SECONDARY_TAG: '/assets/images/fallback/secondary-tag-default.png'
};

var AYU_GLOBALS = {`
  );
}

raw = raw.replace(
  /mediaHtml = '<span class="letter">' \+ escapeHtml\(\(post\.title \|\| '\\?'\)\.charAt\(0\)\) \+ '<\\/span>';/,
  `mediaHtml = '<img class="post-image lazyload u-object-fit" src="' + escapeHtml(AYU_DEFAULT_IMAGES.POST) + '" alt="' + title + '">';`
);

raw = raw.replace(
  /var initial = escapeHtml\(\(tagInfo\.name \|\| '\\?'\)\.charAt\(0\)\);\s*\n\s*return \[\s*\n\s*'<article class="post category-post">',\s*\n\s*'<div class="post-media">',\s*\n\s*'<div class="u-placeholder square">',\s*\n\s*'<a href="\/tag\/',\s*\n\s*encodeURIComponent\(tagInfo\.slug\),\s*\n\s*'\/">',\s*\n\s*'<span class="letter">',\s*\n\s*initial,\s*\n\s*'<\\/span>',/m,
`return [
            '<article class="post category-post">',
            '<div class="post-media">',
            '<div class="u-placeholder square">',
            '<a href="/tag/',
            encodeURIComponent(tagInfo.slug),
            '/">',
            '<img class="post-image lazyload u-object-fit" src="' + escapeHtml(AYU_DEFAULT_IMAGES.PRIMARY_TAG) + '" alt="' + escapeHtml(tagInfo.name) + '">',`
);

raw = raw.replace(
  /function gridCardHtml\(tagInfo\) \{[\s\S]*?var thumb = \[[\s\S]*?escapeHtml\(tagInfo\.feature_image\),/m,
`function gridCardHtml(tagInfo) {
        var thumbSource = tagInfo.feature_image || AYU_DEFAULT_IMAGES.SECONDARY_TAG;
        var thumb = [
            '<img class="secondary-tag-thumb-image" src="',
            escapeHtml(thumbSource),`
);

if (!raw.includes('var imageSource = tagInfo.feature_image || AYU_DEFAULT_IMAGES.SECONDARY_TAG;')) {
  raw = raw.replace(
    'var image = tagInfo.feature_image ? [',
    `var imageSource = tagInfo.feature_image || AYU_DEFAULT_IMAGES.SECONDARY_TAG;
        var image = [`
  );
  raw = raw.replace("escapeHtml(tagInfo.feature_image),", "escapeHtml(imageSource),");
  raw = raw.replace("] .join('') : '';", "].join('');");
  raw = raw.replace("].join('') : '';", "].join('');");
}

fs.writeFileSync(path, raw, 'utf8');