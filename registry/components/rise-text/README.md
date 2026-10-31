# 마스크 텍스트 등장

글자를 보이지 않는 마스크 아래에서 올리고, 나갈 때는 위로 밀어내는 텍스트 전환. motion의 variants 상태(`hidden`/`show`/`out`)를 부모에서 내려받는다.

## 구성
| 이름                         | 용도                                                                      |
|------------------------------|---------------------------------------------------------------------------|
| `Rise`                       | 한 덩어리(줄·버튼 등)를 통째로 올림                                       |
| `Words`                      | `text`를 단어 단위로 나눠 올림. 줄바꿈된 제목도 줄마다 올라온 것처럼 보임 |
| `Rule`                       | 왼쪽에서 그어지는 1px 선. `className`으로 색·여백 지정                    |
| `riseGroup(stagger, delay?)` | 자식들의 순서 간격(s)과 시작 지연(s)을 정하는 부모 variants               |

## 쓰는 법
```tsx
<AnimatePresence mode="wait">
  <motion.div key={id} variants={riseGroup(0.04)} initial="hidden" animate="show" exit="out">
    <Words text={title} />
    <Rise>{sub}</Rise>
  </motion.div>
</AnimatePresence>
```

## 구현 메모
- 마스크에 위아래 여유(`0.1em`/`0.14em`)를 두고 같은 만큼 음수 margin으로 되돌려, 글자 윗부분과 받침이 잘리지 않으면서 레이아웃은 그대로 둔다.
- 등장 곡선은 `[0.32, 0.72, 0, 1]` 0.7초, 퇴장은 0.28초로 짧게.
- `prefers-reduced-motion`이면 variants를 빼서 바로 보인다.
- 의존성: `motion`.
