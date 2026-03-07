# `tasks/04-post-toc.md`

경로

```
ghost-theme-ayu/tasks/04-post-toc.md
```

---

```md
# Task 04 — Post Page Floating TOC 구현

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

Post 페이지에 **Floating TOC (Table of Contents)** 를 구현한다.

TOC는 다음 특징을 가진다.

- h2, h3 heading 기반
- 스크롤 따라 이동
- 클릭 시 해당 section으로 이동
- 현재 위치 highlight (scroll spy)

---

# 2. 적용 페이지

Post 상세 페이지

```

/{post-slug}/

```

예

```

/unix-stdout-stderr/

```

---

# 3. UI 위치

TOC 위치

```

우측 하단 floating

```

특징

```

스크롤 따라 이동
마우스로 이동 가능

```

즉

```

position: fixed

```

구조 예

```

┌───────────────────────┐
│  On this page         │
│                       │
│  1. Unix의 출력 구조  │
│     stdout과 stderr   │
│  2. 파이프의 탄생     │
│  3. stderr 분리 이유  │
│                       │
└───────────────────────┘

```

---

# 4. TOC 생성 대상

TOC는 다음 heading만 사용한다.

```

h2
h3

```

제외

```

h1
h4
h5
h6

```

---

# 5. TOC 생성 방식

TOC는 **JavaScript로 생성한다.**

HTML 내부에서

```

.post-content

```

영역을 스캔하여 heading을 수집한다.

예

```

document.querySelectorAll(".post-content h2, .post-content h3")

```

---

# 6. Heading Anchor 생성

각 heading에는 id가 필요하다.

예

```

<h2 id="unix-output">Unix Output</h2>
```

id가 없으면 자동 생성한다.

예

```
heading text -> slug
```

예

```
Unix Output -> unix-output
stderr 분리 -> stderr-분리
```

---

# 7. TOC DOM 구조

생성되는 DOM 예

```
<div class="post-toc">

  <div class="toc-title">
    On this page
  </div>

  <ul>
    <li>
      <a href="#unix-output">Unix Output</a>
    </li>

    <li class="toc-h3">
      <a href="#stderr">stderr</a>
    </li>

  </ul>

</div>
```

---

# 8. Scroll Spy

현재 섹션을 highlight한다.

조건

```
heading이 viewport 상단 근처에 들어오면 active
```

active class

```
active
```

예

```
<li class="active">
```

---

# 9. Floating 동작

TOC는 화면 우측 하단에 고정된다.

CSS

```
position: fixed
right: 40px
bottom: 120px
```

---

# 10. Mobile 대응

모바일에서는 TOC를 숨긴다.

조건

```
max-width: 900px
```

CSS

```
display: none
```

---

# 11. 수정 대상 파일

```
post.hbs
assets/js/post-toc.js
assets/css/post-toc.css
```

---

# 12. 구현 단계

순서

1️⃣ post.hbs에 TOC container 추가

예

```
<div class="post-toc"></div>
```

2️⃣ JS 작성

```
post-toc.js
```

기능

* heading 수집
* anchor 생성
* toc 생성
* scroll spy

3️⃣ CSS 작성

```
post-toc.css
```

---

# 13. 성능 고려

다음 사항을 지킨다.

❌ MutationObserver 사용 금지
❌ 라이브러리 사용 금지

허용

```
vanilla JS
```

---

# 14. 테스트

테스트 페이지

```
http://172.22.0.199:2368/readium-gaebalgi-1-wae-naneun-dogseo-girog-aebeul-jigjeob-mandeulgiro-haessneunga/
```

확인

1️⃣ TOC 생성

2️⃣ 클릭 이동

3️⃣ scroll spy

4️⃣ 모바일 숨김

---

# 15. 작업 결과 보고 형식

## 작업 요약

(1~2 문장)

## 변경 파일

* post.hbs
* assets/js/post-toc.js
* assets/css/post-toc.css

## 주요 구현

* heading parsing
* toc 생성
* scroll spy

## 체크리스트

* [ ] h2 h3 정상 인식
* [ ] anchor 생성
* [ ] scroll spy 정상
* [ ] 모바일 숨김
