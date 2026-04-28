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

## [2026-04-27] Seguridad: Migración a Variables de Entorno (.env)
**Agente:** Gemini CLI

### Acciones Realizadas:
1.  **Desacoplamiento de Credenciales:**
    *   Se eliminó la API Key de DeepInfra hardcodeada en `server.js`.
    *   Se creó un archivo `.env` (ignorado por Git) para almacenar `DEEPINFRA_API_KEY`.
2.  **Gestión de Dependencias:**
    *   Se instaló `dotenv` (`npm install dotenv`) para gestionar las variables de entorno.
3.  **Protección de Repositorio:**
    *   Se creó un archivo `.gitignore` robusto para evitar subir credenciales, entornos virtuales o carpetas de dependencias al repositorio.
