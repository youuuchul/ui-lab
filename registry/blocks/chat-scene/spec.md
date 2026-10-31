# 캐릭터 대화 화면 기획 문서
캐릭터와 제한 시간 안에 대화하는 라운드 화면.

## PRD 요약
### 문제
- 캐릭터가 많은 챗 서비스에서 사용자는 누구와 대화할지 고르기 어렵다(탐색 피로). 짧은 라운드로 여러 캐릭터를 만나 보는 형식으로 푼다. (HeartTable AI 저장소/README.md)
- 캐릭터 이미지가 한 장으로 고정되면 대화에 반응하는 느낌이 약하다. 답의 감정에 맞춰 표정을 바꿔 몰입을 높인다. (docs/requirements/emotion-driven-expression.md)
- 답을 기다리는 동안 아무 표시가 없으면 "멈췄나" 오해한다. (docs/requirements/chat-latency.md)
- 첫마디를 고민하다 말을 걸지 못한다. 추천 질문으로 시작을 돕는다. (가정, 원본은 추천 질문 사용을 docs/requirements/analytics-funnel.md에서 계측)

### 대상 사용자
- 캐릭터챗을 가볍게 시작해 보려는 모바일 사용자
- 상황극 문법(`*행동* 대사`)으로 장면에 참여하려는 사용자 (docs/requirements/roleplay-rotation-chat.md)

### 목표 지표
- 첫 발화율: 첫 `round_message_sent` / `round_started` (docs/requirements/analytics-kpi-strategy.md, Character Health)
- 평균 유저 발화: `round_message_sent` / `round_started` (같은 문서)
- 추천 질문 사용률: `suggestion_used` / `round_started` (docs/requirements/analytics-funnel.md)
- 북극성(원본 서비스 기준): 유효 소개팅 완료 세션. 이 블록은 한 라운드만 다뤄 직접 재지 않는다. (analytics-kpi-strategy.md)

### 해결 방향
- 전체 화면 캐릭터 이미지 위에 말풍선·타이머·입력창을 겹친다.
- 보내면 빈 상대 말풍선(`...`)을 먼저 붙이고, 답이 오면 채우며 표정을 바꾼다.
- 제한 시간이 끝나면 입력을 잠그고 다시 시작을 연다.

### 범위
- 담은 것: 한 라운드 대화 루프, 표정 전환, 원형 타이머, 추천 답변, `*행동*` 감싸기, 답 실패 복구, 다시 시작
- 뺀 것과 이유
  - SSE 스트리밍: `reply`를 Promise 하나로 단순화. 스트리밍은 쓰는 쪽에서 빈 말풍선을 조각마다 갱신
  - 스트리밍 중 선입력 큐: 답을 기다리는 동안 입력을 잠그는 단순 규칙으로 대신
  - 여러 캐릭터 로테이션, 호감 쪽지: 한 라운드 화면만 다룸
  - 호감도 판정(judge), 매칭 결과·보상: 서버·결과 화면 영역
  - 메타 공격 방어, 출력 sanitize: 서버 프롬프트 영역

### 위험과 확인할 것
- 답을 기다리는 동안에도 타이머가 흐른다. 응답이 느리면 대화 횟수가 줄어든다. 라운드 길이와 응답 시간을 함께 본다.
- 표정 이미지는 처음에 모두 받는다. 표정 수가 늘면 첫 로딩이 무거워진다.
- 입력 잠금이 "멈춤"으로 읽히는지 확인한다. 원본은 선입력 큐로 이 문제를 풀었다.

## 단계 분리
| 단계 | 범위                       | 확인할 것             |
|------|----------------------------|-----------------------|
| MVP  | 한 라운드 대화·표정·타이머 | 첫 발화율, 실패 복구  |
| v1   | SSE 스트리밍, 선입력 큐    | 답 대기 중 이탈       |
| v2   | 3명 로테이션, 호감 쪽지    | 라운드별 도달, 완료율 |
| v3   | 호감도 판정, 매칭 결과     | 유효 완료 세션        |

## 유저 스토리
- 첫 대화를 시작하는 사용자로서, 말 거는 부담을 줄이기 위해 추천 답변을 골라 보내고 싶다.
  - Given 라운드 시작, When 추천 버튼을 눌러 하나를 고른다, Then 입력창에 채워지고 바로 보내지지 않는다.
  - Given 추천 문구가 채워짐, When 보낸다, Then 내 말풍선과 `...` 상대 말풍선이 붙고 입력창이 잠긴다.
- 상황극에 참여하는 사용자로서, 장면을 만들기 위해 행동과 대사를 함께 보내고 싶다.
  - Given 입력창, When 행동 입력 버튼을 누른다, Then `*행동*`이 들어가고 "행동"이 선택된다.
  - Given 상대 답에 `*...*`가 있음, When 말풍선이 그려진다, Then 지문은 기울임 글씨로, 대사는 말풍선으로 나뉜다.
- 대화하는 사용자로서, 내 말이 통했는지 알기 위해 캐릭터의 표정 변화를 보고 싶다.
  - Given 기본 표정, When 답과 함께 `smile`이 온다, Then 배경 이미지가 웃는 표정으로 크로스페이드된다.
  - Given 없는 표정 키가 옴, When 답이 반영된다, Then 기본 표정을 보여준다.
- 시간이 끝난 사용자로서, 같은 캐릭터와 다시 해 보기 위해 라운드를 처음부터 시작하고 싶다.
  - Given 타이머 0초, When 다시 시작을 누른다, Then 대화·표정·타이머가 처음 상태로 돌아간다.

## 기능 명세
### 상태
| 상태      | 화면                        | 들어오는 조건   | 나가는 조건     |
|-----------|-----------------------------|-----------------|-----------------|
| 대화 가능 | 입력창 활성, 타이머 진행    | 마운트, 답 도착 | 전송, 시간 종료 |
| 답 대기   | `...` 말풍선, 입력 잠김     | 전송            | 답 도착, 실패   |
| 답 실패   | 안내 말풍선, 입력 다시 열림 | `reply` 실패    | 다음 전송       |
| 시간 종료 | 입력 잠김, 다시 시작 버튼   | 남은 시간 0     | 다시 시작       |

### 동작
- 타이머는 1초마다 줄고, 원형 진행과 `분:초` 라벨로 보여준다. 답을 기다리는 동안에도 멈추지 않는다.
- 전송: 내 메시지와 빈 상대 말풍선을 붙이고 입력창을 잠근다. `reply(text)`의 `content`로 빈 말풍선을 채우고 `expression`으로 표정을 바꾼다.
- 새 메시지가 붙으면 목록을 맨 아래로 부드럽게 스크롤한다. 오래된 메시지는 흐려진다.
- 다시 시작: 대화를 `initial`로, 표정을 `default`로, 남은 시간을 `seconds`로 되돌린다.
- 입력창 동작(Enter, IME, 추천, 감싸기)은 [채팅 입력창](#/components/chat-input) 명세를 따른다.

### 예외
- `reply` 실패: 빈 상대 말풍선을 지우고 "답을 받지 못했어요. 다시 보내 주세요"를 시스템 말풍선으로 띄운 뒤 입력창을 연다.
- 답을 기다리는 중 다시 시작: 이전 라운드의 답·실패는 버린다(라운드 번호 비교).
- 답을 기다리는 중 시간 종료: 도착한 답은 채우지만 입력창은 잠긴 채로 둔다.
- 없는 표정 키: `default` 이미지로 보여준다.
- 재시도 버튼, 자동 재전송, 타임아웃: 쓰는 쪽에서 처리.
- 대화 저장, 세션 복구, 라운드 결과 집계: 쓰는 쪽에서 처리.

### 측정
- `round_started` { round_number, character_id }: 마운트와 다시 시작 때. (analytics-funnel.md)
- `round_message_sent` { round_number, character_id, message_index, is_first }: 전송 때. (analytics-funnel.md)
- `suggestion_opened` { round_number, character_id, suggestions_count }, `suggestion_used` { round_number, character_id, suggestion_index, suggestion_text }: 추천 패널. (analytics-funnel.md)
- `round_time_expired` { round_number, total_rounds, character_id }: 남은 시간 0. (analytics-funnel.md)
- `chat_reply_failed` { round_number, character_id } (가정): `reply` 실패 때. 원본 이벤트 카탈로그에 없다.
- `round_restarted` { round_number } (가정): 다시 시작. 이 블록에만 있는 동작이다.

## 구성 컴포넌트
- [크로스페이드 이미지 스택](#/components/crossfade-image-stack)
- [원형 카운트다운](#/components/countdown-ring)
- [흐려지는 채팅 말풍선](#/components/chat-bubble)
- [채팅 입력창](#/components/chat-input)

## 근거 문서
- HeartTable AI 저장소/README.md
- HeartTable AI 저장소/docs/README.md
- HeartTable AI 저장소/docs/BACKLOG.md
- HeartTable AI 저장소/docs/requirements/roleplay-rotation-chat.md
- HeartTable AI 저장소/docs/requirements/emotion-driven-expression.md
- HeartTable AI 저장소/docs/requirements/chat-latency.md
- HeartTable AI 저장소/docs/requirements/analytics-kpi-strategy.md
- HeartTable AI 저장소/docs/requirements/analytics-funnel.md
