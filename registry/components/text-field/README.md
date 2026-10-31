# 텍스트 필드

라벨·도움말·오류·글자 수를 갖춘 한 줄 입력칸.

## Props
| 이름                      | 타입                      | 기본값   | 설명                                                           |
|---------------------------|---------------------------|----------|----------------------------------------------------------------|
| `label`                   | `string`                  | -        | 항상 보이는 라벨                                               |
| `helperText`              | `string`                  | -        | 입력 규칙 안내                                                 |
| `error`                   | `string`                  | -        | 있으면 오류 상태. 도움말 자리에 대신 보인다                    |
| `value` / `defaultValue`  | `string`                  | - / `""` | 제어 / 비제어                                                  |
| `onChange`                | `(value: string) => void` | -        | 이벤트가 아닌 문자열을 넘긴다                                  |
| `maxLength` + `showCount` | `number` + `boolean`      | -        | `3/12` 글자 수 표시                                            |
| `trailing`                | `ReactNode`               | -        | 단위, 지우기 버튼 등                                           |
| 그 밖의 `input` 속성      |                           |          | `type`, `placeholder`, `onBlur`, `autoComplete` 등 그대로 전달 |

## 접근성
- `label`의 `htmlFor`로 연결한다. 도움말·오류·글자 수는 `aria-describedby`로 읽힌다.
- 오류 상태면 `aria-invalid`를 주고, 오류 문구는 `aria-live="polite"`로 바뀔 때 읽힌다.

## 구현 메모
- 테두리는 칸 전체(`focus-within`)에 걸어서 `trailing`이 있어도 하나의 입력칸으로 보인다.
- 검사 로직은 넣지 않았다. 언제·무엇을 검사할지는 쓰는 쪽에서 `error`로 넘긴다.
