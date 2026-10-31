import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "인물 선택 목록",
  summary: "인물 사진과 이름으로 한 명을 고르는 단일 선택 목록.",
  category: "components",
  group: "input",
  order: 60,
  tags: ["입력", "선택", "게임"],
  added: "2026-10-31",
  source: { project: "Murder Mystery Generator", url: "https://murdermysterygenerator.shop" },
  rules: {
    do: ["투표·지목처럼 사람을 고르는 질문에 쓴다. 얼굴이 판단 근거가 된다.", "선택은 테두리와 배경색 두 가지로 함께 표시한다."],
    dont: ["사진 없는 일반 옵션 목록에는 쓰지 않는다. 세그먼트 컨트롤이나 라디오가 맞다.", "여러 명을 고르는 질문에 쓰지 않는다."],
  },
};
