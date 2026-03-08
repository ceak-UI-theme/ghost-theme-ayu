# Troubleshooting

이 문서는 **Signal Wave Ayu 테마 사용 중 발생할 수 있는 일반적인 문제와 해결 방법**을 정리한 가이드입니다.

Ghost 테마는 서버 애플리케이션이 아니라 **프론트엔드 테마 + Ghost API 조합**으로 동작하기 때문에,  
문제의 원인은 보통 다음 세 가지 중 하나입니다.

1. **Ghost 설정 문제**
2. **Tag 규칙 문제**
3. **JavaScript / Content API 문제**

이 문서는 실제 운영에서 가장 자주 발생하는 문제를 중심으로 정리되어 있습니다.

* * *

# 1. 허브 페이지가 비어 보이는 경우

예:

- `/categories`
- `/series`
- `/secondary-tags`
- `/explore`

페이지가 정상적으로 열리지만 **목록이 표시되지 않는 경우**입니다.

## 원인

이 테마의 허브 페이지는 **Ghost Content API를 통해 클라이언트에서 렌더링**됩니다.

즉 다음 조건이 필요합니다.

- Content API 접근 가능
- JavaScript 정상 실행
- Tag 규칙 정상

## 확인 방법

브라우저 개발자 도구를 열고 다음을 확인합니다.

`F12` → `Console`

다음과 같은 에러가 있는지 확인합니다.

예:

`Content API key not found Failed to fetch Cannot read properties of undefined`

## 해결 방법

### 1) Content API Key 확인

`default.hbs`에서 다음 코드가 존재해야 합니다.

`<script data-key="{{@site.content_api_key}}"></script>` 이 값이 없으면 허브 페이지가 동작하지 않습니다.

* * *

### 2) JavaScript 로드 확인

브라우저 네트워크 탭에서 다음 파일이 로드되는지 확인합니다.

`/assets/built/main.min.js`

404가 발생하면 빌드가 제대로 되지 않은 것입니다.

* * *

### 3) Tag prefix 확인

허브 페이지는 다음 prefix를 기준으로 동작합니다.

`category-` `series-`

예:

`category-ai` `series-unix-design`

prefix가 다르면 목록에 표시되지 않습니다.

* * *

# 2. Categories 페이지에 아무 것도 나타나지 않는 경우

`/categories` 페이지에서 카테고리가 하나도 나타나지 않는 경우입니다.

## 원인

이 테마에서 Category는 다음 규칙을 사용합니다.

tag slug = `category-*`

예:

`category-ai` `category-unix` `category-security`

prefix가 없는 tag는 Category로 인식되지 않습니다.

## 해결 방법

Ghost Admin에서 Tag를 수정합니다.

예:

잘못된 경우

`AI` `unix` `security`

수정

`category-ai` `category-unix` `category-security`

* * *

# 3. Series navigation이 나타나지 않는 경우

포스트 하단에 **Series navigation**이 표시되지 않는 경우입니다.

## 원인

Series는 다음 prefix를 사용합니다.

`series-`

예:

`series-ai-agents` `series-unix-design`

prefix가 없으면 시리즈로 인식되지 않습니다.

## 확인 방법

포스트 HTML class를 확인합니다.

예:

`tag-series-ai-agents`

이 클래스가 존재해야 합니다.

## 해결 방법

Ghost Admin에서 Tag slug를 수정합니다.

예:

잘못된 경우

`ai-agents`

수정

`series-ai-agents`

* * *

# 4. Topic(secondary tag)이 Topics 페이지에 나타나지 않는 경우

`/secondary-tags` 페이지에서 topic이 나타나지 않는 경우입니다.

## 원인

Topics는 다음 조건을 만족해야 합니다.

1. public tag
2. `category-` 아님
3. `series-` 아님
4. post가 최소 1개 존재

post가 없는 tag는 표시되지 않습니다.

## 해결 방법

다음 두 가지를 확인합니다.

### 1) tag에 post가 있는지 확인

Ghost Admin → Tags → Post count

### 2) prefix 확인

다음 tag는 Topics로 표시되지 않습니다.

- `category-*` 
- `series-*`

* * *

# 5. Search가 동작하지 않는 경우

`/search` 페이지에서 검색 결과가 나타나지 않는 경우입니다.

## 원인

Search는 **Ghost Content API + JavaScript 필터링** 방식으로 동작합니다.

다음 문제일 가능성이 있습니다.

- Content API key 없음
- JS 오류
- 검색어 길이 부족

## 해결 방법

### 1) 검색어 길이

Search는 최소 **2글자 이상** 입력해야 동작합니다.

* * *

### 2) Console 에러 확인

브라우저 개발자 도구에서 다음을 확인합니다.

Console Network

특히 다음 API 호출이 정상인지 확인합니다.

/ghost/api/content/posts/

* * *

# 6. Pagination이 깨지는 경우

홈 또는 tag archive에서 pagination이 깨지는 경우입니다.

## 원인

Ghost pagination helper와 custom pagination script가 함께 동작합니다.

문제는 보통 다음 때문입니다.

- partial 수정
- CSS override
- JS 오류

## 해결 방법

다음 파일이 정상인지 확인합니다.

- `partials/ayu-pagination.hbs`
- `assets/js/main.js`

* * *

# 7. Feature image가 표시되지 않는 경우

포스트 대표 이미지가 표시되지 않는 경우입니다.

## 원인

포스트에 feature image가 없으면 fallback 이미지가 사용됩니다.

fallback 이미지 위치

`assets/images/fallback/post-default.png`

이 파일이 삭제되면 이미지가 표시되지 않습니다.

## 해결 방법

다음 파일이 존재하는지 확인합니다.

`assets/images/fallback/post-default.png`

* * *

# 8. Tag 이미지가 표시되지 않는 경우

Category / Series / Topic 이미지가 표시되지 않는 경우입니다.

## 원인

Tag에 feature image가 없으면 fallback 이미지가 사용됩니다.

fallback 목록

- `primary-tag-default.png`
- `series-tag-default.png`
- `secondary-tag-default.png`

## 해결 방법

다음 파일이 존재하는지 확인합니다.

`assets/images/fallback/`

* * *

# 9. Light / Dark 모드가 저장되지 않는 경우

페이지를 새로고침하면 테마가 다시 초기화되는 문제입니다.

## 원인

테마 설정은 localStorage에 저장됩니다.

theme-preference

브라우저가 localStorage를 차단하면 저장되지 않습니다.

## 해결 방법

다음을 확인합니다.

- 브라우저 privacy extension
- localStorage 차단 설정

* * *

# 10. 광고 슬롯이 보이지 않는 경우

포스트 목록 중간에 promo slot이 나타나지 않는 경우입니다.

## 원인

promo slot은 다음 조건에서만 삽입됩니다.

`.js-promo-feed`

이 클래스가 있는 컨테이너에서만 동작합니다.

또한 기본 삽입 간격은 다음입니다.

`PROMO_INSERT_EVERY = 5`

즉 포스트 5개마다 1개가 삽입됩니다.

## 해결 방법

다음 조건을 확인합니다.

1. 컨테이너에 `.js-promo-feed` 존재
2. 포스트 개수 ≥ 5
3. JavaScript 정상 실행

* * *

# 11. 테마가 적용되지 않는 경우

Ghost에서 테마를 업로드했는데 화면이 깨지는 경우입니다.

## 원인

Ghost 테마는 다음 버전을 기준으로 작성되었습니다.

`Ghost >= 5.x`

구버전 Ghost에서는 일부 기능이 동작하지 않을 수 있습니다.

## 해결 방법

Ghost 버전을 확인합니다.

ghost version

가능하면 최신 버전을 사용합니다.

* * *

# 12. build 오류가 발생하는 경우

테마 개발 중 build 오류가 발생하는 경우입니다.

## 원인

Node dependency 문제일 가능성이 높습니다.

## 해결 방법

다음 순서로 다시 설치합니다.

`rm -rf node_modules npm install npm run dev`

* * *

# 13. JavaScript 오류가 발생하는 경우

허브 페이지 또는 검색이 동작하지 않는 경우입니다.

## 확인 방법

브라우저 개발자 도구에서 다음을 확인합니다.

Console

대표적인 오류 예:

`Content API key not found Cannot read properties of undefined`

## 해결 방법

다음을 확인합니다.

- Content API key
- main.min.js 로드
- JS build 정상 여부

* * *

# 14. 여전히 문제가 해결되지 않는 경우

다음 정보를 확인하면 문제를 빠르게 찾을 수 있습니다.

1. Ghost version
2. 브라우저 Console 에러
3. Network API 응답
4. Tag slug 구조
5. JavaScript build 상태

가능하면 다음 정보와 함께 문제를 확인합니다.

Ghost version Theme version Console error URL

이 정보가 있으면 대부분의 문제는 빠르게 해결할 수 있습니다.

* * *

# Summary

Signal Wave Ayu에서 발생하는 대부분의 문제는 다음 세 가지 중 하나입니다.

1. Tag prefix 규칙 문제
2. Content API 문제
3. JavaScript 로딩 문제

이 세 가지를 먼저 확인하면 대부분의 문제를 해결할 수 있습니다.