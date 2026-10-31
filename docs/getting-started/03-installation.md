# 직접 설치
명령어 한 줄로 받거나, 상세 페이지의 코드를 같은 폴더 구조로 복사한다.

## 준비
- React 19, TypeScript, Tailwind CSS 4
- Vite: `@tailwindcss/vite` 플러그인 / Next: `@tailwindcss/postcss`

## 1. 토큰
```bash
npx shadcn@latest add https://youuuchul.github.io/ui-lab/r/tokens.json
```

전역 CSS에서 Tailwind 다음에 불러온다.

```css
@import "tailwindcss";
@import "./styles/ui-lab-tokens.css";
```

## 2. 컴포넌트·블록
상세 페이지의 **설치** 칸에 있는 명령어를 쓴다. 블록을 받으면 쓰인 컴포넌트와 토큰이 함께 설치된다.

```bash
npx shadcn@latest add https://youuuchul.github.io/ui-lab/r/chat-scene.json
```

파일은 `components/ui-lab/<blocks|components>/<이름>/`에 들어간다. 블록은 `../../components/...` 상대 경로로 컴포넌트를 불러오므로 이 구조를 유지한다.

## 직접 복사
1. 상세 페이지 **코드** 칸의 파일을 모두 같은 폴더에 둔다.
2. 다른 컴포넌트를 import하는 파일이면 그 컴포넌트도 `components/<이름>/`에 둔다.
3. 외부 패키지(`motion`, `three`, `d3-force-3d`)는 각 항목의 레지스트리 JSON `dependencies`에 적혀 있다.

## Next에서 쓸 때
- 상호작용이 있는 파일은 첫 줄이 `"use client"`라 서버 컴포넌트에서 바로 import해도 된다.
- 링크·이미지는 `a`·`img`로 되어 있다. `next/link`·`next/image`가 필요하면 쓰는 쪽에서 감싼다.
- 블록 데모의 이미지 경로(`/ui-lab/assets/...`)는 갤러리용이다. 자기 에셋 경로로 바꾼다.
