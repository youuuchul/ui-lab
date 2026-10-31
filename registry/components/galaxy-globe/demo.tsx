"use client";
import { useMemo, useRef, useState } from "react";
import {
  GalaxyGlobe,
  lightFromMemory,
  namedLightFromId,
  type GalaxyGlobeRef,
  type GlobeStatus,
  type Light,
} from "./GalaxyGlobe";

const MOODS = ["happy", "calm", "excited", "sad", "worried", null];
const NAMES = ["보리", "콩이", "모카", "두부", "라떼", "까미", "호두", "밤이"];
const SPECIES = ["강아지", "고양이"];

const NAMED = Array.from({ length: 36 }, (_, i) =>
  namedLightFromId({
    id: `demo-named-${i}`,
    status: i % 5 === 0 ? "rainbow" : "active",
    info: { name: NAMES[i % NAMES.length], species: SPECIES[i % 2], date: `${(i % 12) + 1}월 ${(i % 27) + 1}일` },
  }),
);

export default function Demo() {
  const ref = useRef<GalaxyGlobeRef>(null);
  const [count, setCount] = useState(18);
  const [status, setStatus] = useState<GlobeStatus>("active");
  const lights = useMemo<Light[]>(
    () => Array.from({ length: count }, (_, i) => lightFromMemory({ id: `demo-${i}`, mood: MOODS[i % MOODS.length] })),
    [count],
  );

  const add = async () => {
    const next = lightFromMemory({ id: `demo-${count}`, mood: MOODS[count % MOODS.length] });
    await ref.current?.lightUp(next, null);
    setCount((c) => c + 1);
  };

  const btn = "rounded-full bg-fg/10 px-3 py-1.5 text-xs text-fg/80 hover:bg-fg/20";
  return (
    <div className="flex flex-col items-center gap-3">
      <GalaxyGlobe
        ref={ref}
        size={260}
        lights={lights}
        namedLights={NAMED}
        communityCount={24000}
        communityRainbowRatio={0.12}
        status={status}
        statusAnimate
      />
      <div className="flex gap-2">
        <button className={btn} onClick={add}>별빛 켜기</button>
        <button className={btn} onClick={() => ref.current?.gather()}>모으기</button>
        <button className={btn} onClick={() => setStatus((s) => (s === "active" ? "rainbow" : "active"))}>
          {status === "active" ? "무지갯빛" : "흰빛"}
        </button>
      </div>
    </div>
  );
}
