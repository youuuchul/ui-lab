"use client";
import { Phone3D } from "./Phone3D";
import { PhoneCanvas } from "./PhoneCanvas";

const SCREEN = "/ui-lab/assets/heart-table/screen-chat.webp";

export default function Demo() {
  return (
    <PhoneCanvas
      className="h-72 w-72"
      screen={SCREEN}
      tone="#c9b9a6"
      height={250}
      label="캐릭터 대화 화면 목업"
      fallback={<Phone3D screen={SCREEN} tone="#c9b9a6" width={120} style={{ transform: "rotateY(-18deg) rotateX(4deg)" }} />}
    />
  );
}
