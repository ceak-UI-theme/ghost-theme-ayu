# Signal Wave Ayu

Ghost CMS를 위한 기술 블로그 중심 테마

Signal Wave Ayu는 Ghost의 기본 tag 시스템을 활용하면서,  
tag slug 규칙과 허브 페이지 구조를 통해 블로그 콘텐츠를 체계적으로 탐색할 수 있도록 설계된 테마입니다.

이 테마는 단순한 UI 스킨이 아니라 **콘텐츠 구조 중심의 Ghost 테마**입니다.

핵심 목표는 다음과 같습니다.

- 장문 기술 글 중심의 블로그
- Series 기반 연재 글 구조
- Category 중심 탐색
- Topic 태그 기반 세부 탐색
- Explore 허브를 통한 전체 콘텐츠 탐색
- Ayu 기반 Light / Dark 테마
- Ghost Content API 기반 동적 허브 페이지

* * *

# 1\. 테마 개요

Signal Wave Ayu는 다음과 같은 유형의 블로그에 적합합니다.

- 기술 블로그
- 개발 기록 블로그
- 연재형 글이 많은 블로그
- 아카이브 중심 블로그
- 구조적 탐색이 필요한 블로그

일반적인 블로그 구조

`최근 글 목록` → `글 읽기`

이 테마의 구조

`Explore` → `Category` / `Series` / `Topic` → `Tag Archive` → `Post`

즉 **탐색 중심 블로그**를 목표로 합니다.

* * *

# 2\. 핵심 개념

Ghost는 기본적으로 **tag 하나만 제공**합니다.

Signal Wave Ayu는 tag slug 규칙을 통해  
다음 세 가지 개념을 구현합니다.

## Category

slug 규칙

`category-\*`

예

`category-ai` `category-unix` `category-security`

표시

`AI` `Unix` `Security`

## Series

slug 규칙

`series-\*`

예

`series-ai-agents` `series-unix-design`

표시

`AI` `Agents` `Unix Design`

## Topic

category / series prefix가 없는 일반 tag

예

`docker` `python` `kubernetes` `linux` `mlops`

* * *

## Taxonomy 운영 규칙 (중요)

테마의 taxonomy 판정 기준은 slug입니다.

- `category-*` slug는 category로 취급
- `series-*` slug는 series로 취급
- 그 외 public tag는 topic으로 취급

운영 권장사항

- `slug`는 시스템 규칙용으로 관리
- `name`은 사용자 표시용으로 관리
- `name`에는 가능하면 `category-`, `series-` prefix를 넣지 않기

권장 예시

- slug: `category-ai`, name: `AI`
- slug: `series-readium-dev`, name: `Readium Dev`

현재 구현 한계

- `partials/post-meta.hbs`의 taxonomy 판정은 Ghost Handlebars 제약으로 strict startsWith 대신 `match "~"`를 사용
- `match "~"`는 substring 판정이므로 slug naming convention을 엄격히 지켜야 함
- `category-*`, `series-*` 외 slug에 `category-`, `series-` 문자열이 중간 포함되지 않도록 운영 필요
- 템플릿만으로 모든 prefix 제거/표시명 가공을 일반화하기 어렵기 때문에, 최종 표시 품질은 `name` 저장 품질에 크게 좌우됨

* * *

# 3\. 권장 태그 구조

한 포스트에 다음 구조를 권장합니다.

Category 1개 Series 0~1개 Topic 여러 개

예

`category-ai` `series-ai-agents` `python` `llm` `mlops`

결과

Category
- `AI`
- `Series`
- `AI Agents`

Topics
- `Python` 
- `LLM`
- `MLOps`

* * *

# 4\. URL 구조

기본 글 URL

`/{slug}/`

예
- `/unix-pipe-design/` 
- `/ai-agents-overview/`

Tag archive

`/tag/{slug}/`

예
- `/tag/category-ai/`
- `/tag/series-unix-design/`
- `/tag/docker/`

* * *

# 5\. 허브 페이지

Signal Wave Ayu는 여러 탐색 허브를 제공합니다.

## Explore

`/explore/`

블로그 전체 콘텐츠 탐색 페이지

구성

- `Categories`
- `Series`
- `Topics`
- `Recent posts`

## Categories

`/categories/`

Category 목록

## Series

`/series/`

Series 목록

## Topics

`/secondary-tags/`

Topic 목록

## Search

`/search/`

포스트 검색 페이지

* * *

# 6\. 콘텐츠 탐색 구조

이 테마의 전체 탐색 흐름

```
Explore 
  ↓ 
Categories / Series / Topics 
  ↓ 
Tag archive 
  ↓ 
Post
```

예

`Explore` → `AI category` → `AI Agents series` → `Post`

* * *

# 7\. 포스트 기능

포스트 페이지는 다음 기능을 제공합니다.

- Feature image
- Post meta
- Tag taxonomy
- Table of contents
- Series navigation
- Previous / next navigation
- 광고 슬롯
- Author box

* * *

# 8\. Series navigation

Series 글은 자동으로 연결됩니다.

예

`series-unix-design`

Series 내 글

- `1 Unix Philosophy`
- `2 Everything is a file`
- `3 Pipes and Filters`
- `4 Shell design`

포스트 하단에 자동 표시됩니다.

Series 정렬 기준

`published\_at 오름차순`

운영 정책 (first-series-wins)

- post당 series tag는 1개를 권장
- series tag가 0개면 navigation 미표시
- series tag가 2개 이상이면 첫 번째 series만 사용하고, 콘솔 경고 + 상태값(`multiple-series-tags-first-used`)을 남김

* * *

# 9\. Table of Contents

포스트 내 heading을 기반으로 자동 생성됩니다.

대상

`h1` `h2` `h3`

기능

- 자동 anchor 생성
- 스크롤 위치 highlight
- 데스크톱 floating
- 모바일 숨김

* * *

# 10\. Search

검색 페이지

`/search/`

현재 구현 기준

- 2글자 이상 입력 시 검색 실행
- Ghost Content API로 post 목록을 가져온 뒤 클라이언트에서 필터링
- 검색 대상 필드: `title`, `excerpt`, `custom_excerpt`
- 결과는 검색 페이지 내에서 pagination으로 렌더

포함되지 않는 범위

- 본문 전체(full-text) 검색
- relevance ranking / typo tolerance
- 형태소 분석

정리하면, 현재 검색은 “정식 검색 엔진”이 아니라 사이트 내 빠른 찾기에 가깝습니다.  
작은/중간 규모 블로그에는 현실적인 방식이고, 글 수가 크게 늘어나면 별도 검색 전략 검토가 필요할 수 있습니다.

* * *

# 11\. 허브 페이지 동작 방식

Categories / Series / Topics 페이지는  
Ghost template만으로 동작하지 않습니다.

실제 구조

```
Page template
     ↓ 
Ghost Content API 호출
     ↓
JavaScript 렌더링
```

따라서 JS가 꺼져 있으면 일부 기능이 제한됩니다.

* * *

# 12\. 광고 슬롯

테마는 광고 삽입 구조를 제공합니다.

종류
- `list-inline`
- `post-top`
- `post-bottom`

기본 삽입 규칙

5개의 포스트마다 1개 promo

예
```
post
post
post
post
post
promo
post
post
```

* * *

# 13\. 테마 토글

Light / Dark 모드 지원

구조
- `html\[data-theme="light"\]`
- `html\[data-theme="dark"\]`

설정 저장

`localStorage`

* * *

# 14\. 디렉터리 구조

```
signal-wave-ayu 
│ 
├─ assets 
   │ 
   ├─ built 
   │ 
   ├─ css 
   │ 
   ├─ fonts 
   │ 
   ├─ images 
   │ 
   └─ js 
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

# 15\. 주요 템플릿

## default.hbs

전체 레이아웃

포함

- header
- navigation
- footer
- theme toggle
- scripts

* * *

## index.hbs

홈 페이지

구성

- site intro
- post feed
- pagination

* * *

## post.hbs

포스트 페이지

구성

- title
- feature image
- meta
- content
- TOC
- series navigation
- prev next navigation

* * *

## tag.hbs

Category / Series / Topic archive

* * *

## page-categories.hbs

Categories 허브

* * *

## page-series.hbs

Series 허브

* * *

## page-secondary-tags.hbs

Topic 허브

* * *

## page-search.hbs

검색 페이지

* * *

## page-explore.hbs

Explore 페이지

* * *

# 16\. JavaScript 구조

메인 파일

- `assets/js/main.js`

보조
- `assets/js/lib/post-toc.js`
- `assets/js/lib/series-page.js`

주요 기능

- taxonomy parsing
- hub rendering
- search
- pagination UI
- promo injection
- TOC
- theme toggle

* * *

# 17\. CSS 구조

엔트리 파일
- `assets/css/screen.css`

구성

general site blog misc

주요 파일

- `theme-ayu.css`
- `explore.css`
- `post.css`
- `feed.css` 
- `single.css` 
- `post-toc.css`
- `post-navigation.css`
- `ad-slots.css`

* * *

# 18\. 이미지

fallback 이미지 제공

- `assets/images/fallback/post-default.png` 
- `assets/images/fallback/primary-tag-default.png`
- `assets/images/fallback/series-tag-default.png`
- `assets/images/fallback/secondary-tag-default.png`

* * *

# 19\. 폰트

번들 폰트

- `JetBrains Mono` 
- `NanumSquareRound`
- `Lora Poppins`

* * *

# 20\. 빌드

의존성 설치

```bash
npm install
```

개발 모드
```bash
npm run dev
```
테마 검사
```bash
npm test
```
zip 패키징
```bash
npm run zip
```
결과
```
dist/signal-wave-ayu.zip
```
* * *

# 21\. 빌드 파이프라인

CSS
- `PostCSS` 
- `autoprefixer`
- `cssnano`

JS
- `concat`
- `uglify`

* * *

# 22\. 주의사항

허브 페이지는 JS 의존

- `/categories` 
- `/series`
- `/secondary-tags`
- `/explore`
- `/search`

검색은 단순 필터

`title` `excerpt` `custom_excerpt` 필드 기반 클라이언트 필터링

즉 고급 검색 엔진이 아니라 빠른 찾기 용도이며, 콘텐츠 규모가 커질수록 별도 검색 전략이 필요할 수 있음

Series 정렬

`published\_at`

* * *

# 23\. 권장 운영 방식

좋은 운영 구조

Category 3~8개 Series 여러 개 Topics 자유

예

`category-ai` `category-unix` `category-security` `category-infrastructure`

Series

`series-ai-agents` `series-unix-design` `series-readium-dev`

Topics

`docker` `python` `linux` `kubernetes` `mlops`

* * *

# 24\. 빠른 시작

1 테마 zip 업로드  
2 routes.yaml 업로드  
3 navigation 설정  
4 tag 규칙 적용

예

`category-unix` `series-unix-design` `linux` `shell` `cli`

* * *

# 25\. 정리

Signal Wave Ayu는 다음을 목표로 합니다.

- Ghost tag 기반 taxonomy
- 허브 중심 탐색
- 장문 기술 글 UX
- Series 기반 글 연결
- Ayu 기반 디자인
- 확장 가능한 구조

즉 **Ghost 위에 구축된 구조화된 기술 블로그 테마**입니다.

* * *

# License

MIT
