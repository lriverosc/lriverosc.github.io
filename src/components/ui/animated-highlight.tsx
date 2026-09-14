"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "motion/react";
import { usePerfProfile } from "@/hooks/use-perf-profile";

function CountUpNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  const { disableDecorative } = usePerfProfile();
  const [display, setDisplay] = useState(disableDecorative ? value : 0);

  useEffect(() => {
    if (!isInView || disableDecorative) return;
    const duration = 1200;
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isInView, disableDecorative, value]);

  return <span ref={ref}>{display}</span>;
}

/** Renders `text` with every number in it counting up from 0 the first time
 * it scrolls into view — e.g. "666 muestras reales" → "666" ticks up. */
export function AnimatedHighlight({ text }: { text: string }) {
  const parts = text.split(/(\d+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^\d+$/.test(part) ? <CountUpNumber key={i} value={Number(part)} /> : <span key={i}>{part}</span>
      )}
    </>
  );
}
