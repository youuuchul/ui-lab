import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "로딩 오버레이",
  summary: "서버가 깨어나는 동안 화면을 덮고, 오래 걸리면 알려주는 로딩 표시.",
  category: "components",
  group: "overlay",
  order: 3,
  tags: ["로딩", "콜드 스타트"],
  added: "2026-10-31",
  source: {"project": "HeartTable AI", "url": "https://heart-table-ai.vercel.app"},
  rules: {"do": ["무료 호스팅의 콜드 스타트처럼 첫 요청이 수십 초 걸릴 수 있는 곳에 쓴다.", "onTimeout에서 재시도 버튼이나 오류 화면으로 넘긴다."], "dont": ["1초 안에 끝나는 요청에 쓰지 않는다. 화면이 깜빡이기만 한다.", "덮인 상태로 무한히 두지 않는다. timeoutMs를 반드시 정한다."]},
};
