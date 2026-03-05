# 기술 블로그 화면설계서 v2 (최종)

```markdown
# 기술 블로그 화면설계서 v2

## 0. 문서 목적
본 문서는 Ghost CMS 기반 기술 블로그 테마 커스터마이징을 위한 **화면 구조 및 UX 규칙을 정의하는 설계 문서**이다.

개발 착수 전 다음 항목을 명확히 하기 위한 목적을 가진다.

- 정보 구조 (Information Architecture)
- 화면 레이아웃
- 탐색 구조
- 데이터 사용 규칙
- 테마 커스터마이징 범위

본 문서는 **구현 코드 수준이 아닌 설계 수준의 문서**이며,
구현 방법은 별도의 문서인 **Ghost Wave 커스터마이징 구현 설계서**에서 정의한다.

---

# 0.1 테마 기준 및 커스터마이징 원칙

- 기본 베이스는 Ghost **Wave 테마**를 사용한다.
- 구현은 Wave 기본 구조를 존중하되 본 문서에서 정의한 항목만 커스터마이징한다.
- 커스터마이징 우선순위는 아래와 같다.

```

정보구조
→ 탐색 UX
→ 테마 톤 일관성

```

또한 다음 원칙을 따른다.

- Home 페이지는 Wave 기본 **Hero Cover 구조를 사용하지 않는다**
- 대신 **Mini Intro + Latest Posts 구조**로 단순화한다.

---

# 0.2 테마 (다크 / 라이트) 정책

테마 컬러 시스템은 다음 기준을 사용한다.

```

Ayu Dark
Ayu Mirage

```

참고 자료

- https://vscodethemes.com/e/teabyii.ayu/ayu-dark-bordered
- https://vscodethemes.com/e/teabyii.ayu/ayu-mirage-bordered
- https://github.com/ayu-theme/ayu-colors

---

# 0.3 타이포그래피 정책

기본 폰트 정책

| 구분 | 폰트 |
|-----|------|
본문 | NanumSquareRound
코드 | JetBrains Mono

폰트 위치

```

/assets/fonts

```

운영 원칙

- 외부 CDN 사용하지 않음
- self-host 우선

---

# 1. 용어 정의

## 1.1 태그 분류

### 프라이머리태그
포스트의 **첫 번째 태그**

역할

```

카테고리

```

---

### 시리즈태그

형식

```

#series-{seriesid}

```

예

```

#series-readium-devlog
#series-ghost-theme

```

특징

- Ghost **internal tag**
- UI에는 노출하지 않음
- 시리즈 페이지는 Ghost 기본 tag 페이지 사용

---

### 세컨드태그

프라이머리 / 시리즈 태그를 제외한 나머지 태그

예

```

Ghost
Docker
Java
Design System

```

용도

```

검색
related posts

```

---

## 1.2 식별자

| 이름 | 설명 |
|-----|------|
tagid | Ghost tag slug
seriesid | `#series-{seriesid}` 의 id

---

## 1.3 프라이머리태그 규칙

프라이머리태그는 **포스트의 첫 번째 태그로 고정한다**

카테고리 집계 및 카테고리 페이지 구성 시

```

프라이머리태그만 사용

```

---

# 2. 공통 정책

## 2.1 페이지네이션

공통 정책

```

posts_per_page = 10

```

모든 리스트 화면은 페이지네이션을 사용한다.

---

## 2.2 광고

광고 규칙

```

ad_interval = 5

```

10개 포스트 기준

```

5 posts
1 ad
5 posts
1 ad

```

즉

```

10 posts + 2 ads

```

---

## 2.3 빈 데이터 처리

0건일 경우

```

nothing happened

```

스타일

```

중앙 정렬
이탤릭

```

---

## 2.4 Post Card 표시 규칙

카드 스타일

```

Wave 기본
image left + text right

```

표시 정보

```

date • reading time
primary tag
title
excerpt

```

excerpt

```

2~3줄 clamp

```

---

# 3. Navigation 화면 설계

## 3.1 헤더 항목 순서

```

Logo
Tech Docs
Tech Gear
UI & UX
Readium

* more
  Series
  Search
  Theme toggle
  Sign in
  Subscribe

```

---

## 3.2 카테고리 메뉴

프라이머리태그 4개

```

Tech Docs
Tech Gear
UI & UX
Readium

```

동작

```

/tag/{tagid}

```

이동

---

## 3.3 +more

이동

```

/categories

```

---

## 3.4 Series

이동

```

/series

```

---

## 3.5 Search

이동

```

/search

```

---

# 4. 화면별 레이아웃

---

# 4.0 Home 페이지

URL

```

/

```

목적

- 블로그 아이덴티티 전달
- 최신 포스트 제공

---

## 레이아웃

```

HEADER

INTRO BLOCK

POST LIST

PAGINATION

```

---

## Intro Block

구성

```

site logo
site title
site description

```

정렬

```

중앙 정렬

```

높이

```

160~180px

```

Hero 이미지 사용하지 않는다.

---

## Post List

최신 글 순

```

10 posts

```

광고 삽입

```

5 posts
ad
5 posts
ad

```

---

# 4.1 Tag 페이지

URL

```

/tag/{tagid}

```

카테고리 페이지와 시리즈 페이지는 동일한 UI 구조를 사용한다.

---

## 레이아웃

```

tag image
tag name
description

featured post

posts

pagination

```

---

## Featured Post 규칙

선정 기준

```

1순위 feature this post = true
2순위 해당 tag 최신 포스트

```

표시 개수

```

1개

```

---

# 4.2 Categories 페이지

URL

```

/categories

```

---

## 목적

카테고리 허브

---

## 데이터 규칙

카테고리 = 프라이머리태그

---

## 레이아웃

```

title

featured category

categories list

```

---

# 4.3 Series 페이지

URL

```

/series

```

---

## 데이터 규칙

대상 태그

```

#series-*

```

---

## 레이아웃

```

title

featured series

series list

```

---

## 이동

시리즈 클릭 시

```

/tag/hash-series-{seriesid}

```

---

# 4.4 Post 페이지

URL

```

/{slug}

```

---

## 레이아웃

```

POST HEADER

CONTENT

POST FOOTER

```

---

## Post Header

구성

```

primary tag

title

date • reading time

```

feature image는 **있을 때만 표시**

---

## TOC

우측 플로팅 아이콘

동작

```

hover → TOC 패널 확장

```

heading이 없으면 표시하지 않는다.

---

## Series Navigation

조건

```

#series-* 태그 존재

```

순서 기준

```

published date ascending

```

UI

```

← 이전 글
다음 글 →

```

---

## Related Posts

추천 규칙

```

1순위
primary tag 1개 일치
+
secondary tag 2개 일치

2순위
primary tag 1개
+
secondary tag 1개

3순위
primary tag 1개

```

표시 개수

```

최대 3개

```

---

# 5 이미지 정책

## Feature Image

포스트 카드에서 사용

없을 경우

```

Wave 기본 placeholder

```

---

## Tag Image

카테고리 / 시리즈 페이지 헤더에서 사용

---

## Home Intro

Hero 이미지 사용하지 않는다.

---

# 6 Template 구조

Wave 테마 기준 주요 템플릿

```

default.hbs
index.hbs
post.hbs
tag.hbs
page.hbs
author.hbs
blog.hbs
rss.hbs

```

---

## 주요 partial

```

partials/loop.hbs
partials/post-meta.hbs
partials/feature-image.hbs

```

---

# 7 Routing 구조

routes.yaml

```

/categories
/series
/search

```

커스텀 페이지

```

page-categories.hbs
page-series.hbs
page-search.hbs

```

---

# 문서 상태

상태

```

Final

```

문서명

```

기술 블로그 화면설계서 v2

```
```