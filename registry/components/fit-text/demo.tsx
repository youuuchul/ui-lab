"use client";
import { useState } from "react";
import { useFit } from "./useFit";

export default function Demo() {
  const [wide, setWide] = useState(true);
  const fit = useFit<HTMLDivElement>(wide);
  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`rounded-xl border border-line p-4 transition-[width] duration-500 ${wide ? "w-80" : "w-48"}`}>
        <div ref={fit} className="font-bold leading-[0.95] tracking-tight text-fg">
          <span data-fit="1" className="block whitespace-nowrap">
            SMALL PARTS
          </span>
          <span data-fit="1" className="block whitespace-nowrap text-accent">
            ONE SCREEN
          </span>
          <span data-fit="0.6" className="block whitespace-nowrap text-muted">
            fit to width
          </span>
        </div>
      </div>
      <button onClick={() => setWide((v) => !v)} className="rounded-full bg-fg/10 px-4 py-1.5 text-sm text-fg hover:bg-fg/20">
        {wide ? "좁게" : "넓게"}
      </button>
    </div>
  );
}
