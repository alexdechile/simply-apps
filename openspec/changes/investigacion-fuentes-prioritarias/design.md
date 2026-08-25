## Context

Ver `proposal.md` para la motivación. Actualmente `buscadores/scraper.py` implementa `get_prioritized_domains()` leyendo todos los dominios de `fuentes.md` de forma genérica. `researcher.py` produce un texto plano que Express redirecciona sin mayor estructuración.

## Goals / Non-Goals

**Goals:**
- Agrupar los dominios de `fuentes.md` según su sección temática (Ciencia, Derecho, Economía, Historia, Tecnología, Datos).
- Permitir la selección o detección de categoría en la UI y pasarla hasta Python.
- Retornar un JSON desde `researcher.py` con el reporte en crudo y la lista de enlaces exitosos para evitar la alucinación de URLs de la IA.

**Non-Goals:**
- No se alterará el motor de scraping basado en Scrapling ni el uso de DuckDuckGo HTML.

## Decisions

### 1. Parser Temático de `fuentes.md`
- **Decisión:** Modificar `get_prioritized_domains` en `buscadores/scraper.py` para aceptar un argumento `category`. Si se provee, el script leerá el archivo por secciones (delimitadas por `##`) y extraerá únicamente los dominios de la sección que coincida con la categoría solicitada.
- **Mapeo de Categorías:**
  - `ciencia` -> `## 🔬 Ciencia y medicina`
  - `derecho` -> `## ⚖️ Derecho y política pública`
  - `economia` -> `## 📊 Economía y finanzas`
  - `historia` -> `## 📜 Historia y humanidades`
  - `tecnologia` -> `## 💻 Tecnología e IA`
  - `datos` -> `## 📈 Datos y estadísticas`

### 2. Salida Estructurada JSON en `researcher.py`
- **Decisión:** Hacer que `researcher.py` escriba un objeto JSON en `stdout` en lugar de texto libre. El JSON tendrá el formato:
  `{"full_report": "...", "links": [{"title": "...", "url": "..."}, ...]}`
  Donde `links` contendrá únicamente las fuentes que fueron scrapeadas con éxito.
- **Razón:** Permitir a Express y a la interfaz frontend aislar el texto fuente para la síntesis de la lista exacta de links para la bibliografía real.

### 3. Modificación del Flujo en el Frontend
- **Decisión:** En `index.html` (dentro del modal de investigación), añadir un elemento `<select id="researchCategory">` con las categorías temáticas. En `script.js`, el Paso 1 de planificación por IA también detectará la categoría idónea y la pre-seleccionará en la UI. Al final del Paso 4 (síntesis), el script agregará de forma programática un bloque `### 📚 Referencias Reales` al final del editor usando los links reales devueltos por el backend.

## Risks / Trade-offs

*   **[Riesgo] Coincidencia de categorías no detectada** → **Mitigación:** Si la categoría solicitada no se encuentra o es "general", `get_prioritized_domains` retornará todos los dominios de `fuentes.md` como fallback (comportamiento actual).
*   **[Riesgo] Malformación de JSON en Python** → **Mitigación:** Toda la salida del script Python hacia stdout se generará usando la librería estándar `json.dumps()` para garantizar un parseo robusto en Node.js.
