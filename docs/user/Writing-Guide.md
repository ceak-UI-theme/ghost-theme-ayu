# Writing Guide

이 문서는 **Signal Wave Ayu 테마에서 글을 작성할 때의 권장 방식**을 설명합니다.

이 테마는 단순히 글을 시간순으로 나열하는 블로그가 아니라,  
**Category / Series / Topic 구조를 기반으로 콘텐츠를 체계적으로 정리하는 기술 블로그**를 목표로 설계되어 있습니다.

따라서 글을 작성할 때는 단순히 포스트를 작성하는 것이 아니라,  
**어떤 구조 안에 이 글이 들어가는지**를 함께 고려하는 것이 중요합니다.

이 문서는 다음 내용을 다룹니다.

- 글 작성 기본 흐름
- 태그 사용 규칙
- Category / Series / Topic 사용 방법
- Feature Image 사용 가이드
- 장문 기술 글 작성 권장 방식
- 시리즈 글 작성 방식
- 좋은 태그 설계 방법
- 추천 작성 패턴

* * *

# 1. 글 작성 기본 흐름

Signal Wave Ayu 테마에서 글을 작성하는 일반적인 흐름은 다음과 같습니다.

1. 글 제목 작성
2. Feature Image 설정
3. 본문 작성
4. Category 태그 설정
5. Series 태그 설정 (선택)
6. Topic 태그 추가
7. 발행

즉 실제 작성 순서는 보통 다음과 같습니다.

```
Title
 ↓ 
Feature Image
 ↓ 
본문 작성
 ↓ 
Tags 설정 
 ↓ 
Publish
```

이 테마에서 **Tag 설정은 매우 중요합니다.**

Tag는 단순한 분류가 아니라 다음을 결정합니다.

- Category 페이지
- Series 페이지
- Topics 페이지
- Explore 페이지
- Series navigation
- Tag archive

즉 태그가 곧 **콘텐츠 구조**입니다.

* * *

# 2. 태그 구조 이해

Signal Wave Ayu 테마는 Ghost의 기본 tag 기능을 사용하지만,  
**slug prefix 규칙을 통해 tag의 의미를 해석합니다.**

기본 규칙은 다음과 같습니다.

- `category-*` → Category 
- `series-*` → Series 
- others → Topic

예시

`category-ai` `series-ai-agents` `python` `llm` `mlops`

이 경우 의미는 다음과 같습니다.

Category  
→ AI

Series  
→ AI Agents

Topics  
→ Python, LLM, MLOps

* * *

# 3. Category 사용 방법

Category는 **가장 큰 주제 단위**입니다.

일반적으로 블로그 전체를 4~10개 정도의 Category로 나누는 것이 좋습니다.

예시

`category-ai` `category-unix` `category-security` `category-infrastructure` `category-devtools`

Category의 역할

- 블로그의 큰 주제 구분
- `/categories/` 허브 페이지 구성
- Explore 페이지 구성
- Tag archive 구성

한 글에는 **Category를 1개만 사용하는 것을 권장합니다.**

좋은 예

`category-ai`

권장하지 않는 예

`category-ai` `category-security` `category-ml`

Category는 글의 **주된 영역을 나타내는 것**이므로  
여러 개를 동시에 사용하는 것은 구조를 흐리게 만듭니다.

* * *

# 4. Series 사용 방법

Series는 **연재형 글 묶음**입니다.

예를 들어 다음과 같은 경우 Series를 사용합니다.

- 특정 기술 주제의 연재
- 프로젝트 개발 기록
- 책 형태의 글 묶음
- 연속된 튜토리얼

예시

`series-ai-agents` `series-unix-design` `series-readium-devlog` `series-ghost-theme-build`

Series의 특징

- 포스트 하단에 **Series navigation** 생성
- 시리즈 글 목록 자동 구성
- 발행 순서 기준으로 정렬

예시

`series-unix-design`

Series는 **없어도 됩니다.**

즉 모든 글이 Series에 속할 필요는 없습니다.

일반적으로 다음과 같이 사용하는 것이 좋습니다.

- Series 없는 일반 글
- Series 글

* * *

# 5. Topic 태그

Topic은 가장 자유로운 태그입니다.

Category와 Series를 제외한 모든 태그는 Topic으로 처리됩니다.

예시

`docker` `python` `kubernetes` `linux` `observability` `system-design`

Topic의 역할

- `/secondary-tags/` 페이지
- Explore 페이지
- Tag archive
- 검색

Topic은 보통 한 글에 **여러 개를 사용합니다.**

예시

`category-ai` `series-ai-agents` `python` `llm` `mlops` `vector-db`

* * *

# 6. 추천 태그 패턴

이 테마에서 가장 안정적인 패턴은 다음과 같습니다.

Category 1개 Series 0~1개 Topics 여러 개

예시

`category-ai` `series-ai-agents` `python` `llm` `mlops` `vector-db` `rag`

또 다른 예

`category-unix` `series-unix-design` `linux` `shell` `process` `cli`

Series가 없는 경우

`category-devtools` `docker` `containers` `linux`

* * *

# 7. Feature Image 사용

Feature Image는 포스트 카드와 포스트 페이지 상단에서 사용됩니다.

권장 이유

- 피드 가독성 향상
- 허브 페이지 시각 구조 개선
- SNS 공유 시 표시

권장 크기

16:9 비율 1600 x 900 이상

Feature Image가 없는 경우

테마는 자동으로 다음 fallback 이미지를 사용합니다.

`/assets/images/fallback/post-default.png`

* * *

# 8. 장문 기술 글 작성 권장 방식

Signal Wave Ayu는 **장문 글 중심 테마**입니다.

따라서 다음 구조를 권장합니다.

```
Intro

Problem

Background

Main Idea

Details

Examples

Conclusion
```

또는 기술 글의 경우 다음 구조도 좋습니다.

```
Introduction 

Concept 

Architecture 

Implementation 

Examples 

Trade-offs 

Conclusion
```

* * *

# 9. Heading 구조

TOC 기능이 자동 생성되므로  
heading 구조를 잘 사용하는 것이 중요합니다.

권장 구조

```
Title

Section

Subsection

Subsection

Section
```

너무 깊은 heading 구조는 권장하지 않습니다.

권장

`H1` `H2` `H3`

비권장

`H4` `H5` `H6`

* * *

# 10. 시리즈 글 작성 패턴

시리즈 글은 보통 다음 구조를 가집니다.

```
Part 1 Introduction

Part 2 Core Concept

Part 3 Architecture

Part 4 Implementation
```

모든 글에 동일한 series tag를 추가합니다.

예시

`series-unix-design`

결과

- 포스트 하단에 시리즈 목록 자동 표시
- 현재 글 위치 강조
- 시리즈 페이지 자동 구성

* * *

# 11. 좋은 태그 설계 방법

태그는 블로그 구조이므로  
처음부터 어느 정도 규칙을 정하는 것이 좋습니다.

좋은 예

`category-system-design` `series-distributed-systems` `distributed-systems` `microservices` `event-driven`

권장 규칙

- slug는 소문자
- 단어 구분은 하이픈
- 짧고 명확한 이름
- 중복 의미 태그 금지

예

좋음

`system-design` `distributed-systems` `event-driven`

나쁨

`SystemDesign` `system_design` `systemdesign`

* * *

# 12. Feature Image 없는 글

Feature Image가 없어도 문제 없습니다.

테마는 다음 이미지를 자동 사용합니다.

`post-default.png`

다만 다음 글에는 Feature Image를 추천합니다.

- 시리즈 글
- 메인 글
- 대표 글
- 긴 글

* * *

# 13. Explore 페이지에 나타나는 콘텐츠

Explore 페이지에는 다음이 표시됩니다.

- Top Categories
- Top Series
- Top Topics
- Recent Posts

즉 글의 태그와 구조에 따라 Explore 페이지도 자동 구성됩니다.

* * *

# 14. 글 작성 예시

예시 포스트

Title

`Why Unix Pipes Changed Software Design`

Tags

`category-unix` `series-unix-design` `linux` `shell` `cli`

결과

- `/categories/` → Unix
- `/series/` → Unix Design
- `/tag/series-unix-design/`
- 포스트 하단 series navigation

* * *

# 15. 핵심 정리

Signal Wave Ayu에서 글 작성 시 가장 중요한 원칙은 다음과 같습니다.

1. Category는 글의 큰 주제를 나타낸다
2. Series는 연재 글을 묶는다
3. Topics는 기술 키워드를 나타낸다
4. Tag 구조가 곧 블로그 구조다
5. Heading을 잘 사용하면 TOC가 자동 생성된다

즉 이 테마는 단순한 블로그가 아니라  
**구조화된 기술 글 아카이브**를 만들기 위한 테마입니다.