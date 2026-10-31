# Ghost P2 배포 전 최종 게이트 — 2026-10-31

> Git 증거 보관 범위: [reports README](README.md) **(로컬 전용)**. 로컬 전용 표시의 원본 캡처·실행 파일은 커밋하지 않았다.

**최종 판단: BLOCKED.** 운영의 공개 태그는 정상적으로 반환되지만, 반환 배열 합계와 pagination.total이 달라 현재 수정본 검증기가 두 사이트의 태그 수집을 거부한다. 이 상태로 배포하면 SSR은 유지되어도 Categories/Series/Topics/Explore의 JS 태그 갱신·페이지 버튼이 활성화되지 않을 수 있다. 묵시적으로 기능 저하를 승인하지 않는다.

**GScan은 별도로 정리됐다.** Windows `gscan@5.2.5`의 partial 경로 처리 버그이며, 테마를 변경하지 않은 Linux 정규 검사에서는 v5/v6 모두 PASS다. 테마의 재귀 SSR 자체가 비호환이라는 이전 해석은 이 새 증거로 정정한다. Windows 실행 자체는 여전히 FAIL로 구분한다.

기준 보고서: [P2 수정·회귀 보고서](ghost-p2-fixes-and-regression-2026-10-31.md). 이번 보고서의 운영 수치와 실행 결과는 새 요청/새 검사에서 수집했다. 이전 PASS를 재사용해 이번 PASS라고 표시하지 않았다.

- 최초 운영 API 검사: 2026-10-31T15:29:02.806000+09:00 ~ 2026-10-31T15:29:35.761000+09:00.
- 재개 후 마지막 운영 API 재검사: 2026-10-31T19:11:55.269000+09:00 ~ 2026-10-31T19:12:26.551000+09:00.
- 보고서 작성: 2026-10-31T19:15:51.005338+09:00. 시간은 Asia/Seoul. 요청된 파일명은 유지했다.
- 운영은 공개 GET만 실행했다. 서버·DB·태그·게시물·설정·테마·Admin API 쓰기, commit/push/PR/배포는 하지 않았다. 공개 Content API 키는 HTML에서 메모리로만 읽고 요청했으며 결과/로그에는 저장하지 않았다.

## 1. 운영 API와 현재 검증기의 호환성

운영 HTML generator는 양쪽 모두 **Ghost 6.69**다. 이 공개 문자열로 정확한 patch 버전/서버 DB 종류까지 확정하지 않았다. 직전 로컬 Ghost 5.130.6 검사만으로 현재 운영의 major 6 호환성을 가정하지 않고 이번에 v6 검사와 실제 Ghost 6.73.0 로컬 검증을 추가했다.

현재 `assets/js/lib/content-api.js`를 Node VM에 그대로 로드해 `fetchAyuContentApiCollection`/`fetchAyuContentApiPage`를 실행했다. 브라우저용 캐시·document 키 조회만 테스트 어댑터로 제공했으며 검증 함수나 응답을 수정하지 않았다. 소스 SHA-256: `f5b026a256e577f28dfe1aed2fb306c0cea4fdb6c9ed0c3920f2fbcb6faf45b8`.

### 요청 조건

- 검색: `/ghost/api/content/posts/`, `include=tags,authors`, 기존 fields(id/title/slug/url/published_at/excerpt/custom_excerpt/feature_image/feature_image_alt), 요청 코드의 limit=all을 수집기가 **100**으로 정규화, page=1→2.
- Categories: `/tags/`, `include=count.posts`, `order=name asc,slug asc`, limit=100, page=1→2.
- Series/Topics: 같은 태그 endpoint, `order=count.posts desc,name asc,slug asc`, limit=100, page=1→2.
- Explore tags: 위와 같은 의미의 기존 쿼리 순서로 별도 실행.
- Explore recent: posts의 기존 fields와 `order=published_at desc`, limit=8의 첫 페이지를 page 검증기로 검사.
- 원래 코드는 태그 API 요청에서 별도 filter를 보내지 않고 클라이언트 taxonomy로 public/역할/count>0를 분류한다. 그 조건을 그대로 시험했다. 추가 진단만 `filter=visibility:public`을 따로 보냈다.
- 실제 요청 사이 1.2~1.5초를 두었다. 전체 운영 요청은 API 60회와 HTML 12회로 총 72 GET(최초·재개 후 두 라운드 합계)이며, 대량 크롤링/부하 시험을 하지 않았다. 모든 관측 API 응답은 200이며 네트워크/JSON 수신 실패는 없었다. 키를 뺀 실제 쿼리·상태·page 메타·ID는 [production-api.json](release-gate-2026-10-31/production-api.json) **(로컬 전용)**에 있다.

| 사이트 | 대상 | page 1 | page 2 | meta.total | 고유 ID 합계 | 현재 검증기 |
|---|---|---:|---:|---:|---:|---|
| ko | search | 100 | 12 | 112 | 112 | **PASS** |
| ko | categories | 100 | 35 | 151 | 135 | **FAIL** |
| ko | series-topics | 100 | 35 | 151 | 135 | **FAIL** |
| ko | explore-tags | 100 | 35 | 151 | 135 | **FAIL** |
| en | search | 100 | 12 | 112 | 112 | **PASS** |
| en | categories | 100 | 35 | 148 | 135 | **FAIL** |
| en | series-topics | 100 | 35 | 148 | 135 | **FAIL** |
| en | explore-tags | 100 | 35 | 148 | 135 | **FAIL** |

마지막 최근 글 limit=8 응답은 양 사이트 모두 PASS이며 meta.total=112, pages=14, next=2다. 이것은 첫 8개를 요청한 정상 제한 조회이므로 전체 112개 수집과 혼동하지 않았다.

최초 조회는 게시글 100+11=111개, 태그 100+30=130개, 태그 total은 KO136/EN133이었다(production-api-before-resume.json). 마지막 조회는 게시글 100+12=112개, 고유 ID 112개, 중복 0개로 완료됐다. 태그는 100+35=135개지만 마지막 페이지 길이를 KO는 51개, EN은 48개로 기대하는 검증 조건에서 실제 35개여서 실패한다. 운영 데이터 수의 증가는 오류로 판정하지 않았으며, 각 조회 라운드를 분리했다. next/prev/page/pages/total은 페이지 간 일관되고 마지막 next=null이다. 수집기가 중간 요청을 생략했거나 같은 페이지를 반복한 것이 아니다.

### 실제 공개 데이터 누락과 메타 의미 차이 구분

전체 공개 게시글의 tags 관계를 독립적으로 읽고, 태그 목록과 **ID·slug·참조 게시물 수**를 대조했다. 최초 교차 확인도 111개 게시글/130개 활성 태그와 일치했다(public-data-coverage-before-resume.json). 마지막 재검사 결과는 아래와 같다. 이 추가 조회는 문제 응답을 검증기에 통과시키기 위한 조작이 아니라 read-only 진단이다. 결과:

| 사이트 | 공개 게시글 고유 수 | 반환 태그 고유 수 | 게시글에서 참조한 public 태그 ID | Categories / Series / Topics | 활성 태그 누락 | count/slug 불일치 | meta 차이 |
|---|---:|---:|---:|---|---:|---:|---:|
| ko | 112 | 135 | 135 | 5 / 14 / 116 | 0 | 0 | 16 |
| en | 112 | 135 | 135 | 5 / 14 / 116 | 0 | 0 | 13 |

반환된 양수 public 태그 중 공개 게시글에서 참조되지 않는 ID도 0개, 반환 public count=0 태그도 0개다. 페이지 간 태그 ID 중복은 0개다. 따라서 **관측 시점의 공개 게시글이 참조하는 활성 태그 135개는 모두 반환됐고, 누락 증거가 없다.** 반면 meta가 센 추가 KO 16개/EN 13개의 ID/이름/비공개 상태는 공개 응답으로 알아낼 수 없어 운영 DB의 정확한 원인을 확정하지 않는다. 전체 DB 151/148개를 모두 열람했다거나 비공개 데이터 손실이 없다고 주장하지 않는다. [public-data-coverage.json](release-gate-2026-10-31/public-data-coverage.json).

`filter=visibility:public`을 추가한 진단도 마지막 배열 135개와 total 151/148을 반환해 FAIL이었다. 단순히 internal 태그가 섞여 생긴 숫자 문제라고 단정하거나 필터 하나로 해결됐다고 표시하지 않는다. [public-probe.json](release-gate-2026-10-31/public-probe.json) **(로컬 전용)**.

### Ghost 6의 제어된 재현과 SSR 보존

격리된 Ghost 6.73.0에서 정상 공개 태그 676개가 있는 상태에 (a) 연결되지 않은 public 태그 1개, (b) draft 게시글에만 연결한 public 태그 1개를 추가했다. 운영에는 이 변경을 하지 않았다. 이후 공식 API는 7페이지에서 **100×6+76=676개**를 반환하지만 total=678을 유지했다. 현재 검증기는 마지막 페이지에서 동일한 오류로 거부했다. 즉 정상 Ghost가 공개/연결 상태에 따라 반환 집합과 총계의 범위를 다르게 만들 수 있음을 로컬에서 직접 재현했다. 운영의 추가 16/13개도 정확히 같은 상태인지는 공개 조회만으로 확정할 수 없다.

이 상태에서 Explore 원본의 태그 앵커 **50개가 JS 후에도 50개 그대로 유지**됐다(이미지/제목 중복 앵커 포함). 빈 상태로 덮어쓰거나 일부 태그만 성공 데이터로 적용하지 않았다. [local-ghost-visibility-edge.json](release-gate-2026-10-31/local-ghost-visibility-edge.json), [local-edge.log](release-gate-2026-10-31/local-edge.log) **(로컬 전용)**.

**판정:** 단순 데이터 유실보다는 공개 API의 total 의미와 현재 검증기의 엄격한 완전성 기준이 충돌한 false positive다. 그러나 현재 코드가 이를 독립 교차 확인하는 기능은 없으므로 JS 갱신을 포기한다. 이번 read-only 진단에서 coverage가 일치했다는 사실만으로 모든 사용자 요청에서 short page를 허용하도록 코드를 완화하지 않았다.

## 2. GScan 실패 경로와 호환성

### Windows 5.2.5: FAIL 유지, 검사기 경로 버그

- 이번에도 변경하지 않은 GScan으로 실패를 재현했다. 별도 진단 프로세스의 진입/AST 호출 계수만 계측해 첫 실패가 **090-template-syntax.js**임을 확인했다. node_modules 파일은 수정하지 않았다.
- `themeFile.file`은 Windows에서 `partials\hub-category-pages.hbs`, `normalizedFile`은 `partials/hub-category-pages.hbs`다.
- [090-template-syntax.js](../node_modules/gscan/lib/checks/090-template-syntax.js) **(로컬 전용)** 22행은 raw file에 `startsWith("partials/")`를 적용한다. Windows에서는 false이므로 25행의 방문 캐시 확인과 46행의 캐시 저장이 실행되지 않는다. 50~53행은 normalizedName으로 partial을 찾아 재귀 방문한다.
- 그 결과 정적 검사기가 동일 partial을 수천 번 재방문하며 stack overflow가 발생한다. 실제 HBS의 `pagination.next` 종료 조건은 AST 순회 시 평가되지 않으므로 테마 데이터가 적어도 이 실패가 가능하다. 진단에서 hub-category-pages 재방문 5,727회, hub-tag-card 11,451회를 기록했다.
- Linux에서는 raw file도 `partials/...`라 방문 캐시가 정상 작동한다. 같은 테마/같은 gscan 5.2.5가 전체 검사를 완료한 이유다. [gscan-windows.json](release-gate-2026-10-31/gscan-windows.json), [gscan-windows.log](release-gate-2026-10-31/gscan-windows.log) **(로컬 전용)**.

### 변경하지 않은 Linux 정규 검사

| 실행 환경 | GScan | spec | errors | warnings | recommendation | 결과 |
|---|---|---|---:|---:|---:|---|
| Linux / Node v22.23.4 | 5.2.5 | v5 | 0 | 0 | 1 | **PASS** |
| Linux / Node v22.23.4 | 5.2.5 | v6 | 0 | 0 | 1 | **PASS** |
| Linux / Node v22.23.4 | 6.6.1 | v6 | 0 | 0 | 1 | **PASS** |

증거: [gscan-5-v5.json](release-gate-2026-10-31/gscan-5-v5.json), [gscan-5-v6.json](release-gate-2026-10-31/gscan-5-v6.json), [gscan-6-v6.json](release-gate-2026-10-31/gscan-6-v6.json). 1개 권고는 기존 package.json custom 설정의 group 분류이며 오류/경고/stack overflow가 아니다. `gscan@6.6.1`은 이번 테스트에 사용한 공식 Ghost 6.73.0 이미지에 번들된 버전이다. 운영 6.69의 정확한 번들 GScan/patch는 확인하지 않았다.

검사 대상은 현재 테마 파일을 그대로 복사한 읽기 전용 후보 디렉터리다. 모든 재귀 partial과 100개 배치·다음 페이지 호출을 유지했다. 오류 rule를 건너뛰거나 검사기 source/서버를 패치하거나 재귀를 숨기는 dynamic partial로 바꾸지 않았다. **Linux 결과만 PASS이며 Windows 자체는 FAIL이다.** 검사 실행 환경으로 문제를 피하는 검증 가능한 경로를 확보했지 Windows 패키지 버그를 고쳤다고 주장하지 않는다.

재현 예시(WSL/Linux의 저장소 루트, `/tmp/ghost-ayu-gate-theme`에 동일 후보 파일을 먼저 복사):

```sh
docker run --rm --network none \
  -v "$PWD":/deps:ro \
  -v /tmp/ghost-ayu-gate-theme:/theme:ro \
  ghost:6-alpine node \
  /deps/reports/release-gate-2026-10-31/gscan-linux.cjs \
  /deps/node_modules/gscan v6
```

위 예시는 검사만 하며 네트워크·테마 쓰기를 차단한다. 실제 테스트 이미지의 버전은 6.73.0, pull digest는 docker-pull.log에 기록했다. 향후 재현에서는 tag 변경 가능성을 고려해 검증한 digest를 고정해야 한다.

### 재귀를 없애는 대안 검토

- `limit=all` 또는 100 초과 limit으로 한 번에 모두 가져오기: 현재 [공식 get 문서](https://docs.ghost.org/themes/helpers/functional/get)는 1~100과 page 조회를 명시한다. 225개 이상 보존의 대안으로 채택하지 않았다.
- page=1,2,3 등을 고정하여 템플릿을 펼치기: 고정 상한을 넘으면 누락되므로 채택하지 않았다.
- JS load more로 대체: JavaScript OFF 접근 조건을 훼손하므로 채택하지 않았다.
- 서버 controller/커스텀 helper로 페이지 범위를 만들기: 운영 서버/라우팅 확장이 필요해 이번 최소 변경 범위를 벗어난다.
- 현재 코드는 공식 [partials 문법](https://ghost.org/tutorials/partials/)과 get/page 속성을 사용하고, 실제 Ghost 6에서도 다음 페이지가 없을 때 정상 종료했다. 표준 HBS만으로 임의 개수 페이지를 일반적인 비재귀 루프로 대체하는 안전한 최소 변경은 찾지 못했으며, **정규 Linux 검사가 정상인 상황에서 테마를 수정할 이유가 없다.**

## 3. 225개 이상 무JS 실제 Ghost 검증

직전 Ghost 5 테스트 대신 이번에는 별도 **Ghost 6.73.0 / SQLite / localhost:2370** 환경을 만들었다. 운영 DB나 기존 개발 DB를 사용하지 않았다. fixture 게시글 111개와 public 태그를 category/series/topic 각 225개씩 추가했다. Ghost 초기 News 태그 때문에 Topics는 226개다. 이후 같은 격리 DB의 site locale과 테마 locale을 ko/en으로 전환해 각각 검사했다. 운영 두 DB를 복제한 검사가 아님을 구분한다.

| locale | 허브 | 원본 HTML 영역별 고유 링크 | JS OFF 마지막 태그 실제 클릭 |
|---|---|---|---|
| ko | explore | #explore-categories-grid: 10, #explore-series-list: 10, #explore-topics-grid: 10, #explore-recent-list: 5 | 최근 글 포함 초기 4영역 확인 |
| ko | categories | #primary-featured-grid: 1, #primary-list-grid: 224 | `/tag/category-gate-224/` → 200 |
| ko | series | #series-featured-grid: 1, #series-list-grid: 224 | `/tag/series-gate-224/` → 200 |
| ko | secondary-tags | #secondary-tags-featured: 1, #secondary-tags-grid: 225 | `/tag/gate-224/` → 200 |
| en | explore | #explore-categories-grid: 10, #explore-series-list: 10, #explore-topics-grid: 10, #explore-recent-list: 5 | 최근 글 포함 초기 4영역 확인 |
| en | categories | #primary-featured-grid: 1, #primary-list-grid: 224 | `/tag/category-gate-224/` → 200 |
| en | series | #series-featured-grid: 1, #series-list-grid: 224 | `/tag/series-gate-224/` → 200 |
| en | secondary-tags | #secondary-tags-featured: 1, #secondary-tags-grid: 225 | `/tag/gate-224/` → 200 |

각 목록의 예상 225개 fixture 태그 ID/URL 집합이 원본에 모두 있는지 확인했다. 100개 한도를 넘는 추가 배치를 실제 서버가 렌더링했고, JS OFF 브라우저에서 네이티브 details를 순서대로 열어 225번째 링크까지 클릭했다. 유한 3페이지로 테마를 바꾸거나 링크 개수만 다른 공통 메뉴를 집계하지 않았다.

ko/en 각각 title/description 4종이 고유하고, self canonical/description/OG title/OG description 각 1개, title↔OG title·description↔OG description 일치, HTML lang 정확, 가로 넘침 없음, hreflang 자동 생성 없음도 확인했다. 정상 API에서 JS enhancement가 완료됐음을 runtime 상태/실제 DOM 변경으로 확인했으며, Categories/Series 첫 페이지는 원본의 앞 10개와 일치했다. [ko-ghost-results.json](release-gate-2026-10-31/ko-ghost-results.json) **(로컬 전용)**, [en-ghost-results.json](release-gate-2026-10-31/en-ghost-results.json) **(로컬 전용)**.

원본 HTML은 키를 치환한 사본 8개, 모바일 JS ON/OFF 스크린샷은 16개다. 무JS 목록 스크린샷은 펼친 마지막 항목 부근의 viewport를 저장해 마지막 링크 접근 증거로 사용했다. 예: [ko 225번째 부근](release-gate-2026-10-31/ko-categories-nojs-mobile.png) **(로컬 전용)**, [en 225번째 부근](release-gate-2026-10-31/en-series-nojs-mobile.png) **(로컬 전용)**.

## 4. 전체 회귀 결과

테마 소스 변경이 없었지만 요청된 기존 회귀 세트를 새로 실행했다.

| 항목 | 결과 | 새 증거 |
|---|---|---|
| Content API 21개 | PASS | [content-api-tests.log](release-gate-2026-10-31/content-api-tests.log) **(로컬 전용)** |
| SSR 58개 | PASS | [ssr-tests.log](release-gate-2026-10-31/ssr-tests.log) **(로컬 전용)** |
| 기존 Playwright 16개 | PASS | [hub-browser.log](release-gate-2026-10-31/hub-browser.log) **(로컬 전용)** |
| P2 Playwright 98개 | PASS | [p2-browser.log](release-gate-2026-10-31/p2-browser.log) **(로컬 전용)** |
| Playwright 합계 114개 | PASS | 111개 경계 검색, 1/100/101/111번째, Back/Forward, refresh/범위 보정, 늦은 응답, API 비정상/0건 |
| 로컬 Ghost ko/en 8개 허브 | PASS | [ko-ghost.log](release-gate-2026-10-31/ko-ghost.log) **(로컬 전용)**, [en-ghost.log](release-gate-2026-10-31/en-ghost.log) **(로컬 전용)** |
| 225개 이상 실제 무JS SSR | PASS | Categories/Series 각 225, Topics 226, 마지막 태그 200 |
| 실제 Ghost 가시성 메타 불일치 시 SSR 보존 | PASS | [local-ghost-visibility-edge.json](release-gate-2026-10-31/local-ghost-visibility-edge.json) |
| Gulp build | PASS | [build.log](release-gate-2026-10-31/build.log) **(로컬 전용)** |
| GScan Linux v5/v6 | PASS | 오류/경고 0, 기존 권고 1 |
| GScan Windows 5.2.5 | FAIL | partial 캐시 경로 판정 오류, 미수정 |
| 운영 전체 게시글 112개 수집 | PASS | 마지막 양 사이트 100+12, 중복 0, 배열 합=meta.total; 최초 111개도 통과 |
| 운영 태그 수집 — 현재 검증기 | **FAIL** | 마지막 배열 길이/total 불일치로 거부 |
| 수정본 운영 배포/실제 운영 UI | NOT RUN | 배포는 승인 범위 밖 |
| 운영 DB의 숨은 16/13개 태그 상태/로그 | NOT RUN | 공개 API만 사용, 서버/DB/Admin 미접근 |
| 운영 정확한 6.69 patch와 동일 환경 | NOT RUN | 공개 generator만 확인, 로컬은 6.73.0 |
| 실물 모바일·Safari/Firefox | NOT RUN | Chromium 모바일 viewport만 실행 |

## 5. 변경 파일·보존 범위

**이번 게이트에서 기존 테마 HBS/JS/partial/package/lock/검증 정책을 변경하지 않았다.** 기존 미커밋 GHV-01~05 수정과 사용자 미추적 파일을 유지했다. Gulp 결과는 시작 시 JS와 같은 해시였고 CSS는 줄바꿈 외 동일하여 불필요한 줄바꿈 변경만 복원했다. 시작 파일별 SHA-256을 [start-state.json](release-gate-2026-10-31/start-state.json) **(로컬 전용)**에 기록하고 종료 시 재대조했다.

새 파일은 본 보고서와 `reports/release-gate-2026-10-31/`의 read-only API/교차 검증·GScan 진단·격리 fixture 스크립트, JSON, 로그, 스크린샷이다. node_modules는 읽기만 했으며 진단용 함수 계측은 별도 프로세스 메모리에서만 수행했다. 테마 정규 검사 PASS에는 계측이나 rule 우회가 없다.

최종 main.min.js SHA-256: `74bfae935a2c9570eaf646cd456437a3ad917992da3257638b2f94a343983b7d`. HTTP GET을 포함한 동작 증거와 파일 일관성 검사는 [validation.log](release-gate-2026-10-31/validation.log)에 있다.

## 6. 남은 위험과 해제 조건

1. **BLOCKER — 운영 태그 API 호환성.** 현재 코드는 합계가 다른 태그 응답을 끝까지 받아도 거부한다. SSR 데이터가 삭제되지는 않지만 JS 카드 갱신/페이지 버튼의 기존 기능이 비활성화되므로 현재 상태를 READY로 선언하지 않는다.
2. **정책 변경에는 독립적인 완전성 증명이 필요하다.** posts 검증은 엄격하게 유지하고, 태그의 숫자 차이를 허용하려면 예를 들어 완전하게 수집·검증한 공개 posts.tags의 ID 집합·참조 개수와 태그 수집 결과를 런타임에 대조하는 방식이 필요하다. API의 malformed schema/중간 페이지 실패/실제 활성 태그 누락/ID 중복/동시 변경은 계속 실패로 처리해야 한다. 단순히 `items.length <= total`로 바꾸거나 tags이므로 부족분을 무시하는 수정은 권장하지 않는다. 이 대안은 이번에 구현하지 않았다.
3. Ghost 측 total/가시성 조회 범위를 바로잡는 방법도 가능하지만 운영 서버 변경은 이번 범위 밖이다. 공개 데이터 교차 확인이 일치했다는 이번 관측만으로 앞으로의 모든 API 응답을 보증하지 않는다.
4. **GScan 실행 환경.** Linux의 정규 v6 검사를 배포 gate로 사용할 수 있다. Windows 5.2.5가 계속 필수인 파이프라인이면 그 도구 오류는 여전히 해소해야 한다. CLI가 오류를 출력하면서 exit=0인 경우도 있으므로 JSON의 errors/warnings/완료 여부를 함께 확인한다.
5. 로컬 Ghost는 운영과 major 6이지만 exact patch/DB 엔진이 다르다. 배포가 승인되는 후속 단계에서는 최종 zip을 같은 Linux gate로 검사하고, 실제 운영 raw head·무JS 링크·태그 API 정상 enhancement·100개 초과 전체 검색·Back/Forward를 다시 확인해야 한다.

테스트용 Ghost 컨테이너·SQLite DB·임시 후보 사본과 미치환 임시 HTML은 검사 후 제거했다. 원래 개발 Ghost/MySQL은 실행 상태를 유지했다. 보고서의 로그/JSON/키 치환 HTML/스크린샷만 보존했다.

## 최종 판단

**BLOCKED — 현재 수정본 그대로의 운영 배포는 보류한다.**

GScan은 재귀 SSR을 훼손하지 않고 Linux 정규 검사로 통과 경로를 확보했다. 225개 이상 SSR·ko/en·검색·이력·API 실패 보존의 회귀는 유지된다. 남은 blocker는 운영에서 실제 재현된 태그 meta 불일치와 현재 검증기의 호환성이다. 이를 근거 있게 해결한 뒤 두 운영 API에서 수정된 검증기가 완료되는 것을 확인해야 READY를 재판정할 수 있다.

운영 변경, Git 발행, 테마 업로드/배포는 하지 않았다.
