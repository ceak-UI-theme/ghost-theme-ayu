# Ghost P2 태그 API 호환성 최종 검증 — 2026-10-31

> Git 증거 보관 범위: [reports README](README.md) **(로컬 전용)**. 로컬 전용 표시의 원본 캡처·실행 파일은 커밋하지 않았다.

배포 판단: **READY**. 수정 후보의 운영 읽기 전용 호환성, 기존 193개와 신규 148개 자동화 검증, 실제 Ghost 6의 ko/en 8개 허브, 빌드 및 Linux GScan v6가 모두 PASS했다. 운영 배포는 수행하지 않았다.

## 1. 기준과 범위

기준은 `ghost-p2-release-gate-2026-10-31.md`의 BLOCKED 사유다. 기존 보고서의 결과를 재사용해 PASS로 간주하지 않고 이번 소스와 실제 API를 다시 실행했다. 시작 HEAD는 `b9e8f9fea072af9720c892868b983d5a675201c7`, 브랜치는 `codex/fix-content-api-pagination`이다. 기존 미커밋 P2 변경과 사용자 파일을 보존했다. 시작 파일 해시는 [start-state.json](tag-compatibility-2026-10-31/start-state.json) **(로컬 전용)**에 있다.

운영은 공개 HTML 및 Content API GET만 사용했다. Admin 쓰기, 운영 설정·DB·테마 변경, Commit/Push/PR/배포는 하지 않았다. 재현용 DB 변경은 별도 loopback Docker Ghost/SQLite에만 수행했다. API 키는 실행 중 메모리에서만 읽었고 증거의 요청 쿼리와 HTML에서는 제거했다.

## 2. 원인과 수정 정책

기존 공통 수집기는 배열 길이와 `pagination.total`의 일치를 게시글과 태그에 동일하게 요구했다. 운영 Ghost는 활성 공개 태그 135개를 반환하면서 KO total151, EN total148을 선언한다. 이는 활성 태그 누락과 다른 현상이며, 격리 Ghost 6에서도 사용하지 않는 태그·Draft 전용 태그가 total에 포함되는 경우를 재현했다.

게시글의 엄격한 스키마·페이지 길이·총계 검증은 유지했다. 태그에서만 짧은 배열의 최종 승인을 보류하고 다음 절차를 추가했다.

1. Tags API의 모든 페이지를 next=null까지 수집한다. 페이지 번호, prev/next, pages/total/limit 일관성, 항목 스키마, 페이지 안팎 ID 중복을 검사한다.
2. 같은 사이트의 공개 Posts API를 `include=tags`, `fields=id,title,slug,url`, `order=id asc`, `limit=100`으로 끝까지 수집한다. 게시글 total과 실제 길이가 정확히 일치해야 한다. 누락된 tags 관계를 빈 관계로 간주하지 않는다.
3. 공개 게시글의 공개 태그 ID별 slug/name과 참조 게시글 수를 구성하고, Tags API에서 공개·count.posts>0인 집합과 정확히 비교한다. 누락, 추가 양수 태그, slug/name/count 불일치 모두 거부한다.
4. 모든 증명이 끝나야 기존 허브의 DOM 갱신에 데이터를 전달한다. 실패하거나 증명할 수 없으면 기존 SSR을 유지한다.

태그 total이 정확한 경우에도 동일한 독립 검증을 한다. 따라서 실제 활성 태그가 빠졌는데 total도 함께 감소한 응답이나 거짓 total0도 승인되지 않는다. 정상 0건은 완전한 공개 Posts 조회에서 활성 공개 참조가 없음을 확인한 경우에만 승인한다. 반환된 미사용 공개 태그(count0)와 internal 태그는 활성 공개 집합에서 제외한다. count0인데 게시글 참조가 존재하면 누락으로 판정한다. Draft·비공개 콘텐츠는 공개 Posts 증명의 대상이 아니며, 공개 콘텐츠의 누락과 구분한다.

태그 필터는 전체 카탈로그 또는 `visibility:public`만 승인한다. 현재 네 허브는 전체 태그 카탈로그를 요청하므로 기존 분류·Featured·서버 순서를 유지한다. pages 최대1000, 항목100000 상한을 유지했다.

## 3. 성능·캐시·동시성

기존 페이지 캐시를 재사용하고 동일 페이지/컬렉션의 동시 요청 Promise를 공유한다. 정렬 조건이 다른 태그 요청도 동일한 공개 Posts 증명을 공유한다. 성공한 검증 컬렉션의 만료는 가장 오래된 페이지 및 Posts 증명의 만료를 넘지 않는다. 기존 tags/posts TTL10분을 유지한다.

새 검증 컬렉션과 교차 검증 Posts 데이터는 메모리에만 둔다. 교차 검증을 위한 새로운 인증 값 저장은 없다. 기존 일반 페이지용 URL 기반 sessionStorage 캐시는 유지한다. 문서 이동 후 일반 태그 캐시를 재사용해도 공개 Posts 증명은 새로 수행한다. 실패한 페이지 및 상충한 증명 캐시는 제거하고 부분 결과는 반환하지 않는다. 재시도 루프는 추가하지 않았다.

## 4. 운영 실제 실행 결과

실행 시간 UTC 2026-10-31 10:52:39–10:53:11. 양 사이트 HTML generator는 Ghost 6.69다. 수정된 실제 content-api.js를 VM에 로드해 각 허브/검색과 같은 쿼리로 직접 GET했다. 키는 로그에 기록하지 않았다.

| 검사 | KO | EN |
|---|---:|---:|
| 전체 공개 게시글 | 112 / PASS | 112 / PASS |
| 게시글 페이지 길이 | 100+12 | 100+12 |
| Tags API 길이 / total | 135 / 151 | 135 / 148 |
| 태그 페이지 길이 | 100+35 | 100+35 |
| Posts가 참조한 활성 공개 태그 | 135 | 135 |
| ID 중복·누락, slug/name/참조 수 불일치 | 0 / PASS | 0 / PASS |
| Categories / Series / Topics 양수 태그 | 5 / 14 / 116 | 5 / 14 / 116 |
| 교차 검증 자료 sessionStorage 저장 | 없음 | 없음 |
| 수정 수집기 완료 | PASS | PASS |

한 사이트의 동일 런타임에서 실제 네트워크 요청 수는 검색2, Categories4(tags2+증명posts2), Series/Topics2(태그 정렬 변경, 증명 재사용), Explore 태그0(동일 쿼리 컬렉션 재사용), 최근 글1이었다. 페이지별 상태·pagination·ID/slug와 실행 소스 SHA는 [production-api.json](tag-compatibility-2026-10-31/production-api.json) **(로컬 전용)**, 재현 스크립트는 [production-api.cjs](tag-compatibility-2026-10-31/production-api.cjs)에 있다. 양쪽 `allCollectionsCompatible=true`, `proofPersisted=false`다.

## 5. 테스트 결과

| 구분 | 사례 수 | 결과 | 증거 |
|---|---:|---|---|
| 기존 Content API | 21 | PASS | content-api-tests.log |
| 기존 SSR/JS fixture | 58 | PASS | ssr-tests.log |
| 기존 Playwright 허브 | 16 | PASS | hub-browser.log |
| 기존 Playwright P2 | 98 | PASS | p2-browser.log |
| **기존 합계** | **193** | **PASS** | 기존 사례 삭제 없음 |
| 신규 태그 완전성 단위 | 44 | PASS | tag-tests.log |
| 신규 ko/en ×4허브 브라우저 | 104 | PASS | tag-browser-verified.log |
| **신규 합계** | **148** | **PASS** | **자동화 전체341개** |
| 실제 Ghost 6 ko/en 허브 | 8 | PASS | ko/en-ghost-results.json, ko/en-ghost.log |
| Gulp build | 별도 | PASS | build.log |
| Linux GScan 6.6.1 --v6 | 별도 | PASS | gscan-6-v6.json |
| Linux GScan 5.2.5 --v6 | 별도 | PASS | gscan-5-v6.json |

로그 위치는 모두 [tag-compatibility-2026-10-31](tag-compatibility-2026-10-31/) 아래다. GScan은 errors0/warnings0, 기존 custom settings group recommendation1이다. 검사기를 수정하거나 재귀 partial·콘텐츠 수를 제한하지 않았다.

신규 단위 사례는 0건, 135/135·151·148, 실제 활성1개 누락(총계도 맞춘 경우 포함), 중복 ID, 잘못된 posts.tags·slug/name/count, 비정상200 JSON, 중간 페이지 실패, next 오류, 수집 중 total/참조 변경, 게시글 불완전성, 상한, 동시 요청 공유, 캐시 재사용·실패 후 복구를 포함한다. 신규 브라우저는 각 언어/허브에 정상·실패·검증 지연·정상 빈 집합을 적용해 실패 시 SSR main.innerHTML 보존과 검증 전 DOM 갱신 금지를 검사했다.

기존 P2 회귀에서는 111개 검색의 1/100/101/마지막 항목, 검색 총계·부분 실패·경합, 페이지 전후 이동·직접 진입·새로고침·잘못된 페이지·Back/Forward, API 실패와 빈 응답, SSR/JS 정렬·Featured·locale·메타데이터를 다시 실행했다. 기존 JS OFF·모바일 검사도 통과했다.

초기 브라우저6건 및 운영 진단의 proof-storage 판정은 일반 Explore 최근 글/검색 캐시까지 포함한 테스트 계측 오류였다. include와 fields가 정확히 교차 검증 쿼리인 항목만 판정하도록 수정하고 전체 재실행했다. 최종104건 및 production-api.json이 유효 결과이며 초기 로그도 삭제하지 않았다.

## 6. 실제 Ghost 6 검증

격리 Ghost6.73.0/Node22.23.4/SQLite에서 ko와 en을 차례로 실행했다. 공개 게시글112개, 활성 공개 태그676개, 미사용/Draft 전용2개로 Tags API는 total678, 반환676(첫100·마지막76)이었다. 모든 허브에서 실제 교차 검증 proof는 posts112/activePublicTags676으로 완료했다. 제공된 번들 JS와 로컬 빌드 SHA도 일치했다([local-server-evidence.json](tag-compatibility-2026-10-31/local-server-evidence.json)).

Categories225, Series225, Topics226개의 실제 SSR 링크를 JS OFF에서 확인하고 각 역할의 225번째 테스트 태그 링크를 클릭해 HTTP200을 확인했다. Explore는 각 태그 영역10개·최근5개를 확인했다. JS 실행도 실제 증명/런타임 UI로 확인했으며 단순 SSR fallback을 정상 갱신으로 오인하지 않았다. KO/EN 각각4페이지의 고유 title/description, self canonical1개, description/OG 각1개 및 값 일치, HTML lang, 모바일 가로 넘침 없음을 확인했다. hreflang은 추가하지 않았다.

언어별 결과 JSON, 키를 지운 원본 HTML8개와 모바일 스크린샷16개를 증거 폴더에 보관했다. 격리 테스트 컨테이너와 임시 DB는 완료 후 제거했으며 기존 사용자 Docker 서비스에는 변경을 가하지 않았다.

## 7. 이번 변경 파일

- `assets/js/lib/content-api.js`: 엄격한 Posts 검증과 태그 교차 증명을 분리하고 페이지/컬렉션 공유·캐시 정리를 추가.
- `assets/built/main.min.js`: Gulp로 수정 소스 반영.
- `tests/hub-fixture.cjs`, `tests/hub-ssr.test.cjs`, `tests/hub-browser.spec.mjs`, `tests/p2-regression.spec.mjs`: 기존 양수 태그 count와 일치하는 완전한 posts.tags 증명 fixture 추가. 기존 검사 수와 의미 유지.
- `tests/tag-coverage.test.cjs`, `tests/tag-coverage.spec.mjs`, `tests/tag-coverage-playwright.config.mjs`: 신규148개 검증.
- 이 보고서 및 `reports/tag-compatibility-2026-10-31/`: 재현 스크립트·증거.

이번 단계에서 네 허브 JS/HBS, 검색, SEO, 이력 구현은 추가 변경하지 않았다. 기존 사용자 P2 수정은 그대로 보존했다. package/lock 및 사용자 audio 스크립트도 변경하지 않았다.

## 8. 한계와 배포 판단

독립 공개 Posts 조회는 API 자체의 정합성 검증이지 DB 트랜잭션 스냅샷은 아니다. 관측되는 pagination·ID·slug/name/count 모순은 fail-closed로 SSR을 유지하지만, API가 완전히 일관된 오래된 스냅샷을 제공하는 경우까지 감지할 수는 없다. 검증된 캐시에는 기존 TTL 범위의 시차가 있다. 오래된 일반 session 태그 캐시와 새 증명이 충돌하면 한 번 SSR로 보존하고 해당 캐시를 제거해 다음 시도에서 복구한다.

운영 Ghost6.69와 격리6.73.0/SQLite는 버전·DB가 다르지만, 운영 실제 응답으로 수정된 수집기가 완료하는 것을 별도로 검증했다. 수정 후보를 운영에 업로드한 뒤의 동작은 **NOT RUN**이며 이번 범위 밖이다. Windows GScan의 기존 경로 구분자 관련 정적 분석 오류는 변경하지 않았고 Linux의 원본 검사기로 통과했다.

최종 필수 조건은 운영 KO/EN 교차 증명, 활성 태그 누락 방지, 비정상 API SSR 보존, 기존 GHV-01~05, 실제 Ghost6, Linux GScan v6, 빌드 모두 PASS다. 따라서 **READY**로 판단한다. 배포 시에는 이 소스와 `assets/built/main.min.js`를 함께 패키징하고, 별도 승인 후 ko/en8개 허브·검색·이력·메타데이터 smoke 검사를 수행해야 한다. 이번 작업에서는 배포하지 않았다.
