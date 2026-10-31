/** 휴대폰 기울기(deviceorientation)를 -1~1로. 처음 쥔 각도를 기준으로 천천히 따라가서 다시 가운데로 돌아온다. */
export const deviceTilt = { x: 0, y: 0, on: false };

const base = { b: 0, g: 0, set: false };
const clamp = (v: number) => Math.max(-1, Math.min(1, v));

function onOrientation(e: DeviceOrientationEvent) {
  if (e.beta == null || e.gamma == null) return;
  if (!base.set) {
    base.b = e.beta;
    base.g = e.gamma;
    base.set = true;
  }
  base.b += (e.beta - base.b) * 0.02;
  base.g += (e.gamma - base.g) * 0.02;
  deviceTilt.x = clamp((e.gamma - base.g) / 22);
  deviceTilt.y = clamp((e.beta - base.b) / 22);
}

type PermissionApi = { requestPermission?: () => Promise<"granted" | "denied"> };

let denied = false;

/** 터치 기기에서 사용자 조작(click) 안에서 호출한다. iOS는 이때 권한을 묻는다. 한 번 거부되면 다시 묻지 않는다. */
export async function enableDeviceTilt() {
  if (deviceTilt.on || denied || typeof window === "undefined" || !("DeviceOrientationEvent" in window)) return;
  const api = DeviceOrientationEvent as unknown as PermissionApi;
  if (typeof api.requestPermission === "function") {
    try {
      if ((await api.requestPermission()) !== "granted") {
        denied = true;
        return;
      }
    } catch {
      denied = true;
      return;
    }
  }
  deviceTilt.on = true;
  window.addEventListener("deviceorientation", onOrientation);
}
