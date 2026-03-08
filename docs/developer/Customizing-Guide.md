# Signal Wave Ayu 커스터마이징 가이드

이 문서는 Signal Wave Ayu 테마를 수정하거나 확장하려는 개발자를 위한 문서다.  
이 테마는 Ghost의 기본 구조를 최대한 유지하면서, 태그 slug 규칙과 클라이언트 렌더링 로직을 통해 Category, Series, Topic 구조를 구현한다.  
따라서 커스터마이징도 무작정 모든 파일을 건드리는 방식보다는, 구조를 이해한 뒤 필요한 레이어만 수정하는 방식이 가장 안전하다.

이 테마에서 실제로 수정이 자주 일어나는 영역은 크게 다섯 가지다.

- 템플릿 구조
- 스타일
- JavaScript 동작
- Ghost Admin 노출 설정
- 빌드 및 패키징 방식

이 문서에서는 실제 소스 기준으로 어디를 어떻게 수정해야 하는지, 그리고 무엇을 조심해야 하는지를 정리한다.

* * *

# 1. 커스터마이징 기본 원칙

Signal Wave Ayu는 다음 원칙 위에서 수정하는 것이 좋다.

- 첫째, 가능한 한 Ghost의 기본 템플릿 구조를 유지한다.  
- 둘째, taxonomy 규칙은 쉽게 바꾸지 않는다.  
- 셋째, 단순한 UI 변경은 CSS와 partial 수정으로 끝낸다.  
- 넷째, JavaScript는 동작을 정말 바꿔야 할 때만 수정한다.  
- 다섯째, routes.yaml과 package.json 수정은 운영 정책이 바뀔 때만 건드린다.

이 순서를 지키면 테마를 장기적으로 유지보수하기가 훨씬 쉽다.

* * *

# 2. 어디를 수정해야 하는가

테마의 주요 수정 지점은 아래와 같다.

| 영역  | 주요 파일 | 설명  |
| --- | --- | --- |
| 전체 레이아웃 | `default.hbs` | 헤더, 푸터, 전역 스크립트, 전역 CSS 로드 |
| 포스트 페이지 | `post.hbs` | 글 본문, 광고 슬롯, TOC, 시리즈 내비게이션 |
| 태그 아카이브 | `tag.hbs` | Category / Series / Topic 상세 페이지 |
| 허브 페이지 | `page-categories.hbs`, `page-series.hbs`, `page-secondary-tags.hbs`, `page-explore.hbs`, `page-search.hbs` | 탐색용 페이지 골격 |
| partial | `partials/*` | 포스트 카드, 메타, pagination, 시리즈 내비 등 |
| 스타일 | `assets/css/*` | 컬러, 폰트, 레이아웃, 카드, 포스트 스타일 |
| 동작 로직 | `assets/js/main.js`, `assets/js/lib/*` | 태그 분류, 허브 렌더링, 검색, TOC, 토글 |
| 테마 설정 | `package.json` | Ghost Admin에서 보이는 custom settings |
| 라우팅 | `routes.yaml` | 허브 페이지 URL, RSS 경로 등 |
| 빌드  | `gulpfile.js` | CSS/JS 빌드 및 zip 패키징 |

즉, 화면만 바꾸고 싶다면 `assets/css`와 `partials` 위주로 보면 되고,  
분류 체계나 탐색 동작을 바꾸고 싶다면 `assets/js/main.js`까지 봐야 한다.

* * *

# 3. taxonomy prefix 변경

이 테마는 tag slug prefix를 통해 taxonomy를 판별한다.  
기본 규칙은 다음과 같다.

- `category-*` → Category
- `series-*` → Series
- 그 외 public tag → Topic

이 규칙은 `assets/js/main.js`의 `AYU_TAG_PREFIX`에서 정의되어 있다.

예시:

```
var AYU_TAG_PREFIX = {
    CATEGORY: 'category-',
    SERIES: 'series-'
};

```

예를 들어 `category-` 대신 `cat-`, `series-` 대신 `ser-`를 쓰고 싶다면 이 값을 바꿀 수 있다.

```
var AYU_TAG_PREFIX = {
    CATEGORY: 'cat-',
    SERIES: 'ser-'
};

```

하지만 이 변경은 단순하지 않다.  
왜냐하면 실제 운영 중인 Ghost tag slug 전체와 함께 바뀌어야 하기 때문이다.

즉 다음 항목이 모두 함께 바뀌어야 한다.

- Ghost Admin에 이미 만들어 둔 tag slug
- 기존 포스트에 연결된 tag
- 허브 페이지에서 읽는 tag 분류 기준
- 포스트 메타 표시 결과
- 시리즈 내비게이션 추출 로직

따라서 prefix는 초기 설계 단계에서 정하고, 운영 도중에는 바꾸지 않는 것이 좋다.

* * *

# 4. taxonomy 표시명 변경

이 테마는 slug를 그대로 노출하지 않고 표시용 이름을 정리한다.  
이 동작은 `AYU_TAG_UTILS` 내부 로직과 `normalizePostTaxonomyTags`, `normalizeTagHeaderName` 같은 함수들이 담당한다.

기본 동작은 다음과 같다.

- `category-`, `series-` prefix 제거
- 하이픈을 공백으로 변환
- 표시용 이름 정리
- taxonomy별 class 추가

예를 들어 `category-system-design`은 화면에서 `System Design`처럼 보이게 된다.

이 규칙이 마음에 들지 않거나, 약어를 좀 더 세밀하게 처리하고 싶다면 관련 함수 내부에서 표시명 생성 부분을 수정하면 된다.  
다만 이런 수정은 서버 렌더링과 클라이언트 후처리가 섞여 있기 때문에, 포스트 메타와 태그 아카이브 헤더를 함께 확인하면서 수정해야 한다.

* * *

# 5. 허브 페이지 구조 수정

허브 페이지는 다음 템플릿들로 구성된다.

- `page-categories.hbs`
- `page-series.hbs`
- `page-secondary-tags.hbs`
- `page-explore.hbs`
- `page-search.hbs`

이 템플릿들은 대부분 완전한 목록을 서버에서 출력하지 않는다.  
대신 레이아웃의 골격과 mount 지점을 만들고, 실제 데이터 목록은 JavaScript가 Ghost Content API를 호출해서 채운다.

즉 허브 페이지를 수정하는 방법은 두 가지다.

첫 번째는 템플릿 골격을 바꾸는 방식이다.  
예를 들어 hero 영역 문구, 섹션 제목, wrapper 구조, 빈 상태 메시지 영역 등을 바꿀 수 있다.

두 번째는 JavaScript 렌더링 결과 자체를 바꾸는 방식이다.  
예를 들어 featured card 선택 기준, 카드 개수, 정렬 방식, section 배치 순서 등을 바꿀 수 있다.

일반적으로는 다음처럼 접근하는 것이 좋다.

- 레이아웃, 문구, wrapper 변경 → `.hbs`
- 데이터 정렬, 필터링, 카드 생성 규칙 변경 → `assets/js/main.js`

* * *

# 6. Category, Series, Topic 렌더링 규칙 변경

허브 페이지의 핵심 렌더링 함수는 다음과 같다.

- `renderPrimaryCategories()`
- `renderSeriesTags()`
- `renderSecondaryTags()`
- `renderExplorePage()`

기본 동작은 다음과 같다.

## Categories

- 전체 tag 조회
- `category-*`만 필터링
- 빈 tag 제외
- post 수 기준으로 featured 선정
- 나머지를 목록으로 렌더링

## Series

- 전체 tag 조회
- `series-*`만 필터링
- 빈 series 제외
- post 수 기준 및 이름 기준 정렬
- featured 1개 + 나머지 목록 렌더링

## Topics

- category도 series도 아닌 public tag만 선택
- 빈 topic 제외
- 대표 topic + 나머지 목록 렌더링

## Explore

- categories / series / topics / recent posts를 조합해 대시보드처럼 렌더링

예를 들어 featured 항목 선정 기준을 `post count`가 아니라 `최근 업데이트 시점`으로 바꾸고 싶다면, 각 함수 내부의 sorting 기준을 수정해야 한다.  
또는 featured 영역 없이 모두 균등한 카드 그리드로 출력하고 싶다면, featured와 일반 목록을 나누는 렌더링 구조를 제거하면 된다.

* * *

# 7. Search 동작 변경

검색 페이지는 `renderSearchPage()`가 담당한다.  
현재 구현은 비교적 단순하다.

기본 특성은 다음과 같다.

- `/search/`에서만 동작
- 최소 2글자 이상 입력 시 검색
- 전체 post를 Ghost Content API로 가져옴
- `title`, `excerpt`, `custom_excerpt` 기준으로 필터링
- 결과는 클라이언트에서 pagination 처리

즉 이 검색은 전문 검색엔진이 아니라, 프론트엔드 필터링에 가깝다.

검색 범위를 넓히고 싶다면, 필터링 로직에서 비교 대상을 추가하면 된다.  
예를 들어 본문 HTML까지 포함하고 싶다면 post 데이터를 더 많이 불러오고 검색 대상에 추가할 수 있다.

예시:

```
var matches = (
    (post.title || '').toLowerCase().includes(query) ||
    (post.excerpt || '').toLowerCase().includes(query) ||
    (post.custom_excerpt || '').toLowerCase().includes(query) ||
    (post.html || '').toLowerCase().includes(query)
);

```

하지만 이 방식은 추천하지 않는다.  
본문 HTML까지 내려받으면 네트워크 비용과 렌더링 비용이 커지기 때문이다.  
사이트 규모가 커질수록 검색 성능이 급격히 나빠질 수 있다.

검색을 강화하고 싶다면 다음 세 가지 방향 중 하나를 선택하는 것이 낫다.

- 현재 구조 유지
- 클라이언트 필터링 대상만 약간 확장
- 외부 검색 인덱스나 검색 서비스 연동

* * *

# 8. Search 페이지 크기 변경

검색 결과 페이지 크기는 `AYU_GLOBALS`의 `PAGINATION_PAGE_SIZE`로 제어된다.

예시:

```
var AYU_GLOBALS = {
    PAGINATION_PAGE_SIZE: 10,
    PROMO_INSERT_EVERY: 5,
    MOBILE_BREAKPOINT: 767
};

```

결과 수를 20개로 늘리고 싶다면 다음처럼 변경하면 된다.

```
PAGINATION_PAGE_SIZE: 20

```

검색 결과가 많은 사이트에서는 한 페이지에 너무 많은 카드를 보여주면 스크롤 경험이 나빠질 수 있다.  
반대로 너무 적게 보여주면 페이지 이동이 많아진다.  
현재 값 10은 무난한 편이지만, 운영하는 글 수와 카드 높이에 따라 조정하면 된다.

* * *

# 9. Series 내비게이션 변경

포스트 하단의 시리즈 내비게이션은 `renderPostSeriesNavigation()`이 담당한다.

현재 동작은 다음과 같다.

1. `#post-series-nav`의 `data-series-slugs`에서 series 후보를 읽음
2. 해당 series tag 조회
3. 그 시리즈의 모든 글 조회
4. `published_at asc` 기준 정렬
5. 현재 글 강조 표시
6. 링크 목록 렌더링

즉, 순서는 수동 지정이 아니라 발행일 오름차순이다.

만약 최신 글이 위로 오게 하고 싶다면 정렬을 뒤집으면 된다.

예시:

```
posts.sort(function(a, b) {
    return new Date(b.published_at) - new Date(a.published_at);
});

```

또는 발행일이 아니라 title 기준 정렬로 바꾸는 것도 가능하다.

```
posts.sort(function(a, b) {
    return (a.title || '').localeCompare(b.title || '');
});

```

하지만 시리즈는 본질적으로 순서가 중요한 경우가 많다.  
그래서 수동 순서를 지원하지 않는 현재 구조에서는 발행일 기준을 유지하는 편이 더 자연스럽다.

* * *

# 10. 포스트 카드 UI 변경

포스트 카드 출력의 중심은 `partials/loop.hbs`다.  
홈 피드, 태그 피드, 일부 목록 UI는 이 partial을 기반으로 한다.

카드의 주요 구성은 다음과 같다.

- 대표 이미지
- 포스트 메타
- 제목
- excerpt
- 일부 player 관련 버튼

즉 카드 UI를 바꾸고 싶다면 가장 먼저 `partials/loop.hbs`를 보면 된다.  
예를 들어 다음과 같은 변경을 할 수 있다.

- excerpt 길이 축소 또는 제거
- category badge 강조
- 시리즈 태그 별도 노출
- 작성일 위치 변경
- 읽기 시간 추가
- 카드 CTA 추가

이런 변경은 보통 JavaScript 수정 없이 partial과 CSS만으로 가능하다.

* * *

# 11. 포스트 메타 출력 방식 변경

포스트 메타는 `partials/post-meta.hbs`에서 출력한다.  
기본적으로 날짜와 tag 링크가 들어가며, taxonomy 의미(`data-taxonomy-role`, `data-taxonomy-rendered="server"`)도 함께 내려준다.  
JS는 서버 의미를 우선 사용하고, 누락된 경우에만 slug prefix fallback 보정을 수행한다.

이 구조는 장점과 단점이 있다.

장점은 JavaScript가 실패해도 메타 자체는 깨지지 않는다는 점이다.  
단점은 서버 출력과 클라이언트 후처리가 섞여 있다는 점이다.

예를 들어 카테고리만 가장 앞에 강조하고, 나머지 태그는 뒤에 흐리게 보이고 싶다면 다음 두 가지 방법이 있다.

- 서버 템플릿에서 category / series / topic을 분리 출력
- 현재 구조를 유지하고 JS/CSS로 class 기반 스타일만 바꾸기

운영 안정성을 생각하면, 가능한 한 출력 구조를 크게 바꾸지 말고 class 기반 스타일 조정부터 시도하는 것이 좋다.

* * *

# 12. 대표 이미지 fallback 교체

대표 이미지가 없는 포스트나 tag를 위해 fallback 이미지가 준비되어 있다.

위치:

- `assets/images/fallback/post-default.png`
- `assets/images/fallback/primary-tag-default.png`
- `assets/images/fallback/series-tag-default.png`
- `assets/images/fallback/secondary-tag-default.png`

이 경로는 `AYU_DEFAULT_IMAGES`에 정의되어 있다.

예시:

```
var AYU_DEFAULT_IMAGES = {
    POST: '/assets/images/fallback/post-default.png',
    PRIMARY_TAG: '/assets/images/fallback/primary-tag-default.png',
    SERIES_TAG: '/assets/images/fallback/series-tag-default.png',
    SECONDARY_TAG: '/assets/images/fallback/secondary-tag-default.png'
};

```

교체 방법은 두 가지다.

첫 번째는 같은 파일명으로 이미지를 덮어쓰는 방식이다.  
가장 간단하고 안전하다.

두 번째는 경로 자체를 바꾸는 방식이다.  
이 경우 JS 코드와 실제 파일 경로가 같이 맞아야 한다.

가능하면 첫 번째 방식을 권장한다.

* * *

# 13. 헤더 메뉴 수정

헤더는 `default.hbs`에서 관리된다.  
이 테마는 Ghost navigation을 쓰면서도, 일부 링크를 코드에 직접 추가하고 있다.

기본적으로 눈여겨볼 부분은 다음과 같다.

- 로고 위치
- Ghost 기본 메뉴 출력부
- `Explore`, `Categories`, `Series` 같은 추가 링크
- 테마 토글 버튼
- 회원 관련 버튼

즉 헤더 메뉴가 중복되어 보이거나 구조가 마음에 들지 않으면 `default.hbs`를 먼저 봐야 한다.

예를 들어 다음처럼 바꿀 수 있다.

- `Explore` 제거
- `Topics` 추가
- `Search`를 헤더 고정 링크로 추가
- Ghost Admin 메뉴만 사용하도록 단순화
- 소셜 링크를 헤더로 이동

단, 헤더는 사이트 전체 UX에 영향을 주므로 작은 수정도 반응형 레이아웃과 함께 확인해야 한다.

* * *

# 14. 푸터 소셜 링크 수정

푸터 소셜 링크는 `default.hbs`와 `package.json`의 custom settings 정의를 함께 본다.

기본적으로 설정 가능한 링크는 다음과 같다.

- GitHub
- Twitter/X
- LinkedIn
- RSS

이 값은 Ghost Admin의 theme settings에서 입력할 수 있다.  
즉 단순 링크 변경이라면 코드를 수정할 필요가 없다.

하지만 링크 종류 자체를 바꾸고 싶다면 두 곳을 함께 수정해야 한다.

1. `package.json`에 custom setting 정의 추가 또는 변경
2. `default.hbs`에서 그 값을 읽어 렌더링하는 마크업 수정

예를 들어 `YouTube` 링크를 추가하고 싶다면 theme settings 정의와 footer markup 둘 다 수정해야 한다.

* * *

# 15. Light / Dark 테마 커스터마이징

테마 토글은 `data-theme="light"`와 `data-theme="dark"`를 기준으로 동작한다.  
실제 스타일은 CSS 변수와 테마별 분기 스타일이 담당한다.

주요 수정 파일은 다음과 같다.

- `assets/css/general/vars.css`
- `assets/css/site/theme-ayu.css`

수정 방향은 보통 두 가지다.

첫 번째는 컬러 팔레트를 바꾸는 것이다.  
예를 들어 Ayu 톤을 더 선명하게 하거나, 배경 대비를 높이는 작업이다.

두 번째는 컴포넌트별 시각 밀도를 바꾸는 것이다.  
예를 들어 카드 테두리, hover 효과, 링크 컬러, 코드 블록 톤 등을 조정하는 작업이다.

Light / Dark 수정 시 가장 중요한 것은 단순히 배경색만 바꾸지 않는 것이다.  
아래 요소를 함께 점검해야 한다.

- 본문 텍스트 대비
- 링크 컬러
- 코드 블록 가독성
- 카드 hover 상태
- border와 divider 대비
- TOC 및 pagination 가독성

* * *

# 16. CSS 구조별 수정 포인트

CSS는 역할별로 나뉘어 있다.

## 전역 진입점

- `assets/css/screen.css`

## 전역 변수와 폰트

- `assets/css/general/vars.css`
- `assets/css/general/fonts.css`

## 사이트 구조

- `assets/css/site/layout.css`
- `assets/css/site/header.css`
- `assets/css/site/footer.css`
- `assets/css/site/theme-ayu.css`
- `assets/css/site/explore.css`
- `assets/css/site/term.css`

## 블로그 관련

- `assets/css/blog/feed.css`
- `assets/css/blog/post.css`
- `assets/css/blog/single.css`
- `assets/css/blog/author.css`

## 기능성 스타일

- `assets/css/post-toc.css`
- `assets/css/post-navigation.css`
- `assets/css/ad-slots.css`
- `assets/css/series.css`

따라서 수정할 때는 다음처럼 접근하면 된다.

- 전체 색상감 → `theme-ayu.css`, `vars.css`
- 포스트 카드 → `feed.css`
- 본문 타이포그래피 → `post.css`, `single.css`
- 시리즈 내비 → `series.css`, `post-navigation.css`
- TOC → `post-toc.css`
- 허브 페이지 카드 → `explore.css`, `term.css`

* * *

# 17. 광고 슬롯 구조 변경

이 테마는 실제 광고 네트워크 연동 코드보다는, 광고를 삽입할 수 있는 구조를 먼저 마련해 둔 상태다.

지원 슬롯은 다음과 같다.

- `list-inline`
- `post-top`
- `post-bottom`

관련 함수는 다음 계열이다.

- `injectPromoSlots(root)`
- `createAdSlotElement(slotType)`
- `getAdSlotConfig(slotType)`

기본적으로는 placeholder 성격이 강하다.  
즉 지금 상태는 광고 플랫폼이 아니라 “광고를 어디에 넣을지”를 정하는 구조다.

예를 들어 실제 AdSense 코드로 교체하려면 `createAdSlotElement()` 내부에서 placeholder 마크업 대신 광고 스니펫을 삽입하면 된다.

또는 slot type별로 다른 wrapper class를 주고, 실제 광고 코드는 후처리 script로 넣는 구조도 가능하다.

목록 중간 광고의 빈도를 바꾸려면 `PROMO_INSERT_EVERY`를 수정하면 된다.

예시:

```
PROMO_INSERT_EVERY: 3

```

이 경우 포스트 카드 3개마다 1개씩 promo slot이 들어간다.

다만 광고 밀도가 너무 높으면 피드 읽기 경험이 많이 나빠질 수 있다.

* * *

# 18. TOC 동작 변경

TOC는 `assets/js/lib/post-toc.js`와 `assets/css/post-toc.css`를 함께 본다.

기본적으로 다음 동작이 구현되어 있다.

- `.post-content` 내부의 `h1`, `h2`, `h3`를 수집
- heading id 자동 생성
- floating TOC 렌더링
- 현재 섹션 active 표시
- 모바일에서는 숨김
- 데스크톱에서 드래그 이동 가능

단순 위치 조정이나 크기 조정은 CSS만 수정하면 된다.  
하지만 heading 수집 수준을 바꾸고 싶다면 JS를 수정해야 한다.

예를 들어 `h2`, `h3`만 포함하고 싶다면 헤더 셀렉터를 바꾸면 된다.  
또는 특정 클래스가 붙은 heading만 TOC에 포함하고 싶다면 필터 로직을 추가하면 된다.

* * *

# 19. jQuery 제거

현재 테마는 `default.hbs`에서 jQuery 3.3.1을 CDN으로 로드한다.  
즉 아직 완전한 vanilla JS 테마는 아니다.

jQuery 제거는 가능하지만, 가볍게 할 수 있는 작업은 아니다.  
다음 단계를 밟는 것이 좋다.

1. `default.hbs`에서 jQuery script 태그 제거 준비
2. `assets/js/main.js` 및 shared asset 의존부에서 jQuery 사용 구간 확인
3. `$(document).ready(...)` 패턴을 `DOMContentLoaded`로 전환
4. DOM 선택, 이벤트 바인딩, class 조작을 vanilla JS로 변경
5. player 관련 레거시 동작 확인
6. build 후 실제 모든 페이지 테스트

중요한 점은, 이 테마가 `@tryghost/shared-theme-assets`를 일부 활용하고 있기 때문에 로컬 코드만 고친다고 끝나지 않을 수 있다는 점이다.  
jQuery 제거는 “테마 리뉴얼 작업”에 가까운 과제다.

* * *

# 20. Ghost Admin custom settings 추가

Ghost Admin에서 테마 설정을 더 노출하고 싶다면 `package.json`을 수정하면 된다.

예를 들어 다음과 같은 설정을 추가할 수 있다.

- 헤더 배경 스타일
- 메인 accent color
- 시리즈 카드 강조 여부
- 검색 placeholder 문구
- footer 문구
- 광고 슬롯 사용 여부

custom settings를 추가할 때는 두 단계가 필요하다.

1. `package.json`에 필드 정의
2. `.hbs` 또는 JS에서 해당 값을 실제로 사용

즉 `package.json`만 수정한다고 바로 화면이 바뀌는 것은 아니다.

* * *

# 21. routes.yaml 수정

허브 페이지 경로와 RSS 경로는 `routes.yaml`이 담당한다.

현재 주요 라우트는 다음과 같다.

- `/categories/`
- `/series/`
- `/secondary-tags/`
- `/search/`
- `/explore/`
- `/rss/`

만약 `secondary-tags`라는 이름이 마음에 들지 않아서 `/topics/`로 바꾸고 싶다면 `routes.yaml`을 수정하고, 헤더나 내부 링크도 함께 바꿔야 한다.

즉 라우트 변경 시 반드시 함께 확인해야 하는 항목은 다음과 같다.

- `routes.yaml`
- `default.hbs` 내부 링크
- 허브 페이지 간 상호 링크
- 문서
- Ghost Admin navigation

경로를 바꾸고 일부 링크를 놓치면 사용자는 404를 만나게 된다.

* * *

# 22. 빌드 시스템 수정

빌드는 `gulpfile.js`가 담당한다.

핵심 흐름은 다음과 같다.

- CSS 빌드 → `assets/css/screen.css`에서 시작
- JS 빌드 → shared assets + local JS 병합
- 결과물 → `assets/built/screen.css`, `assets/built/main.min.js`
- zip 패키징 → `dist/signal-wave-ayu.zip`

일반적인 개발 흐름은 다음과 같다.

```
npm install
npm run dev
npm test
npm run zip

```

빌드 시스템을 수정하는 경우는 보통 다음과 같다.

- CSS minify 정책 변경
- sourcemap 처리 방식 변경
- 추가 JS 파일 포함
- zip 포함 파일 수정

하지만 일반적인 테마 커스터마이징에서는 `gulpfile.js`를 건드릴 일이 많지 않다.  
빌드는 가능하면 그대로 두는 편이 좋다.

* * *

# 23. 안전한 수정과 위험한 수정

대체로 안전한 수정 영역은 다음과 같다.

- `assets/css/*`
- `partials/*`
- `default.hbs`의 문구 및 링크 일부
- fallback 이미지 교체
- hero 이미지 교체
- footer 링크 종류 조정

반대로 주의가 필요한 영역은 다음과 같다.

- `assets/js/main.js`
- `routes.yaml`
- `package.json`의 custom settings 구조
- `gulpfile.js`
- player 관련 레거시 흐름

이유는 단순하다.  
앞쪽은 UI 레벨 변경이고, 뒤쪽은 테마의 실제 동작 규칙을 바꾸기 때문이다.

* * *

# 24. 추천 커스터마이징 순서

실제 작업 순서는 아래처럼 가는 것이 가장 안정적이다.

## 1단계: 스타일 조정

- 색상
- 여백
- 폰트
- 카드 UI
- 포스트 본문 스타일

## 2단계: 마크업 조정

- 헤더 메뉴
- footer 링크
- 포스트 카드 구조
- 포스트 메타 구조

## 3단계: 이미지 교체

- fallback 이미지
- hub hero 이미지
- 로고 / 아이콘

## 4단계: 설정 노출

- package.json custom settings 추가
- Ghost Admin 연동

## 5단계: JS 동작 변경

- 허브 정렬 로직
- 검색 범위
- 시리즈 정렬
- 광고 슬롯 규칙

## 6단계: 라우팅 정책 변경

- routes.yaml 수정
- 내부 링크 정리
- 문서 업데이트

이 순서를 따르면 작은 변경으로 큰 효과를 먼저 얻을 수 있다.

* * *

# 25. 운영 중 커스터마이징 시 주의점

운영 중인 블로그에서 테마를 수정할 때는 다음을 특히 주의해야 한다.

첫째, tag slug 규칙을 바꾸지 말 것.  
이건 콘텐츠 전체 구조를 흔든다.

둘째, 허브 페이지가 JS 기반이라는 점을 잊지 말 것.  
템플릿만 바꾸고 JS를 안 맞추면 화면이 비거나 깨질 수 있다.

셋째, Search는 클라이언트 필터링이라는 점을 기억할 것.  
작은 사이트에서는 괜찮지만, 글 수가 많아지면 체감이 달라진다.

넷째, Series는 수동 순서가 아니라 발행일 기준이다.  
운영자가 “왜 순서가 다르지?”라고 느끼면 코드 문제가 아니라 정책 문제일 수 있다.

다섯째, 메뉴와 경로는 코드와 Ghost Admin 양쪽에 나뉘어 있을 수 있다.  
한쪽만 바꾸면 일관성이 깨진다.

* * *

# 26. 장기 유지보수 전략

이 테마를 오랫동안 운영할 생각이라면 다음 전략이 현실적이다.

- taxonomy prefix는 고정
- routes 구조도 가급적 고정
- CSS 확장 위주로 대응
- partial은 필요한 만큼만 수정
- JS는 최소 수정
- 새 기능이 필요하면 완전 교체보다 점진 확장

즉 이 테마를 “매번 크게 갈아엎는 프로젝트”로 다루기보다,  
“구조는 유지하고 표현을 다듬는 테마”로 운영하는 편이 훨씬 안정적이다.

* * *

# 27. 결론

Signal Wave Ayu의 커스터마이징은 단순한 색상 교체 수준에서 끝날 수도 있고,  
taxonomy 구조와 탐색 흐름까지 바꾸는 수준으로 확장될 수도 있다.  
하지만 실제로는 대부분의 요구사항이 다음 범위에서 해결된다.

- CSS 수정
- partial 수정
- 헤더/푸터 링크 조정
- fallback 이미지 교체
- Ghost Admin 설정 추가

반면 아래 영역은 실제 구조를 이해한 뒤에만 건드리는 것이 좋다.

- taxonomy prefix
- 허브 렌더링 로직
- 검색 로직
- 시리즈 정렬 규칙
- routes.yaml
- jQuery 제거

정리하면, 이 테마는 겉모습은 쉽게 바꿀 수 있지만 중심 구조는 신중하게 다뤄야 한다.
