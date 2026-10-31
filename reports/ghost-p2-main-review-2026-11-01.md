# P2 1.0.1 원격 코드 통합 검토 — 2026-11-01

> 후속 변경: 당시 미해결 Legacy Smoke는 정비됐다. 현재 결과는 [PR 최종 검증](ghost-p2-pr-readiness-2026-11-01.md)을 참고한다. 아래 FAIL 표기는 당시 이력이다.

**판단: P2 범위 main 병합 가능(READY).** 새 P0/P1/P2 차단 문제·기능 파일 누락·개인/인증 파일의 신규 포함은 발견하지 못했다. 실제 main 병합·PR·Release·운영 배포는 수행하지 않았다. 별도 legacy smoke 검사 실패와 기존 P3/미검증 항목은 아래와 같이 남는다.

## 1. 원격 기준 및 Push

- 브랜치: `codex/fix-content-api-pagination`
- 기능 커밋: **`a2f879b9692313999712eab39de4e29e75dec15a`**
- 메시지: `fix: stabilize SSR hubs and tag coverage for 1.0.1`
- 원격 Push: `b9e8f9f..a2f879b` 성공. 이후 fetch한 원격 SHA와 로컬 HEAD가 일치했다.
- 비교 main: `9d140b5cd239a1d115ab66acd5df2a8d2a534c69`
- main 대비 이미 있던 `ffd5857`(태그 API 페이지네이션), `b9e8f9f`(허브 SSR/fallback)와 이번 기능 커밋을 함께 검토했다.
- 원격 기능 커밋 기준 차이111파일: 기능·빌드·기존 문서·테스트39파일, reports72파일. 최종 검토 문서3개를 추가한 전체 목록은114파일이다. [전체 목록](p2-1.0.1-2026-11-01/remote-main-files.txt), [구조·해시 검사](p2-1.0.1-2026-11-01/remote-review.json).
- 본 검토 기록과 과거 개발 문서의 후속 결과 안내는 별도 **문서 전용 커밋**으로 추가한다. 해당 커밋은 기능·패키지·빌드·테스트를 바꾸지 않는다. 최종 브랜치 tip은 `git rev-parse origin/codex/fix-content-api-pagination`으로 확인할 수 있다.

main은 원격 기능 커밋의 조상이다. 검토 시점에는 fast-forward 가능한 관계로 충돌이 없었다. main이 나중에 이동하면 병합 전 다시 확인해야 한다.

## 2. 기능별 통합 검토

| 항목 | 원격 구현·증거 | 결과 |
|---|---|---|
| GHV-01 정렬 | HBS와 API가 count.posts desc/name asc/slug asc를 공유. 브라우저 localeCompare 재정렬 제거. Categories Featured는 서버 name 순서를 유지하며 최대 count 선택. 이전 Ghost5/6 실제 순서 및 이번 회귀 확인 | PASS |
| GHV-02 검증 | 공통 페이지 스키마·ID·prev/next·페이지 일관성·상한, strict Posts 완전성. Tags는 모든 페이지와 독립 Posts proof가 완료되어야 반환. 네 허브의 catch는 SSR을 빈/에러 컨테이너로 바꾸지 않음 | PASS |
| GHV-03 이력 | 사용자 이동 pushState, URL 정규화 replaceState, popstate UI 복원. Search의 query/page·경합 방지 포함. Categories/Series/Search의 Back/Forward·새로고침·직접 진입·경계/연속 이동 검증 | PASS |
| GHV-04 SEO | hub-title/meta 블록과 공유 hub-seo partial, ko/en 고유 문자열. Ghost canonical·schema·기존 head 기능을 보존하고 social_data만 대체. canonical 중복 및 자동 hreflang 추가 없음 | PASS |
| GHV-05 전체 검색 | 1페이지 JSON 대신 공통 Posts 컬렉션 수집. 모든100개 단위 페이지를 검증하고111개 경계 검색·전체 수·부분 실패·늦은 응답 방지 검사 | PASS |
| 태그 호환성 | total 길이 차이는 페이지 수집 후 공개 Posts 전체의 공개 tag ID/slug/name/참조 count와 대조해 승인. 거짓0건·총계까지 맞춘 누락·중복·일부 실패·변경 모순을 거부 | PASS |
| SSR | 초기 HBS 실제 링크와 Ghost #get, Featured 제외, native details, 재귀 page 확장. 분류별225개 이상 접근 및 마지막 링크200의 실제 Ghost 증거 유지 | PASS |
| locale/링크 | API는 해당 페이지 호스트의 컬렉션을 사용. 원문 콘텐츠 이름 보존, hub UI는 theme site_locale. Ghost locale과 theme locale의 운영 설정 정렬은 별도 필요 | PASS |
| Ghost5/6 | 기존 개발 Ghost5/MySQL 및 독립 Ghost6/SQLite 실검증 + 현재 제공 JS 해시 동등성. 새 버전은 package metadata만 달라 기능적 차이 없음 | PASS(범위 한계 별도) |

Ghost6 설치 소스의 ghost_head 구현도 읽기 전용으로 확인했다. `social_data`, `schema`, `metadata`의 exclude가 각각 분리되어 있어 social_data 제외가 canonical/JSON-LD 전체 삭제를 의미하지 않는다. 이번 변경은 Ghost helper를 수정하지 않는다.

## 3. 누락·중복·불필요한 변경 점검

- 1.0.1 manifest123파일을 원격 blob에서 직접 읽어 전부 대조했다. 개발 후보와는 package.json의 version만 다르고 main.min.js SHA는 `9e2b987be6fd3097a04d8c965e13e65c72e38d420ca2f379132817961645af22`로 동일하다.
- package-lock의 루트와 packages[""].version도1.0.1이며 dependency lock 내용은 유지됐다. 버전만 변경한 ZIP SHA는 `6a6f4ef78e15197740df456e761b605a5c87a30388fcc881a888b0b92b53b351`이다. ZIP은 로컬 dist에만 보관했다.
- hub-seo partial과 공통 검증기, 검색·네 허브, SSR partial들, 기본 레이아웃, 이전 CSS disclosure 변경, 빌드 산출물, 신규 API/P2/tag 테스트 및 설정이 원격에 존재한다.
- 앱 lib의 최상위 함수 이름 중복은0. 특히 fetchAyuContentApiCollection/validateAyuContentApiPage/verifyAyuPublicTagCoverage/ayuHubText는 각각1개다. 각 허브의 카드 렌더링/페이저는 기존 구조를 유지하며 수집·검증 로직은 공통 모듈을 사용한다. 임시 override를 빌드에 덧붙이지 않았다.
- 개인 audio 스크립트·DB·키·raw ZIP/HTML/PNG·candidate 복사본·seed/배포 fixture 스크립트가 이번 diff에 포함되지 않았다. main에 원래 있던 assets/artifacts 파일을 P2 때문에 삭제하지 않았다.
- 작은 최종 보고서·증거만 선별했고, 같은 pagination 기록의 ID/slug 반복 dump는 SHA를 포함한 summary로 축소했다. 이전 FAIL/BLOCKED 판정은 당시 사실로 유지했다. 로컬 전용 링크는 명시했다. 구 개발 문서2개에는 최신 결과 안내만 추가한다.
- `.gitignore` 추가는 reports의 raw capture/DB/ZIP/candidate를 로컬로 유지하기 위한 규칙이다. 테마 패키지에는 들어가지 않고 기능 차이가 없다.

[스테이징 검증](p2-1.0.1-2026-11-01/staged-validation.json), [포함 증거 목록](p2-1.0.1-2026-11-01/committed-evidence.json), [로컬 제외 inventory](p2-1.0.1-2026-11-01/local-evidence-inventory.json). 파일 선택 검사는 최초 source commit과 이후 문서 커밋을 구분한다.

## 4. 테스트와 남은 문제

이번 버전에서21 API+58 SSR+16 기존 허브 브라우저+98 P2 브라우저+44 태그 단위+104 태그 브라우저, **341개 PASS**. Gulp PASS. Linux 원본 GScan6.6.1 v6 errors0/warnings0, 기존 custom settings group recommendation1. 새 버전 검사 상세는 [1.0.1 검증](ghost-p2-version-1.0.1-2026-11-01.md)에 있다. 원격 blob과 검사한 후보가 같은 것을 별도 확인했다.

| 남은 항목 | 판단·권장 후속 작업 |
|---|---|
| 기존 theme-smoke FAIL | main과 같은 검사 파일이 삭제된 categories.hbs를 읽어 ENOENT. 필수341개와 별도이며 새 회귀가 아니다. 후속 유지보수에서 현행 page-*.hbs/동작 기준으로 정리 필요. 모든 테스트가 green이라고 주장하지 않음 |
| P3 분류 배지 정리 | 기존 taxonomy 전역 정리가 SSR의 .post-tag 배지를 제거. 링크·제목·count·핵심 SSR 유지. 표시 정책 후속 검토 |
| P3 회원 SDK 취소 | 이전 실검증에서 member 요청 취소 관측, 원인 미확정. Content API·검색·허브 오류와 구분. 회원 기능은 별도 검증 필요 |
| GScan 권고1 | package custom settings group의 기존 recommendation. errors/warnings는0 |
| API 스냅샷·캐시 | DB 원자적 snapshot은 아니다. 일관된 오래된 응답 및 TTL 시차는 탐지 한계. 관측되는 ID/slug/name/count/metadata 모순은 SSR 보존. fetch 자체의 새 hard timeout 정책은 추가하지 않음 |
| NOT RUN | 1.0.1 metadata의 서버 재설치, 실기기/Safari 등 전체 브라우저, Ghost6+MySQL, 회원/결제/메일/ActivityPub 전체, 운영 배포 후 검증 |

Ghost5/6의 전체 제품 기능 호환성을 보장하는 판정은 아니다. 이번 범위는 SSR 허브·태그 검증·검색·이력·SEO·빌드다. 문서 전용 커밋 뒤에는 기능 diff가 없으므로 동일341개를 이유 없이 반복 실행하지 않는다.

## 5. 결론 및 종료 범위

P2 기능 후보와 원격 코드의 동등성·회귀 및 파일 선택 검증을 충족했다. **main 병합을 막는 새 결함은 발견하지 못했으며 P2 기준 병합 가능하다.** 기존 legacy smoke 실패를 필수 CI로 채택하려면 그 검사부터 별도 정리해야 한다. 이 결과만으로 그 실패를 PASS로 간주할 수 없다.

기능과 검토 기록을 지정 브랜치에 Commit/Push하고 종료한다. PR 생성·main 병합·GitHub Release·개발 테마 재배포·운영 변경은 하지 않았다. 기존 미추적 개인 파일 및 제외한 로컬 실행 증거는 그대로 보존했다.
