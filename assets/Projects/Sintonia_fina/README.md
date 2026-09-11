# Sintonía Fina

Sistema local-first para catastros semafóricos, compuesto por una aplicación
Flutter para tablet Android y una aplicación PySide6 para Windows y Linux.

## Versión de terreno

**Versión Android preparada:** `0.3.2+5`

**Última preparación de terreno:** 25 de agosto de 2026

La versión actual permite completar el flujo de un proyecto sin conexión:

- crear proyectos y sus planes horarios;
- capturar fotografías con sello visible de fecha, hora y ubicación;
- conservar fotografías en una cola persistente hasta recuperar conexión;
- analizar continuamente la cámara sin cambiar su orientación ni bloquear la vista;
- medir ciclos verde–verde o rojo–rojo;
- seleccionar el cabezal predominante e ignorar detecciones ocasionales de fondo;
- revisar y conservar las mediciones elegidas por el usuario;
- registrar acciones, archivos, mediciones y errores en un log de terreno;
- sincronizar proyectos, planes y fotografías con el computador por WiFi local.

El APK incorpora `record_iphone_tablet.mp4` como referencia reproducible de
desarrollo y validación. La vista de terreno nunca sustituye la cámara por ese
archivo: la detección operativa siempre procesa el stream real de CameraX.

## Estado comprobado

| Área | Estado |
|---|---|
| APK Android release | Compilada e instalada |
| Tablet validada | Samsung SM-X230, cámara posterior 720p |
| Vista de detección | Portrait bloqueado; sin inversión al iniciar medición |
| Barras del sistema Samsung | Protegidas mediante áreas seguras |
| Fotografías | Sello visual de fecha, hora, lugar y coordenadas |
| Análisis continuo | Activo desde que abre la cámara, antes del botón |
| Video durante detección | Desactivado para preservar orientación y fluidez; VideoCapture invertía el SurfaceView en SM-X230 |
| Registro persistente JSONL | Implementado y leído mediante ADB |
| Detección automática | EfficientDet-Lite0 + clasificador cromático |
| Pruebas Flutter | 12 aprobadas |
| Análisis estático Flutter | Sin incidencias |

La clasificación cromática fue comprobada sobre 666 muestras de
`record_iphone_tablet.mp4`: 100% de acierto para rojo, amarillo y verde tanto en
el archivo nativo como en transformaciones deterministas de menor luz, mayor
luz y menor saturación. La recaptura desde monitores no forma parte del flujo
de terreno ni se usa para calibrar el clasificador. Se reproduce con:

```bash
cd sintonia_app
python3 tool/validate_reference_video.py --json
```

Esta prueba valida el color cuando la caja de referencia es correcta. No
equivale a una validación estadística en terreno: distancia, contraluz, lluvia,
oclusiones y otros emplazamientos deben registrarse y auditarse. Ante falta de
confianza, la aplicación no debe inventar un ciclo automático.

## Uso recomendado en terreno

1. Trabajar con el semáforo real; no calibrar ni validar apuntando a una pantalla.
2. Mantener la tablet en portrait y encuadrar el cabezal completo, sin zoom digital.
3. Esperar a que aparezcan la caja principal y el color antes de iniciar la medición.
   La detección ya está activa: el botón inicia únicamente el reloj del ciclo.
4. Mantener el encuadre lo más estable posible durante dos o tres segundos después
   de cada cambio de luz, especialmente con lluvia, contraluz o baja iluminación.
5. Si la caja deja de rodear el cabezal o el estado permanece `INCIERTO`, repetir
   la toma y comprobar el ciclo manualmente. No aceptar un resultado dudoso.
6. Al terminar la jornada, rescatar el log JSONL antes de desinstalar la APK o
   borrar los datos de la aplicación.

La inferencia observada en la tablet tarda aproximadamente entre 0,6 y 0,9 s por
muestra. Por ello, la aplicación ayuda a medir y registrar ciclos, pero no
reemplaza la revisión profesional cuando se requiere determinar con exactitud el
instante de una transición. El comportamiento aún debe validarse estadísticamente
con distintos cabezales, distancias y condiciones meteorológicas reales.

## Registro de terreno

Android escribe un evento JSON por línea, con timestamp UTC, nivel, nombre del
evento y datos de contexto. No se registra cada frame para no afectar la fluidez.

Ruta en la tablet:

```text
/storage/emulated/0/Android/data/cl.sintonia.sintonia_app/files/field_logs/catastro_terreno.jsonl
```

Ejemplo de lectura:

```bash
adb shell cat /storage/emulated/0/Android/data/cl.sintonia.sintonia_app/files/field_logs/catastro_terreno.jsonl
```

El registro incluye inicio de la aplicación, cámara, detector, rendimiento,
cajas detectadas, cabezal elegido, capturas, ubicación, coordenadas, mediciones,
descartes, sincronizaciones y errores. Puede conservar eventos de grabación de
versiones anteriores, pero la versión de terreno actual no graba video durante
la detección. No se debe desinstalar la APK ni borrar sus datos antes de
rescatarlo.

## Android

```bash
cd sintonia_app
flutter pub get
flutter analyze
flutter test
flutter build apk --release
adb install -r build/app/outputs/flutter-apk/app-release.apk
```

El cliente usa la cámara posterior a 720p, estabilización cuando el dispositivo
la ofrece y análisis desacoplado a intervalos controlados. La detección comienza
al abrir la vista; el botón solo inicia el reloj de medición. La inferencia
ocupada descarta nuevos frames para evitar acumular trabajo y bloquear la vista.

Campos de medición persistidos en cada plan:

```text
ciclo_medido_segundos
ciclo_nominal_segundos
ciclo_confianza
ciclo_muestras
ciclo_modo
ciclo_medido_at
ciclo_video_local_path
```

`ciclo_video_local_path` se conserva por compatibilidad con registros antiguos;
en el flujo actual queda vacío porque VideoCapture está desactivado durante la
detección.

## Flujo técnico conforme al Capítulo 4

La ficha de cada plan incorpora trazabilidad incremental para el proceso
`situación vigente → observación → diagnóstico → ajuste propuesto → validación → resultado`.
Registra el ámbito (intersección aislada o red), ciclos vigente y propuesto,
número de visitas y antecedentes técnicos en texto. Los datos antiguos siguen
siendo válidos porque los campos nuevos son opcionales.

Las validaciones derivadas directamente del Manual de Señalización de Tránsito,
Capítulo 4, son:

- ciclo mínimo de 40 s y máximo de 120 s (sección 4.5.5.3); un valor superior
  solo puede registrarse declarando autorización excepcional de la UOCT;
- advertencia si se registran menos de dos visitas por período (sección 4.11.3);
- advertencia ante cambios de ciclo, ajustes sin diagnóstico previo o validación
  sin propuesta identificada (secciones 4.11.4 y 4.11.7);
- en redes, asistencia para respetar el orden ciclo → repartos → desfases
  (secciones 4.11.5.1 a 4.11.5.3).

Los repartos, desfases, colas, saturación, progresión y seguridad permanecen
como antecedentes y advertencias profesionales. La aplicación no pretende
reemplazar SIDRA, TRANSYT 8S, la modelación calibrada ni la aprobación UOCT.

### Detección

El adaptador usa EfficientDet-Lite0 para localizar `traffic light`. Fusiona
anclas duplicadas con el mismo centro, suaviza la caja por IoU y dibuja solamente
el cabezal principal. Dentro de esa caja, el mismo criterio HSV usado por el
analizador del video determina rojo, amarillo o verde. El seguimiento puede
readquirir el cabezal cuando este sale del cuadro.

Una exportación YOLO probada anteriormente no fue compatible con LiteRT en la
tablet y fue retirada del APK. No debe anunciarse YOLO como activo hasta contar
con un modelo compatible, validado y con licencia adecuada.

## Escritorio Windows y Linux

La aplicación desktop administra proyectos y planes, ejecuta el contrato local,
recibe cambios en tiempo real, descarga fotografías, presenta previsualización
y mantiene respaldos portátiles `.sintoniafina`.

La interfaz comparte ahora la iconografía conceptual de la tablet: acciones de
proyecto, planes, galería, sincronización, descarga, configuración, eliminación
e información usan PNG transparentes de alta resolución. Los botones principales
tienen mayor altura e iconos de 34 px.

Linux/Ubuntu:

```bash
cd sintonia_windows
./setup_linux.sh
./run_linux.sh
./build_linux_deb.sh 0.2.0 amd64
```

Windows:

```text
sintonia_windows\build_windows_exe.bat
```

PyInstaller distribuye `sintonia_windows/assets/`, incluido el nuevo paquete de
iconos.

## Arquitectura local-first

- El escritorio inicia un servidor HTTP/WebSocket embebido en `0.0.0.0:8765`.
- Android descubre el computador dentro de la WiFi privada.
- Los documentos se almacenan en SQLite/WAL y los binarios en `storage/`.
- No requiere Docker, Firebase, Appwrite ni servicios cloud.

Identificadores congelados:

```text
database:    sintonia-fina
collections: proyectos, planes, fotos
bucket:      fotos
```

Datos persistentes:

- Windows: `%LOCALAPPDATA%\SintoniaFina\`
- Linux: `${XDG_DATA_HOME:-$HOME/.local/share}/SintoniaFina/`

La base `data/base.sqlite3` y `data/storage/` forman un respaldo indivisible.
Consulta [Contrato_Embebido.MD](Contrato_Embebido.MD) y
[FORMATO_SINTONIA_FINA.md](FORMATO_SINTONIA_FINA.md) para detalles.
