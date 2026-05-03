# Gemini CLI - Bitácora de Trabajo

## Sesiones [2026-04-27]

### Reparación de Inyección de Síntesis IA
- **Problema:** El editor no se actualizaba visualmente tras la inyección de contenido IA (botones "Pensar" e "Investigar"). Causado por cambios previos de scroll sincronizado.
- **Solución:**
  - Migré a API directa de CodeMirror: `cm.getDoc().setValue()`
  - Añadí limpieza automática de bloques ` ```markdown `
  - Llamé a `cm.refresh()` para forzar repintado
  - Sincronicé manualmente vista de preview y contador de caracteres
  - Implementé guardado/restauración de scroll
- **Resultado:** Inyección inmediata y visible en ambos paneles.

### Solución a Error 504 Gateway Timeout
- **Problema:** Investigaciones con mucha información (12KB+) causaban timeout 504.
- **Solución:**
  - `server.timeout = 120000` y `server.keepAliveTimeout = 125000` en `server.js`
  - `AbortController` con timeout de 120s en función `callAI`
  - Manejo de errores para `AbortError`
- **Resultado:** Síntesis largas se completan sin error.

### Seguridad: Migración a Variables de Entorno
- **Problema:** API Key de DeepInfra hardcodeada en `server.js`.
- **Solución:**
  - Creé archivo `.env` con `DEEPINFRA_API_KEY`
  - Instalé `dotenv` (`npm install dotenv`)
  - Creé `.gitignore` robusto
- **Resultado:** Credenciales protegidas, no se suben al repositorio.

---

## Sesiones [2026-05-01] — opencode

### Reparación Definitiva de Inyección desde Modal
- **Problema:** La inyección fallaba sistemáticamente al usar el evento `hidden.bs.modal`. El editor EasyMDE perdía el contexto o no procesaba el comando `value()` a tiempo.
- **Lección aprendida:** **NUNCA** inyectar contenido al editor dentro de eventos de cierre de modales de Bootstrap (`hidden.bs.modal`) si se requiere fiabilidad inmediata.
- **Solución Final:** 
  - Se movió la lógica al evento `onclick` del botón "Inyectar".
  - Se migró de `easyMDE.value()` a la API directa de CodeMirror: `cm.getDoc().setValue(newContent)`.
  - Se añadieron llamadas explícitas a `cm.refresh()` y `cm.focus()` para forzar el repintado y asegurar que el editor esté listo para el usuario.
  - Se implementó scroll automático al final del documento tras la inyección.
- **Resultado:** Inyección instantánea y 100% fiable.

### Fuentes de Investigación y archive.org
- **Consulta:** ¿Se incluye `archive.org` como fuente?
- **Estado:** Confirmado. `archive.org` está listado en `archivos/fuentes.md` bajo la categoría de **Historia y humanidades**. El sistema lo prioriza automáticamente en búsquedas profundas.

### Estabilidad de la Interfaz (Frontend)
...
- **Resultado:** Interfaz fluida, sin errores en consola y con previsualización activa.

### Migración a Servicio Systemd
- **Motivación:** Eliminar la dependencia de scripts manuales y asegurar persistencia.
- **Implementación:** 
  - Se creó `simply-apps.service` en `~/.config/systemd/user/`.
  - Configurado para reinicio automático (`Restart=always`).
  - Redirección de logs a `simply.log`.
- **Comandos Útiles:**
  - `systemctl --user restart simply-apps.service` (para aplicar cambios de código).
  - `systemctl --user status simply-apps.service` (verificar si corre).


