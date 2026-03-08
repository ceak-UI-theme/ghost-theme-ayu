# Installation

`Signal Wave Ayu` 테마를 Ghost에 설치하고 실제 운영 가능한 상태로 만드는 방법을 설명합니다.

이 문서는 단순히 “zip 업로드”만 다루지 않습니다.  
이 테마는 일반 Ghost 테마보다 설정 포인트가 조금 더 많습니다.  
특히 `routes.yaml`, tag 규칙, navigation, theme custom settings까지 함께 맞춰야 의도한 구조로 동작합니다.

설치는 다음 4단계로 이해하면 됩니다.

1. 테마 업로드 및 활성화
2. `routes.yaml` 적용
3. Ghost Admin 기본 설정
4. 구조 확인 및 첫 콘텐츠 점검

* * *

# 1. 설치 전에 알아둘 점

`Signal Wave Ayu`는 Ghost의 기본 tag 시스템을 활용하지만 실제로는 다음 분류 구조를 전제로 합니다.

- `category-*` → Category
- `series-*` → Series
- 그 외 public tag → Topic

또한 다음 커스텀 페이지를 사용합니다.

- `/explore/`
- `/categories/`
- `/series/`
- `/secondary-tags/`
- `/search/`
- `/rss/`

즉 이 테마는 단순히 zip 파일만 적용한다고 끝나지 않고  
**테마 파일 + routes 설정 + 콘텐츠 운영 규칙**이 같이 맞아야 정상적으로 보입니다.

* * *

# 2. 사전 준비

설치 전에 다음 파일이 준비되어 있어야 합니다.

## 필수 파일

- `signal-wave-ayu.zip`
- `routes.yaml`

보통 배포 패키지에는 이 두 파일이 포함되거나 함께 제공됩니다.

## 권장 준비 항목

가능하면 아래도 같이 준비해 두는 것이 좋습니다.

- 사이트 로고
- 사이트 아이콘
- 커버 이미지
- 카테고리 태그 몇 개
- 시리즈 태그 몇 개
- 테스트용 포스트 2~3개

이유는 간단합니다.  
이 테마는 허브 페이지와 taxonomy 구조를 강조하기 때문에  
콘텐츠가 전혀 없는 상태에서는 구조가 잘 보이지 않습니다.

* * *

# 3. Ghost 버전 요구사항

이 테마는 Ghost `5.x` 이상을 전제로 합니다.

권장 환경

- Ghost 5.x
- 최신 Ghost Admin
- Content API 사용 가능한 기본 Ghost 설치 환경

Ghost 버전이 너무 오래되었거나  
커스텀 라우트 업로드가 제한된 환경이라면 일부 기능이 예상과 다르게 동작할 수 있습니다.

* * *

# 4. 테마 zip 업로드

Ghost Admin에 로그인한 뒤 다음 경로로 이동합니다.

Settings → Design

그 다음 Theme 영역에서 테마 zip 파일을 업로드합니다.

## 설치 절차

1. `Settings`
2. `Design`
3. Theme upload
4. `signal-wave-ayu.zip` 업로드
5. 업로드 완료 후 활성화

업로드가 완료되면 테마 목록에 `Signal Wave Ayu`가 표시됩니다.

## 활성화

zip 업로드만 해서는 실제 사이트에 반영되지 않습니다.  
반드시 해당 테마를 **Activate** 해야 합니다.

* * *

# 5. routes.yaml 적용

이 단계가 매우 중요합니다.

`Signal Wave Ayu`는 다음과 같은 커스텀 페이지를 전제로 동작합니다.

- `/explore/`
- `/categories/`
- `/series/`
- `/secondary-tags/`
- `/search/`
- `/rss/`

이 구조는 `routes.yaml`이 있어야 Ghost가 인식합니다.

## 적용 경로

Ghost Admin에서 다음으로 이동합니다.

Settings → Labs

또는 Ghost 버전에 따라 route 업로드 메뉴가 별도 위치에 있을 수 있습니다.

그 다음 `routes.yaml` 파일을 업로드합니다.

## 적용 후 확인

다음 주소가 정상적으로 열려야 합니다.

- `/explore/`
- `/categories/`
- `/series/`
- `/secondary-tags/`
- `/search/`

초기에는 콘텐츠가 없어 비어 보일 수 있지만  
**404가 나오면 안 됩니다.**

* * *

# 6. 사이트 기본 설정

테마를 활성화한 뒤 Ghost Admin의 기본 사이트 설정을 점검합니다.

## 로고 설정

Settings → Design → Brand

설정 권장 항목

- Publication logo
- Site icon

로고가 없더라도 동작은 하지만  
헤더와 브라우저 탭 완성도가 떨어집니다.

## 커버 이미지

홈 커버 영역을 사용할 경우 cover image도 설정하는 것이 좋습니다.

Settings → Design → Brand

* * *

# 7. Theme custom settings 설정

이 테마는 Ghost theme custom settings를 사용합니다.

설정 가능한 항목

- Navigation layout
- Title font
- Body font
- GitHub link
- Twitter/X link
- LinkedIn link
- RSS link

## 권장 초기 설정

### Navigation layout

- Logo on the left
- Logo in the middle
- Stacked

기술 블로그라면 `Logo on the left`가 가장 일반적입니다.

### Title font / Body font

사이트 스타일에 맞게 선택합니다.

### Social links

푸터에 표시됩니다.

권장

- GitHub
- RSS
- LinkedIn
- X

* * *

# 8. Navigation 설정

Ghost navigation도 함께 점검해야 합니다.

Settings → Navigation

## 권장 메뉴 예시

기본 메뉴

- Home → `/`
- Explore → `/explore/`
- Categories → `/categories/`
- Series → `/series/`

선택 메뉴

- Topics → `/secondary-tags/`
- Search → `/search/`

## 주의

이 테마는 헤더에 Explore / Categories / Series 링크가 코드로 포함되어 있습니다.  
Ghost navigation에도 동일 메뉴를 추가하면 **중복 메뉴**가 생길 수 있습니다.

* * *

# 9. 첫 콘텐츠 준비

이 테마는 taxonomy 구조가 핵심이므로  
설치 직후 테스트용 콘텐츠를 만드는 것이 좋습니다.

## 권장 테스트 태그

### Category

`category-ai` `category-unix` `category-security`

### Series

`series-ai-agents` `series-unix-design`

### Topic

`python` `docker` `linux` `llm`

## 테스트 포스트 예시

### Post 1

Title

`Why Unix Pipes Changed Software Design`

Tags

`category-unix` `series-unix-design` `linux` `shell` `cli`

### Post 2

Title

`stdout and stderr Were Never the Same Thing`

Tags

`category-unix` `series-unix-design` `linux` `process` `shell`

### Post 3

Title

`AI Agents Need Better Operational Boundaries`

Tags

`category-ai` `series-ai-agents` `python` `llm` `mlops`

* * *

# 10. 설치 후 확인 페이지

설치가 끝났다면 아래 URL을 확인합니다.

- `/` 
- `/explore/` 
- `/categories/`
- `/series/`
- `/secondary-tags/`
- `/search/`

## 기대 결과

### Home

- 포스트 피드 표시
- 레이아웃 정상
- Light/Dark 토글 표시

### Explore

- categories / series / topics / recent posts 블록 표시

### Categories

- `category-*` 태그만 표시

### Series

- `series-*` 태그만 표시

### Topics

- 일반 topic 태그만 표시

### Search

- 검색 입력창 표시
- 2글자 이상 입력 시 결과 표시

* * *

# 11. Tag archive 확인

다음 페이지도 확인합니다.

- `/tag/category-unix/`
- `/tag/series-unix-design/`
- `/tag/python/`

## 기대 결과

- tag header 정상 표시
- featured post 표시 가능
- 포스트 목록 정상
- pagination 정상

* * *

# 12. 포스트 페이지 확인

시리즈 태그가 붙은 포스트를 열어 확인합니다.

확인 항목

- 제목 / 본문 / 대표 이미지
- TOC 표시
- previous / next navigation
- series navigation
- 태그 표시명 정상

시리즈 태그가 있는 경우  
포스트 하단에 해당 시리즈 글 목록이 자동 표시됩니다.

* * *

# 13. Light / Dark 토글 확인

확인 방법

1. 사이트 접속
2. 테마 토글 클릭
3. 색상 변경 확인
4. 새로고침 후 상태 유지 확인

토글 상태는 `localStorage`에 저장됩니다.

* * *

# 14. 이미지 fallback 확인

이미지가 없는 경우 fallback 이미지가 사용됩니다.

확인 대상

- 대표 이미지 없는 포스트
- 대표 이미지 없는 category tag
- 대표 이미지 없는 series tag
- 대표 이미지 없는 topic tag

UI가 깨지지 않고 기본 이미지가 표시되어야 합니다.

* * *

# 15. 설치 완료 기준

다음 조건을 만족하면 설치가 정상 완료된 것입니다.

## 필수

- Theme 업로드 완료
- Theme 활성화 완료
- routes.yaml 적용
- 홈 페이지 정상 표시
- Explore / Categories / Series / Topics / Search 페이지 접근 가능

## 권장

- 로고 / 아이콘 설정
- social links 설정
- navigation 정리
- 테스트 콘텐츠 생성

* * *

# 16. 자주 발생하는 문제

## routes.yaml 미적용

허브 페이지가 열리지 않습니다.

## tag prefix 오류

예

ai-category my-series

올바른 예

category-ai series-my-series

## 콘텐츠 없는 상태

허브 페이지가 비어 보일 수 있습니다.

## navigation 중복

Ghost navigation과 헤더 메뉴가 중복될 수 있습니다.

## 검색 기대치

검색은 간단한 클라이언트 필터 방식입니다.

* * *

# 17. 운영 전 체크리스트

- [ ] Theme 업로드 
- [ ] Theme 활성화 
- [ ] routes.yaml 적용 
- [ ] 로고 설정 
- [ ] 아이콘 설정 
- [ ] social links 설정 
- [ ] navigation 설정 
- [ ] category 태그 생성 
- [ ] series 태그 생성 
- [ ] topic 태그 생성 
- [ ] 테스트 포스트 작성 
- [ ] Explore / Categories / Series 페이지 확인 
- [ ] post TOC 확인 
- [ ] series navigation 확인 
- [ ] Light / Dark 토글 확인

* * *

# 18. 다음 문서

설치가 완료되면 다음 문서를 읽는 것을 권장합니다.

- `configuration.md` 
- `content-model.md`
- `writing-guide.md`
- `features.md`
- `troubleshooting.md`

특히 `content-model.md`는 이 테마의 핵심 개념을 설명하는 문서입니다.