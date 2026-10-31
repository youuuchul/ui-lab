import type { CSSProperties } from "react";

type Props = {
  screen: string;
  /** 뒷면 색 */
  tone: string;
  /** 폭(px). 높이·두께·모서리는 비율로 따라감 */
  width?: number;
  label?: string;
  className?: string;
  style?: CSSProperties;
};

const SIDE = "linear-gradient(90deg, #5b6787, #8d98b6 45%, #3c4766)";
const CAP = "linear-gradient(180deg, #5b6787, #8d98b6 45%, #3c4766)";

/** CSS 3D 폰: 앞면(화면)·뒷면·네 옆면. 회전은 바깥에서 transform으로. WebGL이 없을 때 대체용. */
export function Phone3D({ screen, tone, width = 240, label, className = "", style }: Props) {
  const pw = width;
  const ph = pw * 2.07;
  const pt = pw * 0.055;
  const pr = pw * 0.17;
  const face: CSSProperties = { position: "absolute", inset: 0, borderRadius: pr, backfaceVisibility: "hidden" };
  return (
    <div className={`relative [transform-style:preserve-3d] ${className}`} style={{ width: pw, height: ph, ...style }}>
      <div
        style={{
          ...face,
          transform: `translateZ(${pt / 2}px)`,
          padding: pw * 0.035,
          background: "linear-gradient(145deg, #3a4566 0%, #1a2036 60%, #2c3655 100%)",
          boxShadow: "inset 0 0 0 1px #ffffff26",
        }}
      >
        <img
          src={screen}
          alt={label ?? ""}
          draggable={false}
          className="block h-full w-full object-cover object-top select-none"
          style={{ borderRadius: pr * 0.82, background: "#000" }}
        />
        <span
          aria-hidden="true"
          className="absolute left-1/2 w-[30%] -translate-x-1/2 rounded-full bg-[#05070d]"
          style={{ top: pw * 0.065, height: pw * 0.085 }}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            inset: pw * 0.035,
            borderRadius: pr * 0.82,
            background: "linear-gradient(110deg, #ffffff00 30%, #ffffff2e 48%, #ffffff00 62%)",
          }}
        />
      </div>
      <div
        aria-hidden="true"
        style={{
          ...face,
          transform: `rotateY(180deg) translateZ(${pt / 2}px)`,
          background: `radial-gradient(120% 80% at 30% 20%, color-mix(in srgb, ${tone} 70%, white) 0%, ${tone} 70%)`,
          boxShadow: "inset 0 0 0 2px #ffffff40",
        }}
      >
        <span
          className="absolute top-[6%] left-[8%] aspect-square w-[34%] rounded-[28%]"
          style={{ background: `color-mix(in srgb, ${tone} 60%, #1d2742)`, boxShadow: "inset 0 0 0 2px #ffffff30" }}
        />
      </div>
      {[-90, 90].map((deg) => (
        <i
          key={deg}
          aria-hidden="true"
          className="absolute"
          style={{
            top: pr * 0.6,
            width: pt,
            height: ph - pr * 1.2,
            left: `calc(50% - ${pt / 2}px)`,
            background: SIDE,
            transform: `rotateY(${deg}deg) translateZ(${pw / 2}px)`,
          }}
        />
      ))}
      {[90, -90].map((deg) => (
        <i
          key={deg}
          aria-hidden="true"
          className="absolute"
          style={{
            left: pr * 0.6,
            width: pw - pr * 1.2,
            height: pt,
            top: `calc(50% - ${pt / 2}px)`,
            background: CAP,
            transform: `rotateX(${deg}deg) translateZ(${ph / 2}px)`,
          }}
        />
      ))}
    </div>
  );
}
