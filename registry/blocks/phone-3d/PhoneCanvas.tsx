"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { deviceTilt, enableDeviceTilt } from "./tilt";

type Props = {
  screen: string;
  tone: string;
  /** 그릴 폰 높이(px) */
  height: number;
  label: string;
  className?: string;
  /** WebGL 준비 전·실패 시 보여 줄 대체 화면 */
  fallback?: ReactNode;
};

const deg = (d: number) => (d * Math.PI) / 180;

/** WebGL 폰 한 대: 마우스를 올리면 포인터 쪽으로, 휴대폰에서는 기울기에 따라 돈다. */
export function PhoneCanvas({ screen, tone, height, label, className = "", fallback }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const hover = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    let raf = 0;
    let dead = false;
    let ro: ResizeObserver | null = null;
    let stage: { dispose: () => void } | null = null;
    (async () => {
      const { PhoneStage } = await import("./phone");
      const g = await PhoneStage.create(cv, [{ screen, tone }]);
      if (dead) return g.dispose();
      stage = g;
      const fit = () => {
        g.resize(cv.clientWidth, cv.clientHeight);
        g.setView({ perspective: 1400, originY: 0.5, worldX: 0, worldRx: 0, worldRy: 0 });
      };
      fit();
      ro = new ResizeObserver(fit);
      ro.observe(cv);
      const cur = { x: 0, y: 0 };
      let last = performance.now();
      const tick = (now: number) => {
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        const gx = reduce ? 0 : deviceTilt.on ? deviceTilt.x : hover.current.x;
        const gy = reduce ? 0 : deviceTilt.on ? deviceTilt.y : hover.current.y;
        cur.x += (gx - cur.x) * Math.min(1, dt * 5);
        cur.y += (gy - cur.y) * Math.min(1, dt * 5);
        g.render([{ x: 0, y: 0, z: 0, rx: deg(4 - cur.y * 14), ry: deg(-18 + cur.x * 32), rz: 0, h: height, o: 1 }]);
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      setReady(true);
    })().catch(() => setReady(false));
    return () => {
      dead = true;
      cancelAnimationFrame(raf);
      ro?.disconnect();
      stage?.dispose();
    };
  }, [screen, tone, height, reduce]);

  return (
    <div
      className={`relative ${className}`}
      role="img"
      aria-label={label}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect();
        hover.current.x = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
        hover.current.y = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
      }}
      onPointerLeave={() => {
        hover.current.x = 0;
        hover.current.y = 0;
      }}
      onClick={() => enableDeviceTilt()}
    >
      <canvas ref={ref} className="block h-full w-full transition-opacity duration-300" style={{ opacity: ready ? 1 : 0 }} />
      {!ready && fallback && <div className="absolute inset-0 grid place-items-center">{fallback}</div>}
    </div>
  );
}
