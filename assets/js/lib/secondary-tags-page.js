function renderSecondaryTags() {
    'use strict';

    var isSecondaryTagsPage = /^\/secondary-tags\/?$/.test(window.location.pathname);
    if (!isSecondaryTagsPage) {
        return;
    }

    var featuredSection = document.getElementById('secondary-tags-featured');
    var grid = document.getElementById('secondary-tags-grid');
    if (!featuredSection || !grid) {
        return;
    }

    var contentKey = getAyuContentApiKey();

    featuredSection.hidden = false;
    featuredSection.innerHTML = buildLoadingStateHtml();
    grid.innerHTML = buildSkeletonCards(8);

    if (!contentKey) {
        logAyuWarning('Content hub load failed: missing Content API key (secondary-tags)');
        featuredSection.innerHTML = buildTermErrorHtml();
        grid.innerHTML = '';
        return;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function featuredHtml(tagInfo) {
        var link = '/tag/' + encodeURIComponent(tagInfo.slug) + '/';
        var imageSource = tagInfo.feature_image || AYU_DEFAULT_IMAGES.SECONDARY_TAG;
        var image = [
            '<div class="tag-header-image-wrap">',
            '<a href="',
            link,
            '">',
            '<img class="tag-header-image" src="',
            escapeHtml(imageSource),
            '" alt="',
            escapeHtml(tagInfo.name),
            '">',
            '</a>',
            '</div>'
        ].join('');

        return [
            image,
            '<div class="secondary-tags-featured-body">',
            '<h2 class="term-name"><a href="',
            link,
            '">',
            escapeHtml(tagInfo.name),
            '</a></h2>',
            '<div class="term-description">',
            escapeHtml(tagInfo.description || 'Most-used topic archive.'),
            '</div>',
            '</div>'
        ].join('');
    }

    function gridCardHtml(tagInfo) {
        var thumbSource = tagInfo.feature_image || AYU_DEFAULT_IMAGES.SECONDARY_TAG;
        var thumb = [
            '<img class="secondary-tag-thumb-image" src="',
            escapeHtml(thumbSource),
            '" alt="',
            escapeHtml(tagInfo.name),
            '">'
        ].join('');

        return [
            '<a class="secondary-tag-card" href="/tag/',
            encodeURIComponent(tagInfo.slug),
            '/" title="',
            escapeHtml(tagInfo.name),
            '">',
            '<span class="secondary-tag-thumb">',
            thumb,
            '</span>',
            '<span class="secondary-tag-name">',
            escapeHtml(tagInfo.name),
            '</span>',
            '</a>'
        ].join('');
    }

    fetchAyuContentApiCollection('/ghost/api/content/tags/?key=' + encodeURIComponent(contentKey) + '&include=count.posts&limit=all', 'tags', { contentKey: contentKey })
        .then(function (allTags) {
            var tags = (allTags || []).filter(function (tag) {
                return AYU_TAG_UTILS.isTopicTag(tag);
            }).map(function (tag) {
                return {
                    slug: tag.slug,
                    name: AYU_TAG_UTILS.getDisplayName(tag, tag.slug),
                    description: tag.description || '',
                    feature_image: tag.feature_image || '',
                    count: tag.count && typeof tag.count.posts === 'number' ? tag.count.posts : 0
                };
            }).filter(function (tag) {
                return tag.count > 0;
            });

            if (!tags.length) {
                featuredSection.hidden = false;
                featuredSection.innerHTML = '<div class="term-empty">No topics found.</div>';
                grid.innerHTML = '';
                return;
            }

            tags.sort(function (a, b) {
                if (b.count !== a.count) {
                    return b.count - a.count;
                }

                return a.name.localeCompare(b.name);
            });

            var featured = tags[0];
            var rest = tags.slice(1);

            featuredSection.hidden = false;
            featuredSection.innerHTML = featuredHtml(featured);
            if (!rest.length) {
                grid.innerHTML = '<div class="term-empty">No additional topics.</div>';
                return;
            }

            grid.innerHTML = rest.map(gridCardHtml).join('');
        })
        .catch(function (error) {
            logAyuWarning('Content hub load failed (secondary-tags)', error);
            featuredSection.innerHTML = buildTermErrorHtml();
            grid.innerHTML = '';
        });
}
