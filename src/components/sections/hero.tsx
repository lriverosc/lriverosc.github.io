"use client";
import Link from "next/link";
import { File, ArrowUpRight } from "lucide-react";
import { SiGithub, SiLinkedin } from "react-icons/si";
import { Button } from "../ui/button";
import { BlurIn } from "../reveal-animations";
import { config } from "@/data/config";
import SectionWrapper from "../ui/section-wrapper";
import ScrollDownIcon from "../scroll-down-icon";
import BlackHole from "../black-hole";

export default function HeroSection() {
  return <SectionWrapper id="hero" className="relative min-h-[100svh] w-full">
    <div className="grid min-h-[100svh] lg:grid-cols-2">
      <div className="relative z-[2] flex min-w-0 flex-col justify-start px-6 pb-6 pt-28 md:px-12 lg:justify-center lg:pb-24 lg:px-20">
        <BlurIn delay={0.3}>
          <p className="mb-5 text-xs font-medium uppercase tracking-[0.25em] text-primary">NeuralCore · Software / Chile</p>
          <h1 className="font-display text-[clamp(3.5rem,7vw,7rem)] font-bold leading-[1.05] tracking-tight">Luis<br />Riveros</h1>
          <p className="mt-6 min-h-[3.25rem] text-xl font-medium text-foreground sm:min-h-[1.75rem]">Ingeniero en Informática</p>
          <p className="mt-3 max-w-lg text-lg font-semibold text-primary">Código con propósito. Ingeniería para resolver.</p>
          <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">Desarrollo software, automatización y soluciones con inteligencia artificial para transformar necesidades reales en sistemas funcionales.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button asChild><Link href="/#projects">Ver proyectos <ArrowUpRight className="ml-2 size-4" /></Link></Button>
            <Button asChild variant="outline"><Link href="/resume"><File className="mr-2 size-4" />Ver CV</Link></Button>
          </div>
          <div className="mt-5 flex items-center gap-4 text-sm">
            <a href={config.social.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub de Luis Riveros" className="rounded p-2 hover:text-primary"><SiGithub size={22} /></a>
            <a href={config.social.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn de Luis Riveros" className="rounded p-2 hover:text-primary"><SiLinkedin size={22} /></a>
            <Link href="/#contact" className="underline underline-offset-4">Hablemos de tu proyecto</Link>
          </div>
        </BlurIn>
      </div>
      <div className="relative z-[2] flex min-w-0 items-center px-3 pb-16 md:px-8 lg:py-24 lg:pl-0 lg:pr-6">
        <BlackHole />
      </div>
    </div>
    <div className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block"><ScrollDownIcon /></div>
  </SectionWrapper>;
}
