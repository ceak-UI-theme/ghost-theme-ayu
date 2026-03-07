# `tasks/05-post-navigation.md` (최종 통합 버전)

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