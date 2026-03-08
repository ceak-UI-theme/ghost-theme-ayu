# Content Model

Signal Wave Ayu 테마는 Ghost의 기본 **Tag 시스템**을 그대로 사용하면서도  
블로그를 **Category / Series / Topic** 구조로 운영할 수 있도록 설계되어 있습니다.

Ghost 자체에는 Category나 Series라는 개념이 존재하지 않습니다.  
하지만 이 테마는 **Tag slug 규칙(prefix)** 을 활용하여 콘텐츠를 의미적으로 분류합니다.

즉, 데이터 모델을 바꾸지 않고 **운영 규칙을 통해 구조화된 블로그를 만드는 방식**입니다.

이 문서는 Signal Wave Ayu 테마에서 사용하는 콘텐츠 모델과 태그 규칙을 설명합니다.

* * *

# 1. 기본 개념

이 테마는 모든 콘텐츠 분류를 **Ghost Tag** 하나로 처리합니다.

하지만 Tag의 **slug prefix**에 따라 의미를 다르게 해석합니다.

분류 규칙은 다음과 같습니다.

- `category-*` -> `Category` 
- `series-*` -> `Series`
- `기타 tag` -> `Topic`

예시:

`category-ai` `series-ai-agents` `python` `llm` `mlops`

이 경우 테마는 다음처럼 해석합니다.

- Category : AI 
- Series : AI Agents 
- Topics : Python, LLM, MLOps

즉 하나의 Post는 보통 다음 구조를 가집니다.

```
Post
├─ Category (1개 권장)
├─ Series (0~1개)
└─ Topics (여러 개)
```

이 구조를 통해 블로그 전체 콘텐츠를 안정적으로 조직할 수 있습니다.

* * *

# 2. Category

Category는 블로그의 **가장 큰 주제 그룹**입니다.

보통 블로그의 상위 섹션 역할을 합니다.

예시:

`category-ai` `category-unix` `category-security` `category-infrastructure` `category-system-design`

표시 이름은 slug에서 자동으로 정리됩니다.

예:

- `category-system-design` -> `System Design`
- `category-ai` -> `AI`

### Category의 역할

Category는 다음 기능에 사용됩니다.

- Categories 허브 페이지
- Explore 페이지
- Tag archive
- 포스트 메타 표시

Category는 블로그의 **콘텐츠 방향을 정의하는 큰 주제**로 사용해야 합니다.

* * *

# 3. Series

Series는 여러 글로 구성된 **연재형 콘텐츠**를 의미합니다.

예시:

`series-unix-design` `series-ai-agents` `series-readium-devlog` `series-mlops-guide`

Series에 속한 글들은 포스트 하단에 자동으로 **Series Navigation**이 생성됩니다.

예:

Series: Unix Design

1. Why Unix Pipes Changed Software Design
2. stdout and stderr Were Never the Same Thing
3. The Philosophy of Small Tools

Series는 다음 규칙을 따릅니다.

`series-{series-name}`

예:

`series-ai-agents` `series-unix-design` `series-readium-architecture`

### Series 순서

Series 글의 순서는 다음 기준으로 자동 정렬됩니다.

`published_at (오름차순)`

즉 글을 발행한 순서대로 시리즈가 구성됩니다.

* * *

# 4. Topics

Topic은 Category나 Series에 속하지 않는 **일반 태그**입니다.

예시:

`docker` `python` `kubernetes` `linux` `distributed-systems` `database` `observability`

Topic은 다음 용도로 사용됩니다.

- 기술 키워드
- 기술 스택
- 세부 주제
- 보조 분류

예:

`category-ai` `series-ai-agents` `python` `llm` `mlops` `langchain`

이 경우:

- Category : AI 
- Series : AI Agents 
- Topics : Python, LLM, MLOps, LangChain

Topics는 제한 없이 여러 개를 붙일 수 있습니다.

* * *

# 5. Tag 표시 규칙

Ghost tag는 slug와 name 두 가지 값을 가지고 있습니다.

테마는 다음 순서로 표시 이름을 결정합니다.

1. tag name이 있으면 사용
2. 없으면 slug 기반으로 생성
3. category- / series- prefix 제거
4. 하이픈(-)을 공백으로 변환
5. 단어 정리

예:

- slug: category-system-design 
- name: (없음) 
- 표시: System Design

- slug: series-ai-agents 
- name: AI Agents 
- 표시: AI Agents

즉 운영자는 slug만 잘 정해도 충분합니다.

* * *

# 6. 권장 태그 구조

Signal Wave Ayu 테마에서는 다음 구조를 권장합니다.

```
Post
├─ Category (1개)
├─ Series (0~1개)
└─ Topics (여러 개)
```

예시:

`category-ai` `series-ai-agents` `python` `llm` `mlops`

또 다른 예:

`category-unix` `series-unix-design` `linux` `shell` `cli`

또 다른 예:

`category-security` `zero-trust` `network` `architecture`

* * *

# 7. Category 운영 가이드

Category는 **적은 개수로 유지하는 것이 좋습니다.**

권장 개수:

3 ~ 8개

예:

`category-ai` `category-unix` `category-infrastructure` `category-security` `category-system-design`

Category가 너무 많아지면 블로그 구조가 흐려집니다.

* * *

# 8. Series 운영 가이드

Series는 다음 상황에서 사용하는 것이 좋습니다.

- 연속된 글
- 단계별 가이드
- 개발기
- 장기 프로젝트 기록

예:

`series-ai-agents` `series-unix-design` `series-readium-devlog` `series-kubernetes-guide`

Series는 반드시 사용할 필요는 없습니다.

독립 글에는 Series를 붙이지 않아도 됩니다.

* * *

# 9. Topic 운영 가이드

Topic은 비교적 자유롭게 사용할 수 있습니다.

예:

`docker` `python` `linux` `mlops` `observability` `database` `grpc` `distributed-systems`

하지만 다음 규칙을 권장합니다.

### slug 규칙

좋은 예:

`distributed-systems` `machine-learning` `event-driven-architecture`

좋지 않은 예:

`DistributedSystems` `machine_learning` `MACHINE-LEARNING`

### Topic 중복 방지

다음과 같은 중복은 피하는 것이 좋습니다.

`docker` `docker-container` `docker-containers`

가능하면 하나의 slug로 통일합니다.

* * *

# 10. 허브 페이지와 콘텐츠 모델

이 테마에는 다음 허브 페이지가 존재합니다.

- `/categories/`
- `/series/`
- `/secondary-tags/`
- `/explore/`

각 페이지는 다음 데이터를 사용합니다.

### Categories

`category-*` 태그

### Series

`series-*` 태그

### Topics

`category-*` 제외 `series-*` 제외 나머지 public tag

### Explore

Explore 페이지는 다음 데이터를 조합합니다.

- Top Categories 
- Top Series 
- Top Topics 
- Recent Posts

* * *

# 11. Tag Archive

Ghost 기본 tag archive도 그대로 사용됩니다.

예:

- `/tag/category-ai/` 
- `/tag/series-ai-agents/` 
- `/tag/docker/`

이 페이지들은 Ghost가 서버 사이드에서 렌더링합니다.

즉 허브 페이지와 tag archive는 역할이 다릅니다.

Hub Page -> 탐색

Tag Archive -> 실제 글 목록

* * *

# 12. Feature Image

Category, Series, Topic tag에는 **feature image**를 설정할 수 있습니다.

이 이미지는 다음 곳에 사용됩니다.

- Tag archive header
- Hub page cards

이미지가 없으면 테마는 fallback 이미지를 사용합니다.

예:

`assets/images/fallback/`

* * *

# 13. 콘텐츠 모델 요약

Signal Wave Ayu 테마의 콘텐츠 구조는 다음과 같습니다.

```
Post
├─ Category
├─ Series
└─ Topics
```

Tag slug prefix 규칙:

- `category-*` -> Category 
- `series-*` -> Series 
- 기타 -> Topic

이 모델은 다음 장점을 제공합니다.

- Ghost 기본 데이터 구조 유지
- 구조화된 블로그 운영 가능
- 허브 기반 탐색 가능
- 시리즈 글 자동 연결
- 복잡한 CMS 확장 불필요

즉 **Ghost의 단순한 Tag 시스템 위에 구조를 얹는 방식**입니다.

이 콘텐츠 모델을 기준으로 글을 작성하면  
Signal Wave Ayu 테마의 기능을 가장 자연스럽게 활용할 수 있습니다.