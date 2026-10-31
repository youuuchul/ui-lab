import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "추리 게임 플레이 화면",
  summary: "단서를 모아 읽고 범인을 지목하는 머더 미스터리 플레이어 화면.",
  category: "blocks",
  order: 3,
  tags: ["게임", "캐릭터", "목록", "투표"],
  added: "2026-10-31",
  source: { project: "Murder Mystery Generator" },
  uses: ["components/evidence-row", "components/portrait-choice"],
  tall: true,
};
