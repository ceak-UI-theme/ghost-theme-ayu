# P2 검증 보고서와 증거 보관

최종 기능 기준은 개발 통합 검증 READY 후보다. `ghost-p2-version-1.0.1-2026-11-01.md`는 해당 후보의 버전만 올린 Git 반영 검증이며, 푸시 후 전체 검토는 `ghost-p2-main-review-2026-11-01.md`에 기록한다.

| 단계 | 보고서 | 당시 판단 |
|---|---|---|
| 운영 결함 재현 | ghost-post-deploy-verification-2026-10-31.md | GHV-01~05 증거 |
| P2 코드 수정 | ghost-p2-fixes-and-regression-2026-10-31.md | 수정 완료, 당시 GScan/태그 호환성 한계 |
| 중간 게이트 | ghost-p2-release-gate-2026-10-31.md | 당시 태그 검증 BLOCKED |
| 태그 독립 교차 검증 | ghost-p2-tag-compatibility-2026-10-31.md | READY |
| 개발 통합 배포 | ghost-p2-dev-deployment-verification-2026-10-31.md | READY |

이전 보고서의 FAIL/BLOCKED를 소급해서 PASS로 바꾸지 않았다. 후속 단계가 어떤 근거로 문제를 해결했는지 함께 읽어야 한다.

Git에는 보고서와 작은 최종 결과 JSON·로그·manifest를 포함한다. 총계/요청 기록이 큰 개발 API JSON은 `.summary.json`에 페이지별 pagination·상태·배열 길이·판정과 원본 SHA를 보존했다. 정상 fixture를 사용하는 `tests/`는 재현 가능한 테스트 코드로 전부 포함한다.

ZIP·스크린샷·원본 HTML·DB·임시 seed/deployment/rollback 실행 스크립트·실패 진단용 scratch 파일은 로컬 보관 대상으로 커밋하지 않았다. 이전 보고서의 해당 링크에는 **로컬 전용** 표시를 붙였다. 이는 로컬 작업 공간에서 열 수 있지만 새 clone에 다운로드되지 않는다. 로컬 제외 파일 목록·크기·SHA는 `p2-1.0.1-2026-11-01/local-evidence-inventory.json`, 실제 포함 목록은 같은 폴더의 `committed-evidence.json`을 참고한다. 기존 사용자 파일을 삭제하지 않았다. 인증 값과 개발 DB는 Git에 포함하지 않는다.

## 재현 명령

의존성은 package-lock.json을 사용한다. 아래 테스트는 운영/개발 DB를 변경하지 않고 fixture 브라우저에서 실행된다.

```sh
node tests/content-api-validation.test.cjs
node tests/hub-ssr.test.cjs
node tests/tag-coverage.test.cjs
node node_modules/@playwright/test/cli.js test --config tests/hub-playwright.config.mjs
node node_modules/@playwright/test/cli.js test --config tests/p2-playwright.config.mjs
node node_modules/@playwright/test/cli.js test --config tests/tag-coverage-playwright.config.mjs
node node_modules/gulp/bin/gulp.js build
```

합계341개(21+58+44+16+98+104). Playwright Chromium이 설치되어 있어야 한다. GScan은 Linux에서 Ghost6의 원본 GScan을 `checkVersion:v6`로 실행한다. `release-gate-2026-10-31/gscan-linux.cjs`는 `/theme`를 검사하는 원본 라이브러리 호출 어댑터이며 규칙을 수정하거나 우회하지 않는다. Docker를 사용할 경우 실제 테마 후보를 `/theme:ro`, 이 저장소를 `/deps:ro`로 마운트해 `node /deps/reports/release-gate-2026-10-31/gscan-linux.cjs /var/lib/ghost/current/node_modules/gscan v6`를 실행할 수 있다.

기존 `tests/theme-smoke.test.mjs`는 main에서도 사라진 categories.hbs/series.hbs를 읽는 별도의 오래된 검사다. 필수341개에 포함되지 않으며 현재 실행은 FAIL이다. 이를 숨기거나341개가 전체 저장소의 모든 테스트라는 뜻으로 해석하지 않는다. Linux GScan 게이트와 실제 Ghost 검증 결과는 보고서에서 별도로 구분한다.
