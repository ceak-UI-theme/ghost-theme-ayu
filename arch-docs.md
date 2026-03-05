# Ghost Technical Blog Architecture Design

## Ghost Wave Theme 기반 기술 블로그 구조 설계 문서

Version: 1.0
Platform: Ghost CMS
Theme: Wave

---

# 1. 개요

본 문서는 **Ghost CMS 기반 기술 블로그의 구조 및 UX 설계**를 정의한다.

본 설계 문서는 다음 항목을 정의한다.

* 블로그 정보 구조 (Information Architecture)
* 콘텐츠 탐색 UX
* Series 중심 콘텐츠 구조
* 광고 정책
* 검색 시스템
* Ghost Wave 테마 커스터마이징 방향

목표

```
기술 블로그에 최적화된 정보 구조
Series 기반 콘텐츠 조직
카테고리 중심 탐색 UX
목차 / 검색 기능 강화
UX를 해치지 않는 광고 구조
```

---

# 2. 개발 환경

개발 환경

```
개발 환경: Windows 로컬
운영 환경: VPS
CMS: Ghost
Theme: Wave
```

---

# 3. URL 구조

블로그 주요 URL 구조

```
/                    → Homepage
/tag/{tag}           → Category page
/categories          → Category list
/series              → Series list
/series/{slug}       → Series hub
/search              → Search page
/search?q={query}    → Search results
/{post-slug}         → Post
```

---

# 4. 카테고리 구조

Ghost **Primary Tag**를 카테고리로 사용한다.

Primary Categories

```
Readium
Tech Docs
UI & Theme
Tech Gear
```

Secondary Tags

```
SEO 및 키워드 용도
자유롭게 사용
```

Internal Tags

Series 관리용 internal tag

```
#series-{slug}
```

예

```
#series-unix
#series-readium
```

---

# 5. 상단 네비게이션

Header Navigation

```
Readium | Tech Docs | UI & Theme | Tech Gear | +More | Series | 🔍 | 🌙
```

---

## 5.1 Primary Categories

각 항목은 Tag 페이지로 이동

```
/tag/readium
/tag/tech-docs
/tag/ui-theme
/tag/tech-gear
```

---

## 5.2 +More

모든 Primary Category 목록 페이지

```
/categories
```

---

## 5.3 Series

Series 목록 페이지

```
/series
```

---

## 5.4 Search

검색 페이지

```
/search
```

검색 아이콘은 **돋보기 아이콘**으로 표시한다.

---

## 5.5 Theme Toggle

Header 우측에 다크/라이트 토글 버튼을 배치한다.

---

# 6. Categories Page

URL

```
/categories
```

표시 대상

```
Primary Categories only
```

표시 정보

```
Tag title
Tag description
Post count
```

클릭 시 이동

```
/tag/{tag-slug}
```

UI

Wave 기본 카드 스타일을 재사용한다.

---

# 7. Series 시스템

Series는 Ghost **Internal Tag** 기반으로 관리한다.

Internal tag 규칙

```
#series-{slug}
```

예

```
#series-unix
#series-readium
```

---

## 7.1 Series URL

```
/series
/series/{slug}
```

예

```
/series/unix
/series/readium
```

---

## 7.2 Series 정렬 기준

Series 내부 포스트 정렬

```
publish date (old → new)
```

---

## 7.3 Series 목록 페이지

URL

```
/series
```

Series 카드 표시 정보

```
Series title
Series description
Series thumbnail
Post count
```

데이터 소스

```
internal tag
feature_image
description
```

썸네일

```
tag feature_image 사용
```

없을 경우

```
placeholder image
```

---

## 7.4 Series 허브 페이지

URL

```
/series/{slug}
```

구조

```
Series Header

Post List
```

Series Header 표시 정보

```
Series title
Series description
Series thumbnail
Post count
```

Post List

```
Wave 기본 post list
```

정렬

```
publish date (old → new)
```

---

# 8. 포스트 페이지 구조

포스트 페이지 레이아웃

```
Title
Meta

AD

Series Navigation

TOC

Content

AD

Series Prev / Next

Related Posts

Tags
```

---

# 9. Series Navigation

포스트 상단에 **접기형 Series TOC**를 표시한다.

기본 상태

```
Series Title ▼
```

클릭 시

```
Series post list
```

표시 정보

```
post title
order number
```

현재 포스트는 강조 표시한다.

정렬

```
publish date (old → new)
```

---

# 10. Series Prev / Next

포스트 하단에 시리즈 이전/다음 글 링크를 표시한다.

예

```
← Unix pipe explained

Unix redirect deep dive →
```

추가 정보

```
published X days later
```

---

# 11. Related Posts

표시 위치

```
Series Prev / Next 아래
```

표시 개수

```
4 posts
```

추천 기준

```
same primary tag
exclude current post
published_at DESC
```

---

# 12. TOC (Table of Contents)

TOC 생성 방식

```
tocbot
```

대상

```
article content
```

heading

```
h2
h3
```

---

## TOC UI

TOC는 **floating button + overlay** 방식으로 표시한다.

버튼 위치

```
bottom-right
offset: 24px
```

버튼 특징

```
항상 화면에 표시
스크롤 따라 이동
드래그 이동 가능
```

클릭 시

```
TOC overlay 표시
```

---

# 13. Homepage Layout

홈페이지 구조

```
Hero Post

Grid Posts (6)

AD

Grid Posts (6)

AD
```

Hero Post 선택 기준

```
1 featured=true post
2 latest post (fallback)
```

Hero는 광고 카운트에서 제외한다.

---

# 14. Category Page UX

적용 페이지

```
/tag/{primary-tag}
```

페이지 구조

```
Category Header

Featured Posts

Post List

AD
```

---

## Featured Posts

조건

```
featured=true
same tag
```

표시 개수

```
2 ~ 3 posts
```

없을 경우

```
latest posts fallback
```

---

# 15. 광고 정책

## 리스트 광고

적용 페이지

```
homepage
tag page
series page
```

규칙

```
6 posts마다 광고 1개
```

카운트 제외

```
Hero post
Featured posts
Series header
```

---

## 포스트 광고

위치

```
Meta 아래
본문 하단
```

총 개수

```
2 ads
```

---

# 16. 검색

검색 페이지

```
/search
```

검색 결과 URL

```
/search?q={query}
```

검색 방식

```
Ghost Content API
+ Fuse.js
```

검색 대상

```
title
excerpt
content
tags
```

검색 결과 표시

```
Wave 기본 post card
```

검색 페이지에는 광고를 삽입하지 않는다.

---

# 17. 폰트

폰트 로딩 방식

```
self-host
```

위치

```
/assets/fonts
```

사용 폰트

본문

```
NanumSquareRound
```

코드

```
JetBrains Mono
```

폰트 형식

```
woff2
```

---

# 18. 다크 / 라이트 테마

테마 정책

```
system preference
+ user toggle
+ localStorage
```

토글 위치

```
Header
```

동작

```
첫 방문 → OS 테마
사용자 변경 → localStorage 저장
```

초기 렌더링 시 **theme flash 방지 스크립트**를 적용한다.

---

# 19. SEO 구조

블로그는 **Topic Cluster 구조**를 형성한다.

예

```
/series/unix
 ├ stdout-stderr
 ├ pipe
 ├ redirect
```

카테고리는 **topic hub** 역할을 한다.

```
/tag/tech-docs
 ├ featured posts
 └ latest posts
```

---

# 20. 개발 대상 파일

Wave 테마 기준 수정 대상

```
partials/navigation.hbs
post.hbs
tag.hbs
index.hbs
assets/js/*
assets/css/*
assets/fonts/*
```

---

# 21. 구현 우선순위

권장 개발 순서

```
1 Navigation
2 Category page UX
3 Series system
4 Post layout
5 TOC
6 Search
7 Ads
8 Dark/Light theme
9 Font
```

---

# Document Version

```
Version: 1.0
Theme: Ghost Wave
Type: Blog Architecture Design
```
