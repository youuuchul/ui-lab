"use client";
import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type KeyboardEvent, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";

export interface ServiceCarouselProps<T> {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T, active: boolean) => ReactNode;
  /** 가운데 항목을 누르거나 Enter */
  onOpen?: (item: T) => void;
  onChange?: (index: number) => void;
  /** 항목 높이 / 폭 */
  ratio?: number;
  maxItemWidth?: number;
  /** 자동 넘김 간격(ms). 0이면 끔 */
  autoplay?: number;
  /** 가운데 항목 위에서 커서 대신 따라다니는 라벨 */
  pointerLabel?: string;
  label?: string;
  className?: string;
}

const ANGLE = 0.5;
const SIDE_X = 0.46;
const TURN = 0.62;
const FILL = 0.84;
const SNAP_PX = 34;
const TAP_PX = 8;
const SETTLE = 11;
const FLOW_LEAN = 0.05;
const FLOW_LEAN_MAX = 0.25;
const HOVER_TILT = 0.32;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const perspective = (h: number) => Math.max(1200, h * 2.2);

type Drag = { id: number; x: number; y: number; T0: number; lastX: number; lastT: number; v: number; moved: boolean };

/** 원형으로 도는 3D 캐러셀: 가운데가 선택, 양옆은 비스듬히 돌아 무대 끝에 걸친다. */
/** 항목이 없으면 아무것도 그리지 않는다 (위치 계산이 항목 수로 나눈다) */
export function ServiceCarousel<T>(props: ServiceCarouselProps<T>) {
  return props.items.length ? <CarouselStage {...props} /> : null;
}

function CarouselStage<T>({
  items,
  getKey,
  renderItem,
  onOpen,
  onChange,
  ratio = 1.5,
  maxItemWidth = 260,
  autoplay = 5000,
  pointerLabel,
  label = "목록",
  className = "",
}: ServiceCarouselProps<T>) {
  const n = items.length;
  const reduce = useReducedMotion();
  const stage = useRef<HTMLDivElement>(null);
  const pointer = useRef<HTMLSpanElement>(null);
  const nodes = useRef<(HTMLDivElement | null)[]>([]);
  const st = useRef({
    L: 0,
    T: 0,
    vel: 0,
    hx: 0,
    hy: 0,
    tx: 0,
    ty: 0,
    drag: null as Drag | null,
    size: { w: 1, h: 1, pw: 200 },
    wheelAcc: 0,
    wheelUntil: 0,
  });
  const [active, setActive] = useState(0);
  const activeRef = useRef(0);
  const [hover, setHover] = useState(false);
  const [kbdFocus, setKbdFocus] = useState(false);
  const [seen, setSeen] = useState(false);
  const [nudge, setNudge] = useState(0);
  const cb = useRef({ onOpen, onChange, items });
  useEffect(() => {
    cb.current = { onOpen, onChange, items };
  });

  const mod = useCallback((v: number) => ((v % n) + n) % n, [n]);
  const wrap = useCallback((v: number) => mod(v + n / 2) - n / 2, [mod, n]);

  const step = useCallback((d: number) => {
    st.current.T = Math.round(st.current.T) + d;
  }, []);

  const goIndex = useCallback(
    (i: number) => {
      const S = st.current;
      const b = Math.round(S.T);
      S.T = b + wrap(i - mod(b));
    },
    [mod, wrap],
  );

  const open = useCallback((i: number) => cb.current.onOpen?.(cb.current.items[i]), []);

  /** 3D 변형 때문에 이벤트 대상이 어긋나므로 좌표로 항목을 고른다 (가장 앞쪽 우선). */
  const hitIndex = (x: number, y: number) => {
    let best: number | null = null;
    let bestZ = -Infinity;
    nodes.current.forEach((el, k) => {
      if (!el || el.style.visibility === "hidden") return;
      const r = (el.firstElementChild as HTMLElement).getBoundingClientRect();
      if (x < r.left || x > r.right || y < r.top || y > r.bottom) return;
      const z = Number(el.style.zIndex) || 0;
      if (z > bestZ) {
        bestZ = z;
        best = k;
      }
    });
    return best;
  };

  const tap = useCallback(
    (x: number, y: number) => {
      const cur = activeRef.current;
      const k = hitIndex(x, y);
      if (k === cur) return open(cur);
      if (k !== null) return goIndex(k);
      const r = stage.current?.getBoundingClientRect();
      if (!r) return;
      const fx = (x - r.left) / r.width;
      if (fx < 0.3) step(-1);
      else if (fx > 0.7) step(1);
    },
    [goIndex, step, open],
  );

  const measure = useCallback(() => {
    const box = stage.current;
    if (!box) return;
    const w = box.clientWidth;
    const h = box.clientHeight;
    const pw = Math.min(maxItemWidth, (h * FILL) / ratio, w * 0.62);
    st.current.size = { w, h, pw };
    box.style.setProperty("--item-w", `${pw}px`);
    box.style.perspective = `${perspective(h)}px`;
  }, [maxItemWidth, ratio]);

  useEffect(() => {
    const box = stage.current;
    if (!box) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, [measure]);

  useEffect(() => {
    const box = stage.current;
    if (!box) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.5 });
    io.observe(box);
    return () => io.disconnect();
  }, []);

  // 자동 넘김: 마우스를 올렸거나 키보드 포커스가 안에 있거나 화면 밖·모션 줄이기면 멈춘다. 끄는 중이면 한 번 미룬다.
  useEffect(() => {
    if (!autoplay || reduce || hover || kbdFocus || !seen) return;
    const id = window.setTimeout(() => {
      if (st.current.drag) setNudge((v) => v + 1);
      else step(1);
    }, autoplay);
    return () => clearTimeout(id);
  }, [active, autoplay, reduce, hover, kbdFocus, seen, nudge, step]);

  // 가로 휠(트랙패드 좌우)도 한 칸씩
  useEffect(() => {
    const box = stage.current;
    if (!box) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      const S = st.current;
      const now = performance.now();
      if (now < S.wheelUntil) return;
      S.wheelAcc += e.deltaX;
      if (Math.abs(S.wheelAcc) > 40) {
        step(Math.sign(S.wheelAcc));
        S.wheelAcc = 0;
        S.wheelUntil = now + 450;
      }
    };
    box.addEventListener("wheel", onWheel, { passive: false });
    return () => box.removeEventListener("wheel", onWheel);
  }, [step]);

  // 포인터: window 한 경로로만 받고 누른 포인터만 따라간다. 세로로 먼저 움직이면 페이지 스크롤에 넘긴다.
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const S = st.current;
      const d = S.drag;
      if (!d || e.pointerId !== d.id) return;
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (!d.moved) {
        if (Math.abs(dx) > TAP_PX && Math.abs(dx) > Math.abs(dy)) {
          d.moved = true;
          stage.current?.setPointerCapture?.(d.id);
        } else if (Math.abs(dy) > TAP_PX) {
          S.drag = null;
          return;
        } else return;
      }
      const unit = S.size.pw * 1.4;
      S.T = d.T0 - dx / unit;
      const now = performance.now();
      const inst = -(e.clientX - d.lastX) / unit / Math.max(0.001, (now - d.lastT) / 1000);
      d.v = d.v * 0.7 + inst * 0.3;
      d.lastX = e.clientX;
      d.lastT = now;
    };
    const up = (e: PointerEvent) => {
      const S = st.current;
      const d = S.drag;
      if (!d || e.pointerId !== d.id) return;
      S.drag = null;
      if (!d.moved) return tap(e.clientX, e.clientY);
      const dx = e.clientX - d.x;
      let jump = dx < -SNAP_PX ? 1 : dx > SNAP_PX ? -1 : 0;
      if (Math.abs(d.v) > 3) jump = Math.sign(d.v) * (Math.abs(d.v) > 7 ? 2 : 1);
      S.T = Math.round(d.T0) + jump;
    };
    const cancel = (e: PointerEvent) => {
      const S = st.current;
      const d = S.drag;
      if (!d || e.pointerId !== d.id) return;
      S.drag = null;
      if (d.moved) S.T = Math.round(S.T);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", cancel);
    };
  }, [tap]);

  // 프레임 루프: 목표 위치를 스프링으로 따라가며 배치. 바뀐 값만 DOM에 쓴다.
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const prev: { o: string; z: string; a: string }[] = [];
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const S = st.current;
      const p0 = S.L;
      S.L += (S.T - S.L) * (reduce ? 1 : Math.min(1, dt * SETTLE));
      const v = (S.L - p0) / Math.max(dt, 0.001);
      S.vel += (v - S.vel) * Math.min(1, dt * 10);
      S.tx += (S.hx - S.tx) * Math.min(1, dt * 6);
      S.ty += (S.hy - S.ty) * Math.min(1, dt * 6);

      const { w, pw } = S.size;
      const RX = Math.min(w * SIDE_X, pw * 2) / Math.sin(ANGLE);
      const lean = reduce ? 0 : clamp(Math.sign(S.vel) * Math.sqrt(Math.abs(S.vel)) * FLOW_LEAN, -FLOW_LEAN_MAX, FLOW_LEAN_MAX);
      const cur = mod(Math.round(S.L));
      for (let k = 0; k < n; k++) {
        const el = nodes.current[k];
        if (!el) continue;
        const a = wrap(k - S.L);
        const h = Math.abs(a);
        const focus = Math.max(0, 1 - h);
        const th = a * ANGLE;
        const x = Math.sin(th) * RX;
        const z = -(1 - Math.cos(th)) * pw * 2.6 - Math.min(h, 1) * pw * 0.2;
        let ry = -clamp(a, -1.4, 1.4) * TURN + lean;
        let rx = 0;
        const rz = -lean * 0.3;
        if (!reduce) {
          ry += S.tx * HOVER_TILT * focus;
          rx -= S.ty * HOVER_TILT * 0.6 * focus;
        }
        const scale = 1 - Math.min(h, 1.5) * 0.12;
        const op = h < 1.5 ? 1 : Math.max(0, 1 - (h - 1.5) * 2);
        el.style.transform = `translate3d(${x}px, 0px, ${z}px) rotateX(${rx}rad) rotateY(${ry}rad) rotateZ(${rz}rad) scale(${scale})`;
        const lv = (prev[k] ??= { o: "", z: "", a: "" });
        const o = op.toFixed(3);
        if (o !== lv.o) {
          el.style.opacity = o;
          el.style.visibility = op < 0.01 ? "hidden" : "";
          lv.o = o;
        }
        const zi = String(100 - Math.round(h * 10));
        if (zi !== lv.z) {
          el.style.zIndex = zi;
          lv.z = zi;
        }
        const act = String(k === cur);
        if (act !== lv.a) {
          el.dataset.active = act;
          lv.a = act;
        }
      }
      if (cur !== activeRef.current) {
        activeRef.current = cur;
        setActive(cur);
        cb.current.onChange?.(cur);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, n, mod, wrap]);

  const onPointerDown = (e: ReactPointerEvent) => {
    const S = st.current;
    if (e.button !== 0 || S.drag) return;
    S.drag = { id: e.pointerId, x: e.clientX, y: e.clientY, T0: S.L, lastX: e.clientX, lastT: performance.now(), v: 0, moved: false };
  };

  // 마우스를 올리면 가운데 항목이 포인터 쪽으로 기운다
  const onPointerMove = (e: ReactPointerEvent) => {
    if (e.pointerType !== "mouse" || st.current.drag?.moved) return;
    const S = st.current;
    const r = stage.current?.getBoundingClientRect();
    if (!r) return;
    const ph = S.size.pw * ratio;
    S.hx = clamp((e.clientX - (r.left + r.width / 2)) / (S.size.pw * 0.6), -1, 1);
    S.hy = clamp((e.clientY - (r.top + r.height / 2)) / (ph * 0.5), -1, 1);
    const k = hitIndex(e.clientX, e.clientY);
    const mode = k === null ? "" : k === activeRef.current ? "open" : "move";
    if (stage.current && stage.current.dataset.hover !== mode) stage.current.dataset.hover = mode;
    if (pointer.current) pointer.current.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`;
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open(activeRef.current);
    }
  };

  const showLabel = !!pointerLabel && !!onOpen;

  return (
    <div
      className={`relative ${className}`}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHover(false)}
      onFocus={(e) => e.target.matches(":focus-visible") && setKbdFocus(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setKbdFocus(false);
      }}
    >
      <div
        ref={stage}
        className={`group/stage absolute inset-0 cursor-grab touch-pan-y outline-none select-none [mask-image:linear-gradient(90deg,transparent_0,#000_16%,#000_84%,transparent_100%)] focus-visible:shadow-[inset_0_0_0_2px_var(--color-accent)] active:cursor-grabbing data-[hover=move]:cursor-pointer ${showLabel ? "data-[hover=open]:cursor-none" : "data-[hover=open]:cursor-pointer"}`}
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
        onKeyDown={onKey}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerLeave={() => {
          st.current.hx = 0;
          st.current.hy = 0;
          if (stage.current) stage.current.dataset.hover = "";
        }}
      >
        <div className="absolute inset-0 [transform-style:preserve-3d]">
          {items.map((it, k) => (
            <div
              key={getKey(it)}
              ref={(el) => {
                nodes.current[k] = el;
              }}
              className="absolute top-1/2 left-1/2 h-0 w-0 [transform-style:preserve-3d] will-change-[transform,opacity]"
              aria-hidden={k !== active}
            >
              <div
                className="-translate-x-1/2 -translate-y-1/2"
                style={{ width: "var(--item-w)", height: `calc(var(--item-w) * ${ratio})` }}
              >
                {renderItem(it, k === active)}
              </div>
            </div>
          ))}
        </div>
        {showLabel && (
          <span ref={pointer} className="pointer-events-none absolute top-0 left-0 z-10" aria-hidden="true">
            <span className="block -translate-x-1/2 -translate-y-1/2 scale-60 rounded-full bg-fg px-3.5 py-2 text-sm font-bold whitespace-nowrap text-bg opacity-0 transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] group-data-[hover=open]/stage:scale-100 group-data-[hover=open]/stage:opacity-100">
              {pointerLabel}
            </span>
          </span>
        )}
      </div>
      <button
        type="button"
        aria-label="이전"
        onClick={() => step(-1)}
        className="absolute top-1/2 left-[3%] z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl border border-fg/20 bg-fg/5 text-fg/80 backdrop-blur hover:bg-fg/15"
      >
        <svg viewBox="0 0 16 16" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.7]" aria-hidden="true">
          <path d="M10 3.5 5.5 8l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="다음"
        onClick={() => step(1)}
        className="absolute top-1/2 right-[3%] z-20 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-xl border border-fg/20 bg-fg/5 text-fg/80 backdrop-blur hover:bg-fg/15"
      >
        <svg viewBox="0 0 16 16" className="h-[18px] w-[18px] fill-none stroke-current stroke-[1.7]" aria-hidden="true">
          <path d="M6 3.5 10.5 8 6 12.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
