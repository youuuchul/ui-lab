/**
 * 글로브 렌더러 공개 인터페이스 (규약 v2).
 *
 * 원본은 `prototypes/globe-lab/shared.js` 하단 주석이다. 두 구현(three = 기본,
 * canvas2d = 폴백)이 이 타입을 그대로 만족해야 핸드오프에서 별이 튀지 않는다.
 */

export type GlobeStatus = "active" | "rainbow";

/**
 * 렌더러가 유리·받침 표현을 직접 그릴지.
 *
 * - `full`: 유리 테두리·하이라이트·바닥 그림자를 그린다 (기본, 홈의 글로브).
 * - `none`: 하늘·은하수·별빛만 원 안에 그리고 원 가장자리를 안쪽으로 흐린다.
 *   유리가 이미 그려진 그림 위에 얹을 때 쓴다 (첫 화면의 창가 장면).
 */
export type GlobeChrome = "full" | "none";

/** 내 아이의 별빛 하나. 위치는 추억 id 에서 결정론적으로 계산된다. */
export interface Light {
  id: string;
  mood: string | null;
  /** 정면에서 본 화면 좌표 (-1..1, y 는 아래가 +) */
  x: number;
  y: number;
  /** 깊이 (앞이 +) */
  z: number;
  brightness: number;
  phase: number;
  opalIndex: number;
}

/** 이름 있는 별빛의 공개 정보 — 그 아이가 공개한 항목만 키가 들어온다. */
export interface NamedLightInfo {
  date?: string;
  timeOfDay?: string;
  name?: string;
  species?: string;
}

/** 익명 밀도층과 내 별빛 사이의 층. 위치는 표시용 id 문자열에서 계산된다. */
export interface NamedLight {
  id: string;
  x: number;
  y: number;
  z: number;
  brightness: number;
  phase: number;
  opalIndex: number;
  status: GlobeStatus;
  info: NamedLightInfo;
}

/** 뷰포트 좌표. */
export interface ClientPoint {
  x: number;
  y: number;
}

export type HoverTarget =
  | { kind: "mine"; light: Light; client: ClientPoint | null }
  | { kind: "named"; light: NamedLight; client: ClientPoint | null };

export interface GlobeOptions {
  lights?: Light[];
  namedLights?: NamedLight[];
  /** 익명 밀도층 개수 (0 ~ 수십만) */
  communityCount?: number;
  /** 익명 밀도층 중 rainbow 비율 (0..1). 서버의 rainbow / total. */
  communityRainbowRatio?: number;
  status?: GlobeStatus;
  /** 기본 `full`. 두 렌더러가 같은 값으로 같은 그림이 되어야 한다. */
  chrome?: GlobeChrome;
  /** 누구의 기록도 아닌 장식용 배경 별. 기본 true. 내 글로브는 기록한 만큼만 별이 보이도록 끈다. */
  backdropStars?: boolean;
  reducedMotion?: boolean;
  /** 기울기 최대 각도(도). 기본 `TILT_MAX_DEG`. 실험실에서 세기를 비교할 때만 바꾼다. */
  tiltMaxDeg?: number;
  onTap?: (light: Light) => void;
  onHover?: (target: HoverTarget | null) => void;
}

export interface CommunityCountOptions {
  animate?: boolean;
  /** 바뀌면 밀도층을 다시 굽는다. 개수가 0일 때 세우면 비용이 없다. */
  rainbowRatio?: number;
}

export interface GlobeHandle {
  /** three 구현에서 WebGL 컨텍스트를 못 얻었을 때 false. canvas2d 는 값이 없다. */
  webglOk?: boolean;
  /** 연출 B — 흩어진 별빛이 모여듦 */
  gather(): Promise<void>;
  /** 연출 C — 새 별빛 1개가 날아와 켜짐 */
  lightUp(light: Light, fromClient?: ClientPoint | null): Promise<void>;
  /** 연출 D — 흰빛 ↔ 무지갯빛 */
  setStatus(status: GlobeStatus, opts?: { animate?: boolean }): Promise<void>;
  setLights(lights: Light[]): void;
  setNamedLights(list: NamedLight[]): void;
  setCommunityCount(n: number, opts?: CommunityCountOptions): void;
  /** -1..1. 렌더러가 ±`tiltMaxDeg` 이내로 매핑하고 자체 스무딩한다. */
  setTilt(t: { x: number; y: number }): void;
  /** false 인 쪽은 호버 대상에서 빠진다. 별빛 자체는 항상 그린다. */
  setInfoVisibility(v: { mine?: boolean; others?: boolean }): void;
  /** 호버·탭 상태를 푼다. 모바일에서 글로브 바깥을 눌러 카드를 닫을 때 쓴다. */
  clearHover(): void;
  /** 별빛(또는 id)의 현재 뷰포트 좌표. 미등록 별빛도 x, y 가 있으면 앉을 자리를 준다. */
  toClient(
    target: Light | NamedLight | string | { x: number; y: number; z?: number }
  ): ClientPoint | null;
  getStats(): Record<string, number | boolean>;
  destroy(): void;
}

export type CreateGlobe = (container: HTMLElement, options?: GlobeOptions) => GlobeHandle;
