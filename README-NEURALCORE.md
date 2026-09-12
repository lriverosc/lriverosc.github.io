# Luis Riveros · NeuralCore Software

Portafolio adaptado al diseño 3D original, con el contenido de `fusion_portafolio/lriverosc.github.io-main`.

## Desarrollo

```sh
npm install
npm run dev
```

Para producción: `npm run build` y `npm start`. Esta aplicación Next.js requiere un servidor compatible; la carpeta fuente de GitHub Pages se conserva como referencia.

## Contenido

- `src/data/config.ts`: identidad, correo, redes, dominio y CV.
- `src/data/portfolio.ts`: seis áreas, seis proyectos destacados, proyectos adicionales, perfil y servicios, extraídos del portafolio original.
- `src/data/keyboard.json`: las 24 tecnologías y su correspondencia con las 24 teclas físicas.
- `public/assets/luis`: fotografía, CV, video y recursos del portafolio original.
- `public/assets/neuralcore-keyboard.spline`: variante personalizada, con iconos incrustados. El modelo original permanece en `skills-keyboard.spline`.

Los identificadores internos de las teclas se conservan para mantener las animaciones y eventos de Spline. La propiedad `label` define la tecnología que ve el visitante al interactuar. Los iconos de la lista HTML y del teclado se generan desde la misma correspondencia. Las teclas muestran únicamente símbolos grandes, sin etiquetas; las tecnologías con marcas basadas en letras usan pictogramas de su función. En proyectos, una onda discreta recorre el teclado en lugar de la animación del gato.

Para regenerar los iconos y el modelo:

```sh
node scripts/generate-technology-icons.mjs
node scripts/adapt-keyboard.mjs
```

El segundo script depende del códec de la versión instalada de Spline y valida las 24 texturas después de serializarlas. Las fuentes y el motor WASM se sirven localmente.

## Contacto y despliegue

El contacto público abre el correo `lriveros360@gmail.com`, como en el portafolio fuente. No requiere un servicio de envío. La API opcional solo funciona al configurar `RESEND_API_KEY` y `RESEND_FROM` con un remitente verificado.

`NEXT_PUBLIC_SITE_URL` define el dominio canónico; por defecto usa `https://lriverosc.github.io`. El CV y el video conservan los archivos originales. No se publican artículos, historial laboral ni enlaces sociales del autor de la plantilla.

La interfaz conserva el modo claro/oscuro y la opción para reducir movimiento. En ese modo las 24 tecnologías se muestran como una lista HTML visible.

## Créditos

Diseño 3D base: [3d-portfolio de Naresh Khatri](https://github.com/Naresh-Khatri/3d-portfolio). Contenido profesional y proyectos: Luis Riveros / NeuralCore Software. Iconos de tecnologías: las colecciones incluidas en `react-icons`; los derechos sobre las marcas corresponden a sus titulares. Las licencias de las fuentes se incluyen en `public/assets/fonts`.
