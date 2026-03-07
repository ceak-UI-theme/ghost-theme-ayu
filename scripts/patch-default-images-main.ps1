$path = 'D:\workspace\02.works\ghost-theme-ayu\assets\js\main.js'
$raw = Get-Content -Path $path -Raw

$raw = $raw -replace [regex]::Escape("var AYU_GLOBALS = {") , @"var AYU_DEFAULT_IMAGES = {
    POST: '/assets/images/fallback/post-default.png',
    PRIMARY_TAG: '/assets/images/fallback/primary-tag-default.png',
    SERIES_TAG: '/assets/images/fallback/series-tag-default.png',
    SECONDARY_TAG: '/assets/images/fallback/secondary-tag-default.png'
};

var AYU_GLOBALS = {
"@

$raw = $raw -replace [regex]::Escape("mediaHtml = '<span class=\"letter\">' + escapeHtml((post.title || '?').charAt(0)) + '</span>';"), "mediaHtml = '<img class=\"post-image lazyload u-object-fit\" src=\"' + escapeHtml(AYU_DEFAULT_IMAGES.POST) + '\" alt=\"' + title + '\">';"

$raw = $raw -replace [regex]::Escape("'<span class=\"letter\'>',`r`n            initial,`r`n            '</span>',"), "'<img class=\"post-image lazyload u-object-fit\" src=\"' + escapeHtml(AYU_DEFAULT_IMAGES.PRIMARY_TAG) + '\" alt=\"' + escapeHtml(tagInfo.name) + '\">',"

$raw = $raw -replace [regex]::Escape("var image = tagInfo.feature_image ? ["), "var imageSource = tagInfo.feature_image || AYU_DEFAULT_IMAGES.SECONDARY_TAG;`r`n        var image = ["
$raw = $raw -replace [regex]::Escape("escapeHtml(tagInfo.feature_image),"), "escapeHtml(imageSource),"
$raw = $raw -replace [regex]::Escape("].join('') : '';"), "].join('');"

$raw = $raw -replace [regex]::Escape("var thumb = tagInfo.feature_image ? ["), "var thumb = ["
$raw = $raw -replace [regex]::Escape("].join('') : '<span class=\"secondary-tag-thumb-letter\">' + initial + '</span>';"), "].join('');"

Set-Content -Path $path -Value $raw -NoNewline