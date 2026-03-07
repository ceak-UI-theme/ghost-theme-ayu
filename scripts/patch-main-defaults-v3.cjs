const fs = require('fs');
const path = 'D:/workspace/02.works/ghost-theme-ayu/assets/js/main.js';
let raw = fs.readFileSync(path, 'utf8');

if (!raw.includes('var AYU_DEFAULT_IMAGES = {')) {
  raw = raw.replace('var AYU_GLOBALS = {', `var AYU_DEFAULT_IMAGES = {\n    POST: '/assets/images/fallback/post-default.png',\n    PRIMARY_TAG: '/assets/images/fallback/primary-tag-default.png',\n    SERIES_TAG: '/assets/images/fallback/series-tag-default.png',\n    SECONDARY_TAG: '/assets/images/fallback/secondary-tag-default.png'\n};\n\nvar AYU_GLOBALS = {`);
}

const postNeedle = "mediaHtml = '<span class=\"letter\">' + escapeHtml((post.title || '?').charAt(0)) + '</span>';";
raw = raw.replace(postNeedle, "mediaHtml = '<img class=\"post-image lazyload u-object-fit\" src=\"' + escapeHtml(AYU_DEFAULT_IMAGES.POST) + '\" alt=\"' + title + '\">';");

const primaryNeedle = `var initial = escapeHtml((tagInfo.name || '?').charAt(0));\n\n        return [\n            '<article class="post category-post">',\n            '<div class="post-media">',\n            '<div class="u-placeholder square">',\n            '<a href="/tag/',\n            encodeURIComponent(tagInfo.slug),\n            '/">',\n            '<span class="letter">',\n            initial,\n            '</span>',`;
const primaryReplace = `return [\n            '<article class="post category-post">',\n            '<div class="post-media">',\n            '<div class="u-placeholder square">',\n            '<a href="/tag/',\n            encodeURIComponent(tagInfo.slug),\n            '/">',\n            '<img class="post-image lazyload u-object-fit" src="' + escapeHtml(AYU_DEFAULT_IMAGES.PRIMARY_TAG) + '" alt="' + escapeHtml(tagInfo.name) + '">',`;
raw = raw.replace(primaryNeedle, primaryReplace);

const secondaryNeedle = `function gridCardHtml(tagInfo) {\n        var initial = escapeHtml((tagInfo.name || '?').charAt(0));\n        var thumb = [\n            '<img class="secondary-tag-thumb-image" src="',\n            escapeHtml(tagInfo.feature_image),`;
const secondaryReplace = `function gridCardHtml(tagInfo) {\n        var thumbSource = tagInfo.feature_image || AYU_DEFAULT_IMAGES.SECONDARY_TAG;\n        var thumb = [\n            '<img class="secondary-tag-thumb-image" src="',\n            escapeHtml(thumbSource),`;
raw = raw.replace(secondaryNeedle, secondaryReplace);

if (!raw.includes('var imageSource = tagInfo.feature_image || AYU_DEFAULT_IMAGES.SECONDARY_TAG;')) {
  raw = raw.replace('var image = tagInfo.feature_image ? [', `var imageSource = tagInfo.feature_image || AYU_DEFAULT_IMAGES.SECONDARY_TAG;\n        var image = [`);
  raw = raw.replace('escapeHtml(tagInfo.feature_image),', 'escapeHtml(imageSource),');
  raw = raw.replace("].join('') : '';", "].join('');");
}

fs.writeFileSync(path, raw, 'utf8');