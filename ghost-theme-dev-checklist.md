
# Ghost Theme Development Checklist

이 문서는 Ghost Wave 테마 커스터마이징을 실제로 구현할 때
**빠뜨리기 쉬운 작업들을 체크리스트 형태로 정리한 문서**이다.

목적
- Codex 작업 결과 검증
- 수동 개발 시 체크리스트
- PR 리뷰 기준

---

# 1. Home (index.hbs)

[ ] Wave 기본 hero cover 제거
[ ] site-intro partial 삽입
[ ] 최신 포스트 loop 정상 출력
[ ] pagination 정상 동작
[ ] 광고 규칙 (5 posts마다) 적용

검증

- Home 접속 시 Hero 이미지가 보이지 않는다
- Intro block 높이 160~180px
- 최신 글 10개 표시

---

# 2. Site Intro

파일

partials/site-intro.hbs

체크

[ ] site logo 표시
[ ] site title 표시
[ ] site description 표시
[ ] 중앙 정렬 적용

스타일

assets/css/site/layout.css

---

# 3. Navigation

파일

default.hbs

메뉴

[ ] Tech Docs
[ ] Tech Gear
[ ] UI & UX
[ ] Readium
[ ] +More
[ ] Series
[ ] Search

검증

[ ] /tag/{slug} 이동 정상
[ ] /categories 페이지 이동
[ ] /series 페이지 이동

---

# 4. Tag Page

파일

tag.hbs

체크

[ ] tag header 표시
[ ] tag image 표시
[ ] tag description 표시
[ ] featured post 표시

규칙

[ ] feature=true 우선
[ ] 없으면 최신 포스트

---

# 5. Post Header

파일

post.hbs

체크

[ ] primary tag 표시
[ ] title 표시
[ ] date 표시
[ ] reading time 표시

---

# 6. Feature Image

체크

[ ] feature image 있을 때만 표시
[ ] 없으면 placeholder

---

# 7. TOC

파일

partials/post-toc.hbs

체크

[ ] h2 파싱
[ ] h3 파싱
[ ] heading 없으면 표시 안함

동작

[ ] floating icon 표시
[ ] hover 시 TOC 패널 열림

---

# 8. Series Navigation

파일

partials/series-nav.hbs

체크

[ ] #series-* 태그 인식
[ ] 이전 글 표시
[ ] 다음 글 표시

정렬

publish date

---

# 9. Related Posts

파일

partials/related-posts.hbs

체크

[ ] primary tag 기반 후보 추출
[ ] secondary tag 매칭
[ ] 최대 3개 표시

---

# 10. Categories Page

파일

page-categories.hbs

체크

[ ] primary tag 목록 표시
[ ] 각 tag 페이지 링크

URL

/categories

---

# 11. Series Page

파일

page-series.hbs

체크

[ ] #series-* tag 목록 표시
[ ] series tag page 이동

URL

/series

---

# 12. Search Page

파일

page-search.hbs

체크

[ ] title 검색
[ ] tag 검색
[ ] content 검색

URL

/search

---

# 13. CSS

확인

[ ] layout.css
[ ] header.css
[ ] post.css
[ ] feed.css

검증

[ ] 모바일 레이아웃 정상
[ ] 다크 / 라이트 테마 정상

---

# 14. Javascript

파일

assets/js/main.js

체크

[ ] TOC 스크립트
[ ] related posts scoring
[ ] search 기능

---

# Final QA

[ ] Home 정상
[ ] Tag page 정상
[ ] Post page 정상
[ ] Series navigation 정상
[ ] Related posts 정상
[ ] Search 정상

---

status: draft
purpose: dev checklist
