# Ghost P2 v1.0.1 Legacy Smoke 및 PR 최종 검증 — 2026-11-01

현재 판정: **CONDITIONAL — 로컬359개·빌드·Linux GScan PASS, PR/CI 완료 확인 전.** 이 문서는 PR 생성 및 최종 HEAD의 CI 완료 후 갱신한다. 운영 배포·main 병합·Release·Tag는 수행하지 않는다.

## 1. 시작 기준

- 브랜치 `codex/fix-content-api-pagination`, HEAD `7d76124d29f5d8c0886598e5bdcdf464a2429c7e`.
- fetch한 origin 브랜치와0/0. main `9d140b5cd239a1d115ab66acd5df2a8d2a534c69` 대비4 ahead/0 behind. 기존 커밋 유지, force push 없음.
- 추적 작업트리 clean. 개인 `artifacts/check_audio_local.js`와 미추적 로컬 증거는 보존한다.
- package/lock 및 lock 루트 모두1.0.1. 기존 GitHub Actions workflow 없음.
- 기준은 P2 main 검토·버전·개발 배포·태그 호환성·중간 gate 보고서다. 이전 PASS를 새 실행 결과로 재사용하지 않았다.

## 2. Smoke 실패와 정비

수정 전 `node tests/theme-smoke.test.mjs`는 categories.hbs ENOENT로 FAIL했다. 해당 템플릿은 `801d5c4`의 redundant route template 제거 때 series.hbs 등과 함께 삭제됐고 page-*.hbs/routes 구조가 정본이 됐다. 오래된 Smoke는 Featured posts 복수형, 고정3개 최신 글 쿼리, 템플릿 내6번째 광고도 기대했다. 현재는 Featured post/collection pagination/공통5카드 promo 정책이다.

단순 경로 치환 대신 아래18개 빠른 Smoke로 재구성했다.

- 기존 tag 상세의 Featured/Latest, Featured 제외·fallback, 실제 collection 페이지네이션.
- 유효한 archive/광고 CSS와 현행 공유 promo 삽입 정책.
- 4허브의 실제 route·partial·Handlebars 블록·분류·100개 단위 native details 확장.
- 4허브의 작은 ko/en HBS fixture SSR에서 실제 공개 tag 링크. browser/실제 Ghost 검사로 확대 해석하지 않는다.
- 4허브의 검증 수집기 연결·임시 skeleton 덮어쓰기 없음·catch에서 DOM 삭제/교체 없음.
- 공유 SEO head/canonical 보존·locale 문자열, strict API/공개 Posts 증명·상한, 검색/이력 복원·bootstrap.

기존341개와 fixture는 수정·삭제·skip하지 않았다. Smoke는 빠른 구조 검사이며 복잡한 브라우저 검증을 대체하지 않는다.

## 3. 변경 파일과 테스트 체계

- `tests/theme-smoke.test.mjs`: Smoke18개.
- `package.json`: test:smoke/test:unit/test:fixture-browser 실행 스크립트 추가. 버전·의존성 유지, lock 변경 없음.
- `tests/verify-theme-zip.py`: Python 표준 라이브러리로 ZIP CRC·안전 경로·중복·정확한 파일 집합·소스 바이트·version·키 패턴·실제 압축 해제 검증.
- `.github/workflows/theme-validation.yml`: Ubuntu24.04/Node22, npm ci, Smoke18, 단위123, fixture Chromium218, Gulp ZIP, ZIP 검사, Linux GScan v6.
- `docs/developer/Testing.md`: 전체 테스트 인벤토리, 실서버 e2e와359개 fixture suite 분리, 재현 방법.
- reports README와 과거 검토/버전 보고서는 과거 FAIL 이력을 유지하고 후속 Smoke 정비 안내만 추가.

기존 `npm test`의 GScan 명령과 `npm run test:e2e`의 실서버 suite를 보존했다. CI는 명시적인 새 스크립트로 전체 P2 gate를 실행한다. 테스트를 줄이거나 실패를 continue-on-error/skip으로 가리지 않는다.

## 4. 이번 로컬 실행 결과

| 검사 | 사례 | 결과 |
|---|---:|---|
| Content API | 21 | PASS |
| SSR | 58 | PASS |
| 기존 허브 Playwright | 16 | PASS |
| P2 Playwright | 98 | PASS |
| 태그 단위 | 44 | PASS |
| 태그 Playwright | 104 | PASS |
| 기존 소계 | **341** | **PASS** |
| Legacy Smoke | **18** | **PASS** |
| 전체 행위/구조 사례 | **359** | **PASS** |
| Gulp build/ZIP | 별도 | PASS |
| ZIP CRC·파일·소스·압축 해제 | 별도 | PASS |
| Linux GScan6.6.1 v6 | 별도 | PASS: errors0/warnings0 |
| Workflow YAML/권한·fixture 구성 | 별도 | PASS |

현재 Node 런타임은 로컬24.22.1, GScan 컨테이너22.23.4다. CI는22로 별도 실행하여 확인한다. GScan recommendation1은 기존 custom settings group 권고다. 원본 checker·규칙·partial 재귀를 바꾸지 않았다.

로그와 [ZIP 검사](pr-readiness-2026-11-01/zip-validation.json), [GScan](pr-readiness-2026-11-01/gscan-v6.json)은 [증거 폴더](pr-readiness-2026-11-01/)에 있다. 수정 전 실패는 legacy-before.log, 수정 후18개는 legacy-after.log다.

## 5. 기능·산출물 정합성

P2 assets/js, HBS, CSS 기능 소스 및 기존341개는 변경하지 않았다. main.min.js SHA-256은 **`9e2b987be6fd3097a04d8c965e13e65c72e38d420ca2f379132817961645af22`**로 기준과 같다. CSS 빌드에서 발생한 줄바꿈 차이는 내용 동등성을 확인하고 작업트리에 남기지 않았다.

이번 ZIP은 기존 Gulp zip 명령의 정식124파일 패키지다. 이전 수동 검증 ZIP123파일에 비해 기존 Gulp 계약의 gulpfile.js가 추가되는 차이가 있다. 새 테스트 실행 scripts는 package metadata 차이이며 제품 런타임 변경이 아니다. ZIP은 정상 빌드 파일과 정확히 대조했고 로그/fixture/DB/인증 값은 포함하지 않았다. ZIP 자체는 dist에 로컬 보존한다.

## 6. CI 및 PR 상태

PR URL/번호: **NOT RUN — 생성 전**.

CI: **NOT RUN — PR 생성 후 실제 실행 예정**. CI가 없었으므로 최소 workflow 하나만 추가했다. main 대상 pull_request, main push, workflow_dispatch를 처리한다. contents:read, checkout persist-credentials:false, 배포/운영 secret 없음, pull_request_target 없음.

브라우저는 fixture.test 요청을 가로채며 공개 운영 API·Admin·DB를 호출하지 않는다. Chromium 시스템 의존성을 공식 Playwright 방법으로 설치하고 각 suite는 worker1이다. GScan은 이전 로컬 gate와 같은 immutable Ghost digest `4195f6c405e40230cd10c0770425cf500c1f542a96e9f6584c11649c150e5a89`의6.6.1을 사용한다. ZIP을 별도 경로로 압축 해제한 뒤 checker만 `--network none`·read-only mount로 실행하고 Ghost 서버를 시작하지 않는다.

## 7. 한계와 종료 조건

기존 P3 taxonomy 배지 정리·회원 SDK 요청 취소·API TTL/원자적 snapshot 한계는 미해결이며 이번 테스트 정비로 해결됐다고 주장하지 않는다. 실제 기기/일부 브라우저, Ghost6+MySQL, 회원/결제/메일/ActivityPub 전체, 운영 배포 및 현재 수정본의 개발 재배포는 NOT RUN이다. 종전 Ghost5/6 개발 통합 증거와 동일 런타임 JS 해시를 구분해 참고한다.

기존 실서버 e2e는 controlled Ghost dataset 및 특정 게시물에 의존해 이번 fixture CI에는 넣지 않았다. 테스트 파일과 기존 명령은 보존했으며 CI PASS로 표기하지 않는다. 현행 전체 테스트 목록은 Testing guide에 있다.

커밋·Push·PR 생성 후 base/head/최종 SHA·충돌·변경 파일·CI 완료를 확인한다. 현재 로컬 PASS만으로 최종 READY라고 하지 않는다. PR 병합·Release·Tag·운영 변경은 하지 않는다.

공식 참고: [Playwright CI](https://playwright.dev/docs/ci), [GitHub workflow 문법](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax).
