
# Ghost Codex Implementation Spec

이 문서는 Codex(또는 다른 AI coding agent)가 실제 구현 작업을 수행할 때 사용하는 **작업 실행 문서**이다.

참고 문서

- UX / 정보구조 설계 → ghost-blog-spec.md
- 테마 구현 설계 → ghost-theme-implementation.md


---

# Implementation Steps

## Step 1 — Home 구조 수정

파일

index.hbs

작업

- Wave 기본 hero cover 유지 (default.hbs 기본 동작 사용)
- site-intro partial 삽입

목표 구조

Header
Site Intro
Post Loop


---

## Step 2 — site-intro partial 생성

파일

partials/site-intro.hbs

구성

logo
blog title
blog description

스타일

- height: 160~180px
- text-align: center


---

## Step 3 — Navigation 수정

파일

default.hbs

메뉴

Tech Docs
Tech Gear
UI & UX
Readium
+More
Series
Search


---

## Step 4 — Series Navigation

파일

partials/series-nav.hbs

규칙

tag: #series-*

정렬

publish date


---

## Step 5 — Related Posts

파일

partials/related-posts.hbs

우선순위

1. primary tag + secondary tag 2
2. primary tag + secondary tag 1
3. primary tag

max: 3


---

# Execution Order

1 index.hbs 수정
2 site-intro partial 생성
3 navigation 수정
4 series navigation 구현
5 related posts 구현
6 toc 구현
7 search 페이지 생성


---

status: draft
