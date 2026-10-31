# 로딩 오버레이 기능 명세
서버가 깨어나는 동안 화면을 덮고, 오래 걸리면 알려주는 로딩 표시.

## 목적
- 콜드 스타트처럼 첫 요청이 오래 걸릴 때 사용자가 멈춘 것으로 오해하지 않게 하고, 한계 시간이 지나면 쓰는 쪽이 대안을 보여주게 한다.

## 사용자 시나리오
1. 사용자가 "다시 불러오기"를 누르면 영역이 덮이고 스피너와 "불러오는 중"이 보인다.
2. 응답이 오래 걸려 2.5초(데모 설정)가 지나면 쓰는 쪽이 "응답이 늦어요"와 "다시 시도"를 보여준다.
3. 사용자가 "취소"를 누르면 덮개가 사라진다.

## 상태
| 상태      | 화면                      | 들어오는 조건  | 나가는 조건  |
|-----------|---------------------------|----------------|--------------|
| 숨김      | 없음                      | active=false   | active=true  |
| 로딩      | 반투명 덮개, 스피너, 문구 | active=true    | active=false |
| 시간 초과 | 로딩 화면 그대로          | timeoutMs 경과 | active=false |

- 시간 초과는 화면이 바뀌지 않는 알림 시점일 뿐이다. 덮개는 쓰는 쪽이 `active`를 끌 때까지 남는다.
- 데모는 시간 초과 때 `active`를 끄고 "응답이 늦어요" 화면으로 바꾼다.

## 동작
- `active`가 켜지면 덮개와 `message`를 보이고 `timeoutMs`(기본 60000ms) 타이머를 시작한다.
- 타이머가 끝날 때까지 `active`가 켜져 있으면 `onTimeout`을 한 번 호출한다.
- `active`를 끄면 타이머를 취소하고 덮개를 즉시 제거한다. 다시 켜면 타이머가 처음부터다.
- `onCancel`을 넘기면 "취소" 버튼이 나온다. 누르면 `onCancel`만 호출한다. 덮개를 끄는 일은 쓰는 쪽이 한다.
- `message`는 `role="status"`·`aria-live="polite"`로 읽힌다.
- `scope="viewport"`는 화면 전체, `scope="parent"`는 가장 가까운 relative 부모를 덮는다.
- 스피너는 동작 줄이기에서 돌지 않는다. 취소 버튼은 터치 40px 이상이다.
- `onTimeout`을 매 렌더마다 새 함수로 넘겨도 타이머가 다시 시작되지 않는다.

## 예외
- 시간 초과 뒤에도 `active`가 켜져 있으면 덮개가 남는다. 재시도 화면 전환은 쓰는 쪽에서 처리한다.
- `onTimeout`이 없으면 시간이 지나도 아무 일도 없다. 무한 로딩을 막으려면 쓰는 쪽에서 반드시 처리한다.
- Esc 닫기, 덮개 뒤 포커스 차단(`inert`), 부모 `aria-busy`는 컴포넌트가 하지 않는다. 쓰는 쪽에서 처리한다(README 안내와 코드가 다르다).
- 요청 자체의 취소(네트워크 중단)는 하지 않는다. `onCancel`에서 쓰는 쪽이 중단한다.
- 1초 안에 끝나는 요청에 쓰면 깜빡이기만 한다. 쓰는 쪽에서 지연해 보인다.

## 인수 조건
- Given `active=true`, When 화면을 본다, Then 덮개에 스피너와 `message`가 보인다.
- Given `active=true`·`timeoutMs=2500`, When 2.5초가 지난다, Then `onTimeout`이 한 번 호출되고 덮개는 `active`를 끌 때까지 남는다.
- Given `active=true`, When 2.5초 전에 `active`를 끈다, Then 덮개가 사라지고 `onTimeout`은 호출되지 않는다.
- Given `onCancel`이 있음, When "취소"를 클릭한다, Then `onCancel`이 호출된다. `onCancel`이 없으면 버튼이 없다.
- Given `scope="parent"`, When 렌더한다, Then 덮개가 relative 부모 영역만 덮는다.
- Given 동작 줄이기 설정, When 로딩을 본다, Then 스피너가 돌지 않는다.

## 측정
- `loading_started` { screen, scope }
- `loading_timeout` { screen, timeout_ms } : `onTimeout`에서 남긴다.
- `loading_canceled` { screen, elapsed_ms }
- `loading_completed` { screen, elapsed_ms } : 정상 종료 시. 목표값은 정하지 않는다.

## 범위 밖
- 요청 상태 관리, 재시도 화면, 오류 화면.
- 덮개 뒤 콘텐츠 `inert`·`aria-busy` 처리.
- 진행률 표시, 단계별 문구 변경.
- 네트워크 요청 중단.
