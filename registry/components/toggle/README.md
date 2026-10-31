# 토글

설정을 켜거나 끄는 두 상태 입력. 누르는 즉시 적용된다.

## Props
| 이름             | 타입                         | 기본값  | 설명                            |
|------------------|------------------------------|---------|---------------------------------|
| `label`          | `string`                     | -       | 설정 이름. 스위치의 접근성 이름 |
| `description`    | `string`                     | -       | 라벨 아래 보조 설명             |
| `checked`        | `boolean`                    | -       | 제어 모드 값                    |
| `defaultChecked` | `boolean`                    | `false` | 비제어 모드 초기값              |
| `onChange`       | `(checked: boolean) => void` | -       | 바뀐 값                         |
| `disabled`       | `boolean`                    | `false` |                                 |
| `hideLabel`      | `boolean`                    | `false` | 라벨을 화면에서만 숨김          |

## 접근성
- `role="switch"` + `aria-checked`. 라벨은 `aria-labelledby`, 설명은 `aria-describedby`로 연결한다.
- 네이티브 `button`이라 Space·Enter로 켜고 끈다.

## 구현 메모
- `checked`를 넘기면 제어, 안 넘기면 내부 상태를 쓴다.
- 서버 저장이 필요하면 제어 모드로 낙관적으로 바꾸고, 실패 시 이전 값으로 되돌린다.
