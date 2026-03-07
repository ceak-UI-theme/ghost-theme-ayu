const fs = require('fs');
const path = 'D:/workspace/02.works/ghost-theme-ayu/assets/js/lib/series-page.js';
let raw = fs.readFileSync(path, 'utf8');

raw = raw.replace(
  "var cardImage = tagInfo.feature_image || tagInfo.fallback_feature_image || '';",
  "var defaults = (typeof AYU_DEFAULT_IMAGES !== 'undefined' && AYU_DEFAULT_IMAGES) ? AYU_DEFAULT_IMAGES : {};\n        var cardImage = tagInfo.feature_image || tagInfo.fallback_feature_image || defaults.SERIES_TAG || '/assets/images/fallback/series-tag-default.png';"
);

raw = raw.replace(
  "        if (cardImage) {\n            mediaHtml = '<img class=\"post-image lazyload u-object-fit\" src=\"' + escapeHtml(cardImage) + '\" alt=\"' + escapeHtml(title) + '\">';\n        } else {\n            mediaHtml = '<span class=\"letter\">' + initial + '</span>';\n        }",
  "        mediaHtml = '<img class=\"post-image lazyload u-object-fit\" src=\"' + escapeHtml(cardImage) + '\" alt=\"' + escapeHtml(title) + '\">';"
);

raw = raw.replace(
  "        if (post.feature_image) {\n            mediaHtml = '<img class=\"post-image lazyload u-object-fit\" src=\"' + escapeHtml(post.feature_image) + '\" alt=\"' + title + '\">';\n        } else {\n            mediaHtml = '<span class=\"letter\">' + escapeHtml((post.title || '?').charAt(0)) + '</span>';\n        }",
  "        if (post.feature_image) {\n            mediaHtml = '<img class=\"post-image lazyload u-object-fit\" src=\"' + escapeHtml(post.feature_image) + '\" alt=\"' + title + '\">';\n        } else {\n            var defaultPostImage = (typeof AYU_DEFAULT_IMAGES !== 'undefined' && AYU_DEFAULT_IMAGES.POST) ? AYU_DEFAULT_IMAGES.POST : '/assets/images/fallback/post-default.png';\n            mediaHtml = '<img class=\"post-image lazyload u-object-fit\" src=\"' + escapeHtml(defaultPostImage) + '\" alt=\"' + title + '\">';\n        }"
);

fs.writeFileSync(path, raw, 'utf8');