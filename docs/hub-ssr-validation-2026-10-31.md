# 탐색 페이지 SSR 변경 및 검증 보고서

> 후속 P2 안정화와 태그 API 교차 검증은 완료됐다. 현재 결과는 [1.0.1 반영 검증](../reports/ghost-p2-version-1.0.1-2026-11-01.md)과 [통합 검토](../reports/ghost-p2-main-review-2026-11-01.md)를 참고한다. 아래 내용은 당시의 검증 기록으로 유지한다.

후속 개발 서버 반영 및 실제 Ghost 28건 검증 결과는 [개발 서버 보고서](hub-ssr-development-2026-10-31.md)를 참고한다. 아래 내용은 최초 로컬 검증 시점의 기록이다.

검증일: 2026-10-31 (Asia/Seoul). 소스 수정 및 로컬 검증만 수행했다. Commit, Push, PR, 테마 업로드, 서비스 재시작, 배포는 수행하지 않았다. AdSense 승인이나 Google canonical 선택 변경을 보장하는 작업이 아니다.

## 1. 저장소 기준과 보존

- 경로: `/mnt/d/workspace/02.works/ghost-theme-ayu`
- 브랜치: `codex/fix-content-api-pagination`
- 최초 HEAD: `ffd585790f2e9393c24898ae8f641e769feb8d3a`
- 원격: `git@github.com:ceak-UI-theme/ghost-theme-ayu.git`
- `git fetch origin` 후 추적 브랜치와 ahead/behind 차이 없음. HEAD 변경 없음.
- 최초 변경: 미추적 `artifacts/check_audio_local.js`만 존재. 해당 파일을 읽거나 수정·삭제하지 않았다. 추적 파일 변경은 없었다.
- 저장소에 적용되는 AGENTS.md는 발견되지 않았다.
- `package.json`: Ghost >=5, `site_locale` ko/en, Gulp 5, GScan 5.2.5, Playwright. Gulp는 공통 라이브러리 → `assets/js/lib/*.js` → `assets/js/main.js` 순서로 빌드한다.
- `routes.yaml`에 네 허브가 이미 등록되어 있다. 라우팅 변경은 필요 없었다.
- 빌드 산출물은 기존처럼 Git 추적 대상이며 `dist/`는 기존 ignore 정책을 유지한다.

## 2. 첨부 패치 비교 및 채택/폐기

ZIP 12개 파일을 `/tmp/ayu-ssr-reference`에 풀어 현재 저장소와 대조했다. ZIP의 README와 테스트는 참고 자료로 취급했고 지시로 실행하지 않았다.

채택한 방향은 `#get` 기반 초기 링크, 공개 태그 분류, API 실패 시 SSR 보존, 한영 문구 구분이다. ZIP 파일을 저장소 파일에 덮어쓰지는 않았다.

다음은 교체하거나 채택하지 않았다.

- `hub-ssr-override.js` 및 default.hbs 추가 로딩: 사용하지 않음. 함수 덮어쓰기 없이 기존 lib 소스를 수정했다.
- ZIP의 오래된 API 호출 코드: 현재 HEAD의 `fetchAyuContentApiCollection`을 유지한다. Ghost 6에서 API의 `limit=all`이 100개로 제한되어도 기존 공통 함수가 `meta.pagination.next`를 따라 다음 페이지를 수집한다.
- ZIP의 SSR 0건 태그 노출 및 주제 대표 중복 가능성: `count.posts > 0` 확인과 대표 ID 제외로 교체했다.
- ZIP의 일괄 `limit="all"` SSR: GScan의 Ghost 6 경고를 실제 확인했다. 각 조회를 100개로 제한하고 다음 묶음을 재귀 partial로 렌더링한다.
- ZIP의 대표/나머지 목록 순서: 현재 JS 기준으로 조정했다. 카테고리의 나머지는 이름순, 시리즈·주제의 나머지는 게시물 수 내림차순/이름순이다.
- ZIP의 오류·스켈레톤 덮어쓰기: API 처리 전 및 실패 시 DOM 변경 자체를 제거했다.
- 실제 운영 HTML에서 canonical/OG 중복을 확인했으므로 ZIP이 유지하던 수동 메타 블록은 네 허브에서 제거했다.

사용자 변경과 충돌은 없었다. 현재 브랜치의 API 페이지네이션 개선 및 게시물 언어 전환 기능을 유지했다.

## 3. 변경 파일과 핵심 Diff

| 파일 | 변경 |
| --- | --- |
| `page-explore.hbs` | 세 태그 분류의 상위 10개, 최근 글 5개 SSR, 전체 허브 링크, 한영 문구, 수동 head 블록 제거 |
| `page-categories.hbs` | 대표 카테고리 및 전체 나머지 목록 SSR, 한영 문구, 수동 head 블록 제거 |
| `page-series.hbs` | 대표 시리즈 및 전체 나머지 목록 SSR, 한영 문구, 수동 head 블록 제거 |
| `page-secondary-tags.hbs` | 대표 주제 및 전체 나머지 목록 SSR, 한영 문구, 수동 head 블록 제거 |
| `partials/hub-tag-card.hbs` | 기존 카테고리/시리즈 카드 클래스, 실제 이름·URL·설명·글 수·이미지 fallback |
| `partials/hub-topic-card.hbs` | 기존 주제 카드 클래스와 실제 링크, 이미지 fallback, 글 수 |
| `partials/hub-explore-card.hbs` | 기존 Explore 전용 카드 클래스 유지 |
| `partials/hub-category-pages.hbs` | 100개 단위 SSR, 대표 제외, 이름순, 기본 disclosure |
| `partials/hub-series-pages.hbs` | 100개 단위 SSR, 대표 제외, 글 수/이름순, 기본 disclosure |
| `partials/hub-topic-pages.hbs` | 100개 단위 SSR, 대표 제외, 글 수/이름순, 기본 disclosure |
| `assets/js/lib/categories-page.js` | 초기·실패 DOM 삭제 제거, 동률 이름순, popstate 대응, 한영 UI |
| `assets/js/lib/series-page.js` | 초기·실패 DOM 삭제 제거, popstate 대응, 한영 UI |
| `assets/js/lib/secondary-tags-page.js` | 초기·실패 DOM 삭제 제거, 한영 UI |
| `assets/js/lib/explore-page.js` | 초기·실패 DOM 삭제 제거, 실제 저장된 이름 유지, 한영 UI |
| `assets/js/lib/hub-ui.js` | `site_locale`을 전달한 main 속성에서 UI 언어 선택 |
| `assets/css/site/term.css` | SSR disclosure가 카드 그리드 전체 폭을 사용하도록 최소 CSS 추가 |
| `assets/built/main.min.js` | 기존 Gulp로 재생성 |
| `assets/built/screen.css`, `assets/built/screen.css.map` | disclosure CSS를 기존 Gulp로 재생성 |
| `tests/hub-fixture.cjs` | 실제 Handlebars와 Ghost NQL을 사용하는 명시적 fixture 렌더러 |
| `tests/hub-ssr.test.cjs` | SSR/API/페이지네이션/URL 회귀 테스트 |
| `tests/hub-browser.spec.mjs`, `tests/hub-playwright.config.mjs` | 한국어/영어, 모바일, JS 비활성, API 지연·실패·성공, 실제 브라우저 뒤로 가기 |
| 이 보고서 | 결과와 미검증 범위 기록 |

핵심 흐름:

```diff
- featuredGrid.innerHTML = buildLoadingStateHtml();
- listGrid.innerHTML = buildSkeletonCards(2);
  if (!contentKey) {
-     featuredGrid.innerHTML = buildTermErrorHtml();
-     listGrid.innerHTML = '';
      return;
  }
  fetchAyuContentApiCollection(...).then(function (tags) {
      // 성공한 응답으로 기존 카드 및 페이지네이션 렌더링
  }).catch(function (error) {
      logAyuWarning(...);
-     featuredGrid.innerHTML = buildTermErrorHtml();
-     listGrid.innerHTML = '';
  });
```

정확한 전체 Diff는 `git diff` 및 신규 파일 내용을 함께 확인해야 한다. 신규 파일은 아직 Git에 추가하지 않았다.

## 4. SSR와 JavaScript 공존

- 분류 필터는 `visibility:public`과 slug 접두사 `category-`, `series-`를 사용한다. 일반 주제는 두 접두사를 제외한다.
- 집계값 `count.posts`는 include와 정렬에 사용하고, 지원 여부가 불확실한 count 필터는 사용하지 않는다. 렌더링에서 `#match count.posts ">" 0`으로 빈 태그를 제외한다.
- 대표는 글 수 내림차순, 동률이면 이름 오름차순이다. 대표 ID를 나머지 조회에서 제외한다.
- 각 허브는 대표 조회와 나머지 조회를 수행한다. 같은 대표 조회는 두 영역에서 동일 조건으로 사용한다. 나머지는 100개 단위이며 `pagination.next`가 있으면 서버에서 다음 묶음을 렌더링한다.
- 나머지 항목의 처음 10개를 표시하고 추가 항목과 다음 묶음은 기본 HTML `details/summary`에 포함한다. JavaScript 없이 키보드로 펼칠 수 있으며 모든 항목의 링크가 HTML에 존재한다. 이미지는 lazy loading을 사용한다.
- Explore는 분류별 10개와 최근 글 5개만 조회하며 전체 허브 링크는 SSR에서도 표시한다.
- API 성공 시 기존 동적 카드·프로모션 처리·10개 페이지네이션으로 전환한다. 대표 중복을 제거한다. 빈 정상 응답은 번역된 빈 상태로 전환한다.
- API 키 누락, 401/403/500, 네트워크 실패, JSON 파싱 실패, 태그 후속 페이지 실패 및 Explore 일부 요청 실패 시 SSR HTML을 변경하지 않는다. 로딩 스켈레톤으로 바꾸는 단계가 없다.
- 기존 bootstrap의 1회 실행 보호를 유지한다. Override나 추가 bootstrap 스크립트가 없다. 컴파일된 번들에 `ayuHubText` 정의는 1개다.
- 카테고리/시리즈의 `?page=` 및 다른 쿼리 보존, 기존 replaceState 동작을 유지하고 popstate 시 목록을 갱신한다. 허브에는 별도 검색/사용자 정렬 컨트롤이 없으며 `/search/` 소스는 변경하지 않았다.

## 5. 한영 처리

`@custom.site_locale`을 SSR에서 사용하고 main의 `data-hub-locale`에 전달해 JS에서도 같은 설정을 사용한다. 헤더, 설명, 허브 이동 문구, 빈 상태, 글 수 단위, 앞/뒤 페이지 접근성 문구를 구분한다. 태그 이름·게시물 제목·등록 설명은 임의 번역하지 않는다. Explore의 이름 접두사 제거 예외도 없애 실제 등록 이름을 유지한다.

SSR 태그·게시글 URL은 Ghost `url`을 사용하고 허브 간 링크는 현재 `@site.url` 기준이다. JS API는 기존처럼 현재 사이트의 상대 Content API 경로를 사용한다. 다른 언어 사이트 콘텐츠를 혼합하지 않으며 기존 게시물 언어 전환 코드는 변경하지 않았다.

## 6. SEO 읽기 전용 확인

2026-10-31에 curl로 두 운영 사이트의 네 경로를 확인했다. **수정 전 운영 테마를 관찰한 결과**이며 새 테마가 운영에서 검증되었다는 뜻이 아니다.

| 사이트 | explore | categories | series | secondary-tags |
| --- | --- | --- | --- | --- |
| `https://ceak.dev` | 200 | 200 | 200 | 200 |
| `https://en-signal.ceak.dev` | 200 | 200 | 200 | 200 |

8개 모두 canonical 2개, `og:title` 2개를 확인했다. canonical 두 값은 각각 현재 사이트의 해당 경로로 동일했다. 한국어가 영어 canonical을 직접 선언하는 현상은 이번 HTTP 관찰에서는 확인되지 않았다. 따라서 Google 선택 표준 URL 차이의 원인을 cross-site canonical로 단정하지 않는다.

`default.hbs`는 `ghost_head` 뒤에 `block head`를 출력한다. 네 허브의 수동 canonical/OG 선언이 중복의 직접적인 테마 측 원인이므로 해당 head 블록만 제거했다. Ghost가 관리하는 canonical, OG, 설정을 정본으로 사용한다. `default.hbs` 자체 및 canonical/hreflang 값을 별도로 변경하지 않았다.

8개 HTML에서 hreflang, robots noindex 메타, X-Robots-Tag는 발견되지 않았다. 두 사이트 robots.txt는 /ghost/ 등 관리 경로를 막고 있으며 네 허브를 차단하는 규칙은 없었다. hreflang은 실제 대응 페이지가 확인되지 않아 새로 추가하지 않았다.

다른 `post.hbs`, `tag.hbs`, `page-search.hbs`에도 수동 메타 블록이 있다. 이번 네 허브 수정 범위 밖으로 남겼다. 사이트 전체 메타 정리는 별도 실제 HTML 검증이 필요하다.

Python urllib 기본 요청은 운영에서 403을 받았고 curl 요청은 200이었다. 요청 클라이언트별 차이가 있으므로 Googlebot 상태나 과거 5xx 해결을 이번 확인으로 보장할 수 없다.

## 7. 테스트 결과

| 검증 | 결과 | 범위/근거 |
| --- | --- | --- |
| Gulp build | PASS | 기존 CSS/JS 빌드 성공 |
| GScan Ghost 5 | PASS | 오류·경고 없음. 기존 package custom group 권고만 남음 |
| GScan Ghost 6 | PASS | limit=all 경고 제거. 기존 package custom group 권고만 남음 |
| HBS 파싱 및 허브 fixture 렌더 | PASS | 실제 Handlebars, 실제 Ghost NQL 파서 사용. Ghost get/foreach/match는 테스트 adapter임 |
| SSR/JS 회귀 58 시나리오 | PASS | 양 언어, 분류, 0건/내부 태그 제외, 대표 중복, 실제 이름 escaping, SSR/JS 순서, 225개 태그 재귀 조회, 빈 SSR 데이터 |
| API 실패 및 정상 응답 | PASS | 실제 content-api.js 공통 경로, 키 누락, 401/403/500, 네트워크, 잘못된 JSON, 후속 API 페이지 실패, Explore 부분 실패, 빈 정상 응답 |
| URL/페이지네이션 | PASS | 페이지 전환, 다른 쿼리 보존, popstate |
| Chromium 브라우저 16건 | PASS | 네 허브 × ko/en × 모바일/JS 비활성. 지연 중 SSR 보존, 403 보존, 성공 전환, 뒤로 가기, 가로 overflow 및 details 조작 |
| 기존 theme-smoke.test.mjs | FAIL (기존 문제) | 현재 저장소에 없는 categories.hbs를 읽어 ENOENT. HEAD 원본 테스트/파일을 /tmp에서 실행해 같은 실패 재현. 기존 파일은 변경하지 않음 |
| Gulp 테마 ZIP | PASS | 기존 gulp zip 성공, 138개 entry, CRC 정상, 새 partial 6개 포함, 번들 일치 |
| ZIP 불필요 파일/Override | PASS | tests, test-results, artifacts, node_modules, docs, override 미포함 |
| 운영 8개 경로 HTTP 및 SEO 관찰 | PASS | 수정 전 서비스 읽기 전용 curl 검사. 위 표 참고 |
| 새 코드의 실제 Ghost 5/6 서버 렌더링 | NOT RUN | 새 테마를 실제 서버에 업로드/활성화하지 않음. fixture는 이를 대체하는 통합 검증이 아님 |
| 새 코드 + 운영 콘텐츠 + 실제 API 키의 양 사이트 통합 테스트 | NOT RUN | 업로드/관리자 설정 변경 권한 범위 밖 |
| 전체 기존 E2E 및 검색/게시물/오디오 통합 회귀 | NOT RUN | 이번 변경을 활성화한 격리 Ghost 서버가 없음. 관련 소스 변경 없음 |
| 실제 데이터 대규모 TTFB/부하 측정 | NOT RUN | 태그 225개는 fixture 검증만 수행 |

실행 명령 (저장소 루트):

```bash
# 이 WSL 환경에서는 PATH에 Node가 없어 기존 임시 Linux Node 22 경로를 사용함
export PATH=/tmp/node-v22.22.0-linux-x64/bin:$PATH
node node_modules/gulp-cli/bin/gulp.js build
node node_modules/gscan/bin/cli.js . --v5
node node_modules/gscan/bin/cli.js . --v6
node tests/hub-ssr.test.cjs
node tests/theme-smoke.test.mjs
node node_modules/gulp-cli/bin/gulp.js zip

git diff --check
```

이 환경의 설치된 브라우저는 Windows Chromium이므로 브라우저 검증은 다음 명령으로 실행했다. 일반적인 동일 OS Node/브라우저 환경에서는 `npx playwright test --config tests/hub-playwright.config.mjs`로 실행 가능하다.

```bash
'/mnt/c/Program Files/nodejs/node.exe' node_modules/@playwright/test/cli.js test --config tests/hub-playwright.config.mjs
```

테마 ZIP: `dist/signal-wave-ayu.zip` (기존 Git ignore 대상). 10,527,788 bytes, SHA-256 `208cb02630bc39a8fea96458e1b5c4b0b43bcc405aadf169fc5383e0f5d04b25`.

초기 테스트 선택자 오류(이미지 링크 가시성, 숫자/다음 버튼 중복 선택)는 테스트를 수정해 해소했다. ZIP 생성은 브라우저 테스트가 임시 trace 디렉터리를 삭제하던 중 glob 탐색 ENOENT로 한 번 실패했고, 브라우저 종료 후 동일 Gulp 작업으로 재실행해 성공했다. 빌드의 Browserslist 데이터 갱신 안내는 비차단 경고이며 의존성은 변경하지 않았다.

## 8. 남은 위험과 배포 전 추가 검증

1. 격리 Ghost 서버에서 이 ZIP을 활성화하고 실제 Ghost 버전, 실제 공개 태그 및 count 집계와 함께 네 허브를 렌더링해야 한다. 특히 재귀 partial의 실제 async get 동작과 `pagination.next`, ID 제외, 100개 초과 전체 링크를 확인한다.
2. DB의 이름 정렬 collation과 브라우저 `localeCompare`는 한글/악센트/동률 이름에서 순서가 다를 수 있다. fixture의 순서 일치는 확인했지만 실제 양 사이트의 동률 이름 순서는 NOT RUN이다.
3. 100개 단위 쿼리와 접힌 UI는 단일 무제한 쿼리 및 화면 길이 문제를 줄인다. 그러나 모든 태그 링크를 HTML에 담기 위해 총 SSR 작업량과 HTML 크기는 태그 수에 비례한다. 접힌 UI도 서버 조회량을 줄이지 않는다. 실제 데이터 TTFB/쿼리 부하를 측정해야 한다.
4. Ghost get 자체가 타임아웃/실패하면 서버 목록을 만들 수 없다. 이번 API 실패 보존은 이미 생성된 SSR HTML을 보호한다. 서버/프록시의 과거 5xx 원인 진단은 별도다.
5. 새 테마의 결과 HTML에서 canonical/OG 중복 제거, 현재 사이트 URL, robots/noindex를 다시 확인한다. ghost_head가 자동 생성하는 제목·설명/이미지는 기존 수동 fallback과 다를 수 있으므로 양 사이트에서 실제 값을 확인한다.
6. 양 사이트의 실제 키로 성공/차단/오프라인 상태, 검색 페이지, 뒤로 가기, 모바일, 이미지가 없는 태그, 한 항목/빈 허브를 확인한다. 캐시를 비운 새 브라우저와 JS 비활성 상태 모두 확인한다.
7. 기존 스모크 테스트의 삭제된 템플릿 참조는 별도 유지보수가 필요하다. 이번 변경에서 테스트를 느슨하게 만들어 통과시키지는 않았다.
8. AdSense, DB, 콘텐츠, slug, 공개 상태, routes.yaml, 관리자 설정, 배포 설정, 광고 코드, 언어 전환 코드는 변경하지 않았다. 실제 배포 및 업로드는 별도 승인 후 수행한다.

참고한 공식 근거: [Ghost get helper](https://docs.ghost.org/themes/helpers/functional/get), [Ghost Content API](https://ghost.org/docs/content-api/). Ghost 6 limit=all 제한은 설치된 GScan의 `lib/specs/v6.js` 및 실제 실행 경고로도 확인했다.
