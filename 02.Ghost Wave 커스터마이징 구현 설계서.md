# Ghost Wave 커스터마이징 구현 설계서 v1

```markdown
# Ghost Wave 커스터마이징 구현 설계서 v1

## 0. 문서 목적

본 문서는 **기술 블로그 화면설계서 v2**를 기반으로  
Ghost Wave 테마를 실제로 커스터마이징하기 위한 **구현 설계 문서**이다.

본 문서는 다음 내용을 정의한다.

- 수정 대상 템플릿
- 신규 partial
- routes.yaml 구성
- CSS 변경 위치
- Javascript 기능 추가
- 기능별 구현 전략

---

# 1. 테마 구조

Wave 테마 주요 파일 구조

```

default.hbs
index.hbs
post.hbs
tag.hbs
page.hbs
author.hbs
blog.hbs
rss.hbs

partials/
loop.hbs
post-meta.hbs
feature-image.hbs

```

---

# 2. 수정 대상 파일

| 파일 | 목적 |
|----|----|
index.hbs | Home 페이지 수정
post.hbs | Post 페이지 기능 추가
tag.hbs | Tag 페이지 레이아웃 유지/보강
routes.yaml | 커스텀 페이지 라우팅
partials/loop.hbs | Post card 구조
partials/post-meta.hbs | 메타 정보 표시

---

# 3. 신규 Partial 설계

추가할 partial

```

partials/site-intro.hbs
partials/series-nav.hbs
partials/post-toc.hbs
partials/related-posts.hbs

```

---

# 4. Home 페이지 구현

## 수정 파일

```

index.hbs

```

---

## 변경 내용

Wave 기본 구조

```

Hero Cover

```

제거

---

## 신규 구조

```

HEADER

SITE INTRO

POST LOOP

```

---

## index.hbs 구조

```

{{> site-intro}}

{{> loop}}

```

---

# 5. Site Intro Partial

파일

```

partials/site-intro.hbs

```

구조

```

<section class="site-intro">

```
{{#if @site.logo}}
    <img src="{{@site.logo}}" class="site-logo">
{{/if}}

<h1 class="site-title">
    {{@site.title}}
</h1>

<p class="site-description">
    {{@site.description}}
</p>
```

</section>
```

---

## CSS 위치

```
assets/css/site/layout.css
```

---

## 스타일 정책

높이

```
160~180px
```

정렬

```
center
```

---

# 6. Tag 페이지

파일

```
tag.hbs
```

---

## 구조

```
tag header
featured post
post list
pagination
```

---

## tag header

```
tag image
tag name
tag description
```

---

## featured post

조건

```
feature=true
```

없을 경우

```
최신 포스트
```

---

# 7. Post 페이지

파일

```
post.hbs
```

---

## 레이아웃

```
POST HEADER
POST CONTENT
POST FOOTER
```

---

## POST HEADER

```
primary tag

title

date • reading time
```

---

## Feature Image

```
있을 때만 표시
```

---

# 8. TOC 구현

파일

```
partials/post-toc.hbs
```

---

## 동작

```
floating button
hover → toc panel open
```

---

## 구현

Javascript로 heading 파싱

대상

```
h2
h3
```

---

## JS 위치

```
assets/js/main.js
```

---

# 9. Series Navigation

파일

```
partials/series-nav.hbs
```

---

## 조건

```
#series-* 태그 존재
```

---

## 로직

같은 series tag 포스트 조회

```
발행일 기준
```

---

## UI

```
← previous
next →
```

---

# 10. Related Posts

파일

```
partials/related-posts.hbs
```

---

## 규칙

1순위

```
primary tag 1개
secondary tag 2개
```

2순위

```
primary tag 1개
secondary tag 1개
```

3순위

```
primary tag 1개
```

---

## 표시 개수

```
max 3
```

---

## 구현 방식

1차 후보

```
primary tag 기반 조회
```

2차 필터

```
secondary tag match
```

Javascript 사용 가능

---

# 11. Navigation 수정

파일

```
default.hbs
```

또는

```
partials/header
```

---

## 메뉴

```
Tech Docs
Tech Gear
UI & UX
Readium
+ more
Series
Search
```

---

## 링크

```
/tag/tech-docs
/tag/tech-gear
/tag/ui-ux
/tag/readium

/categories
/series
/search
```

---

# 12. routes.yaml

```
routes:

  /categories/:
    template: page-categories

  /series/:
    template: page-series

  /search/:
    template: page-search


collections:

  /:
    permalink: /{slug}/
    template: index


taxonomies:
  tag: /tag/{slug}/
  author: /author/{slug}/
```

---

# 13. Custom Page Template

신규 파일

```
page-categories.hbs
page-series.hbs
page-search.hbs
```

---

# 14. CSS 수정 위치

```
assets/css/site/layout.css
assets/css/site/header.css
assets/css/blog/post.css
```

---

# 15. Javascript 수정 위치

```
assets/js/main.js
```

추가 기능

```
TOC
Related posts scoring
Search
```

---

# 16. 구현 순서

개발 순서

```
1 routes.yaml 작성
2 index.hbs 수정
3 site-intro partial
4 navigation 수정
5 tag.hbs 확인
6 post.hbs 기능 추가
7 series navigation
8 related posts
9 TOC
10 search
```

---

# 문서 상태

```
Draft v1
```

문서명

```
Ghost Wave 커스터마이징 구현 설계서
```