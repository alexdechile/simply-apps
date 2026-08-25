## Context

Ver `proposal.md` para la motivación. Actualmente `server.js` implementa comandos usando la herramienta CLI `aichat` en su versión segura (`spawn`) para el endpoint `/ai-decorate`, mientras que `/ai-polish` y `/ai-suggest` usan `exec` de Node. Para las nuevas rutas, se estandarizará el uso de `spawn` con el fin de evitar vulnerabilidades de inyección de comandos o fallos con caracteres especiales.

## Goals / Non-Goals

**Goals:**
- Implementar `/ai-thread`, `/ai-copywrite` y `/ai-hooks` en `server.js`.
- Proveer botones de fácil acceso en la interfaz web de Simply Apps.
- Asegurar que la salida de la IA sea limpia (sin envoltorios markdown innecesarios como ```markdown).

**Non-Goals:**
- No se reemplazará la integración directa con DeepInfra en `/ask-ai`.
- No se modificará el analizador de Rust ni el flujo de búsqueda de scraper.py en esta etapa.

## Decisions

### 1. Estandarización de `spawn` para llamadas a `aichat`
- **Decisión:** Implementar todas las nuevas recetas (`/ai-thread`, `/ai-copywrite`, `/ai-hooks`) utilizando la función `spawn` de Node.js en vez de `exec`.
- **Razón:** El contenido a procesar puede tener comillas simples, dobles o saltos de línea complejos. `exec` requiere un escape manual minucioso que a menudo falla, mientras que `spawn` escribe directamente en `stdin`, lo cual es 100% seguro contra inyección de comandos.

### 2. Diseño de la UI: Panel de Recetas de IA
- **Decisión:** Agregar un nuevo dropdown o sección de botones "Recetas IA ✨" en la barra de herramientas del editor.
- **Razón:** Mantener la barra limpia sin saturar el espacio horizontal con 4 botones nuevos. Un dropdown colapsable es la mejor alternativa visual.

## Risks / Trade-offs

*   **[Riesgo] Latencia de red con NVIDIA NIM / DeepInfra** → **Mitigación:** Deshabilitar los botones de acción e indicar el estado de carga ("Generando hilo...", "Escribiendo PAS...") para evitar clics dobles y dar feedback visual.
*   **[Riesgo] Formato no deseado en la respuesta (bloques ```markdown)** → **Mitigación:** Aplicar la regex de limpieza que ya usa Simply Apps en script.js para remover bloques de código markdown que a veces los LLMs incluyen por inercia.
