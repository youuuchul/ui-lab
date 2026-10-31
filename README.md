# youuuchul's UI Lab

프로젝트에서 만든 UI를 적용 사례, 컴포넌트, 문서로 모은 저장소.

- 갤러리: https://youuuchul.github.io/ui-lab/
- AI용 목록: https://youuuchul.github.io/ui-lab/llms.txt
- React 19 + TypeScript + Tailwind CSS 4. 같은 코드가 Vite와 Next에서 동작한다.

## 설치
```bash
npx shadcn@latest add https://youuuchul.github.io/ui-lab/r/<이름>.json
```

AI 도구에 붙여 넣는 설정 프롬프트는 [AI로 설치](docs/getting-started/02-ai.md).

## 구조
```
registry/blocks/       적용 사례 (출처 프로젝트 화면을 데이터 없이 재구성)
registry/components/   컴포넌트 (기본 UI + 도메인)
registry/tokens.css    색·모서리·글꼴 토큰
docs/                  시작하기, 요소 가이드
site/                  갤러리 (Vite)
next-check/            모든 데모를 Next로 빌드해 호환 확인
scripts/               레지스트리 JSON·llms.txt 생성
```

## 개발
```bash
npm install
npm run dev          # 갤러리
npm run build        # 레지스트리 생성 + 갤러리 빌드
npm run check:next   # Next 호환 확인
```

## 카탈로그
<!-- catalog:start -->
| 이름                                                                  | 종류      | 분류     | 출처                     |
|-----------------------------------------------------------------------|-----------|----------|--------------------------|
| [사례 바인더](registry/blocks/career-binder)                          | 적용 사례 |          | 포트폴리오 사이트        |
| [캐릭터 대화 화면](registry/blocks/chat-scene)                        | 적용 사례 |          | HeartTable AI            |
| [3D 역량 그래프 히어로](registry/blocks/force-graph-hero)             | 적용 사례 |          | 포트폴리오 사이트        |
| [추리 게임 플레이 화면](registry/blocks/murder-mystery-play)          | 적용 사례 |          | Murder Mystery Generator |
| [PetGlobe 첫 화면](registry/blocks/petglobe-home)                     | 적용 사례 |          | PetGlobe                 |
| [3D 폰 목업](registry/blocks/phone-3d)                                | 적용 사례 |          | 포트폴리오 사이트        |
| [아코디언](registry/components/accordion)                             | 컴포넌트  | 탐색     |                          |
| [배지](registry/components/badge)                                     | 컴포넌트  | 상태     |                          |
| [버튼](registry/components/button)                                    | 컴포넌트  | 입력     |                          |
| [흐려지는 채팅 말풍선](registry/components/chat-bubble)               | 컴포넌트  | 채팅     | HeartTable AI            |
| [채팅 입력창](registry/components/chat-input)                         | 컴포넌트  | 채팅     | HeartTable AI            |
| [원형 카운트다운](registry/components/countdown-ring)                 | 컴포넌트  | 상태     | HeartTable AI            |
| [크로스페이드 이미지 스택](registry/components/crossfade-image-stack) | 컴포넌트  | 미디어   | HeartTable AI            |
| [증거 목록 행](registry/components/evidence-row)                      | 컴포넌트  | 미디어   | Murder Mystery Generator |
| [폭 맞춤 타이포](registry/components/fit-text)                        | 컴포넌트  | 모션     | 포트폴리오 사이트        |
| [은하수 글로브](registry/components/galaxy-globe)                     | 컴포넌트  | 모션     | PetGlobe                 |
| [로딩 오버레이](registry/components/loading-overlay)                  | 컴포넌트  | 오버레이 | HeartTable AI            |
| [인물 선택 목록](registry/components/portrait-choice)                 | 컴포넌트  | 입력     | Murder Mystery Generator |
| [마스크 텍스트 등장](registry/components/rise-text)                   | 컴포넌트  | 모션     | 포트폴리오 사이트        |
| [세그먼트 컨트롤](registry/components/segmented-control)              | 컴포넌트  | 입력     |                          |
| [세그먼트 프로그레스](registry/components/segmented-progress)         | 컴포넌트  | 상태     |                          |
| [원형 3D 캐러셀](registry/components/service-carousel)                | 컴포넌트  | 탐색     | 포트폴리오 사이트        |
| [스켈레톤](registry/components/skeleton)                              | 컴포넌트  | 상태     |                          |
| [탭](registry/components/tabs)                                        | 컴포넌트  | 탐색     |                          |
| [텍스트 필드](registry/components/text-field)                         | 컴포넌트  | 입력     |                          |
| [토스트](registry/components/toast)                                   | 컴포넌트  | 오버레이 |                          |
| [토글](registry/components/toggle)                                    | 컴포넌트  | 입력     |                          |
| [툴팁](registry/components/tooltip)                                   | 컴포넌트  | 오버레이 |                          |
<!-- catalog:end -->

## License
MIT. 적용 사례의 이미지(`site/public/assets/`)는 각 출처 프로젝트에서 만든 에셋으로, 갤러리 시연용이다.
