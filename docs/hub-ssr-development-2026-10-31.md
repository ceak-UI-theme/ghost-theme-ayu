# 개발 서버 반영 및 실제 Ghost 검증

> 후속 P2 안정화와 태그 API 교차 검증은 완료됐다. 현재 결과는 [1.0.1 반영 검증](../reports/ghost-p2-version-1.0.1-2026-11-01.md)과 [통합 검토](../reports/ghost-p2-main-review-2026-11-01.md)를 참고한다. 아래 내용은 당시의 검증 기록으로 유지한다.

2026-10-31, 사용자의 후속 요청에 따라 개발 서버에 검증된 테마 ZIP을 반영했다. 운영 사이트는 변경하지 않았다.

## 반영 대상과 복구

- 개발 URL: http://172.22.0.199:2368
- Docker 컨테이너: `ghostdev_ghost`, Ghost **5.130.6**
- Compose 확인 경로: `/mnt/d/workspace/02.works/ghost-dev/docker-compose.yml`
- 활성 테마: `signal-wave-ayu` (읽기 전용 DB 조회로 확인)
- 테마 경로: `/mnt/d/workspace/02.works/ghost-dev/content/themes/signal-wave-ayu`
- 반영 전 테마 백업: `/mnt/d/workspace/02.works/ghost-dev-theme-backups/20261031-134943/signal-wave-ayu`
- 반영 전 categories HTML: 같은 백업 폴더의 `categories-before.html`
- ZIP SHA-256: `208cb02630bc39a8fea96458e1b5c4b0b43bcc405aadf169fc5383e0f5d04b25`

ZIP 내부 코드와 현재 저장소 코드가 동일한지 확인한 후 별도 staging 폴더에 압축을 풀었다. 기존 테마 폴더를 백업 위치로 옮기고 staging 폴더를 활성 테마 경로로 옮겼다. `docker restart ghostdev_ghost`로 **개발용 Ghost만** 재시작했다. MySQL 컨테이너, 관리자 설정, routes.yaml, 게시물 및 공개 상태는 직접 변경하지 않았다. Ghost는 기본 NODE_ENV가 production으로 표시되지만 Compose의 사설 개발 URL과 개발 전용 컨테이너/볼륨을 확인하고 작업했다.

복구가 필요하면 현재 활성 테마를 별도 위치로 보존한 후 위 백업의 `signal-wave-ayu` 폴더를 원래 테마 경로로 복원하고 개발 Ghost 컨테이너만 재시작하면 된다. 백업은 삭제하지 않았다.

## 실제 서버 확인 결과

| 경로 | HTTP | canonical 수 | og:title 수 | SSR 콘텐츠 |
| --- | --- | --- | --- | --- |
| `/explore/` | 200 | 1 | 1 | 카테고리·시리즈·주제·최근 글 링크 |
| `/categories/` | 200 | 1 | 1 | 카테고리 6개 |
| `/series/` | 200 | 1 | 1 | 시리즈 5개 |
| `/secondary-tags/` | 200 | 1 | 1 | 주제 17개 |

canonical은 모두 현재 개발 사이트의 해당 URL이다. `data-aborted-get-helper`는 발견되지 않았다. 실제 Content API의 공개·게시물 수 양수 태그 집합과 각 허브의 SSR 링크 집합을 대조하여 누락 및 잘못된 추가 항목이 없음을 확인했다. 이미지와 제목 링크가 같은 태그를 가리키는 것은 정상이며, 카드 중복은 별도 검사했다. 서버 로그에서 해당 허브의 렌더 오류나 get helper 실패가 발견되지 않았다. 기존 mail.from 설정 경고는 남아 있다.

## 실제 Chromium E2E: 28 PASS

신규 테스트: `tests/e2e/hub-dev-ssr.spec.mjs`

네 경로마다 아래 7개 항목을 확인했다.

1. 실제 Ghost SSR + JavaScript 비활성: 콘텐츠 링크, HTTP 200, canonical/OG 각 1개, 모바일 가로 overflow 없음. 주제 목록의 details도 JS 없이 펼쳐짐.
2. Content API 키 누락: 브라우저 안에서만 공개 런타임 키를 비워 SSR 링크 보존 확인.
3. API 401: 브라우저 요청 interception으로 응답을 대체하여 SSR 링크 보존 확인.
4. API 403: 같은 방식으로 SSR 링크 보존 확인.
5. API 500: 같은 방식으로 SSR 링크 보존 확인.
6. 오프라인: 브라우저 Content API 요청만 중단하여 SSR 링크 보존 확인.
7. 실제 Content API 성공: 실제 배포된 `main.min.js`의 개선 동작, 카드 중복 없음, 모바일 가로 overflow 없음, pageerror 없음.

키 누락/오류 주입은 테스트 브라우저에서만 수행했다. 서버의 API 키나 관리자 설정은 변경하지 않았다.

실행 명령 (저장소 루트, 이 환경에서는 Windows에 Chromium이 설치됨):

```bash
'/mnt/c/Program Files/nodejs/node.exe' node_modules/@playwright/test/cli.js test tests/e2e/hub-dev-ssr.spec.mjs
```

기본 `playwright.config.mjs`의 개발 URL을 사용한다. 다른 개발 서버에서는 기존 `PLAYWRIGHT_BASE_URL` 설정을 사용할 수 있다. API 성공 테스트는 대표 및 나머지 항목이 존재하는 현재 개발 데이터셋을 전제로 한다.

## 남은 미검증 범위

- 개발 사이트의 실제 `site_locale`은 **ko**다. en 설정의 실제 Ghost SSR은 아직 NOT RUN이며 관리자 설정을 바꾸지 않았다. 기존 한영 fixture/브라우저 16건은 그대로 유효하다.
- 개발 사이트는 분류별 태그가 100개 미만이다. 100개 초과 재귀 조회는 이전 225개 fixture에서 검증했으며, 실제 Ghost에서 100개 초과 경로는 NOT RUN이다.
- 개발 카테고리/시리즈 수는 동적 페이지네이션이 생기는 기준보다 적다. 실제 데이터로 페이지 2 전환은 NOT RUN이다. URL/뒤로 가기/다중 페이지 동작은 이전 fixture 브라우저 검증 결과를 따른다.
- 운영 사이트 새 코드 반영, Ghost 6 실제 서버, 대규모 성능 부하는 NOT RUN이다.
- 기존 `tests/theme-smoke.test.mjs`의 삭제된 템플릿 참조 오류는 그대로 남아 있다.

초기 보고서의 “새 테마 실제 Ghost 서버 렌더링 NOT RUN”은 이번 **Ghost 5.130.6 한국어 개발 환경 범위에서 PASS로 갱신**한다. 운영 및 영어 실제 사이트 통합 검증까지 완료했다는 의미는 아니다. Commit, Push, PR 및 운영 배포는 수행하지 않았다.
