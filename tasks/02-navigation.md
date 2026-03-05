# `tasks/02-navigation.md`

```md
# Task 02 — 상단 Navigation 구성 (+More=/categories, Series, Search)

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

Wave 테마의 상단 헤더 네비게이션을 아래 요구사항에 맞게 구성한다.

요구 네비게이션(Desktop 기준)

```

Logo > #A > #B > #C > #D > +More > Series > Search > Theme Toggle > Sign in > Subscribe

```

- #A~#D는 “프라이머리태그 대표 4개”로 고정
- +More는 `/categories`(프라이머리태그 목록 페이지)로 이동
- Series는 `/series`로 이동
- Search 버튼은 `/search`로 이동
- Theme Toggle, Member(Sign in/Subscribe)는 Wave 기본 동작을 유지

---

## 2. 영향 페이지

- 전 페이지(헤더 공통): `default.hbs`에 의해 적용
- 특히 확인해야 할 페이지:
  - `/`
  - `/tag/{slug}/`
  - `/{post-slug}/`
  - `/categories/`
  - `/series/`
  - `/search/`

---

## 3. 네비 항목 정의(확정)

### #A~#D (프라이머리태그 4개)
- Tech Docs
- Tech Gear
- UI & UX
- Readium

동작:
- 클릭 시 `/tag/{tagid}/` 이동

> **주의**: tagid(slug)는 Ghost admin에 실제 존재하는 slug를 사용한다.  
> (예: `tech-docs`, `tech-gear`, `ui-ux`, `readium` 등)

### +More
- 클릭 시 `/categories/` 이동
- 의미: 프라이머리태그 목록 페이지(=카테고리 허브)

### Series
- 클릭 시 `/series/` 이동

### Search
- 클릭 시 `/search/` 이동

### Theme Toggle / Member
- Wave 기본 동작 유지(기존 구현을 최대한 재사용)

---

## 4. 수용 기준 (Acceptance Criteria)

- [ ] 모든 페이지에서 헤더 네비가 동일하게 표시된다
- [ ] 네비 항목 순서가 요구사항과 일치한다(Desktop)
- [ ] #A~#D 클릭 시 각각 `/tag/{slug}/`로 이동한다
- [ ] +More 클릭 시 `/categories/`로 이동한다
- [ ] Series 클릭 시 `/series/`로 이동한다
- [ ] Search 버튼 클릭 시 `/search/`로 이동한다
- [ ] Theme Toggle 동작이 유지된다
- [ ] Sign in / Subscribe 동작이 유지된다
- [ ] 모바일에서도 메뉴가 깨지지 않는다(필요 시 responsive 처리)
- [ ] 브라우저 콘솔 에러 없음

---

## 5. 수정 대상 파일(예상)

> Wave 테마의 헤더 구현 방식에 따라 “실제 수정 파일”이 달라질 수 있다.  
> 먼저 현재 헤더가 어디에서 렌더링되는지 확인 후 최소 변경으로 적용한다.

예상 수정 파일 후보:

- `default.hbs` (가장 유력)
- `partials/*header*.hbs` (존재한다면 여기)
- `assets/css/site/header.css`
- (필요시) `assets/css/site/layout.css`

---

## 6. 생성 파일

이번 작업에서 신규 파일 생성은 원칙적으로 하지 않는다.  
(단, Wave 구조상 header partial이 없다면 생성하지 말고 `default.hbs`에서 처리)

---

## 7. 수정하면 안되는 파일(원칙)

이번 작업에서는 아래 파일들을 수정하지 않는다.

- `post.hbs`
- `tag.hbs`
- `routes.yaml`  (이 Task에서는 라우팅 생성/연결 작업을 하지 않음)
- `gulpfile.js`
- `package.json`

---

## 8. 구현 가이드

### Step 1 — 헤더 구현 위치 찾기
- `default.hbs`에서 header/nav를 직접 렌더링하는지 확인
- 또는 `partials` 아래 header 관련 partial이 있는지 확인
- 현재 메뉴 아이템 구조(ul/li, nav, button 등) 파악

### Step 2 — 메뉴 아이템 구성 변경
- 기존 Wave 메뉴를 대체/수정해서 아래 항목들을 넣는다:
  - Tech Docs, Tech Gear, UI & UX, Readium, +More, Series, Search
- Theme toggle / Member 항목은 기존 코드 위치를 유지하고, 그 “앞쪽”에 위 메뉴를 배치

### Step 3 — URL 연결
- 대표 카테고리 4개: `/tag/{slug}/`
- +More: `/categories/`
- Series: `/series/`
- Search: `/search/`

> slug는 확정값이 아니므로, 코드에 넣기 전에 현재 Ghost admin의 tag slug를 확인한다.  
> slug가 다르면 링크만 바뀌면 되도록 “상수화” 또는 “한 군데에서만 수정”되게 작성한다.

### Step 4 — 스타일 조정
- `assets/css/site/header.css`에서
  - 메뉴 간격, hover, active 스타일을 Wave 톤에 맞게 조정
  - Search 버튼이 아이콘인 경우 기존 icon partial 재사용(가능하면 `partials/icons/search.hbs` 활용)

### Step 5 — 빌드 및 반영
- build pipeline이 있으면 실행해서 `assets/built`를 갱신한다.
- 테마 zip 생성은 이 Task에서 강제하지 않음(프로세스에 따라 실행)

---

## 9. 검증 방법

테스트 URL:

- `http://172.22.0.199:2368/`

확인 순서:

1) Home(`/`) 접속 → 헤더 네비 표시/순서 확인  
2) Tech Docs 등 클릭 → `/tag/{slug}/` 이동 확인  
3) +More 클릭 → `/categories/` 이동 확인(페이지 존재 여부는 다음 Task에서 구현할 수 있음. 단, 링크는 맞아야 함)  
4) Series 클릭 → `/series/` 이동 확인(페이지 존재 여부는 다음 Task에서 구현 가능)  
5) Search 클릭 → `/search/` 이동 확인(페이지 존재 여부는 다음 Task에서 구현 가능)  
6) 모바일 폭에서 메뉴 깨짐 여부 확인

> 주의: `/categories`, `/series`, `/search` 페이지가 아직 없더라도  
> 이번 Task는 “링크와 UI를 먼저 고정”하는 것이 목적이다.  
> 페이지 구현은 이후 Task에서 수행한다.

---

## 10. 작업 결과 보고 형식

작업 완료 후 다음 형식으로 보고한다.

### 작업 요약
(1~2 문장)

### 변경된 파일
- `...` — 변경 이유

### 주요 변경 내용
- 네비 항목/순서
- 링크 경로
- 스타일 변경 요약

### 빌드
실행한 명령(있으면)

### 검증 방법
1.
2.
3.

### 체크리스트
- [ ] Acceptance Criteria 충족
- [ ] Wave 구조 유지
- [ ] 테마 빌드 파이프라인 유지