"use client";
import { PathSankey, type PathLink } from "./PathSankey";

const LINKS: PathLink[] = [
  { step: 1, from: "행사 상세", to: "행사 상세", value: 50383 },
  { step: 1, from: "행사 상세", to: "이탈", value: 46125 },
  { step: 1, from: "행사 상세", to: "홈", value: 18818 },
  { step: 1, from: "공간 상세", to: "행사 상세", value: 12874 },
  { step: 1, from: "공간 상세", to: "이탈", value: 12107 },
  { step: 1, from: "홈", to: "행사 상세", value: 12104 },
  { step: 1, from: "홈", to: "홈", value: 11699 },
  { step: 1, from: "공간 상세", to: "기타", value: 7077 },
  { step: 1, from: "홈", to: "이탈", value: 6340 },
  { step: 1, from: "행사 상세", to: "신청 화면", value: 5871 },
  { step: 1, from: "공간 상세", to: "공간 상세", value: 5199 },
  { step: 1, from: "행사 상세", to: "로그인", value: 4869 },
  { step: 1, from: "공간 상세", to: "홈", value: 4477 },
  { step: 1, from: "행사 상세", to: "기타", value: 3703 },
  { step: 1, from: "행사 상세", to: "공간 상세", value: 3168 },
  { step: 1, from: "홈", to: "기타", value: 2915 },
  { step: 1, from: "신청 화면", to: "행사 상세", value: 915 },
  { step: 1, from: "공간 상세", to: "로그인", value: 811 },
  { step: 1, from: "홈", to: "공간 상세", value: 752 },
  { step: 1, from: "홈", to: "로그인", value: 570 },
  { step: 1, from: "공간 상세", to: "신청 화면", value: 320 },
  { step: 1, from: "홈", to: "신청 화면", value: 216 },
  { step: 1, from: "기타", to: "공간 상세", value: 183 },
  { step: 1, from: "기타", to: "이탈", value: 170 },
  { step: 1, from: "신청 화면", to: "이탈", value: 154 },
  { step: 1, from: "기타", to: "행사 상세", value: 136 },
  { step: 1, from: "신청 화면", to: "로그인", value: 73 },
  { step: 1, from: "기타", to: "홈", value: 58 },
  { step: 1, from: "신청 화면", to: "신청 화면", value: 32 },
  { step: 1, from: "신청 화면", to: "기타", value: 27 },
  { step: 1, from: "신청 화면", to: "홈", value: 23 },
  { step: 1, from: "기타", to: "기타", value: 20 },
  { step: 1, from: "신청 화면", to: "공간 상세", value: 12 },
  { step: 1, from: "기타", to: "로그인", value: 9 },
  { step: 2, from: "행사 상세", to: "이탈", value: 33179 },
  { step: 2, from: "행사 상세", to: "행사 상세", value: 17730 },
  { step: 2, from: "행사 상세", to: "홈", value: 14292 },
  { step: 2, from: "홈", to: "홈", value: 12842 },
  { step: 2, from: "홈", to: "행사 상세", value: 11021 },
  { step: 2, from: "홈", to: "이탈", value: 7145 },
  { step: 2, from: "행사 상세", to: "신청 화면", value: 4490 },
  { step: 2, from: "기타", to: "이탈", value: 3795 },
  { step: 2, from: "기타", to: "공간 상세", value: 3569 },
  { step: 2, from: "로그인", to: "이탈", value: 3565 },
  { step: 2, from: "공간 상세", to: "이탈", value: 3562 },
  { step: 2, from: "행사 상세", to: "로그인", value: 3288 },
  { step: 2, from: "신청 화면", to: "기타", value: 3011 },
  { step: 2, from: "기타", to: "홈", value: 2636 },
  { step: 2, from: "행사 상세", to: "공간 상세", value: 2488 },
  { step: 2, from: "홈", to: "기타", value: 2388 },
  { step: 2, from: "신청 화면", to: "행사 상세", value: 2123 },
  { step: 2, from: "기타", to: "행사 상세", value: 1843 },
  { step: 2, from: "공간 상세", to: "기타", value: 1798 },
  { step: 2, from: "기타", to: "기타", value: 1727 },
  { step: 2, from: "로그인", to: "행사 상세", value: 1466 },
  { step: 2, from: "공간 상세", to: "공간 상세", value: 1398 },
  { step: 2, from: "공간 상세", to: "홈", value: 1280 },
  { step: 2, from: "공간 상세", to: "행사 상세", value: 1017 },
  { step: 2, from: "신청 화면", to: "이탈", value: 993 },
  { step: 2, from: "로그인", to: "기타", value: 962 },
  { step: 2, from: "홈", to: "공간 상세", value: 950 },
  { step: 2, from: "행사 상세", to: "기타", value: 945 },
  { step: 2, from: "홈", to: "로그인", value: 487 },
  { step: 2, from: "홈", to: "신청 화면", value: 242 },
  { step: 2, from: "신청 화면", to: "신청 화면", value: 241 },
  { step: 2, from: "공간 상세", to: "로그인", value: 181 },
  { step: 2, from: "로그인", to: "공간 상세", value: 174 },
  { step: 2, from: "로그인", to: "홈", value: 159 },
  { step: 2, from: "기타", to: "로그인", value: 103 },
  { step: 2, from: "공간 상세", to: "신청 화면", value: 78 },
  { step: 2, from: "기타", to: "신청 화면", value: 69 },
  { step: 2, from: "신청 화면", to: "홈", value: 48 },
  { step: 2, from: "신청 화면", to: "공간 상세", value: 23 },
  { step: 2, from: "로그인", to: "신청 화면", value: 6 },
];

export default function Demo() {
  return (
    <div className="w-full max-w-[860px] rounded-2xl border border-line bg-surface p-4">
      <PathSankey
        title="세션 화면 경로"
        columns={["랜딩", "2번째 화면", "3번째 화면"]}
        links={LINKS}
        groups={[
          { label: "탐색", color: "#6b8cff", members: ["홈"] },
          { label: "상세", color: "#34d399", members: ["행사 상세", "공간 상세"] },
          { label: "로그인·가입", color: "#fbbf24", members: ["로그인"] },
          { label: "신청·결제", color: "#fb7185", members: ["신청 화면"] },
          { label: "기타", color: "#8c8c8c", members: ["기타"] },
        ]}
        height={360}
        minWidth={560}
      />
    </div>
  );
}
