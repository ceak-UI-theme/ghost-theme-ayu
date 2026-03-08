# Features

이 문서는 **Signal Wave Ayu Ghost 테마가 제공하는 주요 기능**을 설명합니다.

Signal Wave Ayu는 단순한 디자인 스킨이 아니라, **기술 블로그 운영을 위한 구조적 기능**을 중심으로 설계된 테마입니다.  
특히 **Category / Series / Topic 기반 콘텐츠 구조**, **허브 중심 탐색**, **장문 글 읽기 경험**, **시리즈 글 연결**, **검색 및 탐색 페이지** 등 기술 블로그에 필요한 기능들을 제공합니다.

이 문서에서는 다음 기능들을 설명합니다.

- Explore 페이지
- Categories 페이지
- Series 페이지
- Topics 페이지
- Search 페이지
- Table of Contents (TOC)
- Series Navigation
- Light / Dark Theme
- Fallback Images
- Ad Slots
- Pagination
- Responsive Layout

* * *

# Explore Page

Explore 페이지는 블로그 전체를 한눈에 탐색할 수 있는 **통합 허브 페이지**입니다.

경로:

`/explore/`

Explore 페이지는 다음 정보를 조합하여 보여줍니다.

- 주요 Categories
- 주요 Series
- 주요 Topics
- 최근 포스트

즉 Explore 페이지는 단순한 목록 페이지가 아니라 **블로그 전체 콘텐츠를 탐색하는 대시보드 역할**을 합니다.

## 주요 특징

Explore 페이지는 다음 데이터를 사용합니다.

- Ghost Content API
- Tag post count
- 최근 포스트

표시 구성은 보통 다음과 같습니다.

Explore

Top Categories Top Series Top Topics Recent Posts

사용자는 Explore 페이지를 통해

- 새로운 카테고리 발견
- 시리즈 글 탐색
- 주제 기반 글 탐색
- 최신 글 확인

을 한 번에 할 수 있습니다.

* * *

# Categories Page

Categories 페이지는 블로그의 **상위 주제 카테고리**를 모아 보여주는 허브입니다.

경로:

`/categories/`

Category는 다음 slug 규칙을 따르는 태그입니다.

`category-*`

예:

`category-ai` `category-unix` `category-security` `category-infrastructure`

Categories 페이지는 다음 방식으로 동작합니다.

1. Ghost Content API로 모든 태그 조회
2. `category-` prefix 태그만 필터링
3. 포스트 수가 0인 카테고리 제외
4. 포스트 수 기준 정렬
5. 대표 카테고리 + 전체 카테고리 목록 표시

## Featured Category

가장 많은 포스트를 가진 카테고리는 **Featured Category**로 표시됩니다.

예:

`Featured Category AI 42 posts`

## Categories List

나머지 카테고리는 목록 형태로 표시됩니다.

이 페이지를 통해 방문자는 블로그의 전체 주제 구조를 쉽게 이해할 수 있습니다.

* * *

# Series Page

Series 페이지는 블로그의 **연재형 콘텐츠 목록**을 보여주는 허브입니다.

경로:

`/series/`

Series는 다음 slug 규칙을 따르는 태그입니다.

`series-*`

예:

`series-unix-design` `series-ai-agents` `series-readium-devlog`

Series 페이지는 다음 방식으로 동작합니다.

1. Ghost Content API로 모든 태그 조회
2. `series-` prefix 태그 필터링
3. 포스트 수가 0인 시리즈 제외
4. 포스트 수 기준 정렬
5. 대표 시리즈 + 전체 시리즈 목록 표시

## Featured Series

가장 많은 글을 가진 시리즈가 Featured 영역에 표시됩니다.

예:

`Featured Series Unix Design Series 12 posts`

이 기능은 독자가 **연재형 글을 쉽게 찾고 처음부터 읽을 수 있도록** 돕습니다.

* * *

# Topics Page

Topics 페이지는 **일반 태그(secondary tag)**를 모아 보여주는 허브입니다.

경로:

`/secondary-tags/`

Topics는 다음 조건을 만족하는 태그입니다.

- `category-*`가 아님
- `series-*`가 아님
- public tag

예:

`docker` `python` `linux` `kubernetes` `distributed-systems`

Topics 페이지는 다음 방식으로 동작합니다.

1. 모든 태그 조회
2. category / series 제외
3. post count 기준 정렬
4. 대표 topic + topic grid 표시

이 페이지는 **기술 키워드 기반 탐색**을 위한 페이지입니다.

* * *

# Search Page

Search 페이지는 블로그 포스트를 검색하는 기능을 제공합니다.

경로:

`/search/`

검색은 **Ghost Content API 기반 클라이언트 검색**으로 구현되어 있습니다.

## 검색 방식

검색은 다음 필드를 기준으로 수행됩니다.

- post title
- post excerpt
- custom excerpt

검색 흐름:

사용자 입력 → 전체 포스트 목록 조회 → 문자열 필터링 → 결과 렌더링

## 검색 특징

- 최소 2글자 이상 입력 필요
- 결과는 클라이언트에서 pagination 처리
- URL query parameter 지원

예:

`/search/?q=ghost`

## 검색 한계

이 검색은 전문 검색 엔진이 아닙니다.

검색 대상에 포함되지 않는 항목:

- 본문 전체
- 코드 블록
- 이미지 alt
- author

따라서 **중소 규모 블로그용 검색 기능**으로 이해하는 것이 적절합니다.

* * *

# Table of Contents (TOC)

Signal Wave Ayu는 장문 글을 위해 **자동 목차 기능**을 제공합니다.

TOC는 다음 위치에 표시됩니다.

우측 하단 고정 영역

TOC는 다음 헤딩을 기반으로 생성됩니다.

`h1` `h2` `h3`

## TOC 기능

- 헤딩 자동 스캔
- heading id 자동 생성
- 현재 읽는 섹션 강조
- 스크롤 기반 active 표시
- 드래그 이동 가능
- 모바일에서는 숨김

TOC 기능은 특히 다음 글에 유용합니다.

- 기술 튜토리얼
- 긴 설계 문서
- 개발기 시리즈

* * *

# Series Navigation

Series Navigation은 **시리즈 글 사이 이동 기능**입니다.

시리즈 태그가 붙은 글에서는 포스트 하단에 다음 UI가 표시됩니다.

```
Series: AI Agents

1. Introduction
2. Agent Architecture
3. Prompt Engineering
4. Tool Integration
```

현재 읽는 글은 강조됩니다.

## 동작 방식

1. 현재 포스트의 series 태그 감지
2. 해당 시리즈 포스트 조회
3. 발행일 기준 정렬
4. 목록 렌더링

즉 시리즈 순서는 다음 기준입니다.

`published_at ascending`

따라서 시리즈 글을 작성할 때는 **발행 순서가 중요합니다**.

* * *

# Light / Dark Theme

Signal Wave Ayu는 **Light / Dark 모드를 모두 지원합니다.**

테마 토글은 다음 버튼으로 제어됩니다.

Theme Toggle

## 동작 방식

테마는 다음 속성을 사용합니다.

- `html[data-theme="light"]` 
- `html[data-theme="dark"]`

사용자가 테마를 변경하면 다음이 저장됩니다.

`localStorage` -> `theme-preference`

따라서 다음 방문 시에도 같은 테마가 유지됩니다.

* * *

# Fallback Images

포스트 또는 태그에 이미지가 없는 경우  
테마는 **fallback 이미지를 자동으로 사용합니다.**

사용되는 기본 이미지:

- `post-default.png `
- `primary-tag-default.png`
- `series-tag-default.png`
- `secondary-tag-default.png`

fallback 이미지 위치:

`assets/images/fallback/`

이 기능 덕분에 이미지가 없는 콘텐츠도 **레이아웃이 깨지지 않습니다.**

* * *

# Ad Slots

Signal Wave Ayu는 광고 삽입을 위한 **Ad Slot 시스템**을 제공합니다.

지원 슬롯:

- `post-top`
- `post-bottom`
- `list-inline`

## Post Ads

포스트 내부 광고 위치:

본문 상단 본문 하단

## Feed Ads

피드에서는 다음 간격으로 광고가 삽입됩니다.

5 posts → 1 promo slot

이 값은 JavaScript 설정으로 변경할 수 있습니다.

`PROMO_INSERT_EVERY`

이 구조는 특정 광고 플랫폼에 종속되지 않으며  
**AdSense / 자체 광고 / 스폰서 블록 등으로 확장 가능합니다.**

* * *

# Pagination

Pagination은 두 가지 방식으로 제공됩니다.

## Ghost Pagination

다음 페이지에서 사용됩니다.

- Home
- Tag archive

Ghost 기본 pagination 데이터를 사용합니다.

## Client Pagination

Search 페이지는 JavaScript pagination을 사용합니다.

기본 페이지 크기:

10 posts

이 값은 다음 설정에서 변경할 수 있습니다.

`PAGINATION_PAGE_SIZE`

* * *

# Responsive Layout

Signal Wave Ayu는 완전한 **반응형 레이아웃**을 제공합니다.

지원 디바이스:

- Desktop
- Tablet
- Mobile

주요 반응형 동작:

- 모바일에서 TOC 숨김
- feed card 레이아웃 변경
- navigation 축소
- grid → single column 변경

모바일 기준 breakpoint:

767px

* * *

# Summary

Signal Wave Ayu의 주요 기능은 다음과 같습니다.

- Explore 기반 콘텐츠 탐색
- Category / Series / Topic taxonomy
- 자동 Series Navigation
- Table of Contents
- Search 기능
- Light / Dark 테마
- fallback 이미지 시스템
- 광고 슬롯 시스템
- pagination
- responsive layout

이 기능들은 단순한 블로그 테마가 아니라  
**구조화된 기술 블로그 운영 환경**을 제공하기 위해 설계되었습니다.