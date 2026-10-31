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
| 이름 | 층 | 태그 |
|---|---|---|
| [세그먼트 프로그레스](registry/components/segmented-progress) | 컴포넌트 | 상태, 애니메이션 |

## License
MIT
