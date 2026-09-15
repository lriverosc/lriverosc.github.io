"use client";

import { usePathname } from "next/navigation";
import { usePerfProfile } from "@/hooks/use-perf-profile";

/**
 * TON 618 — the most massive black hole known — periodically dissolves into
 * the starfield background at screen center, then fades back out into it, on
 * an endless slow loop (see the `ton618-*` keyframes in globals.css). Pure
 * CSS opacity/transform, so it's effectively free to keep running; skipped
 * under reduced motion like every other purely decorative effect here.
 */
export default function BlackHole() {
  const pathname = usePathname();
  const isBlogPost = pathname?.startsWith("/blogs/") && pathname !== "/blogs";
  const { disableDecorative } = usePerfProfile();

  if (isBlogPost || disableDecorative) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 flex items-center justify-center">
      <div className="ton618-cycle relative aspect-square w-[clamp(220px,32vw,420px)]">
        {/* Accretion disk glow — screen-blended so it melts into the black
            background instead of sitting on top of it as a hard-edged shape. */}
        <div
          className="ton618-spin absolute inset-0 rounded-full blur-2xl"
          style={{
            background:
              "radial-gradient(circle, transparent 26%, rgba(255,158,66,0.4) 30%, rgba(255,94,0,0.18) 46%, transparent 70%)",
            mixBlendMode: "screen",
          }}
        />
        {/* Event horizon — solid dark core so the center reads as a void, not
            just a glowing ring. */}
        <div
          className="absolute inset-[8%] rounded-full"
          style={{ background: "radial-gradient(circle, #000 0%, #000 60%, transparent 100%)" }}
        />
        <p className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium uppercase tracking-[0.3em] text-white/40">
          TON 618
        </p>
      </div>
    </div>
  );
}
