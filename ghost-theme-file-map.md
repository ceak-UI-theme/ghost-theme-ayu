
# Ghost Theme File Map (Codex Assist)

이 문서는 Ghost Wave 테마 커스터마이징 시
**기능 → 수정 파일 → 설명**을 매핑한 문서이다.

Codex 또는 개발자가 실제 수정 위치를 빠르게 찾기 위한 목적이다.

---

# 1. Home

기능
Hero 제거 + Mini Intro

수정 파일

index.hbs

추가 파일

partials/site-intro.hbs

설명

Wave 기본 hero cover 제거 후
site intro 블록 삽입

---

# 2. Site Intro

파일

partials/site-intro.hbs

내용

logo
site title
site description

스타일

assets/css/site/layout.css

---

# 3. Post List

파일

partials/loop.hbs

설명

post card 렌더링

표시

date
reading time
primary tag
title
excerpt

---

# 4. 광고 삽입

파일

partials/loop.hbs

규칙

5 posts
ad
5 posts
ad

---

# 5. Navigation

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

스타일

assets/css/site/header.css

---

# 6. Tag Page

파일

tag.hbs

구성

tag header
featured post
post list

---

# 7. Post Page

파일

post.hbs

구성

post header
content
footer

---

# 8. Post Header

파일

post.hbs

구성

primary tag
title
date • reading time

메타

partials/post-meta.hbs

---

# 9. TOC

파일

partials/post-toc.hbs

스크립트

assets/js/main.js

동작

heading parsing

h2
h3

---

# 10. Series Navigation

파일

partials/series-nav.hbs

규칙

tag

#series-*

정렬

publish date

---

# 11. Related Posts

파일

partials/related-posts.hbs

추천 규칙

1 primary + secondary 2
2 primary + secondary 1
3 primary

max

3

---

# 12. Categories Page

파일

page-categories.hbs

라우팅

routes.yaml

URL

/categories

---

# 13. Series Page

파일

page-series.hbs

라우팅

routes.yaml

URL

/series

---

# 14. Search Page

파일

page-search.hbs

라우팅

routes.yaml

스크립트

assets/js/main.js

---

# 15. CSS

주요 위치

assets/css/site/layout.css
assets/css/site/header.css
assets/css/blog/post.css
assets/css/blog/feed.css

---

# 16. Javascript

파일

assets/js/main.js

기능

toc
related posts scoring
search

---

# Document Status

version: v1
purpose: Codex assist
