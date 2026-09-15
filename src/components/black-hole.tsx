"use client";

import { usePathname } from "next/navigation";
import { usePerfProfile } from "@/hooks/use-perf-profile";

/**
 * TON 618 — the most massive black hole known — periodically resolves into
 * view above the horizon on the upper right, holds for a moment with a
 * sharply-defined event horizon (Gargantua-style, from Interstellar), then
 * dissolves back into the starfield. Endless slow loop, pure CSS
 * opacity/transform (see the `ton618-*` keyframes in globals.css), skipped
 * under reduced motion like every other purely decorative effect here.
 *
 * Deliberately kept away from center: the 3D keyboard scene (an opaque WebGL
 * canvas) roams through the middle of the screen across sections and would
 * otherwise paint right over it.
 */
export default function BlackHole() {
  const pathname = usePathname();
  const isBlogPost = pathname?.startsWith("/blogs/") && pathname !== "/blogs";
  const { disableDecorative } = usePerfProfile();

  if (isBlogPost || disableDecorative) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed right-[6%] top-[10%] -z-10 hidden sm:right-[9%] sm:top-[12%] md:block"
    >
      <div className="ton618-cycle relative aspect-square w-[clamp(160px,18vw,260px)]">
        {/* Ambient glow — soft and screen-blended so it melts into the sky. */}
        <div
          className="absolute inset-[-40%] rounded-full blur-3xl"
          style={{
            background: "radial-gradient(circle, rgba(255,196,120,0.35), transparent 65%)",
            mixBlendMode: "screen",
          }}
        />
        {/* Photon ring — bright and sharp-edged, the "well-defined event
            horizon" look, slowly swirling like an accretion disk. */}
        <div
          className="ton618-spin absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(255,238,210,0.95), rgba(255,175,90,0.75) 25%, rgba(255,238,210,0.95) 50%, rgba(255,150,60,0.6) 75%, rgba(255,238,210,0.95) 100%)",
            WebkitMaskImage: "radial-gradient(circle, transparent 39%, #000 41%, #000 50%, transparent 52%)",
            maskImage: "radial-gradient(circle, transparent 39%, #000 41%, #000 50%, transparent 52%)",
          }}
        />
        {/* Event horizon — a flat, opaque void with a hard edge against the
            ring, not a soft gradient smear. */}
        <div className="absolute inset-[9%] rounded-full bg-black" />
        <p className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.3em] text-white/40">
          TON 618
        </p>
      </div>
    </div>
  );
}
