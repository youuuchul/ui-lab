"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import {
  DEFAULT_RAINBOW_RATIO,
  GEOMETRY,
  GalaxyGlobe,
  lightFromMemory,
  type GalaxyGlobeRef,
  type Light,
} from "../../components/galaxy-globe/GalaxyGlobe";

const MOODS = ["happy", "calm", "excited", "sad", "worried", null];
/** 장면 2에서 모여드는 별빛. 결정론적이라 다시 열어도 같은 별자리 */
const SCENE_LIGHTS: Light[] = Array.from({ length: 40 }, (_, i) =>
  lightFromMemory({ id: `intro-${String(i).padStart(3, "0")}`, mood: MOODS[i % MOODS.length] }),
);
const ONLY_FIRST = [SCENE_LIGHTS[0]];
const NO_LIGHTS: Light[] = [];

const SCENE_MS = 3600;
const SWIPE_PX = 40;
/** 미리 보기용 은하수 개수와 무지갯빛 비율. 실제 집계가 아니다 */
const PREVIEW_COMMUNITY = 100000;
const PREVIEW_RAINBOW = 0.28;

/** 배경 그림에서 측정한 유리구 자리 (그림 폭·높이 대비 비율, d는 폭 기준 지름) */
const GLASS = { cx: 0.502, cy: 0.3751, d: 0.562 };
const SCENE_RATIO = 1.5;
/** 움직이는 원은 그려진 유리구보다 살짝 작게. 그림의 테두리·반사를 살린다 */
const GLOBE_OF_GLASS = 0.955;

const SKY = "#16172F";
const SILL = "#231715";

export interface PetGlobeIntroProps {
  /** 창가의 스노우글로브 그림 (2:3) */
  background: string;
  /** 장면별 한 줄 */
  lines: [string, string, string];
  title: string;
  tagline: string;
  primaryLabel: string;
  onPrimary?: () => void;
  /** 장면 1·2의 은하수 개수 (실서비스는 모두의 기록 수) */
  community?: number;
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function PetGlobeIntro({ background, lines, title, tagline, primaryLabel, onPrimary, community = 3200 }: PetGlobeIntroProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GalaxyGlobeRef>(null);
  const lineRef = useRef<HTMLParagraphElement>(null);
  const dragRef = useRef<{ x: number; y: number; id: number } | null>(null);
  const [w, setW] = useState(0);
  const [scene, setScene] = useState(0);
  const [ready, setReady] = useState(false);
  const [lit, setLit] = useState(false);
  const [reduced, setReduced] = useState(false);
  const last = scene === lines.length - 1;

  useLayoutEffect(() => {
    setReduced(reducedMotion());
    const el = rootRef.current;
    if (!el) return;
    const measure = () => setW(el.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 자동 진행. 탭·스와이프·점으로 앞질러 갈 수 있다
  useEffect(() => {
    if (!ready || last) return;
    const t = setTimeout(() => setScene((s) => Math.min(lines.length - 1, s + 1)), SCENE_MS);
    return () => clearTimeout(t);
  }, [ready, scene, last, lines.length]);

  // 장면 1: 별빛 하나가 날아와 켜진다. 뒤로 돌아오면 이미 켜져 있다
  useEffect(() => {
    if (!ready || scene !== 0 || reduced || lit) return;
    globeRef.current?.lightUp(SCENE_LIGHTS[0], null).then(() => setLit(true));
  }, [ready, scene, reduced, lit]);

  // 장면 2: 별빛들이 모여든다
  useEffect(() => {
    if (!ready || scene !== 1 || reduced) return;
    globeRef.current?.gather();
  }, [ready, scene, reduced]);

  useEffect(() => {
    if (reduced) return;
    lineRef.current?.animate(
      [{ opacity: 0, transform: "translateY(8px)" }, { opacity: 1, transform: "none" }],
      { duration: 520, easing: "cubic-bezier(0.32, 0.72, 0, 1)" },
    );
  }, [scene, reduced]);

  const next = useCallback(() => setScene((s) => Math.min(lines.length - 1, s + 1)), [lines.length]);
  const prev = useCallback(() => setScene((s) => Math.max(0, s - 1)), []);

  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const start = dragRef.current;
    dragRef.current = null;
    if (!start || start.id !== e.pointerId) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) return dx < 0 ? next() : prev();
    if (Math.abs(dx) > SWIPE_PX || Math.abs(dy) > SWIPE_PX) return;
    // 별빛 탭은 장면 넘김이 아니다
    if (globeRef.current?.pointerOnLight()) return;
    const r = e.currentTarget.getBoundingClientRect();
    if (e.clientX - r.left >= r.width / 2) next();
    else prev();
  };

  const h = Math.round(w * SCENE_RATIO);
  const globeSize = Math.round((w * GLASS.d * GLOBE_OF_GLASS) / (2 * GEOMETRY.radius));
  const lights = scene === 0 ? (reduced || lit ? ONLY_FIRST : NO_LIGHTS) : SCENE_LIGHTS;

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") next();
        else if (e.key === "ArrowLeft") prev();
      }}
      className="relative w-full overflow-hidden outline-none select-none"
      style={{ background: `linear-gradient(180deg, ${SKY}, ${SKY} 40%, ${SILL})` }}
    >
      <div
        className="relative w-full"
        style={{ height: h }}
        onPointerDown={(e) => (dragRef.current = { x: e.clientX, y: e.clientY, id: e.pointerId })}
        onPointerUp={onUp}
        onPointerCancel={() => (dragRef.current = null)}
      >
        <img
          src={background}
          alt=""
          draggable={false}
          className="absolute inset-0 h-full w-full"
          style={{ maskImage: "linear-gradient(180deg, transparent 0, #000 11%, #000 88%, transparent 100%)" }}
        />
        {w > 0 && (
          <div
            className="absolute"
            style={{ left: Math.round(GLASS.cx * w - globeSize / 2), top: Math.round(GLASS.cy * h - GEOMETRY.centerY * globeSize) }}
          >
            <GalaxyGlobe
              ref={globeRef}
              size={globeSize}
              lights={lights}
              communityCount={scene === 2 ? PREVIEW_COMMUNITY : community}
              communityRainbowRatio={scene === 2 ? PREVIEW_RAINBOW : DEFAULT_RAINBOW_RATIO}
              chrome="none"
              communityAnimate
              interactive={false}
              onReady={() => setReady(true)}
            />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 top-[3%] text-center">
          <h3 className="font-serif text-[28px] leading-tight font-semibold text-[#F4EFE6] [text-shadow:0_2px_18px_rgb(8_7_20/0.6)]">
            {title}
          </h3>
          <p className="mt-1 font-serif text-[13px] text-[#F4EFE6] [text-shadow:0_2px_14px_rgb(8_7_20/0.55)]">{tagline}</p>
        </div>
      </div>
      <div className="relative -mt-[14%] flex flex-col items-center gap-2 bg-gradient-to-b from-transparent via-[#0a0916]/50 to-[#0a0916]/60 px-5 pt-6 pb-5">
        <p ref={lineRef} key={scene} className="min-h-6 text-center font-serif text-[15px] text-[#E7E3F4] [text-shadow:0_2px_14px_rgb(8_7_20/0.7)]">
          {lines[scene]}
        </p>
        <div className="flex">
          {lines.map((l, i) => (
            <button
              key={l}
              type="button"
              aria-label={`장면 ${i + 1}`}
              aria-current={i === scene ? "true" : undefined}
              onClick={() => setScene(i)}
              className="flex h-5 w-5 items-center justify-center"
            >
              <span className="h-[5px] w-[5px] rounded-full transition-colors duration-300" style={{ background: i === scene ? "#F2C879" : "rgba(183,179,218,0.35)" }} />
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onPrimary}
          className="mt-1 h-12 w-full max-w-80 rounded-2xl border border-[#F2C879]/30 bg-[#F4EFE6] text-[15px] font-semibold text-[#2B2A4C] shadow-[0_10px_30px_rgb(20_19_43/0.55),0_0_24px_rgb(143_134_214/0.22)]"
        >
          {primaryLabel}
        </button>
        {/* 장면이 바뀌어도 높이 고정. 버튼이 튀지 않게 */}
        <button
          type="button"
          onClick={() => setScene(lines.length - 1)}
          disabled={last}
          className={`h-5 text-[13px] leading-5 text-[#A7A2D4] ${last ? "font-serif" : ""}`}
        >
          {last ? "언제나, 가장 빛나는 곳에" : "건너뛰기"}
        </button>
      </div>
    </div>
  );
}
