# Development Guide

이 문서는 Signal Wave Ayu 테마를 개발하거나 수정하려는 개발자를 위한 문서입니다.

Ghost 테마 구조, 디렉터리 구조, 빌드 시스템, 개발 워크플로우를 설명합니다.

# 1. 개발 환경

필수 환경

- Node.js 18 이상
- npm
- Ghost 5 이상

권장 환경

- Linux / macOS / WSL2
- VSCode
- Ghost CLI

Node 버전 확인

```
node -v
npm -v

```

Ghost CLI 설치

```
npm install -g ghost-cli

```

Ghost 로컬 실행

```
ghost install local

```

# 2. 개발용 테마 연결

개발 중인 테마를 Ghost에 연결하는 방법입니다.

## 방법 1 — 심볼릭 링크 (권장)

Ghost 디렉터리 구조

```
ghost/
  content/
    themes/

```

테마 개발 위치

```
workspace/
  signal-wave-ayu/

```

심볼릭 링크 생성

```
ln -s ~/workspace/signal-wave-ayu ~/ghost/content/themes/signal-wave-ayu

```

Ghost Admin에서 테마 활성화

```
Settings → Design → Change theme

```

## 방법 2 — zip 업로드

테마 패키지 생성

```
npm run zip

```

생성 위치

```
dist/signal-wave-ayu.zip

```

Ghost Admin에서 업로드합니다.

# 3. 디렉터리 구조

```
signal-wave-ayu/

assets/
  built/
  css/
  fonts/
  images/
  js/

partials/

default.hbs
index.hbs
post.hbs
tag.hbs
page.hbs

page-categories.hbs
page-series.hbs
page-secondary-tags.hbs
page-search.hbs
page-explore.hbs

author.hbs
rss.hbs

routes.yaml

package.json
gulpfile.js

```

# 4. CSS 구조

CSS 엔트리 파일

```
assets/css/screen.css

```

예시 import 구조

```
@import "general/fonts.css";
@import "general/vars.css";

@import "site/layout.css";
@import "site/header.css";
@import "site/footer.css";
@import "site/theme-ayu.css";

@import "blog/post.css";
@import "blog/feed.css";
@import "blog/single.css";

@import "post-toc.css";
@import "post-navigation.css";
@import "ad-slots.css"

```

CSS 디렉터리 구조

```
assets/css/

general/
site/
blog/
misc/

```

general

```
fonts.css
vars.css

```

site

```
layout.css
header.css
footer.css
cover.css
explore.css
theme-ayu.css

```

blog

```
post.css
feed.css
single.css
author.css

```

# 5. JavaScript 구조

메인 런타임

```
assets/js/main.js

```

보조 모듈

```
assets/js/lib/

```

예시

```
post-toc.js
series-page.js

```

빌드 결과

```
assets/built/main.min.js

```

# 6. 런타임 실행 흐름

페이지 로딩 시 다음 함수들이 실행됩니다.

```
themeToggle()
renderAyuPagination()
renderPrimaryCategories()
renderSecondaryTags()
renderSeriesTags()
renderPostSeriesNavigation()
renderSearchPage()
renderExplorePage()
injectPromoSlots()
normalizePostTaxonomyTags()
normalizeTagHeaderName()

```

# 7. Taxonomy 시스템

slug prefix 기반 분류

```
category-*
series-*

```

예시

```
category-ai
series-unix-design
docker
python

```

JS 정의

```
AYU_TAG_PREFIX = {
  CATEGORY: "category-",
  SERIES: "series-"
}

```

# 8. Ghost Content API

허브 페이지는 Ghost Content API를 사용합니다.

사용 API

```
/ghost/api/content/tags
/ghost/api/content/posts

```

사용 위치

- categories 페이지
- series 페이지
- topics 페이지
- explore 페이지
- search 페이지

API 키는 다음 script 태그에서 읽습니다.

```
<script data-key="..."></script>

```

# 9. Search 구현

검색 동작

```
1 모든 post 조회
2 title / excerpt 필터
3 JS pagination

```

검색 최소 길이

```
2

```

페이지 크기

```
AYU_GLOBALS.PAGINATION_PAGE_SIZE = 10

```

# 10. Series Navigation

포스트 하단에 시리즈 글 목록 표시

동작 과정

```
1 post class에서 series tag 추출
2 series slug 생성
3 series tag 조회
4 series post 조회
5 날짜 기준 정렬
6 navigation 렌더링

```

# 11. 광고 슬롯

지원 슬롯

```
list-inline
post-top
post-bottom

```

삽입 간격

```
PROMO_INSERT_EVERY = 5

```

포스트 카드 5개마다 광고가 삽입됩니다.

# 12. 빌드 시스템

빌드는 gulp 기반입니다.

```
gulpfile.js

```

CSS 입력

```
assets/css/screen.css

```

CSS 출력

```
assets/built/screen.css

```

JS 출력

```
assets/built/main.min.js

```

# 13. 개발 명령어

의존성 설치

```
npm install

```

개발 모드

```
npm run dev

```

테마 검사

```
npm test

```

zip 패키지 생성

```
npm run zip

```

# 14. 테마 검증

Ghost 테마 검증

```
gscan .

```

# 15. 주요 수정 위치

레이아웃

```
default.hbs

```

포스트 템플릿

```
post.hbs

```

피드

```
index.hbs
partials/loop.hbs

```

taxonomy 로직

```
assets/js/main.js

```

테마 스타일

```
assets/css/site/theme-ayu.css

```

허브 페이지

```
page-categories.hbs
page-series.hbs
page-secondary-tags.hbs
page-explore.hbs

```

# 16. 개발 워크플로우

권장 순서

```
1 Ghost 로컬 실행
2 테마 심볼릭 링크 연결
3 npm install
4 npm run dev
5 CSS / JS 수정
6 gscan 검사
7 zip 패키지 생성

```

# 17. 배포

테마 패키지 생성

```
npm run zip

```

생성 파일

```
dist/signal-wave-ayu.zip

```

Ghost Admin에서 업로드합니다.

# 18. 요약

Signal Wave Ayu 테마 구조 핵심

- Ghost tag 기반 taxonomy
- Content API 기반 허브 페이지
- Gulp 빌드 시스템
- 모듈형 CSS 구조
- 클라이언트 검색
- 시리즈 내비게이션
- 광고 슬롯 시스템