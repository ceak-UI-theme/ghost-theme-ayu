var AYU_TAG_PREFIX = {
    CATEGORY: 'category-',
    SERIES: 'series-'
};

var AYU_TAXONOMY = {
    ROLE: {
        CATEGORY: 'category',
        SERIES: 'series',
        TOPIC: 'topic'
    },
    ROLE_CLASS: {
        category: ['is-primary-tag', 'tag-category'],
        series: ['is-series-tag', 'tag-series'],
        topic: ['is-secondary-tag', 'tag-topic']
    },
    RENDERED: {
        SERVER: 'server',
        CLIENT: 'client'
    }
};

function resolveTaxonomyRoleFromSlug(slug) {
    'use strict';

    if (AYU_TAG_UTILS.isCategoryTag(slug)) {
        return AYU_TAXONOMY.ROLE.CATEGORY;
    }

    if (AYU_TAG_UTILS.isSeriesTag(slug)) {
        return AYU_TAXONOMY.ROLE.SERIES;
    }

    return AYU_TAXONOMY.ROLE.TOPIC;
}

function normalizeTaxonomyRole(role) {
    'use strict';

    var raw = String(role || '').trim().toLowerCase();
    if (raw === AYU_TAXONOMY.ROLE.CATEGORY || raw === AYU_TAXONOMY.ROLE.SERIES || raw === AYU_TAXONOMY.ROLE.TOPIC) {
        return raw;
    }

    return '';
}

function resolveStrictTaxonomyRole(slug, role) {
    'use strict';

    var normalizedRole = normalizeTaxonomyRole(role);
    var strictRole = resolveTaxonomyRoleFromSlug(slug);

    if (strictRole === AYU_TAXONOMY.ROLE.CATEGORY || strictRole === AYU_TAXONOMY.ROLE.SERIES) {
        return strictRole;
    }

    if (normalizedRole === AYU_TAXONOMY.ROLE.CATEGORY || normalizedRole === AYU_TAXONOMY.ROLE.SERIES) {
        return strictRole;
    }

    return normalizedRole || strictRole;
}

function applyTaxonomyRoleClasses(tagEl, role) {
    'use strict';

    var classes = AYU_TAXONOMY.ROLE_CLASS[role] || AYU_TAXONOMY.ROLE_CLASS.topic;
    classes.forEach(function (className) {
        tagEl.classList.add(className);
    });
}

// Taxonomy helpers (Category / Series / Topic) based on slug prefixes.
var AYU_TAG_UTILS = {
    getSlug: function (tag) {
        if (!tag) {
            return '';
        }

        if (typeof tag === 'string') {
            return tag;
        }

        return tag.slug || '';
    },
    isPublicTag: function (tag) {
        var slug = this.getSlug(tag);
        if (!slug) {
            return false;
        }

        if (!tag || typeof tag === 'string' || typeof tag.visibility === 'undefined') {
            return true;
        }

        return tag.visibility === 'public';
    },
    isCategoryTag: function (tag) {
        var slug = this.getSlug(tag);
        return slug.indexOf(AYU_TAG_PREFIX.CATEGORY) === 0;
    },
    isSeriesTag: function (tag) {
        var slug = this.getSlug(tag);
        return slug.indexOf(AYU_TAG_PREFIX.SERIES) === 0;
    },
    isTopicTag: function (tag) {
        return this.isPublicTag(tag) && !this.isCategoryTag(tag) && !this.isSeriesTag(tag);
    },
    // Backward-compatible alias; prefer isTopicTag in new code.
    isSecondaryTag: function (tag) {
        return this.isTopicTag(tag);
    },
    extractSeriesSlug: function (tag) {
        var slug = this.getSlug(tag);
        if (slug.indexOf(AYU_TAG_PREFIX.SERIES) === 0) {
            return slug.substring(AYU_TAG_PREFIX.SERIES.length);
        }

        return slug;
    },
    getDisplayName: function (tag, fallback) {
        var rawName = tag && typeof tag === 'object' && tag.name ? String(tag.name).trim() : '';
        if (rawName) {
            return rawName;
        }

        var slug = this.getSlug(tag) || String(fallback || '');
        var normalized = slug;

        if (normalized.indexOf(AYU_TAG_PREFIX.CATEGORY) === 0) {
            normalized = normalized.substring(AYU_TAG_PREFIX.CATEGORY.length);
        } else if (normalized.indexOf(AYU_TAG_PREFIX.SERIES) === 0) {
            normalized = normalized.substring(AYU_TAG_PREFIX.SERIES.length);
        }

        normalized = normalized.replace(/-/g, ' ').trim();
        if (!normalized) {
            normalized = 'Untitled';
        }

        return normalized.split(/\s+/).map(function (word) {
            return word.charAt(0).toUpperCase() + word.substring(1);
        }).join(' ');
    },
    classifyPostTags: function (post) {
        var self = this;
        var allTags = Array.isArray(post && post.tags) ? post.tags.filter(function (tag) {
            return self.isPublicTag(tag);
        }) : [];

        function dedupeBySlug(items) {
            var seen = {};
            return items.filter(function (tag) {
                var slug = self.getSlug(tag);
                if (!slug || seen[slug]) {
                    return false;
                }

                seen[slug] = true;
                return true;
            });
        }

        var categoryTags = dedupeBySlug(allTags.filter(function (tag) {
            return self.isCategoryTag(tag);
        }));
        var seriesTags = dedupeBySlug(allTags.filter(function (tag) {
            return self.isSeriesTag(tag);
        }));
        var secondaryTags = dedupeBySlug(allTags.filter(function (tag) {
            return self.isTopicTag(tag);
        }));

        var ordered = categoryTags.concat(seriesTags, secondaryTags);

        return {
            primary: categoryTags.length ? categoryTags[0] : null,
            categories: categoryTags,
            series: seriesTags,
            secondary: secondaryTags,
            ordered: ordered
        };
    }
};

function buildPostTagsHtml(post, escapeHtml, maxCount) {
    'use strict';

    var classified = AYU_TAG_UTILS.classifyPostTags(post);
    var tags = classified.ordered;

    if (typeof maxCount === 'number' && maxCount >= 0) {
        tags = tags.slice(0, maxCount);
    }

    return tags.map(function (tag) {
        var slug = AYU_TAG_UTILS.getSlug(tag);
        var href = '/tag/' + encodeURIComponent(slug) + '/';
        var cls = 'post-tag post-tag-' + escapeHtml(slug);
        var displayName = AYU_TAG_UTILS.getDisplayName(tag, slug);
        var role = resolveTaxonomyRoleFromSlug(slug);
        var roleClasses = AYU_TAXONOMY.ROLE_CLASS[role] || AYU_TAXONOMY.ROLE_CLASS.topic;
        cls += ' ' + roleClasses.join(' ');

        return '<a class="' + cls + '" href="' + href + '" title="' + escapeHtml(displayName) + '" data-tag-slug="' + escapeHtml(slug) + '" data-tag-name="' + escapeHtml(displayName) + '" data-taxonomy-role="' + escapeHtml(role) + '" data-taxonomy-rendered="' + AYU_TAXONOMY.RENDERED.CLIENT + '">' + escapeHtml(displayName) + '</a>';
    }).join('');
}

function normalizePostTaxonomyTags(root) {
    'use strict';

    var scope = root || document;
    var tags = scope.querySelectorAll ? scope.querySelectorAll('.post-meta-tags .post-tag, .post-meta .post-tag') : [];

    Array.prototype.slice.call(tags).forEach(function (tagEl) {
        if (!tagEl || !tagEl.getAttribute) {
            return;
        }

        var href = tagEl.getAttribute('href') || '';
        var cls = tagEl.className || '';
        var slug = tagEl.getAttribute('data-tag-slug') || '';
        var tagName = tagEl.getAttribute('data-tag-name') || '';

        if (!slug) {
            var slugMatch = cls.match(/(?:^|\s)post-tag-([^\s]+)/);
            slug = slugMatch ? slugMatch[1] : '';
        }

        if (!slug && href.indexOf('/tag/') !== -1) {
            var path = href.split('?')[0];
            var m = path.match(/\/tag\/([^/]+)\/?$/);
            slug = m ? decodeURIComponent(m[1]) : '';
        }

        var visibility = (tagEl.getAttribute('data-tag-visibility') || '').trim();
        var isPublic = visibility ? visibility === 'public' : AYU_TAG_UTILS.isPublicTag(slug);
        if (!isPublic) {
            tagEl.remove();
            return;
        }

        var renderedMode = (tagEl.getAttribute('data-taxonomy-rendered') || '').trim().toLowerCase();

        // Role resolution priority:
        // 1) Template-provided taxonomy role (server-rendered DOM)
        // 2) Slug prefix fallback (category-* / series-* / topic)
        var role = resolveStrictTaxonomyRole(slug, tagEl.getAttribute('data-taxonomy-role'));
        tagEl.setAttribute('data-taxonomy-role', role);

        if (!tagEl.classList.contains('is-primary-tag') && !tagEl.classList.contains('is-series-tag') && !tagEl.classList.contains('is-secondary-tag')) {
            applyTaxonomyRoleClasses(tagEl, role);
        }

        if (!slug) {
            return;
        }

        if (renderedMode === AYU_TAXONOMY.RENDERED.SERVER) {
            if (!tagEl.getAttribute('title')) {
                tagEl.setAttribute('title', (tagEl.textContent || '').trim());
            }
            return;
        }

        applyTaxonomyRoleClasses(tagEl, role);

        tagEl.setAttribute('href', '/tag/' + encodeURIComponent(slug) + '/');

        var displayName = AYU_TAG_UTILS.getDisplayName({
            slug: slug,
            name: tagName
        }, slug);
        tagEl.textContent = displayName;
        tagEl.setAttribute('title', displayName);
    });

    var containers = scope.querySelectorAll ? scope.querySelectorAll('.post-meta-tags') : [];
    Array.prototype.slice.call(containers).forEach(function (container) {
        if (!container.querySelector('.post-tag')) {
            container.remove();
        }
    });

    var metaContainers = scope.querySelectorAll ? scope.querySelectorAll('.post-meta') : [];
    Array.prototype.slice.call(metaContainers).forEach(function (metaEl) {
        var seriesTags = metaEl.querySelectorAll ? metaEl.querySelectorAll('.post-tag[data-taxonomy-role="series"]') : [];
        Array.prototype.slice.call(seriesTags).forEach(function (seriesTag, index) {
            var isInactive = index > 0;
            seriesTag.classList.toggle('is-inactive-series-tag', isInactive);
            if (isInactive) {
                seriesTag.setAttribute('aria-disabled', 'true');
                seriesTag.setAttribute('tabindex', '-1');
            } else {
                seriesTag.removeAttribute('aria-disabled');
                seriesTag.removeAttribute('tabindex');
            }
        });
    });
}

function normalizeTagHeaderName(root) {
    'use strict';

    var isTagPage = /^\/tag\/([^/]+)\/?$/.exec(window.location.pathname);
    if (!isTagPage || !isTagPage[1]) {
        return;
    }

    var slug = decodeURIComponent(isTagPage[1]);
    if (!AYU_TAG_UTILS.isCategoryTag(slug) && !AYU_TAG_UTILS.isSeriesTag(slug)) {
        return;
    }

    var scope = root || document;
    var titleEl = scope.querySelector ? scope.querySelector('.term-name') : null;
    if (!titleEl) {
        return;
    }

    var currentName = (titleEl.textContent || '').trim();
    titleEl.textContent = AYU_TAG_UTILS.getDisplayName({
        slug: slug,
        name: currentName
    }, slug);
}
