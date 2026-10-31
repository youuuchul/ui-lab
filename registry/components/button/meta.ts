import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "버튼",
  summary: "동작을 실행하는 기본 버튼. 위계에 따라 네 가지 모양과 세 가지 크기를 쓴다.",
  category: "components",
  group: "input",
  order: 1,
  tags: ["입력", "기본"],
  added: "2026-10-31",
  rules: {
    do: [
      "한 영역에서 가장 중요한 동작 하나만 primary로 두고 나머지는 secondary·ghost로 낮춘다.",
      "저장·전송처럼 시간이 걸리는 동작은 loading으로 폭을 유지한 채 중복 클릭을 막는다.",
    ],
    dont: [
      "되돌릴 수 없는 삭제를 primary로 두지 않는다. danger를 쓰고 확인 단계를 둔다.",
      "버튼 라벨에 '확인'·'클릭'처럼 결과가 드러나지 않는 말을 쓰지 않는다. '게시', '저장'처럼 동작을 쓴다.",
    ],
  },
};
