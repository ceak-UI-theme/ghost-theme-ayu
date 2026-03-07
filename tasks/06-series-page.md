# Task 06 — Series Page (/series/ + /series/?series={slug})

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

Series 페이지를 구현한다.

Series 페이지는 하나의 경로(`/series/`)를 사용하되,
query parameter 유무에 따라 두 가지 모드로 동작한다.

1. Series Hub Mode
   - URL: `/series/`
   - 전체 series 목록 표시

2. Series Detail Mode
   - URL: `/series/?series={slug}`
   - 해당 series의 post archive 표시

---

## 2. Series 저장 규칙

Series는 Ghost internal tag로 관리한다.

형식

`#series-{slug}`

예

- `#series-readium`
- `#series-unix`
- `#series-ai-dev`

internal tag 자체 URL(`/tag/hash-series-*`)는 사용자에게 노출하지 않는다.

---

## 3. 핵심 구현 규칙

Ghost 템플릿은 query parameter를 직접 다루기 어렵다.

따라서 `/series/` 페이지는 다음 방식으로 구현한다.

- 서버 템플릿: `/series/` 기본 shell 렌더링
- 클라이언트 JS:
  - `location.search` 읽기
  - `series` query parameter 확인
  - query가 없으면 Series Hub 렌더링
  - query가 있으면 Series Detail 렌더링

즉 Series Detail 렌더링은 **클라이언트 JS 기반**으로 구현한다.

---

## 4. URL 구조

### Series Hub
`/series/`

### Series Detail
`/series/?series={slug}`

예

- `/series/?series=readium`
- `/series/?series=unix`

---

## 5. Series Hub Page

### 목적
전체 series 목록 표시

### UI 구조

Series

Tags starting with #series-

Featured series

[series card]

All series

[series card]
[series card]
[series card]

### 표시 데이터
- series name
- post count
- cover image (있으면)
- description (있으면)

### 링크
각 card 클릭 시

`/series/?series={slug}`

예

`/series/?series=readium`

---

## 6. Series Detail Page

### 목적
해당 series의 post archive 표시

### UI 구조

Series Header

Featured post

Latest posts

### 세부 구조 예

Series

readium

3 posts

Featured post

[post card]

Latest posts

[post card]
[post card]
[post card]

---

## 7. Series Detail 동작 방식

브라우저 JS에서 다음 순서로 처리한다.

1. `location.search`에서 `series` 읽기
2. 예: `readium`
3. internal tag로 변환
   - `#series-readium`
4. 해당 internal tag에 속한 post 목록 조회
5. Featured post 선택
6. 나머지 post list 렌더링

---

## 8. Query Parameter 처리 규칙

JS에서 아래 방식으로 처리한다.

예시 개념

```js
const params = new URLSearchParams(window.location.search);
const seriesSlug = params.get("series");
````

* `seriesSlug`가 없으면 Hub Mode
* `seriesSlug`가 있으면 Detail Mode

---

## 9. Data Fetch 방식

Ghost theme만으로 모든 데이터를 직접 조회하기 어렵다면,
다음 중 repo 구조에 맞는 현실적인 방법을 사용한다.

우선순위

1. 기존 Ghost theme data 접근 방식 재사용
2. Ghost Content API 사용
3. 페이지 내 preload 가능한 데이터 활용

### 구현 원칙

* 현재 Wave 구조를 최대한 유지
* 과도한 외부 라이브러리 금지
* vanilla JS 우선

---

## 10. Featured Post 규칙

Series Detail에서 Featured post는 아래 우선순위로 선택한다.

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

Series Detail 페이지의 Post UI는
Home / Tag 페이지와 동일한 post card UI를 재사용한다.

즉

* post card partial 재사용
* 디자인 톤 일관성 유지

---

## 13. Series Header 규칙

Series Detail 상단에는 다음 정보를 표시한다.

* Series
* series name
* post count

예

Series

readium

3 posts

---

## 14. 수정 대상 파일

예상 수정 파일

* `page-series.hbs` 또는 `series.hbs` (현재 routes.yaml 구조에 맞는 실제 파일 사용)
* `assets/js/series-page.js`
* `assets/css/series.css`
* `partials/series-card.hbs`
* (필요시) `partials/post-card.hbs`

---

## 15. 구현 단계

1. `/series/`에 연결된 템플릿 확인
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

## 16. 에러 처리

다음 상황을 처리해야 한다.

### series query 없음

* Hub 모드 표시

### 잘못된 slug

예: `/series/?series=not-exists`

* “nothing happened” 또는 “Series not found” 메시지 표시

### post 0개

* 빈 상태 메시지 표시

---

## 17. 모바일 대응

* 카드형 UI 유지
* 지나치게 넓은 2단 레이아웃 금지
* 작은 화면에서는 1열 구조 사용

---

## 18. 검증 방법

테스트 URL

`http://172.22.0.199:2368/series/`

확인

1. series hub 표시
2. featured series 표시
3. series card 링크 정상

테스트 URL

`http://172.22.0.199:2368/series/?series=readium`

확인

1. series detail 표시
2. featured post 표시
3. latest posts 표시
4. query parameter 동작 정상
5. 잘못된 slug 처리 정상

---

## 19. 작업 결과 보고 형식

### 작업 요약

(1~2 문장)

### 변경 파일

* ...
* ...

### 주요 구현

* query parameter parsing
* hub/detail mode split
* series archive rendering

### 체크리스트

* [ ] `/series/` hub 정상
* [ ] `/series/?series={slug}` detail 정상
* [ ] internal tag 직접 노출 안 함
* [ ] featured post 규칙 적용
* [ ] invalid slug 처리# `tasks/05-post-navigation.md` (최종 통합 버전)

```md
# Task 05 — Post Page Navigation (Series + Global Prev/Next)

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

Post 페이지 하단에 다음 두 가지 navigation을 구현한다.

1️⃣ Series Navigation  
2️⃣ Global Prev / Next Post Navigation

---

# 2. Post 페이지 구조

Post 페이지 하단 구조는 다음과 같다.

```

## Post Header

본문

---

Series Navigation

---

Post Navigation
(Prev / Next)

---

```

즉 순서는 다음과 같다.

```

본문
↓
Series navigation
↓
Prev / Next navigation

```

---

# 3. Series 저장 규칙

Series는 Ghost **internal tag**로 관리한다.

형식

```

#series-{slug}

```

예

```

#series-readium
#series-unix
#series-ai-dev

```

internal tag는 **사용자에게 직접 노출하지 않는다.**

---

# 4. Series URL 규칙

Series 페이지는 다음 URL 구조를 사용한다.

```

/series/
/series/?series={slug}

```

예

```

/series/?series=readium
/series/?series=unix

```

internal tag URL (`/tag/hash-series-*`) 은 사용하지 않는다.

---

# 5. 현재 Post의 Series 찾기

현재 Post의 tag 목록에서

```

#series-

```

prefix를 가진 internal tag를 찾는다.

예

```

#series-readium

```

→ series slug

```

readium

```

---

# 6. Series Post 목록 조회

같은 series의 post 목록은 다음 조건으로 조회한다.

조건

```

tag = #series-{slug}

```

정렬

```

publish date ASC

```

즉 시리즈는 **연재 순서 기준**이다.

---

# 7. Series Navigation UI

Series Navigation은 다음 형태로 표시한다.

```

Series: Readium Development

1. Readium 프로젝트 시작
2. Domain 설계 붕괴
3. Timeline 설계
4. Reading Session 모델링   ← 현재 글
5. UI 구조 설계

```

현재 글은

```

active

```

class로 표시한다.

---

# 8. Series Navigation 동작

각 항목은 해당 Post로 이동한다.

예

```

/readium-domain-design/
/readium-session-model/

```

---

# 9. Series가 없는 Post

Post가 series에 속하지 않으면

```

Series Navigation

```

영역은 표시하지 않는다.

즉

```

본문
↓

Prev / Next

```

구조만 유지한다.

---

# 10. Global Post Navigation

Series Navigation 아래에는
Global Prev / Next Navigation을 표시한다.

이 navigation은

```

전체 블로그 기준

```

으로 동작한다.

기준

```

publish date

```

---

# 11. Prev / Next UI

예

```

---

← Previous Post

Unix 파이프의 탄생 이야기

Next Post →

Everything is a file

---

```

---

# 12. Prev / Next 구현

Ghost 기본 helper를 사용한다.

```

{{#prev_post}}
{{/prev_post}}

{{#next_post}}
{{/next_post}}

```

또는

```

{{prev_post}}
{{next_post}}

```

---

# 13. 수정 대상 파일

예상 수정 파일

```

post.hbs
partials/post-navigation.hbs
partials/series-navigation.hbs
assets/css/post-navigation.css

```

---

# 14. 구현 단계

순서

1️⃣ post.hbs 구조 확인

2️⃣ 본문 아래 Series Navigation 영역 추가

3️⃣ 현재 Post tag 목록에서 `#series-` 찾기

4️⃣ series slug 추출

5️⃣ 같은 series post 목록 조회

6️⃣ publish date ASC 정렬

7️⃣ 현재 글 active 표시

8️⃣ Global Prev / Next navigation 구현

---

# 15. 검증 방법

테스트 페이지

```

[http://172.22.0.199:2368/readium-domain-design/](http://172.22.0.199:2368/readium-domain-design/)

```

확인 사항

1️⃣ series navigation 표시  
2️⃣ series 순서 정상  
3️⃣ 현재 글 active 표시  
4️⃣ prev / next 정상 동작  
5️⃣ 모바일 레이아웃 정상  

---

# 16. 작업 결과 보고 형식

## 작업 요약

(1~2 문장)

## 변경 파일

- post.hbs
- partials/series-navigation.hbs
- partials/post-navigation.hbs
- assets/css/post-navigation.css

## 주요 구현

- series navigation
- internal tag parsing
- global prev/next

## 체크리스트

- [ ] internal tag 인식
- [ ] series 목록 생성
- [ ] active 표시
- [ ] prev / next 정상