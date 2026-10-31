import type { ItemMeta } from "../../types";

export const meta: ItemMeta = {
  title: "텍스트 필드",
  summary: "라벨·도움말·오류·글자 수를 갖춘 한 줄 입력칸.",
  category: "components",
  group: "input",
  order: 4,
  tags: ["입력", "기본", "폼"],
  added: "2026-10-31",
  rules: {
    do: [
      "입력 규칙(자릿수·허용 문자)은 처음부터 도움말로 보여주고, 어기면 같은 자리에 오류로 바꿔 보여준다.",
      "이메일처럼 다 쓰기 전엔 판단할 수 없는 값은 포커스가 빠질 때(blur) 검사한다.",
    ],
    dont: [
      "placeholder를 라벨 대신 쓰지 않는다. 입력을 시작하면 무엇을 쓰는 칸인지 사라진다.",
      "오류를 색으로만 알리지 않는다. 무엇을 고쳐야 하는지 문장으로 쓴다.",
    ],
  },
};
