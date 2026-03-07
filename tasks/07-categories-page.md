# Task 07 — Categories Page (/categories/ + /categories/?tag={slug})

모든 설명과 보고는 한국어로 작성한다.  
코드와 파일명은 영어를 사용한다.

---

## 0. 사전 읽기 문서

다음 문서를 먼저 읽고 작업을 수행한다.

- codex-context.md
- ghost-blog-spec.md
- ghost-theme-implementation.md
- ghost-theme-file-map.md
- ghost-theme-dev-checklist.md

---

## 1. 작업 목표

Categories 페이지를 구현한다.

Categories 페이지는 하나의 경로(`/categories/`)를 사용하되,
query parameter 유무에 따라 두 가지 모드로 동작한다.

1. Categories Hub Mode
   - URL: `/categories/`
   - primary tag 목록 표시

2. Category Detail Mode
   - URL: `/categories/?tag={slug}`
   - 해당 category의 post archive 표시

---

## 2. Category 정의 규칙

Category는 Ghost tag 중에서도 다음 조건을 만족하는 **primary tag** 를 의미한다.

- 포스트의 첫 번째 태그
- 블로그 네비게이션 및 category 구조에서 사용하는 대표 태그

현재 대표 category slug 예시

- `tech-docs`
- `tech-gear`
- `ui-ux`
- `readium`

> 구현 시에는 “실제로 primary tag로 사용된 tag 집합” 기준으로 목록을 구성한다.

---

## 3. 핵심 구현 규칙

Ghost 템플릿은 query parameter를 직접 다루기 어렵다.

따라서 `/categories/` 페이지는 다음 방식으로 구현한다.

- 서버 템플릿: `/categories/` 기본 shell 렌더링
- 클라이언트 JS:
  - `location.search` 읽기
  - `tag` query parameter 확인
  - query가 없으면 Categories Hub 렌더링
  - query가 있으면 Category Detail 렌더링

즉 Category Detail 렌더링은 **클라이언트 JS 기반**으로 구현한다.

---

## 4. URL 구조

### Categories Hub
`/categories/`

### Category Detail
`/categories/?tag={slug}`

예

- `/categories/?tag=tech-docs`
- `/categories/?tag=readium`

---

## 5. Categories Hub Page

### 목적
전체 primary tag 목록 표시

### UI 구조

Categories

Primary tags used in posts

Featured category

[category card]

All categories

[category card]
[category card]
[category card]

### 표시 데이터
- category name
- post count
- feature image (있으면)
- description (있으면)

### 링크
각 category card 클릭 시

`/categories/?tag={slug}`

예

`/categories/?tag=tech-docs`

---

## 6. Category Card UI

Category Card는 다음 구조를 사용한다.

```

[category cover]

CATEGORY | 12 POSTS

Tech Docs

Tag archive

````

표시 요소

- category name
- post count
- cover image (optional)
- description (optional)

> Category card는 Series card와 동일한 톤/구조를 사용한다.

---

## 7. Category Detail Page

### 목적
해당 category의 post archive 표시

### UI 구조

Category Header

Featured post

Latest posts

### 세부 구조 예

Category

Tech Docs

12 posts

Featured post

[post card]

Latest posts

[post card]
[post card]
[post card]

---

## 8. Category Detail 동작 방식

브라우저 JS에서 다음 순서로 처리한다.

1. `location.search`에서 `tag` 읽기
2. 예: `tech-docs`
3. 해당 tag slug를 기준으로 post 목록 조회
4. Featured post 선택
5. 나머지 post list 렌더링

---

## 9. Query Parameter 처리 규칙

JS에서 아래 방식으로 처리한다.

예시 개념

```js
const params = new URLSearchParams(window.location.search);
const tagSlug = params.get("tag");
````

* `tagSlug`가 없으면 Hub Mode
* `tagSlug`가 있으면 Detail Mode

---

## 10. Featured Post 규칙

Category Detail에서 Featured post는 아래 우선순위로 선택한다.

1. `featured=true` post
2. 없으면 최신 post

즉

* featured post
* 없으면 latest post

---

## 11. Latest Posts 규칙

Featured post 아래에는 나머지 post 목록을 표시한다.

정렬

`publish date DESC`

Featured post는 목록에서 제외한다.

---

## 12. Post Card UI 규칙

Category Detail 페이지의 Post UI는
Home / Tag / Series 페이지와 동일한 post card UI를 재사용한다.

즉

* post card partial 재사용
* 디자인 톤 일관성 유지

---

## 13. Category Header 규칙

Category Detail 상단에는 다음 정보를 표시한다.

* Category
* category name
* post count

예

Category

Tech Docs

12 posts

---

## 14. Categories Hub 규칙

Hub에서는 **primary tag로 실제 사용된 태그만** 표시한다.

즉 일반 tag 전체를 보여주지 않는다.

### 제외 대상

* internal tag (`#series-*`)
* 세컨드태그
* primary tag로 사용되지 않은 태그

---

## 15. 수정 대상 파일

예상 수정 파일

* `page-categories.hbs` 또는 `categories.hbs` (현재 routes.yaml 구조에 맞는 실제 파일 사용)
* `assets/js/categories-page.js`
* `assets/css/categories.css`
* `partials/category-card.hbs`
* (필요시) `partials/post-card.hbs`

---

## 16. 구현 단계

1. `/categories/`에 연결된 템플릿 확인
2. Hub / Detail 공용 shell 구성
3. JS 파일 생성
4. query parameter parsing 구현
5. Hub 모드 렌더링 구현
6. Detail 모드 렌더링 구현
7. featured post 선택 규칙 구현
8. latest posts 렌더링
9. CSS 적용
10. 빌드 및 검증

---

## 17. 에러 처리

다음 상황을 처리해야 한다.

### tag query 없음

* Hub 모드 표시

### 잘못된 slug

예: `/categories/?tag=not-exists`

* “nothing happened” 또는 “Category not found” 메시지 표시

### post 0개

* 빈 상태 메시지 표시

---

## 18. 모바일 대응

* 카드형 UI 유지
* 지나치게 넓은 2단 레이아웃 금지
* 작은 화면에서는 1열 구조 사용

---

## 19. 검증 방법

테스트 URL

`http://172.22.0.199:2368/categories/`

확인

1. categories hub 표시
2. featured category 표시
3. category card 링크 정상

테스트 URL

`http://172.22.0.199:2368/categories/?tag=tech-docs`

확인

1. category detail 표시
2. featured post 표시
3. latest posts 표시
4. query parameter 동작 정상
5. 잘못된 slug 처리 정상

---

## 20. 작업 결과 보고 형식

### 작업 요약

(1~2 문장)

### 변경 파일

* ...
* ...

### 주요 구현

* query parameter parsing
* hub/detail mode split
* category archive rendering

### 체크리스트

* [ ] `/categories/` hub 정상
* [ ] `/categories/?tag={slug}` detail 정상
* [ ] primary tag만 표시
* [ ] featured post 규칙 적용
* [ ] invalid slug 처리