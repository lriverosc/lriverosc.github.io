const config = {
  title: "Luis Riveros | NeuralCore Software",
  description: {
    long: "Portafolio de Luis Riveros, Ingeniero en Informática y fundador de NeuralCore Software. Aplicaciones multiplataforma, automatización con IA, visión por computadora y soluciones para ingeniería de tránsito en Chile.",
    short: "Software para terreno y gabinete: apps multiplataforma, automatización con IA e ingeniería de tránsito.",
  },
  keywords: ["Luis Riveros", "NeuralCore Software", "Python", "Flutter", "automatización", "visión por computadora", "ingeniería de tránsito", "Chile"],
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
