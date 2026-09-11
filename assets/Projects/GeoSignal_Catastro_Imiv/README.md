# GeoSignal Catastro

GeoSignal Catastro es un sistema local y autónomo para levantamientos IMIV. Está
formado por una aplicación Flutter Android para terreno y una aplicación de
escritorio para gabinete. Actualmente funciona sin Docker, sin Appwrite
self-hosted y sin servicios externos obligatorios.

## Requisitos

- **Android**: Flutter 3.44+ (canal stable, incluye el SDK de Dart), Android
  SDK con `minSdk 24`, y un dispositivo o emulador con servicios de
  ubicación (GPS) para probar tracking/captura.
- **Escritorio**: Python 3.11+ (probado con 3.14), `pip`. En Linux, las
  librerías de sistema que necesita Qt WebEngine (parte de PySide6) según
  la distro (ej. `libgl1`, `libnss3`, `libxkbcommon0`).
- **Común**: Git, y `adb` (Android Platform Tools) si vas a instalar en un
  dispositivo físico por USB.

## Estructura del repositorio

```text
app_catastro/
├── catastro_app/                  App Android (Flutter/Dart)
│   ├── lib/                           código fuente (screens, services, models, widgets)
│   ├── android/                       proyecto Android nativo (minSdk, permisos, etc.)
│   ├── assets/                        iconos, modelo 3D del caminante, branding
│   ├── test/                          tests Flutter
│   └── pubspec.yaml                    dependencias Flutter/Dart
├── catastro_windows/               App de escritorio (Python/PySide6), Windows y Linux
│   ├── app/
│   │   ├── main_window.py              ventana principal
│   │   ├── tabs/                       paneles Proyecto y Sincronizar
│   │   ├── services/                   embedded_runtime, appwrite_service, exportadores
│   │   ├── widgets/                    diálogos y componentes reutilizables
│   │   └── models/                     modelos de datos
│   ├── main.py                        punto de entrada
│   ├── requirements.txt                dependencias Python
│   ├── appwrite_config.json            IDs compartidos del contrato embebido
│   ├── config.json                     configuración local (se genera al primer uso)
│   ├── geosignal_state/                runtime local: SQLite, fotos, log
│   └── tests/                         tests Python (pytest)
├── Contrato_Embebido.MD           especificación del contrato HTTP/WebSocket Android↔escritorio
├── FORMATO_GEOSIGNAL.md           especificación del archivo portátil .geosignal
├── catastro_windows_build.spec    empaquetado PyInstaller para Windows
├── catastro_linux_build.spec      empaquetado PyInstaller para Linux
└── habilitar_firewall_geosignal_local.{ps1,sh}   abre el puerto 8765 en el firewall
```

## Puesta en marcha, paso a paso

1. **Clonar el repositorio.**
   ```bash
   git clone <url-del-repo>
   cd app_catastro
   ```
2. **Preparar la app Android.**
   ```bash
   cd catastro_app
   flutter pub get
   flutter analyze
   flutter build apk --debug
   ```
   Con la tablet/celular conectado por USB y depuración USB activada:
   ```bash
   adb devices
   adb install -r build/app/outputs/flutter-apk/app-debug.apk
   ```
3. **Preparar la app de escritorio.**
   ```bash
   cd ../catastro_windows
   python3 -m venv .venv
   ./.venv/bin/python -m pip install -r requirements.txt
   ./.venv/bin/python -m pytest -q
   ./.venv/bin/python main.py
   ```
   En Windows se usan los equivalentes dentro de `.venv\Scripts\`.
4. **Conectar ambas apps.**
   - Tablet y computador deben estar en la misma red WiFi/LAN (un router o
     hotspot local alcanza, no se necesita Internet).
   - Habilitar el puerto `8765/TCP` en el firewall del computador
     (`habilitar_firewall_geosignal_local.sh` en Linux,
     `habilitar_firewall_geosignal_local.ps1` en Windows).
   - La app de escritorio muestra la IP que la tablet debe usar en el chip
     de estado de la barra superior; Android la detecta solo si ambos
     dispositivos están en la misma red.
5. **Primer uso.**
   - En Android: crear un proyecto, definir el técnico, capturar y/o
     iniciar un recorrido.
   - En el escritorio: abrir el proyecto en el panel izquierdo →
     "Sincronizar carpeta" para traer lo pendiente → "Exportar proyecto
     completo" cuando corresponda cerrar el trabajo (genera DOCX, CSV,
     Excel de bitácora y KMZ).

Para comandos de desarrollo más detallados (compilación de prueba con
simulación, tests del contrato embebido, etc.), ver [Desarrollo](#desarrollo)
más abajo.

## Estado actual

### Consolidación Android, escritorio y exportación — 5 de agosto de 2026

La aplicación quedó consolidada para el cierre y la exportación del proyecto
**El Milagro**. La APK de producción de terreno está instalada directamente en
la tablet Samsung SM-X230 mediante ADB; no se conserva un APK suelto como
entregable local y no se generaron paquetes `.deb` ni `.exe`. El escritorio se
ejecuta desde el código fuente Python/PySide6.

Correcciones funcionales vigentes:

- la pausa del recorrido crea segmentos independientes: al reanudar no se une
  gráficamente el traslado realizado mientras el tracking estuvo pausado;
- el trayecto ficticio sin registros fue eliminado y no se dibuja como línea
  continua ni punteada en Android, escritorio o KMZ;
- el editor del área conserva el centro y zoom actuales, permite mover,
  agregar y eliminar vértices, y guarda el polígono modificado como geometría
  oficial tanto en el proyecto como en el archivo `.geosignal`;
- el área de influencia se muestra en todas las vistas cartográficas del
  escritorio y se exporta al KMZ con borde negro y relleno transparente al
  `20 %`;
- el polígono oficial **DS19**, importado desde `DS19 kmz.kmz`, se conserva
  como cuadro del proyecto de `6` vértices únicos junto al área de influencia
  ampliada de `22` vértices; ambos contornos se muestran en Android, desktop y
  KMZ sin reemplazarse entre sí;
- Android mezcla los datos remotos sin reemplazar por cadenas vacías el nombre,
  código, descripción, comuna, región ni el área editada en el escritorio;
- región y comuna pueden editarse desde el lápiz del proyecto y se conservan
  después de sincronizar. Los valores que hubieran sido vaciados antes de esta
  corrección deben ingresarse una vez más;
- los identificadores técnicos de proyecto, elementos, fotografías y
  recorridos continúan existiendo para integridad, sincronización e
  idempotencia, pero son internos y no se muestran en tablas, detalles,
  ventanas cartográficas ni nombres de fotografías;
- la selección de un ítem en la tabla centra el mapa en su ubicación, lo lleva
  al primer plano y resalta su marcador; cada marcador usa el nombre real de su
  categoría y no una etiqueta genérica;
- debajo del técnico se muestra la vía y numeración postal resuelta desde la
  coordenada individual del ítem. Las nuevas capturas consultan OpenStreetMap
  con caché y límite de frecuencia; si no hay Internet usan el geocodificador
  del sistema sin bloquear ni perder el registro de terreno;
- las actualizaciones de datos y mapas se procesan sin reconstruir
  continuamente los componentes visibles, evitando el parpadeo de la tabla de
  catastro, la fotografía y los previews cartográficos;
- el servidor local evita instancias duplicadas sobre el puerto `8765`; Android
  y escritorio coordinan los elementos entregados y la cola pendiente se
  actualiza conforme el servidor confirma cada recepción;
- la vista de proyectos activos es compacta, deja más espacio a la fotografía
  y al mapa, e incluye edición de datos y del área de influencia.

Reglas finales de exportación:

- la numeración de señales verticales se agrupa automáticamente por calle: la
  primera calle usa `101, 102, 103...`, la segunda `201, 202, 203...` y así
  sucesivamente. Cada grupo crece hasta la cantidad real registrada, sin un
  límite artificial en `108`; el número postal al final de una dirección no
  crea otra calle (por ejemplo, `Guillermo Ulriksen` y
  `Guillermo Ulriksen 4105` pertenecen al mismo grupo);
- los paraderos se numeran correlativamente como `P1, P2, P3...` según el
  orden de captura;
- tablas, marcadores KMZ y fotografías comparten exactamente el mismo número de
  exportación;
- las tablas de señales ya no incluyen las columnas **Estado** ni **Leyenda**;
  las tablas de demarcaciones tampoco incluyen el estado de sincronización;
- el valor interno `sincronizado` nunca se presenta como dato técnico del
  catastro exportado;
- la fotografía limpia, sin sello horario, es la evidencia oficial usada en
  DOCX y KMZ. Su nombre sigue el formato `NUMERO - NOMBRE DEL ITEM.jpg`, por
  ejemplo `101 - PARE.jpg`;
- la versión estampada queda únicamente como respaldo en la misma carpeta con
  el formato `NUMERO - NOMBRE DEL ITEM__con_timestamp.jpg`;
- la ficha de paraderos incorpora las fotografías correspondientes;
- el KMZ principal incluye todos los registros georreferenciados, fotografías
  oficiales, área de influencia transparente y segmentos válidos del
  recorrido. También se generan capas KMZ separadas por categoría.
- cada exportación genera `resumen_recorrido_catastro.txt` con año y mes,
  fecha/hora inicial y final, distancia total en metros o kilómetros y puntos
  GPS considerados. La misma información reemplaza la antigua descripción
  genérica del KMZ; el cálculo omite pausas y saltos de `100 m` o más.

QA de esta consolidación:

- suite de escritorio: `18/18` pruebas aprobadas;
- pruebas específicas de generación técnica: `8/8` aprobadas;
- módulos Python modificados compilados correctamente y `git diff --check` sin
  errores;
- APK instalada, iniciada y comprobada mediante ADB con paquete
  `cl.paradox.app_catastro`, versión `0.1.0` (`versionCode 1`);
- servidor de escritorio operativo en `0.0.0.0:8765`.

Numeración oficial comprobada para los `57` registros de señales de **El
Milagro**: `16` grupos de calle, desde `101` hasta `1605`. El grupo de
Guillermo Ulriksen reúne sus `5` señales aunque dos direcciones contengan el
número postal `4105`. Los dos paraderos existentes quedaron fijados como `P1`
(Guillermo Ulriksen) y `P2` (Avenida Cuatro Esquinas). Esta misma regla se
aplica durante las futuras capturas Android y se vuelve a validar al exportar
desde escritorio, de modo que un clon ejecutado en Windows produce idénticos
números en tablas, fotografías y KMZ.

### Cierre de terreno y corrección de recorrido — 5 de agosto de 2026

El proyecto **El Milagro** terminó su levantamiento en terreno con `181`
registros y `621` puntos GPS. La tablet conserva el proyecto activo, las fotos,
el mapa offline y `El_Milagro.geosignal`; el recorrido está pausado.

QA y reparación realizadas por ADB el 5 de agosto de 2026:

- se detectó que la pausa detenía correctamente el GPS, pero la polilínea única
  unía el último punto anterior con el primero de la reanudación;
- se eliminó esa unión ficticia de `352,6 m` entre los puntos `425` y `426`,
  sin borrar ninguno de los `621` puntos válidos;
- cada reanudación guarda ahora `segment_start=true`; mapa Android, preview,
  archivo `.geosignal`, mapa de escritorio y KMZ representan cada caminata
  como un tramo separado;
- los datos anteriores también separan automáticamente saltos de `100 m` o
  más, evitando líneas de traslado en exportaciones antiguas;
- el guardado del área de influencia vuelve a mezclar el estado local vigente
  al terminar un refresco remoto, impidiendo que una respuesta atrasada
  restaure el polígono anterior;
- al activar **Editar área** se conserva exactamente la cámara preparada por
  el técnico (centro y zoom); solo los botones explícitos **Ver mi ubicación
  GPS** y **Volver al área** cambian el encuadre durante la edición;
- el mapa y el preview KMZ cargan los registros locales completos, incluidos
  los ya sincronizados, por lo que los íconos no dependen de que el servidor
  del escritorio esté conectado;
- guardar un área editada regenera automáticamente el `.geosignal`; el KMZ de
  escritorio usa el mismo polígono con borde negro y relleno negro al `20 %`,
  dejando visibles calles, recorrido e ítems georreferenciados;
- cada cambio de vértice mantiene además un borrador local recuperable y la
  edición muestra acciones con texto **Cancelar** y **Guardar área**; confirmar
  **Guardar área** convierte el borrador en la geometría oficial exportable;
- respaldo privado completo previo a la reparación comprobado por SHA-256;
- APK corregida instalada mediante ADB, aplicación estable y APK local
  eliminado después de la instalación;
- pruebas Flutter: análisis sin observaciones y `7` pruebas aprobadas (`1`
  prueba de integración omitida por requerir servidor); pruebas específicas de
  segmentación `2/2`; pruebas de escritorio relacionadas `9/9`.

Conteo del archivo portátil final en la tablet:

| Ítem | Cantidad |
|---|---:|
| Señales verticales | 57 |
| Demarcaciones viales | 47 |
| Rebajes de solera (DR) | 34 |
| Cámaras de servicio | 26 |
| Sumideros | 8 |
| Vallas peatonales | 5 |
| Paraderos | 2 |
| Paños | 2 |
| **Total** | **181** |

El área ampliada definitiva contiene `22` vértices y quedó guardada el 5 de
agosto a las `13:20:35` tanto en las preferencias Android como en
`El_Milagro.geosignal`. Después de esperar un ciclo de refresco y reiniciar la
app se mantuvieron los mismos `22` vértices. La carrera que restauraba la copia
anterior se cerró con una mezcla final del estado local inmediatamente antes de
publicar y persistir cualquier respuesta remota.

QA real del KMZ de escritorio con la copia final:

- KMZ principal con `181` puntos georreferenciados, `181` fotografías
  embebidas, `1` polígono de área y el recorrido separado en `2` tramos;
- área de influencia de `22` vértices, borde negro y relleno KML `33000000`
  (negro al `20 %` de opacidad);
- `9` KMZ adicionales por capa, incluidas señales, demarcaciones, mobiliario,
  paraderos, paños, DR, cámaras/registros, sumideros y recorrido;
- archivo `.geosignal` íntegro: `181` registros, `181` fotos, `621` puntos GPS
  y `2` inicios de tramo.

### Estado operativo previo — 4 de agosto de 2026

La tablet Samsung SM-X230 quedó preparada para continuar el proyecto **El
Milagro**:

- APK de prueba actualizada instalada sin simulación;
- cámara, ubicación precisa, ubicación en segundo plano y notificaciones
  autorizadas;
- proyecto activo restaurado con sus fotografías, mapa offline, recorrido y
  `64` registros sincronizados;
- tracking anterior guardado y detenido, listo para iniciarse expresamente al
  comenzar la nueva jornada;
- señales del eje 1 numeradas `101–113` y señales del eje 2 numeradas
  `201–202`; la siguiente señal propuesta en el eje 2 será `203`;
- respaldo previo y copia renumerada disponibles en
  `backups/geosignal_el_milagro_20260804/`.

QA final realizada por ADB el 4 de agosto de 2026:

- aplicación instalada abre correctamente y permanece estable, sin cierres,
  ANR ni excepciones de Flutter;
- pantalla de Inicio muestra **El Milagro**, GPS en vivo, recorrido pausado y
  cola sin pendientes;
- pantalla Captura carga el mapa offline, área de influencia, marcadores y
  catálogo de ítems;
- GPS del sistema y permisos de cámara, ubicación precisa, ubicación en segundo
  plano y notificaciones están activos;
- almacenamiento disponible comprobado: `86 GB`;
- mapa offline (`17.903.616` bytes), proyecto portátil y `128` fotografías
  locales comprobados;
- recorrido anterior conservado con `16` puntos y `tracking_activo=false`;
- no queda una APK suelta como artefacto de entrega: la versión validada queda
  instalada directamente en la tablet.

Auditoría integral del catastro restaurado:

| Ítem | Cantidad |
|---|---:|
| Señales verticales | 15 |
| Demarcaciones viales | 17 |
| Rebajes de solera (DR) | 15 |
| Cámaras de servicio | 9 |
| Sumideros | 7 |
| Paños | 1 |
| **Total** | **64** |

Los `64` identificadores son únicos y todos los registros tienen coordenadas
válidas, metadatos JSON legibles y estado `sincronizado`. Se comprobaron `128`
fotografías locales —original y limpia para cada registro— y los conteos de la
tablet coinciden con la base del escritorio. La exportación real del proyecto
generó correctamente `13` planillas DOCX y sus CSV; la planilla de señales
contiene `101–113` y `201–202`, y las `17` demarcaciones aparecen en sus tablas
correspondientes.

La exportación completa de gabinete también fue ejecutada y auditada con los
datos reales. El resultado contiene:

- un KMZ principal con `64` puntos de catastro, `1` recorrido, `1` polígono de
  área de influencia y `64` fotografías embebidas;
- `7` KMZ adicionales separados por ítem/capa;
- carpetas KMZ para señales, demarcaciones, paños, DR, cámaras, sumideros y
  recorrido;
- señales verticales identificadas como `101–113` y `201–202` tanto en tablas
  como en KMZ;
- carpeta `Catastro/` organizada por categoría con una fotografía oficial
  limpia y una copia `__con_timestamp.jpg` de respaldo por registro;
- nombres de fotografía compuestos por el mismo número y nombre descriptivo
  que usan las tablas, sin exponer el ID interno;
- `13` DOCX, `13` CSV y `1` archivo Excel de bitácora.

Para la jornada:

1. Abrir **El Milagro** y comprobar que el mapa y la posición GPS sean visibles.
2. Seleccionar el eje correcto antes de capturar una señal vertical.
3. Pulsar **Iniciar tracking** solamente al estar dentro del área de influencia.
4. Al terminar, detener el tracking y comprobar que no existan errores en la
   cola de pendientes.
5. En el computador, iniciar la aplicación desde el código actualizado con
   `catastro_windows/.venv-linux/bin/python catastro_windows/main.py`, conectar
   ambos equipos a la misma red y sincronizar.
6. Revisar los conteos y generar **Preparar tablas DOC** o la exportación
   completa. Las tablas de señales y demarcaciones usarán el formato técnico
   actualizado y solo la cantidad efectivamente registrada.

La jornada de terreno usa la APK actualizada. La exportación de gabinete se
ejecuta desde el código fuente indicado en el paso 5; no es necesario compilar
ni reemplazar paquetes `.deb` o ejecutables `.exe` para completar este flujo.

El contrato embebido Android–escritorio está operativo:

- creación y selección de proyectos;
- captura de fotografías con sello, categoría, metadatos y coordenadas;
- elementos de catastro y dispositivos de rodado;
- GPS en vivo, tracking persistente y trazas, retomable en días distintos;
- verificación de distancia al área de influencia antes de iniciar o
  retomar el tracking, para evitar grabar por accidente un tramo que no
  corresponde al proyecto (ej. al tocar el botón estando fuera de terreno);
- edición del área de influencia en el mapa (mover, agregar y eliminar
  vértices) sin que el seguimiento GPS ni la orientación por brújula
  interrumpan la edición;
- orientación del mapa por brújula (magnetómetro) mientras se camina,
  además del rumbo por GPS;
- bitácora de días y horas trabajados en cada proyecto, calculada a partir
  del recorrido GPS, visible en Android y exportada en Excel junto al
  paquete técnico del escritorio;
- cola offline con reintentos e idempotencia;
- autodetección del PC por WiFi;
- transferencia de proyectos, fotografías y recorridos;
- almacenamiento local SQLite y archivos;
- actualización en tiempo real mediante WebSocket;
- revisión y eliminación de registros;
- exportación de proyecto, DOCX, CSV, Excel (bitácora) y KMZ con
  fotografías;
- guardado portátil `*.geosignal`, compartible por correo y reabrible en
  Android, Windows y Linux para continuar el proyecto;
- simulación funcional y temporizada del flujo completo de terreno;
- seguimiento visual centrado y animado durante el recorrido;
- descarga inicial única de mapas OSM para operación sin Internet;
- interfaz de escritorio compacta: prioriza fotografía y mapa, permite editar
  proyecto y área, y mantiene accesibles las acciones de sincronización,
  revisión y exportación.

La APK Android se valida e instala directamente mediante ADB. En esta etapa no
se compilan ni entregan ejecutables Windows ni paquetes Linux; la distribución
definitiva firmada se realizará al cerrar las validaciones.

## Flujo operativo

1. Android crea o abre un proyecto.
2. El técnico inicia el tracking y realiza el levantamiento.
3. Fotografías, ítems, DR y coordenadas se guardan primero en el teléfono.
4. Si no existe conexión, todo permanece en una cola local persistente.
5. En oficina, Android y el computador se conectan a la misma WiFi.
6. Se abre GeoSignal Catastro en el computador.
7. Android detecta `IP_DEL_PC:8765` y transfiere solamente lo pendiente.
8. El computador confirma cada recepción; Android retira los elementos
   confirmados de la cola pendiente y conserva solamente los no entregados.
9. El computador actualiza el proyecto y permite revisar y exportar.

La sincronización no necesita Internet. Un router o hotspot local es suficiente.
Internet solo puede ayudar a descargar mapas o resolver direcciones.
El mapa operativo Android usa MapLibre con datos vectoriales, capas GeoJSON y
caché regional SQLite. Los nombres de las calles permanecen legibles al rotar
y la región del proyecto se conserva para trabajo sin conexión. El proveedor
se puede cambiar mediante `GEOSIGNAL_MAP_STYLE_URL` o la preferencia local
`proveedor_mapa_style_url`; no existe dependencia de Google Maps ni claves API.

La primera vez que se abre el mapa con conexión, Android descarga
automáticamente la región OSM base. La descarga queda registrada en el
almacenamiento privado de la aplicación, se reutiliza en todos los proyectos y
no vuelve a solicitarse. Este estado solo se reinicia al desinstalar la
aplicación. Si la descarga inicial se interrumpe, la aplicación conserva el mapa
en línea y permite reintentar al recuperar la conexión.

## Arquitectura

```text
Android / terreno
  ├── Flutter
  ├── persistencia offline
  ├── fotografías procesadas
  ├── cola con reintentos
  ├── tracking GPS
  └── cliente del contrato local
                │
                │ HTTP + WebSocket por WiFi/LAN
                │ TCP 8765
                ▼
Aplicación de escritorio
  ├── Python + PySide6
  ├── servidor HTTP/WebSocket embebido
  ├── SQLite
  ├── almacenamiento local de archivos
  ├── revisión de proyectos
  └── exportación DOCX/CSV/KMZ
```

El servidor embebido conserva respuestas compatibles con el SDK Dart de
Appwrite únicamente como protocolo de transición. No ejecuta Appwrite ni se
conecta a una instancia Appwrite.

## Persistencia

Android conserva técnico, proyecto, fotografías, elementos, recorridos, estado
de sincronización, intentos y errores. No se deben borrar los datos ni
reinstalar la APK si existen pendientes reales.

### Archivo portátil de proyecto

Desde **Proyecto**, Android permite **Guardar / compartir** y **Abrir archivo
.geosignal**. Windows y Linux ofrecen los mismos comandos en el panel de
proyectos. El contenedor incluye proyecto, fotografías, registros y recorrido;
no incluye mapas offline ni credenciales. Al abrirlo se combinan los registros
por identificador y el tracking queda detenido hasta que el técnico lo inicie
expresamente. El contrato se documenta en `FORMATO_GEOSIGNAL.md`.

En Windows:

```text
%LOCALAPPDATA%\GeoSignal Catastro\
├── data\
│   ├── catastro.sqlite3
│   └── storage\
│       ├── fotos_catastro\
│       └── kmz_exports\
├── appwrite_config.json
├── config.json
└── logs\
```

En Linux se utilizará:

```text
${XDG_DATA_HOME:-$HOME/.local/share}/GeoSignal Catastro/
├── data/
├── appwrite_config.json
├── config.json
└── logs/
```

Para respaldar, cerrar la aplicación de escritorio y copiar completa su carpeta
de datos. SQLite y `storage/` forman una sola unidad y deben restaurarse juntos.

## Red local

- Puerto: `8765/TCP`.
- El servidor escucha en las interfaces privadas del computador.
- El escritorio se conecta internamente a `http://127.0.0.1:8765/v1`.
- Android descubre el servidor consultando
  `http://IP_DEL_PC:8765/v1/locale`.
- Android nunca debe usar `127.0.0.1` para llegar al computador.
- El escritorio muestra en la barra de estado y en la pestaña Sincronizar la
  IP de LAN real que la tablet debe usar (`IP para la tablet: IP:8765`),
  calculada en `catastro_windows/app/utils/network_info.py`.
- El firewall debe permitir el puerto únicamente en redes privadas:
  `habilitar_firewall_geosignal_local.ps1` en Windows,
  `habilitar_firewall_geosignal_local.sh` en Linux (ufw/firewalld).

Una interrupción WiFi no elimina datos: Android conserva la cola y reintenta.

## Prueba de campo

La tablet de validación actual es una Samsung SM-X230. La compilación de prueba
incluye una simulación habilitada expresamente, optimizada en modo `profile`.

La simulación de recorrido representa:

- caminata de `1,35 m/s`, equivalente a aproximadamente `4,9 km/h`;
- posición interpolada a `30 FPS`;
- caminante animado y mapa centrado con seguimiento suavizado;
- detenciones variables de `1,8` a `4` segundos en cruces;
- pausas para detección, fotografía, procesamiento y guardado;
- generación persistente del track, elementos, fotografías y pendientes;
- sincronización posterior con el escritorio por WiFi/LAN.

Antes de salir a terreno:

1. Cargar completamente la tablet y habilitar ubicación precisa.
2. Abrir la sección de captura con Internet y esperar que el mapa indique
   `Mapa preparado para trabajar sin Internet`.
3. Desactivar Internet y comprobar que la región de trabajo continúa visible.
4. Crear o seleccionar el proyecto y confirmar el nombre del técnico.
5. Realizar una captura de prueba y verificar fotografía, sello y coordenadas.
6. Iniciar y detener un recorrido corto; confirmar que la traza queda guardada.
7. Comprobar que los pendientes sobreviven al cierre y reapertura de la app.
8. En oficina, conectar tablet y PC a la misma WiFi y abrir el puerto
   `8765/TCP` del computador.
9. Sincronizar y revisar en Windows proyectos, fotos, elementos y recorridos.
10. Exportar DOCX, CSV y KMZ antes de considerar cerrada la validación.

### Numeración y tablas de señales

- Las señales verticales se numeran por eje. El primer eje comienza en `101`,
  el segundo en `201`, el tercero en `301`, etc.
- La numeración es correlativa dentro del eje y no tiene un máximo de ocho
  elementos: puede terminar en `108`, `115` o en el número que corresponda a
  la cantidad efectivamente registrada.
- Al cambiar de eje, la captura continúa en `x01` para el eje seleccionado.
- Las tablas DOCX contienen solamente los registros reales. Se exportan con
  el formato técnico de señales verticales, señales de calle, demarcaciones en
  intersecciones y demarcaciones en tramos; no se agregan filas para completar
  cantidades de referencia.
- Las tablas de señales omiten **Estado** y **Leyenda**. El estado de
  sincronización es un dato interno y no forma parte del informe técnico.
- El número y el nombre descriptivo de cada fila se reutilizan en el marcador
  KMZ y en sus fotografías. La evidencia oficial usa
  `NUMERO - NOMBRE DEL ITEM.jpg`; la imagen sellada de respaldo usa
  `NUMERO - NOMBRE DEL ITEM__con_timestamp.jpg`.

No desinstalar ni borrar los datos de la aplicación durante una prueba con
registros pendientes. La desinstalación elimina proyectos locales, cola,
preferencias y mapas offline.

## Aplicación híbrida Windows y Linux

La aplicación de escritorio tendrá una sola base funcional Python/PySide6 y dos
formatos de entrega:

```text
Windows: carpeta portable o instalador .exe
Ubuntu:  paquete instalable .deb
```

Ambas variantes deben incluir Python, PySide6, servidor embebido, migraciones
SQLite, recursos y exportadores. No deberán exigir Python, Docker, Appwrite,
MariaDB, Redis, WSL ni servicios del sistema instalados previamente.

La variante Linux debe usar rutas XDG, abrir selectores de archivos nativos,
registrar el lanzador `.desktop`, instalar iconos y declarar el puerto local sin
suponer rutas de Windows. El `.deb` se construirá al final, después de cerrar el
contrato y validar la aplicación en Ubuntu.

## Desarrollo

Android:

```bash
cd catastro_app
flutter pub get
flutter analyze
flutter test
flutter build apk --debug
```

Compilación optimizada para validar la simulación:

```bash
cd catastro_app
flutter build apk --profile --dart-define=GEOSIGNAL_SIMULATION=true
adb -s ID_TABLET install -r build/app/outputs/flutter-apk/app-profile.apk
```

La simulación no se incluye en una entrega productiva salvo que se compile
expresamente con `GEOSIGNAL_SIMULATION=true`.

Escritorio:

```bash
cd catastro_windows
python3 -m venv .venv
./.venv/bin/python -m pip install -r requirements.txt
./.venv/bin/python -m pytest -q
./.venv/bin/python main.py
```

En Windows se usan los equivalentes dentro de `.venv\Scripts\`.

Prueba del contrato con el SDK Android:

```bash
export GEOSIGNAL_TEST_ENDPOINT=http://127.0.0.1:8765/v1
cd catastro_app
flutter test test/embedded_runtime_sdk_test.dart
```

## Componentes principales

- `catastro_app/`: aplicación Flutter Android.
- `catastro_windows/`: escritorio PySide6 y runtime local.
- `catastro_windows/app/services/embedded_runtime.py`: HTTP, WebSocket, SQLite
  y archivos.
- `catastro_windows/app/services/appwrite_service.py`: cliente interno del
  contrato.
- `catastro_app/lib/services/appwrite_service.dart`: cliente Android,
  autodetección y sincronización.
- `catastro_windows/appwrite_config.json`: IDs compartidos del contrato.
- `catastro_windows_build.spec`: distribución Windows.
- `Contrato_Embebido.MD`: especificación para reutilizar esta arquitectura.

## Reglas del proyecto

- No reintroducir Docker ni Appwrite.
- No reemplazar el flujo offline por una dependencia de Internet.
- No confirmar una transferencia antes de persistir documento y archivo.
- No eliminar la cola Android ante errores recuperables.
- Mantener IDs, categorías, claves JSON y respuestas compatibles.
- Toda mutación debe ser idempotente o detectar duplicados.
- El escritorio es el servidor y dueño del almacenamiento definitivo.
- Android es autónomo en terreno y sincroniza al regresar.

## Próximos pasos

1. Continuar pruebas funcionales Android–escritorio.
2. Probar reinicios, WiFi intermitente, archivos grandes y recuperación.
3. Validar exportación completa y KMZ en Ubuntu y Windows.
4. Limpiar nombres internos heredados de Appwrite sin romper el contrato.
5. Validar y cerrar el empaquetado Windows preliminar.
6. Crear, instalar y probar el paquete Ubuntu `.deb`.
7. Firmar la APK y preparar la entrega final.
