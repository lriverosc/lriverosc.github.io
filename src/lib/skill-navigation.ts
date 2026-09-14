"use client";

/**
 * Bridges the 3D keyboard (animated-background.tsx) to the Projects section:
 * pressing a keycap dispatches this event so ProjectsSection can scroll to —
 * and highlight — the project that uses that technology, without the two
 * components needing a shared parent or context.
 */
export const SKILL_PROJECT_EVENT = "skill-project-navigate";

export interface SkillProjectDetail {
  /** Project id to jump to, or null when the pressed key has no single
   * associated project (falls back to scrolling to the Projects section). */
  projectId: string | null;
}

export function dispatchSkillProjectNavigate(projectId: string | null) {
  window.dispatchEvent(
    new CustomEvent<SkillProjectDetail>(SKILL_PROJECT_EVENT, { detail: { projectId } })
  );
}
