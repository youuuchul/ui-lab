# 타이포그래피
한글은 Pretendard, 숫자·영문 라벨은 Inter, 코드는 JetBrains Mono.

## 글꼴
| 토큰        | 글꼴                           | 쓰임                      |
|-------------|--------------------------------|---------------------------|
| `font-sans` | Pretendard → Inter → system-ui | 본문, 제목, UI 전체       |
| `font-mono` | JetBrains Mono                 | 코드, 타이머 숫자, 파일명 |

## 크기
| 단계        | 클래스                            | 쓰임                                           |
|-------------|-----------------------------------|------------------------------------------------|
| 페이지 제목 | `text-3xl`~`text-4xl` · bold      | 상세 페이지 제목                               |
| 섹션 제목   | `text-xl` · semibold              | 미리보기, 사용 기준                            |
| 본문        | `text-[15px]`                     | 카드 제목, 말풍선                              |
| 보조        | `text-sm`                         | 입력창, 버튼, 설명                             |
| 라벨        | `text-xs`                         | 칩, 출처, 지문(내 메시지)                      |
| 숫자        | `text-[10px]` mono `tabular-nums` | [원형 카운트다운](#/components/countdown-ring) |

## 한글 줄바꿈
- 전역에 `word-break: keep-all`. 단어 중간에서 줄이 바뀌지 않는다.
- 긴 URL·코드만 `overflow-wrap: anywhere`.
- 말풍선은 `whitespace-pre-wrap break-words`로 사용자가 넣은 줄바꿈을 살린다.

## 숫자
변하는 숫자(타이머, 카운터)는 `tabular-nums`로 폭을 고정한다. 숫자가 바뀔 때 옆 글자가 흔들리지 않는다.

## 큰 제목
포스터형 첫 화면처럼 제목이 레이아웃이 되는 곳은 [폭 맞춤 타이포](#/components/fit-text)로 컨테이너 폭에 맞춘다. 등장은 [마스크 텍스트 등장](#/components/rise-text).
