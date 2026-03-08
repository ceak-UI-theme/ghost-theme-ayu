# Theme Configuration Guide

Signal Wave Ayu 테마를 설치한 후, Ghost Admin에서 몇 가지 설정을 통해 테마의 기능과 UI를 올바르게 동작하도록 구성해야 합니다.

이 문서는 **Ghost Admin 기준 설정 방법**과 **테마에서 사용하는 주요 설정 요소**들을 설명합니다.

* * *

# 1. Ghost Admin 기본 설정

테마를 적용하기 전에 다음 기본 설정을 확인하는 것이 좋습니다.

Ghost Admin 경로:

Settings → Design

설정 항목:

- Publication logo
- Site icon
- Cover image
- Theme 적용

* * *

# 2. Theme 업로드 및 활성화

## 2.1 테마 업로드

Ghost Admin에서 다음 경로로 이동합니다.

Settings → Design → Change theme

그 다음:

Upload theme

을 클릭하고 테마 zip 파일을 업로드합니다.

예:

signal-wave-ayu.zip

업로드 후 **Activate** 버튼을 눌러 테마를 활성화합니다.

* * *

# 3. routes.yaml 적용

Signal Wave Ayu는 몇 가지 **커스텀 페이지 라우트**를 사용합니다.

다음 파일을 Ghost에 업로드해야 합니다.

routes.yaml

Ghost Admin 경로:

Settings → Labs → Routes

여기서 **Upload routes.yaml**을 선택하여 파일을 업로드합니다.

* * *

## 3.1 routes.yaml 역할

이 파일은 다음 페이지를 활성화합니다.

| URL | 설명  |
| --- | --- |
| `/explore/` | 콘텐츠 탐색 페이지 |
| `/categories/` | 카테고리 허브 |
| `/series/` | 시리즈 허브 |
| `/secondary-tags/` | 토픽 허브 |
| `/search/` | 검색 페이지 |
| `/rss/` | RSS 피드 |

이 파일이 적용되지 않으면 해당 페이지들이 동작하지 않습니다.

* * *

# 4. Navigation 구성

Ghost Admin에서 메뉴를 구성합니다.

경로:

Settings → Navigation

추천 메뉴 구조:

Home Explore Categories Series Search

예시 설정:

| Label | URL |
| --- | --- |
| Home | /   |
| Explore | /explore/ |
| Categories | /categories/ |
| Series | /series/ |
| Search | /search/ |

주의:

테마 내부에서도 일부 링크를 표시하므로  
Navigation 설정에서 동일 메뉴를 중복으로 넣지 않도록 확인하는 것이 좋습니다.

* * *

# 5. Theme Custom Settings

Signal Wave Ayu는 Ghost Theme Custom Settings 기능을 사용합니다.

경로:

Settings → Design → Customize

설정 가능한 항목은 다음과 같습니다.

* * *

## 5.1 Navigation Layout

헤더 로고와 메뉴 배치를 변경합니다.

옵션:

Logo on the left Logo in the middle Stacked

설명:

| 옵션  | 설명  |
| --- | --- |
| Logo on the left | 로고 왼쪽 / 메뉴 오른쪽 |
| Logo in the middle | 로고 중앙 / 메뉴 양쪽 |
| Stacked | 로고 위 / 메뉴 아래 |

* * *

## 5.2 Title Font

제목 폰트 스타일을 선택합니다.

옵션:

Modern sans-serif Elegant serif

설명:

| 옵션  | 특징  |
| --- | --- |
| Modern sans-serif | 기술 블로그 스타일 |
| Elegant serif | 읽기 중심 스타일 |

* * *

## 5.3 Body Font

본문 폰트를 선택합니다.

옵션:

Modern sans-serif Elegant serif

일반적으로 기술 블로그에서는 다음 조합을 많이 사용합니다.

Title → Modern sans-serif Body → Elegant serif

* * *

## 5.4 Social Links

푸터에 표시되는 소셜 링크입니다.

설정 가능한 항목:

- `github_link` 
- `twitter_x_link`
- `linkedin_link
- `rss_link`

예시:

- [https://github.com/yourname](https://github.com/yourname) 
- [https://twitter.com/yourname](https://twitter.com/yourname) 
- [https://linkedin.com/in/yourname](https://linkedin.com/in/yourname) 
- /rss/

이 링크들은 footer 영역에 아이콘과 함께 표시됩니다.

* * *

# 6. Brand 설정

Ghost Admin에서 사이트 브랜딩을 설정합니다.

경로:

Settings → Design → Brand

설정 항목:

| 설정  | 설명  |
| --- | --- |
| Publication logo | 사이트 로고 |
| Site icon | favicon |
| Cover image | 홈페이지 커버 이미지 |

* * *

## 6.1 Publication Logo

사이트 로고는 다음 위치에 표시됩니다.

- 헤더
- 모바일 헤더
- 일부 공유 카드

권장 크기:

높이 80~120px

SVG 또는 PNG를 추천합니다.

* * *

## 6.2 Site Icon

Site icon은 브라우저 탭 아이콘입니다.

권장 크기:

64x64

또는

128x128

* * *

## 6.3 Cover Image

홈페이지 상단 커버 이미지입니다.

권장 크기:

2000 × 520

이 이미지는 다음 위치에 사용됩니다.

- 홈 페이지
- 일부 공유 카드

* * *

# 7. Feature Image

포스트에 Feature Image가 없으면 테마는 **fallback 이미지**를 사용합니다.

Fallback 이미지 위치:

`assets/images/fallback/`

파일 목록:

- `post-default.png`
- `primary-tag-default.png`
- `secondary-tag-default.png`
- `series-tag-default.png`

필요하다면 이 파일들을 교체하여 기본 이미지를 변경할 수 있습니다.

* * *

# 8. Tag Feature Image

Ghost Tag에는 feature image를 설정할 수 있습니다.

경로:

Ghost Admin → Tags

각 태그에서 다음을 설정할 수 있습니다.

Feature image

이 이미지는 다음 위치에서 사용됩니다.

- Category 카드
- Series 카드
- Topic 카드
- Tag 페이지 헤더

* * *

# 9. Light / Dark Mode

Signal Wave Ayu는 기본적으로 **Light / Dark 테마 전환**을 지원합니다.

동작 방식:

- 브라우저 localStorage에 저장
- 사용자가 선택한 테마 유지
- 버튼 클릭 시 즉시 변경

사용자가 별도로 설정할 필요는 없습니다.

* * *

# 10. Members 설정

Ghost Members 기능을 사용하는 경우 다음 버튼이 표시됩니다.

- Sign in
- Subscribe
- Account

이 버튼들은 다음 조건에서 자동 표시됩니다.

Ghost Members 활성화

Ghost Admin 경로:

Settings → Membership

Members 기능을 사용하지 않는 경우 해당 버튼은 표시되지 않습니다.

* * *

# 11. Content API

이 테마의 일부 페이지는 Ghost Content API를 사용합니다.

예:

- Categories page
- Series page
- Topics page
- Explore page
- Search page

Ghost 기본 설정에서는 별도의 설정이 필요하지 않습니다.

단, 다음 상황에서는 문제가 발생할 수 있습니다.

- Content API key가 숨겨진 경우
- Ghost API 접근이 제한된 경우
- CSP 정책으로 API 호출이 막힌 경우

* * *

# 12. Ad Slot 설정

이 테마에는 광고를 삽입할 수 있는 슬롯 구조가 있습니다.

지원 슬롯:

- `list-inline`
- `post-top `
- `post-bottom`

기본 상태에서는 placeholder 형태로 표시됩니다.

실제 광고를 삽입하려면 다음 파일을 수정하면 됩니다.

partials/ad-slot.hbs

또는 JavaScript에서 직접 삽입할 수 있습니다.

* * *

# 13. 설정 완료 체크리스트

테마 설정이 완료되었는지 확인하려면 다음 항목을 체크합니다.

- [ ] Theme 업로드 완료 
- [ ] routes.yaml 적용 
- [ ] Navigation 구성 
- [ ] Logo 설정 
- [ ] Site icon 설정 
- [ ] Cover image 설정 
- [ ] Social links 설정 
- [ ] Tag feature images 설정
- 
* * *

# 14. 다음 문서

테마 설정이 완료되었다면 다음 문서를 참고하십시오.

docs/user/content-model.md

이 문서는 Signal Wave Ayu의 **핵심 콘텐츠 구조(Category / Series / Topic)**를 설명합니다.