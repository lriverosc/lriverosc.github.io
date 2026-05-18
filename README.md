# Portafolio Profesional de Luis Riveros

Sitio web estático de portafolio profesional creado en HTML, CSS y JavaScript puro. Está pensado para presentar el perfil de Luis Riveros, sus proyectos destacados, áreas de trabajo, enlaces profesionales y datos de contacto en un formato listo para GitHub Pages o publicación directa.

## Archivos del proyecto

- `index.html`: estructura principal del sitio.
- `style.css`: estilos visuales, responsive y animaciones.
- `script.js`: comportamiento del menú móvil, scroll suave, animación de aparición y botón para volver arriba.
- `assets/`: carpeta de recursos visuales y CV.
- `assets/trafficflow.png`
- `assets/downloader.png`
- `assets/gpx.png`
- `assets/github.png`
- `assets/cv-luis-riveros.pdf`

## Cómo abrirlo localmente

1. Descarga o clona este repositorio.
2. Verifica que la carpeta `assets/` esté en la raíz del proyecto.
3. Abre `index.html` directamente en tu navegador.

No requiere instalación de dependencias ni servidor backend.

## Cómo editar los links de GitHub, LinkedIn y CV

Los enlaces principales están definidos en `index.html`.

- GitHub:
  Busca `https://github.com/lriverosc` y reemplázalo si es necesario.
- LinkedIn:
  Busca `https://www.linkedin.com/in/luis-riveros-ai-engineer/` y reemplázalo si necesitas actualizar tu perfil real.
- CV:
  El botón `Ver CV` apunta a `assets/cv-luis-riveros.pdf`. Si cambias el archivo, actualiza la ruta en el enlace correspondiente.

## Cómo publicarlo con GitHub Pages

1. Sube este proyecto a un repositorio de GitHub.
2. Ve a `Settings`.
3. Entra a `Pages`.
4. En `Build and deployment`, selecciona `Deploy from a branch`.
5. Elige la rama principal, por ejemplo `main`.
6. Selecciona la carpeta raíz `/ (root)`.
7. Guarda los cambios.

GitHub Pages publicará el sitio usando `index.html` como página principal.

## Estructura esperada de carpetas

```text
portfolio-luis-riveros/
├── index.html
├── style.css
├── script.js
├── README.md
└── assets/
    ├── trafficflow.png
    ├── downloader.png
    ├── gpx.png
    ├── github.png
    └── cv-luis-riveros.pdf
```

## Edición rápida del contenido

- Textos de secciones: `index.html`
- Colores, tarjetas y responsive: `style.css`
- Interacciones y animaciones: `script.js`

## Publicación y mantenimiento

El proyecto está diseñado para funcionar sin dependencias externas, con rutas relativas y estructura simple para edición rápida, mantenimiento manual y despliegue estático.
