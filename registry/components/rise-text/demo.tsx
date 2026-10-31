"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Rise, Rule, Words, riseGroup } from "./Rise";

const SLIDES = [
  { kicker: "01", title: "작은 조각이 모여 화면이 된다", sub: "단어마다 마스크 안에서 올라온다" },
  { kicker: "02", title: "같은 규칙으로 여러 화면을", sub: "나갈 때는 위로 밀려난다" },
  { kicker: "03", title: "움직임은 짧고 분명하게", sub: "모션 줄이기 설정이면 바로 보인다" },
];

export default function Demo() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setI((v) => (v + 1) % SLIDES.length), 2600);
    return () => clearTimeout(t);
  }, [i]);
  const s = SLIDES[i];
  return (
    <div className="w-80 text-fg">
      <AnimatePresence mode="wait">
        <motion.div key={i} variants={riseGroup(0.04)} initial="hidden" animate="show" exit="out">
          <p className="font-mono text-xs text-accent">
            <Rise>{s.kicker}</Rise>
          </p>
          <p className="mt-2 text-2xl leading-tight font-bold tracking-tight">
            <Words text={s.title} />
          </p>
          <Rule className="mt-4 text-fg/30" />
          <p className="mt-3 text-sm text-muted">
            <Rise>{s.sub}</Rise>
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
