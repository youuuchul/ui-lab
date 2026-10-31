// Canvas 2D 글로브 렌더러. three 외 의존성 없음. **폴백 구현** — WebGL 미지원·저사양·three 로딩 중에 쓴다.
// PetGlobe 원본은 three 렌더러가 기본이고 이 파일이 폴백이다. ui-lab에는 이 canvas2d만 옮겼다.
// 규약: ./globeTypes.ts (v2)
// 아트 디렉션: concept_art/DESIGN.md "글로브와 별빛"
// 원본: prototypes/globe-lab/renderers/canvas2d.js — 그림과 동작은 바꾸지 않는다.
//
// 층 구조 (뒤 → 앞), 괄호는 기울기 시차 계수
//   under(그림자) → skyBase(하늘+띠 기저+얼룩+미세 별, 고정) → bandGlow(0.006)
//   → community(0.016) → vignette(고정) → 배경 별(0.010) → named(0.026)
//   → 내 별빛 뒤 국소 그늘 + 내 별빛(0.038) → glass 림(고정) + 하이라이트(-0.012)

import {
  PALETTE,
  GEOMETRY,
  DEFAULT_RAINBOW_RATIO,
  TILT_MAX_DEG,
  applyEdgeFeather,
  communityStarFromIndex,
  edgeFade,
  densityScale,
} from "./shared";
import type {
  ClientPoint,
  CommunityCountOptions,
  GlobeChrome,
  GlobeHandle,
  GlobeOptions,
  GlobeStatus,
  Light,
  NamedLight,
} from "./globeTypes";

type RGB = number[];

interface Particle {
  id: string;
  src: Light;
  ux: number;
  uy: number;
  brightness: number;
  phase: number;
  opalIndex: number;
  sx: number;
  sy: number;
  vx: number;
  vy: number;
  mode: "settled" | "spring" | "fly";
  delay: number;
  age: number;
  fade: number;
  flight: { x0: number; y0: number; cxp: number; cyp: number; dur: number } | null;
  trail: number[];
  burst: number;
  boost: number;
  colorMix: number;
  colorFrom: number;
  colorTo: number;
  colorT: number;
  colorDelay: number;
}

type Hovered =
  | { kind: "mine"; light: Light; particle: Particle }
  | { kind: "named"; light: NamedLight };

interface CommunitySample {
  x: number;
  y: number;
  a: number;
  rate: number;
  phase: number;
  col: RGB;
}

interface BgStar extends CommunitySample {
  size: number;
}

interface Meteor {
  t: number;
  dur: number;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

interface Anim {
  done: boolean;
  force: () => void;
}

/** toClient 가 받는 대상. */
type ClientTarget = Light | NamedLight | string | { x: number; y: number; z?: number };

interface State {
  status: GlobeStatus;
  /** "none" 이면 유리·그림자를 그리지 않는다 (그림 속 유리 위에 얹는 경우). */
  chrome: GlobeChrome;
  backdropStars: boolean;
  reducedMotion: boolean;
  onTap: ((light: Light) => void) | null;
  onHover: GlobeOptions["onHover"] | null;
  info: { mine: boolean; others: boolean };
  particles: Particle[];
  named: NamedLight[];
  hovered: Hovered | null;
  dpr: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
  R: number;
  skyBase: HTMLCanvasElement | null;
  bandGlow: HTMLCanvasElement | null;
  vignette: HTMLCanvasElement | null;
  glass: HTMLCanvasElement | null;
  glassHl: HTMLCanvasElement | null;
  under: HTMLCanvasElement | null;
  community: HTMLCanvasElement | null;
  communityCtx: CanvasRenderingContext2D | null;
  communityData: ImageData | null;
  accA: Float32Array;
  accR: Float32Array;
  accG: Float32Array;
  accB: Float32Array;
  communityDrawn: number;
  communityTarget: number;
  communityRainbowRatio: number;
  communityRamp: number;
  communityDirty: boolean;
  communitySample: CommunitySample[];
  lastBakeMs: number;
  bakeTotalMs: number;
  bgStars: BgStar[];
  meteor: Meteor | null;
  meteorTimer: number;
  tiltTX: number;
  tiltTY: number;
  tiltX: number;
  tiltY: number;
  time: number;
  running: boolean;
  visible: boolean;
  inView: boolean;
  raf: number;
  last: number;
  drawCalls: number;
  pending: { left: number; resolve: () => void }[];
  anim: Anim | null;
  destroyed: boolean;
}

const SQRT1_2 = Math.SQRT1_2;
const MAX_DPR = 2;
const SPRITE_PX = 64;
const RAY_PX = 96;
const COMMUNITY_TWINKLE_SAMPLE = 90;
const COMMUNITY_CHUNK = 6000; // 한 프레임에 새로 굽는 공동 별빛 상한

// 층별 시차 계수 (R 대비). 뒤쪽일수록 작게 — 앞뒤 분리를 눈으로 읽게 한다.
const PARALLAX = {
  band: 0.006,
  community: 0.016,
  bg: 0.01,
  named: 0.026,
  mine: 0.038,
  glass: -0.012,
};

function hexToRgb(hex: string): RGB {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/**
 * 팔레트의 오팔색은 거의 흰색이라 가산 합성에서 전부 흰빛으로 뭉친다.
 * 자기 밝기를 유지한 채 채도만 올려 후광에 색이 남게 한다. (네온이 아니라 파스텔 범위)
 */
function saturate(rgb: RGB, k: number): RGB {
  const m = (rgb[0] + rgb[1] + rgb[2]) / 3;
  return rgb.map((v) => Math.max(0, Math.min(255, m + (v - m) * k)));
}

const RGB = {
  starWarm: hexToRgb(PALETTE.starWarm),
  starBright: hexToRgb(PALETTE.starBright),
  gold: hexToRgb(PALETTE.gold),
  milky: hexToRgb(PALETTE.milkyWay),
  opal: PALETTE.opal.map((h) => saturate(hexToRgb(h), 2.4)),
};

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;
const mixRgb = (a: RGB, b: RGB, t: number): RGB => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);
const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashIndex(i: number): number {
  let z = (i + 0x9e3779b9) | 0;
  z = Math.imul(z ^ (z >>> 16), 0x21f0aaad);
  z = Math.imul(z ^ (z >>> 15), 0x735a2d97);
  return (z ^ (z >>> 15)) >>> 0;
}

/** 별빛 색을 양자화해 스프라이트를 재사용한다. 실시간 blur/그라데이션 생성 없음. */
class SpriteCache {
  glow: Map<number, HTMLCanvasElement>;
  ray: Map<number, HTMLCanvasElement>;
  shade: HTMLCanvasElement | null;

  constructor() {
    this.glow = new Map();
    this.ray = new Map();
    this.shade = null;
  }

  static key(r: number, g: number, b: number): number {
    return ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
  }

  getGlow(r: number, g: number, b: number): HTMLCanvasElement {
    const k = SpriteCache.key(r, g, b);
    let c = this.glow.get(k);
    if (c) return c;
    c = document.createElement("canvas");
    c.width = c.height = SPRITE_PX;
    const g2 = c.getContext("2d") as CanvasRenderingContext2D;
    const h = SPRITE_PX / 2;
    const gr = g2.createRadialGradient(h, h, 0, h, h, h);
    const rgb = `${r | 0},${g | 0},${b | 0}`;
    gr.addColorStop(0, `rgba(${rgb},1)`);
    gr.addColorStop(0.07, `rgba(${rgb},0.7)`);
    gr.addColorStop(0.18, `rgba(${rgb},0.2)`);
    gr.addColorStop(0.42, `rgba(${rgb},0.045)`);
    gr.addColorStop(1, `rgba(${rgb},0)`);
    g2.fillStyle = gr;
    g2.fillRect(0, 0, SPRITE_PX, SPRITE_PX);
    this.glow.set(k, c);
    return c;
  }

  getRay(r: number, g: number, b: number): HTMLCanvasElement {
    const k = SpriteCache.key(r, g, b);
    let c = this.ray.get(k);
    if (c) return c;
    c = document.createElement("canvas");
    c.width = c.height = RAY_PX;
    const g2 = c.getContext("2d") as CanvasRenderingContext2D;
    const h = RAY_PX / 2;
    const rgb = `${r | 0},${g | 0},${b | 0}`;
    for (let axis = 0; axis < 2; axis++) {
      const gr = g2.createLinearGradient(axis ? 0 : h, axis ? h : 0, axis ? RAY_PX : h, axis ? h : RAY_PX);
      gr.addColorStop(0, `rgba(${rgb},0)`);
      gr.addColorStop(0.35, `rgba(${rgb},0.28)`);
      gr.addColorStop(0.5, `rgba(${rgb},0.85)`);
      gr.addColorStop(0.65, `rgba(${rgb},0.28)`);
      gr.addColorStop(1, `rgba(${rgb},0)`);
      g2.fillStyle = gr;
      if (axis) g2.fillRect(0, h - 1, RAY_PX, 2);
      else g2.fillRect(h - 1, 0, 2, RAY_PX);
    }
    this.ray.set(k, c);
    return c;
  }

  /** 내 별빛 뒤에 깔아 은하수를 국소적으로 눌러 주는 그늘. */
  getShade(): HTMLCanvasElement {
    if (this.shade) return this.shade;
    const c = document.createElement("canvas");
    c.width = c.height = SPRITE_PX;
    const g2 = c.getContext("2d") as CanvasRenderingContext2D;
    const h = SPRITE_PX / 2;
    const gr = g2.createRadialGradient(h, h, 0, h, h, h);
    const d = hexToRgb(PALETTE.skyDeep);
    const rgb = `${d[0]},${d[1]},${d[2]}`;
    gr.addColorStop(0, `rgba(${rgb},0.85)`);
    gr.addColorStop(0.45, `rgba(${rgb},0.32)`);
    gr.addColorStop(1, `rgba(${rgb},0)`);
    g2.fillStyle = gr;
    g2.fillRect(0, 0, SPRITE_PX, SPRITE_PX);
    this.shade = c;
    return c;
  }

  clear(): void {
    this.glow.clear();
    this.ray.clear();
    this.shade = null;
  }
}

/** 은하수 축 위 위치(-1..1). */
function alongAxis(ux: number, uy: number): number {
  return clamp(((ux - uy) * SQRT1_2) / 0.86, -1, 1);
}

function makeParticle(light: Light, settled: boolean): Particle {
  return {
    id: light.id,
    src: light,
    ux: light.x,
    uy: light.y,
    brightness: light.brightness,
    phase: light.phase,
    opalIndex: light.opalIndex,
    sx: 0,
    sy: 0,
    vx: 0,
    vy: 0,
    mode: settled ? "settled" : "spring",
    delay: 0,
    age: 0,
    fade: settled ? 1 : 0,
    flight: null,
    trail: [],
    burst: 0,
    boost: 0,
    colorMix: 0,
    colorFrom: 0,
    colorTo: 0,
    colorT: 1,
    colorDelay: 0,
  };
}

export default function createGlobe(container: HTMLElement, options: GlobeOptions = {}): GlobeHandle {
  const canvas = document.createElement("canvas");
  canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:manipulation;";
  if (options.chrome === "none") applyEdgeFeather(canvas);
  container.appendChild(canvas);
  const ctx = canvas.getContext("2d", { alpha: true }) as CanvasRenderingContext2D;

  const sprites = new SpriteCache();
  // off() 의 층별 계수는 ±4도 기준으로 맞춰져 있다 — 각도 비율만큼 키운다
  const tiltScale = (options.tiltMaxDeg ?? TILT_MAX_DEG) / 4;

  const state: State = {
    status: options.status === "rainbow" ? "rainbow" : "active",
    chrome: options.chrome === "none" ? "none" : "full",
    backdropStars: options.backdropStars ?? true,
    reducedMotion: !!options.reducedMotion,
    onTap: options.onTap || null,
    onHover: options.onHover || null,
    info: { mine: true, others: true },
    particles: [],
    named: [],
    hovered: null,
    dpr: 1,
    w: 0,
    h: 0,
    cx: 0,
    cy: 0,
    R: 0,
    skyBase: null,
    bandGlow: null,
    vignette: null,
    glass: null,
    glassHl: null,
    under: null,
    community: null,
    communityCtx: null,
    communityData: null,
    accA: new Float32Array(0),
    accR: new Float32Array(0),
    accG: new Float32Array(0),
    accB: new Float32Array(0),
    communityDrawn: 0,
    communityTarget: Math.max(0, Math.round(options.communityCount || 0)),
    communityRainbowRatio: options.communityRainbowRatio ?? DEFAULT_RAINBOW_RATIO,
    communityRamp: 0, // 초당 증가량. 0이면 즉시.
    communityDirty: false,
    communitySample: [],
    lastBakeMs: 0,
    bakeTotalMs: 0,
    bgStars: [],
    meteor: null,
    meteorTimer: 18 + Math.random() * 30,
    tiltTX: 0,
    tiltTY: 0,
    tiltX: 0,
    tiltY: 0,
    time: 0,
    running: false,
    visible: !document.hidden,
    inView: true,
    raf: 0,
    last: 0,
    drawCalls: 0,
    pending: [],
    anim: null,
    destroyed: false,
  };

  // ---------- 베이크: 하늘 ----------

  function bakeSkyBase() {
    const { w, h, cx, cy, R, dpr } = state;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d") as CanvasRenderingContext2D;
    g.save();
    g.beginPath();
    g.arc(cx, cy, R, 0, Math.PI * 2);
    g.clip();

    const sky = g.createRadialGradient(cx, cy - R * 0.12, R * 0.04, cx, cy, R * 1.02);
    sky.addColorStop(0, PALETTE.skySoft);
    sky.addColorStop(0.45, PALETTE.skyMid);
    sky.addColorStop(1, PALETTE.skyDeep);
    g.fillStyle = sky;
    g.fillRect(0, 0, w, h);

    const milky = `${RGB.milky[0]},${RGB.milky[1]},${RGB.milky[2]}`;
    g.globalCompositeOperation = "lighter";

    // 띠의 기저 광 (공동 별빛 0 에서도 은하수가 흐르는 정도)
    g.save();
    g.translate(cx, cy);
    g.rotate(-Math.PI / 4);
    g.scale(1, 0.3);
    const band = g.createRadialGradient(0, 0, 0, 0, 0, R * 1.05);
    band.addColorStop(0, `rgba(${milky},0.13)`);
    band.addColorStop(0.55, `rgba(${milky},0.065)`);
    band.addColorStop(1, `rgba(${milky},0)`);
    g.fillStyle = band;
    g.fillRect(-R * 1.2, -R * 1.2, R * 2.4, R * 2.4);
    g.restore();

    // 라벤더 얼룩
    const rnd = mulberry32(1337);
    for (let i = 0; i < 16; i++) {
      const t = (rnd() * 2 - 1) * R;
      const u = (rnd() + rnd() - 1) * R * 0.22;
      const x = cx + SQRT1_2 * t + SQRT1_2 * u;
      const y = cy - SQRT1_2 * t + SQRT1_2 * u;
      const rad = R * (0.1 + rnd() * 0.2);
      const blob = g.createRadialGradient(x, y, 0, x, y, rad);
      const a = 0.032 + rnd() * 0.034;
      blob.addColorStop(0, `rgba(${milky},${a.toFixed(3)})`);
      blob.addColorStop(1, `rgba(${milky},0)`);
      g.fillStyle = blob;
      g.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }

    // 공동 별빛이 0이어도 밤하늘로 읽히도록 하는 기본 미세 별
    const count = state.backdropStars ? Math.round(900 * densityScale(w / dpr)) : 0;
    for (let i = 0; i < count; i++) {
      let x;
      let y;
      if (rnd() < 0.7) {
        const t = (rnd() * 2 - 1) * R * 1.15;
        const u = (rnd() + rnd() + rnd() - 1.5) * R * 0.28;
        x = cx + SQRT1_2 * t + SQRT1_2 * u;
        y = cy - SQRT1_2 * t + SQRT1_2 * u;
      } else {
        const ang = rnd() * Math.PI * 2;
        const rr = Math.sqrt(rnd()) * R;
        x = cx + Math.cos(ang) * rr;
        y = cy + Math.sin(ang) * rr;
      }
      const ef = edgeFade(Math.hypot(x - cx, y - cy) / R);
      if (ef <= 0) continue;
      const roll = rnd();
      const a = (0.06 + roll * roll * 0.4) * ef;
      const col = rnd() < 0.18 ? RGB.gold : RGB.starWarm;
      g.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${a.toFixed(3)})`;
      const s = roll > 0.93 ? 1.6 * dpr : dpr;
      g.fillRect(x, y, s, s);
    }

    // 중심 약간 아래의 금색 광원 (면적 작게, 하나로 읽히게)
    const glowR = R * 0.34;
    const gy = cy + R * 0.2;
    const glow = g.createRadialGradient(cx, gy, 0, cx, gy, glowR);
    glow.addColorStop(0, `rgba(${RGB.gold[0]},${RGB.gold[1]},${RGB.gold[2]},0.20)`);
    glow.addColorStop(0.5, `rgba(${RGB.gold[0]},${RGB.gold[1]},${RGB.gold[2]},0.06)`);
    glow.addColorStop(1, `rgba(${RGB.gold[0]},${RGB.gold[1]},${RGB.gold[2]},0)`);
    g.fillStyle = glow;
    g.fillRect(cx - glowR, gy - glowR, glowR * 2, glowR * 2);

    g.restore();
    state.skyBase = c;
  }

  /** 공동 별빛 개수에 비례해 띠 전체를 두껍게 만드는 광. 개수만 바뀌면 다시 굽지 않는다. */
  function bakeBandGlow() {
    const { w, h, cx, cy, R } = state;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d") as CanvasRenderingContext2D;
    g.save();
    g.beginPath();
    g.arc(cx, cy, R * 0.99, 0, Math.PI * 2);
    g.clip();
    g.translate(cx, cy);
    g.rotate(-Math.PI / 4);
    g.scale(1, 0.34);
    const milky = `${RGB.milky[0]},${RGB.milky[1]},${RGB.milky[2]}`;
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, R * 1.02);
    gr.addColorStop(0, `rgba(${milky},1)`);
    gr.addColorStop(0.45, `rgba(${milky},0.55)`);
    gr.addColorStop(0.86, `rgba(${milky},0.08)`);
    gr.addColorStop(1, `rgba(${milky},0)`);
    g.fillStyle = gr;
    g.fillRect(-R * 1.3, -R * 1.3, R * 2.6, R * 2.6);
    g.restore();
    state.bandGlow = c;
  }

  function bakeVignette() {
    const { w, h, cx, cy, R } = state;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d") as CanvasRenderingContext2D;
    g.save();
    g.beginPath();
    g.arc(cx, cy, R, 0, Math.PI * 2);
    g.clip();
    const vig = g.createRadialGradient(cx, cy, R * 0.48, cx, cy, R);
    vig.addColorStop(0, "rgba(8,7,20,0)");
    vig.addColorStop(0.72, "rgba(8,7,20,0.22)");
    vig.addColorStop(0.93, "rgba(8,7,20,0.48)");
    vig.addColorStop(1, "rgba(8,7,20,0.60)");
    g.fillStyle = vig;
    g.fillRect(0, 0, w, h);
    g.restore();
    state.vignette = c;
  }

  // ---------- 베이크: 공동 별빛(누적) ----------

  function resetCommunity() {
    const { w, h } = state;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    state.community = c;
    state.communityCtx = c.getContext("2d", { willReadFrequently: false }) as CanvasRenderingContext2D;
    state.communityData = state.communityCtx.createImageData(w, h);
    state.accA = new Float32Array(w * h);
    state.accR = new Float32Array(w * h);
    state.accG = new Float32Array(w * h);
    state.accB = new Float32Array(w * h);
    state.communityDrawn = 0;
    state.communityDirty = true;
  }

  /**
   * 인덱스 [from, to) 의 공동 별빛을 광량 누적 버퍼에 더하고, 건드린 픽셀만 톤 매핑해
   * ImageData 로 옮긴다. 개수가 늘수록 알파가 1-exp(-acc) 로 포화하며 띠가 짙어진다.
   * 흰색으로 클리핑되지 않게 상한을 둔다. 광량은 글로브 면적으로 정규화한다.
   */
  function bakeCommunityRange(from: number, to: number): void {
    const { w, cx, cy, R, dpr } = state;
    const data = (state.communityData as ImageData).data;
    const accA = state.accA;
    const accR = state.accR;
    const accG = state.accG;
    const accB = state.accB;
    const K = 1.15;
    const CAP = 0.52;
    const dens = densityScale(w / dpr);
    const ratio = state.communityRainbowRatio;
    for (let i = from; i < to; i++) {
      const s = communityStarFromIndex(i, ratio);
      const px = cx + s.x * R;
      const py = cy + s.y * R;
      const ef = edgeFade(Math.hypot(px - cx, py - cy) / R);
      if (ef <= 0) continue;
      const amp = s.a * ef * dens;
      const col = s.rainbow ? RGB.opal[s.opalIndex] : RGB.starWarm;
      const size = s.big ? Math.max(2, Math.round(1.6 * dpr)) : Math.max(1, Math.round(dpr));
      const x0 = px | 0;
      const y0 = py | 0;
      for (let dy = 0; dy < size; dy++) {
        const yy = y0 + dy;
        if (yy < 0 || yy >= w) continue;
        for (let dx = 0; dx < size; dx++) {
          const xx = x0 + dx;
          if (xx < 0 || xx >= w) continue;
          const p = yy * w + xx;
          const a = accA[p] + amp;
          accA[p] = a;
          accR[p] += col[0] * amp;
          accG[p] += col[1] * amp;
          accB[p] += col[2] * amp;
          const idx = p * 4;
          data[idx] = accR[p] / a;
          data[idx + 1] = accG[p] / a;
          data[idx + 2] = accB[p] / a;
          data[idx + 3] = Math.min(CAP, 1 - Math.exp(-a * K)) * 255;
        }
      }
    }
    state.communityDirty = true;
  }

  function flushCommunity() {
    if (!state.communityDirty || !state.communityCtx) return;
    state.communityCtx.putImageData(state.communityData as ImageData, 0, 0);
    state.communityDirty = false;
  }

  function buildCommunitySample() {
    const n = state.communityTarget;
    const sample = [];
    if (n > 0) {
      const k = Math.min(COMMUNITY_TWINKLE_SAMPLE, n);
      for (let j = 0; j < k; j++) {
        const i = Math.floor(((j + 0.5) / k) * n);
        const s = communityStarFromIndex(i, state.communityRainbowRatio);
        const hv = hashIndex(i ^ 0x2545f491);
        sample.push({
          x: s.x,
          y: s.y,
          a: Math.min(0.45, s.a + 0.22) * edgeFade(Math.hypot(s.x, s.y)),
          rate: 0.06 + ((hv % 1000) / 1000) * 0.16,
          phase: ((hv >>> 10) % 6283) / 1000,
          col: s.rainbow ? RGB.opal[s.opalIndex] : RGB.starWarm,
        });
      }
    }
    state.communitySample = sample;
  }

  /**
   * 목표치까지 굽는다. ramp 중이면 프레임당 예산만큼만(프레임 시간을 묶어 두기 위해),
   * 아니면 한 번에 전부.
   */
  function advanceCommunity(dt: number): void {
    if (state.communityDrawn >= state.communityTarget) return;
    const t0 = performance.now();
    let budget = state.communityTarget - state.communityDrawn;
    if (state.communityRamp > 0) {
      budget = Math.min(budget, Math.max(1, Math.round(state.communityRamp * Math.max(dt, 1 / 60))), COMMUNITY_CHUNK);
    }
    bakeCommunityRange(state.communityDrawn, state.communityDrawn + budget);
    state.communityDrawn += budget;
    if (state.communityDrawn >= state.communityTarget) state.communityRamp = 0;
    const ms = performance.now() - t0;
    state.lastBakeMs = ms;
    state.bakeTotalMs += ms;
  }

  // ---------- 베이크: 유리 / 그림자 ----------

  function bakeGlass() {
    // 그림에 유리가 이미 그려져 있으면 테두리·하이라이트를 겹쳐 그리지 않는다.
    if (state.chrome === "none") {
      state.glass = null;
      state.glassHl = null;
      return;
    }
    const { w, h, cx, cy, R, dpr } = state;
    const rainbow = state.status === "rainbow";
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d") as CanvasRenderingContext2D;

    if (rainbow) {
      // 어두운 페이지에서 구의 실루엣이 읽히도록 바깥 글로우를 먼저 깐다
      const og = g.createRadialGradient(cx, cy, R * 0.96, cx, cy, R * 1.07);
      og.addColorStop(0, "rgba(183,179,218,0.26)");
      og.addColorStop(1, "rgba(183,179,218,0)");
      g.fillStyle = og;
      g.fillRect(0, 0, w, h);
      // 구 안쪽은 도려낸다. 여기서 fillStyle 이 위의 그라데이션이면 안쪽 알파가 0.26 뿐이라
      // 구 전체에 연보라 막이 남는다 — 불투명 검정으로 완전히 지운다.
      g.save();
      g.globalCompositeOperation = "destination-out";
      g.fillStyle = "#000";
      g.beginPath();
      g.arc(cx, cy, R, 0, Math.PI * 2);
      g.fill();
      g.restore();
    }

    g.save();
    g.beginPath();
    g.arc(cx, cy, R, 0, Math.PI * 2);
    g.clip();
    g.globalCompositeOperation = "lighter";

    // 바닥 반사
    const by = cy + R * 0.74;
    const bs = g.createRadialGradient(cx, by, 0, cx, by, R * 0.6);
    bs.addColorStop(0, "rgba(242,200,121,0.085)");
    bs.addColorStop(0.5, "rgba(230,224,244,0.035)");
    bs.addColorStop(1, "rgba(230,224,244,0)");
    g.fillStyle = bs;
    g.fillRect(cx - R, by - R * 0.7, R * 2, R * 1.4);

    // 안쪽 림(유리 두께) — 가늘게. 좌상단이 밝고 우하단에 금색 바운스가 한 번 든다.
    const rim = g.createLinearGradient(cx - R * 0.75, cy - R * 0.75, cx + R * 0.75, cy + R * 0.75);
    rim.addColorStop(0, `rgba(255,252,242,${rainbow ? 0.72 : 0.58})`);
    rim.addColorStop(0.28, `rgba(183,179,218,${rainbow ? 0.2 : 0.12})`);
    rim.addColorStop(0.58, `rgba(183,179,218,${rainbow ? 0.14 : 0.07})`);
    rim.addColorStop(0.82, `rgba(242,200,121,${rainbow ? 0.44 : 0.32})`);
    rim.addColorStop(1, `rgba(244,239,230,${rainbow ? 0.3 : 0.18})`);
    g.strokeStyle = rim;
    g.lineWidth = 1.4 * dpr;
    g.beginPath();
    g.arc(cx, cy, R - 0.9 * dpr, 0, Math.PI * 2);
    g.stroke();
    g.restore();

    // 바깥 테두리 한 줄
    g.lineWidth = 1 * dpr;
    g.strokeStyle = rainbow ? "rgba(244,239,230,0.34)" : "rgba(43,42,76,0.16)";
    g.beginPath();
    g.arc(cx, cy, R - 0.5 * dpr, 0, Math.PI * 2);
    g.stroke();

    state.glass = c;
    bakeGlassHighlight();
  }

  /** 기울일 때 림과 반대로 조금 움직이는 층 — 좌상단 하이라이트. 별빛으로 오해되지 않게 점 없이 초승달 로브만. */
  function bakeGlassHighlight() {
    const { w, h, cx, cy, R } = state;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d") as CanvasRenderingContext2D;
    g.save();
    g.beginPath();
    g.arc(cx, cy, R, 0, Math.PI * 2);
    g.clip();
    g.globalCompositeOperation = "lighter";

    // 얇은 초승달 로브
    g.save();
    g.translate(cx - R * 0.44, cy - R * 0.5);
    g.rotate(-0.68);
    g.scale(1, 0.22);
    const hl = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.36);
    hl.addColorStop(0, "rgba(255,252,242,0.20)");
    hl.addColorStop(0.42, "rgba(255,252,242,0.05)");
    hl.addColorStop(1, "rgba(255,252,242,0)");
    g.fillStyle = hl;
    g.fillRect(-R * 0.5, -R * 0.5, R, R);
    g.restore();
    g.restore();
    state.glassHl = c;
  }

  function bakeUnder() {
    // 그림에 나무 받침과 그 그늘이 이미 있으면 바닥 그림자를 그리지 않는다.
    if (state.chrome === "none") {
      state.under = null;
      return;
    }
    const { w, h, cx, cy, R } = state;
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d") as CanvasRenderingContext2D;
    if (state.status === "active") {
      g.save();
      g.translate(cx, cy + R * 0.99);
      g.scale(1, 0.16);
      const sh = g.createRadialGradient(0, 0, 0, 0, 0, R * 0.74);
      sh.addColorStop(0, "rgba(43,42,76,0.26)");
      sh.addColorStop(0.55, "rgba(43,42,76,0.10)");
      sh.addColorStop(1, "rgba(43,42,76,0)");
      g.fillStyle = sh;
      g.fillRect(-R, -R, R * 2, R * 2);
      g.restore();
    }
    state.under = c;
  }

  function buildBgStars() {
    const arr = [];
    const rnd = mulberry32(99);
    for (let i = 0; i < (state.backdropStars ? 70 : 0); i++) {
      const t = (rnd() * 2 - 1) * 1.05;
      const u = (rnd() + rnd() - 1) * 0.34;
      let x = t * SQRT1_2 - u * SQRT1_2;
      let y = -(t * SQRT1_2 + u * SQRT1_2);
      const r = Math.hypot(x, y);
      if (r > 0.95) {
        x *= 0.95 / r;
        y *= 0.95 / r;
      }
      arr.push({
        x,
        y,
        a: (0.18 + rnd() * 0.32) * edgeFade(Math.hypot(x, y)),
        rate: 0.06 + rnd() * 0.16,
        phase: rnd() * Math.PI * 2,
        size: rnd() > 0.88 ? 1.7 : 1,
        col: RGB.starWarm,
      });
    }
    state.bgStars = arr;
  }

  // ---------- 레이아웃 ----------

  function resize() {
    const rect = container.getBoundingClientRect();
    // 화면 전환·숨김으로 크기가 0 이 되는 순간이 있다. 1px 로 다시 구우면 유리 테두리 반지름이
    // 음수가 되어 arc 가 매 프레임 예외를 던진다 — 크기가 없을 때는 이전 크기를 그대로 둔다.
    if (rect.width < 1 || rect.height < 1) return;
    const size = Math.min(rect.width, rect.height);
    const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
    const w = Math.round(size * dpr);
    if (!w || (w === state.w && dpr === state.dpr)) return;
    state.dpr = dpr;
    state.w = w;
    state.h = w;
    canvas.width = w;
    canvas.height = w;
    state.cx = w / 2;
    state.cy = w * GEOMETRY.centerY;
    state.R = w * GEOMETRY.radius;
    bakeSkyBase();
    bakeBandGlow();
    bakeVignette();
    bakeGlass();
    bakeUnder();
    buildBgStars();
    resetCommunity();
    state.communityRamp = 0;
    state.bakeTotalMs = 0;
    advanceCommunity(0);
    flushCommunity();
    buildCommunitySample();
    for (const p of state.particles) {
      if (p.mode === "settled") {
        p.sx = state.cx + p.ux * state.R;
        p.sy = state.cy + p.uy * state.R;
      }
    }
    draw();
  }

  // ---------- 별빛 색 ----------

  function lightColor(p: Particle, t: number): RGB {
    const white = mixRgb(RGB.starWarm, RGB.starBright, p.brightness);
    if (p.colorMix <= 0.001) return white;
    const f = (t * 0.045 + p.phase / (Math.PI * 2) + p.opalIndex / RGB.opal.length) % 1;
    const scaled = f * RGB.opal.length;
    const idx = Math.floor(scaled) % RGB.opal.length;
    const opal = mixRgb(RGB.opal[idx], RGB.opal[(idx + 1) % RGB.opal.length], scaled - Math.floor(scaled));
    return mixRgb(white, opal, p.colorMix);
  }

  // ---------- 물리 ----------

  function step(dt: number): void {
    const { cx, cy, R } = state;
    const t = state.time;

    // 기울기 스무딩 (렌더러가 자체적으로 한다)
    const k = Math.min(1, dt * 3.2);
    state.tiltX += (state.tiltTX - state.tiltX) * k;
    state.tiltY += (state.tiltTY - state.tiltY) * k;

    for (const p of state.particles) {
      const tx = cx + p.ux * R;
      const ty = cy + p.uy * R;

      if (p.mode === "fly") {
        p.age += dt;
        const f = p.flight as NonNullable<Particle["flight"]>;
        const kf = clamp(p.age / f.dur, 0, 1);
        const e = easeOutCubic(kf);
        const mt = 1 - e;
        p.sx = mt * mt * f.x0 + 2 * mt * e * f.cxp + e * e * tx;
        p.sy = mt * mt * f.y0 + 2 * mt * e * f.cyp + e * e * ty;
        p.fade = clamp(p.age / 0.18, 0, 1);
        p.trail.push(p.sx, p.sy);
        if (p.trail.length > 36) p.trail.splice(0, p.trail.length - 36);
        if (kf >= 1) {
          p.mode = "settled";
          p.burst = 1;
          p.vx = 0;
          p.vy = 0;
          for (const q of state.particles) {
            if (q === p) continue;
            const d = Math.hypot(q.sx - tx, q.sy - ty);
            if (d < R * 0.4) q.boost = Math.max(q.boost, 1 - d / (R * 0.4));
          }
        }
      } else if (p.mode === "spring") {
        p.age += dt;
        if (p.age < p.delay) continue;
        p.fade = clamp((p.age - p.delay) / 0.4, 0, 1);
        p.vx += (tx - p.sx) * 34 * dt - p.vx * 6.4 * dt;
        p.vy += (ty - p.sy) * 34 * dt - p.vy * 6.4 * dt;
        p.sx += p.vx * dt;
        p.sy += p.vy * dt;
        if (p.age - p.delay > 2.0 && Math.hypot(p.vx, p.vy) < R * 0.05) {
          p.mode = "settled";
          p.vx = 0;
          p.vy = 0;
        }
      } else {
        p.fade = Math.min(1, p.fade + dt * 3);
        const amp = R * 0.01;
        p.sx = tx + Math.sin(t * 0.17 + p.phase) * amp + Math.sin(t * 0.09 + p.phase * 1.7) * amp * 0.6;
        p.sy = ty + Math.cos(t * 0.13 + p.phase * 1.3) * amp + Math.sin(t * 0.07 + p.phase) * amp * 0.5;
      }

      if (p.trail.length && p.mode !== "fly") {
        p.trail.splice(0, Math.max(2, Math.ceil(p.trail.length * dt * 5)));
      }
      if (p.burst > 0) p.burst = Math.max(0, p.burst - dt / 0.8);
      if (p.boost > 0) p.boost = Math.max(0, p.boost - dt / 1.1);

      if (p.colorT < 1) {
        p.colorDelay -= dt;
        if (p.colorDelay <= 0) {
          p.colorT = clamp(p.colorT + dt / 0.75, 0, 1);
          const e = p.colorT * p.colorT * (3 - 2 * p.colorT);
          p.colorMix = lerp(p.colorFrom, p.colorTo, e);
        }
      }
    }

    if (state.meteor) {
      state.meteor.t += dt;
      if (state.meteor.t >= state.meteor.dur) state.meteor = null;
    } else {
      state.meteorTimer -= dt;
      if (state.meteorTimer <= 0) {
        state.meteorTimer = 26 + Math.random() * 34;
        const off = (Math.random() * 2 - 1) * 0.4;
        state.meteor = {
          t: 0,
          dur: 1.5,
          x0: -0.95 * SQRT1_2 - off * SQRT1_2,
          y0: 0.95 * SQRT1_2 - off * SQRT1_2,
          x1: 0.95 * SQRT1_2 - off * SQRT1_2,
          y1: -0.95 * SQRT1_2 - off * SQRT1_2,
        };
      }
    }
  }

  // ---------- 그리기 ----------

  /** 층 시차 오프셋(px). z 가 앞일수록 크게 움직인다. */
  function off(k: number): [number, number] {
    const R = state.R;
    return [state.tiltY * R * k, state.tiltX * R * k];
  }

  function draw() {
    const { w, h, cx, cy, R } = state;
    if (!w) return;
    let calls = 0;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;

    if (state.under) {
      ctx.drawImage(state.under, 0, 0);
      calls++;
    }
    if (state.skyBase) ctx.drawImage(state.skyBase, 0, 0);
    calls++;

    if (state.communityDrawn > 0) {
      flushCommunity();
      ctx.globalCompositeOperation = "lighter";
      // 개수에 비례해 띠 자체가 두꺼워지는 광
      ctx.globalAlpha = 0.14 * Math.sqrt(Math.min(1, state.communityDrawn / 100000));
      if (ctx.globalAlpha > 0.004 && state.bandGlow) {
        const [bx, by] = off(PARALLAX.band);
        ctx.drawImage(state.bandGlow, bx, by);
        calls++;
      }
      ctx.globalAlpha = 0.92;
      const [qx, qy] = off(PARALLAX.community);
      if (state.community) ctx.drawImage(state.community, qx, qy);
      ctx.globalAlpha = 1;
      calls++;
      ctx.globalCompositeOperation = "source-over";
    }

    if (state.vignette) ctx.drawImage(state.vignette, 0, 0);
    calls++;

    const t = state.time;

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R - 0.5, 0, Math.PI * 2);
    ctx.clip();
    ctx.globalCompositeOperation = "lighter";

    // 배경 별 + 공동 별빛 표본: 많고 희미하며 아주 느린 반짝임
    const [gx, gy] = off(PARALLAX.bg);
    for (let i = 0; i < state.bgStars.length; i++) {
      const s = state.bgStars[i];
      const tw = 0.62 + 0.38 * Math.sin(t * s.rate * 2 * Math.PI + s.phase);
      const a = s.a * tw;
      if (a <= 0.012) continue;
      ctx.fillStyle = `rgba(${s.col[0]},${s.col[1]},${s.col[2]},${a.toFixed(3)})`;
      const sz = s.size * state.dpr;
      ctx.fillRect(cx + s.x * R + gx, cy + s.y * R + gy, sz, sz);
      calls++;
    }
    const [cqx, cqy] = off(PARALLAX.community);
    for (let i = 0; i < state.communitySample.length; i++) {
      const s = state.communitySample[i];
      const tw = 0.5 + 0.5 * Math.sin(t * s.rate * 2 * Math.PI + s.phase);
      const a = s.a * tw;
      if (a <= 0.012) continue;
      ctx.fillStyle = `rgba(${s.col[0] | 0},${s.col[1] | 0},${s.col[2] | 0},${a.toFixed(3)})`;
      const sz = state.dpr;
      ctx.fillRect(cx + s.x * R + cqx, cy + s.y * R + cqy, sz, sz);
      calls++;
    }

    if (state.meteor) {
      const m = state.meteor;
      const kk = m.t / m.dur;
      const e = easeOutCubic(clamp((kk - 0.05) / 0.9, 0, 1));
      const fade = Math.sin(clamp(kk, 0, 1) * Math.PI);
      const hx = cx + lerp(m.x0, m.x1, e) * R;
      const hy = cy + lerp(m.y0, m.y1, e) * R;
      const tailE = clamp(e - 0.09, 0, 1);
      const px = cx + lerp(m.x0, m.x1, tailE) * R;
      const py = cy + lerp(m.y0, m.y1, tailE) * R;
      const lg = ctx.createLinearGradient(px, py, hx, hy);
      lg.addColorStop(0, "rgba(244,239,230,0)");
      lg.addColorStop(1, `rgba(255,249,236,${(0.5 * fade).toFixed(3)})`);
      ctx.strokeStyle = lg;
      ctx.lineWidth = 1.3 * state.dpr;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(hx, hy);
      ctx.stroke();
      calls++;
    }

    calls += drawNamed(t);
    calls += drawShades();
    calls += drawLights(false);
    ctx.restore();

    // 비행 중인 별빛은 구 밖에서 날아오므로 클립 밖에서 그린다
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    calls += drawLights(true);
    ctx.restore();

    ctx.globalCompositeOperation = "source-over";
    ctx.globalAlpha = 1;
    if (state.glass) {
      ctx.drawImage(state.glass, 0, 0);
      calls++;
    }
    if (state.glassHl) {
      const [hx2, hy2] = off(PARALLAX.glass);
      ctx.drawImage(state.glassHl, hx2, hy2);
      calls++;
    }
    state.drawCalls = calls;
  }

  /** 이름 있는 별빛 — 익명 밀도층보다 조금 밝다. 호버 중인 것은 한 단계 더. */
  function drawNamed(t: number): number {
    if (!state.named.length) return 0;
    const { cx, cy, R } = state;
    const [ox, oy] = off(PARALLAX.named);
    const base = R * 0.032;
    let calls = 0;
    for (const nl of state.named) {
      const sx = cx + nl.x * R + ox;
      const sy = cy + nl.y * R + oy;
      const tw = state.reducedMotion ? 1 : 0.78 + 0.22 * Math.sin(t * 0.6 + nl.phase);
      const hot = state.hovered && state.hovered.light === nl ? 1 : 0;
      // 다른 사람의 별빛 — 내 별빛보다 작고 흐린 라벤더 점, 후광 없음
      const col = nl.status === "rainbow" ? RGB.opal[nl.opalIndex] : RGB.milky;
      const a = clamp((0.2 + nl.brightness * 0.26) * tw + hot * 0.3, 0, 1);
      const glow = sprites.getGlow(col[0], col[1], col[2]);
      const size = base * (0.55 + nl.brightness * 0.3) * (1 + hot * 0.45);
      ctx.globalAlpha = a;
      ctx.drawImage(glow, sx - size * 0.55, sy - size * 0.55, size * 1.1, size * 1.1);
      calls++;
      if (hot) {
        ctx.globalAlpha = 0.5;
        const rs = size * 4;
        ctx.drawImage(sprites.getRay(col[0], col[1], col[2]), sx - rs, sy - rs, rs * 2, rs * 2);
        calls++;
      }
    }
    ctx.globalAlpha = 1;
    return calls;
  }

  /** 내 별빛 뒤의 국소 그늘 — 10만 개 띠 위에서도 내 별빛이 묻히지 않게 한다. */
  function drawShades() {
    if (!state.particles.length || state.communityDrawn <= 0) return 0;
    const R = state.R;
    const shade = sprites.getShade();
    const strength = Math.min(1, state.communityDrawn / 30000);
    if (strength <= 0.02) return 0;
    ctx.globalCompositeOperation = "source-over";
    let calls = 0;
    for (const p of state.particles) {
      if (p.mode === "fly" || p.fade <= 0.05) continue;
      const s = R * 0.085 * (0.7 + p.brightness * 0.5);
      ctx.globalAlpha = 0.5 * strength * p.fade;
      ctx.drawImage(shade, p.sx - s, p.sy - s, s * 2, s * 2);
      calls++;
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "lighter";
    return calls;
  }

  function drawLights(flyingOnly: boolean): number {
    const { R, dpr } = state;
    const t = state.time;
    const base = R * 0.062;
    // 별빛이 많아질수록 후광이 서로 더해져 흰 덩어리가 되므로 개수에 따라 후광을 눌러 준다
    const crowd = 0.52 + 0.48 * (1 - Math.min(1, state.particles.length / 220));
    const [ox, oy] = off(PARALLAX.mine);
    let calls = 0;

    for (const p of state.particles) {
      const flying = p.mode === "fly";
      if (flying !== flyingOnly) continue;
      if (p.fade <= 0.01) continue;
      const px = p.sx + (flying ? 0 : ox);
      const py = p.sy + (flying ? 0 : oy);

      const col = lightColor(p, t);
      const tw = state.reducedMotion ? 1 : 0.84 + 0.16 * Math.sin(t * (0.5 + p.phase * 0.08) + p.phase);
      // 날아오는 동안에는 눈에 띄게 밝다
      const bright = clamp(p.brightness * tw + p.boost * 0.35 + (flying ? 0.5 : 0), 0, 1.6);
      const alpha = clamp((0.36 + bright * 0.63) * p.fade, 0, 1);
      const size = base * (0.58 + bright * 0.78);

      if (flying && p.trail.length >= 4) {
        const n = p.trail.length / 2;
        ctx.lineCap = "round";
        for (let i = 1; i < n; i += 2) {
          const f = i / n;
          ctx.strokeStyle = `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${(f * f * 0.72).toFixed(3)})`;
          ctx.lineWidth = Math.max(1, f * 3.6 * dpr);
          ctx.beginPath();
          ctx.moveTo(p.trail[(i - 1) * 2], p.trail[(i - 1) * 2 + 1]);
          ctx.lineTo(p.trail[i * 2], p.trail[i * 2 + 1]);
          ctx.stroke();
          calls++;
        }
      }

      const glow = sprites.getGlow(col[0], col[1], col[2]);

      // 후광
      ctx.globalAlpha = alpha * 0.62 * crowd;
      const hs = size * 2.6;
      ctx.drawImage(glow, px - hs, py - hs, hs * 2, hs * 2);
      calls++;

      // 밝은 코어 — 점으로 읽히는 부분
      ctx.globalAlpha = alpha;
      const cs = size * 0.6;
      ctx.drawImage(glow, px - cs, py - cs, cs * 2, cs * 2);
      calls++;

      // 십자 광선 — 가장 밝은 별빛에만 가늘게. 내 별빛의 표식이지 장식이 아니다.
      const spike = clamp((p.brightness - 0.82) / 0.18, 0, 1);
      if (spike > 0.02 || p.burst > 0) {
        const rs = size * (4.2 + p.burst * 3.4);
        ctx.globalAlpha = clamp(spike * 0.36 + p.burst * 0.7, 0, 0.72) * p.fade * crowd;
        ctx.drawImage(sprites.getRay(col[0], col[1], col[2]), px - rs, py - rs, rs * 2, rs * 2);
        calls++;
      }

      if (p.burst > 0) {
        const b = p.burst;
        const pop = Math.sin(clamp(1 - b, 0, 1) * Math.PI) * 0.6 + b * 0.4;
        const gs = size * (3.0 + (1 - b) * 7.0);
        ctx.globalAlpha = clamp(pop * b, 0, 1);
        ctx.drawImage(sprites.getGlow(RGB.gold[0], RGB.gold[1], RGB.gold[2]), px - gs, py - gs, gs * 2, gs * 2);
        calls++;
      }
      ctx.globalAlpha = 1;
    }
    return calls;
  }

  // ---------- 루프 ----------

  function frame(now: number): void {
    if (state.destroyed) return;
    state.raf = requestAnimationFrame(frame);
    const dt = clamp((now - state.last) / 1000, 0, 1 / 20);
    state.last = now;
    state.time += dt;
    advanceCommunity(dt);
    step(dt);
    draw();
    resolvePending(dt);
  }

  function resolvePending(dt: number): void {
    if (!state.pending.length) return;
    const keep = [];
    for (const item of state.pending) {
      item.left -= dt;
      if (item.left <= 0) item.resolve();
      else keep.push(item);
    }
    state.pending = keep;
  }

  function wait(seconds: number, onDone?: () => void): Promise<void> {
    return new Promise((resolve) => {
      let done = false;
      const once = () => {
        if (done) return;
        done = true;
        if (onDone) onDone();
        resolve();
      };
      state.pending.push({ left: seconds, resolve: once });
      setTimeout(once, seconds * 1000 + 1200);
    });
  }

  /**
   * 연출 동시성: 진행 중인 연출이 있으면 즉시 최종 상태로 끝내고 새 연출을 시작한다.
   * @param {() => void} finalize 진행 중 연출을 최종 상태로 만드는 함수
   */
  function beginAnim(finalize: () => void): Anim {
    if (state.anim) {
      const prev = state.anim;
      state.anim = null;
      prev.force();
    }
    const a: Anim = {
      done: false,
      force: () => {
        if (a.done) return;
        a.done = true;
        finalize();
        draw();
      },
    };
    state.anim = a;
    return a;
  }

  function endAnim(a: Anim): void {
    if (state.anim === a) state.anim = null;
    a.done = true;
  }

  function setRunning(on: boolean): void {
    const want = on && !state.reducedMotion;
    if (want === state.running) return;
    state.running = want;
    if (want) {
      state.last = performance.now();
      state.raf = requestAnimationFrame(frame);
    } else {
      cancelAnimationFrame(state.raf);
      state.raf = 0;
    }
  }

  function updateRunning() {
    setRunning(state.visible && state.inView && !state.destroyed);
  }

  // ---------- 공개 API ----------

  function setLights(lights: Light[]): void {
    const prev = new Map(state.particles.map((p) => [p.id, p]));
    const next = [];
    for (const l of lights) {
      const old = prev.get(l.id);
      if (old) {
        old.ux = l.x;
        old.uy = l.y;
        old.brightness = l.brightness;
        old.src = l;
        next.push(old);
      } else {
        const p = makeParticle(l, true);
        p.sx = state.cx + l.x * state.R;
        p.sy = state.cy + l.y * state.R;
        p.fade = 1;
        p.colorMix = state.status === "rainbow" ? 1 : 0;
        p.colorFrom = p.colorMix;
        p.colorTo = p.colorMix;
        next.push(p);
      }
    }
    state.particles = next;
    const hoveredId = state.hovered ? state.hovered.light.id : null;
    if (state.hovered && state.hovered.kind === "mine" && !next.some((p) => p.id === hoveredId)) {
      setHover(null);
    }
    if (!state.running) draw();
  }

  function setNamedLights(list: NamedLight[]): void {
    state.named = (list || []).map((n) => ({ ...n }));
    if (state.hovered && state.hovered.kind === "named") setHover(null);
    if (!state.running) draw();
  }

  /**
   * 공동 별빛(모두의 추억) 개수. 늘어난 만큼만 오프스크린에 추가로 굽는다.
   * animate 면 증가분이 서서히 나타난다.
   */
  function setCommunityCount(n: number, opts: CommunityCountOptions = {}): void {
    const next = Math.max(0, Math.round(n || 0));
    const prevTarget = state.communityTarget;
    state.communityTarget = next;
    state.bakeTotalMs = 0;
    // rainbow 비율은 누적 버퍼에 색으로 구워져 있다 — 바뀌면 처음부터 다시 굽는다.
    // 실제로는 개수가 0일 때(첫 API 응답) 세우므로 비용이 없다.
    if (opts.rainbowRatio !== undefined && opts.rainbowRatio !== state.communityRainbowRatio) {
      state.communityRainbowRatio = opts.rainbowRatio;
      resetCommunity();
    }
    if (next < state.communityDrawn) {
      resetCommunity();
    }
    if (opts.animate && !state.reducedMotion && next > prevTarget) {
      const added = next - state.communityDrawn;
      state.communityRamp = Math.max(400, added / 1.4);
    } else {
      state.communityRamp = 0;
      advanceCommunity(0);
      flushCommunity();
    }
    buildCommunitySample();
    updateRunning();
    if (!state.running) draw();
  }

  function setTilt(t: { x: number; y: number }): void {
    if (state.reducedMotion) {
      state.tiltTX = state.tiltTY = state.tiltX = state.tiltY = 0;
      return;
    }
    state.tiltTX = clamp(t && typeof t.x === "number" ? t.x : 0, -1, 1) * tiltScale;
    state.tiltTY = clamp(t && typeof t.y === "number" ? t.y : 0, -1, 1) * tiltScale;
  }

  function setInfoVisibility(v: { mine?: boolean; others?: boolean }): void {
    state.info = {
      mine: v && typeof v.mine === "boolean" ? v.mine : state.info.mine,
      others: v && typeof v.others === "boolean" ? v.others : state.info.others,
    };
    if (state.hovered) {
      const kind = state.hovered.kind;
      if ((kind === "mine" && !state.info.mine) || (kind === "named" && !state.info.others)) setHover(null);
    }
  }

  /**
   * 별빛(또는 id)의 현재 화면(뷰포트) 좌표.
   * 아직 등록되지 않은 별빛이라도 x, y 가 있으면 앉을 자리를 돌려준다(저장 연출의 도착점).
   */
  function toClient(target: ClientTarget): ClientPoint | null {
    const id = typeof target === "string" ? target : "id" in target ? target.id : null;
    const rect = canvas.getBoundingClientRect();
    const scale = rect.width / Math.max(1, state.w);
    if (id) {
      const p = state.particles.find((q) => q.id === id);
      if (p) {
        const [ox, oy] = off(PARALLAX.mine);
        return { x: rect.left + (p.sx + ox) * scale, y: rect.top + (p.sy + oy) * scale };
      }
      const nl = state.named.find((q) => q.id === id);
      if (nl) {
        const [ox, oy] = off(PARALLAX.named);
        return {
          x: rect.left + (state.cx + nl.x * state.R + ox) * scale,
          y: rect.top + (state.cy + nl.y * state.R + oy) * scale,
        };
      }
    }
    if (typeof target !== "string" && typeof target.x === "number" && typeof target.y === "number") {
      const [ox, oy] = off(PARALLAX.mine);
      return {
        x: rect.left + (state.cx + target.x * state.R + ox) * scale,
        y: rect.top + (state.cy + target.y * state.R + oy) * scale,
      };
    }
    return null;
  }

  function gather(): Promise<void> {
    const { cx, cy, R } = state;
    const settleAll = () => {
      for (const p of state.particles) {
        p.mode = "settled";
        p.sx = cx + p.ux * R;
        p.sy = cy + p.uy * R;
        p.vx = p.vy = 0;
        p.fade = 1;
        p.trail.length = 0;
      }
    };
    const a = beginAnim(settleAll);
    if (state.reducedMotion) {
      settleAll();
      endAnim(a);
      draw();
      return Promise.resolve();
    }
    let maxDelay = 0;
    state.particles.forEach((p, i) => {
      const ang = Math.atan2(p.uy, p.ux) + (Math.random() - 0.5) * 1.2;
      const rr = R * (1.02 + Math.random() * 0.5);
      p.sx = cx + Math.cos(ang) * rr;
      p.sy = cy + Math.sin(ang) * rr;
      p.vx = 0;
      p.vy = 0;
      p.mode = "spring";
      p.age = 0;
      p.fade = 0;
      p.trail.length = 0;
      p.delay = (i % 17) * 0.035 + Math.random() * 0.25;
      maxDelay = Math.max(maxDelay, p.delay);
    });
    updateRunning();
    return wait(maxDelay + 2.1, () => endAnim(a));
  }

  function lightUp(light: Light, fromClient?: ClientPoint | null): Promise<void> {
    const existing = state.particles.find((p) => p.id === light.id);
    const p = existing || makeParticle(light, true);
    p.ux = light.x;
    p.uy = light.y;
    p.brightness = light.brightness;
    p.src = light;
    p.colorMix = state.status === "rainbow" ? 1 : 0;
    p.colorFrom = p.colorMix;
    p.colorTo = p.colorMix;
    p.colorT = 1;
    if (!existing) state.particles.push(p);

    const tx = state.cx + p.ux * state.R;
    const ty = state.cy + p.uy * state.R;
    const settle = () => {
      p.mode = "settled";
      p.sx = tx;
      p.sy = ty;
      p.fade = 1;
      p.burst = 0;
      p.trail.length = 0;
    };
    const a = beginAnim(settle);

    if (state.reducedMotion) {
      settle();
      endAnim(a);
      draw();
      return Promise.resolve();
    }

    const rect = canvas.getBoundingClientRect();
    const scale = state.w / Math.max(1, rect.width);
    let x0;
    let y0;
    if (fromClient) {
      x0 = (fromClient.x - rect.left) * scale;
      y0 = (fromClient.y - rect.top) * scale;
    } else {
      x0 = state.cx;
      y0 = state.cy + state.R * 1.5;
    }
    const dx = tx - x0;
    const dy = ty - y0;
    const len = Math.max(1, Math.hypot(dx, dy));
    const bend = len * 0.3 * (x0 < tx ? -1 : 1);
    p.mode = "fly";
    p.age = 0;
    p.fade = 0;
    p.trail.length = 0;
    p.sx = x0;
    p.sy = y0;
    p.flight = {
      x0,
      y0,
      cxp: (x0 + tx) / 2 + (-dy / len) * bend,
      cyp: (y0 + ty) / 2 + (dx / len) * bend,
      dur: 1.1,
    };
    updateRunning();
    return wait(1.1 + 0.9, () => endAnim(a));
  }

  function setStatus(status: GlobeStatus, opts: { animate?: boolean } = {}): Promise<void> {
    const next = status === "rainbow" ? "rainbow" : "active";
    const changed = next !== state.status;
    state.status = next;
    bakeGlass();
    bakeUnder();
    const target = next === "rainbow" ? 1 : 0;
    const finish = () => {
      for (const p of state.particles) {
        p.colorMix = target;
        p.colorFrom = target;
        p.colorTo = target;
        p.colorT = 1;
        p.colorDelay = 0;
      }
    };

    if (!changed || !opts.animate || state.reducedMotion) {
      if (state.anim) {
        const prev = state.anim;
        state.anim = null;
        prev.force();
      }
      finish();
      draw();
      return Promise.resolve();
    }

    const a = beginAnim(finish);
    const waveDur = 2.2;
    for (const p of state.particles) {
      const n = (alongAxis(p.ux, p.uy) + 1) / 2;
      p.colorFrom = p.colorMix;
      p.colorTo = target;
      p.colorT = 0;
      p.colorDelay = (target === 1 ? n : 1 - n) * waveDur;
    }
    updateRunning();
    return wait(waveDur + 0.9, () => endAnim(a));
  }

  function getStats(): Record<string, number | boolean> {
    return {
      drawCalls: state.drawCalls,
      particles: state.particles.length,
      named: state.named.length,
      community: state.communityDrawn,
      communityTarget: state.communityTarget,
      bakeMs: Math.round(state.bakeTotalMs * 10) / 10,
      sprites: sprites.glow.size,
    };
  }

  // ---------- 히트 테스트 / 이벤트 ----------

  /** 겹치면 mine 우선, 그 다음 가까운 것 우선. 정보 보기가 꺼진 층은 대상에서 뺀다. */
  function hitTest(clientX: number, clientY: number): Hovered | null {
    const rect = canvas.getBoundingClientRect();
    const scale = state.w / Math.max(1, rect.width);
    const x = (clientX - rect.left) * scale;
    const y = (clientY - rect.top) * scale;
    const reach = Math.max(18 * state.dpr, state.R * 0.075);

    if (state.info.mine) {
      let best = null;
      let bestD = reach;
      const [ox, oy] = off(PARALLAX.mine);
      for (const p of state.particles) {
        const d = Math.hypot(p.sx + ox - x, p.sy + oy - y);
        if (d < bestD) {
          bestD = d;
          best = p;
        }
      }
      if (best) return { kind: "mine", light: best.src, particle: best };
    }
    if (state.info.others) {
      let best = null;
      let bestD = reach;
      const [ox, oy] = off(PARALLAX.named);
      for (const nl of state.named) {
        const d = Math.hypot(state.cx + nl.x * state.R + ox - x, state.cy + nl.y * state.R + oy - y);
        if (d < bestD) {
          bestD = d;
          best = nl;
        }
      }
      if (best) return { kind: "named", light: best };
    }
    return null;
  }

  function setHover(next: Hovered | null): void {
    const prevId = state.hovered ? state.hovered.light.id : null;
    const nextId = next ? next.light.id : null;
    state.hovered = next;
    if (prevId === nextId) return;
    if (!state.running) draw();
    if (state.onHover) {
      if (!next) state.onHover(null);
      else if (next.kind === "mine")
        state.onHover({ kind: "mine", light: next.light, client: toClient(next.light.id) });
      else state.onHover({ kind: "named", light: next.light, client: toClient(next.light.id) });
    }
  }

  function onMove(ev: PointerEvent): void {
    if (ev.pointerType === "touch") return;
    setHover(hitTest(ev.clientX, ev.clientY));
  }

  function onLeave(ev: PointerEvent): void {
    // 터치는 pointerup 직후 pointerleave 가 따라온다 — 탭으로 연 카드가 바로 닫히지 않게 무시한다.
    // (실험실 하네스는 데스크톱 호버만 써서 드러나지 않았던 차이)
    if (ev.pointerType === "touch") return;
    setHover(null);
  }

  function onClick(ev: PointerEvent): void {
    const hit = hitTest(ev.clientX, ev.clientY);
    setHover(hit);
    if (hit && hit.kind === "mine" && state.onTap) state.onTap(hit.light);
  }

  canvas.addEventListener("pointermove", onMove, { passive: true });
  canvas.addEventListener("pointerleave", onLeave, { passive: true });
  canvas.addEventListener("pointerup", onClick, { passive: true });

  const ro = new ResizeObserver(() => resize());
  ro.observe(container);

  const io = new IntersectionObserver(
    (entries) => {
      state.inView = entries.some((e) => e.isIntersecting);
      updateRunning();
    },
    { threshold: 0 }
  );
  io.observe(container);

  const onVis = () => {
    state.visible = !document.hidden;
    updateRunning();
  };
  document.addEventListener("visibilitychange", onVis);

  // ---------- 초기화 ----------

  resize();
  setLights(options.lights || []);
  setNamedLights(options.namedLights || []);
  if (state.status === "rainbow") {
    for (const p of state.particles) {
      p.colorMix = 1;
      p.colorFrom = 1;
      p.colorTo = 1;
    }
  }
  draw();
  updateRunning();

  return {
    gather,
    lightUp,
    setStatus,
    clearHover: () => setHover(null),
    setLights,
    setNamedLights,
    setCommunityCount,
    setTilt,
    setInfoVisibility,
    toClient,
    getStats,
    destroy() {
      state.destroyed = true;
      setRunning(false);
      state.pending.forEach((p) => p.resolve());
      state.pending = [];
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerup", onClick);
      sprites.clear();
      canvas.remove();
    },
  };
}
