"use client";
import { useEffect, useState } from "react";
import { MysteryPlay, type Clue } from "./MysteryPlay";

const A = "/ui-lab/assets/murder-mystery";

const CLUES: Clue[] = [
  { id: "1", title: "시계 분해 도구", location: "서재", image: `${A}/clue-watch-tools.webp`, description: "책상 서랍 안쪽, 천에 싸인 채 발견된 정밀 공구 세트. 핀 하나가 비어 있다." },
  { id: "2", title: "저택 평면도", location: "서재", image: `${A}/clue-floor-plan.webp`, description: "누군가 연필로 동선을 덧그린 평면도. 2층 복도에 표시가 겹쳐 있다." },
  { id: "3", title: "동전 한 벌", location: "응접실", image: `${A}/clue-coins.webp`, description: "통 안에 섞인 동전 중 몇 개는 앞뒤 무늬가 같다." },
  { id: "4", title: "중식당 영수증", location: "현관", image: `${A}/clue-receipt.webp`, public: true, description: "사건 당일 저녁에 결제된 2인분 영수증. 결제 시각이 알리바이와 어긋난다." },
  { id: "5", title: "보험 증서 사본", location: "침실", image: `${A}/clue-insurance.webp`, public: true, description: "수익자 칸이 최근에 고쳐 쓴 흔적이 있다." },
  { id: "6", title: "온더록 두 잔", location: "응접실", image: `${A}/clue-glasses.webp`, public: true, description: "한 잔에만 얼음이 그대로 남아 있다." },
];

const SUSPECTS = [
  { id: "a", name: "윤서준", image: `${A}/char-detective.webp` },
  { id: "b", name: "백도현", image: `${A}/char-gambler.webp` },
  { id: "c", name: "이름 없는 손님", image: `${A}/char-hooded.webp` },
  { id: "d", name: "한지호", image: `${A}/char-storyteller.webp` },
  { id: "e", name: "차유나", image: `${A}/char-agent.webp` },
];

const VOTERS = 5;

export default function Demo() {
  const [count, setCount] = useState(2);
  const [voted, setVoted] = useState(false);
  useEffect(() => {
    if (!voted || count >= VOTERS) return;
    const t = setTimeout(() => setCount((c) => c + 1), 900);
    return () => clearTimeout(t);
  }, [voted, count]);
  return (
    <div className="h-[30rem] w-[22rem] overflow-hidden rounded-2xl ring-1 ring-line">
      <MysteryPlay
        clues={CLUES}
        suspects={SUSPECTS}
        question="범인이라 생각하는 사람은?"
        voters={VOTERS}
        voteCount={count}
        onVote={() => {
          setVoted(true);
          setCount((c) => c + 1);
        }}
      />
    </div>
  );
}
