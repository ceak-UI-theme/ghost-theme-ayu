# Signal Wave Ayu — Developer Architecture

이 문서는 **Signal Wave Ayu Ghost 테마의 전체 아키텍처**를 설명합니다.  
테마의 설계 철학, 파일 구조, 템플릿 구성, JavaScript 런타임, Ghost Content API 사용 방식, 그리고 taxonomy 처리 구조까지 **개발자 관점에서 이해할 수 있도록 정리한 문서**입니다.

이 문서는 다음 대상에게 유용합니다.

- Ghost 테마를 수정하려는 개발자
- Signal Wave Ayu 구조를 이해하려는 개발자
- taxonomy 기반 블로그 구조를 확장하려는 개발자
- JavaScript 기반 hub 페이지 동작을 이해하려는 개발자

* * *

# 1. 전체 아키텍처 개요

Signal Wave Ayu는 기본적으로 **Ghost 테마 시스템 위에서 동작하는 서버 템플릿 + 클라이언트 렌더링 구조**를 가지고 있습니다.

전체 구조는 다음과 같습니다.

```
Ghost CMS
│
│ (Ghost Theme)           ▼ Handlebars Templates
│ (Server Side Rendering) ▼ Base Page Layout
│
│
├── Ghost Data Helpers
│ └── JavaScript Runtime
│
│ (Ghost Content API)     ▼ Client Rendered Hub Pages
```

즉 이 테마는 다음 두 레이어로 구성됩니다.

### 서버 레이어

- Handlebars 템플릿
- Ghost helper 사용
- 기본 포스트 렌더링

### 클라이언트 레이어

- JavaScript runtime
- Ghost Content API 호출
- hub 페이지 렌더링
- 검색 기능
- taxonomy 정리

* * *

# 2. 핵심 설계 철학

Signal Wave Ayu는 Ghost의 기본 데이터 모델을 바꾸지 않습니다.

Ghost는 기본적으로 다음 구조만 제공합니다.

`Posts` `Tags` `Authors`

이 테마는 **Tag slug 규칙을 통해 새로운 콘텐츠 모델을 구현합니다.**

즉 다음 구조를 만듭니다.

`Category` `Series` `Topic`

하지만 실제 데이터는 모두 **Ghost Tag**입니다.

* * *

# 3. Taxonomy 모델

taxonomy 모델은 이 테마의 핵심입니다.

태그 slug 규칙은 다음과 같습니다.

- `category-*` → Category 
- `series-*` → Series 
- others → Topic

예시:

`category-ai` `series-ai-agents` `python` `llm` `docker`

이 경우 다음과 같이 해석됩니다.

- Category → AI 
- Series → AI Agents 
- Topics → Python, LLM, Docker

이 구조는 JavaScript의 `AYU_TAG_UTILS`에서 처리됩니다.

* * *

# 4. 콘텐츠 탐색 구조

이 테마는 **hub 중심 탐색 구조**를 사용합니다.

```
Hub Page
│ ▼ Tag Archive
│ ▼ Post
```

예시:

- `/categories/` 
- `/series/`
- `/secondary-tags/`
- `/explore/
- `/search/`

각 hub 페이지는 Ghost가 직접 제공하는 페이지가 아니라  
**JavaScript가 Ghost Content API를 통해 생성하는 페이지**입니다.

* * *

# 5. URL 구조

Ghost `routes.yaml`을 통해 다음 URL을 정의합니다.

- `/categories/`
- `/series/`
- `/secondary-tags/`
- `/explore/`
- `/search/`
- `/rss/`

포스트는 다음 형태입니다.

`/{slug}/`

Tag archive는 Ghost 기본 구조를 사용합니다.

`/tag/{slug}/`

예시:

- `/tag/category-ai/`
- `/tag/series-unix-design/`
- `/tag/docker/`

* * *

# 6. 디렉터리 구조

Signal Wave Ayu의 주요 디렉터리는 다음과 같습니다.

```
signal-wave-ayu
│
├─ assets
    │
    ├─ css
    │
    ├─ js
    │
    ├─ images
    │
    ├─ fonts
    │
    └─ built
│
├─ partials
│
├─ default.hbs
├─ index.hbs
├─ post.hbs
├─ tag.hbs
├─ page.hbs
├─ page-categories.hbs
├─ page-series.hbs
├─ page-secondary-tags.hbs
├─ page-search.hbs
├─ page-explore.hbs
├─ author.hbs
├─ rss.hbs
│
├─ routes.yaml
├─ package.json
├─ gulpfile.js
└─ README.md
```

* * *

# 7. 템플릿 시스템

Ghost 테마는 Handlebars 기반 템플릿을 사용합니다.

Signal Wave Ayu는 다음 템플릿 구조를 사용합니다.

## default.hbs

전체 페이지 레이아웃입니다.

역할

- HTML skeleton
- header
- navigation
- footer
- theme toggle
- CSS / JS 로드

모든 페이지는 기본적으로 `default.hbs`를 상속합니다.

* * *

## index.hbs

홈 페이지입니다.

구성

Site intro Post feed Pagination

Ghost의 `{{#foreach posts}}`를 사용합니다.

* * *

## post.hbs

개별 포스트 페이지입니다.

구성
```
Post header 

Feature image 

Post content 

Series navigation 

Previous / Next post 

Comments
```
* * *

## tag.hbs

Tag archive 페이지입니다.

이 템플릿은 다음 모두를 처리합니다.

- Category page 
- Series page 
- Topic page

Ghost의 tag archive를 그대로 사용합니다.

* * *

## page templates

다음 템플릿은 hub 페이지입니다.

- page-categories.hbs 
- page-series.hbs 
- page-secondary-tags.hbs 
- page-search.hbs 
- page-explore.hbs

이 페이지들은 **layout shell만 제공**합니다.

실제 데이터 렌더링은 JavaScript가 담당합니다.

* * *

# 8. Partial 구조

partials는 재사용 가능한 템플릿입니다.

주요 partial은 다음과 같습니다.

## loop.hbs

포스트 카드입니다.

구성

Feature image 
Title Excerpt Meta

* * *

## post-meta.hbs

포스트 메타 정보입니다.

포함

date tags

* * *

## series-navigation.hbs

시리즈 글 목록 placeholder입니다.

실제 내용은 JavaScript가 채웁니다.

* * *

## post-navigation.hbs

이전 글 / 다음 글 navigation입니다.

* * *

## ayu-pagination.hbs

pagination UI입니다.

Ghost pagination 데이터를 JavaScript에서 사용하도록 전달합니다.

* * *

# 9. JavaScript Runtime

테마의 JavaScript는 다음 위치에 있습니다.

- `assets/js/main.js`
- `assets/js/lib/`

빌드 후 다음 파일로 변환됩니다.

`assets/built/main.min.js`

* * *

# 10. 주요 JavaScript 구성

## Global Constants

```
AYU_DEFAULT_IMAGES 
AYU_GLOBALS 
AYU_TAG_PREFIX
```

예:

```
PROMO_INSERT_EVERY = 5 
PAGINATION_PAGE_SIZE = 10
```

* * *

## Tag Utility

`AYU_TAG_UTILS`

역할

- tag slug 분석 
- taxonomy 분류 
- display name 생성 
- tag grouping

즉 다음을 처리합니다.

- category 
- series 
- topics

* * *

# 11. Hub Page Rendering

Hub 페이지는 다음 방식으로 동작합니다.

1. Ghost Content API 호출 
2. Tag 목록 가져오기 
3. Prefix 기반 taxonomy 분류 
4. 빈 항목 제거 
5. 정렬 
6. 카드 UI 생성

* * *

## Categories Page

/categories/

동작

- fetch tags 
- filter category-* 
- sort by 
- post count render cards

* * *

## Series Page

/series/

동작

- filter series-* 
- sort by 
- post count render list

* * *

## Topics Page

/secondary-tags/

동작

- exclude category 
- exclude series 
- render topic list

* * *

## Explore Page

Explore는 통합 탐색 페이지입니다.

구성

- Categories 
- Series 
- Topics 
- Recent posts

* * *

# 12. Search Architecture

검색 페이지

`/search/`

구현 방식

Ghost Content API → posts JavaScript filtering client pagination

검색 대상

title excerpt custom_excerpt

전체 본문 검색은 지원하지 않습니다.

* * *

# 13. Series Navigation

Series 글은 포스트 하단에 자동 navigation이 생성됩니다.

동작

1. post class에서 series tag 찾기 
2. series slug 추출 
3. 해당 series posts fetch 
4. published_at 기준 정렬 
5. navigation UI 생성

* * *

# 14. Table of Contents

파일

`assets/js/lib/post-toc.js`

기능

- heading scan 
- TOC 생성 
- active section 표시 
- floating TOC

* * *

# 15. Theme Toggle

테마 토글은 다음 방식으로 구현됩니다.

data-theme attribute localStorage 저장

예

`light` `dark`

* * *

# 16. 광고 슬롯 시스템

이 테마는 광고 슬롯 구조를 제공합니다.

지원 슬롯

`list-inline`
`post-top`
`post-bottom`

기본 간격

`5 posts`

* * *

# 17. CSS Architecture

CSS는 다음 구조를 사용합니다.

```
screen.css
├ general
├ site
├ blog
├ misc
```

주요 스타일

- theme-ayu.css
- post.css
- feed.css
- single.css
- post-toc.css

* * *

# 18. 빌드 시스템

빌드는 gulp 기반입니다.

- `npm install`
- `npm run dev`
- `npm run zip`

빌드 과정

CSS → PostCSS JS → concat + uglify assets/built 생성

* * *

# 19. 성능 고려사항

Hub 페이지는 JavaScript 기반입니다.

따라서 다음에 영향을 받습니다.

tag 수 post 수 Content API latency

소규모 기술 블로그에서는 문제 없습니다.

* * *

# 20. Known Limitations

현재 구조의 한계

Search는 full-text가 아님 Hub pages는 JS 의존 Series order는 발행일 기반 jQuery 의존 코드 일부 존재

* * *

# 21. 결론

Signal Wave Ayu는 Ghost의 기본 구조를 유지하면서  
**taxonomy 기반 기술 블로그 구조**를 구현하는 테마입니다.

핵심 특징

- tag 기반 taxonomy 
- hub 중심 탐색 
- series navigation 
- long-form reading UX 
- client rendered discovery pages

Ghost CMS 위에서 **구조화된 기술 블로그를 만들기 위한 아키텍처**입니다.