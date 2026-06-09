# Bitácora de Agentes - Simply Apps

## [2026-04-27] Reparación de Inyección de Síntesis IA
**Agente:** Gemini CLI

### Problema Identificado:
El editor de texto (panel izquierdo) no se actualizaba visualmente después de que la IA procesaba una solicitud (botones "Pensar" e "Investigar"). El problema surgió tras la implementación del scroll sincronizado, lo que causaba que CodeMirror no redibujara el contenido inyectado a través de los métodos estándar de EasyMDE.

### Acciones Realizadas:
1.  **Robustecimiento de Inyección (script.js):**
    *   Se migró el método de inserción de `easyMDE.value()` a la API directa de CodeMirror: `cm.getDoc().setValue()`.
    *   Se implementó una limpieza automática de bloques de código markdown (` ```markdown `) que la IA solía incluir por error.
2.  **Corrección Visual y UI:**
    *   Se añadieron llamadas explícitas a `cm.refresh()` para forzar el repintado del editor y el recálculo de alturas de línea.
    *   Se añadió sincronización manual de la vista de previsualización (`output`) y actualización del contador de caracteres durante la inyección.
3.  **Preservación de Estado:**
    *   Se implementó la lógica para guardar y restaurar la posición del scroll antes y después de la inyección.
4.  **Reinicio del Sistema:**
    *   Se ejecutó el script `iniciar.sh` para reiniciar el servidor Express (puerto 1717) y asegurar que todos los cambios en el backend y frontend estén activos.

### Resultado:
La inyección ahora es inmediata y visible. Al aceptar el cuadro de confirmación, el texto aparece en el editor izquierdo y su versión formateada en el derecho instantáneamente.

## [2026-04-27] Solución a Error 504 Gateway Timeout (Síntesis Largas)
**Agente:** Gemini CLI

### Problema Identificado:
Al realizar investigaciones con mucha información (ej: 12KB+), la IA tardaba más de lo que permitía el servidor o el proxy, devolviendo un error 504.

### Acciones Realizadas:
1.  **Ajuste de Servidor (server.js):**
    *   Se configuró explícitamente `server.timeout = 120000` (120 segundos).
    *   Se configuró `server.keepAliveTimeout = 125000`.
2.  **Ajuste de Frontend (script.js):**
    *   Se implementó `AbortController` en la función `callAI` con un límite de 120 segundos para evitar que el navegador cierre la conexión antes de tiempo.
3.  **Resiliencia:**
    *   Se añadió manejo de errores específico para el caso de "AbortError" (Timeout).

## [2026-05-01] Reparación Definitiva y Estabilización (Sesión Intensiva)
**Agente:** Gemini CLI

### Problema Identificado:
Sesión de depuración extendida (>2 horas) debido a fallos intermitentes en la inyección de contenido IA, errores de autorización y bloqueos de la interfaz (`TypeError`). La causa raíz fue una combinación de eventos de modal inoportunos y pérdida de dependencias funcionales en el frontend.

### Acciones Realizadas:
1.  **Cambio de Paradigma en Inyección:**
    *   Se abandonó el uso de eventos `hidden.bs.modal` para lógica de edición.
    *   Se migró a la API directa de CodeMirror (`cm.getDoc().setValue()`) invocada desde el `onclick` del botón, garantizando que la inyección ocurra mientras el editor está activo.
    *   Se añadieron comandos de sincronización forzada: `cm.refresh()`, `cm.focus()` y scroll automático al final.
2.  **Saneamiento de API e Infraestructura:**
    *   Se migró el modelo IA a `nvidia/Llama-3.1-Nemotron-70B-Instruct` por su superior relación costo-beneficio.
    *   Se implementó saneamiento de API Key (`.trim()`) para evitar errores de autorización por caracteres invisibles.
    *   Se optimizó `iniciar.sh` con `fuser -k` para asegurar reinicios limpios del servidor.
3.  **Restauración de Integridad Frontend:**
    *   Se re-implementaron funciones críticas de utilidad Unicode que se habían perdido.
    *   Se corrigió la falta de la etiqueta `<emoji-picker>` en el HTML y se robusteció su carga en JS.
4.  **Confirmación de Fuentes:**
    *   Se verificó la inclusión de `archive.org` en el catálogo de fuentes fiables.

5.  **Migración a Servicio de Sistema:**
    *   Se configuró `simply-apps.service` como un servicio de usuario en Systemd.
    *   Esto permite que la aplicación esté siempre disponible sin necesidad de ejecutar scripts manualmente.

### Resultado:
Sistema 100% operativo y persistente. Inyección instantánea, previsualización Unicode activa y gestión mediante comandos de sistema (`systemctl`).

## [2026-05-18] Integración de IA Local (aichat) y Motor Rust
**Agente:** Gemini CLI

### Acciones Realizadas:
1.  **Integración de aichat (IA Local):**
    *   Implementación del endpoint `/ai-polish` en `server.js` que utiliza el CLI `aichat` para corrección ortográfica y de estilo.
    *   Se configuró el uso de la ruta absoluta (`/home/alexdechile/.cargo/bin/aichat`) y el flag `-S` (no-stream) para garantizar estabilidad en el entorno del servidor.
2.  **Motor de Análisis en Rust:**
    *   Creación y compilación del proyecto `simply-analyzer` en Rust.
    *   Implementación del endpoint `/ai-analyze` para cálculo de métricas avanzadas: Densidad Léxica, Tiempo de Lectura, Conteo de Oraciones y Palabras Clave.
3.  **Mejoras en UI y Frontend:**
    *   Nuevo botón **✨ Pulir** con estilo degradado y efectos visuales.
    *   Panel de estadísticas renovado con métricas en tiempo real (debounced a 500ms).
4.  **Actualización de Documentación:**
    *   Se actualizaron `DESIGN.md` y `memory.md` para reflejar el nuevo stack tecnológico híbrido (Node.js + Rust + IA).

### Resultado:
La aplicación ahora cuenta con una capa de inteligencia local ultra-rápida y análisis lingüístico avanzado, funcionando sin errores de endpoint (404) ni de rutas.

## [2026-05-18] Capa de Pensamiento Sugerido
**Agente:** Gemini CLI

### Acciones Realizadas:
1.  **Implementación de /ai-suggest:**
    *   Nuevo endpoint en `server.js` que utiliza `aichat` con un prompt de sistema orientado a la creatividad y sugerencia de ideas/párrafos.
2.  **Integración en UI:**
    *   Añadido botón **💡 Sugerir** en el header, al lado de **✨ Pulir**.
    *   Lógica en `script.js` para llamar al endpoint y ofrecer la inyección (apéndice) mediante un cuadro de confirmación que muestra las sugerencias primero.
3.  **Documentación:**
    *   Actualización de `DESIGN.md` para incluir la nueva funcionalidad en la arquitectura.

### Resultado:
El usuario ahora puede solicitar ideas y párrafos adicionales a la IA local mientras escribe, facilitando el proceso creativo sin salir del editor.

## [2026-06-06] Fix: aichat usa NVIDIA en Simply, Ollama en CLI
**Agente:** opencode

### Problema Identificado:
El botón **🧂 Decorar** (y los otros endpoints que usan `aichat`: Pulir y Sugerir) fallaban intermitentemente porque `aichat` tenía configurado `Ollama:llama3.1:8b` como modelo default, y Ollama en `http://100.79.6.19:11434` respondía de forma inestable.

### Acción Realizada:
Se modificó `server.js` para que los 3 endpoints que llaman a `aichat` especifiquen explícitamente el modelo NVIDIA mediante `--model NVIDIA:meta/llama-3.3-70b-instruct`:
- `POST /ai-polish` (línea 419)
- `POST /ai-decorate` (línea 450)
- `POST /ai-suggest` (línea 480)

### Resultado:
- `aichat` desde Simply Apps usa **NVIDIA** como modelo, evitando la inestabilidad de Ollama.
- `aichat` en la línea de comandos (CLI) **sigue usando Ollama** como default, sin cambios en `~/.config/aichat/config.yaml`.


