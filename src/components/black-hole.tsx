"use client";

import { usePathname } from "next/navigation";
import { TON618_ASCII } from "@/data/ton618-ascii";

/**
 * TON 618 — pure-CSS ASCII rendition that slowly resolves out of the dark
 * background in the upper-right corner, above where the 3D keyboard roams,
 * holds fully visible for a few seconds, then dissolves back into the
 * starfield — on an endless ~20s loop (`ton618-ascii-cycle` /
 * `ton618-text-cycle` in globals.css). No image, no Canvas/WebGL: just
 * opacity/filter(blur)/transform, so it costs effectively nothing to keep
 * running. Under `prefers-reduced-motion` the sitewide rule in globals.css
 * (animation-duration collapsed to ~0, one iteration, no fill-mode) leaves
 * it at its resting state — fully visible, unblurred — instead of hiding it.
 */
export default function BlackHole() {
  const pathname = usePathname();
  const isBlogPost = pathname?.startsWith("/blogs/") && pathname !== "/blogs";

  if (isBlogPost) return null;

  return (
    <div className="pointer-events-none fixed right-[4%] top-[6%] -z-10 max-w-[clamp(190px,30vw,360px)] overflow-hidden sm:right-[6%] sm:top-[8%]">
      <pre
        aria-hidden="true"
        className="ton618-ascii-cycle select-none whitespace-pre leading-[1.05] text-white/45"
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", "Courier New", monospace',
          fontSize: "clamp(3.4px, 2.2px + 0.6vw, 6px)",
          textShadow: "0 0 8px rgba(255,255,255,0.06)",
          willChange: "opacity, transform, filter",
        }}
      >
        {TON618_ASCII}
      </pre>
      <div className="ton618-text-cycle text-center">
        <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.25em] text-white/55">TON 618</p>
        <p className="mt-1 text-[9px] text-white/30">≈ 10.4 mil millones de años luz de distancia</p>
      </div>
    </div>
  );
}
