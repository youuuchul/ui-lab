# 아코디언

제목을 눌러 내용을 펼치고 접는 목록. 자주 묻는 질문처럼 훑어보고 골라 읽는 내용에 쓴다.

## Props
| 이름                     | 타입                          | 기본값     | 설명                     |
|--------------------------|-------------------------------|------------|--------------------------|
| `items`                  | `{ value, title, content }[]` | -          | 항목                     |
| `type`                   | `"single" \| "multiple"`      | `"single"` | 하나만 / 여러 개 열림    |
| `value` / `defaultValue` | `string[]`                    | - / `[]`   | 열린 항목. 제어 / 비제어 |
| `onChange`               | `(value: string[]) => void`   | -          |                          |

## 접근성
- 제목은 `h3` 안의 `button`. `aria-expanded`와 `aria-controls`로 패널과 연결하고, 패널은 `role="region"` + `aria-labelledby`.
- 닫힌 패널은 `inert`라 Tab 이동과 스크린리더에서 빠진다.

## 구현 메모
- 높이 애니메이션은 `grid-template-rows: 0fr ↔ 1fr` 전환으로 한다. 내용 높이를 재지 않아도 되고, 내용이 바뀌어도 맞는다.
- `single`에서 열린 항목을 다시 누르면 닫힌다.
