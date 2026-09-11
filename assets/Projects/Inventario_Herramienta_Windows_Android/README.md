# NeuralCore · Inventario de Herramientas

Sistema multiplataforma para administrar herramientas, personas y préstamos desde Windows y Android. La aplicación funciona en la red local, conserva los datos de Android sin conexión y sincroniza automáticamente cuando vuelve a encontrar el servidor Windows.

Desarrollado por **NeuralCore Software** — **Luis Riveros**, Ingeniero en Informática y Desarrollo.

## Funciones principales

- Catálogo de herramientas con categoría, descripción y fotografía.
- Captura de fotos con la cámara o selección desde la galería en Android.
- Administración de categorías y personas.
- Registro de préstamos, devoluciones e historial.
- Panel principal con totales y movimientos recientes.
- Interfaz equivalente en Windows y Android, adaptada a cada plataforma.
- Android adaptable a teléfonos y tabletas, en orientación vertical y horizontal.
- Modo claro y oscuro, iconos grandes y animaciones ligeras.
- Pantallas de bienvenida, splash y Acerca de.
- Funcionamiento offline-first en Android con cola persistente.
- Descubrimiento automático del servidor en la red local y configuración manual como respaldo.
- Emparejamiento visual mediante un código aleatorio de tres dígitos.
- Indicador de sincronización tipo semáforo y notificaciones de conexión/desconexión.
- Diagnóstico con historial de eventos, códigos de error y descripciones.

## Arquitectura

La solución está dividida según [`contrato.md`](contrato.md):

- `windows_app/`: aplicación Flask, base SQLite canónica y servidor LAN en el puerto `8765`.
- `android_app/`: aplicación Flutter, base SQLite local, cola de cambios y cliente de sincronización.
- `error_catalog.json`: catálogo compartido de mensajes y códigos de diagnóstico.

Android nunca abre directamente la base de datos de Windows. Cada dispositivo escribe primero en su almacenamiento local y los cambios se intercambian a través de la API `/v1`. Una operación solo se marca como sincronizada después de recibir confirmación del servidor.

La aplicación no necesita Internet para trabajar, pero ambos equipos deben estar en la misma red local y el router debe permitir comunicación entre clientes. Algunas redes de invitados o configuraciones con aislamiento Wi-Fi bloquean este tráfico aunque los dispositivos usen el mismo módem.

## Estado de conexión y sincronización

La interfaz muestra un estado tipo semáforo:

- **Verde:** conectada y completamente sincronizada.
- **Amarillo:** conectando, emparejando o con cambios pendientes por enviar.
- **Rojo:** servidor no encontrado, conexión perdida o error que requiere atención.

Los objetos pendientes son operaciones locales guardadas en la cola de sincronización. No necesariamente representan registros visibles: también pueden ser cambios técnicos todavía no confirmados. La pantalla de diagnóstico permite revisar su estado y el código asociado.

## Emparejamiento

Al iniciar la aplicación Windows se crea una sesión nueva y se muestra un código aleatorio de tres dígitos. Android descubre el servidor y presenta el mismo código.

1. Verifica que el número sea idéntico en ambas pantallas.
2. Confirma el código en Android.
3. Confirma el código en Windows.
4. El aviso desaparece cuando ambos lados han confirmado y el estado cambia a verde al terminar la sincronización.

Al cerrar y volver a abrir Windows se genera un código nuevo. Esto permite comprobar visualmente que Android se conectó al computador correcto, incluso si la dirección IP cambió.

## Cambio de computador o red

La dirección IP no forma parte permanente del emparejamiento. Android intenta descubrir automáticamente el servidor Windows en la red actual. Si no lo encuentra, la aplicación avisa al usuario y permite indicar manualmente la dirección que Windows muestra, por ejemplo `http://192.168.1.20:8765`.

Para usar el sistema en otro lugar:

1. Conecta el computador y el dispositivo Android al mismo router.
2. Inicia la aplicación Windows y permite el acceso en el Firewall de Windows si lo solicita.
3. Abre Android y espera el descubrimiento automático.
4. Comprueba y confirma el código de tres dígitos en ambas aplicaciones.

Si el servidor sigue sin aparecer, verifica que la red no sea de invitados, que no tenga aislamiento de clientes y que el puerto TCP `8765` esté permitido en el computador.

## Estructura del proyecto

```text
InventarioHerramientas/
├── windows_app/          # Aplicación Windows y servidor de sincronización
├── android_app/          # Aplicación Flutter para Android
├── contrato.md           # Contrato de datos y sincronización
├── error_catalog.json    # Catálogo común de códigos de error
├── DISTRIBUCION_LEEME.txt
├── assets/               # Recursos compartidos
└── README.md
```

Los archivos de la raíz correspondientes a la versión Flask inicial se mantienen como referencia y compatibilidad. El desarrollo multiplataforma final se encuentra en `windows_app/` y `android_app/`.

## Desarrollo de Windows

Requiere Python 3.12 y las dependencias instaladas en el entorno virtual.

```powershell
venv\Scripts\python.exe windows_app\app.py
```

La interfaz se abre en el navegador local y el servidor escucha en `0.0.0.0:8765` para aceptar conexiones desde Android dentro de la LAN.

Pruebas de Windows:

```powershell
venv\Scripts\python.exe -m unittest discover -s windows_app\tests -v
```

## Desarrollo de Android

Requiere Flutter y el SDK de Android configurados.

```powershell
cd android_app
flutter pub get
flutter analyze
flutter test
flutter run
```

Con un dispositivo conectado por ADB, `flutter run` instala y abre la aplicación. La interfaz admite orientación portrait y landscape y ajusta su distribución al tamaño disponible.

## Compilación para distribución

### Windows

Desde la raíz del proyecto:

```powershell
venv\Scripts\python.exe windows_app\build.py --modo exe
```

El modo `exe` produce una distribución PyInstaller `onedir`: el ejecutable y su carpeta `_internal` deben entregarse juntos.

También existe el modo portable, recomendado en equipos donde Smart App Control bloquea ejecutables sin firma:

```powershell
venv\Scripts\python.exe windows_app\build.py
```

### Android

```powershell
cd android_app
flutter build apk --release
```

El APK se genera en `android_app\build\app\outputs\flutter-apk\app-release.apk`.

### Advertencia de producción

Los binarios compilados funcionan para distribución directa y pruebas, pero una publicación formal requiere certificados propios:

- El ejecutable de Windows debe firmarse con un certificado de firma de código para evitar advertencias o bloqueos de Smart App Control.
- El APK debe compilarse con una clave de firma de producción privada antes de publicarlo en Google Play o distribuir actualizaciones duraderas.

No se deben publicar certificados, contraseñas, claves ADB ni bases de datos reales en este repositorio.

## Datos y respaldo

Windows conserva los datos canónicos junto a la aplicación:

- `inventario.db`: base SQLite con herramientas, categorías, personas, préstamos y control de sincronización.
- `fotos/`: imágenes de las herramientas.

Android mantiene su propia réplica en el almacenamiento privado de la aplicación. Desinstalar Android elimina esa copia local, por lo que conviene sincronizar antes.

Para respaldar Windows, cierra la aplicación y copia `inventario.db` y la carpeta `fotos/`. Para trasladarla a otro computador, conserva esos elementos junto con toda la carpeta de distribución.

## Diagnóstico y errores

Las dos aplicaciones informan conexión, desconexión, emparejamiento y fallos de sincronización. Los mensajes incluyen un código y una descripción. El catálogo fuente está en [`error_catalog.json`](error_catalog.json), y Android conserva además un historial local de notificaciones para diagnóstico.

Al solicitar soporte, entrega el código mostrado, su descripción, la hora aproximada y el estado de color de ambas aplicaciones.

## Licencia y créditos

**NeuralCore Software © 2026**  
Desarrollado por **Luis Riveros** — Ingeniero en Informática y Desarrollo.
