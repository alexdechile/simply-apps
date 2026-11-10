# Snapshots de Simply Apps

Carpeta con capturas de pantalla automáticas generadas en tiempo real para que los agentes con capacidad visual puedan inspeccionar la interfaz de la aplicación.

## Capturas Disponibles

- **`01_vista_principal.png`**: Vista general del editor, barra de herramientas superior, selector de modelo/tono y paneles de salida.
- **`02_modal_tech.png`**: Modal interactivo de investigación y redacción de crónicas tecnológicas (con selector de modelo IA).
- **`03_modal_cancion.png`**: Modal de generación de posts musicales (búsqueda en Wikipedia, Internet Archive y redacción de anécdotas).
- **`04_modal_sesiones.png`**: Modal de sesiones compartidas por QR (FIFO).

## Cómo regenerar las capturas

Puedes regenerar todas las capturas con el siguiente comando:

```bash
python3 -c "
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/google-chrome-stable', headless=True)
    page = browser.new_page(viewport={'width': 1400, 'height': 850})
    page.goto('http://127.0.0.1:1717')
    page.screenshot(path='snapshots/01_vista_principal.png')
    page.click('#techBtn')
    page.wait_for_timeout(500)
    page.screenshot(path='snapshots/02_modal_tech.png')
    page.keyboard.press('Escape')
    page.wait_for_timeout(400)
    page.click('#cancionBtn')
    page.wait_for_timeout(500)
    page.screenshot(path='snapshots/03_modal_cancion.png')
    page.keyboard.press('Escape')
    page.wait_for_timeout(400)
    page.click('#sessionBtn')
    page.wait_for_timeout(500)
    page.screenshot(path='snapshots/04_modal_sesiones.png')
    browser.close()
"
```
