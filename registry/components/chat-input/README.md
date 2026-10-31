# 채팅 입력창

추천 답변, 감싸기 버튼, 자동 높이를 갖춘 채팅 입력창.

## Props
| 이름 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `onSend` | `(content: string) => void` | - | 앞뒤 공백을 제거한 내용 |
| `disabled` | `boolean` | `false` | 응답 생성 중 등 |
| `placeholder` | `string` | `"메시지 입력"` | |
| `suggestions` | `string[]` | - | 없으면 `?` 버튼을 숨김 |
| `suggestionsLoading` | `boolean` | `false` | 패널에 `loadingLabel` 표시 |
| `onSuggestionUsed` | `(s, index) => void` | - | 추천을 고른 순간 (분석 이벤트용) |
| `hintDelayMs` | `number` | `8000` | 빈 입력으로 이 시간이 지나면 `?` 버튼 강조 |
| `wrap` | `{ marker, placeholder, label }` | - | 선택 글자를 marker로 감싸는 버튼 |
| `maxHeight` | `number` | `120` | 자동 높이 상한(px, 약 5줄) |

## 동작
- 데스크톱(`pointer: fine`)은 Enter 전송, Shift+Enter 줄바꿈. 터치 기기는 Enter가 줄바꿈이다.
- 한글 IME 조합 중 Enter(`isComposing`)는 조합 확정에 쓰이므로 전송하지 않는다.
- 추천 패널은 입력창 바깥을 누르면 닫힌다.
- 추천을 고르면 입력창에 채우고 커서를 끝으로 옮긴다. 바로 보내지 않고 고칠 수 있게 했다.
- 감싸기는 선택한 글자가 있으면 감싼다. 없으면 `*행동*`처럼 placeholder를 넣고 그 부분을 선택해 두어 바로 덮어쓸 수 있다.

## 구현 메모
- 값을 바꾼 직후 커서를 옮겨야 해서 `flushSync`로 DOM 반영을 먼저 끝낸 다음 `setSelectionRange`를 호출한다.
