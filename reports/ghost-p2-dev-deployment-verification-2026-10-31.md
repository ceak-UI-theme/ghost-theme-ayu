# Ghost P2 개발 서버 배포 및 통합 검증

> Git 증거 보관 범위: [reports README](README.md) **(로컬 전용)**. 로컬 전용 표시의 원본 캡처·실행 파일은 커밋하지 않았다.

최종 판단: **READY — 개발 서버 배포와 핵심 통합 검증 통과.** 운영 배포 및 GitHub Release는 수행하지 않았다. 요청한 보고서 파일명은 유지했다. 실행은 2026-10-31에 시작했고 중단 후 재개하여 **2026-11-01 KST**에 최종 확인했다.

## 1. 개발 환경 식별 및 분리

| 대상 | 접근 URL | 실행·버전 | DB | 역할 |
|---|---|---|---|---|
| 기존 상시 개발 | http://172.22.0.199:2368 | Compose `ghost-dev`, `ghostdev_ghost`, Ghost5.130.6 / Node20.20.0 | `ghostdev_mysql`, MySQL8.0.45, 개발 DB `ghost` | 기존 데이터 보존, 한국어 실제 개발 배포 |
| 추가 KO 개발 검증 | http://localhost:2371 | `ghostdev_p2_ko`, Ghost6.73.0 / Node22.23.4 | 독립 SQLite3.53.2 `ghost-dev-p2/ko/content/data/gate.db` | 대규모 KO 통합 검증 |
| 추가 EN 개발 검증 | http://localhost:2372 | `ghostdev_p2_en`, Ghost6.73.0 / Node22.23.4 | 독립 SQLite3.53.2 `ghost-dev-p2/en/content/data/gate.db` | 대규모 EN 통합 검증 |

기존 Compose는 `/mnt/d/workspace/02.works/ghost-dev/docker-compose.yml`, bind mount는 같은 프로젝트의 `content`이며 DB 연결 대상은 Docker 개발 서비스 `mysql`이다. URL은 사설 IP이고 컨테이너의 Compose project는 `ghost-dev`다. `NODE_ENV=production`은 기존 Ghost5 실행 모드이며 운영 사이트라는 근거가 아니다. 확인된 로컬 Compose·전용 DB·볼륨·사설 URL을 함께 근거로 개발 환경임을 확인했다.

추가 두 인스턴스는 이 요청에서 생성한 **개발 통합 검증 전용** 환경이다. 기존 일회성2369/2370 인스턴스를 상시 개발 서버라고 가정하지 않았다. 호스트 포트는 `127.0.0.1:2371/2372`에만 바인딩했고 각각 독립 content/DB를 사용한다. 기존 개발 DB나 운영 DB를 복제하지 않고 Ghost 기본 신규 DB에 전용 fixture만 생성했다. 원래 개발 Ghost를 Ghost6으로 업그레이드하지 않았다.

추가 환경의 데이터 및 실행 구성은 `/mnt/d/workspace/02.works/ghost-dev-p2/{ko,en}/`에 보존했다. 두 언어를 동시에 확인할 수 있도록 완료 후에도 실행 상태로 두었다. 기존 MySQL 및 무관한 PostgreSQL 서비스를 재시작하거나 변경하지 않았다. 운영 ceak.dev/en-signal.ceak.dev·Nginx·Cloudflare·DB·Docker에는 작업하지 않았다.

환경·포트·mount·비밀 값을 제외한 설정은 [environment.json](dev-deployment-2026-10-31/environment.json), 버전은 [runtimes.json](dev-deployment-2026-10-31/runtimes.json)에 있다.

## 2. 소스 및 작업트리

- 브랜치: `codex/fix-content-api-pagination`
- HEAD: `b9e8f9fea072af9720c892868b983d5a675201c7`
- 원격 같은 브랜치는 HEAD와 일치. `main`은 `9d140b5cd239a1d115ab66acd5df2a8d2a534c69`; 현재 HEAD는 main 대비2 ahead/0 behind.
- 배포 정본은 미커밋 GHV-01~05 및 태그 교차 검증 패치를 포함한 **현재 작업트리**다. HEAD만 ZIP으로 만들지 않았다.
- 시작 상태와 보호 파일 해시: [start-state.json](dev-deployment-2026-10-31/start-state.json) **(로컬 전용)**, 원격 실제 조회: [remote-refs.txt](dev-deployment-2026-10-31/remote-refs.txt).
- 이전 태그 호환성 보고서 이후 기능 소스 변화 없음. 중단 후에도 후보와 현재 소스의 파일별 해시 일치를 다시 확인했다. 이번 작업의 빌드 후에도 시작 시 보호한 소스·테스트·package/lock·사용자 미추적 audio 파일 해시가 그대로다. CSS의 빌드 줄바꿈 차이는 내용 동등성 확인 후 원래 바이트로 보존했다.

GHV 정렬·메타데이터·전체 검색·이력 및 태그 Posts 참조 교차 검증을 현재 소스로 재실행했다. 이전 보고서의 PASS 숫자를 이번 결과로 복사하지 않았다. Git Commit/Push/PR/Release는 하지 않았다.

## 3. 백업 및 복원 가능성

기존 개발 테마 백업:

`/mnt/d/workspace/02.works/ghost-dev-theme-backups/p2-20261031-201927/`

- `active-theme.tar.gz`: 이전 활성 `signal-wave-ayu`1.0.0, 전체123파일.
- archive SHA-256: `a75c01245f0ed742d662d4cc6ec63a0d1494e2a4f6b4ce4492bee720367154e9`.
- 이전 main.min.js SHA-256: `7e4eae2efdc603b3b55cdf85cb3bfc081fc86a3a26c1f30e2edc2cc7896bab0f`.
- `theme-manifest.json`: 전체 파일 해시. 별도 경로로 실제 압축 해제하고 원본 전체 파일 해시와 일치하는지 확인했다.
- `previous-active-theme/`: 배포 때 보존한 원래 디렉터리. archive와 함께 유지했다.
- `private-config/`: 기존 Compose/routes 백업. 비밀번호를 포함할 수 있는 실행 원본은 보고서·ZIP·증거 폴더에 복사하지 않고 이 외부 백업 경로에만 보존했다.

기존 개발 DB의 초기화·마이그레이션·콘텐츠 변경은 하지 않았다. 배포 후 언어 불일치를 해결하기 위해 **settings.locale 한 값만 en→ko로 변경**했다. 기존 theme site_locale은 이미 ko였고 이전 값과 복구 방법은 [locale-adjustment.json](dev-deployment-2026-10-31/locale-adjustment.json)에 기록했다. 기존 공개 글26개·Draft1개·페이지1개는 전후 동일하다([primary-db-after.json](dev-deployment-2026-10-31/primary-db-after.json)).

추가 Ghost6 두 환경의 배포 전 기본 테마는 Source1.7.6이다. `/mnt/d/workspace/02.works/ghost-dev-p2/backups/{ko,en}/`에 기본 SQLite 스냅샷과 **symlink를 해소한 실제 Source87파일**을 보존했다. 테마 archive 압축 해제 후 전체 해시 일치와 SQLite integrity_check=ok를 확인했다. 초기 symlink archive만을 복원 근거로 삼지 않았다. [isolated-backups.json](dev-deployment-2026-10-31/isolated-backups.json)에 버전·해시·복원 결과를 남겼다.

### 기존 개발 서버 롤백 절차

[rollback.py](dev-deployment-2026-10-31/rollback.py) **(로컬 전용)**는 기본 실행 시 계획만 표시한다. 실제 복구가 필요하면 저장소 루트에서 `python3 reports/dev-deployment-2026-10-31/rollback.py --restore-development`를 실행한다.

1. 백업 manifest를 검증한다.
2. **ghostdev_ghost만** 중지하고 현재 후보 디렉터리를 별도로 보존한다.
3. `previous-active-theme`를 원래 활성 테마 경로에 복사한다.
4. Ghost를 시작한 뒤 개발 locale을 이전 en으로 되돌리고 같은 Ghost만 재시작한다.
5. HTTP200·원래 테마 파일 해시·기존 콘텐츠를 재확인한다.

롤백은 **수행하지 않았다(N/A)**. 실제 서비스 위에서 롤백했다 다시 배포하는 검사는 NOT RUN이며, 복원 archive의 실제 압축 해제·해시 검사는 PASS다. 추가 Ghost6 환경을 초기화해야 한다면 해당 인스턴스만 중지하고 자체 초기 DB와 Source 백업으로 복구한다. 이는 새 검증 환경에만 해당하며 기존 개발/운영 DB에 이 스냅샷을 적용하면 안 된다.

## 4. 배포 아티팩트

[signal-wave-ayu-p2.zip](dev-deployment-2026-10-31/signal-wave-ayu-p2.zip) **(로컬 전용)**

- package/theme: `signal-wave-ayu`1.0.0
- ZIP SHA-256: `281bda59f8099558131937b444b9029facb10c33770aeaa89bc13c2c849ea67d`
- 빌드 main.min.js SHA-256: `9e2b987be6fd3097a04d8c965e13e65c72e38d420ca2f379132817961645af22`
- 내용: 루트 HBS, partials, assets, routes.yaml, package.json, LICENSE, README; 전체123파일.
- tests/reports/node_modules/로그/개발 설정/임시 fixture/인증 정보를 포함하지 않았다. source map의 소스 경로는 상대 경로이며 로컬 절대 경로 검사를 통과했다.
- ZIP testzip PASS, 파일 목록 및 해시 검사 PASS. 현재 개발 런타임 키가 후보와 증거 파일에 포함되지 않았는지도 실제 키를 메모리에서 읽어 대조했다([key-scan.json](dev-deployment-2026-10-31/key-scan.json)). 키 값 자체는 출력·저장하지 않았다.

Gulp build PASS. 갱신 권고인 오래된 Browserslist 데이터 메시지는 빌드 오류가 아니다. Linux Docker에서 원본 GScan6.6.1 `checkVersion:v6`를 후보의 전체 파일에 실행해 errors0/warnings0, 기존 settings group recommendation1이었다. Windows GScan partial 분석 버그를 우회하기 위해 검사기를 수정하거나 partial·SSR 수를 줄이지 않았다.

근거: [build.log](dev-deployment-2026-10-31/build.log) **(로컬 전용)**, [gscan-v6.json](dev-deployment-2026-10-31/gscan-v6.json), [candidate-manifest.json](dev-deployment-2026-10-31/candidate-manifest.json), [artifact.json](dev-deployment-2026-10-31/artifact.json).

## 5. 개발 배포 결과

| 대상 | 결과 | 적용 방법 |
|---|---|---|
| 기존 KO Ghost5 | PASS | 검증된 ZIP을 별도 staging에 추출 → 파일 해시 확인 → 기존 폴더 보존/디렉터리 교체 → ghostdev_ghost만 재시작 |
| KO Ghost6 | PASS | 동일 후보를 전용 content/themes에 배치·활성화, ko 설정 적용 |
| EN Ghost6 | PASS | 동일 후보를 전용 content/themes에 배치·활성화, en 설정 적용 |
| 실제 활성 테마 및 산출물 | PASS | 세 대상 모두 signal-wave-ayu, 후보123파일과 파일 집합·전체 해시 일치 |

기존 문서에 기록된 bind mount 배포 방식을 따랐다. Admin API 인증 없이 로컬 theme mount 권한으로 적용했으며 운영용 키를 가져오지 않았다. 추가 환경의 settings 쓰기와 fixture 생성은 해당 독립 SQLite에 한정했다. 개발용 theme version은 이전과 동일하므로 배포 식별은 ZIP/main 및 전체 manifest SHA로 한다.

[deployment.json](dev-deployment-2026-10-31/deployment.json), [deployed-hashes.json](dev-deployment-2026-10-31/deployed-hashes.json)에 대상과 검증 결과가 있다.

## 6. HTTP·SSR·SEO·JS 통합 결과

| 항목 | 기존 KO Ghost5 | KO Ghost6 | EN Ghost6 |
|---|---|---|---|
| 4허브 GET200·최종URL·리디렉션/5xx 없음 | PASS | PASS | PASS |
| 원본 HTML 실제 콘텐츠 링크 | PASS | PASS | PASS |
| JS OFF 표시·탐색 | PASS | PASS | PASS |
| Categories/Series/Topics 분류 및 참조 | PASS | PASS | PASS |
| 100개 초과 무JS 태그 | N/A(현재 분류별100미만) | PASS | PASS |
| 고유 title/description·언어·canonical1개·OG중복 없음 | PASS | PASS | PASS |
| 잘못된 운영 호스트 링크 없음 | PASS | PASS | PASS |
| 실제 API 증명 완료·JS UI 전환 | PASS | PASS | PASS |
| 정상 화면 pageerror/console error | 없음 | 없음 | 없음 |
| PC1440×900·모바일390×844 가로 넘침 없음 | PASS | PASS | PASS |

최종 HTTP 증거는 [http-results.json](dev-deployment-2026-10-31/http-results.json), 키를 지운 원본은 `*-http.html`이다. 기존 개발 서버의 canonical은 설정된 `http://172.22.0.199:2368/.../`이며 localhost 접근은 같은 서버의 테스트 alias다. 새 KO/EN canonical은 각각 localhost2371/2372의 자기 페이지다. 모든 허브의 title/description이 언어별로 고유하고 OG와 일치했다. hreflang은 N/A(추가하지 않음).

기존 개발은 공개 Posts26개와 활성 공개 태그28개(Category6/Series5/Topics17)였다. Ghost6은 공개 Posts112개·활성 공개 태그676개(Category225/Series225/Topics226)였다. 양 언어에서 JS OFF로 각 역할의225번째 fixture 태그 링크를 클릭해200을 확인했다. Explore는 태그 영역별10개와 최근5개 SSR 링크를 확인했다.

JS 정상은 SSR 링크 잔존만으로 판정하지 않았다. 실제 `__ayuContentApiCollections` proof, Categories/Series 런타임 배열, Topics/Explore 카드의 JS 전환을 확인했다. Featured와 목록·Explore 상위 링크 순서도 원본 SSR과 대조했다. Ghost6 한영 결과는 [ko-ghost-results.json](dev-deployment-2026-10-31/ko-ghost-results.json) **(로컬 전용)**, [en-ghost-results.json](dev-deployment-2026-10-31/en-ghost-results.json) **(로컬 전용)**에 있다.

PC/모바일 보강 검사32개 화면은 [desktop-results.json](dev-deployment-2026-10-31/desktop-results.json)에 별도로 기록했다. 정상 화면의 consoleErrors/pageerror는0이다. **16개 화면에서 `/members/api/member/`의 net::ERR_ABORTED 요청 취소가 관측됐다.** Content API 수집 실패와 구분해 기록했고 성공으로 숨기지 않았다. 회원 SDK 호출의 취소 원인은 확정하지 않았으며 회원 로그인/구독 기능 검증은 NOT RUN이다. 핵심 허브와 검색의 정상 동작을 방해하지 않았다.

## 7. 태그 교차 검증 — 실제 개발 데이터

| 실제 Ghost6 데이터 단계 | KO 반환/total | EN 반환/total | 독립 Posts 증명 | 브라우저 JS 갱신 |
|---|---|---|---|---|
| 활성 태그만 있는 기본 fixture | 676/676 | 676/676 | Posts112·공개 참조676 PASS | 8허브 PASS |
| 미사용 공개 태그1개 추가 | 676/677 | 676/677 | 동일 집합·ID/slug/name/count PASS | 8허브 PASS |
| Draft 전용 태그1개 추가(앞 단계 포함) | 676/678 | 676/678 | 동일 집합·ID/slug/name/count PASS | 8허브 PASS |
| 임시 edge 데이터 정리 후 | 676/676 | 676/676 | 동일 증명 PASS | 8허브 PASS |

Tags API는7페이지(100×6+76), Posts API는2페이지(100+12)를 끝까지 수집했다. 같은 수집기의 strict Posts 검증과 Tags 교차 검증을 실제 응답으로 완료했고, 페이지 ID 중복·활성 태그 누락은0이었다. total 차이를 무조건 무시한 결과가 아니다. 기존 개발 서버도 실제 Posts26·활성 태그28로 같은 수집기가 통과했다([dev-api-primary.json](dev-deployment-2026-10-31/dev-api-primary.json) **(로컬 전용)**).

각 단계의 요청별 배열 길이·pagination·고유 ID/slug와 증명은 `dev-api-{exact,unused,draft,cleanup}.json`, 실제 JS 갱신은 `phase-{exact,unused,draft,cleanup}-browser.json`에 있다. 각 언어/단계에서 Posts 증명은 첫 태그 컬렉션에 사용하고 정렬이 다른 후속 태그 컬렉션이 재사용했다. 교차 검증용 sessionStorage 저장은 없었다.

임시 범위는 `p2-dev-unused-edge`, `p2-dev-draft-tag-edge`, `p2-dev-draft-edge`뿐이며 정리 후 각각0건임을 확인했다. 별도 환경의 대규모 기본 fixture(111개 새 공개 글·각 역할225개 태그)는 **후속 개발 재현용 데이터셋**으로 명시해 유지했다. 기존 개발 콘텐츠나 사용자가 만든 데이터는 삭제하지 않았다.

### 브라우저에서만 주입한 실패

KO/EN 각4허브에 활성 태그 누락, 중복 ID, slug 불일치, name 불일치, count.posts 불일치, 비정상 JSON, Tags 중간 페이지500, Posts 두 번째 페이지500, 수집 도중 total 변경을 적용했다. **72개 모두 PASS:** 오류 진단 후 기존 SSR 카드/제목/링크/게시물 수가 유지되고 부분 성공 목록으로 교체되지 않았다. 실제 서버 API 응답이나 운영 데이터는 바꾸지 않았다.

전역 taxonomy 정리가 `.post-meta .post-tag` 분류 배지를 제거하는 기존 동작이 있어 전체 main HTML 바이트 동등성은 사용하지 않았다. 이 특정 배지만 양쪽에서 제외하고 나머지 main DOM을 정확히 비교했다. 정상·오류 양쪽에서 수행되는 전역 배지 정리를 API 실패에 따른 콘텐츠 삭제와 구분한 것이다. 이 cosmetic 동작은 소스를 수정하지 않고 아래 이슈로 기록했다.

## 8. 검색·페이지네이션·이력

실제 Ghost6 각 언어에서 다음이 PASS했다.

- 검색: 공개112개 전체 수집, Gate Post111/012/011/001 및 마지막 기본 글 Coming soon 검색. Gate Post 쿼리111결과, 검색12페이지의 마지막 글 확인.
- 검색어 초기화, 결과 페이지 이동·새로고침, 쿼리 변경 후 Back/Forward, 범위 밖 페이지 보정.
- Categories/Series: 1→2→Back→Forward, 직접2페이지 진입, 새로고침, 3→1 연속 이동 후Back, page9999→23 보정, 음수→1 정규화.
- 사용자 이동 pushState와 초기 보정 replaceState의 결과, 모바일 레이아웃 확인.

위6개 실서버 기능 사례와 실패72개를 합쳐 [deployed-browser-verified.log](dev-deployment-2026-10-31/deployed-browser-verified.log)의 **78 PASS**다. 실제 기존 개발 데이터는26글·분류별100미만이므로 대규모 경계 검증을 그 환경에서 PASS로 주장하지 않고 독립 Ghost6에서 수행했다.

## 9. 자동화와 개발 서버 검증 구분

| 검사 | 사례 | 결과 | 이번 실행 증거 |
|---|---:|---|---|
| 기존 Content API | 21 | PASS | content-api.log |
| 기존 SSR | 58 | PASS | ssr.log |
| 기존 Playwright 허브 | 16 | PASS | hub-browser.log |
| 기존 Playwright P2 | 98 | PASS | p2-browser.log |
| 기존 합계 | **193** | **PASS** | 삭제·축소 없음 |
| 신규 태그 단위 | 44 | PASS | tag-unit.log |
| 신규 태그 Playwright | 104 | PASS | tag-browser.log |
| 신규 합계 | **148** | **PASS** | 기존 자동화와 구분 |
| **자동화 회귀 전체** | **341** | **PASS** | 현재 후보 기준 재실행 |
| 기존 상시 개발 실브라우저 | 28 | PASS | primary-dev-browser-final.log |
| Ghost6 오류/검색/이력 실브라우저 | 78 | PASS | deployed-browser-verified.log |
| Ghost6 실제 SSR·JS·225+·메타·모바일 | 8허브 | PASS | ko-ghost6.log / en-ghost6-final.log |
| 개발 PC/모바일 JS ON/OFF 보강 | 32화면 | PASS | desktop-verified.log |
| 총계 정상/미사용/Draft/정리 실브라우저 | 4단계×8허브 | PASS | phase-*-browser.log |
| 최종 개발 HTTP | 12허브 | PASS | http-final.log |
| Gulp / ZIP integrity / Linux GScan v6 | 별도 | PASS | build.log / artifact.json / gscan-v6.json |

증거는 모두 [dev-deployment-2026-10-31](dev-deployment-2026-10-31/) 아래에 있다. 같은 기능의 반복 확인·화면 수를341개에 추가하여 테스트 수를 부풀리지 않았다. 실제 Chromium 스크린샷은 `*-nojs-mobile.png`, `*-js-mobile.png`, `*-1440-*.png`, `primary-*-390-*.png`, `*-history-mobile.png`로 보존했다.

중간 진단 실패 로그도 보존했다. 최초 오류 주입 계측은 warning만 기다렸지만 실번들은 error 진단을 사용했다. 이후 main 전체 비교에서 기존 분류 배지 정리만 차이 났고 이를 위 방식으로 분리했다. EN 모바일 초기 1회 폰트 준비 전 overflow 판정은 document.fonts.ready 대기 후 동일 viewport에서 해소됐다. 화면 반복 탐색의 이전 요청 취소는 페이지별 독립 탐색으로 분리했다. 마지막 `*-verified/final` 로그가 최종 결과이며 초기 실패를 삭제하거나 PASS로 표기하지 않았다.

## 10. 발견 사항 및 미검증

| ID | 심각도 | 결과·조치 | 배포 차단 |
|---|---|---|---|
| DEV-01 | P2, 개발 설정 | 기존 Ghost locale=en과 theme site_locale=ko 불일치. 이전 값을 백업하고 개발 settings.locale만 ko로 정렬, 12허브 SEO 및 기존28개 재검증 PASS | 해결됨 |
| DEV-02 | P3, 기존 UI | API 성공/실패와 독립적인 taxonomy 정리가 SSR 분류 배지를 제거함. 카드·링크·게시물 수는 유지. 관련 `assets/js/lib/taxonomy.js`의 normalizePostTaxonomyTags 및 전역 호출. cosmetic 정책은 별도 검토 가능 | 아니오 |
| DEV-03 | P3, 관측 | 회원 SDK의 member 요청16건 취소. 콘솔 오류·Content API 실패·핵심 기능 장애 없음. 원인 미확정, 회원 기능 별도 확인 권장 | 허브 P2 범위 차단 아님 |
| DEV-04 | P3, 검사 권고 | 기존 GScan custom settings group recommendation1, errors/warnings0 | 아니오 |

NOT RUN: 실제 모바일 기기, Ghost6+MySQL 조합, 운영에 이 ZIP을 적용한 후 검증, 실제 서비스 위에서의 롤백 실행, 회원 로그인/결제/구독·메일·ActivityPub 기능, 부하 테스트. 요청한 모바일 viewport 검증은 수행했지만 실기기 PASS로 주장하지 않았다. Ghost6 SQLite의 개발용 background/outbox/ActivityPub 초기화 진단은 허브 렌더 오류와 구분했다. 운영 Ghost와 모든 기능/DB 동작이 동일하다고 확대 해석하지 않는다.

기존 API 캐시 TTL 범위의 시차 및 DB 트랜잭션 스냅샷 부재는 이전 보고서의 한계와 동일하다. 관측되는 pagination/참조 모순은 SSR 보존으로 처리한다. GHV 핵심 회귀나 지속적인 JS 갱신 중단은 발견하지 않았다.

최종 증거·파일 보존 검사도 PASS했다([final-validation.log](dev-deployment-2026-10-31/final-validation.log), 재현: `python3 reports/dev-deployment-2026-10-31/validate.py`).

## 11. 최종 상태와 운영 배포 전 조건

**READY.** 기존 개발 서버 KO 배포, 독립 Ghost6 KO/EN 배포, 실제 태그 total 차이의 정상 수용과 실패 시 SSR 보존, 검색·이력·SEO·모바일·341회귀·빌드·Linux GScan을 통과했다. 장애로 인한 롤백은 필요하지 않았다. 후보는 개발 서버에 적용한 상태이고 백업·추가 개발 환경·증거를 보존했다.

운영 작업은 별도 승인 후에만 수행해야 한다. 승인 후에는 이 ZIP의 SHA를 확인하고 운영별 기존 테마 백업, KO 우선 적용·smoke 후 EN 적용, 실제 활성 파일 해시·8허브·112개 이상 전체 검색·태그 증명·SEO·이력 확인과 롤백 준비가 필요하다. 이 보고서는 운영 배포·운영 검증을 수행했다는 뜻이 아니다. Search Console의 Google 선택 canonical 변경도 확인하지 않았다.

이번에 저장소 기능 코드는 추가 수정하지 않았고 기존 사용자 파일·미커밋 패치를 보존했다. 개발 밖 환경 변경, Git Commit/Push/PR/Release, 운영 DB 변경·서비스 재시작·테마 배포는 수행하지 않았다.
