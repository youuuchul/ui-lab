"use client";
import { useCallback, useLayoutEffect, useRef } from "react";

/**
 * 컨테이너 안의 `data-fit` 줄을 컨테이너 폭 × 비율에 맞춰 글자 크기를 정한다.
 * 화면 폭 720px 이하에서는 `data-fit-m` 비율을 쓴다.
 * 컨테이너에 `data-fit-h`가 있으면 줄 묶음 높이가 화면 높이 × 그 비율을 넘지 않게 같은 배율로 함께 줄인다.
 *
 * Args:
 *   dep: 바뀌면 다시 맞출 값 (글자 내용 등).
 *
 * Returns:
 *   컨테이너에 붙일 ref.
 */
export function useFit<T extends HTMLElement>(dep?: unknown) {
  const ref = useRef<T>(null);
  const fit = useCallback(() => {
    const box = ref.current;
    if (!box) return;
    const cw = box.clientWidth;
    const narrow = window.innerWidth <= 720;
    const lines = box.querySelectorAll<HTMLElement>("[data-fit]");
    lines.forEach((el) => {
      el.style.fontSize = "100px";
      const w = el.scrollWidth;
      const r = Number((narrow && el.dataset.fitM) || el.dataset.fit);
      if (w) el.style.fontSize = `${(100 * cw * r) / w}px`;
    });
    const hf = Number(box.dataset.fitH);
    const words = lines[0]?.parentElement;
    if (!hf || !words) return;
    const k = (window.innerHeight * hf) / words.offsetHeight;
    if (k < 1) lines.forEach((el) => (el.style.fontSize = `${parseFloat(el.style.fontSize) * k}px`));
  }, []);
  useLayoutEffect(() => {
    fit();
    document.fonts.ready.then(fit);
    document.fonts.addEventListener("loadingdone", fit);
    const ro = new ResizeObserver(fit);
    if (ref.current) ro.observe(ref.current);
    window.addEventListener("resize", fit);
    return () => {
      document.fonts.removeEventListener("loadingdone", fit);
      window.removeEventListener("resize", fit);
      ro.disconnect();
    };
  }, [fit, dep]);
  return ref;
}
