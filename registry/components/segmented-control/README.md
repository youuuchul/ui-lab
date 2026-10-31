# 세그먼트 컨트롤

2~5개 선택지 중 하나를 고르는 붙은 버튼 묶음. 선택 표시가 미끄러지며 옮겨 간다.

## Props
| 이름           | 타입                 | 기본값    | 설명                                |
|----------------|----------------------|-----------|-------------------------------------|
| `options`      | `{ value, label }[]` | -         | 선택지                              |
| `value`        | `T`                  | -         | 제어 모드 값                        |
| `defaultValue` | `T`                  | 첫 선택지 | 비제어 모드 초기값                  |
| `onChange`     | `(value: T) => void` | -         | 값이 바뀔 때만 호출                 |
| `label`        | `string`             | -         | 그룹의 접근성 이름 (화면에 안 보임) |
| `size`         | `"sm" \| "md"`       | `"md"`    | 높이 28 / 36px                      |
| `disabled`     | `boolean`            | `false`   |                                     |

## 접근성
- `role="radiogroup"` 안에 `role="radio"` 버튼. 선택된 것만 Tab으로 들어가고(roving tabindex), 화살표·Home·End로 옮기면 바로 선택된다.

## 구현 메모
- 칸을 같은 폭(`grid`의 `minmax(0, 1fr)`)으로 나눈다. 그래서 선택 표시는 너비를 재지 않고 `translateX(index × 100%)`로만 움직인다. 첫 렌더부터 자리가 맞고, 서버 렌더에서도 어긋나지 않는다.
- 미끄러짐은 0.3초 `cubic-bezier(0.32, 0.72, 0, 1)`. `prefers-reduced-motion`이면 바로 옮긴다.
