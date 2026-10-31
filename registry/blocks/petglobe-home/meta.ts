import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "PetGlobe 첫 화면",
  summary: "창가 그림 속 유리구에 은하수 글로브를 겹치고, 세 장면으로 서비스를 소개하는 온보딩 첫 화면.",
  category: "blocks",
  order: 2,
  tags: ["온보딩", "캔버스", "첫 화면"],
  added: "2026-10-31",
  source: { project: "PetGlobe", url: "https://petglobe.app" },
  uses: ["components/galaxy-globe"],
  tall: true,
};
