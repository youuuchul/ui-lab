# 버튼

동작을 실행하는 기본 버튼. 위계에 따라 네 가지 모양과 세 가지 크기를 쓴다.

## Props
| 이름                           | 타입                                              | 기본값      | 설명                                                                     |
|--------------------------------|---------------------------------------------------|-------------|--------------------------------------------------------------------------|
| `variant`                      | `"primary" \| "secondary" \| "ghost" \| "danger"` | `"primary"` | 위계                                                                     |
| `size`                         | `"sm" \| "md" \| "lg"`                            | `"md"`      | 높이 32 / 40 / 48px (sm은 투명 영역으로 터치 40px)                       |
| `loading`                      | `boolean`                                         | `false`     | 스피너 표시, 클릭 막음, `aria-disabled`·`aria-busy`, 읽기 전용 "처리 중" |
| `leadingIcon` · `trailingIcon` | `ReactNode`                                       | -           | 라벨 앞뒤 아이콘                                                         |
| `fullWidth`                    | `boolean`                                         | `false`     | 부모 폭 채움                                                             |
| 그 밖의 `button` 속성          |                                                   |             | `onClick`, `disabled`, `type`(기본 `"button"`) 등 그대로 전달            |

## 접근성
- 기본 `type="button"`이라 폼 안에서 실수로 제출되지 않는다. 제출 버튼은 `type="submit"`을 넘긴다.
- 키보드 포커스에만 `focus-visible` 링이 보인다.
- 아이콘만 있는 버튼은 `aria-label`을 넘긴다.

## 구현 메모
- `loading`은 `disabled` 대신 `aria-disabled`로 막아 포커스를 잃지 않는다. `onClick`은 호출되지 않는다.
- 로딩 중에는 라벨을 `invisible`로 숨기고 스피너를 겹친다. 라벨 폭이 유지돼 버튼 크기가 바뀌지 않는다.
- 누를 때 0.96배로 줄어든다. `prefers-reduced-motion`이면 줄어들지 않는다.
