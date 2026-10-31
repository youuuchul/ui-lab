# 원형 카운트다운

남은 시간을 둘레 길이로 보여주는 타이머. 시계 방향으로 줄어든다.

## Props
| 이름 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `progress` | `number` | - | 남은 비율 0~1 |
| `label` | `string` | - | 가운데 글자 |
| `urgentBelow` | `number` | `0.2` | 이 비율 미만이면 빨강 + 깜빡임 |
| `size` | `number` | `48` | 지름(px) |

## 구현 메모
- 둘레 `C = 2πr`를 `strokeDasharray`로 두고 `strokeDashoffset = C × (1 − progress)`로 줄인다.
- `-rotate-90`으로 12시 방향에서 시작, `-scale-x-100`으로 시계 방향으로 줄어들게 뒤집는다.
- 시간 계산은 쓰는 쪽이 한다. 컴포넌트는 비율과 글자만 받는다.
