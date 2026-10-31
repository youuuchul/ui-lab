"use client";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";

export interface BinderGroup {
  id: string;
  name: string;
  period?: string;
}

export interface BinderPage {
  id: string;
  groupId: string;
  title: string;
  when?: string;
  lead: { value: ReactNode; label: string };
  /** 배너 오른쪽 요약 그림 */
  preview?: ReactNode;
  /** 팝업 장표 내용 */
  detail: ReactNode;
}

export interface CareerBinderProps {
  groups: BinderGroup[];
  pages: BinderPage[];
  /** 자동 넘김 간격(ms). 0이면 끔 */
  autoplay?: number;
  /** 가운데 배너 위에서 커서 대신 따라다니는 라벨 */
  pointerLabel?: string;
  className?: string;
}

/** 배너 사이 간격 상한(px). 남는 양옆 여백은 옆 배너가 흐리게 채운다. */
const GAP = 24;

/** 원형 거리: 마지막 다음이 첫 배너. 범위 [-n/2, n/2) */
const dist = (k: number, i: number, n: number) => {
  const h = Math.floor(n / 2);
  return ((((k - i) % n) + n + h) % n) - h;
};

/** 그룹 탭 → 자동으로 넘어가는 사례 배너(양옆이 여백에 걸침) → 누르면 장표 팝업. */
/** 사례가 없으면 아무것도 그리지 않는다 */
export function CareerBinder(props: CareerBinderProps) {
  return props.pages.length ? <Binder {...props} /> : null;
}

function Binder({ groups, pages, autoplay = 5000, pointerLabel = "상세 보기", className = "" }: CareerBinderProps) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState(false);
  const [kbd, setKbd] = useState(false);
  const [seen, setSeen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [paused, setPaused] = useState(false);
  const [touching, setTouching] = useState(false);
  const uid = useId();
  const [lay, setLay] = useState({ w: 0, l: 0, r: 0 });
  const tabs = useRef<HTMLDivElement>(null);
  const binder = useRef<HTMLDivElement>(null);
  const stack = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const pointer = useRef<HTMLSpanElement>(null);
  const byKey = useRef(false);
  const drag = useRef<{ x: number; y: number; id: number; on: boolean } | null>(null);
  const dragged = useRef(false);
  const n = pages.length;
  const page = pages[i];

  const go = useCallback((k: number) => setI(((k % n) + n) % n), [n]);

  // 배너 폭과 양옆 여백: 간격은 GAP 이하로 두고 나머지 여백에 옆 배너가 보이게
  useLayoutEffect(() => {
    const el = binder.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      setLay({ w: r.width, l: r.left, r: document.documentElement.clientWidth - r.right });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = binder.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSeen(e.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 정지 버튼·마우스 올림·터치 접촉·키보드 포커스·끄는 중·팝업 열림·모션 줄이기·화면 밖이면 멈춤
  useEffect(() => {
    if (!autoplay || reduce || paused || open || hover || touching || kbd || dragging || !seen) return;
    const t = setTimeout(() => go(i + 1), autoplay);
    return () => clearTimeout(t);
  }, [i, autoplay, reduce, paused, open, hover, touching, kbd, dragging, seen, go]);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  // 탭 줄이 넘치는 좁은 화면: 고른 탭이 보이게 가로 스크롤
  useEffect(() => {
    const el = tabs.current;
    const t = el?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (!el || !t) return;
    el.scrollTo({ left: Math.max(0, t.offsetLeft + t.offsetWidth - el.clientWidth), behavior: "smooth" });
  }, [page.groupId]);

  const onTabKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    const edge = e.key === "Home" ? 0 : e.key === "End" ? groups.length - 1 : -1;
    if (!step && edge < 0) return;
    e.preventDefault();
    const cur = groups.findIndex((g) => g.id === page.groupId);
    const to = edge >= 0 ? edge : (cur + step + groups.length) % groups.length;
    const k = pages.findIndex((x) => x.groupId === groups[to].id);
    if (k < 0) return;
    go(k);
    tabs.current?.querySelectorAll<HTMLElement>('[role="tab"]')[to]?.focus();
  };

  const place = (d: number) => {
    if (d === 0) return "translateX(var(--dx))";
    const space = d > 0 ? lay.r : lay.l;
    const gap = Math.min(GAP, space / 2);
    return `translateX(calc(${d * (lay.w + gap)}px + var(--dx)))`;
  };

  const setDx = (dx: number) => stack.current?.style.setProperty("--dx", `${dx}px`);

  const endDrag = (e: PointerEvent, commit: boolean) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId || !d.on) return;
    const dx = e.clientX - d.x;
    if (commit && Math.abs(dx) > Math.min(80, lay.w * 0.15)) go(i + (dx < 0 ? 1 : -1));
    setDx(0);
    setDragging(false);
  };

  return (
    <div className={`overflow-x-clip text-fg ${className}`}>
      <LayoutGroup>
        <div
          ref={tabs}
          onKeyDown={onTabKey}
          className="relative -ml-3 flex items-start gap-x-2 gap-y-1 overflow-x-auto shadow-[inset_0_-1px_var(--color-line)] [scrollbar-width:none]"
          role="tablist"
          aria-label="그룹"
        >
          {groups.map((g) => {
            const on = g.id === page.groupId;
            const first = pages.findIndex((x) => x.groupId === g.id);
            return (
              <motion.button
                layout
                key={g.id}
                type="button"
                role="tab"
                id={`${uid}-tab-${g.id}`}
                aria-selected={on}
                aria-controls={`${uid}-panel`}
                tabIndex={on ? 0 : -1}
                className={`relative flex min-w-10 flex-none items-baseline gap-2.5 px-3 pb-3 text-left transition-colors disabled:opacity-40 ${on ? "text-fg" : "text-muted hover:text-fg"}`}
                disabled={first < 0}
                onClick={() => go(first)}
                transition={{ type: "spring", stiffness: 380, damping: 34 }}
              >
                <motion.strong layout="position" className="text-lg font-extrabold tracking-[-0.01em] whitespace-nowrap">
                  {g.name}
                </motion.strong>
                {on && g.period && (
                  <motion.span
                    className="font-mono text-sm whitespace-nowrap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25, delay: 0.08 }}
                  >
                    {g.period}
                  </motion.span>
                )}
                {on && (
                  <motion.i
                    layoutId="binderTabLine"
                    className="absolute right-0 bottom-0 left-0 h-0.5 bg-fg"
                    transition={{ type: "spring", stiffness: 380, damping: 34 }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </LayoutGroup>

      <div
        ref={binder}
        id={`${uid}-panel`}
        role="tabpanel"
        aria-labelledby={`${uid}-tab-${page.groupId}`}
        aria-describedby={`${uid}-hint`}
        className="group/binder @container relative mt-5 outline-none"
        tabIndex={0}
        onPointerDown={(e) => e.pointerType !== "mouse" && setTouching(true)}
        onPointerUp={() => setTouching(false)}
        onPointerCancel={() => setTouching(false)}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHover(true)}
        onPointerLeave={(e) => {
          if (e.pointerType !== "mouse") return;
          setHover(false);
          e.currentTarget.dataset.hover = "";
        }}
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          const el = e.currentTarget;
          const t = e.target as Element;
          const on = !drag.current?.on && !!t.closest("[data-at='on']") && !t.closest("[data-nav]");
          if (el.dataset.hover !== (on ? "open" : "")) el.dataset.hover = on ? "open" : "";
          const r = el.getBoundingClientRect();
          if (pointer.current) pointer.current.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px)`;
        }}
        onFocus={(e) => setKbd(e.target.matches(":focus-visible"))}
        onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setKbd(false)}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "ArrowRight") go(i + 1);
          if (e.key === "ArrowLeft") go(i - 1);
          if (e.key === "Enter") {
            byKey.current = true;
            setOpen(true);
          }
        }}
      >
        <div
          ref={stack}
          className="grid touch-pan-y [--dx:0px] data-drag:select-none"
          data-drag={dragging || undefined}
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            dragged.current = false;
            drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId, on: false };
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d || d.id !== e.pointerId) return;
            // 버튼을 뗀 채 들어온 마우스 이동은 끌기가 아니다
            if (e.pointerType === "mouse" && !(e.buttons & 1)) {
              drag.current = null;
              return;
            }
            const dx = e.clientX - d.x;
            if (!d.on) {
              if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(e.clientY - d.y)) return;
              d.on = dragged.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              getSelection()?.removeAllRanges();
              setDragging(true);
            }
            setDx(dx);
          }}
          onPointerUp={(e) => endDrag(e, true)}
          onPointerCancel={(e) => endDrag(e, false)}
        >
          {pages.map((p, k) => {
            const d = dist(k, i, n);
            const at = d === 0 ? "on" : Math.abs(d) === 1 ? "side" : "off";
            return (
              <article
                key={p.id}
                data-at={at}
                className={`relative grid cursor-pointer grid-cols-1 items-stretch gap-x-10 gap-y-5 rounded-2xl border border-line bg-surface px-8 pt-7 pb-16 [grid-area:1/1] sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] ${
                  dragging || reduce ? "" : "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.3,0.7,0.3,1)]"
                } ${
                  at === "on"
                    ? "z-[2] group-focus-visible/binder:outline-2 group-focus-visible/binder:outline-offset-[3px] group-focus-visible/binder:outline-fg group-data-[hover=open]/binder:cursor-none"
                    : at === "side"
                      ? "z-[1] opacity-50 hover:opacity-75"
                      : "pointer-events-none z-0 opacity-0"
                }`}
                style={{ transform: place(d), minHeight: "clamp(240px, 32cqi, 480px)" }}
                aria-hidden={d !== 0 || undefined}
                onClick={() => {
                  if (dragged.current) {
                    dragged.current = false;
                    return;
                  }
                  if (d === 0) {
                    byKey.current = false;
                    setOpen(true);
                  } else go(k);
                }}
              >
                <div className="flex min-w-0 flex-col justify-center">
                  <h3 className="text-[clamp(18px,1.9vw,24px)] leading-tight font-extrabold tracking-[-0.03em]">{p.title}</h3>
                  {/* 가운데로 올 때마다 다시 붙여 수치 등장 애니메이션을 새로 */}
                  <dl key={d === 0 ? "on" : "off"} className="mt-5">
                    <dd className="text-[clamp(36px,4.2vw,52px)] leading-none font-extrabold tracking-tight">{p.lead.value}</dd>
                    <dt className="mt-1.5 text-fg/70">{p.lead.label}</dt>
                  </dl>
                </div>
                {p.preview && <div className="min-w-0">{p.preview}</div>}
                {p.when && (
                  <p className="absolute bottom-3 left-8 flex h-[30px] items-center font-mono text-sm tracking-[0.02em] text-muted">{p.when}</p>
                )}
                <div
                  data-nav
                  className={`absolute right-3.5 bottom-3 flex cursor-default items-center rounded-[9px] bg-fg/60 p-0.5 text-bg ${at === "side" ? "pointer-events-none" : ""}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button type="button" aria-label="이전 사례" tabIndex={d === 0 ? 0 : -1} onClick={() => go(i - 1)} className="relative h-[26px] w-7 rounded-[7px] text-lg leading-none after:absolute after:-inset-x-1.5 after:-inset-y-[7px] hover:bg-bg/20">
                    ‹
                  </button>
                  <span className="px-1 font-mono text-sm tabular-nums">
                    {k + 1} / {n}
                  </span>
                  <button type="button" aria-label="다음 사례" tabIndex={d === 0 ? 0 : -1} onClick={() => go(i + 1)} className="relative h-[26px] w-7 rounded-[7px] text-lg leading-none after:absolute after:-inset-x-1.5 after:-inset-y-[7px] hover:bg-bg/20">
                    ›
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        <span id={`${uid}-hint`} className="sr-only">
          좌우 화살표로 넘기고 Enter로 크게 봅니다
        </span>
        <span ref={pointer} className="pointer-events-none absolute top-0 left-0 z-[3]" aria-hidden="true">
          <span className="block -translate-x-1/2 -translate-y-1/2 scale-60 rounded-full bg-fg px-3.5 py-2 text-sm font-bold whitespace-nowrap text-bg opacity-0 transition-[opacity,scale] duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] group-data-[hover=open]/binder:scale-100 group-data-[hover=open]/binder:opacity-100">
            {pointerLabel}
          </span>
        </span>
      </div>

      {autoplay > 0 && !reduce && (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            aria-label="자동 넘김 정지"
            aria-pressed={paused}
            onClick={() => setPaused((p) => !p)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-fg"
          >
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden="true">
              {paused ? <path d="M4 2.5v11l9-5.5z" /> : <path d="M3.5 2.5h3v11h-3zM9.5 2.5h3v11h-3z" />}
            </svg>
          </button>
        </div>
      )}

      {/* 바깥(배경)·닫기 버튼·Esc로 닫힘. 장표 안쪽을 눌러도 닫히지 않는다 */}
      <dialog
        ref={dialog}
        className="m-auto max-h-[calc(100svh-32px)] w-[min(64rem,calc(100vw-32px))] max-w-none cursor-zoom-out overflow-auto overscroll-contain bg-transparent p-0 text-fg backdrop:bg-black/55 backdrop:backdrop-blur-[6px] focus-visible:outline-none open:animate-[binder-pop_0.28s_cubic-bezier(0.3,0.7,0.3,1)] motion-reduce:open:animate-none"
        aria-label={page.title}
        onClose={() => {
          setOpen(false);
          // 사파리는 마우스로 연 팝업을 닫으면 포커스 표시가 남아 자동 넘김이 멈춘다 → 포커스를 놓는다
          if (!byKey.current) binder.current?.blur();
        }}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
      >
        {open && (
          <div className="cursor-auto rounded-2xl border border-line bg-surface p-8 shadow-[0_30px_80px_-30px_#000c]">
            <div className="-mt-4 -mr-4 mb-1 flex justify-end">
              <button
                type="button"
                aria-label="닫기"
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-fg/10 hover:text-fg focus-visible:outline-2 focus-visible:outline-fg"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                  <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
                </svg>
              </button>
            </div>
            {page.detail}
          </div>
        )}
      </dialog>
      <style>{"@keyframes binder-pop{from{opacity:0;transform:scale(.97)}}"}</style>
    </div>
  );
}
