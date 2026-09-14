"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { categories } from "@/data/portfolio";
import { config } from "@/data/config";
import { useLenis } from "@/lib/lenis";
import { SKILL_PROJECT_EVENT, type SkillProjectDetail } from "@/lib/skill-navigation";
import SectionWrapper from "../ui/section-wrapper";
import { SectionHeader } from "./section-header";
import { Button } from "../ui/button";
import { ResponsiveDialog, ResponsiveDialogTrigger, ResponsiveDialogContent, ResponsiveDialogTitle, ResponsiveDialogDescription } from "../ui/responsive-dialog";
import { AnimatedHighlight } from "../ui/animated-highlight";

const projectAnchorId = (id: string) => `project-${id}`;

export default function ProjectsSection() {
  const [openProjectId, setOpenProjectId] = useState<string | null>(null);
  const lenis = useLenis();

  // Pressing a key on the 3D keyboard dispatches this: jump to (scroll +
  // open) the project built with that technology, like following a link, or
  // just scroll to the section header when a key has no single associated
  // project.
  useEffect(() => {
    const handleNavigate = (e: Event) => {
      const { projectId } = (e as CustomEvent<SkillProjectDetail>).detail;
      const target = document.getElementById(projectId ? projectAnchorId(projectId) : "projects");
      if (!target) return;

      if (lenis) lenis.scrollTo(target, { offset: -96, duration: 1.2 });
      else target.scrollIntoView({ behavior: "smooth", block: "center" });

      if (projectId) {
        // Give the scroll a moment to land before the dialog pops in, so it
        // doesn't jump the page underneath an already-open modal.
        setTimeout(() => setOpenProjectId(projectId), 350);
      }
    };
    window.addEventListener(SKILL_PROJECT_EVENT, handleNavigate);
    return () => window.removeEventListener(SKILL_PROJECT_EVENT, handleNavigate);
  }, [lenis]);

  return <SectionWrapper id="projects" className="mx-auto max-w-7xl px-6 py-24">
    <SectionHeader id="projects" title="Proyectos" desc="Software a medida para clientes y proyectos reales. Conoce las soluciones y solicita una demo para tu equipo." className="static mb-16" />
    <div className="space-y-16">{categories.map(category => <div key={category.title}>
      <div className="mb-6 max-w-3xl rounded-2xl bg-background/90 p-5 backdrop-blur-md"><h3 className="text-xl font-bold md:text-2xl">{category.title}</h3><p className="mt-2 text-muted-foreground">{category.description}</p></div>
      {category.projects.length > 0 && <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{category.projects.map(project => <div key={project.id} id={projectAnchorId(project.id)} className="scroll-mt-24 rounded-2xl transition-shadow duration-300">
        <ResponsiveDialog open={openProjectId === project.id} onOpenChange={(open) => setOpenProjectId(open ? project.id : null)}>
        <ResponsiveDialogTrigger className="group flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-background/95 text-left transition-colors hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
          <div className="relative aspect-[3/2] w-full overflow-hidden bg-slate-950"><Image src={project.image} alt={project.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" className={project.image.endsWith('.svg') ? 'object-contain p-12 transition-transform group-hover:scale-105' : 'object-cover transition-transform group-hover:scale-105'} />{project.video && <span className="absolute bottom-4 left-4 rounded-full bg-black/80 px-3 py-1 text-xs text-white">Ver demostración en video</span>}</div>
          <div className="flex flex-1 flex-col p-6"><h4 className="text-xl font-bold">{project.title}</h4><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{project.description}</p>{project.highlight && <p className="mt-4 text-sm font-medium text-primary"><AnimatedHighlight text={project.highlight} /></p>}<span className="mt-5 flex items-center gap-2 text-sm">Explorar proyecto <ArrowUpRight className="size-4" /></span></div>
        </ResponsiveDialogTrigger>
        <ResponsiveDialogContent className="max-h-[90dvh] overflow-y-auto md:max-w-3xl">
          <ResponsiveDialogTitle className="pr-6 text-2xl">{project.title}</ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="text-base leading-relaxed">{project.description}</ResponsiveDialogDescription>
          {project.video ? <video controls playsInline preload="none" poster={project.image} className="my-4 w-full rounded-xl" aria-label="Demostración de TrafficFlow AI"><source src={project.video} type="video/mp4" />Tu navegador no permite reproducir este video.</video> : <div className="relative my-4 aspect-video rounded-xl bg-slate-950"><Image src={project.image} alt={project.title} fill sizes="768px" className="object-contain p-6" /></div>}
          {project.highlight && <p className="rounded-xl border border-border p-4 text-sm"><AnimatedHighlight text={project.highlight} /></p>}
          <p className="my-4 text-sm text-muted-foreground">Solución disponible a medida. Coordinemos una demo para conocer las necesidades de tu equipo.</p>
          <Button asChild><a href={`mailto:${config.email}?subject=${encodeURIComponent('Demo: ' + project.title)}`}>Solicitar una demo <ArrowUpRight className="ml-2 size-4" /></a></Button>
        </ResponsiveDialogContent>
        </ResponsiveDialog>
      </div>)}</div>}
      {category.archive.length > 0 && <details className="mt-6 rounded-2xl border border-border bg-background/95 p-5"><summary className="cursor-pointer font-medium">{category.projects.length ? 'Más proyectos del área' : 'Explorar proyectos'} · {category.archive.length}</summary><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{category.archive.map(project => <article key={project.title} className="rounded-xl bg-secondary/50 p-4"><h4 className="break-words text-sm font-medium">{project.title}</h4><p className="mt-2 text-sm text-muted-foreground">{project.description}</p></article>)}</div></details>}
    </div>)}</div>
  </SectionWrapper>;
}
