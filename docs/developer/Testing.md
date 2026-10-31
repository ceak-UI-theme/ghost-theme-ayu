# Theme tests and CI

The P2 suite is self-contained. It uses local Handlebars/NQL fixtures and browser request interception, not public Ghost APIs, an Admin key, or a database.

```sh
npm ci
npx playwright install --with-deps chromium
npm run test:smoke
npm run test:unit
npm run test:fixture-browser
npm run zip
python3 tests/verify-theme-zip.py dist/signal-wave-ayu.zip
```

Run from the repository root. CI uses Node22 on Ubuntu24.04 with one Playwright worker per suite. Local Windows/WSL can use an installed Node runtime with the same script files. `npm test` retains the older GScan command; the explicit scripts above and CI define the complete P2 gate.

| Scope | Command/file | Cases |
|---|---|---:|
| Legacy smoke | test:smoke / tests/theme-smoke.test.mjs | 18 |
| Content API | tests/content-api-validation.test.cjs | 21 |
| SSR fixture | tests/hub-ssr.test.cjs | 58 |
| Tag coverage unit | tests/tag-coverage.test.cjs | 44 |
| Hub fixture browser | tests/hub-playwright.config.mjs | 16 |
| P2 fixture browser | tests/p2-playwright.config.mjs | 98 |
| Tag fixture browser | tests/tag-coverage-playwright.config.mjs | 104 |
| Existing regression subtotal | Unchanged P2 suites | **341** |
| Total including smoke | All above | **359** |

Smoke preserves tag-detail featured/latest/fallback/pagination and archive/ad styling checks. Obsolete fixed-three-post and inline-sixth-ad checks follow the current collection pagination and shared five-card promo policy. It checks hub routes/partials, small ko/en SSR output, metadata wiring, validated async enhancement, error preservation, and search/history initialization. It does not duplicate the full browser suite or replace any of the341 cases.

## Linux GScan and packaging

CI runs `.github/workflows/theme-validation.yml` for PRs to main, pushes to main, and manual dispatch. It has read-only repository permissions and no deployment credentials. No tests use `pull_request_target` or production APIs.

`npm run zip` invokes the existing Gulp build and packages theme files, including gulpfile.js. The ZIP verifier checks CRC, safe paths, exact file set, source bytes, package version, credential patterns and actual extraction. Runtime assets are built normally; source-map/build newline changes are not functional theme changes.

CI validates the **extracted ZIP**, not the repository with test/report files. It runs the original GScan6.6.1 v6 from the same immutable Ghost6.73.0 image used locally:

```sh
docker run --rm --network none \
  --mount "type=bind,source=$PWD,target=/deps,readonly" \
  --mount "type=bind,source=/absolute/extracted-theme,target=/theme,readonly" \
  ghost@sha256:4195f6c405e40230cd10c0770425cf500c1f542a96e9f6584c11649c150e5a89 \
  node /deps/reports/release-gate-2026-10-31/gscan-linux.cjs \
  /var/lib/ghost/current/node_modules/gscan v6
```

The container runs only Node and the checker. It never boots a Ghost server or touches a development DB. The adapter fails on errors **or warnings**; recommendations remain visible. The known Windows GScan5.2.5 partial-path cache error is not suppressed by patching GScan or reducing SSR content.

## Other tests

`tests/e2e/*.spec.mjs` and the root playwright.config.mjs target an existing development Ghost (PLAYWRIGHT_BASE_URL or its configured private default). This includes audio/player/debug/screenshots, reading width, runtime, taxonomy, round UI and real hub SSR checks. They need a controlled Ghost dataset and some rely on specific existing posts. They are preserved and **not represented as CI passes**. `npm run test:e2e` still invokes this separate suite. Do not point it at production to make CI work.

`tests/hub-fixture.cjs` is the shared test adapter, not a test count by itself. The3 fixture Playwright configs select only the self-contained regression files. `tests/verify-theme-zip.py` is a separate packaging check, not an additional behavioral case count. Real Ghost5/6 integration and live API evidence are reported separately from359 self-contained cases.

Official workflow/browser setup references: [Playwright CI](https://playwright.dev/docs/ci), [GitHub workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax).
