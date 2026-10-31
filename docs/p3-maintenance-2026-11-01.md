# Small P3 fixes — 2026-11-01

- #1: remove inherited white cell gradients; make the native table scroll box fill the article column. Preserve intrinsic column sizing and horizontal overflow. Gist tables excluded from the new rules.
- #3: retain anonymous classification spans; explicit internal tags still removed. No Content API/fallback/SEO changes.
- Local: existing359 + targeted29 = **388 PASS**. Separate read-only Ghost5.130.6/Ghost6.73.0 browser checks:18 PASS (JS OFF/ON/API500). Server files/data unchanged.
- Dark/light ×390/1440 table tests cover gradients, scroll, width, text/background and surrounding paragraph layout. Badge tests cover ko/en, both widths and API failure.
- Gulp ZIP/integrity/extraction and Linux GScan v6 PASS: errors0/warnings0, existing recommendation1 remains.
- #5 deferred: only post/homepage groups are recognized; current AdSense/Integration metadata needs an Admin-grouping compatibility decision. No setting/group values changed.
- #4 excluded and OPEN. No member-flow investigation or operational changes.
- Before/after screenshots and full logs are local under reports/p3-2026-11-01; compact evidence: summary.json, table-proof.json, live-results.json.
- Issues stay OPEN while the PR is unmerged. #1's production KO/EN checklist is NOT RUN and must be verified separately before closure.
