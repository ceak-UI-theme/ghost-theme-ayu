# Task 07 — Categories Page (/categories/ + /tag/{slug}/)

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

Categories 허브 페이지를 구현한다.

- 허브 URL: `/categories/`
- 상세 URL: `/tag/{slug}/` (카테고리 상세는 기존 Tag 상세 페이지를 사용)

즉, Categories는 **허브 역할**을 담당하고,
카테고리별 상세 포스트 아카이브는 기존 Tag 페이지로 연결한다.

---

## 2. Category 정의 규칙

Category는 Ghost tag 중에서도 다음 조건을 만족하는 **primary tag** 를 의미한다.

- 포스트의 primary tag
- 블로그 네비게이션 및 category 구조에서 사용하는 대표 태그

현재 대표 category slug 예시

- `tech-docs`
- `tech-gear`
- `ui-ux`
- `readium`

> 구현 시에는 “실제로 primary tag로 사용된 tag 집합” 기준으로 목록을 구성한다.

---

## 3. 핵심 구현 규칙

- 서버 템플릿: `/categories/` 기본 shell 렌더링
- 클라이언트 JS:
  - 전체 포스트를 순회해 primary tag 집계
  - featured category 1개 + 나머지 category 목록 렌더링
  - 각 카테고리 카드 링크는 `/tag/{slug}/`로 연결

---

## 4. URL 구조

### Categories Hub
`/categories/`

### Category Detail (재사용)
`/tag/{slug}/`

예

- `/tag/tech-docs/`
- `/tag/readium/`

---

## 5. Categories Hub Page

### 목적
전체 primary tag 목록 표시

### UI 구조

- Categories 헤더
- Featured category
- All primary categories
- Additional hub link: Secondary Tags (`/secondary-tags/`)

### 표시 데이터

- category name
- post count
- cover image (없으면 fallback)
- description (없으면 기본 문구)

### 링크

각 category card 클릭 시:

`/tag/{slug}/`

---

## 6. Category Card UI

카드 구조:

- cover image
- `Primary | {count} posts`
- category name
- description

> Category card는 Series card와 동일한 톤/구조를 사용한다.

---

## 7. Hub 규칙

Hub에서는 **primary tag로 실제 사용된 태그만** 표시한다.

### 제외 대상

- internal tag (`#series-*`)
- private/internal 성격의 태그
- primary tag로 사용되지 않은 태그

---

## 8. 에러 처리

### primary tag 집계 결과 없음

- `nothing happened` 또는 동등한 empty message 표시

### API 로드 실패

- `Failed to load categories.` 표시

---

## 9. 모바일 대응

- 카드 UI 유지
- 제목/간격 축소
- 기존 반응형 브레이크포인트(`767px`) 준수

---

## 10. 검증 방법

테스트 URL

- `http://172.22.0.199:2368/categories/`

확인

1. categories hub 표시
2. featured category 표시
3. category card 링크가 `/tag/{slug}/`로 이동
4. Secondary Tags 진입 링크 표시
5. fallback 이미지 동작 확인

---

## 11. 수정 대상 파일 (현재 구조 기준)

- `categories.hbs` 또는 `page-categories.hbs` (routes.yaml 구조에 맞는 실제 파일)
- `assets/js/main.js` (categories 렌더 로직)
- `assets/css/site/term.css` (categories 스타일)

---

## 12. 작업 결과 보고 형식

### 작업 요약

(1~2 문장)

### 변경 파일

- ...
- ...

### 주요 구현

- primary tag 집계
- featured/list 분리 렌더링
- `/tag/{slug}/` 연결

### 체크리스트

- [ ] `/categories/` hub 정상
- [ ] primary tag만 표시
- [ ] featured category 표시
- [ ] category card 링크 `/tag/{slug}/` 정상
- [ ] fallback 이미지 정상
