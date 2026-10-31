"use client";
import { useEffect, useState } from "react";
import { CountdownRing } from "./CountdownRing";

const TOTAL = 10;

export default function Demo() {
  const [left, setLeft] = useState(TOTAL);
  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);
  return <CountdownRing progress={left / TOTAL} label={`0:${String(left).padStart(2, "0")}`} size={96} />;
}
