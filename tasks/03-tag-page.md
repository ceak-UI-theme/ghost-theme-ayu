# `tasks/03-tag-page.md`

경로

```
ghost-theme-ayu/tasks/03-tag-page.md
```

---

```md
# Task 03 — Tag Page 레이아웃 및 Featured Post 규칙

모든 설명과 보고는 한국어로 작성한다.  
코드와 파일명은 영어를 사용한다.

---

# 0. 사전 읽기 문서

다음 문서를 먼저 읽고 작업을 수행한다.

- codex-context.md
- ghost-blog-spec.md
- ghost-theme-implementation.md
- ghost-theme-file-map.md
- ghost-theme-dev-checklist.md

---

# 1. 작업 목표

Ghost의 Tag 페이지(`/tag/{slug}/`) 레이아웃을
기술 블로그용 구조로 정리한다.

기본 Wave Tag 페이지는 단순한 post list 구조이다.

이번 작업에서는 다음 구조를 사용한다.

```

Tag Header
├ Tag name
├ Tag description
└ Tag image (optional)

Featured Post (1)

Post List

Pagination

```

---

# 2. 영향 페이지

Tag 페이지

```

/tag/{slug}/

```

예

```

/tag/tech-docs/
/tag/tech-gear/
/tag/ui-ux/
/tag/readium/

```

---

# 3. Tag Header 구조

Tag 페이지 상단에는 Tag 정보를 표시한다.

표시 요소

```

tag name
tag description
tag feature image (optional)

```

Ghost 템플릿 변수

```

{{tag.name}}
{{tag.description}}
{{tag.feature_image}}

```

레이아웃

```

Tag title
Tag description

```

이미지는 있을 경우만 표시한다.

---

# 4. Featured Post 규칙

Tag 페이지 상단에는 Featured Post를 하나 표시한다.

선택 규칙

우선순위

1️⃣ `feature=true` 인 post

2️⃣ 없다면 최신 post

즉

```

featured post
or
latest post

```

Featured Post는 일반 Post Card보다 크게 표시한다.

레이아웃 예

```

Featured Post

[image]

title
excerpt
date
reading time

```

---

# 5. Post List

Featured Post 아래에는
일반 Post 리스트를 표시한다.

구조

```

post card
post card
post card
...

```

UI는 **Home Post 카드와 동일한 UI**를 사용한다.

즉

- image
- title
- excerpt
- date
- reading time

---

# 6. Featured Post 중복 방지

Featured Post로 표시된 post는

Post List에서 다시 나타나지 않아야 한다.

즉

```

featured post
↓
post list (featured 제외)

```

---

# 7. Pagination

Tag 페이지 하단에는 Pagination을 유지한다.

```

page 1
page 2
page 3

```

Ghost 기본 pagination을 사용한다.

---

# 8. 수정 대상 파일

예상 수정 파일

```

tag.hbs
partials/post-card.hbs
assets/css/tag.css

```

---

# 9. 생성 파일

필요 시 다음 파일 생성 가능

```

partials/featured-post.hbs

```

단, 기존 post-card를 재사용할 수 있다면 재사용한다.

---

# 10. 구현 가이드

작업 순서

1️⃣ 현재 `tag.hbs` 구조 분석

2️⃣ Tag Header 영역 구성

3️⃣ Featured Post 선택 로직 구현

4️⃣ Featured Post UI 추가

5️⃣ Post list에서 Featured Post 제외

6️⃣ Pagination 유지

---

# 11. Featured Post 구현 힌트

Ghost에서는 다음 구조로 구현할 수 있다.

예시

```

{{#foreach posts limit="1"}}
featured post
{{/foreach}}

{{#foreach posts from="2"}}
post list
{{/foreach}}

```

또는 feature flag를 활용할 수 있다.

---

# 12. 검증 방법

테스트 URL

```

[http://172.22.0.199:2368/tag/tech-docs/](http://172.22.0.199:2368/tag/tech-docs/)

```

확인 사항

1️⃣ Tag header 표시

2️⃣ Featured Post 표시

3️⃣ Featured Post가 Post List에 중복되지 않음

4️⃣ Post list 정상 표시

5️⃣ Pagination 동작

6️⃣ 모바일 레이아웃 정상

---

# 13. 작업 결과 보고 형식

작업 완료 후 다음 형식으로 보고한다.

## 작업 요약

(1~2 문장)

## 변경된 파일

- tag.hbs
- partials/featured-post.hbs
- assets/css/tag.css

## 주요 변경

- Tag header 추가
- Featured Post 구현
- Post list 중복 제거

## 검증 방법

1.
2.
3.

## 체크리스트

- [ ] Featured Post 규칙 적용
- [ ] Post UI 통일 유지
- [ ] Pagination 유지
- [ ] Wave 구조 유지