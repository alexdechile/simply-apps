## 1. Backend & Scraper

- [x] 1.1 Modificar `buscadores/scraper.py` para soportar lectura por categorías específicas de `fuentes.md`.
- [x] 1.2 Actualizar `researcher.py` para aceptar el argumento de categoría y estructurar su salida final en formato JSON.
- [x] 1.3 Modificar el endpoint `/research` en `server.js` para recibir `category`, propagarlo a Python y retornar la respuesta JSON al cliente.

## 2. Frontend Integration

- [x] 2.1 Agregar el elemento select para categorías de investigación en el modal de `index.html`.
- [x] 2.2 Actualizar la planificación e investigación en `script.js` para enviar la categoría seleccionada al backend.
- [x] 2.3 Modificar la lógica de síntesis en `script.js` para concatenar automáticamente la sección "Referencias Reales" con enlaces Markdown clicables.
