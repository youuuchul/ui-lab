# ui-lab

프로젝트에서 만든 UI 컴포넌트와 적용 사례, 문서를 모은 저장소.

- **컴포넌트** `registry/components/` — 단위 컴포넌트
- **적용 사례** `registry/blocks/` — 실제 프로젝트에 쓴 조합
- **문서** `docs/` — 작성 규칙, 패턴, 학습 노트

React + TypeScript + Tailwind 4. 같은 코드가 Vite와 Next에서 동작한다 ([작성 규칙](docs/conventions.md)).

## 실행
```bash
npm install
npm run dev          # 갤러리 (site/)
npm run build        # 갤러리 빌드
npm run check:next   # 모든 데모를 Next에서 빌드해 호환 확인 (next-check/)
```

## 카탈로그
갤러리: https://youuuchul.github.io/ui-lab/

| 이름 | 층 | 태그 | 출처 |
|---|---|---|---|
| [흐려지는 채팅 말풍선](registry/components/chat-bubble) | 컴포넌트 | 채팅, 입력 | HeartTable AI |
| [채팅 입력창](registry/components/chat-input) | 컴포넌트 | 채팅, 입력 | HeartTable AI |
| [원형 카운트다운](registry/components/countdown-ring) | 컴포넌트 | 상태, 애니메이션 | HeartTable AI |
| [크로스페이드 이미지 스택](registry/components/crossfade-image-stack) | 컴포넌트 | 미디어, 애니메이션 | HeartTable AI |
| [폭 맞춤 타이포](registry/components/fit-text) | 컴포넌트 | 타이포, 레이아웃 | portfolio-site |
| [로딩 오버레이](registry/components/loading-overlay) | 컴포넌트 | 상태 | HeartTable AI |
| [견적 안내 시트](registry/components/quote) | 컴포넌트 | 데이터, 레이아웃 | portfolio-site |
| [마스크 텍스트 등장](registry/components/rise-text) | 컴포넌트 | 애니메이션, 타이포 | portfolio-site |
| [세그먼트 프로그레스](registry/components/segmented-progress) | 컴포넌트 | 상태, 애니메이션 | - |
| [원형 3D 캐러셀](registry/components/service-carousel) | 컴포넌트 | 탐색, 3D, 제스처 | portfolio-site |
| [사례 바인더](registry/blocks/career-binder) | 적용 사례 | 탐색, 캐러셀, 팝업 | portfolio-site |
| [캐릭터 대화 화면](registry/blocks/chat-scene) | 적용 사례 | 채팅, 게임 | HeartTable AI |
| [3D 역량 그래프 히어로](registry/blocks/force-graph-hero) | 적용 사례 | 3D, 데이터, 첫 화면 | portfolio-site |
| [3D 폰 목업](registry/blocks/phone-3d) | 적용 사례 | 3D, WebGL, 목업 | portfolio-site |

## License
MIT
