"use client";
import { Phone3D } from "./Phone3D";
import { PhoneCanvas } from "./PhoneCanvas";

const SCREEN =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6b8cff"/><stop offset="1" stop-color="#1b1b1b"/></linearGradient></defs>
      <rect width="390" height="844" fill="url(#g)"/>
      <rect x="32" y="120" width="200" height="28" rx="8" fill="#ffffffcc"/>
      <rect x="32" y="164" width="300" height="16" rx="6" fill="#ffffff66"/>
      <rect x="32" y="190" width="260" height="16" rx="6" fill="#ffffff66"/>
      <rect x="32" y="250" width="326" height="220" rx="24" fill="#ffffff22"/>
      <rect x="32" y="490" width="326" height="120" rx="24" fill="#ffffff22"/>
      <rect x="32" y="740" width="326" height="56" rx="28" fill="#ffffff"/>
    </svg>`,
  );

export default function Demo() {
  return (
    <PhoneCanvas
      className="h-72 w-72"
      screen={SCREEN}
      tone="#c9b9a6"
      height={250}
      label="앱 화면 목업"
      fallback={<Phone3D screen={SCREEN} tone="#c9b9a6" width={120} style={{ transform: "rotateY(-18deg) rotateX(4deg)" }} />}
    />
  );
}
