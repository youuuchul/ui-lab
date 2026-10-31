# 정렬 표

열 머리를 눌러 정렬하는 숫자 위주 데이터 표.

데모 수치는 PlaceWave의 가상 플랫폼 데이터(시나리오로 생성한 합성 데이터)이며 실제 서비스 데이터가 아니다.

## Props
| 이름          | 타입                                           | 기본값 | 설명                         |
|---------------|------------------------------------------------|--------|------------------------------|
| `caption`     | `string`                                       | -      | 표 제목(caption)             |
| `columns`     | `{ key; label; align?; format?; sortable? }[]` | -      | 첫 열은 행 머리(`th`)가 된다 |
| `rows`        | `Record<string, string \| number \| null>[]`   | -      | null은 "—"                   |
| `rowKey`      | `string`                                       | -      | 행 구분 열                   |
| `defaultSort` | `{ key; dir: "asc" \| "desc" }`                | -      | 첫 정렬                      |

## 구현 메모
- 열 머리는 높이 40px 버튼이다. 처음 누르면 내림차순, 다시 누르면 오름차순. 현재 열은 `aria-sort`와 ▲▼, 진한 글자로 보인다.
- null은 방향과 상관없이 맨 아래로 보낸다.
- 숫자 열은 오른쪽 정렬·`tabular-nums`, 문자열은 `localeCompare(..., "ko")`로 정렬한다.
