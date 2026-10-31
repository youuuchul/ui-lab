"use client";
import { Phone3D } from "./Phone3D";
import { PhoneCanvas } from "./PhoneCanvas";

const SCREEN = "/ui-lab/assets/phone-screen.webp";

export default function Demo() {
  return (
    <PhoneCanvas
      className="h-72 w-72"
      screen={SCREEN}
      tone="#c9b9a6"
      height={250}
      label="잠금 화면이 띄워진 폰 목업"
      fallback={<Phone3D screen={SCREEN} tone="#c9b9a6" width={120} style={{ transform: "rotateY(-18deg) rotateX(4deg)" }} />}
    />
  );
}
