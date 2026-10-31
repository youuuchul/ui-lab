# 3D 폰 목업

앱 화면 이미지를 코드로 만든 3D 폰에 끼워 보여주는 블록. 마우스를 올리면 포인터 쪽으로, 휴대폰에서는 기울기에 따라 돈다. WebGL을 못 쓰면 CSS 3D 폰으로 대체한다.

## 파일
| 파일 | 역할 |
|---|---|
| `PhoneCanvas.tsx` | WebGL 폰 한 대 + 포인터·기울기 반응. 준비 전·실패 시 `fallback` 표시 |
| `Phone3D.tsx` | CSS 3D 폰 (앞·뒤·옆면 6장). 대체용, 또는 가벼운 목업이 필요할 때 단독으로 |
| `phone.ts` | three.js 무대 `PhoneStage`. 여러 대를 한 캔버스에 그리고 자세는 CSS 좌표(`Pose`)로 받는다 |
| `tilt.ts` | `deviceorientation`을 -1~1로 바꾸는 모듈. iOS 권한 요청 포함 |

## `PhoneCanvas` Props
| 이름 | 타입 | 설명 |
|---|---|---|
| `screen` | `string` | 화면 이미지 URL (data URL 가능) |
| `tone` | `string` | 뒷면 색 |
| `height` | `number` | 그릴 폰 높이(px) |
| `label` | `string` | 접근성 라벨 |
| `fallback` | `ReactNode` | WebGL 준비 전·실패 시 |

## 구현 메모
- `phone.ts`는 `import()`로 늦게 불러 three.js가 첫 번들에 들어가지 않는다.
- 폰은 iPhone 15 Pro 비율로 코드에서 만든다 (금속 테두리·유리 앞면·카메라 범프·버튼). 화면은 `emissiveMap`으로 톤 매핑 없이 원색 그대로.
- `PhoneStage.render(poses)`는 CSS `translate3d`·`rotateX/Y/Z`와 같은 자세를 받는다. 카메라 시야각을 CSS `perspective` 거리에서 계산해 DOM 레이어와 겹쳐도 어긋나지 않는다 (원형 캐러셀과 함께 쓸 때).
- 기울기는 처음 쥔 각도를 기준점으로 잡고 천천히 따라가 다시 가운데로 돌아온다. 터치 `pointerdown` 안에서만 권한을 요청한다.
- 원본의 GLB 모델 로더와 설정 파일(`phone.json`)은 뺐다. 모델을 바꾸려면 `buildDefaultPhone`을 GLTFLoader 결과로 교체한다.
- 의존성: `three`, `motion`.
