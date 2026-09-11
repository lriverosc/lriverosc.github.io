# NeuralCore Downloader 1.1

Aplicacion de escritorio para descargar audio y video con PySide6 y yt-dlp.

## Instalar

Ejecutar DIST/setup.exe. El asistente en espanol permite elegir carpeta y crear
un acceso directo opcional al escritorio. Incluye desinstalador en el menu Inicio
y en Aplicaciones de Windows. Instalacion por usuario, sin exigir administrador.
Compatible con Windows 10/11 de 64 bits.

No requiere instalar Python, Qt, FFmpeg ni Deno. La instalacion funciona sin
Internet; las descargas requieren conexion y algunos sitios requieren cookies.
La compatibilidad con sitios externos puede cambiar.

DIST/Downloader contiene la aplicacion onefolder: Downloader.exe y _internal.
No mover el exe solo. El instalador copia toda esta carpeta.

## Mejoras 1.1

- Configuracion en %LOCALAPPDATA%/NeuralCore/Downloader, evitando escribir en
  la carpeta de instalacion. La desinstalacion conserva ajustes y descargas.
- Descargas iniciales en ~/Downloads/NeuralCore Downloader.
- Guardado atomico de ajustes para evitar archivos incompletos.
- Verificacion de certificados HTTPS habilitada.
- Enlaces de video con lista asociada descargan solo el video.
- Limite de espera de red durante el analisis.
- FFprobe se ejecuta sin abrir ventanas de consola.
- FFmpeg, FFprobe, Deno, EJS, Python y Qt incluidos en el paquete.
- Se excluyen ffplay y bibliotecas de transcripcion no utilizadas.

## Compilar

Entorno de desarrollo: .venv con requirements.txt, FFmpeg/FFprobe en ffmpeg/bin,
Deno en runtime/deno y compilador Inno Setup en tools/InnoSetup.
Ejecutar ./build.ps1 para generar DIST/Downloader y DIST/setup.exe.
La compilacion falla si falta una dependencia obligatoria.

Prueba de interfaz y configuracion: .venv/Scripts/python.exe tools/smoke_test.py

## Creditos

NeuralCore Software - Luis Riveros.
FFmpeg incluye su licencia en _internal/ffmpeg/LICENSE.
Motor de descarga: https://github.com/yt-dlp/yt-dlp
Motor JavaScript: https://github.com/denoland/deno
Interfaz Qt/PySide6: https://www.qt.io/qt-for-python
Instalador: https://jrsoftware.org/isinfo.php
