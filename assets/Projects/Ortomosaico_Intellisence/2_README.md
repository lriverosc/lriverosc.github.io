# Paradox GeoImage IA v4.3

Aplicación PySide6 para ajustar ortomosaicos reducidos, corregir gamma/luminosidad, detectar borde útil, recortar áreas dentadas y exportar imágenes limpias para planos AutoCAD.

## Cambios v4.3

- Ventana principal abre maximizada con botón maximizar habilitado.
- Panel izquierdo más ancho y con scroll.
- Loader visual visible durante procesos largos.
- Botón animado `FuzzyCssButton` para detectar borde útil.
- Guardado cambiado a escritura directa con `cv2.imwrite` para evitar esperas largas por `imencode` en RAM.
- Señales de worker retenidas para evitar que el proceso termine y no notifique a la UI.
- Título principal: `Paradox GeoImage IA`.

## Ejecutar

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python .\main.py
```

O usar:

```powershell
.\run_app.ps1
```

## Nota

Para ortomosaicos grandes, el guardado puede tardar unos segundos o minutos según tamaño, formato y disco. JPG suele ser más rápido que PNG/TIFF.
