
# Ghost Theme Repository Structure (Wave Customization)

이 문서는 Wave 테마를 기반으로 Ghost 블로그를 커스터마이징할 때
**추천되는 테마 저장소 구조**를 정의한다.

목적

- 테마 구조 표준화
- partial / css / js 위치 명확화
- 유지보수 용이성 확보
- Codex 작업 정확도 향상

---

# 1. 전체 디렉토리 구조

추천 구조

```
ghost-theme/

assets/
  css/
    site/
      layout.css
      header.css
    blog/
      post.css
      feed.css
    general/
      vars.css
      fonts.css

  js/
    main.js

  fonts/
  images/

partials/

  site-intro.hbs
  series-nav.hbs
  related-posts.hbs
  post-toc.hbs

  loop.hbs
  post-meta.hbs
  feature-image.hbs

default.hbs
index.hbs
post.hbs
tag.hbs
page.hbs

page-categories.hbs
page-series.hbs
page-search.hbs

routes.yaml
package.json
```

---

# 2. Template 역할

## default.hbs

공통 레이아웃

포함

```
header
footer
theme toggle
global css
```

---

## index.hbs

Home 페이지

구조

```
header
site intro
latest posts
pagination
```

Wave 기본 Hero cover를 유지한다. (cover_image 설정 시 표시)

---

## post.hbs

개별 포스트 페이지

구조

```
post header
feature image
content
toc
series navigation
related posts
```

---

## tag.hbs

카테고리 / 시리즈 페이지

구조

```
tag header
featured post
post list
pagination
```

---

## page.hbs

Ghost 기본 페이지

예

```
about
contact
```

---

# 3. Custom Page Template

Ghost routes.yaml을 통해 연결된다.

## page-categories.hbs

URL

```
/categories
```

기능

```
primary tag list
```

---

## page-series.hbs

URL

```
/series
```

기능

```
series tag list
```

---

## page-search.hbs

URL

```
/search
```

기능

```
post 검색
```

---

# 4. Partials

Partial은 재사용 UI 블록이다.

## site-intro.hbs

Home intro block

구성

```
logo
title
description
```

---

## series-nav.hbs

Series navigation

```
previous
next
```

---

## related-posts.hbs

추천 포스트

```
max 3
```

---

## post-toc.hbs

목차

```
h2
h3
```

---

## loop.hbs

Post card renderer

---

## post-meta.hbs

메타 정보

```
date
reading time
primary tag
```

---

# 5. CSS 구조

CSS는 기능 단위로 분리한다.

## site/

레이아웃

```
layout.css
header.css
```

---

## blog/

콘텐츠 UI

```
post.css
feed.css
```

---

## general/

전역 설정

```
vars.css
fonts.css
```

---

# 6. Javascript

파일

```
assets/js/main.js
```

기능

```
toc
related posts scoring
search
```

---

# 7. Assets

## fonts

```
NanumSquareRound
JetBrains Mono
```

---

## images

```
logo
tag images
```

---

# 8. Routing

routes.yaml

```
/categories
/series
/search
```

연결

```
page-categories.hbs
page-series.hbs
page-search.hbs
```

---

# 9. 유지보수 규칙

원칙

```
UI → partial
페이지 구조 → template
로직 → js
스타일 → css
```

---

# 10. 개발 권장 흐름

```
UX Spec
→ Implementation Spec
→ File Map
→ Codex Spec
→ Dev Checklist
→ Repo Structure
```

---

status: draft
purpose: repository design
