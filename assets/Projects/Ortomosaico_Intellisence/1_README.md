# Editor de Ortomosaicos

Herramienta de escritorio para Windows desarrollada en Python, PyQt5, OpenCV,
NumPy y Pillow. Permite crear una máscara con pincel, goma o lazo poligonal,
eliminar objetos mediante `cv2.inpaint()` y exportar el resultado en JPEG o PNG.

## Requisitos

- Windows 10 u 11
- Python 3.10 o superior
- Memoria RAM suficiente para cargar el ortomosaico completo

## Instalación

Abra PowerShell dentro de la carpeta del proyecto:

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## Ejecución

```powershell
python main.py
```

## Uso básico

1. Presione **Abrir imagen**.
2. Marque el objeto con **Pincel** o **Lazo poligonal**.
3. Corrija la máscara con **Goma** si es necesario.
4. Ajuste algoritmo, radio y margen de contexto.
5. Presione **Procesar selección**.
6. Confirme o revierta la vista previa.
7. Guarde como JPEG o exporte como PNG.

## IA generativa opcional

La aplicación incluye un backend opcional **IA generativa OpenAI** para
regenerar mejor calles, suelo y terreno cuando el relleno local no basta.

Uso recomendado:

1. Defina `OPENAI_API_KEY` en el entorno o escríbala en el campo **API key**.
2. Seleccione **IA generativa OpenAI** como algoritmo.
3. Ajuste el prompt si desea enfatizar pavimento, tierra o vegetación.
4. Procese selecciones pequeñas o medianas para obtener mejores resultados.

Observaciones:

- El endpoint oficial de edición de imágenes requiere que la imagen y la
  máscara tengan el mismo tamaño y formato, y que el archivo de máscara tenga
  canal alpha.
- La app recorta automáticamente la zona seleccionada y adapta el tamaño del
  crop para cumplir mejor con las restricciones del modelo.

## Controles

- Rueda del mouse: zoom.
- Botón derecho + arrastre: desplazar.
- Espacio + botón izquierdo + arrastre: desplazar.
- Lazo: clic para agregar puntos; doble clic o Enter para cerrar.
- Escape: cancelar lazo.
- Ctrl+Z / Ctrl+Y: deshacer y rehacer.
- F: ajustar imagen a la ventana.
- 1: tamaño real al 100 %.

## Observaciones técnicas

- El historial comprime las máscaras como PNG para reducir consumo de memoria.
- El procesamiento usa solamente el rectángulo de la máscara más un margen
  configurable.
- JPEG se exporta con `subsampling=0`.
- Se intenta conservar EXIF, perfil ICC y DPI cuando el formato lo permite.
- `cv2.inpaint()` funciona mejor en objetos pequeños o medianos sobre texturas
  relativamente homogéneas. En objetos grandes o estructuras complejas será
  necesario realizar varias pasadas o incorporar posteriormente un motor de
  inpainting basado en IA.

## Empaquetado futuro con PyInstaller

Ejemplo inicial:

```powershell
pip install pyinstaller
pyinstaller --noconfirm --windowed --name OrtomosaicoEditor main.py
```

Antes de distribuir el ejecutable conviene probarlo con ortomosaicos reales y
agregar los parámetros específicos de OpenCV/PyQt5 que requiera el entorno.
