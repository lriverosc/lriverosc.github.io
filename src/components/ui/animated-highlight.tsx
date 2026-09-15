"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion/react";
import { usePerfProfile } from "@/hooks/use-perf-profile";

const MIDDLE_BAND_TOP = 0.75;
const MIDDLE_BAND_BOTTOM = 0.25;
const REQUIRED_DWELL_MS = 250;

function CountUpNumber({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { disableDecorative } = usePerfProfile();
  const [display, setDisplay] = useState(disableDecorative ? value : 0);
  const [settled, setSettled] = useState(disableDecorative);

  // SectionWrapper fades/scales its whole (tall) section content in as one
  // block, tied to how far the *entire* section has scrolled through the
  // viewport. The first project cards sit near the top of that section, so a
  // plain "has it entered the viewport" check fires for them almost
  // immediately — while the ancestor fade is still resolving — and the
  // count-up finished before the card was ever legible. Polling the
  // element's own position instead and waiting until it has sat inside the
  // comfortable middle of the viewport for a moment sidesteps having to know
  // how tall the section is or when its fade completes.
  useEffect(() => {
    if (settled) return;
    let frame: number;
    let insideSince: number | null = null;

    const check = (now: number) => {
      const el = ref.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const inMiddleBand = rect.top < vh * MIDDLE_BAND_TOP && rect.bottom > vh * MIDDLE_BAND_BOTTOM;
        if (inMiddleBand) {
          if (insideSince === null) insideSince = now;
          if (now - insideSince >= REQUIRED_DWELL_MS) {
            setSettled(true);
            return;
          }
        } else {
          insideSince = null;
        }
      }
      frame = requestAnimationFrame(check);
    };
    frame = requestAnimationFrame(check);
    return () => cancelAnimationFrame(frame);
  }, [settled]);

  useEffect(() => {
    if (!settled || disableDecorative) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: "easeOut",
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [settled, disableDecorative, value]);

  return <span ref={ref}>{display}</span>;
}

/** Renders `text` with every number in it counting up from 0 the first time
 * it settles in the middle of the viewport — e.g. "666 muestras reales" →
 * "666" ticks up. */
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
