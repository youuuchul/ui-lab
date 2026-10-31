import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "토글",
  summary: "설정을 켜거나 끄는 두 상태 입력. 누르는 즉시 적용된다.",
  category: "components",
  group: "input",
  order: 2,
  tags: ["입력", "기본"],
  added: "2026-10-31",
  rules: {
    do: [
      "알림 켜기처럼 누르는 즉시 적용되는 설정에 쓴다.",
      "라벨은 '푸시 알림'처럼 설정 이름으로 고정하고, 상태는 위치와 색으로 구분한다.",
    ],
    dont: [
      "약관 동의처럼 나중에 제출 버튼으로 확정하는 값에는 쓰지 않는다. 체크박스를 쓴다.",
      "저장에 실패했는데 켜진 상태로 두지 않는다. 이전 상태로 되돌리고 이유를 알린다.",
    ],
  },
};
