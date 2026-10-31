# Ghost GHV-01~05 수정 및 로컬 회귀 검증 — 2026-10-31

> Git 증거 보관 범위: [reports README](README.md) **(로컬 전용)**. 로컬 전용 표시의 원본 캡처·실행 파일은 커밋하지 않았다.

보고서 생성: 2026-10-31T15:20:01.239329+09:00.

## 결과

GHV-01~05의 코드 수정을 완료했다. 운영 사이트는 변경하지 않았으며 commit/push/PR/병합/테마 업로드/재배포는 하지 않았다. 정상 응답·실패 응답·111개 검색·실제 이력과 ko/en SSR/SEO를 로컬에서 검증했다. **GScan은 기존 HEAD와 수정본 모두 재귀 partial 분석 중 내부 오류로 중단되어 FAIL이다. 전체 배포 검증 PASS로 판단하지 않는다.**

추가 호환성 한계: 실제 로컬 Ghost에서 배열 길이와 pagination.total이 다른 응답을 관측했다. 이 경우 새 코드는 요청한 완전성을 확정할 수 없어 SSR을 보존한다. JS 목록 갱신·페이지 버튼은 활성화되지 않을 수 있으나 네이티브 SSR 링크/details는 유지된다. 이를 임의의 0건으로 해석하지 않는다.

## 1. 시작 상태와 증거 구분

- 브랜치: `codex/fix-content-api-pagination`. 시작 HEAD: `b9e8f9fea072af9720c892868b983d5a675201c7`. `git fetch origin` 완료 후 해당 원격 브랜치와 ahead/behind **0/0**. 원격 내용을 병합하거나 reset하지 않았다.
- 시작 시 추적 파일 수정 없음. 미추적 `artifacts/check_audio_local.js`, 기존 `reports/`는 보존했다.
- 기존 운영 검증 보고서: [ghost-post-deploy-verification-2026-10-31.md](ghost-post-deploy-verification-2026-10-31.md). 거기에 있는 운영 111개/130개 데이터·5건 재현은 기존 증거다. 이번 작업에서 운영 사이트에 새 패치를 적용하거나 수정 결과를 운영에서 확인하지 않았다.
- 새 확인: 현재 코드의 localeCompare, JSON 1페이지 수집, replaceState, 비검증 empty 처리와 Ghost helper/실제 로컬 API의 동작을 직접 확인했다.
- 기존 Gulp·Playwright·HBS/NQL fixture를 사용했다. 실제 Ghost 검증은 설치되어 있던 **Ghost 5.130.6 / MySQL 8** 개발 데이터를 별도 DB `ayu_p2_20261031`로 복제하고 별도 컨테이너 `ghost-ayu-p2`, `127.0.0.1:2369`에서 실행했다. 기존 `ghost` 개발 DB와 운영 DB는 변경하지 않았다.

## 2. 결함별 원인과 변경

### GHV-04 — SEO

- 원인: 정적 커스텀 라우트에서 `meta_title`이 사이트명으로 귀결되고 설명이 없었다. 4개 페이지에 수동 OG/canonical을 추가하면 Ghost 기본 출력과 중복될 수 있다.
- 변경: 페이지별 `hub-title`/`hub-meta` 블록과 `partials/hub-seo.hbs`를 추가했다. default는 허브에서만 고유 title을 사용하고 `ghost_head exclude="social_data"`로 기본 social 출력만 제외한다. canonical·아이콘·schema·referrer·Portal·폰트·코드 주입 등 Ghost 기본 기능은 유지한다.
- description은 `meta_description`이 없을 때만 추가한다. Ghost가 설명을 제공하면 그 값과 OG 설명을 함께 사용한다. canonical을 직접 추가하지 않으며 hreflang을 생성하지 않는다. 비허브 default 분기는 기존 ghost_head를 유지한다.
- ko/en 4종 제목·설명은 실제 Ghost 원본 HTML에서 각각 유일하고 canonical/description/OG title/OG description은 각 1개였다. 정적 허브에 이미 설정된 native description이 존재하는 별도 라우트/운영 주입 조합은 이번 실제 Ghost 데이터에 없어 추가 실행하지 않았다.

| 허브 | 한국어 title 접두 | 영어 title 접두 |
|---|---|---|
| Explore | 탐색 | Explore |
| Categories | 카테고리 | Categories |
| Series | 시리즈 | Series |
| Secondary Tags | 주제 태그 | Topics |

각 title은 `접두 | 사이트명`이며 설명은 목적에 맞게 각 언어로 작성했다. 구체적인 수신 값은 아래 실제 Ghost 표와 HTML 증거 참조.

### GHV-02 — 응답 스키마·완전성

- 원인: 배열/메타 누락을 빈 배열로 바꾸고 성공 핸들러가 SSR을 empty 문구로 덮어썼다. 컬렉션 수집기는 next를 무조건 따라가고 페이지 완전성을 확인하지 않았다.
- 변경: `validateAyuContentApiPage`, `fetchAyuContentApiPage`로 배열·아이템의 필수 필드·정수 pagination·요청 page·limit/pages/total의 일관성·next/prev·페이지별 예상 길이·중복 ID를 검증한다. 최근 글의 제한된 1페이지 응답도 검증한다.
- 컬렉션은 기존 page/limit을 URLSearchParams로 교체해 중복 쿼리를 방지한다. 전체 페이지의 total/pages/limit이 유지되어야 하며, 페이지 간 ID 중복과 최종 수량 불일치도 거부한다. 최대 1,000페이지/100,000개를 허용하고 선언된 총계가 상한을 넘으면 첫 페이지에서 중단한다.
- 일부 실패 시 수집 결과를 반환하지 않으며 방문 페이지 캐시도 무효화한다. 잘못된 200 JSON이 session cache를 오염시켜 다음 요청도 계속 실패하지 않도록 검증 실패 캐시를 제거한다. 네 허브는 기존 catch에서 SSR을 보존한다. Explore는 태그·최근 글 두 응답 모두 완료·검증 후 DOM을 갱신한다.
- **정상 0건 정책**: 실제 배열 `[]`, 명시적인 정수 total=0, page=1, pages=0 또는 1, next/prev=null 등 일관된 완전한 응답은 권위 있는 정상 결과로 반영한다. SSR이 이전 데이터를 담고 있어도 empty 상태로 갱신한다. `{}`, 배열 누락/null, 메타 누락, total>0인데 빈 배열인 응답은 실패로 처리해 SSR을 유지한다. 단순히 빈 배열이면 항상 유지하는 정책은 아니다.

### GHV-05 — 전체 검색

- 원인: `fetchAyuContentApiJson`을 1회 호출해 반환된 첫 100개만 검색했다. limit=all도 운영 응답은 limit=100/next=2였다.
- 변경: 검증을 강화한 기존 `fetchAyuContentApiCollection(..., "posts")`을 재사용한다. 페이지 수집을 모두 마쳐야 검색을 수행하므로 일부 실패에서 첫 100개만 정상 결과로 노출하지 않는다. 기존 제목/요약 매칭·페이지 크기 10·전체 결과 수·쿼리 상태를 유지한다.
- 111개 제어 데이터에서 1/100/101/111번째 게시물의 고유 제목 검색, 전체 111개 결과·12페이지 및 마지막 글을 검사했다. 정상 0건/검색어 초기화·일부 페이지 실패도 검증했다.

### GHV-01 — 서버와 JS 정렬

- 원인: SSR의 DB `name asc`와 JS 표시 이름의 localeCompare가 서로 다른 정렬 기준이었다. 기존 보고서에서 상위 10개 집합 교체가 재현됐고 코드에도 재정렬이 있었다. 운영 DB collation 자체는 접근하지 않아 확정하지 않았다.
- 변경: SSR과 Content API에 동일한 `count.posts desc,name asc,slug asc`를 지정하고 JS 이름 재정렬을 제거했다. **정렬은 Ghost 서버에 맡기고 그 응답 순서를 유지**한다. 이름 collation이 동점인 경우 고유 slug가 마지막 tie breaker다. 브라우저 언어의 localeCompare를 새로 추측해 넣지 않았다.
- Categories 전체 목록은 기존 이름순을 유지하도록 HBS/API 모두 `name asc,slug asc`. 대표는 서버 이름순에서 최대 count를 선택하므로 SSR의 count→name→slug 순서와 일치한다. Series/Topics의 대표·분류 및 양수 count 필터는 유지했다.
- 실제 Ghost 테스트 DB에 동일 count의 한글·영문·악센트 이름 8개를 보강해 양수 시리즈를 13개로 만들었다. ko-KR/en-US 브라우저 환경에서 SSR과 JS 상위 10개 **순서 및 집합**을 대조했다. 0개 태그는 제외됐다. Categories/Topics도 순서가 일치하고, Series 첫 10개는 SSR 목록의 첫 10개와 일치했다.

### GHV-03 — URL과 브라우저 이력

- 원인: 사용자 페이지 이동/검색에도 replaceState를 호출했고 검색에는 popstate 복원이 없었다.
- 변경: Categories/Series의 버튼 이동은 pushState, 직접 진입·범위 보정·popstate는 replaceState. 동일 URL이면 이력을 쓰지 않는다.
- Search도 사용자 검색어 제출/페이지 버튼은 pushState, 결과 범위 보정과 popstate 복원은 replaceState. 검색어·페이지·입력창·결과를 URL로부터 복원한다. 제출 즉시 사용자 이력을 기록하고 결과 정규화는 추가 이력을 만들지 않는다.
- 비동기 검색 세대 번호로 늦은 이전 응답/오류가 새 상태를 덮어쓰지 못하게 했다. 새 검색이 진행 중일 때 이전 검색의 페이지 버튼은 제거한다.
- Categories/Series/Search의 1→2→Back→Forward, 직접 진입, 새로고침, 음수/9999 보정, 검색어 변경 후 Back/Forward, 빠른 이동 및 늦은 응답을 실제 Playwright history로 확인했다. 번호 2와 다음 화살표가 같은 data-page를 갖는 경우 첫 번호 버튼을 명시해 검사했다.

## 3. 테스트 결과

| 검사 | 결과 | 증거/범위 |
|---|---|---|
| fetch 및 원격 상태 | PASS | fetch 완료, HEAD와 해당 origin 브랜치 0/0 |
| Content API 단위 테스트 | PASS | [content-api-tests.log](p2-fixes-2026-10-31/content-api-tests.log) **(로컬 전용)** — 21개 스키마/완전성/상한/캐시/0건 |
| 기존 SSR/HBS/NQL 테스트 | PASS | [ssr-tests.log](p2-fixes-2026-10-31/ssr-tests.log) **(로컬 전용)** — 58개, 225개 태그의 무JS 추가 배치 포함 |
| 기존 Playwright 회귀 | PASS | [hub-browser.log](p2-fixes-2026-10-31/hub-browser.log) **(로컬 전용)** — 16개, ko/en 모바일·무JS·실패·정상·이력 |
| P2 세부 Playwright | PASS | [p2-browser-verified.log](p2-fixes-2026-10-31/p2-browser-verified.log) **(로컬 전용)** — 98개, 111개 검색·실패·0건·이력·race 및 미처리 예외 확인 |
| 실제 Ghost ko/en | PASS | [ko-ghost.log](p2-fixes-2026-10-31/ko-ghost.log) **(로컬 전용)**, [en-ghost.log](p2-fixes-2026-10-31/en-ghost.log) **(로컬 전용)** — 8개 허브, raw SSR/SEO·실제 API 정렬·모바일 JS ON/OFF |
| 실제 Ghost 불일치 API | PASS(보존) | [ghost-inconsistent-pagination.json](p2-fixes-2026-10-31/ghost-inconsistent-pagination.json) — 200이나 items/total 불일치 시 SSR 유지 |
| Gulp build | PASS | [build.log](p2-fixes-2026-10-31/build.log) **(로컬 전용)** — CSS/JS 빌드 완료, main.min.js 갱신 |
| Ghost GScan v5 | **FAIL** | [gscan-debug.log](p2-fixes-2026-10-31/gscan-debug.log), [gscan-baseline.log](p2-fixes-2026-10-31/gscan-baseline.log) — 기존/수정본 모두 stack overflow |
| 수정 후 운영 사이트 검증 | NOT RUN | 운영 미배포가 작업 조건 |
| 실제 모바일 기기/Safari/Firefox | NOT RUN | Chromium 모바일 뷰포트만 실행 |
| Search Console 선택 canonical | NOT RUN | 이번 로컬 코드 수정 범위 밖 |

정상 API/실패 모의는 테스트 브라우저의 fixture.test에만 적용했다. 네 허브 × ko/en에서 {}, 메타 누락, 짧은 페이지, 2페이지 실패, 401/403/500, 연결 실패, timedout, 빈 본문, 검증된 0건을 분리했다. 단위 테스트에는 잘못된 page/next/prev/타입/아이템, 페이지 간 총계 변경/중복, 상한 초과, 캐시 복구가 포함된다. timeout은 브라우저 reject 모의이며 긴 OS timeout까지 기다리거나 앱에 새 timeout 정책을 추가한 것은 아니다.

### 실제 Ghost 원본 메타 및 SSR 링크 수

테스트 DB는 개발 데이터 복제본에 정렬/0건 경계 태그를 추가한 것으로, 운영 DB의 태그 수와 같다고 주장하지 않는다. 각 언어는 독립 운영 DB 재현이 아니라 같은 격리 DB에서 theme site_locale/HTML locale을 전환해 검증했다.

| locale / 허브 | title | description 개수 | canonical 개수 | 영역별 SSR 고유 링크 수 |
|---|---|---:|---:|---|
| ko/explore | 탐색 | Signal Over Noise | 1 | 1 | #explore-categories-grid: 6, #explore-series-list: 10, #explore-topics-grid: 10, #explore-recent-list: 5 |
| ko/categories | 카테고리 | Signal Over Noise | 1 | 1 | #primary-featured-grid: 1, #primary-list-grid: 5 |
| ko/series | 시리즈 | Signal Over Noise | 1 | 1 | #series-featured-grid: 1, #series-list-grid: 12 |
| ko/secondary-tags | 주제 태그 | Signal Over Noise | 1 | 1 | #secondary-tags-featured: 1, #secondary-tags-grid: 16 |
| en/explore | Explore | Signal Over Noise | 1 | 1 | #explore-categories-grid: 6, #explore-series-list: 10, #explore-topics-grid: 10, #explore-recent-list: 5 |
| en/categories | Categories | Signal Over Noise | 1 | 1 | #primary-featured-grid: 1, #primary-list-grid: 5 |
| en/series | Series | Signal Over Noise | 1 | 1 | #series-featured-grid: 1, #series-list-grid: 12 |
| en/secondary-tags | Topics | Signal Over Noise | 1 | 1 | #secondary-tags-featured: 1, #secondary-tags-grid: 16 |

canonical은 모두 해당 로컬 허브의 self URL이다. description/OG description은 같고 title/OG title도 같다. 실제 값과 정상 API 상태는 [ko-ghost-results.json](p2-fixes-2026-10-31/ko-ghost-results.json) **(로컬 전용)**, [en-ghost-results.json](p2-fixes-2026-10-31/en-ghost-results.json) **(로컬 전용)**에 있다. language별 4종 title/description은 각각 유일하다. JS ON/OFF 390×844 스크린샷 16개와 키를 치환한 raw HTML 8개는 같은 증거 디렉터리에 저장했다. 레이아웃 가로 넘침은 없었다. 복제 데이터의 일부 이미지 경로가 기존 개발 호스트를 가리키므로 이미지 자산 전체의 가용성은 이번 PASS 범위에 포함하지 않는다.

### GScan FAIL 상세

`gscan@5.2.5 --v5` 및 programmatic check가 hub-category-pages/hub-series-pages/hub-topic-pages의 재귀 partial을 따라가다가 `Maximum call stack size exceeded`로 중단된다. HEAD 템플릿을 별도 디렉터리에 복원한 baseline도 동일하게 실패했다. 실제 Ghost는 이 partial을 렌더링했고 225개 태그 fixture도 유지됐다. 임시 검사 사본에서 재귀 자기 호출 3곳만 제거하면 검사가 완료되고 기존 package.json group 권고만 남았다(gscan-isolation.log). 이 사본은 소스/테스트 서버/배포본에 적용하지 않았고, 진단 후 원래 partial로 복원했다. 검사기를 임의로 수정하거나 재귀를 숨기는 동적 partial로 바꿔 PASS 처리하지 않았다. CLI가 오류를 출력하면서 0으로 종료하는 경우가 있어 exit code만으로 PASS 판정하지 않았다. **후속 배포 전 호환되는 GScan/부분 템플릿 구조의 검증 방법을 해결해야 한다.**

## 4. 변경 파일
- [assets/built/main.min.js](../assets/built/main.min.js)
- [assets/js/lib/categories-page.js](../assets/js/lib/categories-page.js)
- [assets/js/lib/content-api.js](../assets/js/lib/content-api.js)
- [assets/js/lib/explore-page.js](../assets/js/lib/explore-page.js)
- [assets/js/lib/search-page.js](../assets/js/lib/search-page.js)
- [assets/js/lib/secondary-tags-page.js](../assets/js/lib/secondary-tags-page.js)
- [assets/js/lib/series-page.js](../assets/js/lib/series-page.js)
- [default.hbs](../default.hbs)
- [page-categories.hbs](../page-categories.hbs)
- [page-explore.hbs](../page-explore.hbs)
- [page-secondary-tags.hbs](../page-secondary-tags.hbs)
- [page-series.hbs](../page-series.hbs)
- [partials/hub-category-pages.hbs](../partials/hub-category-pages.hbs)
- [partials/hub-series-pages.hbs](../partials/hub-series-pages.hbs)
- [partials/hub-topic-pages.hbs](../partials/hub-topic-pages.hbs)
- [tests/hub-browser.spec.mjs](../tests/hub-browser.spec.mjs)
- [tests/hub-fixture.cjs](../tests/hub-fixture.cjs)
- [tests/hub-ssr.test.cjs](../tests/hub-ssr.test.cjs)
- [partials/hub-seo.hbs](../partials/hub-seo.hbs)
- [tests/content-api-validation.test.cjs](../tests/content-api-validation.test.cjs)
- [tests/p2-playwright.config.mjs](../tests/p2-playwright.config.mjs)
- [tests/p2-regression.spec.mjs](../tests/p2-regression.spec.mjs)

위 목록 외 새 검증 로그·스크린샷·실행 스크립트·본 보고서는 reports/에만 생성했다. CSS는 빌드 결과가 기존과 줄바꿈 외 동일해 불필요한 줄바꿈 변경을 복원했다. 기존 sourcemap 파일은 이번 Gulp 설정에서 변하지 않았으며 배포에 사용하는 main.min.js는 재생성했다.

최종 빌드 main.min.js SHA-256: `74bfae935a2c9570eaf646cd456437a3ad917992da3257638b2f94a343983b7d`. 실제 테스트 컨테이너에 제공한 JS와 같은 해시를 확인했다. 배포용 zip 생성·업로드는 하지 않았다.

## 5. 남은 위험과 배포 전 확인

1. **GScan 미통과**: 기존 구조의 검사기 stack overflow는 남아 있다. 5개 런타임 결함의 수정과 별개로 배포 gate가 해결된 것으로 간주하면 안 된다.
2. **실제 Ghost의 pagination 불일치**: 기존 테스트 데이터의 draft-only/연결되지 않은 태그가 포함된 상태에서 API가 36개, total=38을 반환했다. SSR 32개 앵커는 그대로 보존됐다. 완전한 응답과 구분하려고 검증을 느슨하게 하지 않았다. 이런 데이터에서는 JS 갱신/페이지 버튼이 생기지 않을 수 있으므로 배포 전 해당 사이트의 태그 API 배열·메타 일치 여부를 읽기 전용으로 확인해야 한다. 운영 태그 정리는 이번 작업에서 하지 않았다.
3. **콘텐츠 동시 변경**: 총계/페이지/ID 검증으로 누락·중복을 감지하지만 Content API는 클라이언트에 DB 트랜잭션 snapshot을 제공하지 않는다. 수집 중 변동이 총계/중복으로 드러나지 않는 경우까지 원자성을 보증하지 않는다.
4. **운영 데이터/브라우저 범위**: 실제 운영 두 DB에 패치를 적용한 검사는 NOT RUN이다. 111개 검색은 제어 fixture, 실제 Ghost의 정렬·메타 검사는 격리 데이터로 수행했다. Safari/Firefox/실물 모바일은 미실행이다.
5. **메타 주입 정책**: 이번 4개 정적 라우트는 고유 설명을 사용한다. Ghost가 직접 제공하는 기존 설명이 있으면 중복 방지를 위해 존중한다. 운영의 별도 head injection이 canonical/OG를 강제로 추가하는 경우까지 테마가 제거하지는 않는다.
6. **운영 배포 순서**: 별도 승인 후 GScan gate 해결 → 동일 후보 빌드·백업 → HBS/partial/JS를 함께 배포 → 8개 원본 HTML의 unique title/description·self canonical 1개 확인 → JS 전후 상위 10개·API 실패 보존·실제 101번째/마지막 글 검색·Back/Forward 재검증. 클라이언트 캐시는 정렬 URL/명시 limit 변경으로 기존 키와 달라지지만 브라우저/CDN의 JS 갱신 여부를 확인해야 한다.

격리 테스트 컨테이너·DB·임시 DB 덤프·인증 env 파일은 검증 종료 후 제거했다. 원래 개발 Ghost/MySQL은 실행 상태를 유지하며 posts=28, tags=29로 시작 시 수와 같음을 확인했다. 기존 사용자 파일은 수정하지 않았다.

최종 증거 일관성 검사: [validation.log](p2-fixes-2026-10-31/validation.log). 소스 공백 검사: [diff-check.log](p2-fixes-2026-10-31/diff-check.log) **(로컬 전용)** (오류 없음). 대표 화면: [한국어 JS ON](p2-fixes-2026-10-31/ko-explore-js-mobile.png) **(로컬 전용)**, [영어 JS OFF](p2-fixes-2026-10-31/en-explore-nojs-mobile.png) **(로컬 전용)**. GScan 최종 실패: [gscan-v5-final.log](p2-fixes-2026-10-31/gscan-v5-final.log), 원인 분리: [gscan-isolation.log](p2-fixes-2026-10-31/gscan-isolation.log).

## 6. 종료 판단

- GHV-01: 수정 완료. Ghost 서버 정렬 공유와 실제 상위 10개 순서 일치 검증.
- GHV-02: 수정 완료. 비정상/불완전 응답은 SSR 보존, 명시적 정상 0건은 반영. 실제 Ghost의 불일치 응답은 위 호환성 한계로 기록.
- GHV-03: 수정 완료. 사용자 이력과 URL 정규화 분리, Search popstate/race 보강.
- GHV-04: 수정 완료. ko/en 허브별 메타, canonical/ghost_head 보존, hreflang 자동 생성 없음.
- GHV-05: 수정 완료. 전체 페이지 수집, 111개 경계 검색 및 일부 실패 검증.
- 기존 SSR 기능: 보존 확인.
- 미해결 gate: **GScan 내부 오류**. 따라서 “운영 배포 가능 전체 PASS”는 아니다.
- 운영 변경 및 Git 발행: 수행하지 않음.

재실행 명령(저장소 루트, 실행 가능한 Node 사용):

```text
node tests/content-api-validation.test.cjs
node tests/hub-ssr.test.cjs
node node_modules/@playwright/test/cli.js test -c tests/hub-playwright.config.mjs
node node_modules/@playwright/test/cli.js test -c tests/p2-playwright.config.mjs
node node_modules/gulp/bin/gulp.js build
node node_modules/gscan/bin/cli.js <theme-files-only-directory> --v5 --verbose
```

실제 Ghost 검사는 `local-ghost.cjs ko|en`을 사용했으며, 운영 주소가 아닌 localhost:2369 전용이다. 격리 DB와 13개 양수 시리즈/0개 경계 태그의 준비가 선행되어야 한다. 테스트 환경의 비밀번호·키·쿠키는 보고서에 포함하지 않았다.
