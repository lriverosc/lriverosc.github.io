"use client";
import { config } from "@/data/config";
import SectionWrapper from "../ui/section-wrapper";
import { SectionHeader } from "./section-header";
import { ArrowUpRight, Mail } from "lucide-react";
import { Button } from "../ui/button";

export default function ContactSection() {
  return <SectionWrapper id="contact" className="mx-auto min-h-[85svh] max-w-7xl px-6 py-24">
    <SectionHeader id="contact" title={<>Construyamos<br />tu próxima solución</>} className="static mb-12" />
    <div className="max-w-xl rounded-3xl border border-border bg-background/95 p-6 backdrop-blur-lg md:p-10">
      <p className="text-sm uppercase tracking-widest text-primary">NeuralCore Software · Chile</p>
      <h3 className="mt-4 text-2xl font-bold">Hablemos de tu proyecto</h3>
      <p className="mt-4 leading-relaxed text-muted-foreground">¿Necesitas automatizar un proceso, desarrollar una aplicación o solicitar una demo? Escríbeme para conversar sobre tu equipo y tus objetivos. También puedes escribirme si quieres colaborar en alguno de estos proyectos o aportar ideas para mejorarlos.</p>
      <Button asChild className="mt-6 h-auto max-w-full whitespace-normal py-3"><a href={`mailto:${config.email}`}><Mail className="mr-2 size-4 shrink-0" />{config.email}</a></Button>
      <div className="mt-6 flex flex-wrap gap-6">{Object.entries(config.social).map(([name, href]) => <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm underline underline-offset-4">{name === 'github' ? 'GitHub' : 'LinkedIn'}<ArrowUpRight className="size-4" /></a>)}</div>
    </div>
  </SectionWrapper>;
}
