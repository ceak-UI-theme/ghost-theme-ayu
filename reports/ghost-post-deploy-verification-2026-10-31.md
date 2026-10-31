# Ghost SSR 운영 배포 검증 — 2026-10-31

> Git 증거 보관 범위: [reports README](README.md) **(로컬 전용)**. 로컬 전용 표시의 원본 캡처·실행 파일은 커밋하지 않았다.

실행 시작: 2026-10-31T14:12:53.387000+09:00. 기본 검사 종료: 2026-10-31T14:22:03.199000+09:00. 추가 묶음 종료: 2026-10-31T14:29:01.714000+09:00. 시간은 Asia/Seoul(+09:00).

실제 운영 GET, Chromium 브라우저와 현재 저장소 소스를 대조했다. 과거 PASS·배포 주장·기존 결과 파일을 이번 검증 증거로 사용하지 않았다. 운영 설정·DB·테마·게시물 변경, Admin 쓰기, commit/push/PR/재배포는 하지 않았다. 새 파일은 reports/ 아래에만 생성했다. 기존 미추적 `artifacts/check_audio_local.js`는 보존했다.

## A. 종합 결과

| 항목 | 한국어 | 영어 | 비고 |
|---|---|---|---|
| HTTP 상태 | PASS | PASS | 8개 기본 GET 모두 200, 리디렉션·타임아웃 없음 |
| 초기 HTML SSR | PASS | PASS | 각 영역에 실제 콘텐츠 링크 있음. 공통 내비게이션 제외 |
| JS 비활성화 | PASS | PASS | PC·모바일 16회 렌더링, 네이티브 details 및 콘텐츠 클릭 추가 검증 |
| JS 활성화 | FAIL | FAIL | 렌더링·모바일 메뉴 동작. Explore 시리즈의 SSR/JS 링크 집합 불일치(GHV-01) |
| 페이지네이션 | FAIL | FAIL | 시리즈 1↔2, 새로고침·범위 보정 정상. 클릭 이력이 replaceState로 사라짐(GHV-03). 카테고리 다음 페이지는 NOT RUN(데이터 부족) |
| 검색 | FAIL | FAIL | API 전체 111개 중 100개만 검색. 실제 누락 제목 검색으로 재현(GHV-05) |
| Content API 실패 복구 | FAIL | FAIL | 연결 실패·401/403/500·빈 본문·timeout은 보존. 200 {} 및 빈 목록은 SSR 삭제(GHV-02) |
| canonical | PASS | PASS | 각 페이지 자기 URL 1개, OG URL도 일치 |
| hreflang | N/A | N/A | 8개 모두 없음. 별도 DB의 실제 번역 대응 확인 후 추가 권장 |
| 모바일 화면 | PASS | PASS | 390×844, 핵심 링크 표시, 가로 넘침 없음, JS 메뉴 열림 |
| 빌드·배포 소스 일치 | NOT VERIFIED | NOT VERIFIED | 공개 main.min.js는 로컬과 해시 일치. 서버 HBS/전체 배포 아티팩트 접근 검증 없음 |

PASS는 명시한 관측 범위만 의미한다. 검색·정렬·페이지네이션의 배포 전 운영 기준 비교는 NOT RUN이므로 발견된 제한이 이번 배포로 새로 발생했다고 단정하지 않는다. P0/P1 서비스 중단 증거는 없지만, 요청한 전체 검증 기준을 모두 통과한 상태는 아니다.

## B. 상세 증거

### 방법과 판정 범위

- Node fetch로 실제 GET 본문을 받았다. redirect=manual로 각 응답 체인을 추적했다. GET 타임아웃 30초, 기본 GET 간 1.2초, 반복 Explore 간 10초, 브라우저 시나리오는 순차 실행했다. 브라우저 자산 요청은 일반 페이지 로드 동작이다.
- Chromium headless 145 계열, Windows Playwright, PC 1440×1000 / 모바일 390×844. 모바일은 뷰포트 검사이며 실제 휴대전화·터치·Safari 검사는 NOT RUN.
- 원본 HTML을 DOMParser로 파싱해 지정 콘텐츠 컨테이너만 집계했다. 아래 수치는 영역별 고유 href 수이며 `a=`는 이미지/제목 중복을 포함한 실제 앵커 수다. #·javascript 링크, 헤더·푸터·더 보기 허브 링크는 콘텐츠 수에서 제외했다. 원본 HTML은 API 키를 치환한 사본이며 링크 구조는 유지했다.
- SSR은 전체 링크를 포함한다. JS는 시리즈 대표 1 + 목록 페이지당 10으로 개선하므로 원본 목록 12 → 첫 화면 10은 의도된 페이지네이션이다. 원본에서 접힌 details 링크는 HTML에 존재하나 펼치기 전 화면에는 숨겨진다.
- 원본과 JS의 상대/절대 URL은 같은 호스트의 절대 URL로 정규화해 비교했다. 최근 글의 상대→절대 href 변화는 동일 콘텐츠로 처리했다.
- doctype·html 종료·head/body 및 DOM 파싱은 기본 구조 검사다. W3C/Nu HTML 표준 적합성 전체 검사는 NOT RUN이다.
- `results.json`에 실제 GET 헤더·체인·응답 크기·DOM·콘솔/실패 요청·페이지네이션 단계가 있으며, 추가 검사는 `extra-results.json`, 메타 중복/스크립트는 `offline.json`에 있다. 쿠키/인증 헤더는 저장하지 않았고 Content API 키는 치환했다. 응답 SHA-256은 치환 전 수신 바이트(UTF-8 텍스트) 기준이다.

### HTTP 요약

| 언어/경로 | HTTP | 최종 URL | redirect | HTML UTF-8 bytes | GET ms |
|---|---:|---|---:|---:|---:|
| ko/explore | 200 | https://ceak.dev/explore/ | 0 | 29324 | 1140 |
| ko/categories | 200 | https://ceak.dev/categories/ | 0 | 15521 | 363 |
| ko/series | 200 | https://ceak.dev/series/ | 0 | 25131 | 694 |
| ko/secondary-tags | 200 | https://ceak.dev/secondary-tags/ | 0 | 53756 | 467 |
| en/explore | 200 | https://en-signal.ceak.dev/explore/ | 0 | 28491 | 1057 |
| en/categories | 200 | https://en-signal.ceak.dev/categories/ | 0 | 15682 | 363 |
| en/series | 200 | https://en-signal.ceak.dev/series/ | 0 | 24230 | 382 |
| en/secondary-tags | 200 | https://en-signal.ceak.dev/secondary-tags/ | 0 | 53377 | 434 |

8개 공통: `Content-Type: text/html; charset=utf-8`, `Cache-Control: public, max-age=0`, `Content-Encoding: br`, `server: cloudflare`, `cf-cache-status: DYNAMIC`, `x-powered-by: Express`, `vary: Accept-Encoding`, chunked 응답. `X-Robots-Tag` 없음. 위 크기는 압축 해제한 전체 HTML 크기이며 HTTP/TLS 전송량·br 압축 바이트 수는 측정하지 않았다. 실패/타임아웃 없음. Cloudflare 경유 응답임을 확인했으나 DYNAMIC/Express만으로 CDN 우회 원본 서버 상태를 확정하지 않는다.

### URL별 SSR / JS / SEO / 로그

#### https://ceak.dev/explore/

- GET **200**, 최종 `https://ceak.dev/explore/`, redirect 없음. 원본: [ko-explore.html](verification-2026-10-31/ko-explore.html) **(로컬 전용)**.
- JS 이전: explore-categories-grid: **5** (a=10), explore-series-list: **10** (a=20), explore-topics-grid: **10** (a=10), explore-recent-list: **5** (a=5).
- JS 이후(PC): explore-categories-grid: **5** (a=10), explore-series-list: **10** (a=20), explore-topics-grid: **10** (a=10), explore-recent-list: **5** (a=5). 모바일 수치는 results.json의 해당 js=true/mobile=true 참조.
- canonical **1개**: `https://ceak.dev/explore/`. hreflang 0개. OG URL: `https://ceak.dev/explore/`.
- title `Signal Over Noise`; description 0개; robots 메타 0개; HTML lang `ko`, hub locale `ko`, H1 `탐색`. 중복 메타 없음. robots 부재는 noindex를 선언하지 않았다는 의미이며 robots.txt 허용/실제 인덱싱 확인은 별개다.
- JS OFF/PC: 렌더링 완료; [스크린샷](verification-2026-10-31/ko-explore-nojs-desktop.png) **(로컬 전용)**.
- JS OFF/모바일: 렌더링 완료; [스크린샷](verification-2026-10-31/ko-explore-nojs-mobile.png) **(로컬 전용)**.
- JS ON/PC: 렌더링 완료; [스크린샷](verification-2026-10-31/ko-explore-js-desktop.png) **(로컬 전용)**.
- JS ON/모바일: 렌더링 완료; [스크린샷](verification-2026-10-31/ko-explore-js-mobile.png) **(로컬 전용)**.
- 콘솔/pageerror 고유 메시지: []. 실패 요청(쿼리 제외): `analytics.google.com/g/collect` net::ERR_ABORTED ×2.
- 정상 모드 API: ceak.dev/ghost/api/content/posts/ HTTP 200, ceak.dev/ghost/api/content/tags/ HTTP 200.
- 재현 문제: GHV-01(시리즈 링크 집합), GHV-02(잘못된 200 JSON), GHV-04(SEO). API 실패별 로그는 results.json.failures 참조.
- 콘텐츠 영역 내 타 언어 호스트 링크: 0개. 이 수치는 허브 main 범위이며 의도적인 외부 소셜/언어 전환 링크는 포함하지 않는다.

#### https://ceak.dev/categories/

- GET **200**, 최종 `https://ceak.dev/categories/`, redirect 없음. 원본: [ko-categories.html](verification-2026-10-31/ko-categories.html) **(로컬 전용)**.
- JS 이전: primary-featured-grid: **1** (a=2), primary-list-grid: **4** (a=8).
- JS 이후(PC): primary-featured-grid: **1** (a=2), primary-list-grid: **4** (a=8). 모바일 수치는 results.json의 해당 js=true/mobile=true 참조.
- canonical **1개**: `https://ceak.dev/categories/`. hreflang 0개. OG URL: `https://ceak.dev/categories/`.
- title `Signal Over Noise`; description 0개; robots 메타 0개; HTML lang `ko`, hub locale `ko`, H1 `카테고리`. 중복 메타 없음. robots 부재는 noindex를 선언하지 않았다는 의미이며 robots.txt 허용/실제 인덱싱 확인은 별개다.
- JS OFF/PC: 렌더링 완료; [스크린샷](verification-2026-10-31/ko-categories-nojs-desktop.png) **(로컬 전용)**.
- JS OFF/모바일: 렌더링 완료; [스크린샷](verification-2026-10-31/ko-categories-nojs-mobile.png) **(로컬 전용)**.
- JS ON/PC: 렌더링 완료; [스크린샷](verification-2026-10-31/ko-categories-js-desktop.png) **(로컬 전용)**.
- JS ON/모바일: 렌더링 완료; [스크린샷](verification-2026-10-31/ko-categories-js-mobile.png) **(로컬 전용)**.
- 콘솔/pageerror 고유 메시지: []. 실패 요청(쿼리 제외): `analytics.google.com/g/collect` net::ERR_ABORTED ×2.
- 정상 모드 API: ceak.dev/ghost/api/content/tags/ HTTP 200.
- 재현 문제: GHV-02, GHV-04. API 실패별 로그는 results.json.failures 참조.
- 콘텐츠 영역 내 타 언어 호스트 링크: 0개. 이 수치는 허브 main 범위이며 의도적인 외부 소셜/언어 전환 링크는 포함하지 않는다.

#### https://ceak.dev/series/

- GET **200**, 최종 `https://ceak.dev/series/`, redirect 없음. 원본: [ko-series.html](verification-2026-10-31/ko-series.html) **(로컬 전용)**.
- JS 이전: series-featured-grid: **1** (a=2), series-list-grid: **12** (a=24).
- JS 이후(PC): series-featured-grid: **1** (a=2), series-list-grid: **10** (a=20). 모바일 수치는 results.json의 해당 js=true/mobile=true 참조.
- canonical **1개**: `https://ceak.dev/series/`. hreflang 0개. OG URL: `https://ceak.dev/series/`.
- title `Signal Over Noise`; description 0개; robots 메타 0개; HTML lang `ko`, hub locale `ko`, H1 `시리즈`. 중복 메타 없음. robots 부재는 noindex를 선언하지 않았다는 의미이며 robots.txt 허용/실제 인덱싱 확인은 별개다.
- JS OFF/PC: 렌더링 완료; [스크린샷](verification-2026-10-31/ko-series-nojs-desktop.png) **(로컬 전용)**.
- JS OFF/모바일: 렌더링 완료; [스크린샷](verification-2026-10-31/ko-series-nojs-mobile.png) **(로컬 전용)**.
- JS ON/PC: 렌더링 완료; [스크린샷](verification-2026-10-31/ko-series-js-desktop.png) **(로컬 전용)**.
- JS ON/모바일: 렌더링 완료; [스크린샷](verification-2026-10-31/ko-series-js-mobile.png) **(로컬 전용)**.
- 콘솔/pageerror 고유 메시지: ["Framing 'https://www.google.com/' violates the following report-only Content Security Policy directive: \"frame-ancestors 'self'\". The violation has been logged, but no further action has been taken.\n", "Y"]. 실패 요청(쿼리 제외): `analytics.google.com/g/collect` net::ERR_ABORTED ×12; `pagead2.googlesyndication.com/pagead/ping` net::ERR_ABORTED ×6; `csp.withgoogle.com/csp/frame-ancestors/38fac9d5b82543fc4729580d18ff2d3d` net::ERR_BLOCKED_BY_ORB ×5; `ceak.dev/cdn-cgi/rum` net::ERR_ABORTED ×4; `ceak.dev/content/images/2026/03/1773200792000.png` net::ERR_ABORTED ×1; `ceak.dev/content/images/2026/03/019ccca3-b305-7381-86eb-ca3fb321cf46-1.png` net::ERR_ABORTED ×1.
- 정상 모드 API: ceak.dev/ghost/api/content/tags/ HTTP 200.
- 재현 문제: GHV-02, GHV-03(페이지 이력), GHV-04. API 실패별 로그는 results.json.failures 참조.
- 콘텐츠 영역 내 타 언어 호스트 링크: 0개. 이 수치는 허브 main 범위이며 의도적인 외부 소셜/언어 전환 링크는 포함하지 않는다.

#### https://ceak.dev/secondary-tags/

- GET **200**, 최종 `https://ceak.dev/secondary-tags/`, redirect 없음. 원본: [ko-secondary-tags.html](verification-2026-10-31/ko-secondary-tags.html) **(로컬 전용)**.
- JS 이전: secondary-tags-featured: **1** (a=2), secondary-tags-grid: **111** (a=111).
- JS 이후(PC): secondary-tags-featured: **1** (a=2), secondary-tags-grid: **111** (a=111). 모바일 수치는 results.json의 해당 js=true/mobile=true 참조.
- canonical **1개**: `https://ceak.dev/secondary-tags/`. hreflang 0개. OG URL: `https://ceak.dev/secondary-tags/`.
- title `Signal Over Noise`; description 0개; robots 메타 0개; HTML lang `ko`, hub locale `ko`, H1 `주제 태그`. 중복 메타 없음. robots 부재는 noindex를 선언하지 않았다는 의미이며 robots.txt 허용/실제 인덱싱 확인은 별개다.
- JS OFF/PC: 렌더링 완료; [스크린샷](verification-2026-10-31/ko-secondary-tags-nojs-desktop.png) **(로컬 전용)**.
- JS OFF/모바일: 렌더링 완료; [스크린샷](verification-2026-10-31/ko-secondary-tags-nojs-mobile.png) **(로컬 전용)**.
- JS ON/PC: 렌더링 완료; [스크린샷](verification-2026-10-31/ko-secondary-tags-js-desktop.png) **(로컬 전용)**.
- JS ON/모바일: 렌더링 완료; [스크린샷](verification-2026-10-31/ko-secondary-tags-js-mobile.png) **(로컬 전용)**.
- 콘솔/pageerror 고유 메시지: []. 실패 요청(쿼리 제외): `analytics.google.com/g/collect` net::ERR_ABORTED ×2.
- 정상 모드 API: ceak.dev/ghost/api/content/tags/ HTTP 200.
- 재현 문제: GHV-02, GHV-04. API 실패별 로그는 results.json.failures 참조.
- 콘텐츠 영역 내 타 언어 호스트 링크: 0개. 이 수치는 허브 main 범위이며 의도적인 외부 소셜/언어 전환 링크는 포함하지 않는다.

#### https://en-signal.ceak.dev/explore/

- GET **200**, 최종 `https://en-signal.ceak.dev/explore/`, redirect 없음. 원본: [en-explore.html](verification-2026-10-31/en-explore.html) **(로컬 전용)**.
- JS 이전: explore-categories-grid: **5** (a=10), explore-series-list: **10** (a=20), explore-topics-grid: **10** (a=10), explore-recent-list: **5** (a=5).
- JS 이후(PC): explore-categories-grid: **5** (a=10), explore-series-list: **10** (a=20), explore-topics-grid: **10** (a=10), explore-recent-list: **5** (a=5). 모바일 수치는 results.json의 해당 js=true/mobile=true 참조.
- canonical **1개**: `https://en-signal.ceak.dev/explore/`. hreflang 0개. OG URL: `https://en-signal.ceak.dev/explore/`.
- title `Signal Over Noise`; description 0개; robots 메타 0개; HTML lang `en`, hub locale `en`, H1 `Explore`. 중복 메타 없음. robots 부재는 noindex를 선언하지 않았다는 의미이며 robots.txt 허용/실제 인덱싱 확인은 별개다.
- JS OFF/PC: 렌더링 완료; [스크린샷](verification-2026-10-31/en-explore-nojs-desktop.png) **(로컬 전용)**.
- JS OFF/모바일: 렌더링 완료; [스크린샷](verification-2026-10-31/en-explore-nojs-mobile.png) **(로컬 전용)**.
- JS ON/PC: 렌더링 완료; [스크린샷](verification-2026-10-31/en-explore-js-desktop.png) **(로컬 전용)**.
- JS ON/모바일: 렌더링 완료; [스크린샷](verification-2026-10-31/en-explore-js-mobile.png) **(로컬 전용)**.
- 콘솔/pageerror 고유 메시지: []. 실패 요청(쿼리 제외): `www.google-analytics.com/g/collect` net::ERR_ABORTED ×2.
- 정상 모드 API: en-signal.ceak.dev/ghost/api/content/posts/ HTTP 200, en-signal.ceak.dev/ghost/api/content/tags/ HTTP 200.
- 재현 문제: GHV-01(시리즈 링크 집합), GHV-02(잘못된 200 JSON), GHV-04(SEO). API 실패별 로그는 results.json.failures 참조.
- 콘텐츠 영역 내 타 언어 호스트 링크: 0개. 이 수치는 허브 main 범위이며 의도적인 외부 소셜/언어 전환 링크는 포함하지 않는다.

#### https://en-signal.ceak.dev/categories/

- GET **200**, 최종 `https://en-signal.ceak.dev/categories/`, redirect 없음. 원본: [en-categories.html](verification-2026-10-31/en-categories.html) **(로컬 전용)**.
- JS 이전: primary-featured-grid: **1** (a=2), primary-list-grid: **4** (a=8).
- JS 이후(PC): primary-featured-grid: **1** (a=2), primary-list-grid: **4** (a=8). 모바일 수치는 results.json의 해당 js=true/mobile=true 참조.
- canonical **1개**: `https://en-signal.ceak.dev/categories/`. hreflang 0개. OG URL: `https://en-signal.ceak.dev/categories/`.
- title `Signal Over Noise`; description 0개; robots 메타 0개; HTML lang `en`, hub locale `en`, H1 `Categories`. 중복 메타 없음. robots 부재는 noindex를 선언하지 않았다는 의미이며 robots.txt 허용/실제 인덱싱 확인은 별개다.
- JS OFF/PC: 렌더링 완료; [스크린샷](verification-2026-10-31/en-categories-nojs-desktop.png) **(로컬 전용)**.
- JS OFF/모바일: 렌더링 완료; [스크린샷](verification-2026-10-31/en-categories-nojs-mobile.png) **(로컬 전용)**.
- JS ON/PC: 렌더링 완료; [스크린샷](verification-2026-10-31/en-categories-js-desktop.png) **(로컬 전용)**.
- JS ON/모바일: 렌더링 완료; [스크린샷](verification-2026-10-31/en-categories-js-mobile.png) **(로컬 전용)**.
- 콘솔/pageerror 고유 메시지: []. 실패 요청(쿼리 제외): `www.google-analytics.com/g/collect` net::ERR_ABORTED ×2.
- 정상 모드 API: en-signal.ceak.dev/ghost/api/content/tags/ HTTP 200.
- 재현 문제: GHV-02, GHV-04. API 실패별 로그는 results.json.failures 참조.
- 콘텐츠 영역 내 타 언어 호스트 링크: 0개. 이 수치는 허브 main 범위이며 의도적인 외부 소셜/언어 전환 링크는 포함하지 않는다.

#### https://en-signal.ceak.dev/series/

- GET **200**, 최종 `https://en-signal.ceak.dev/series/`, redirect 없음. 원본: [en-series.html](verification-2026-10-31/en-series.html) **(로컬 전용)**.
- JS 이전: series-featured-grid: **1** (a=2), series-list-grid: **12** (a=24).
- JS 이후(PC): series-featured-grid: **1** (a=2), series-list-grid: **10** (a=20). 모바일 수치는 results.json의 해당 js=true/mobile=true 참조.
- canonical **1개**: `https://en-signal.ceak.dev/series/`. hreflang 0개. OG URL: `https://en-signal.ceak.dev/series/`.
- title `Signal Over Noise`; description 0개; robots 메타 0개; HTML lang `en`, hub locale `en`, H1 `Series`. 중복 메타 없음. robots 부재는 noindex를 선언하지 않았다는 의미이며 robots.txt 허용/실제 인덱싱 확인은 별개다.
- JS OFF/PC: 렌더링 완료; [스크린샷](verification-2026-10-31/en-series-nojs-desktop.png) **(로컬 전용)**.
- JS OFF/모바일: 렌더링 완료; [스크린샷](verification-2026-10-31/en-series-nojs-mobile.png) **(로컬 전용)**.
- JS ON/PC: 렌더링 완료; [스크린샷](verification-2026-10-31/en-series-js-desktop.png) **(로컬 전용)**.
- JS ON/모바일: 렌더링 완료; [스크린샷](verification-2026-10-31/en-series-js-mobile.png) **(로컬 전용)**.
- 콘솔/pageerror 고유 메시지: ["Y"]. 실패 요청(쿼리 제외): `www.google-analytics.com/g/collect` net::ERR_ABORTED ×12; `pagead2.googlesyndication.com/pagead/ping` net::ERR_ABORTED ×11; `en-signal.ceak.dev/cdn-cgi/rum` net::ERR_ABORTED ×4; `en-signal.ceak.dev/content/images/2026/04/2f59c0af-cc06-43f0-842c-699ad148b55d.png` net::ERR_ABORTED ×1; `en-signal.ceak.dev/content/images/2026/03/744ab4b2-9d83-4b40-b972-c0d8b483f532.png` net::ERR_ABORTED ×1.
- 정상 모드 API: en-signal.ceak.dev/ghost/api/content/tags/ HTTP 200.
- 재현 문제: GHV-02, GHV-03(페이지 이력), GHV-04. API 실패별 로그는 results.json.failures 참조.
- 콘텐츠 영역 내 타 언어 호스트 링크: 0개. 이 수치는 허브 main 범위이며 의도적인 외부 소셜/언어 전환 링크는 포함하지 않는다.

#### https://en-signal.ceak.dev/secondary-tags/

- GET **200**, 최종 `https://en-signal.ceak.dev/secondary-tags/`, redirect 없음. 원본: [en-secondary-tags.html](verification-2026-10-31/en-secondary-tags.html) **(로컬 전용)**.
- JS 이전: secondary-tags-featured: **1** (a=2), secondary-tags-grid: **111** (a=111).
- JS 이후(PC): secondary-tags-featured: **1** (a=2), secondary-tags-grid: **111** (a=111). 모바일 수치는 results.json의 해당 js=true/mobile=true 참조.
- canonical **1개**: `https://en-signal.ceak.dev/secondary-tags/`. hreflang 0개. OG URL: `https://en-signal.ceak.dev/secondary-tags/`.
- title `Signal Over Noise`; description 0개; robots 메타 0개; HTML lang `en`, hub locale `en`, H1 `Topics`. 중복 메타 없음. robots 부재는 noindex를 선언하지 않았다는 의미이며 robots.txt 허용/실제 인덱싱 확인은 별개다.
- JS OFF/PC: 렌더링 완료; [스크린샷](verification-2026-10-31/en-secondary-tags-nojs-desktop.png) **(로컬 전용)**.
- JS OFF/모바일: 렌더링 완료; [스크린샷](verification-2026-10-31/en-secondary-tags-nojs-mobile.png) **(로컬 전용)**.
- JS ON/PC: 렌더링 완료; [스크린샷](verification-2026-10-31/en-secondary-tags-js-desktop.png) **(로컬 전용)**.
- JS ON/모바일: 렌더링 완료; [스크린샷](verification-2026-10-31/en-secondary-tags-js-mobile.png) **(로컬 전용)**.
- 콘솔/pageerror 고유 메시지: []. 실패 요청(쿼리 제외): `www.google-analytics.com/g/collect` net::ERR_ABORTED ×2.
- 정상 모드 API: en-signal.ceak.dev/ghost/api/content/tags/ HTTP 200.
- 재현 문제: GHV-02, GHV-04. API 실패별 로그는 results.json.failures 참조.
- 콘텐츠 영역 내 타 언어 호스트 링크: 0개. 이 수치는 허브 main 범위이며 의도적인 외부 소셜/언어 전환 링크는 포함하지 않는다.

### SSR과 JS 집합 비교

- ko Explore 시리즈: SSR에만 `https://ceak.dev/tag/series-ai-era-software-production-structure/`; JS에만 `https://ceak.dev/tag/series-developer-tool-supply-chain-attacks/`. 정상 응답에서 발생하며 링크 개수는 모두 10이다.

- en Explore 시리즈: SSR에만 `https://en-signal.ceak.dev/tag/series-ai-dev-tools-text-editor-evolution/`; JS에만 `https://en-signal.ceak.dev/tag/series-ai-era-software-production-structure/`. 정상 응답에서 발생하며 링크 개수는 모두 10이다.

Explore의 카테고리·주제·최근 글 집합은 정규화 후 일치했다. Categories는 대표/목록 집합 일치, Secondary Tags도 대표/목록 집합 일치. Series는 첫 페이지와 두 번째 페이지를 합하면 원본 전체 링크와 대조할 수 있으며 세부 단계는 results.json.browser[].pagination에 저장했다. 대표 태그의 전체 목록 중복은 별도로 집합 교집합 검사했다.

### Content API 브라우저 실패 주입

각 시나리오는 새 브라우저 context/serviceWorkers=block에서 `/ghost/api/content/`만 가로챘다. 운영 API 설정을 바꾸거나 운영 서버가 오류를 발생하도록 요청하지 않았다. 정상 모드는 실제 API 200을 사용했다.

| 실패 모드 | 한국어 보존/실행 | 영어 보존/실행 | 관측 범위 |
|---|---|---|---|
| network | 4/4 | 4/4 | 브라우저 abort 또는 합성 HTTP 오류 |
| 401 | 4/4 | 4/4 | 브라우저 abort 또는 합성 HTTP 오류 |
| 403 | 4/4 | 4/4 | 브라우저 abort 또는 합성 HTTP 오류 |
| 500 | 4/4 | 4/4 | 브라우저 abort 또는 합성 HTTP 오류 |
| empty | 4/4 | 4/4 | 200, 빈 본문: JSON 파싱 오류 |
| timeout | 4/4 | 4/4 | 응답 미완료 상태를 10초 관찰, 자체 timeout 발생 검증과 구분 |

네트워크 timeout 오류는 추가로 route.abort("timedout")를 사용했다(extra-results.json.timeout). 응답이 영구 대기하는 경우와 timeout 오류로 reject되는 경우를 구분했다. timeout 자체를 발생시키는 앱의 타이머/AbortController는 로컬 fetch 구현에서 찾지 못했으므로 실제 운영망의 OS timeout까지 장시간 기다리는 검사는 NOT RUN이다. 관찰 창 내 요청 수와 경고는 results.json.failures에 있으며 무한 재시도는 관측되지 않았다. 오류 경고가 존재해도 핵심 링크가 유지되는지는 별도 판정했다.

- 200 empty-collection: 8회 실행. ko/explore 핵심 링크 0개, ko/categories 핵심 링크 0개, ko/series 핵심 링크 0개, ko/secondary-tags 핵심 링크 0개, en/explore 핵심 링크 0개, en/categories 핵심 링크 0개, en/series 핵심 링크 0개, en/secondary-tags 핵심 링크 0개.

- 200 invalid-shape: 8회 실행. ko/explore 핵심 링크 0개, ko/categories 핵심 링크 0개, ko/series 핵심 링크 0개, ko/secondary-tags 핵심 링크 0개, en/explore 핵심 링크 0개, en/categories 핵심 링크 0개, en/series 핵심 링크 0개, en/secondary-tags 핵심 링크 0개.

정상 JSON의 빈 목록은 실제 콘텐츠 삭제를 반영해야 할 수도 있다. 그러나 이번 시험에서는 변경 없는 운영 SSR에 브라우저 응답만 빈 목록/잘못된 객체로 바꿨다. 특히 `{}`는 유효한 Content API 목록 스키마가 아니므로 이를 콘텐츠 0개로 해석해 SSR을 지우는 것은 방어 검증 공백이다(GHV-02). 빈 본문 시험 PASS와 혼동하지 않는다.

### 검색·정렬·페이지네이션·기본 탐색

8개 허브 자체에는 검색 입력/사용자 선택 정렬·필터 컨트롤이 없어 해당 UI 조작은 N/A. 코드의 자동 정렬은 SSR/JS 순서 비교로 검사했다. 별도 `/search/` 기능은 추가 실검증했다.

- ko 검색: match: `https://ceak.dev/search/?q=AI`, 24 results found. Page 1 of 3.; page2: `https://ceak.dev/search/?q=AI&page=2`, 결과 10개; refresh: `https://ceak.dev/search/?q=AI&page=2`, 결과 10개; empty: `https://ceak.dev/search/?q=zzzxqv-no-match-20261031`, No posts found.; clear: `https://ceak.dev/search/`, Search titles and excerpts (2+ characters).; back: `https://ceak.dev/search/?q=AI`, 24 results found. Page 1 of 3.; forward: `https://ceak.dev/search/?q=zzzxqv-no-match-20261031`, No posts found.. 전체 제목/상태는 extra-results.json.search 참조.

- en 검색: match: `https://en-signal.ceak.dev/search/?q=AI`, 58 results found. Page 1 of 6.; page2: `https://en-signal.ceak.dev/search/?q=AI&page=2`, 결과 10개; refresh: `https://en-signal.ceak.dev/search/?q=AI&page=2`, 결과 10개; empty: `https://en-signal.ceak.dev/search/?q=zzzxqv-no-match-20261031`, No posts found.; clear: `https://en-signal.ceak.dev/search/`, Search titles and excerpts (2+ characters).; back: `https://en-signal.ceak.dev/search/?q=AI`, 58 results found. Page 1 of 6.; forward: `https://en-signal.ceak.dev/search/?q=zzzxqv-no-match-20261031`, No posts found.. 전체 제목/상태는 extra-results.json.search 참조.

- ko/categories: initial → https://ceak.dev/categories/, next-unavailable → 다음 페이지 없음.

- ko/series: initial → https://ceak.dev/series/, page2 → https://ceak.dev/series/?page=2, refresh → https://ceak.dev/series/?page=2, previous → https://ceak.dev/series/, out-of-range-last → https://ceak.dev/series/?page=2, back → https://ceak.dev/series/, forward → https://ceak.dev/series/?page=2.

- en/categories: initial → https://en-signal.ceak.dev/categories/, next-unavailable → 다음 페이지 없음.

- en/series: initial → https://en-signal.ceak.dev/series/, page2 → https://en-signal.ceak.dev/series/?page=2, refresh → https://en-signal.ceak.dev/series/?page=2, previous → https://en-signal.ceak.dev/series/, out-of-range-last → https://en-signal.ceak.dev/series/?page=2, back → https://en-signal.ceak.dev/series/, forward → https://en-signal.ceak.dev/series/?page=2.

- 페이지 클릭 후 실제 Back: ko, 클릭 URL `https://ceak.dev/series/?page=2` → Back `https://ceak.dev/`, 기대 `https://ceak.dev/series/` (GHV-03).

- 페이지 클릭 후 실제 Back: en, 클릭 URL `https://en-signal.ceak.dev/series/?page=2` → Back `https://en-signal.ceak.dev/`, 기대 `https://en-signal.ceak.dev/series/` (GHV-03).

카테고리 다음/이전/마지막/마지막 이후/2페이지 새로고침/2페이지 Back은 NOT RUN(대표 제외 4개, 페이지 크기 10). Explore/Secondary Tags 페이지네이션은 구현되지 않아 N/A. 시리즈 마지막 페이지는 2이며 마지막 이후 버튼 부재/9999 보정은 DOM 및 URL로 검사했다. 버튼으로 1→2 이동 후 Back과 문서 간 이동 후 Back/Forward는 서로 다른 시험이다.

JS OFF 실제 클릭 및 details 펼치기 결과는 extra-results.json.nojs에 저장했다. 홈페이지→게시글 클릭은 extra-results.json.navigation, 표본 게시글·카테고리/시리즈/주제 태그의 실제 GET은 아래와 같다.

| 언어 | 유형 | 실제 GET URL | HTTP |
|---|---|---|---|
| ko | home | https://ceak.dev/ | 200 |
| ko | post | https://ceak.dev/samsung-galaxy-nexus-shw-m420k-teardown/ | 200 |
| ko | category | https://ceak.dev/tag/category-essays/ | 200 |
| ko | series | https://ceak.dev/tag/series-software-history-key-moments/ | 200 |
| ko | topic | https://ceak.dev/tag/linux/ | 200 |
| en | home | https://en-signal.ceak.dev/ | 200 |
| en | post | https://en-signal.ceak.dev/samsung-galaxy-nexus-shw-m420k-teardown/ | 200 |
| en | category | https://en-signal.ceak.dev/tag/category-essays/ | 200 |
| en | series | https://en-signal.ceak.dev/tag/series-software-history-key-moments/ | 200 |
| en | topic | https://en-signal.ceak.dev/tag/linux/ | 200 |

- 게시물 수 표본: ko/category `https://ceak.dev/tag/category-essays/` API count=69, 마지막 페이지 HTTP 200, 7페이지·마지막 9개 → 계산 69, 일치=True.

- 게시물 수 표본: ko/series `https://ceak.dev/tag/series-software-history-key-moments/` API count=16, 마지막 페이지 HTTP 200, 2페이지·마지막 6개 → 계산 16, 일치=True.

- 게시물 수 표본: ko/topic `https://ceak.dev/tag/linux/` API count=27, 마지막 페이지 HTTP 200, 3페이지·마지막 7개 → 계산 27, 일치=True.

- 게시물 수 표본: en/category `https://en-signal.ceak.dev/tag/category-essays/` API count=69, 마지막 페이지 HTTP 200, 7페이지·마지막 9개 → 계산 69, 일치=True.

- 게시물 수 표본: en/series `https://en-signal.ceak.dev/tag/series-software-history-key-moments/` API count=16, 마지막 페이지 HTTP 200, 2페이지·마지막 6개 → 계산 16, 일치=True.

- 게시물 수 표본: en/topic `https://en-signal.ceak.dev/tag/linux/` API count=27, 마지막 페이지 HTTP 200, 3페이지·마지막 7개 → 계산 27, 일치=True.

- 검색 누락 재현 ko: API 첫 페이지 100개, meta={'page': 1, 'limit': 100, 'pages': 2, 'total': 111, 'next': 2, 'prev': None}; page 2 HTTP 200, 실제 제목 `클린룸 구현은 어떻게 법적으로 인정될까 — 소프트웨어 역사 속 가장 정교한 저작권 회피 기술` 검색 → `No posts found.`. [스크린샷](verification-2026-10-31/ko-search-omitted-post.png) **(로컬 전용)**

- 검색 누락 재현 en: API 첫 페이지 100개, meta={'page': 1, 'limit': 100, 'pages': 2, 'total': 111, 'next': 2, 'prev': None}; page 2 HTTP 200, 실제 제목 `Are AI Editors Truly New? — The Evolution of Development Tools After Copilot` 검색 → `No posts found.`. [스크린샷](verification-2026-10-31/en-search-omitted-post.png) **(로컬 전용)**

- 추가 HTTP 오류: ko `https://ceak.dev/content/media/audio/samsung-galaxy-nexus-shw-m420k-teardown.mp3` → 404.

- 추가 HTTP 오류: ko `https://ceak.dev/content/media/audio/samsung-galaxy-nexus-shw-m420k-teardown.mp3` → 404.

- 추가 HTTP 오류: en `https://en-signal.ceak.dev/content/media/audio/samsung-galaxy-nexus-shw-m420k-teardown.mp3` → 404.

- JS OFF 펼친 시리즈 제목 링크 ko/PC: open=True, visible=True, `/tag/series-developer-tool-supply-chain-attacks/` 클릭 → `https://ceak.dev/tag/series-developer-tool-supply-chain-attacks/`.

- JS OFF 펼친 시리즈 제목 링크 ko/모바일: open=True, visible=True, `/tag/series-developer-tool-supply-chain-attacks/` 클릭 → `https://ceak.dev/tag/series-developer-tool-supply-chain-attacks/`.

- JS OFF 펼친 시리즈 제목 링크 en/PC: open=True, visible=True, `/tag/series-developer-tool-supply-chain-attacks/` 클릭 → `https://en-signal.ceak.dev/tag/series-developer-tool-supply-chain-attacks/`.

- JS OFF 펼친 시리즈 제목 링크 en/모바일: open=True, visible=True, `/tag/series-developer-tool-supply-chain-attacks/` 클릭 → `https://en-signal.ceak.dev/tag/series-developer-tool-supply-chain-attacks/`.

표본만 검사했으며 112개 주제/모든 게시글을 크롤링하지 않았다. 표본 태그의 게시물 수는 API count와 태그 상세 목록·페이지네이션 총계를 대조한 범위만 확정할 수 있다. 모든 태그의 연결 게시물 수 전수 검사는 NOT RUN이다.

### 언어와 데이터

- 한국어 main H1·영역명·개수 단위는 한국어, 영어는 영어이며 lang/테마 hub locale도 각각 ko/en이다. 태그·제목은 DB 데이터다. 한국어 콘텐츠에 영어 설명/기술 명칭이 존재하는 것은 임의 번역 증거가 아니다. 공통 헤더/검색 페이지 일부 English UI는 테마에 하드코딩되어 있어 한국어 전체 UI 번역 완료라고 판정하지 않는다.
- SSR 고유 태그 수: 각 사이트 category 5, series 13, topic 112. 두 DB의 숫자가 같다는 것만으로 API 혼선을 추정하지 않았다. 정상 네트워크 API 요청 호스트는 각각 자기 사이트이며 태그 이름·본문·최근 글 URL도 각 호스트 응답에서 따로 수집했다.
- secondary topic URL에는 category-/series- 접두 태그가 섞였는지, 대표와 목록이 겹치는지 offline 집합 검사했다. 수집된 API slug/name/count/visibility는 extra-results.json.data에 있으며 키는 저장하지 않았다. count=0 태그가 실제로 있을 때만 제외 동작을 운영 데이터로 판단할 수 있다. 제로 태그가 없다면 해당 분기는 코드 검토 근거이며 실제 운영 0건 노출 재현은 NOT RUN이다.

- 실제 API 태그 집계 ko: 130개, 역할별 양수 태그 {'categories': 5, 'series': 13, 'topics': 112}, public count=0 태그 0개. SSR 집계와 역할별 수가 일치한다. 0개 태그 분기의 운영 실험은 데이터 부재로 NOT RUN.

- 실제 API 태그 집계 en: 130개, 역할별 양수 태그 {'categories': 5, 'series': 13, 'topics': 112}, public count=0 태그 0개. SSR 집계와 역할별 수가 일치한다. 0개 태그 분기의 운영 실험은 데이터 부재로 NOT RUN.

- 검색 응답 기준 검증 ko: 수신 100개 중 AI 제목/요약 매칭 24개, 화면 상태 `24 results found. Page 1 of 3.`, 첫 10개 제목 일치=True. API 메타 `{'page': 1, 'limit': 100, 'pages': 2, 'total': 111, 'next': 2, 'prev': None}`는 전체 111개 중 다음 페이지가 남아 있음을 보여준다(GHV-05).

- 검색 응답 기준 검증 en: 수신 100개 중 AI 제목/요약 매칭 58개, 화면 상태 `58 results found. Page 1 of 6.`, 첫 10개 제목 일치=True. API 메타 `{'page': 1, 'limit': 100, 'pages': 2, 'total': 111, 'next': 2, 'prev': None}`는 전체 111개 중 다음 페이지가 남아 있음을 보여준다(GHV-05).

### canonical / hreflang / SEO

8개 canonical은 모두 유일한 self canonical이고 실제 최종 URL/OG URL과 일치한다. head에 canonical/OG/robots/description 중복은 없고, 수동 canonical이 Ghost 메타와 충돌하는 증거도 없다. title은 전부 `Signal Over Noise`, description은 모두 없다(GHV-04). robots 메타·X-Robots-Tag의 noindex 선언은 없었다. robots.txt 전체 정책, Google 인덱싱 상태는 이번 HTML 검사만으로 확정하지 않는다.

hreflang은 전부 없다. 서로 다른 DB를 운영하며 실제 번역 대응이 있는 URL끼리 ko/en 자기 참조와 양방향 참조를 설계하는 것을 권장한다. 같은 slug라는 이유만으로 번역이라고 간주하거나 존재하지 않는 주소를 자동 선언하면 안 된다. 현재 hreflang 부재를 canonical FAIL로 처리하지 않았다. Google 선택 canonical은 Search Console 접근 검사를 하지 않았으므로 NOT RUN이다.

### 과거 /explore/ 5xx 재현

| GET 응답 시각(서버 Date UTC) | 상태 | ms | CF ray |
|---|---:|---:|---|
| Sat, 31 Oct 2026 05:13:09 GMT | 200 | 1028 | a5302b33e82023c1-LAX |
| Sat, 31 Oct 2026 05:13:19 GMT | 200 | 694 | a5302b78bbd42aa1-LAX |
| Sat, 31 Oct 2026 05:13:30 GMT | 200 | 758 | a5302bbbce2a2a94-LAX |

세 요청 간 10초 간격으로 현재 5xx는 재현되지 않았다(기본 GET·브라우저 관찰도 별도). 일반 UA 및 양 사이트 Explore Googlebot UA GET도 200이었다. UA를 바꾼 시험은 Google 네트워크·검증된 Googlebot·렌더링/크롤링 스케줄 재현이 아니다. Cloudflare DYNAMIC, Express 헤더와 ray는 관측 단서이며 원본 서버 로그가 아니다. 2026-10-24 해당 시각의 Ghost/nginx/호스트/Cloudflare 로그는 접근 세션이 제공되지 않아 NOT RUN. 현재 200만으로 과거 근본 원인 해결을 주장하지 않는다.

## C. 발견된 문제

### GHV-01 — P2

- **발생 URL**: 양 사이트 `/explore/`

- **재현 단계**: GET HTML의 #explore-series-list href 집합을 저장 → JS ON으로 로드 → 실제 API 200 후 같은 영역과 비교. PC/모바일 반복.

- **기대 결과**: 동일 데이터의 SSR과 JS는 같은 상위 10개 시리즈와 순서를 표시.

- **실제 결과**: 개수는 10으로 같지만 언어별 1개 항목이 교체된다. B의 집합 차이 및 js/nojs 스크린샷 참조.

- **관련 코드**: page-explore.hbs:28, assets/js/lib/explore-page.js:185, assets/js/lib/taxonomy.js (getDisplayName)

- **원인 후보 및 근거**: Ghost DB `count.posts desc,name asc`와 브라우저 표시 이름의 localeCompare 정렬이 동점에서 다르다. 정확한 서버 DB collation은 NOT VERIFIED.

- **권장 수정**: SSR/클라이언트가 동일한 안정 정렬 키와 tie-breaker를 사용하도록 설계. limit 적용 전 정렬 기준을 일치시킬 것. 이번 작업에서는 수정하지 않음.

- **재검증**: API 결과·count가 같은 조건에서 ko/en, PC/모바일, 여러 브라우저 언어로 상위 집합과 순서 일치 확인.

### GHV-02 — P2

- **발생 URL**: 양 사이트 4개 허브 전체

- **재현 단계**: 새 context에서 Content API 요청만 200 application/json `{}` 또는 `{tags:[],posts:[]}`로 fulfill → main 콘텐츠 링크 수 기록.

- **기대 결과**: 잘못된/신뢰할 수 없는 빈 API 결과가 정상 SSR을 파괴하지 않음.

- **실제 결과**: SSR은 태그/글을 포함하지만 JS 후 핵심 링크 0개와 빈 상태 문구. 반면 401/403/500·빈 본문 오류는 보존. extra-results.json.emptyCollection 및 *-invalid-shape.png 증거.

- **관련 코드**: assets/js/lib/content-api.js:152, assets/js/lib/categories-page.js:175, assets/js/lib/series-page.js:177, assets/js/lib/secondary-tags-page.js:105, assets/js/lib/explore-page.js:131

- **원인 후보 및 근거**: 컬렉션 스키마 누락을 []로 취급한다. 각 성공 핸들러는 empty 상태를 innerHTML로 덮어쓴다. 유효한 실제 0개 결과와 잘못된/일시적인 응답을 구분하지 않음.

- **권장 수정**: 응답 스키마·완전성 검증 후 DOM을 교체하고, 실패/비정상 빈 응답 시 SSR을 유지. 진짜 콘텐츠 삭제를 어떻게 반영할지는 별도 정책으로 결정.

- **재검증**: 빈 본문·{}·배열 누락/null·유효 빈 목록·부분 페이지 실패·정상 0개 콘텐츠를 각각 분리해 보존/갱신 정책 검증.

### GHV-03 — P2

- **발생 URL**: 양 사이트 `/series/`; categories/search에도 같은 replaceState 패턴 존재

- **재현 단계**: 홈 문서 → series → 2페이지 버튼 → 브라우저 Back. extra-results.json.pagingHistory 참조.

- **기대 결과**: 사용자가 Back으로 직전 목록 1페이지에 돌아가며 URL/화면이 일치.

- **실제 결과**: 버튼 클릭이 현재 이력을 교체하므로 Back은 홈으로 이동. 문서 간 URL 이동 후 Back/Forward와 새로고침 복원은 정상. 배포 전부터 존재했는지는 미확인.

- **관련 코드**: assets/js/lib/series-page.js:90, assets/js/lib/categories-page.js:81, assets/js/lib/search-page.js:110

- **원인 후보 및 근거**: updatePageUrl/setUrlQuery가 사용자 동작에도 history.replaceState를 사용한다. 시리즈/categories에는 popstate가 있지만 클릭 이력이 생성되지 않는다.

- **권장 수정**: 사용자 페이지 변경은 pushState, 초기 값 보정은 replaceState로 구분하고 검색에도 URL↔화면 복원 정책 적용.

- **재검증**: 1→2→1, 검색어 변경 후 Back/Forward, 직접 링크/새로고침/범위 보정에서 URL·카드·선택 페이지 동시 확인.

### GHV-04 — P2

- **발생 URL**: 기본 8개 탐색 URL

- **재현 단계**: GET HTML head에서 title과 meta[name=description]을 확인.

- **기대 결과**: 페이지 목적과 언어를 구분하는 제목/설명.

- **실제 결과**: 8개 모두 title=Signal Over Noise, description 0개. self canonical 자체는 정상.

- **관련 코드**: default.hbs:7 및 page-explore.hbs/page-categories.hbs/page-series.hbs/page-secondary-tags.hbs, routes.yaml

- **원인 후보 및 근거**: 커스텀 라우트에서 meta_title은 사이트 제목으로 귀결되고 개별 페이지 설명이 제공되지 않음. ghost_head 단일 사용이 중복 canonical은 피하지만 설명을 생성하지는 않음.

- **권장 수정**: Ghost 기본 메타와 중복되지 않도록 허브별 언어 제목/설명 공급 방식을 설계.

- **재검증**: 8개 원본 head의 제목/description 1개, canonical 1개 및 언어/OG 일치 재검사.

### GHV-05 — P2

- **발생 URL**: 양 사이트 `/search/`

- **재현 단계**: 검색 API meta.pagination과 반환 수 확인 → page=2에서 실제 글 제목 선택 → 검색 폼에 전체 제목 입력. search-probe-results.json 참조.

- **기대 결과**: 전체 공개 게시물이 검색 대상이며 API 다음 페이지도 포함.

- **실제 결과**: 총 111개 중 첫 100개만 검색한다. 다음 페이지 11개에 존재하는 제목으로 검색하면 결과가 없다.

- **관련 코드**: assets/js/lib/search-page.js:234, assets/js/lib/content-api.js:98

- **원인 후보 및 근거**: search-page가 fetchAyuContentApiCollection 대신 fetchAyuContentApiJson을 한 번 호출한다. limit=all도 실제 응답은 limit=100, pages=2, next=2.

- **권장 수정**: posts도 전체 컬렉션 수집 함수를 이용하거나 서버 필터/페이지네이션 검색 설계.

- **재검증**: 100개 초과 데이터에서 마지막 글, 첫 글, 제목/요약 매칭, URL·페이지 이동과 전체 결과 수 확인.

### 추가 관찰 및 제한

- Galaxy Nexus 표본 오디오 경로는 양 사이트의 실제 Range GET에서도 404였다(audio-probe-results.json). 다만 post-audio.js:26은 HEAD→GET으로 선택적 오디오 존재를 탐색하고, 없으면 플레이어를 숨기는 구현이다. 필수 오디오 제공 정책 근거가 없어 이를 깨진 필수 콘텐츠로 단정하거나 P2 결함으로 집계하지 않았다. 추가 브라우저 HTTP 오류 로그에는 이 탐색 요청이 포함된다.

- 광고/분석 요청의 ERR_ABORTED, 광고 프레임 ORB/CSP report-only 메시지와 `Y` 오류가 기록됐다. 페이지 이동에 따른 취소도 포함되며 이를 운영 원본 장애나 테마 예외로 확정하지 않았다. 가능한 스택은 extra-results.json.runtimeErrors, HTTP 실패 상태는 extra-results.json.httpErrors 참조. 콘텐츠 동작 중단은 관측되지 않았다.
- 클라이언트 fetch의 명시적 timeout이 없으나, 10초 대기 중에도 SSR은 보존됐다. 무한 대기를 방지하는 개선은 P3 권장 사항이며 현재 증거만으로 콘텐츠 접근 장애라고 판정하지 않았다.
- 한국어 공통 메뉴/검색의 English 하드코딩은 P3 번역 개선 후보. 허브 핵심 한국어 UI 자체는 정상이다.
- hreflang 추가는 P3 권장 사항이며 대응 콘텐츠 검증이 선행돼야 한다.

## D. 소스·배포 정합성

저장소 HEAD: `b9e8f9fea072af9720c892868b983d5a675201c7` (`fix: server-render discovery hubs and preserve SSR on API failures`). HEAD 이름을 배포 증거로 사용하지 않았다. HBS 4개와 hub-*-pages/card partial에서 public·prefix 필터, count.posts>0, 대표 제외, 100개 단위 추가 배치 및 details를 확인했다. JS의 API 컬렉션 추가 페이지 수집, 실패 catch의 SSR 보존, locale 선택, 기존 페이지 크기 10 및 URL 쿼리 처리가 있다. gulpfile.js는 assets/js/lib/*.js를 main.min.js에 포함한다.

- ko 공개 JS GET 200: `https://ceak.dev/assets/built/main.min.js` SHA-256 `7e4eae2efdc603b3b55cdf85cb3bfc081fc86a3a26c1f30e2edc2cc7896bab0f`. 로컬 SHA-256 `7e4eae2efdc603b3b55cdf85cb3bfc081fc86a3a26c1f30e2edc2cc7896bab0f` — 일치.

- en 공개 JS GET 200: `https://en-signal.ceak.dev/assets/built/main.min.js` SHA-256 `7e4eae2efdc603b3b55cdf85cb3bfc081fc86a3a26c1f30e2edc2cc7896bab0f`. 로컬 SHA-256 `7e4eae2efdc603b3b55cdf85cb3bfc081fc86a3a26c1f30e2edc2cc7896bab0f` — 일치.

기본 HBS와 운영 HTML에서 hub-ssr-override 연결은 발견되지 않았다. 운영 스크립트 목록은 offline.json.scripts 참조. Ghost ghost_head는 default.hbs:31에 있고 4개 허브에는 수동 canonical 블록이 없다. package.json custom.site_locale의 기본값은 ko, 선택값 ko/en이며 실제 HTML locale을 별도 확인했다. HTML lang은 @site.locale을 사용한다. 전체 서버 HBS·테마 zip·주입 설정·배포 로그의 해시 검증은 NOT VERIFIED. 소스맵/전체 자산을 다시 빌드·재배포하지 않았다.

## E. 최종 판단

**1. 한국어와 영어 모두 SSR이 정상 적용됐는가?**

예. 8개 GET 원본 HTML에서 목적에 맞는 실제 링크와 콘텐츠를 확인했다. 다만 Explore 시리즈의 JS 전후 집합은 다르다.

**2. JavaScript 없이 주요 콘텐츠에 접근 가능한가?**

예. PC·모바일에서 표시되고 실제 링크 클릭/네이티브 details를 검사했다. JS 기반 모바일 햄버거 메뉴 자체의 무JS 동작은 보장하지 않는다.

**3. JS/페이지네이션 회귀 문제가 있는가?**

현재 동작상 Explore 정렬 일관성, 클릭 후 Back 이력, 100개 이후 검색 누락가 있다. 핵심 렌더링·시리즈 페이지 이동/새로고침은 동작한다. 배포 전 운영 동일 시험이 없어 새 회귀인지 기존 제한인지는 NOT VERIFIED.

**4. API 오류 시 SSR은 보존되는가?**

연결 실패/401/403/500/빈 본문/timeout 관찰에서는 보존된다. 200 잘못된 JSON 스키마/빈 컬렉션에서는 보존되지 않아 포괄적인 실패 복구 PASS는 불가.

**5. canonical/언어별 링크는 정상인가?**

8개 self canonical/OG/HTML lang/허브 내부 호스트는 정상. hreflang 없음. 제목/설명 개선 필요. Google 선택 canonical은 미검증.

**6. 현재 /explore/ 5xx가 재현되는가?**

10초 간격 3회 GET 모두 200으로 재현되지 않았다. 2026-10-24 원인 해결 여부는 서버 로그 없이 판단할 수 없다.

**7. Search Console 추가 확인은?**

ko /explore/ 라이브 URL 검사·실제 HTTP/렌더링과 과거 크롤링 시각 비교, ko /categories/ 사용자 선언 vs Google 선택 canonical 및 영어 URL 검사, 페이지 색인/중복 분류·사이트맵·최근 크롤링 시각 확인. 수정된 HTML 재크롤링 후 선택 canonical 재확인. 현재 HTML 정상만으로 Google 선택이 변경됐다고 주장하지 않는다.

**8. 현재 배포를 유지해도 되는가?**

관측 범위에서 SSR·기본 탐색 접근은 가능하고 긴급 롤백 근거는 없다. 운영 유지 가능하나 전체 검증 통과로 승인할 수는 없다. GHV-01~05을 후속 수정·재검증하고 5xx 로그 확인 필요.

**9. 수정 우선순위는?**

P2: GHV-02 API 스키마/빈 결과 보호 → GHV-05 검색 누락 → GHV-01 SSR/JS 안정 정렬 → GHV-03 이력 → GHV-04 SEO 제목/설명. P3: 대응 URL 검증 후 hreflang, timeout, 공통 한국어 UI. P0/P1은 이번 실행에서 확인되지 않았다.

### NOT RUN / NOT VERIFIED와 추가 필요 환경

| 미실행/미확정 항목 | 이유 | 추가 제공 필요 |
|---|---|---|
| 과거 2026-10-24 원본/Ghost/nginx/CDN 로그 | 인증된 서버/로그 접근 없음 | 해당 요청 시각·타임존, 읽기 전용 로그 발췌 또는 read-only 접근 |
| 서버 HBS/전체 배포 파일 동일성 | 공개 JS 외 서버 아티팩트 미접근 | 실제 적용 테마 zip/배포 기록/해시 목록 |
| Google 선택 canonical/실제 Googlebot | Search Console 인증 세션 없음 | URL 검사 결과 또는 read-only Search Console 환경 |
| 카테고리 2페이지 이상 | 현 데이터 4개 목록 | 비운영 환경의 11개 이상 목록 데이터 |
| 모든 태그·게시물 수 전수 검증 | 저빈도 표본 검사 원칙 | DB/Content API 읽기 전용 내보내기 및 기대 집계 정책 |
| 배포 전/후 동등 회귀 비교 | 배포 전 동일 실행 증거 없음 | 이전 아티팩트를 별도 스테이징에 띄운 환경 |
| 실제 iOS/Android·다중 브라우저 | Chromium 뷰포트 검사만 실행 | 실제 기기 또는 장치 테스트 환경 |
| 장시간 OS 네트워크 timeout/장기 재시도 | 10초 pending + 브라우저 timedout 오류만 모의 | 필요 시 비운영 장시간 시험 환경 |
| 전체 HTML 표준 검증/robots.txt 정책 | 기본 HTML 구조·head만 검증 | 필요 시 별도 validator/SEO 범위 확장 |

### 증거 파일

보고서 생성 시각: 2026-10-31T14:31:06.186117+09:00. 추가 묶음 종료 후 검색 누락·네이티브 details 및 오디오 Range GET 보완 검사 결과까지 반영했다.

추가 클릭 검사 첫 실행은 레이아웃 박스가 없는 이미지 앵커를 선택해 timeout(extra-run.log), 다음 실행은 페이지 숫자 2와 다음 화살표에 같은 data-search-page=2가 있어 자동화의 strict selector 오류(extra-run-retry.log)로 중단됐다. 제목 링크 및 첫 번째 페이지 버튼을 명시해 재실행한 최종 결과는 extra-results.json/extra-run-retry2.log이다. 보완 details 검사의 영어 모바일 1회도 자동 스크롤 중 요소 안정성/뷰포트 timeout(details.log)이 있어 실제 휠 스크롤로 화면에 가져온 뒤 재검사했다(details-retry.log). 이는 재실행 성공 여부와 분리해 로그에 보존하며 자동화 시도 실패 자체를 사용자 UI 고장으로 집계하지 않았다. 펼친 시리즈 내부의 첫 이미지 앵커 visible=false 판정은 details-results.json의 실제 제목 링크 표시·클릭 검사로 보완했다.

[results.json](verification-2026-10-31/results.json) **(로컬 전용)**, [extra-results.json](verification-2026-10-31/extra-results.json) **(로컬 전용)**, [offline.json](verification-2026-10-31/offline.json) **(로컬 전용)**, [run.log](verification-2026-10-31/run.log) **(로컬 전용)**, [extra-run.log](verification-2026-10-31/extra-run.log) **(로컬 전용)**, [audit.cjs](verification-2026-10-31/audit.cjs) **(로컬 전용)**, [extra.cjs](verification-2026-10-31/extra.cjs) **(로컬 전용)**, [offline.py](verification-2026-10-31/offline.py) **(로컬 전용)**, [report.py](verification-2026-10-31/report.py) **(로컬 전용)**, [audio-probe-results.json](verification-2026-10-31/audio-probe-results.json) **(로컬 전용)**, [search-probe.cjs](verification-2026-10-31/search-probe.cjs) **(로컬 전용)**, [search-probe.log](verification-2026-10-31/search-probe.log) **(로컬 전용)**, [details.cjs](verification-2026-10-31/details.cjs) **(로컬 전용)**, [details.log](verification-2026-10-31/details.log) **(로컬 전용)**, [details-retry.log](verification-2026-10-31/details-retry.log) **(로컬 전용)**, [validate.py](verification-2026-10-31/validate.py) **(로컬 전용)**, [validation.log](verification-2026-10-31/validation.log), [analyze.py](verification-2026-10-31/analyze.py) **(로컬 전용)**, [checks.json](verification-2026-10-31/checks.json), [details-results.json](verification-2026-10-31/details-results.json), [search-probe-results.json](verification-2026-10-31/search-probe-results.json) **(로컬 전용)**, [extra-run-retry.log](verification-2026-10-31/extra-run-retry.log) **(로컬 전용)**, [extra-run-retry2.log](verification-2026-10-31/extra-run-retry2.log) **(로컬 전용)**. 스크린샷과 치환된 HTML, 수신 main.min.js 사본은 같은 디렉터리에 있다. JSON의 배열 인덱스 대신 lang/name/js/mobile/mode/stage로 항목을 찾을 수 있다. 시험 중 수집한 사이트 콘텐츠는 변경될 수 있다.
