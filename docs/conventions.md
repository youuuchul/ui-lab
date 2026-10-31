# 작성 규칙

## 폴더
```
registry/<components|blocks>/<kebab-name>/
  <PascalName>.tsx   컴포넌트 본체 (갤러리 '코드 복사' 대상)
  demo.tsx           갤러리 미리보기. default export
  meta.ts            제목·분류·태그·추가일·출처
  README.md          props, 구현 메모
```

## Vite·Next 공통으로 동작시키는 규칙
- 상태·이펙트·이벤트가 있는 파일은 첫 줄에 `"use client"`. Vite는 이 줄을 무시한다.
- `next/link`, `next/image`, `next/font` 등 프레임워크 전용 import 금지. `<a>`, `<img>`, CSS `@font-face`를 쓴다. 쓰는 쪽에서 감싸면 프레임워크 기능을 다시 얻는다.
- `window`, `document`는 렌더 중에 읽지 않고 `useEffect` 안에서만 쓴다 (Next 서버 렌더에서 깨짐).
- 스타일은 Tailwind 4 클래스와 `tokens.css` 토큰만 쓴다. 전역 CSS가 필요한 애니메이션은 Web Animations API나 inline style로 컴포넌트 안에 둔다.
- 확인: `npm run check:next`가 통과해야 Next 호환으로 본다.

## 공개 레포 규칙
- 비공개 프로젝트에서 옮길 때는 범용화한다. 브랜드명, 실제 카피, 사용자·회사 데이터, API 연결, 프롬프트는 빼고 더미 데이터로 다시 구성한다.
- 출처는 `meta.source`에 프로젝트 이름과 공개 링크만 남긴다.
- `.env`, 키, 토큰은 넣지 않는다.
