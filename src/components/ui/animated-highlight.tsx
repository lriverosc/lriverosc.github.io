"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";
import { usePerfProfile } from "@/hooks/use-perf-profile";

function CountUpNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  // amount: 0.8 — trigger as soon as most of the number is on screen, rather
  // than waiting for the whole line (which can sit just past the fold and
  // never look like it "started").
  const isInView = useInView(ref, { once: true, amount: 0.8 });
  const { disableDecorative } = usePerfProfile();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    if (disableDecorative) {
      setDisplay(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
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
