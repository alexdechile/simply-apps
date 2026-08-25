## Purpose

Esta capability permite a los usuarios realizar investigaciones temáticas más eficientes, filtrando y priorizando dinámicamente los dominios del archivo fuentes.md correspondientes al tema detectado, y asegurando la inclusión de un listado de referencias reales con enlaces directos clicables al final del reporte generado.

## ADDED Requirements

### Requirement: Búsqueda Temática Priorizada por Categoría
El sistema SHALL permitir al usuario realizar una investigación asociándola a una categoría específica de fuentes (Ciencia, Derecho, Economía, Historia, Tecnología, Datos o General), priorizando en la búsqueda de DuckDuckGo los dominios de la sección correspondiente en fuentes.md.

#### Scenario: Búsqueda sobre ciencia prioriza PubMed y arXiv
- **WHEN** el usuario inicia una investigación con la categoría establecida en "Ciencia y medicina".
- **THEN** el sistema recupera únicamente los dominios de la sección Ciencia de fuentes.md y reordena los resultados de DuckDuckGo para posicionar estos dominios en primer lugar antes del scraping.

### Requirement: Retorno de Referencias Reales sin Alucinación
El sistema SHALL incluir al final del reporte generado un listado estructurado de referencias (título de la fuente y su enlace Markdown clicable) correspondiente únicamente a las URLs que el scraper Python logró procesar exitosamente.

#### Scenario: Inyección exitosa de enlaces reales en el reporte
- **WHEN** la IA finaliza la síntesis de investigación.
- **THEN** el frontend concatena al final del texto un bloque estructurado titulado "### 📚 Referencias Reales" con la lista de títulos y enlaces clicables obtenidos en el backend.
