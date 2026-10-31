import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "스켈레톤",
  summary: "내용이 오기 전 자리를 미리 잡아 두는 회색 틀. 로딩이 끝나도 화면이 튀지 않는다.",
  category: "components",
  group: "status",
  order: 2,
  tags: ["상태", "기본", "로딩"],
  added: "2026-10-31",
  rules: {
    do: [
      "실제 내용과 같은 크기·배치로 그려서 로딩이 끝날 때 레이아웃이 움직이지 않게 한다.",
      "로딩 중인 영역의 부모에 aria-busy를 줘서 보조기기에 진행 중임을 알린다.",
    ],
    dont: [
      "0.3초 안에 끝나는 요청에는 쓰지 않는다. 깜빡임만 생긴다.",
      "버튼·입력칸처럼 바로 쓸 수 있는 요소까지 스켈레톤으로 가리지 않는다.",
    ],
  },
};
