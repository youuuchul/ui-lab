/**
 * 글로브 배치 규약. 두 렌더러(three = 기본, canvas2d = 폴백)가 같은 데이터·팔레트를 쓴다.
 *
 * 원본: `prototypes/globe-lab/shared.js` (실험실). 배치를 결정하는 함수는 전부 여기 있다 —
 * 렌더러는 좌표를 스스로 만들지 않는다. 두 렌더러가 같은 그림이 되고, 핸드오프
 * (canvas2d → three) 때 별이 튀지 않으려면 배치가 한 곳이어야 한다.
 *
 * 기준 문서: concept_art/DESIGN.md "글로브와 별빛"
 */
import type { GlobeStatus, Light, NamedLight, NamedLightInfo } from "./globeTypes";

export const PALETTE = {
  skyDeep: "#15142B",
  skyMid: "#1F1E3D",
  skySoft: "#2D2B55",
  milkyWay: "#B7B3DA",
  starWarm: "#F4EFE6",
  starBright: "#FFF9EC",
  gold: "#F2C879",
  // 무지갯빛: 저채도 오팔. 별빛마다 이 목록 안에서 천천히 색이 이동한다.
  opal: ["#F3D9E2", "#F6E3C8", "#EEF0CC", "#CFEBDD", "#CDE3F2", "#DAD3F0"],
};

/** 화면 기하 — 두 렌더러가 같은 자리에 같은 크기로 구를 그린다. 컨테이너 한 변 대비 비율. */
export const GEOMETRY = {
  radius: 0.468,
  centerY: 0.482,
};

/**
 * `chrome: "none"` 에서 원 가장자리를 안쪽으로 흐리는 CSS 마스크.
 *
 * 그려진 유리구 안에 캔버스를 얹을 때 원의 경계선이 보이지 않게 한다. 두 렌더러가
 * 같은 값을 써야 핸드오프(canvas2d → three)에서 가장자리가 달라지지 않는다.
 * 컨테이너가 정사각형이므로 `closest-side` 반지름은 컨테이너 한 변 × 아래 ray 다.
 */
const FEATHER_RAY = Math.min(0.5, GEOMETRY.centerY, 1 - GEOMETRY.centerY);
export const EDGE_FEATHER_MASK =
  `radial-gradient(circle closest-side at 50% ${(GEOMETRY.centerY * 100).toFixed(2)}%,` +
  ` #000 ${((GEOMETRY.radius * 0.9) / FEATHER_RAY * 100).toFixed(2)}%,` +
  ` transparent ${((GEOMETRY.radius * 0.998) / FEATHER_RAY * 100).toFixed(2)}%)`;

/** 캔버스 요소에 위 마스크를 입힌다. */
export function applyEdgeFeather(el: HTMLElement): void {
  el.style.setProperty("mask-image", EDGE_FEATHER_MASK);
  el.style.setProperty("-webkit-mask-image", EDGE_FEATHER_MASK);
}

/** 밀도 정규화 기준 폭(CSS px). 글로브가 커져도 은하수 농도가 같게 보이도록 쓴다. */
export const REF_SIZE = 390;

/** 이름 있는 별빛 층의 상한. */
export const NAMED_MAX = 300;

/** 기울기 최대 각도(도). 2026-10-18 ±4 → ±8 — 4도는 움직임이 거의 느껴지지 않았다. */
export const TILT_MAX_DEG = 8;

/** 서버가 rainbow 비율을 주지 못할 때의 기본값. */
export const DEFAULT_RAINBOW_RATIO = 0.08;

const SQRT1_2 = Math.SQRT1_2;
const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);

function hash32(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** splitmix32 — 연속한 인덱스가 서로 상관되지 않게 충분히 섞는다. */
function hashIndex(i: number): number {
  let z = (i + 0x9e3779b9) | 0;
  z = Math.imul(z ^ (z >>> 16), 0x21f0aaad);
  z = Math.imul(z ^ (z >>> 15), 0x735a2d97);
  return (z ^ (z >>> 15)) >>> 0;
}

/**
 * 원 가장자리에서 은하수가 칼로 자른 듯 끊기지 않도록 하는 감쇠.
 *
 * Args:
 *   r: 중심에서의 거리 / 구 반지름 (0..1+)
 *
 * Returns:
 *   0..1 감쇠 계수
 */
export function edgeFade(r: number): number {
  if (r <= 0.82) return 1;
  if (r >= 0.995) return 0;
  const t = (0.995 - r) / (0.995 - 0.82);
  return t * t * (3 - 2 * t);
}

/**
 * 글로브가 커지면 같은 개수의 별이 더 넓은 면적에 퍼져 띠가 옅어진다.
 * 별 하나의 광량에 이 값을 곱해 면적으로 정규화한다.
 *
 * Args:
 *   cssSize: 글로브 한 변의 CSS 픽셀
 *
 * Returns:
 *   광량 배율
 */
export function densityScale(cssSize: number): number {
  const k = Math.max(1, cssSize) / REF_SIZE;
  return k * k;
}

/**
 * 추억 id 로부터 내 아이의 별빛 고정 속성을 만든다. 같은 id 는 항상 같은 자리.
 *
 * 내 별빛은 항상 앞쪽 반구(z > 0)에 둔다 — 모두의 별빛 띠에 묻히면 안 된다.
 *
 * Args:
 *   memory: 추억 id 와 기분
 *
 * Returns:
 *   배치가 끝난 별빛
 */
export function lightFromMemory(memory: { id: string; mood?: string | null }): Light {
  const rnd = mulberry32(hash32(memory.id));
  const along = (rnd() * 2 - 1) * 0.8;
  const spread = rnd() < 0.65 ? 0.22 : 0.7;
  const across = (rnd() + rnd() + rnd() - 1.5) * spread;
  let x = along * SQRT1_2 - across * SQRT1_2;
  let y = -(along * SQRT1_2 + across * SQRT1_2);
  const r = Math.hypot(x, y);
  if (r > 0.86) {
    x *= 0.86 / r;
    y *= 0.86 / r;
  }
  const moodBoost: Record<string, number> = {
    excited: 0.25,
    happy: 0.15,
    calm: 0,
    sad: -0.1,
    worried: -0.1,
  };
  const room = Math.sqrt(Math.max(0, 0.9 * 0.9 - x * x - y * y));
  return {
    id: memory.id,
    mood: memory.mood ?? null,
    x,
    y,
    z: (0.3 + rnd() * 0.68) * room, // 앞쪽 반구
    brightness: Math.min(1, 0.6 + rnd() * 0.25 + (moodBoost[memory.mood ?? ""] ?? 0)),
    phase: rnd() * Math.PI * 2,
    opalIndex: Math.floor(rnd() * PALETTE.opal.length),
  };
}

/**
 * 하루 별의 밝기. 두 렌더러에서 추억 별(0.6~0.85)의 절반 남짓 크기·광량이 되고 십자 광선이 없다.
 * 그날 기록 수·목표 달성과 무관하게 모두 같은 값이다(DESIGN.md "하루 별").
 */
export const DAY_STAR_BRIGHTNESS = 0.08;

/**
 * 돌봄을 기록한 날 하나의 하루 별. 같은 펫·같은 날은 항상 같은 자리.
 *
 * 추억 별과 같은 띠 배치를 쓰되 추억 별보다 뒤 깊이에 둔다. id 는 `day:` 로 시작해
 * 추억 id(uuid)와 겹치지 않는다.
 *
 * Args:
 *   petId: 펫 id
 *   date: 사용자 현지 기준 날짜 (YYYY-MM-DD)
 *
 * Returns:
 *   배치가 끝난 하루 별
 */
export function dayLightFromDate(petId: string, date: string): Light {
  const l = lightFromMemory({ id: `day:${petId}:${date}` });
  return { ...l, z: l.z * 0.3, brightness: DAY_STAR_BRIGHTNESS };
}

export interface CommunityStar {
  x: number;
  y: number;
  z: number;
  /** 광량 */
  a: number;
  /** 드물게 큰 별 */
  big: boolean;
  rainbow: boolean;
  opalIndex: number;
}

/**
 * 모두의 별빛 i 번째의 고정 속성. 인덱스 해시만 쓰므로 같은 i 는 항상 같은 자리.
 * 두 렌더러가 이 함수만 써서 익명 밀도층을 만든다.
 *
 * Args:
 *   i: 별빛 인덱스
 *   rainbowRatio: rainbow 로 그릴 비율 (= 서버의 rainbow / total)
 *
 * Returns:
 *   익명 별빛 하나의 배치·광량
 */
export function communityStarFromIndex(
  i: number,
  rainbowRatio: number = DEFAULT_RAINBOW_RATIO
): CommunityStar {
  const rnd = mulberry32(hashIndex(i));
  rnd();
  const along = (rnd() * 2 - 1) * 0.94;
  // 띠 끝으로 갈수록 퍼짐을 좁혀 원 경계에 별이 몰리지 않게 한다
  const room = Math.sqrt(Math.max(0, 0.95 * 0.95 - along * along)) / 0.95;
  const spread = (rnd() < 0.55 ? 0.3 : 0.8) * room;
  const across = clamp((rnd() + rnd() + rnd() - 1.5) * spread, -0.94 * room, 0.94 * room);
  const x = along * SQRT1_2 - across * SQRT1_2;
  const y = -(along * SQRT1_2 + across * SQRT1_2);
  // 개별 별빛은 아주 희미하다. 소수만 점으로 읽히고 나머지는 누적 밀도로만 보인다.
  const roll = rnd();
  const r2 = roll * roll;
  const depth = Math.sqrt(Math.max(0, 0.96 * 0.96 - x * x - y * y));
  return {
    x,
    y,
    z: -(rnd() * 1.08 - 0.22) * depth, // 대부분 뒤쪽 층
    a: 0.012 + r2 * r2 * r2 * r2 * 0.6,
    big: roll > 0.988,
    rainbow: rnd() < rainbowRatio,
    opalIndex: Math.floor(rnd() * PALETTE.opal.length),
  };
}

/**
 * 이름 있는 별빛의 배치를 서버가 준 표시용 id 문자열의 해시로 정한다.
 * 목록의 순서가 바뀌어도 같은 id 는 항상 같은 자리에 앉는다.
 *
 * Args:
 *   source: 표시용 id, 펫 상태, 공개된 정보
 *
 * Returns:
 *   배치가 끝난 이름 있는 별빛
 */
export function namedLightFromId(source: {
  id: string;
  status: GlobeStatus;
  info: NamedLightInfo;
}): NamedLight {
  const rnd = mulberry32(hash32("named:" + source.id));
  const along = (rnd() * 2 - 1) * 0.86;
  const room = Math.sqrt(Math.max(0, 0.9 * 0.9 - along * along)) / 0.9;
  const across = (rnd() + rnd() - 1) * 0.62 * room;
  const x = along * SQRT1_2 - across * SQRT1_2;
  const y = -(along * SQRT1_2 + across * SQRT1_2);
  const depth = Math.sqrt(Math.max(0, 0.92 * 0.92 - x * x - y * y));
  return {
    id: source.id,
    x,
    y,
    z: (-0.15 + rnd() * 0.7) * depth,
    brightness: 0.45 + rnd() * 0.35,
    phase: rnd() * Math.PI * 2,
    opalIndex: Math.floor(rnd() * PALETTE.opal.length),
    status: source.status,
    info: source.info,
  };
}

/** 이름 있는 별빛의 공개 정보를 한 줄로. 보는 쪽 필터(fields)로 항목을 더 줄인다. */
export function namedSummary(
  info: NamedLightInfo | undefined,
  fields: { date?: boolean; timeOfDay?: boolean; name?: boolean; species?: boolean }
): string {
  if (!info) return "";
  const parts: string[] = [];
  if (fields.species !== false && info.species) parts.push(info.species);
  if (fields.name !== false && info.name) parts.push(info.name);
  const when: string[] = [];
  if (fields.date !== false && info.date) when.push(info.date);
  if (fields.timeOfDay !== false && info.timeOfDay) when.push(info.timeOfDay);
  if (when.length) parts.push(when.join(" "));
  return parts.join(" · ");
}
