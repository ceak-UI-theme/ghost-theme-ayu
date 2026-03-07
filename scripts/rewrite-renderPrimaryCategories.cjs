const fs = require('fs');
const path = 'D:/workspace/02.works/ghost-theme-ayu/assets/js/main.js';
let raw = fs.readFileSync(path, 'utf8');

const start = raw.indexOf('function renderPrimaryCategories() {');
const end = raw.indexOf('function renderSecondaryTags() {');
if (start === -1 || end === -1 || end <= start) {
  throw new Error('Failed to locate renderPrimaryCategories block');
}

const replacement = `function renderPrimaryCategories() {
    'use strict';

    var isCategoriesPage = /^\/categories\/?$/.test(window.location.pathname);
    if (!isCategoriesPage) {
        return;
    }

    var featuredGrid = document.getElementById('primary-featured-grid');
    var listGrid = document.getElementById('primary-list-grid');

    if (!featuredGrid || !listGrid) {
        return;
    }

    var keyScript = document.querySelector('script[data-key]');
    var contentKey = keyScript ? keyScript.getAttribute('data-key') : '';

    if (!contentKey) {
        featuredGrid.innerHTML = '<div class="term-empty">Failed to load categories.</div>';
        listGrid.innerHTML = '';
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

    function cardHtml(tagInfo) {
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
            '</div>',
            '<div class="post-wrapper">',
            '<header class="post-header">',
            '<div class="post-meta"><span class="post-tag">Primary</span> | ',
            String(tagInfo.count),
            ' posts</div>',
            '<h3 class="post-title"><a class="post-title-link" href="/tag/',
            encodeURIComponent(tagInfo.slug),
            '/">',
            escapeHtml(tagInfo.name),
            '</a></h3>',
            '</header>',
            '<div class="post-excerpt">',
            desc,
            '</div>',
            '</div>',
            '</article>'
        ].join('');
    }

    function fetchPrimaryCategories() {
        var tagsUrl = '/ghost/api/content/tags/?key=' + encodeURIComponent(contentKey) + '&limit=all';

        return fetch(tagsUrl)
            .then(function (res) {
                if (!res.ok) {
                    throw new Error('Failed to fetch tags for categories');
                }
                return res.json();
            })
            .then(function (data) {
                var publicTags = (data.tags || []).filter(function (tag) {
                    return tag && tag.slug && tag.visibility === 'public' && tag.slug.indexOf('hash-') !== 0;
                });

                return Promise.all(publicTags.map(function (tag) {
                    var postsUrl = '/ghost/api/content/posts/?key=' + encodeURIComponent(contentKey) + '&filter=primary_tag:' + encodeURIComponent(tag.slug) + '&limit=1';

                    return fetch(postsUrl)
                        .then(function (res) {
                            if (!res.ok) {
                                throw new Error('Failed to fetch primary tag posts');
                            }
                            return res.json();
                        })
                        .then(function (postsData) {
                            var pagination = postsData.meta && postsData.meta.pagination ? postsData.meta.pagination : null;
                            var total = pagination && typeof pagination.total === 'number' ? pagination.total : 0;

                            return {
                                slug: tag.slug,
                                name: tag.name || tag.slug,
                                description: tag.description || '',
                                count: total
                            };
                        });
                }));
            })
            .then(function (tags) {
                return tags.filter(function (tag) {
                    return tag.count > 0;
                });
            });
    }

    fetchPrimaryCategories()
        .then(function (tags) {
            if (!tags.length) {
                featuredGrid.innerHTML = '<div class="term-empty">nothing happened</div>';
                listGrid.innerHTML = '';
                return;
            }

            tags.sort(function (a, b) {
                return b.count - a.count;
            });

            var featuredTag = tags[0];
            featuredGrid.innerHTML = cardHtml(featuredTag);

            var listTags = tags.filter(function (tag) {
                return tag.slug !== featuredTag.slug;
            });

            listTags.sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });

            if (!listTags.length) {
                listGrid.innerHTML = '<div class="term-empty">No additional categories.</div>';
                return;
            }

            listGrid.innerHTML = listTags.map(cardHtml).join('');
            injectPromoSlots(listGrid);
        })
        .catch(function () {
            featuredGrid.innerHTML = '<div class="term-empty">Failed to load categories.</div>';
            listGrid.innerHTML = '';
        });
}


`;

raw = raw.slice(0, start) + replacement + raw.slice(end);
fs.writeFileSync(path, raw, 'utf8');