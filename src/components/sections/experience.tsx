"use client";
import Image from "next/image";
import { profile, services } from "@/data/portfolio";
import SectionWrapper from "../ui/section-wrapper";
import { SectionHeader } from "./section-header";
import { AnimatedHighlight } from "../ui/animated-highlight";

export default function ExperienceSection() {
  return <>
    <SectionWrapper id="about" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeader id="about" title="Sobre mí" desc="Soluciones reales, validadas en terreno." className="static mb-12" />
      <div className="grid items-center gap-8 rounded-3xl border border-border bg-background/90 p-6 backdrop-blur-xl md:grid-cols-[180px_1fr] md:p-10">
        <Image src="/assets/luis/icons/my_picture.png" alt="Luis Riveros, fundador de NeuralCore Software" width={180} height={180} className="mx-auto aspect-square rounded-2xl object-cover" />
        <div><p className="mb-3 text-sm uppercase tracking-widest text-primary">Ingeniería + software + IA</p><p className="leading-relaxed text-muted-foreground">{profile}</p></div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[['181', 'registros de catastro en El Milagro'], ['621', 'puntos GPS levantados en terreno'], ['404', 'comprobaciones automatizadas en Revisor IMIV']].map(([number, label]) => <div key={number} className="rounded-2xl border border-border bg-background/90 p-6"><p className="font-display text-4xl font-bold"><AnimatedHighlight text={number} loop /></p><p className="mt-2 text-sm text-muted-foreground">{label}</p></div>)}
      </div>
    </SectionWrapper>
    <SectionWrapper id="services" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeader id="services" title="Servicios" desc="Capacidades para consultoría, operación y prototipado." className="static mb-12" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{services.map((service, i) => <article key={service} className="rounded-2xl border border-border bg-background/90 p-6 backdrop-blur-md"><span className="text-sm text-primary">0{i + 1}</span><h3 className="mt-4 text-base font-medium leading-relaxed">{service}</h3></article>)}</div>
    </SectionWrapper>
  </>;
}
