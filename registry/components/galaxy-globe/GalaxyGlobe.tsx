"use client";
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import createCanvas2dGlobe from "./canvas2d";
import { PALETTE, namedSummary } from "./shared";
import type {
  ClientPoint,
  GlobeChrome,
  GlobeHandle,
  GlobeStatus,
  HoverTarget,
  Light,
  NamedLight,
} from "./globeTypes";

export type { GlobeStatus, HoverTarget, Light, NamedLight } from "./globeTypes";
export {
  DEFAULT_RAINBOW_RATIO,
  GEOMETRY,
  PALETTE,
  communityStarFromIndex,
  lightFromMemory,
  namedLightFromId,
} from "./shared";

const CARD_BASE = "rgba(21,20,43,0.88)";
const OPAL_BORDER = "rgba(233,214,232,0.62)";
const OPAL_SHEEN = `linear-gradient(100deg, ${PALETTE.opal
  .map((c, i) => `${c}2E ${(i / PALETTE.opal.length) * 100}%`)
  .concat([`${PALETTE.opal[0]}2E 100%`])
  .join(", ")})`;
const OPAL_CARD_BG = `${OPAL_SHEEN}, linear-gradient(0deg, ${CARD_BASE}, ${CARD_BASE})`;

const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

export interface GalaxyGlobeRef {
  /** 흩어진 별빛이 모여든다 */
  gather: () => Promise<void>;
  /** 새 별빛 하나가 날아와 켜진다 */
  lightUp: (light: Light, fromClient?: ClientPoint | null) => Promise<void>;
  toClient: (target: Light | string) => ClientPoint | null;
  /** 마지막 탭이 별빛에 맞았는지. 바깥 제스처(장면 넘김 등)와 구분할 때 쓴다 */
  pointerOnLight: () => boolean;
}

export interface GalaxyGlobeProps {
  /** 정사각형 한 변(px) */
  size: number;
  /** 스크린리더용 이름 */
  ariaLabel?: string;
  /** 가장 앞의 별빛 (내 기록) */
  lights?: Light[];
  /** 이름 있는 별빛 (다른 사람이 공개한 기록) */
  namedLights?: NamedLight[];
  /** 은하수 밀도층 개수 (0 ~ 수십만) */
  communityCount?: number;
  /** 밀도층 중 무지갯빛 비율 0~1 */
  communityRainbowRatio?: number;
  status?: GlobeStatus;
  /** full: 유리 테두리·그림자까지, none: 원 안 하늘만 (그림 위에 얹을 때) */
  chrome?: GlobeChrome;
  /** 장식용 배경 별. 생성 때만 읽는다 */
  backdropStars?: boolean;
  statusAnimate?: boolean;
  /** communityCount가 늘 때 차오르는 연출 */
  communityAnimate?: boolean;
  /** false면 호버·탭 카드를 띄우지 않는다 (탭 판정은 계속) */
  interactive?: boolean;
  /** 카드 내용. 기본은 이름 있는 별빛의 공개 정보 한 줄 */
  renderCard?: (target: HoverTarget) => ReactNode;
  onTapLight?: (light: Light) => void;
  onReady?: () => void;
  ref?: Ref<GalaxyGlobeRef>;
}

function reducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function defaultCard(target: HoverTarget): ReactNode {
  if (target.kind === "named") {
    const line = namedSummary(target.light.info, { date: true, timeOfDay: true, name: true, species: true });
    return line ? <p className="text-xs text-[#E4E0F4]">{line}</p> : null;
  }
  return null;
}

export function GalaxyGlobe({
  size,
  ariaLabel = "별빛 지구본",
  lights = [],
  namedLights = [],
  communityCount = 0,
  communityRainbowRatio = 0.08,
  status = "active",
  chrome = "full",
  backdropStars = true,
  statusAnimate = false,
  communityAnimate = false,
  interactive = true,
  renderCard = defaultCard,
  onTapLight,
  onReady,
  ref,
}: GalaxyGlobeProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<GlobeHandle | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const hitRef = useRef(false);
  const [card, setCard] = useState<HoverTarget | null>(null);

  const latest = useRef({ lights, namedLights, communityCount, communityRainbowRatio, status, chrome, backdropStars, interactive, onTapLight, onReady });
  useEffect(() => {
    latest.current = { lights, namedLights, communityCount, communityRainbowRatio, status, chrome, backdropStars, interactive, onTapLight, onReady };
  });

  /* 마운트: 렌더러 생성. 이후 변경은 아래 동기화 effect가 처리 */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const p = latest.current;
    const layer = document.createElement("div");
    layer.style.cssText = "position:absolute;inset:0;";
    host.appendChild(layer);
    const handle = createCanvas2dGlobe(layer, {
      lights: p.lights,
      namedLights: p.namedLights,
      communityCount: p.communityCount,
      communityRainbowRatio: p.communityRainbowRatio,
      status: p.status,
      chrome: p.chrome,
      backdropStars: p.backdropStars,
      reducedMotion: reducedMotion(),
      onTap: (light) => latest.current.onTapLight?.(light),
      onHover: (target) => {
        hitRef.current = target !== null;
        if (latest.current.interactive) setCard(target);
      },
    });
    handleRef.current = handle;
    p.onReady?.();
    return () => {
      handle.destroy();
      handleRef.current = null;
      layer.remove();
    };
  }, []);

  useEffect(() => handleRef.current?.setLights(lights), [lights]);
  useEffect(() => handleRef.current?.setNamedLights(namedLights), [namedLights]);

  const firstCommunity = useRef(true);
  useEffect(() => {
    const animate = communityAnimate && !firstCommunity.current;
    firstCommunity.current = false;
    handleRef.current?.setCommunityCount(communityCount, { animate, rainbowRatio: communityRainbowRatio });
  }, [communityCount, communityRainbowRatio, communityAnimate]);

  const firstStatus = useRef(true);
  useEffect(() => {
    if (firstStatus.current) {
      firstStatus.current = false;
      return;
    }
    handleRef.current?.setStatus(status, { animate: statusAnimate });
  }, [status, statusAnimate]);

  /* 기울기: 기기 센서 → 데스크톱 포인터 → 아주 느린 자동 흔들림. 동작 줄이기면 0 */
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const st = { sensor: false, sx: 0, sy: 0, px: 0, py: 0, inside: false };
    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      st.sensor = true;
      const rad = (Number(window.screen?.orientation?.angle ?? 0) * Math.PI) / 180;
      const gx = clamp(e.gamma / 28, -1, 1);
      const gy = clamp((e.beta - 45) / 34, -1, 1);
      st.sx = clamp(gx * Math.cos(rad) + gy * Math.sin(rad), -1, 1);
      st.sy = clamp(-gx * Math.sin(rad) + gy * Math.cos(rad), -1, 1);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      st.inside = true;
      st.px = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
      st.py = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
    };
    const onLeave = () => {
      st.inside = false;
    };
    const reduce = reducedMotion();
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    window.addEventListener("deviceorientation", onOrientation, { passive: true });
    el.addEventListener("pointermove", onMove, { passive: true });
    el.addEventListener("pointerleave", onLeave, { passive: true });
    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const h = handleRef.current;
      if (!h) return;
      if (reduce) h.setTilt({ x: 0, y: 0 });
      else if (st.sensor) h.setTilt({ x: st.sx, y: st.sy });
      else if (fine) h.setTilt({ x: st.inside ? st.px : 0, y: st.inside ? st.py : 0 });
      else h.setTilt({ x: Math.sin((now / 1000) * 0.13) * 0.55, y: Math.cos((now / 1000) * 0.09) * 0.4 });
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("deviceorientation", onOrientation);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  /* iOS는 사용자 제스처 안에서만 센서 권한을 물을 수 있다 */
  const asked = useRef(false);
  const onPointerDown = useCallback(() => {
    hitRef.current = false;
    if (asked.current) return;
    asked.current = true;
    const DOE = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined;
    DOE?.requestPermission?.().catch(() => undefined);
  }, []);

  /* 글로브 바깥을 누르면 카드를 닫는다 */
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current?.contains(e.target as Node)) return;
      handleRef.current?.clearHover();
    };
    document.addEventListener("pointerdown", onDown, { capture: true });
    return () => document.removeEventListener("pointerdown", onDown, { capture: true });
  }, []);

  /* 카드가 회전하는 별빛을 따라간다 */
  const cardId = card?.light.id;
  useEffect(() => {
    if (!cardId) return;
    let raf = 0;
    const place = () => {
      raf = requestAnimationFrame(place);
      const wrap = wrapRef.current;
      const box = cardRef.current;
      const client = handleRef.current?.toClient(cardId);
      if (!wrap || !box || !client) return;
      const r = wrap.getBoundingClientRect();
      let x = client.x - r.left - box.offsetWidth / 2;
      let y = client.y - r.top - box.offsetHeight - 12;
      if (y < 4) y = client.y - r.top + 14;
      x = clamp(x, 4, r.width - box.offsetWidth - 4);
      y = clamp(y, 4, r.height - box.offsetHeight - 4);
      box.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    };
    place();
    if (!reducedMotion()) {
      cardRef.current?.animate(
        [{ opacity: 0, scale: "0.92" }, { opacity: 1, scale: "1" }],
        { duration: 260, easing: "cubic-bezier(0.34, 1.4, 0.64, 1)" },
      );
    }
    return () => cancelAnimationFrame(raf);
  }, [cardId]);

  useImperativeHandle(
    ref,
    () => ({
      gather: async () => {
        await handleRef.current?.gather();
      },
      lightUp: async (light, from) => {
        await handleRef.current?.lightUp(light, from);
      },
      toClient: (target) => handleRef.current?.toClient(target) ?? null,
      pointerOnLight: () => hitRef.current,
    }),
    [],
  );

  const body = card ? renderCard(card) : null;
  const rainbow = card !== null && (card.kind === "named" ? card.light.status === "rainbow" : status === "rainbow");

  return (
    <div ref={wrapRef} role="img" aria-label={ariaLabel} onPointerDown={onPointerDown} className="relative touch-manipulation" style={{ width: size, height: size }}>
      <div ref={hostRef} className="absolute inset-0" />
      {body && (
        <div
          ref={cardRef}
          className="pointer-events-none absolute top-0 left-0 z-[2] flex items-center gap-2 rounded-[13px] px-3 py-2 backdrop-blur-[6px]"
          style={{
            background: rainbow ? OPAL_CARD_BG : CARD_BASE,
            border: `1px solid ${rainbow ? OPAL_BORDER : "rgba(183,179,218,0.34)"}`,
            boxShadow: "0 8px 22px rgba(10,9,28,0.45)",
          }}
        >
          {body}
        </div>
      )}
    </div>
  );
}
