"use client";
import { Fragment, type ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

const EASE = [0.32, 0.72, 0, 1] as const;

const MASK = "block overflow-hidden pt-[0.1em] pb-[0.14em] -mt-[0.1em] -mb-[0.14em]";
const WORD_MASK = "inline-block overflow-hidden align-top pt-[0.1em] pb-[0.14em] -mt-[0.1em] -mb-[0.14em]";

/** 자식 줄들의 등장 순서를 정하는 묶음. 부모의 hidden/show/out 상태를 그대로 물려받는다. */
export const riseGroup = (stagger: number, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  out: { transition: { staggerChildren: 0.01 } },
});

const line: Variants = {
  hidden: { y: "120%" },
  show: { y: "0%", transition: { duration: 0.7, ease: EASE } },
  out: { y: "-110%", transition: { duration: 0.28, ease: [0.5, 0, 0.75, 0] } },
};

const rule: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 0.9, ease: EASE } },
  out: { scaleX: 0, transition: { duration: 0.28 } },
};

/** 한 덩어리를 마스크 안에서 아래→위로 올린다. */
export function Rise({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <span className={MASK}>
      <motion.span className="block will-change-transform" variants={reduce ? undefined : line}>
        {children}
      </motion.span>
    </span>
  );
}

/** 단어마다 마스크를 둬서 줄바꿈된 제목도 줄 단위로 올라오게 한다. */
export function Words({ text }: { text: string }) {
  const reduce = useReducedMotion();
  return text.split(" ").map((w, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      <span className={WORD_MASK}>
        <motion.span className="inline-block will-change-transform" variants={reduce ? undefined : line}>
          {w}
        </motion.span>
      </span>
    </Fragment>
  ));
}

/** 왼쪽에서 그어지는 1px 구분선. 색은 currentColor. */
export function Rule({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.i
      className={`block h-px origin-left bg-current ${className}`}
      variants={reduce ? undefined : rule}
      aria-hidden="true"
    />
  );
}
