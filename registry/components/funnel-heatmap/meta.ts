import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "퍼널 히트맵 표",
  summary: "세그먼트별로 첫 단계 대비 단계 도달률을 숫자와 명도로 비교하는 퍼널 표.",
  category: "components",
  group: "data",
  order: 3,
  tall: true,
  tags: ["퍼널", "표", "대시보드"],
  added: "2026-11-01",
  source: { project: "PlaceWave", url: "https://placewave-analytics.vercel.app" },
  rules: {
    do: [
      "행 = 전체 + 세그먼트 값, 열 = 퍼널 단계로 두고 어느 집단이 어느 단계에서 막히는지 찾을 때 쓴다.",
      "세그먼트는 사람당 값이 하나인 축(채널·플랫폼·회원)으로 나눠 값별 첫 단계 합이 전체와 같게 한다.",
    ],
    dont: [
      "서로 겹치는 집단(재방문·결제 경험 같은 오디언스)을 한 축으로 묶어 합계처럼 읽히게 하지 않는다.",
      "명도만으로 값을 전하지 않는다. 칸 숫자를 지우지 않는다.",
    ],
  },
};
