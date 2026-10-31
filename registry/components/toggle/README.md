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

## 상하위 설정
하위 설정의 값은 상위와 따로 기억하고, 화면에는 `상위 && 하위`로 보인다.

```tsx
const [push, setPush] = useState(true);
const [prefs, setPrefs] = useState({ comments: true, night: false });

const child = (key: keyof typeof prefs) => ({
  checked: push && prefs[key],
  onChange: (v: boolean) => {
    if (v && !push) {
      setPrefs({ comments: false, night: false, [key]: true });
      setPush(true);
    } else setPrefs((p) => ({ ...p, [key]: v }));
  },
});

<Toggle label="푸시 알림" checked={push} onChange={setPush} />
<Toggle label="야간 알림" {...child("night")} />
```

- 상위를 끄면 하위가 모두 꺼져 보인다. 상위를 다시 켜면 사용자가 고른 하위 값이 돌아온다.
- 상위가 꺼진 채 하위 하나를 켜면 상위와 그 항목만 켠다. 예전에 켜 둔 다른 하위를 함께 되살리지 않는다(고르지 않은 알림이 늘지 않게).

## 접근성
- `role="switch"` + `aria-checked`. 라벨은 `aria-labelledby`, 설명은 `aria-describedby`로 연결한다.
- 네이티브 `button`이라 Space·Enter로 켜고 끈다.

## 구현 메모
- `checked`를 넘기면 제어, 안 넘기면 내부 상태를 쓴다.
- 서버 저장이 필요하면 제어 모드로 낙관적으로 바꾸고, 실패 시 이전 값으로 되돌린다.
