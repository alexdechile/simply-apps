## Why

Añadir capacidades de análisis lingüístico avanzadas y locales al componente `simply-analyzer` escrito en Rust, permitiendo calcular el índice de legibilidad Flesch-Szigriszt (optimizado para español) y detectar repetición excesiva de palabras clave (densidad) junto con sugerencias de sinónimos integrados.

## What Changes

- **simply-analyzer (Rust):**
  - Implementar algoritmo heurístico de división silábica en español.
  - Implementar la fórmula de legibilidad Flesch-Szigriszt.
  - Detectar repeticiones excesivas de palabras de más de 4 caracteres.
  - Proveer un diccionario ligero integrado de sinónimos para palabras comunes sobreutilizadas.
- **Frontend (script.js e index.html):**
  - Mostrar los resultados del análisis lingüístico en tiempo real (legibilidad e interpretación en el panel de estadísticas).
  - Listar las palabras sobreutilizadas con sus sinónimos sugeridos en un panel en la UI.

## Capabilities

### New Capabilities
- `analyzer-linguistics`: Análisis lingüístico nativo en Rust incluyendo legibilidad Flesch-Szigriszt y alertas de sobreuso de palabras con sinónimos.

### Modified Capabilities

## Impact

- **Analizador (`simply-analyzer`):** Actualización de la lógica del binario en Rust y re-compilación del ejecutable.
- **UI (`script.js` y `index.html`):** Nuevos campos en el panel de estadísticas del editor.
