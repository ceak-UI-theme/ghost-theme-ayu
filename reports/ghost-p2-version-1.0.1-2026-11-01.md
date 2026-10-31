# P2 후보 1.0.1 Git 반영 검증 — 2026-11-01

개발 통합 READY 후보의 기능 소스를 그대로 유지하고 package 버전을1.0.1로 올렸다. 필수341개 회귀·빌드·Linux GScan v6는 이번 버전으로 다시 PASS했다. 개발/운영 서버의 테마를 새 버전으로 교체하거나 GitHub Release를 만들지 않았다.

## 기준 및 범위

- 작업 브랜치 `codex/fix-content-api-pagination`, 시작 HEAD `b9e8f9fea072af9720c892868b983d5a675201c7`.
- 원격 조회/Fetch 후 같은 원격 브랜치는 시작 HEAD와 동일. main `9d140b5cd239a1d115ab66acd5df2a8d2a534c69` 대비 기존 SSR·페이지네이션2개 커밋도 통합 검토에 포함한다.
- 정본: [개발 배포 READY 보고서](ghost-p2-dev-deployment-verification-2026-10-31.md)의 ZIP 및 [123파일 manifest](dev-deployment-2026-10-31/candidate-manifest.json).
- 실제 수정된18개 기존 파일, 누락되어 있던 hub-seo partial·Content API/P2/tag 테스트7개, package/lock 및 관련 문서·작은 최종 증거를 포함한다. 앞선 SSR HBS·CSS·helper·테스트·문서는 이미 브랜치 두 커밋에 있다.
- 개인 `artifacts/check_audio_local.js`는 미추적 상태로 보존하고 stage하지 않았다. DB·인증 값·ZIP·스크린샷·원본 HTML·임시 seed/배포 스크립트·큰 로그는 커밋하지 않는다. [증거 보관 정책](README.md)과 로컬 제외 inventory를 참고한다.

## 버전과 배포 후보 동등성

package.json version, package-lock.json version 및 packages[""].version을1.0.1로 변경했다. 의존성·스크립트·설정의 변경은 없다. 후보123파일 중 **package.json만 다르고, JSON 비교에서도 version만 다르다**. 기존 작업트리의 기능 소스와 테스트를 추가 수정하지 않았다.

| 항목 | SHA-256 |
|---|---|
| 개발 배포 ZIP1.0.0 | `281bda59f8099558131937b444b9029facb10c33770aeaa89bc13c2c849ea67d` |
| 새 ZIP1.0.1 | `6a6f4ef78e15197740df456e761b605a5c87a30388fcc881a888b0b92b53b351` |
| JS(두 후보 동일) | `9e2b987be6fd3097a04d8c965e13e65c72e38d420ca2f379132817961645af22` |

새 ZIP은 로컬 `dist/signal-wave-ayu-1.0.1.zip`에 보관하며 Git에 넣지 않았다. 파일 목록·ZIP integrity 검사 PASS. [artifact.json](p2-1.0.1-2026-11-01/artifact.json), [후보 manifest](p2-1.0.1-2026-11-01/candidate-manifest.json).

기존 개발 Ghost5와 독립 KO/EN Ghost6의 제공 JS도 위 SHA와 같고4허브씩 GET200이었다([읽기 전용 확인](p2-1.0.1-2026-11-01/development-readonly.json)). 1.0.1 메타데이터 자체를 실제 서버에 설치한 검사는 NOT RUN이다. 기존 실제 Ghost5/6 통합 검증과 기능 파일의 바이트 동등성을 근거로 호환성을 유지한다고 판단한다.

## 현재 소스로 재실행한 검사

| 검사 | 수 | 결과 | 로그 |
|---|---:|---|---|
| Content API 기존 | 21 | PASS | content-api.log |
| SSR 기존 | 58 | PASS | ssr.log |
| Playwright 기존 허브 | 16 | PASS | hub-browser.log |
| Playwright 기존 P2 | 98 | PASS | p2-browser.log |
| 태그 교차 검증 단위 | 44 | PASS | tag-unit.log |
| 태그 교차 검증 브라우저 | 104 | PASS | tag-browser.log |
| 합계 | **341** | **PASS** | 기존193+신규148 |
| Gulp build | 별도 | PASS | build.log |
| 원본 Linux GScan6.6.1 v6 | 별도 | PASS | gscan-v6.json |

로그는 [p2-1.0.1-2026-11-01](p2-1.0.1-2026-11-01/) 아래다. GScan errors0/warnings0, 기존 custom settings group recommendation1. Windows 분석기 수정·규칙 우회는 없다. 테스트는 mock DB/브라우저 fixture를 사용하며 실제 운영 데이터를 바꾸지 않는다.

별도 legacy `tests/theme-smoke.test.mjs` 실행은 **FAIL**: 사라진 categories.hbs를 읽어 ENOENT. 이 파일은 main과 동일한 blob `55b9e07cc5b658e50271160a6d96656f2c3587b9`이며 main에도 categories.hbs/series.hbs가 없다. 필수341개에 포함되지 않은 기존 결함이다. 후보 정본을 바꾸지 않기 위해 이 요청에서 수정하지 않았다. [진단 로그](p2-1.0.1-2026-11-01/legacy-smoke.log). 저장소에는 별도 GitHub Actions 워크플로가 없고 package의 test는 GScan을 호출한다. 전체 저장소의 모든 테스트가 PASS라고 주장하지 않는다.

## Git 포함·제외 검증

보고서5개는 당시 FAIL/BLOCKED/READY의 경위를 유지한다. 소급해서 성공 판정으로 고치지 않았고, 로컬 전용 링크 표지만 추가했다. 작은 최종 증거를 포함하고 페이지·태그 ID dump가 큰 개발 API 기록은 원본 SHA와 pagination/수집 판정을 남긴 summary로 보관했다. Git 밖 원본은 삭제하지 않았다.

스테이징 시 실제 blob을 검사해 인증 값·개인 파일·DB·배포 ZIP·임시 fixture 실행 스크립트가 없는지 확인한다. 기능 source 및 테스트 전체가 stage되었는지 확인하고, commit 후 원격 코드 전체와 main의 차이는 [통합 검토 보고서](ghost-p2-main-review-2026-11-01.md)에 별도로 기록한다.

이 단계에서는 Git Commit/Push만 수행한다. PR 생성·병합·Release·운영 변경은 하지 않는다. 기존 P3 cosmetic 배지 정리·회원 SDK 취소, 실기기/Ghost6+MySQL 미검증, API 스냅샷/캐시 한계는 개발 보고서와 동일하며 버전 상승으로 해결됐다고 주장하지 않는다.
