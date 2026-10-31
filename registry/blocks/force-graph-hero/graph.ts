import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, forceZ } from "d3-force-3d";

export type GraphNodeInput = { id: string; label: string; color: string; /** 라벨을 늘 크게 보여줄 노드 (허브 등) */ big?: boolean };
export type GraphInput = {
  nodes: GraphNodeInput[];
  links: { source: string; target: string }[];
  /** 진입 연출에서 노드가 나타나는 순서. 빠진 노드는 뒤에 붙는다 */
  order?: string[];
};

type Node = GraphNodeInput & {
  degree: number;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
};
type Link = { source: string | Node; target: string | Node };
type Tw = { from: number; to: number; t0: number; dur: number };
type Proj = { x: number; y: number; s: number; z: number; r: number; depthA: number };

const FORCES = { center: 0.08, repel: 220, linkForce: 0.5, linkDistance: 80, fade: 0.6 };
const TIMING = { appear: 350, hover: 200, timelapse: 2400, fit: 500 };
/** settle 진입: 노드 하나가 떠오르는 간격(ms) */
const SETTLE_GAP = 20;
/** 자동 회전: 프레임당 라디안(60fps 기준), 상호작용이 끝난 뒤 다시 돌기까지 ms */
const SPIN = { speed: 0.0017, resume: 1200 };
const PAR = { x: 0.35, y: 0.25 };
const DIM = 0.2;
const LINK_BASE = 0.22;
const FOCAL = 700;
const LIGHT = { x: -0.45, y: -0.75 };

/** 빛을 받는 쪽 밝기 변화량(lit)과 등진 쪽(dark) */
const SHADE = { lit: 0.13, dark: -0.1 };
const hslCache = new Map<string, number[]>();
/** #rrggbb → [색상(도), 채도, 밝기] */
const hslOf = (hex: string) => {
  const hit = hslCache.get(hex);
  if (hit) return hit;
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  const d = mx - mn;
  const h = !d ? 0 : mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  const out = [h * 60, d ? d / (1 - Math.abs(2 * l - 1)) : 0, l];
  hslCache.set(hex, out);
  return out;
};
/** 색상·채도는 그대로, 밝기만 lit(0~1) 위치만큼 */
const shade = (hex: string, lit: number) => {
  const c = hslOf(hex);
  const l = clamp(c[2] + SHADE.dark + lit * (SHADE.lit - SHADE.dark), 0.06, 0.94);
  return `hsl(${c[0].toFixed(0)} ${(c[1] * 100).toFixed(0)}% ${(l * 100).toFixed(1)}%)`;
};

const ease = (p: number) => 1 - (1 - p) ** 3;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const val = (tw: Tw | undefined, t: number, def: number) => {
  if (!tw) return def;
  if (tw.dur <= 0) return tw.to;
  return tw.from + (tw.to - tw.from) * ease(clamp((t - tw.t0) / tw.dur, 0, 1));
};
const live = (tw: Tw | undefined, t: number) => !!tw && t < tw.t0 + tw.dur;
const idOf = (v: string | Node) => (typeof v === "string" ? v : v.id);

/** 3D 좌표를 원근 투영해 Canvas 2D로 그리는 힘 기반 그래프. 생성은 브라우저(effect)에서만. */
export class ForceGraph {
  readonly canvas = document.createElement("canvas");
  /** settle = 자리를 먼저 잡고 제자리에서 짧은 시차로 떠오름, timelapse = 노드가 차례로 생기며 퍼짐 */
  entry: "settle" | "timelapse" = "settle";
  reducedMotion = false;
  autoRotate = true;
  mouseParallax = true;
  ink = "#f2f2f2";
  halo = "#1b1b1b";

  private nodes: Node[];
  private links: Link[];
  private order: string[];
  private byId: Map<string, Node>;
  private neighbors = new Map<string, Set<string>>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private sim: any;
  private ctx: CanvasRenderingContext2D;
  private visible = new Set<string>();
  private appear = new Map<string, Tw>();
  private nodeA = new Map<string, Tw>();
  private proj = new Map<string, Proj>();
  private hoverId: string | null = null;
  private yaw = 0.6;
  private pitch = -0.3;
  private baseYaw = 0.6;
  private basePitch = -0.3;
  private par = { x: 0, y: 0 };
  private spin = 0;
  private quietAt = 0;
  private k = 1;
  private kTw: Tw | null = null;
  private pivot = { x: 0, y: 0, z: 0 };
  private mouse: { x: number; y: number } | null = null;
  private drag: { x: number; y: number; yaw: number; pitch: number; id: number } | null = null;
  private timers: number[] = [];
  private raf = 0;
  private lastT = 0;
  private w = 0;
  private h = 0;
  private dpr = 1;
  private onScreen = true;
  private ro: ResizeObserver;
  private io: IntersectionObserver;

  constructor(
    private host: HTMLElement,
    data: GraphInput,
  ) {
    this.nodes = data.nodes.map((n) => ({ ...n, degree: 0 }));
    this.links = data.links.map((l) => ({ ...l }));
    this.byId = new Map(this.nodes.map((n) => [n.id, n]));
    for (const l of data.links) {
      const a = this.byId.get(l.source);
      const b = this.byId.get(l.target);
      if (!a || !b) continue;
      a.degree++;
      b.degree++;
      (this.neighbors.get(a.id) ?? this.neighbors.set(a.id, new Set()).get(a.id)!).add(b.id);
      (this.neighbors.get(b.id) ?? this.neighbors.set(b.id, new Set()).get(b.id)!).add(a.id);
    }
    this.order = [...new Set([...(data.order ?? []), ...this.nodes.map((n) => n.id)])];
    this.ctx = this.canvas.getContext("2d")!;
    this.canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:pan-y";
    host.appendChild(this.canvas);
    this.sim = forceSimulation([], 3)
      .force("charge", forceManyBody().strength(-FORCES.repel))
      .force("link", forceLink([]).id((n: Node) => n.id).distance(FORCES.linkDistance).strength(FORCES.linkForce))
      .force("x", forceX(0).strength(FORCES.center))
      .force("y", forceY(0).strength(FORCES.center))
      .force("z", forceZ(0).strength(FORCES.center))
      .force("collide", forceCollide((n: Node) => this.radius(n) + 12))
      .alphaDecay(0.045)
      .stop();
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.io = new IntersectionObserver(([e]) => {
      this.onScreen = e.isIntersecting;
      if (this.onScreen) this.kick();
    });
    this.io.observe(host);
    this.resize();
    this.canvas.addEventListener("pointerdown", this.onDown);
    this.canvas.addEventListener("pointermove", this.onMove);
    this.canvas.addEventListener("pointerup", this.onUp);
    this.canvas.addEventListener("pointercancel", this.onUp);
    this.canvas.addEventListener("pointerleave", this.onLeave);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.timers.forEach(clearTimeout);
    this.ro.disconnect();
    this.io.disconnect();
    this.sim.stop();
    this.canvas.remove();
  }

  /** 진입 연출을 처음부터 다시. 모션 줄이기면 최종 배치를 바로 그린다. */
  replay() {
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.hoverId = null;
    this.visible.clear();
    this.appear.clear();
    this.nodeA.clear();
    this.nodes.forEach((n) => (n.x = n.y = n.z = n.vx = n.vy = n.vz = undefined));
    if (this.reducedMotion || this.entry === "settle") {
      this.nodes.forEach((n) => {
        n.x = (Math.random() - 0.5) * 200;
        n.y = (Math.random() - 0.5) * 200;
        n.z = (Math.random() - 0.5) * 200;
        this.visible.add(n.id);
      });
      this.sync();
      this.sim.alpha(1);
      for (let i = 0; i < 300; i++) this.sim.tick();
      this.fit(false);
      if (!this.reducedMotion) {
        this.visible.clear();
        this.sim.alpha(0.01);
        this.order.forEach((id, i) => this.later(i * SETTLE_GAP, () => this.reveal([id], false)));
      }
      this.kick();
      return;
    }
    const steps = 12;
    const per = Math.ceil(this.order.length / steps);
    const gap = TIMING.timelapse / steps;
    for (let s = 0; s < steps; s++) this.later(s * gap, () => this.reveal(this.order.slice(s * per, (s + 1) * per), true));
    this.later(TIMING.timelapse + 400, () => this.fit(true));
    this.kick();
  }

  private later(ms: number, fn: () => void) {
    const id = window.setTimeout(() => {
      this.timers = this.timers.filter((x) => x !== id);
      fn();
    }, ms);
    this.timers.push(id);
  }

  private radius(n: Node) {
    return (2 + Math.sqrt(n.degree)) * 2.2;
  }

  private sync() {
    this.sim.nodes(this.nodes.filter((n) => this.visible.has(n.id)));
    this.sim.force("link").links(this.links.filter((l) => this.visible.has(idOf(l.source)) && this.visible.has(idOf(l.target))));
  }

  /** spread: 이웃 근처에서 새로 생겨 퍼짐(timelapse). false면 이미 잡힌 자리에서 떠오름(settle). */
  private reveal(ids: string[], spread: boolean) {
    const t = performance.now();
    ids.forEach((id) => {
      const n = this.byId.get(id);
      if (!n) return;
      if (spread) {
        const nb = [...(this.neighbors.get(id) ?? [])].map((x) => this.byId.get(x)).find((m) => m && this.visible.has(m.id));
        const jit = () => (Math.random() - 0.5) * 30;
        n.x = (nb?.x ?? 0) + jit();
        n.y = (nb?.y ?? 0) + jit();
        n.z = (nb?.z ?? 0) + jit();
      }
      this.visible.add(id);
      this.appear.set(id, { from: 0, to: 1, t0: t, dur: TIMING.appear });
    });
    this.sync();
    this.sim.alpha(Math.max(this.sim.alpha(), spread ? 0.7 : 0.01));
    this.kick();
  }

  private project(n: Node, k = this.k): Proj {
    const x = (n.x ?? 0) - this.pivot.x;
    const y = (n.y ?? 0) - this.pivot.y;
    const z0 = (n.z ?? 0) - this.pivot.z;
    const cy = Math.cos(this.yaw);
    const sy = Math.sin(this.yaw);
    const cp = Math.cos(this.pitch);
    const sp = Math.sin(this.pitch);
    const x1 = x * cy + z0 * sy;
    const z1 = -x * sy + z0 * cy;
    const y1 = y * cp - z1 * sp;
    const z = y * sp + z1 * cp;
    const s = FOCAL / (FOCAL + z);
    return { x: this.w / 2 + x1 * s * k, y: this.h / 2 + y1 * s * k, s, z, r: this.radius(n) * s * k, depthA: 1 };
  }

  /** 보이는 노드(라벨 자리 포함)가 무대 안에 들어오게 배율을 맞춘다. */
  private fit(animated: boolean) {
    const vis = this.nodes.filter((n) => this.visible.has(n.id));
    if (!vis.length || !this.w) return;
    this.pivot = {
      x: vis.reduce((a, n) => a + (n.x ?? 0), 0) / vis.length,
      y: vis.reduce((a, n) => a + (n.y ?? 0), 0) / vis.length,
      z: vis.reduce((a, n) => a + (n.z ?? 0), 0) / vis.length,
    };
    let ex = 1;
    let ey = 1;
    vis.forEach((n) => {
      const p = this.project(n, 1);
      ex = Math.max(ex, Math.abs(p.x - this.w / 2) + p.r + 30);
      ey = Math.max(ey, Math.abs(p.y - this.h / 2) + p.r + 24);
    });
    const k = clamp(Math.min((this.w / 2 - 16) / ex, (this.h / 2 - 16) / ey), 0.3, 1.4);
    if (animated && !this.reducedMotion) this.kTw = { from: this.k, to: k, t0: performance.now(), dur: TIMING.fit };
    else this.k = k;
    this.kick();
  }

  private resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = this.host.clientWidth;
    this.h = this.host.clientHeight;
    this.canvas.width = Math.round(this.w * this.dpr);
    this.canvas.height = Math.round(this.h * this.dpr);
    if (this.visible.size) this.fit(false);
    this.kick();
  }

  private kick() {
    if (!this.raf && this.onScreen) this.raf = requestAnimationFrame(this.loop);
  }

  private hitAt(x: number, y: number) {
    let best: string | null = null;
    let bz = Infinity;
    this.proj.forEach((p, id) => {
      if (Math.hypot(p.x - x, p.y - y) <= p.r + 4 && p.z < bz) {
        bz = p.z;
        best = id;
      }
    });
    return best as string | null;
  }

  private setHover(id: string | null) {
    if (id === this.hoverId) return;
    this.hoverId = id;
    this.canvas.style.cursor = id ? "pointer" : "";
    const t = performance.now();
    const keep = id ? new Set([id, ...(this.neighbors.get(id) ?? [])]) : null;
    this.nodes.forEach((n) => {
      const to = !keep || keep.has(n.id) ? 1 : DIM;
      const cur = this.nodeA.get(n.id);
      if (cur?.to === to) return;
      this.nodeA.set(n.id, { from: val(cur, t, 1), to, t0: t, dur: this.reducedMotion ? 0 : TIMING.hover });
    });
    this.kick();
  }

  private onDown = (e: PointerEvent) => {
    if (e.button !== 0) return;
    this.drag = { x: e.clientX, y: e.clientY, yaw: this.baseYaw, pitch: this.basePitch, id: e.pointerId };
    this.quietAt = performance.now();
  };

  private onMove = (e: PointerEvent) => {
    const r = this.canvas.getBoundingClientRect();
    const d = this.drag;
    if (d && d.id === e.pointerId) {
      const dx = e.clientX - d.x;
      const dy = e.clientY - d.y;
      if (Math.abs(dx) > 4 && Math.abs(dx) > Math.abs(dy)) this.canvas.setPointerCapture(e.pointerId);
      this.baseYaw = d.yaw + dx * 0.006;
      this.basePitch = clamp(d.pitch - dy * 0.004, -1.2, 1.2);
      this.quietAt = performance.now();
      this.kick();
      return;
    }
    if (e.pointerType !== "mouse") return;
    this.mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
    if (this.mouseParallax) {
      this.par.x = (this.mouse.x / this.w - 0.5) * 2 * PAR.x;
      this.par.y = (this.mouse.y / this.h - 0.5) * 2 * PAR.y;
    }
    this.kick();
  };

  private onUp = (e: PointerEvent) => {
    if (this.drag?.id !== e.pointerId) return;
    this.drag = null;
    this.quietAt = performance.now();
  };

  private onLeave = () => {
    this.mouse = null;
    this.par = { x: 0, y: 0 };
    this.setHover(null);
  };

  private loop = (t: number) => {
    this.raf = 0;
    const dt = this.lastT ? t - this.lastT : 16.7;
    this.lastT = t;
    const simOn = this.sim.alpha() >= this.sim.alphaMin();
    if (simOn) this.sim.tick(clamp(Math.round(dt / 16.7), 1, 4));
    let turning = false;
    if (!this.reducedMotion) {
      const f = clamp(dt / 16.7, 0.5, 4);
      const want = this.autoRotate && !this.hoverId && !this.drag && t - this.quietAt > SPIN.resume;
      const goal = want ? SPIN.speed : 0;
      // 천천히 출발(약 1.5초), 빨리 멈춤(약 0.4초): 호버한 노드가 포인터에서 달아나지 않게
      this.spin += (goal - this.spin) * Math.min(1, (goal > this.spin ? 0.03 : 0.15) * f);
      if (!goal && this.spin < 0.00005) this.spin = 0;
      if (this.spin) this.baseYaw += this.spin * f;
      if (this.spin || goal) turning = true;
    }
    const ty = this.baseYaw + this.par.x;
    const tp = this.basePitch + this.par.y;
    if (Math.abs(ty - this.yaw) > 0.0005 || Math.abs(tp - this.pitch) > 0.0005) {
      const f = this.reducedMotion || this.drag ? 1 : 0.12;
      this.yaw += (ty - this.yaw) * f;
      this.pitch += (tp - this.pitch) * f;
      turning = true;
    }
    if (this.kTw) {
      this.k = val(this.kTw, t, this.k);
      if (!live(this.kTw, t)) this.kTw = null;
    }
    this.draw(t);
    if (this.mouse && !this.drag) this.setHover(this.hitAt(this.mouse.x, this.mouse.y));
    const tweening =
      !!this.kTw || [...this.appear.values()].some((tw) => live(tw, t)) || [...this.nodeA.values()].some((tw) => live(tw, t));
    if (simOn || turning || this.drag || tweening || this.timers.length) this.kick();
    else this.lastT = 0;
  };

  private draw(t: number) {
    const { ctx } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    const vis = this.nodes.filter((n) => this.visible.has(n.id));
    this.proj.clear();
    let zMax = 1;
    vis.forEach((n) => {
      const p = this.project(n);
      zMax = Math.max(zMax, Math.abs(p.z));
      this.proj.set(n.id, p);
    });
    this.proj.forEach((p) => (p.depthA = clamp(0.3 + 0.7 * (1 - (p.z + zMax) / (2 * zMax)), 0.3, 1)));

    ctx.lineCap = "round";
    const hub = this.hoverId ? this.byId.get(this.hoverId) : undefined;
    this.links.forEach((l) => {
      const s = idOf(l.source);
      const e = idOf(l.target);
      const a = this.proj.get(s);
      const b = this.proj.get(e);
      if (!a || !b) return;
      const on = !!hub && (s === hub.id || e === hub.id);
      const base = hub ? (on ? 0.9 : LINK_BASE * DIM) : LINK_BASE;
      const ap = Math.min(val(this.appear.get(s), t, 1), val(this.appear.get(e), t, 1));
      const alpha = base * ap * ((a.depthA + b.depthA) / 2);
      if (alpha < 0.01) return;
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = on ? hub!.color : this.ink;
      ctx.lineWidth = (on ? 1.6 : 1) * clamp(this.k * ((a.s + b.s) / 2), 0.6, 1.6);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });

    const order = vis.slice().sort((p, q) => this.proj.get(q.id)!.z - this.proj.get(p.id)!.z);
    order.forEach((n) => {
      const p = this.proj.get(n.id)!;
      const ap = val(this.appear.get(n.id), t, 1);
      const r = Math.max(1.5, p.r * ap);
      const cx = p.x + LIGHT.x * 0.6 * r;
      const cy = p.y + LIGHT.y * 0.6 * r;
      const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, 1.6 * r);
      gr.addColorStop(0, shade(n.color, 1));
      gr.addColorStop(0.45, shade(n.color, 0.55));
      gr.addColorStop(1, shade(n.color, 0.05));
      ctx.globalAlpha = val(this.nodeA.get(n.id), t, 1) * p.depthA;
      ctx.fillStyle = gr;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fill();
    });

    // 라벨: 노드 아래. 겹치면 우선순위(호버·이웃 > big > 연결 수) 낮은 쪽을 숨긴다
    const keep = this.hoverId ? new Set([this.hoverId, ...(this.neighbors.get(this.hoverId) ?? [])]) : null;
    const rank = order
      .map((n) => ({ n, p: this.proj.get(n.id)!, forced: keep?.has(n.id) ?? false }))
      .sort((a, b) => Number(b.forced) - Number(a.forced) || Number(!!b.n.big) - Number(!!a.n.big) || b.n.degree - a.n.degree);
    const taken: number[][] = [];
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.lineJoin = "round";
    rank.forEach(({ n, p, forced }) => {
      const la = forced || n.big ? 1 : clamp((this.k * p.s * (1 + 0.25 * Math.sqrt(n.degree)) - FORCES.fade) / 0.3, 0, 1);
      const a = la * val(this.nodeA.get(n.id), t, 1) * p.depthA * val(this.appear.get(n.id), t, 1);
      if (a < 0.02) return;
      const size = (n.big ? 12 : 11) * clamp(this.k * p.s, 0.85, 1.25);
      ctx.font = `${n.big ? 700 : 500} ${size}px Pretendard, sans-serif`;
      const w = ctx.measureText(n.label).width;
      const y = p.y + p.r + 4;
      const box = [p.x - w / 2 - 2, y, p.x + w / 2 + 2, y + size + 2];
      if (!forced && taken.some((c) => box[0] < c[2] && box[2] > c[0] && box[1] < c[3] && box[3] > c[1])) return;
      taken.push(box);
      ctx.globalAlpha = a;
      ctx.lineWidth = 3;
      ctx.strokeStyle = this.halo;
      ctx.strokeText(n.label, p.x, y);
      ctx.fillStyle = this.ink;
      ctx.fillText(n.label, p.x, y);
    });
    ctx.globalAlpha = 1;
  }
}
