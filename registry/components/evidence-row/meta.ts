import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "증거 목록 행",
  summary: "썸네일·위치·제목·요약을 한 줄로 묶은 목록 행.",
  category: "components",
  group: "media",
  order: 20,
  tags: ["목록", "미디어", "게임"],
  added: "2026-10-31",
  source: { project: "Murder Mystery Generator" },
  rules: {
    do: ["누르면 상세(시트·모달)가 열리는 수집 항목 목록에 쓴다.", "요약은 두 줄까지만 보이고 전체는 상세에서 읽게 한다."],
    dont: ["행 안에 버튼을 또 넣지 않는다. 행 전체가 하나의 버튼이다.", "사진 중심 갤러리에는 쓰지 않는다. 썸네일이 64px로 작다."],
  },
};
