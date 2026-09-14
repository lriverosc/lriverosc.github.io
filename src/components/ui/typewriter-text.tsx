"use client";

import { useEffect, useState } from "react";
import { usePerfProfile } from "@/hooks/use-perf-profile";
import { cn } from "@/lib/utils";

interface TypewriterTextProps {
  phrases: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
}

/** Cycles through `phrases`, typing and deleting each one. Falls back to a
 * static first phrase under reduced motion. */
export function TypewriterText({
  phrases,
  className,
  typingSpeed = 55,
  deletingSpeed = 28,
  pauseDuration = 1800,
}: TypewriterTextProps) {
  const { disableDecorative, ready } = usePerfProfile();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!ready || disableDecorative || phrases.length === 0) return;
    const current = phrases[phraseIndex % phrases.length];

    if (!deleting && text === current) {
      const timeout = setTimeout(() => setDeleting(true), pauseDuration);
      return () => clearTimeout(timeout);
    }
    if (deleting && text === "") {
      setDeleting(false);
      setPhraseIndex((i) => (i + 1) % phrases.length);
      return;
    }

    const timeout = setTimeout(
      () => setText(deleting ? current.slice(0, text.length - 1) : current.slice(0, text.length + 1)),
      deleting ? deletingSpeed : typingSpeed
    );
    return () => clearTimeout(timeout);
  }, [ready, disableDecorative, text, deleting, phraseIndex, phrases, typingSpeed, deletingSpeed, pauseDuration]);

  if (!ready) return <span className={className}>{phrases[0]}</span>;

  if (disableDecorative) return <span className={className}>{phrases[0]}</span>;

  return (
    <span className={className}>
      {text}
      <span
        aria-hidden
        className={cn("ml-0.5 inline-block w-[2px] translate-y-[0.1em] bg-current align-middle animate-pulse")}
        style={{ height: "1em" }}
      />
    </span>
  );
}
