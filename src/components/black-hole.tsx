"use client";

import { usePathname } from "next/navigation";
import { usePerfProfile } from "@/hooks/use-perf-profile";

/**
 * TON 618 — the most massive black hole known — periodically dissolves into
 * view above the horizon on the upper right (a tilted, Gargantua-style
 * accretion disk), holds for a moment with the plasma visibly flowing around
 * it, then fades back into the starfield. Endless slow loop, pure CSS (see
 * the `ton618-*` keyframes in globals.css), skipped under reduced motion
 * like every other purely decorative effect here.
 *
 * Deliberately kept away from center, a bit above where the 3D keyboard
 * scene sits: that's an opaque WebGL canvas that roams the middle of the
 * screen across sections and would otherwise paint right over it.
 *
 * The flowing look is a clip-path trick: the flattened ellipse silhouette
 * (`clip-path: ellipse(...)`) never itself rotates — a much larger *circular*
 * conic-gradient underneath spins inside that fixed window, so the plasma
 * visibly swirls without the disk's shape warping as it turns.
 */
export default function BlackHole() {
  const pathname = usePathname();
  const isBlogPost = pathname?.startsWith("/blogs/") && pathname !== "/blogs";
  const { disableDecorative } = usePerfProfile();

  if (isBlogPost || disableDecorative) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed right-[6%] top-[6%] -z-10 hidden sm:right-[9%] sm:top-[8%] md:block"
    >
      <div className="ton618-cycle relative w-[clamp(240px,28vw,400px)] aspect-[2.2/1]">
        {/* Ambient glow — soft and screen-blended so the whole thing melts
            into the sky instead of reading as a flat sticker. */}
        <div
          className="absolute inset-[-55%] rounded-full blur-3xl"
          style={{
            background: "radial-gradient(ellipse, rgba(255,176,96,0.38), transparent 62%)",
            mixBlendMode: "screen",
          }}
        />
        {/* Flattened disk window — the silhouette stays fixed; only what's
            visible through it spins. */}
        <div
          className="absolute inset-0 overflow-hidden blur-[1px]"
          style={{ clipPath: "ellipse(50% 38% at 50% 50%)", mixBlendMode: "screen" }}
        >
          {/* Centering (translate) lives on this wrapper and rotation on the
              child below — an animated `transform` replaces the whole
              property, so keeping them on separate elements is what stops
              the spin from cancelling out the centering. */}
          <div className="absolute left-1/2 top-1/2 aspect-square h-[220%] -translate-x-1/2 -translate-y-1/2">
            <div
              className="ton618-spin h-full w-full"
              style={{
                background:
                  "conic-gradient(from 0deg, #fff6e2 0deg, #ffb454 35deg, #ff7a1a 85deg, #b33a00 130deg, #3a1200 180deg, #b33a00 230deg, #ff7a1a 275deg, #ffb454 325deg, #fff6e2 360deg)",
              }}
            />
          </div>
        </div>
        {/* Event horizon — a flat, opaque void so the center reads as a true
            gap in the disk, not a gradient smear. */}
        <div className="absolute left-1/2 top-1/2 aspect-square h-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black" />
        <p className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.3em] text-white/40">
          TON 618
        </p>
      </div>
    </div>
  );
}
