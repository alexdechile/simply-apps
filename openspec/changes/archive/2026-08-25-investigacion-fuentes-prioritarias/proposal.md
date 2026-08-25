## Why

Optimizar el motor de investigación de Simply Apps para que la búsqueda y el scraping prioricen dinámicamente las fuentes en base al tema detectado (Ciencia, Derecho, Economía, Tecnología, etc.), y asegurar la inyección de citas y enlaces reales fiables al final de la síntesis de investigación.

## What Changes

- **Parseo por Categorías de fuentes.md:** Modificar `buscadores/scraper.py` para agrupar y filtrar los dominios prioritarios según la sección (Ciencia, Derecho, Economía, Historia, Tecnología, Datos).
- **Categorización Automática en la UI:**
  - La planificación de IA en `script.js` sugerirá una categoría idónea ("ciencia", "derecho", "economia", "historia", "tecnologia", "datos", o "general").
  - El backend (`server.js` y `researcher.py`) propagará este parámetro de categoría a la búsqueda de DuckDuckGo.
- **Inyección de Bibliografía y Enlaces Reales:**
  - El backend enviará la lista estructurada de enlaces exitosamente scrapeados junto con el reporte.
  - El frontend agregará al final de la síntesis de la IA el listado real de referencias formateado en Markdown con enlaces cliqueables directos, eliminando la alucinación de links de la IA.

## Capabilities

### New Capabilities
- `research-prioritized`: Investigación temática con filtros adaptativos de fuentes.md y referencias de enlaces reales al final del reporte.

### Modified Capabilities

## Impact

- **Backend (`server.js` y `researcher.py`):** Modificados para recibir e integrar el parámetro de categoría en la búsqueda y retornar la estructura de enlaces reales.
- **Scraper (`buscadores/scraper.py`):** Modificado para extraer dominios por sección de `fuentes.md` y filtrar DuckDuckGo por categoría.
- **Frontend (`script.js` e `index.html`):** Modificados para integrar el selector de categorías y renderizar el listado final de fuentes reales con enlaces Markdown.
