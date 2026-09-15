const config = {
  title: "Luis Riveros | NeuralCore Software",
  description: {
    long: "Portafolio de Luis Riveros, Ingeniero en Informática y fundador de NeuralCore Software. Desarrollo de software a medida para cualquier tipo de proyecto: aplicaciones de escritorio, apps móviles, automatización de procesos, IA y visión por computadora.",
    short: "Desarrollo de software a medida: aplicaciones, automatización de procesos e IA para cualquier tipo de proyecto.",
  },
  keywords: ["Luis Riveros", "NeuralCore Software", "desarrollo de software", "software a medida", "Python", "Flutter", "automatización", "visión por computadora", "Chile"],
  author: "Luis Riveros",
  email: "lriveros360@gmail.com",
  site: process.env.NEXT_PUBLIC_SITE_URL || "https://lriverosc.github.io",
  githubUsername: "lriverosc",
  githubRepo: "",
  resume: "/assets/luis/cv-luis-riveros.pdf",
  get ogImg() { return this.site + "/assets/luis/trafficflow.png"; },
  social: {
    linkedin: "https://www.linkedin.com/in/luis-riveros-ai-engineer/",
    github: "https://github.com/lriverosc",
  },
};
export { config };
