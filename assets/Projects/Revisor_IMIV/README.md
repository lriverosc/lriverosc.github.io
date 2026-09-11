# Revisor IMIV 1.1.0

Aplicación de escritorio para revisar **IMIV intermedio** con la pauta MTT entregada por el ente revisor. Automatiza conteos y genera el consolidado de observaciones en Word y PDF, conservando la decisión técnica del revisor.

## Entrega completa, sin restricciones de uso

Esta versión elimina el modo DEMO: **no hay límite de exportaciones, contador, vencimiento por fecha, activación ni suscripción**. Todas las funciones implementadas están habilitadas. Un contador agotado o dañado de una versión anterior no afecta esta entrega: la aplicación ya no lo consulta.

El alcance funcional es la revisión intermedia de la pauta suministrada. “Completa” se refiere al uso sin restricciones de ese alcance. No significa certificación normativa ni incluye plantillas Básico/Mayor o un generador del informe IMIV completo.

**Autor:** Luis Riveros — Ingeniero en Informática con mención en Desarrollo de Software.
**Contacto:** lriveros360@gmail.com.
**About:** Licencia: Completa · Sin límite de exportaciones.

## Paquete para enviar al revisor

Por decisión del editor, esta entrega se distribuye **sin firma digital**. La firma es opcional en el proceso de construcción y no bloquea la generación del paquete.

Entregar **[DIST/setup.exe](DIST/setup.exe)**. Ese único archivo incluye la aplicación y sus dependencias, con asistente en español, selección de carpeta, acceso directo y desinstalador. `DIST/LEEME.txt` contiene la guía breve; `DIST/setup.sha256` y `DIST/signature-status.json` permiten comprobar la integridad y el estado de firma.

Se registró un bloqueo previo de Smart App Control en este equipo. Distribuir sin firma no garantiza que Windows permita ejecutar el instalador en todos los equipos. No se modifican las protecciones de Windows. La opción de firmar posteriormente está documentada en [tools/installer/SIGNING.md](tools/installer/SIGNING.md).

Requisitos: Windows 10 (1809 o posterior) o Windows 11, x64. No es necesario instalar .NET, SDK, Visual Studio ni Microsoft Office. Funciona sin Internet. Para visualizar Word/PDF se necesita un lector compatible.

1. Ejecutar `setup.exe` y autorizar la instalación en Windows.
2. Seleccionar la carpeta de instalación.
3. Elegir si se crea el acceso directo en el escritorio.
4. Instalar y abrir **Revisor IMIV**.

El instalador conserva el identificador de la aplicación para actualizar versiones anteriores y retira los accesos directos antiguos conocidos de la demo. En una instalación nueva, la carpeta propuesta es `Program Files\Revisor IMIV`; al actualizar puede conservar la carpeta anterior, que se puede revisar en el asistente.

Para desinstalar, usar **Configuración → Aplicaciones → Revisor IMIV**, el acceso del menú Inicio o `unins000.exe` en la carpeta instalada. Las revisiones guardadas y los documentos exportados se conservan.

## Funciones disponibles

- Revisión nueva con proyecto, ID SEIM, titular y consultor vacíos; páginas y observaciones vacías; avance **0 %**.
- Pauta con **306 requisitos y 404 comprobaciones**, con referencia a tabla/fila del modelo Word y conteos contrastados con Excel.
- Estados Pendiente, Cumple, Incompleto, No cumple, No aplica y No se indica.
- Revisión separada de Informe y Plano cuando corresponde; los requisitos solo de plano no cuentan un informe ficticio.
- Conteos automáticos al editar estados; resumen general y del capítulo; actualización adicional con F5.
- Archivo → Nueva, Abrir, Guardar y Guardar como, con confirmación antes de descartar cambios.
- Guardado local en JSON, en la ubicación elegida. Se propone `%LOCALAPPDATA%\RevisorIMIV`.
- Vista real del consolidado y exportaciones ilimitadas a Word (`.docx`) y PDF (`.pdf`).
- Ajuste de texto largo y paginación A4 del PDF.
- Guardado y exportación mediante archivos temporales: un fallo de generación no sustituye el documento previo por uno incompleto.
- Tema claro/oscuro, guía rápida y About con contacto del autor.

La ventana principal **inicia maximizada**, permite restaurar, maximizar y cambiar su tamaño, y usa una dimensión de referencia de 1920 × 1080 ajustada al área de trabajo de Windows. El checklist central aprovecha el ancho disponible y mantiene scroll vertical. El resumen está completo, compacto y **sin scrollbar**. La navegación por capítulos puede desplazarse cuando la altura lo requiere.

## Flujo de trabajo

1. Completar los datos del proyecto.
2. Elegir un capítulo, revisar cada requisito y registrar estados, páginas y observaciones.
3. Comprobar el resumen general y del capítulo.
4. Guardar la revisión y reabrirla desde Archivo cuando se desee continuar.
5. Consultar **Ver consolidado**.
6. Generar Word o PDF, elegir la ubicación y decidir si se abre el resultado.

El checklist completo es de uso interno. El consolidado incluye solo los requisitos observados —Incompleto, No cumple o No se indica— con artículo, contexto, página, estados y observación. Un Pendiente no se convierte automáticamente en una observación técnica.

Antes de exportar se exige nombre del proyecto, ID SEIM, alguna comprobación revisada y observación para cada requisito observado. Estas validaciones protegen el contenido del documento; no limitan la licencia. Una revisión parcial requiere confirmación y se identifica como parcial en el documento.

**Avance** mide comprobaciones revisadas, no aprobación. **Resueltos** suma Cumple y No aplica. La aplicación no rechaza ni aprueba automáticamente el proyecto.

## Pauta y reserva de los documentos

| Etapa del Excel | Comprobaciones |
| --- | ---: |
| Objetivo y definiciones iniciales | 38 |
| Situación actual | 199 |
| Situación base | 4 |
| Situación con proyecto, mitigaciones y planos | 163 |
| Total | **404** |

Los originales de `docs/reference/` son reservados: no se modifican ni se incluyen en el instalador. La plantilla contiene requisitos genéricos, sin la ficha, las respuestas, las páginas ni las observaciones del caso real.

La comparación detallada con los cuatro documentos está en [docs/REVISION_FLUJO.md](docs/REVISION_FLUJO.md). Quedan decisiones técnicas por confirmar con el revisor, como diferencias de redacción, incisos sin conteo y alcance de otros organismos. También debe aprobar la presentación del consolidado para su uso institucional.

## Construcción y validación

Tecnología: C#/.NET 8, WPF, MVVM, JSON local, DOCX y PDF nativos. La publicación es `win-x64`, autocontenida y sin trimming.

Para desarrollar se necesita el SDK de .NET 8 o compatible. Para construir el instalador se necesita Inno Setup 6. Estas herramientas solo se requieren en el equipo de desarrollo.

```powershell
dotnet restore RevisorIMIV.sln
dotnet build RevisorIMIV.sln --configuration Release
dotnet test tests/RevisorIMIV.Tests/RevisorIMIV.Tests.csproj --configuration Release
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\Build-Installer.ps1
```

Si Inno Setup está en otra ubicación:

```powershell
.\tools\Build-Installer.ps1 -IsccPath 'C:\Program Files (x86)\Inno Setup 6\ISCC.exe'
```

El script reconstruye, prueba, publica la aplicación autocontenida y genera DIST/setup.exe. Por defecto publica sin firma; también acepta -AllowUnsigned explícitamente. Si se indica -CertificateThumbprint, firma y verifica la aplicación, el instalador y el desinstalador antes de publicar.

Comprobaciones de esta entrega:

- 13 pruebas automatizadas: inicio en 0 %, conteos de Word/Excel, recursos, guardado/reapertura, consolidado, paginación y protección de archivos ante fallos/cancelaciones.
- Doce exportaciones consecutivas de Word/PDF sin límite, con comprobación de los archivos generados.
- Construcción y renderizado de la interfaz en cuatro tamaños, de 1180 × 700 a 1920 × 1040 unidades lógicas: resumen completo y checklist desplazable.
- Detalle de empaquetado, arranque y límites de la validación en [tools/installer/VALIDATION.md](tools/installer/VALIDATION.md).

El instalador no tiene firma digital de editor y falta la prueba final en un Windows recién instalado. Las políticas de firma de un equipo pueden impedir su ejecución; no se modifican las políticas de Windows.

## Evolución fuera del alcance actual

Historial de versiones, editor de checklist, otras categorías de IMIV y plantillas institucionales configurables no están implementados. Las ideas y el prompt de evolución se conservan en [docs/PROMPT_DESARROLLO.md](docs/PROMPT_DESARROLLO.md).
