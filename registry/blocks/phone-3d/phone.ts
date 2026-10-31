import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export type PhoneItem = { screen: string; tone: string };

/** CSS 좌표계 자세: px·rad, h = 화면에 그릴 폰 높이(px), o = 불투명도 */
export type Pose = { x: number; y: number; z: number; rx: number; ry: number; rz: number; h: number; o: number };

/** CSS perspective 무대와 같은 시점: 거리(px), 소실점 세로 위치(0~1), 무대 전체 이동·회전 */
export type View = { perspective: number; originY: number; worldX: number; worldRx: number; worldRy: number };

/** 화면 영역(앞면 기준 비율): 폭·높이·모서리(폭 대비)·가로/세로 이동·앞으로 띄우기(높이 대비) */
const SCREEN = { w: 0.95, h: 0.976, r: 0.135, x: 0, y: 0, z: 0.0006 };
function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** 0~1 UV를 가진 둥근 사각 판 */
function roundedPlane(w: number, h: number, r: number) {
  const g = new THREE.ShapeGeometry(roundedRect(w, h, r), 24);
  const p = g.attributes.position;
  const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    uv[i * 2] = p.getX(i) / w + 0.5;
    uv[i * 2 + 1] = p.getY(i) / h + 0.5;
  }
  g.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return g;
}

const TONE = "tone";

/** 코드로 만든 기본 폰: 높이 1 기준 (iPhone 15 Pro 비율) */
function buildDefaultPhone() {
  const W = 0.4816;
  const H = 1;
  const D = 0.0563;
  const R = 0.078;
  const g = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: "#9aa0ad", metalness: 1, roughness: 0.32 });

  const b = 0.009;
  const frame = new THREE.ExtrudeGeometry(roundedRect(W - b * 1.2, H - b * 1.2, R - b * 0.6), {
    depth: D - b * 2,
    bevelEnabled: true,
    bevelThickness: b,
    bevelSize: b * 0.6,
    bevelSegments: 6,
    curveSegments: 32,
  });
  frame.translate(0, 0, -(D - b * 2) / 2);
  g.add(new THREE.Mesh(frame, metal));

  const glass = new THREE.MeshPhysicalMaterial({ color: "#06070a", roughness: 0.06, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04 });
  const front = new THREE.Mesh(roundedPlane(W - 0.006, H - 0.006, R - 0.003), glass);
  front.position.z = D / 2 + 0.0004;
  g.add(front);

  const backMat = new THREE.MeshPhysicalMaterial({
    color: "#c9b9a6",
    roughness: 0.5,
    metalness: 0,
    clearcoat: 0.6,
    clearcoatRoughness: 0.3,
  });
  backMat.userData[TONE] = true;
  const back = new THREE.Mesh(roundedPlane(W - 0.006, H - 0.006, R - 0.003), backMat);
  back.position.z = -D / 2 - 0.0004;
  back.rotation.y = Math.PI;
  g.add(back);

  const bumpMat = backMat.clone();
  bumpMat.userData[TONE] = true;
  bumpMat.roughness = 0.25;
  const bump = new THREE.Mesh(
    new THREE.ExtrudeGeometry(roundedRect(0.2, 0.2, 0.05), {
      depth: 0.006,
      bevelEnabled: true,
      bevelThickness: 0.003,
      bevelSize: 0.003,
      bevelSegments: 4,
      curveSegments: 16,
    }),
    bumpMat,
  );
  bump.rotation.y = Math.PI;
  bump.position.set(W / 2 - 0.13, H / 2 - 0.13, -D / 2);
  g.add(bump);

  const lensMat = new THREE.MeshPhysicalMaterial({ color: "#0b0d12", roughness: 0.05, metalness: 0.2, clearcoat: 1 });
  const ringMat = new THREE.MeshStandardMaterial({ color: "#b8bdc8", metalness: 1, roughness: 0.25 });
  const lensGeo = new THREE.CylinderGeometry(0.036, 0.038, 0.012, 32);
  const ringGeo = new THREE.TorusGeometry(0.038, 0.004, 12, 40);
  for (const [lx, ly] of [
    [-0.045, 0.045],
    [-0.045, -0.045],
    [0.045, 0],
  ]) {
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(W / 2 - 0.13 - lx, H / 2 - 0.13 + ly, -D / 2 - 0.014);
    g.add(lens);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(lens.position).setZ(-D / 2 - 0.02);
    g.add(ring);
  }

  const btnGeo = new THREE.BoxGeometry(0.006, 1, 0.022);
  for (const [side, y, len] of [
    [-1, 0.27, 0.05],
    [-1, 0.19, 0.07],
    [-1, 0.1, 0.07],
    [1, 0.17, 0.11],
  ]) {
    const btn = new THREE.Mesh(btnGeo, metal);
    btn.scale.y = len;
    btn.position.set(side * (W / 2 + 0.001), y, 0);
    g.add(btn);
  }
  return { object: g as THREE.Object3D, dims: { W, H, D } };
}

function coverTexture(tex: THREE.Texture, aspect: number) {
  const img = tex.image as { width: number; height: number };
  const ia = img.width / img.height;
  tex.repeat.set(1, 1);
  tex.offset.set(0, 0);
  if (ia < aspect) {
    tex.repeat.y = ia / aspect;
    tex.offset.y = 1 - tex.repeat.y;
  } else {
    tex.repeat.x = aspect / ia;
    tex.offset.x = (1 - tex.repeat.x) / 2;
  }
}

/** 코드로 만든 폰 여러 대를 한 캔버스에 그리는 무대. 자세(pose)는 바깥(CSS 계산)에서 매 프레임 넘긴다 */
export class PhoneStage {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera();
  private world = new THREE.Group();
  private phones: THREE.Object3D[] = [];
  private mats: THREE.Material[][] = [];
  private textures = new Map<string, THREE.Texture>();
  private view: View = { perspective: 1500, originY: 0.5, worldX: 0, worldRx: 0, worldRy: 0 };
  private size = { w: 1, h: 1 };

  private constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    const key = new THREE.DirectionalLight("#ffffff", 1.4);
    key.position.set(-600, 900, 1200);
    this.scene.add(key, this.world);
  }

  static async create(canvas: HTMLCanvasElement, items: PhoneItem[]) {
    const stage = new PhoneStage(canvas);
    const base = buildDefaultPhone();
    const { W, H, D } = base.dims;
    const sw = W * SCREEN.w;
    const sh = H * SCREEN.h;
    const screenGeo = roundedPlane(sw, sh, sw * SCREEN.r);
    const islandGeo = roundedPlane(sw * 0.31, sw * 0.088, sw * 0.044);
    const islandMat = new THREE.MeshBasicMaterial({ color: "#030406" });
    const loader = new THREE.TextureLoader();

    await Promise.all(
      [...new Set(items.map((x) => x.screen))].map(async (src) => {
        const tex = await loader.loadAsync(src);
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = stage.renderer.capabilities.getMaxAnisotropy();
        coverTexture(tex, sw / sh);
        stage.textures.set(src, tex);
      }),
    );

    items.forEach((it) => {
      const phone = base.object.clone(true);
      const mats: THREE.Material[] = [];
      phone.traverse((o) => {
        const m = o as THREE.Mesh;
        if (!m.isMesh) return;
        const list = (Array.isArray(m.material) ? m.material : [m.material]).map((mt) => {
          const c = mt.clone();
          if (c.userData[TONE] && "color" in c) (c as THREE.MeshStandardMaterial).color.set(it.tone);
          mats.push(c);
          return c;
        });
        m.material = Array.isArray(m.material) ? list : list[0];
      });
      const screenMat = new THREE.MeshStandardMaterial({
        color: "#000000",
        emissive: "#ffffff",
        emissiveMap: stage.textures.get(it.screen) ?? null,
        roughness: 0.14,
        metalness: 0,
        toneMapped: false,
      });
      mats.push(screenMat);
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.set(W * SCREEN.x, H * SCREEN.y, D / 2 + H * SCREEN.z);
      phone.add(screen);
      {
        const isl = islandMat.clone();
        mats.push(isl);
        const island = new THREE.Mesh(islandGeo, isl);
        island.position.set(screen.position.x, screen.position.y + sh / 2 - sw * 0.085, screen.position.z + 0.0004);
        phone.add(island);
      }
      stage.world.add(phone);
      stage.phones.push(phone);
      stage.mats.push(mats);
    });
    return stage;
  }

  setView(view: View) {
    this.view = view;
    this.applyCamera();
  }

  resize(w: number, h: number) {
    this.size = { w: Math.max(1, w), h: Math.max(1, h) };
    this.renderer.setSize(this.size.w, this.size.h, false);
    this.applyCamera();
  }

  private applyCamera() {
    const { w, h } = this.size;
    const { perspective: P, originY: oy } = this.view;
    const fullH = 2 * Math.max(oy, 1 - oy) * h;
    const cam = this.camera;
    cam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(fullH / 2 / P));
    cam.aspect = w / fullH;
    cam.near = 10;
    cam.far = P * 6;
    cam.position.set(0, 0, P);
    cam.setViewOffset(w, fullH, 0, fullH / 2 - oy * h, w, h);
    cam.updateProjectionMatrix();
    this.world.position.set(this.view.worldX, -(0.5 - oy) * h, 0);
    this.world.rotation.set(-this.view.worldRx, this.view.worldRy, 0, "XYZ");
  }

  /** CSS translate3d·rotateXYZ와 같은 자세로 배치 후 그리기 (CSS는 y가 아래, three는 위) */
  render(poses: Pose[]) {
    poses.forEach((p, i) => {
      const phone = this.phones[i];
      if (!phone) return;
      phone.visible = p.o > 0.01;
      if (!phone.visible) return;
      phone.position.set(p.x, -p.y, p.z);
      phone.rotation.set(-p.rx, p.ry, -p.rz, "XYZ");
      phone.scale.setScalar(p.h);
      const fade = p.o < 0.999;
      this.mats[i].forEach((m) => {
        if (m.transparent !== fade) {
          m.transparent = fade;
          m.needsUpdate = true;
        }
        m.opacity = p.o;
      });
    });
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.textures.forEach((t) => t.dispose());
    this.mats.flat().forEach((m) => m.dispose());
    this.scene.environment?.dispose();
    this.renderer.dispose();
  }
}
