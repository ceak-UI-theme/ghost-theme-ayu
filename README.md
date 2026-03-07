# signal-wave-ayu

A Ghost theme based on Wave, customized for a content-first technical blog.

## Taxonomy Model

This theme uses explicit public tag prefixes.

- `category-*` -> Category
- `series-*` -> Series
- all other public tags -> Topics

Examples:

- `category-ai`
- `series-unix-story`
- `docker`

## URL Structure

- `/categories/` -> Categories hub
- `/series/` -> Series hub
- `/secondary-tags/` -> Topics hub
- `/explore/` -> Explore hub
- `/tag/{slug}/` -> Ghost tag archive (including series detail, e.g. `/tag/series-unix-story/`)

Series detail is handled by Ghost tag archive only.

## Hub Pages

Hub page templates:

- `page-categories.hbs`
- `page-series.hbs`
- `page-secondary-tags.hbs`
- `page-explore.hbs`

Rendering strategy:

- Layout: Handlebars templates
- Data list: client-side JS via Ghost Content API

## Content API Usage

Main runtime script: `assets/js/main.js`

Core behavior:

- classify tags by slug prefix (`category-*`, `series-*`, topic)
- add taxonomy UI classes (`tag-category`, `tag-series`, `tag-topic`)
- normalize labels for display enhancement

Categories count optimization:

- uses `GET /ghost/api/content/tags/?limit=all&include=count.posts`
- reads `count.posts` directly
- does not use per-tag N+1 posts API calls

## Post Meta Rendering

`partials/post-meta.hbs` renders tag links and labels server-side first.

- JS enhances classes/labels
- if JS fails, tag links and names still work

## Development

```bash
npm install
npm run dev
```

Build zip:

```bash
npm run zip
```

Theme validation:

```bash
npm test
```

## License

MIT
