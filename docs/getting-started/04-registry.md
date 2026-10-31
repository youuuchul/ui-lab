# 레지스트리
모든 항목은 shadcn 레지스트리 형식의 JSON으로 배포된다.

## 주소
| 대상   | 주소                                               |
|--------|----------------------------------------------------|
| 인덱스 | `https://youuuchul.github.io/ui-lab/r/index.json`  |
| 항목   | `https://youuuchul.github.io/ui-lab/r/<이름>.json` |
| 토큰   | `https://youuuchul.github.io/ui-lab/r/tokens.json` |

## 항목 JSON
| 필드                   | 내용                                             |
|------------------------|--------------------------------------------------|
| `files[].content`      | 파일 원문. `demo.tsx`와 `meta.ts`는 빠진다       |
| `files[].target`       | 설치 위치 `components/ui-lab/<층>/<이름>/<파일>` |
| `dependencies`         | 외부 패키지와 버전                               |
| `registryDependencies` | 토큰, 그리고 블록이 쓰는 컴포넌트                |

JSON은 배포할 때 `registry/` 폴더에서 다시 만든다. 손으로 고치지 않는다.

## 항목
<!-- items:start -->
| 이름                                                           | 종류     | 분류                     | 레지스트리 주소                 |
|----------------------------------------------------------------|----------|--------------------------|---------------------------------|
| [사례 바인더](#/blocks/career-binder)                          | 블록     | 포트폴리오 사이트        | `/r/career-binder.json`         |
| [캐릭터 대화 화면](#/blocks/chat-scene)                        | 블록     | HeartTable AI            | `/r/chat-scene.json`            |
| [3D 역량 그래프 히어로](#/blocks/force-graph-hero)             | 블록     | 포트폴리오 사이트        | `/r/force-graph-hero.json`      |
| [퍼널 분석 대시보드](#/blocks/funnel-analysis)                 | 블록     | PlaceWave                | `/r/funnel-analysis.json`       |
| [KPI 개요 대시보드](#/blocks/kpi-overview)                     | 블록     | PlaceWave                | `/r/kpi-overview.json`          |
| [추리 게임 플레이 화면](#/blocks/murder-mystery-play)          | 블록     | Murder Mystery Generator | `/r/murder-mystery-play.json`   |
| [PetGlobe 첫 화면](#/blocks/petglobe-home)                     | 블록     | PetGlobe                 | `/r/petglobe-home.json`         |
| [3D 폰 목업](#/blocks/phone-3d)                                | 블록     | 포트폴리오 사이트        | `/r/phone-3d.json`              |
| [검색 품질 대시보드](#/blocks/search-quality)                  | 블록     | PlaceWave                | `/r/search-quality.json`        |
| [아코디언](#/components/accordion)                             | 컴포넌트 | 탐색                     | `/r/accordion.json`             |
| [배지](#/components/badge)                                     | 컴포넌트 | 상태                     | `/r/badge.json`                 |
| [버튼](#/components/button)                                    | 컴포넌트 | 입력                     | `/r/button.json`                |
| [흐려지는 채팅 말풍선](#/components/chat-bubble)               | 컴포넌트 | 대화                     | `/r/chat-bubble.json`           |
| [채팅 입력창](#/components/chat-input)                         | 컴포넌트 | 대화                     | `/r/chat-input.json`            |
| [원형 카운트다운](#/components/countdown-ring)                 | 컴포넌트 | 상태                     | `/r/countdown-ring.json`        |
| [크로스페이드 이미지 스택](#/components/crossfade-image-stack) | 컴포넌트 | 미디어                   | `/r/crossfade-image-stack.json` |
| [증거 목록 행](#/components/evidence-row)                      | 컴포넌트 | 미디어                   | `/r/evidence-row.json`          |
| [폭 맞춤 타이포](#/components/fit-text)                        | 컴포넌트 | 모션                     | `/r/fit-text.json`              |
| [퍼널 히트맵 표](#/components/funnel-heatmap)                  | 컴포넌트 | 데이터                   | `/r/funnel-heatmap.json`        |
| [은하수 글로브](#/components/galaxy-globe)                     | 컴포넌트 | 모션                     | `/r/galaxy-globe.json`          |
| [KPI 스코어보드](#/components/kpi-scoreboard)                  | 컴포넌트 | 데이터                   | `/r/kpi-scoreboard.json`        |
| [로딩 오버레이](#/components/loading-overlay)                  | 컴포넌트 | 오버레이                 | `/r/loading-overlay.json`       |
| [경로 생키](#/components/path-sankey)                          | 컴포넌트 | 데이터                   | `/r/path-sankey.json`           |
| [인물 선택 목록](#/components/portrait-choice)                 | 컴포넌트 | 입력                     | `/r/portrait-choice.json`       |
| [마스크 텍스트 등장](#/components/rise-text)                   | 컴포넌트 | 모션                     | `/r/rise-text.json`             |
| [세그먼트 컨트롤](#/components/segmented-control)              | 컴포넌트 | 입력                     | `/r/segmented-control.json`     |
| [세그먼트 프로그레스](#/components/segmented-progress)         | 컴포넌트 | 상태                     | `/r/segmented-progress.json`    |
| [원형 3D 캐러셀](#/components/service-carousel)                | 컴포넌트 | 탐색                     | `/r/service-carousel.json`      |
| [스켈레톤](#/components/skeleton)                              | 컴포넌트 | 상태                     | `/r/skeleton.json`              |
| [정렬 표](#/components/sortable-table)                         | 컴포넌트 | 데이터                   | `/r/sortable-table.json`        |
| [탭](#/components/tabs)                                        | 컴포넌트 | 탐색                     | `/r/tabs.json`                  |
| [텍스트 필드](#/components/text-field)                         | 컴포넌트 | 입력                     | `/r/text-field.json`            |
| [토스트](#/components/toast)                                   | 컴포넌트 | 오버레이                 | `/r/toast.json`                 |
| [토글](#/components/toggle)                                    | 컴포넌트 | 입력                     | `/r/toggle.json`                |
| [툴팁](#/components/tooltip)                                   | 컴포넌트 | 오버레이                 | `/r/tooltip.json`               |
| [추이 선 차트](#/components/trend-chart)                       | 컴포넌트 | 데이터                   | `/r/trend-chart.json`           |
<!-- items:end -->
