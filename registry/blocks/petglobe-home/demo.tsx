"use client";
import { PetGlobeIntro } from "./PetGlobeIntro";

export default function Demo() {
  return (
    <div className="w-[260px] overflow-hidden rounded-2xl">
      <PetGlobeIntro
        background="/ui-lab/assets/petglobe/window-scene.webp"
        title="PetGlobe"
        tagline="함께한 모든 순간이, 여기에."
        lines={["추억 하나가 별빛 하나로 남아요", "함께한 날들이 별자리가 되고", "모두의 추억이 밤하늘을 채워요"]}
        primaryLabel="시작하기"
      />
    </div>
  );
}
