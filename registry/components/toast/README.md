# 토스트

동작 결과를 화면 하단에 잠깐 알리고 스스로 사라지는 메시지. 실행 취소 버튼을 붙일 수 있다.

## Props
| 이름           | 타입                      | 기본값       | 설명                                |
|----------------|---------------------------|--------------|-------------------------------------|
| `open`         | `boolean`                 | -            | 표시 여부 (쓰는 쪽이 상태를 쥔다)   |
| `onOpenChange` | `(open: boolean) => void` | -            | 자동 닫힘·액션 후 `false`           |
| `message`      | `string`                  | -            | 한 문장                             |
| `action`       | `{ label, onClick }`      | -            | 오른쪽 버튼. 누르면 실행하고 닫힌다 |
| `duration`     | `number`                  | `3000`       | 자동 닫힘(ms). `0`이면 유지         |
| `tone`         | `"default" \| "error"`    | `"default"`  |                                     |
| `scope`        | `"viewport" \| "parent"`  | `"viewport"` | 화면 하단 / relative 부모 하단      |

## 쓰는 법
프로바이더나 훅 없이 상태 하나로 쓴다.
```tsx
const [open, setOpen] = useState(false);
<Toast open={open} onOpenChange={setOpen} message="저장했어요" />
```

## 접근성
- 기본은 `role="status"` + `aria-live="polite"`, 오류는 `role="alert"` + `assertive`.
- 마우스를 올리거나 버튼에 포커스가 가 있는 동안은 자동으로 닫히지 않는다. 다시 벗어나면 `duration`부터 다시 센다. 열고 닫힐 때마다 이 일시정지는 풀린다(포인터 아래에서 사라져 leave 이벤트가 오지 않는 경우 대비).

## 구현 메모
- 닫힐 때 0.15초(열릴 때 0.2초) 내려가며 사라진 뒤 DOM에서 빠진다. 열릴 때는 두 프레임 뒤에 표시 상태로 바꿔 등장 전환이 걸리게 한다.
- `message`가 바뀌면 타이머를 다시 시작한다. 같은 토스트를 새 메시지로 바꿔 쓰면 된다.
