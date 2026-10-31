import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "배지",
  summary: "상태·분류·새 항목을 짧게 표시하는 라벨. 누를 수 없다.",
  category: "components",
  group: "status",
  order: 1,
  tags: ["상태", "기본"],
  added: "2026-10-31",
  rules: {
    do: [
      "주문 상태처럼 정해진 값은 같은 상태에 늘 같은 색을 써서 색만 보고도 구분되게 한다.",
      "한 줄에 배지는 한두 개로 줄이고, 강조가 필요한 하나만 solid로 둔다.",
    ],
    dont: [
      "배지를 버튼처럼 눌리게 만들지 않는다. 필터가 필요하면 칩·세그먼트 컨트롤을 쓴다.",
      "문장을 넣지 않는다. 두 단어를 넘으면 본문 텍스트로 쓴다.",
    ],
  },
};
