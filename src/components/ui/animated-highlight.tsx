"use client";

import { useEffect, useRef, useState } from "react";
import { animate, type AnimationPlaybackControls } from "motion/react";
import { usePerfProfile } from "@/hooks/use-perf-profile";

const MIDDLE_BAND_TOP = 0.75;
const MIDDLE_BAND_BOTTOM = 0.25;
const REQUIRED_DWELL_MS = 250;

function CountUpNumber({ value, loop = false }: { value: number; loop?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { disableDecorative } = usePerfProfile();
  const [display, setDisplay] = useState(disableDecorative ? value : 0);

  // SectionWrapper fades/scales its whole (tall) section content in as one
  // block, tied to how far the *entire* section has scrolled through the
  // viewport. The first project cards sit near the top of that section, so a
  // plain "has it entered the viewport" check fires for them almost
  // immediately — while the ancestor fade is still resolving — and the
  // count-up finished before the card was ever legible. Polling the
  // element's own position instead and waiting until it has sat inside the
  // comfortable middle of the viewport for a moment sidesteps having to know
  // how tall the section is or when its fade completes.
  //
  // `loop` keeps this running indefinitely: every time the number leaves that
  // middle band it resets to 0, so scrolling back to it (e.g. the "Sobre mí"
  // stats) replays the count-up instead of showing the already-final number.
  useEffect(() => {
    if (disableDecorative) {
      setDisplay(value);
      return;
    }

    let frame: number;
    let insideSince: number | null = null;
    let settled = false;
    let hasPlayed = false;
    let controls: AnimationPlaybackControls | null = null;

    const check = (now: number) => {
      const el = ref.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const inMiddleBand = rect.top < vh * MIDDLE_BAND_TOP && rect.bottom > vh * MIDDLE_BAND_BOTTOM;

        if (inMiddleBand) {
          if (insideSince === null) insideSince = now;
          if (!settled && now - insideSince >= REQUIRED_DWELL_MS) {
            settled = true;
            if (loop || !hasPlayed) {
              hasPlayed = true;
              controls?.stop();
              controls = animate(0, value, {
                duration: 1.4,
                ease: "easeOut",
                onUpdate: (latest) => setDisplay(Math.round(latest)),
              });
            }
          }
        } else {
          insideSince = null;
          if (settled && loop) setDisplay(0);
          settled = false;
        }
      }
      // Non-looping numbers have nothing left to do once played — stop
      // polling instead of running an rAF loop forever for no reason.
      if (!loop && hasPlayed) return;
      frame = requestAnimationFrame(check);
    };
    frame = requestAnimationFrame(check);
    return () => {
      cancelAnimationFrame(frame);
      controls?.stop();
    };
  }, [disableDecorative, value, loop]);

  return <span ref={ref}>{display}</span>;
}

/** Renders `text` with every number in it counting up from 0 once it settles
 * in the middle of the viewport — e.g. "666 muestras reales" → "666" ticks
 * up. Pass `loop` to replay the count-up every time it re-enters view
 * (instead of only the first time). */
export function AnimatedHighlight({ text, loop = false }: { text: string; loop?: boolean }) {
  const parts = text.split(/(\d+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^\d+$/.test(part) ? <CountUpNumber key={i} value={Number(part)} loop={loop} /> : <span key={i}>{part}</span>
      )}
    </>
  );
}
