# `tasks/01-home-intro.md`

```md
# Task 01 — Home Hero 제거 및 사이트 소개 블록 추가

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

Wave 테마의 기본 Home Hero 영역을 제거하고  
블로그 소개 영역(site intro block)을 추가한다.

기존 Wave 테마는 Home 상단에 큰 Hero Cover가 존재한다.

이번 작업에서는

- Hero 영역을 제거
- 대신 블로그 소개 블록을 추가
- 기존 최신 글 리스트는 유지

하도록 수정한다.

---

# 2. 영향 페이지

다음 페이지에 영향을 준다.

Home

```

/

```

---

# 3. 요구사항

Home 페이지 상단에 다음 구조의 소개 블록을 추가한다.

구조

```

site-intro
├ logo (선택)
├ blog title
└ blog description

```

레이아웃

- 중앙 정렬
- 높이 160px ~ 180px
- 여백 충분히 확보
- Wave 스타일과 자연스럽게 통합

Hero Cover는 완전히 제거한다.

---

# 4. 수용 기준 (Acceptance Criteria)

다음 조건이 모두 만족되어야 한다.

- [ ] Home 페이지 Hero Cover가 더 이상 표시되지 않는다
- [ ] Site Intro 블록이 상단에 표시된다
- [ ] 블로그 제목이 표시된다
- [ ] 블로그 설명이 표시된다
- [ ] 최신 글 리스트는 정상적으로 표시된다
- [ ] pagination 동작 유지
- [ ] 모바일 레이아웃 깨지지 않음
- [ ] 브라우저 콘솔 에러 없음

---

# 5. 수정 대상 파일

예상 수정 파일

```

index.hbs
partials/site-intro.hbs
assets/css/layout.css

```

---

# 6. 생성 파일

새 partial 생성

```

partials/site-intro.hbs

```

---

# 7. 수정하면 안되는 파일

이번 작업에서는 다음 파일을 수정하지 않는다.

```

post.hbs
tag.hbs
routes.yaml
gulpfile.js
package.json

```

---

# 8. 구현 가이드

작업 순서

1. 현재 index.hbs 구조 분석
2. Hero Cover 영역 제거
3. site-intro partial 생성
4. index.hbs에서 partial include
5. CSS 추가
6. 빌드 실행
7. theme zip 생성

---

# 9. Site Intro Partial 예시 구조

파일

```

partials/site-intro.hbs

````

예시 구조

```html
<section class="site-intro">
  <div class="site-intro-inner">

    {{#if @site.logo}}
      <img class="site-intro-logo" src="{{@site.logo}}" alt="{{@site.title}}">
    {{/if}}

    <h1 class="site-intro-title">
      {{@site.title}}
    </h1>

    {{#if @site.description}}
      <p class="site-intro-desc">
        {{@site.description}}
      </p>
    {{/if}}

  </div>
</section>
````

---

# 10. CSS 가이드

위치

```
assets/css/layout.css
```

예시 스타일

```css
.site-intro {
  padding: 40px 0;
  text-align: center;
}

.site-intro-title {
  font-size: 32px;
  font-weight: 700;
}

.site-intro-desc {
  margin-top: 10px;
  opacity: 0.7;
}
```

---

# 11. 빌드

assets 변경 후 빌드를 실행한다.

예시

```
npm install
gulp build
```

또는

```
npm run build
```

repo에 맞는 build pipeline을 사용한다.

---

# 12. 패키징

최종 결과로 Ghost 테마 zip 파일을 생성한다.

파일명

```
wave-ayu-theme.zip
```

---

# 13. 검증 방법

Ghost 사이트

```
http://172.22.0.199:2368/
```

확인 항목

1. Home 페이지 접속
2. Hero 영역이 사라졌는지 확인
3. site intro 표시 확인
4. 최신 글 리스트 정상 동작
5. 모바일 화면 확인

---

# 14. 작업 결과 보고 형식

작업 완료 후 다음 형식으로 보고한다.

## 작업 요약

(1~2 문장)

## 변경된 파일

* index.hbs — hero 제거 및 intro partial 추가
* partials/site-intro.hbs — 신규 생성
* assets/css/layout.css — intro 스타일 추가

## 빌드

실행한 명령

## 생성된 파일

wave-ayu-theme.zip

## 검증 방법

1.
2.
3.

## 체크리스트

* [ ] Acceptance Criteria 충족
* [ ] Wave 구조 유지
* [ ] 빌드 정상
* [ ] zip 생성 완료
