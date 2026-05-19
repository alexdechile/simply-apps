# Memory - Simply Apps

## Contexto del Proyecto
- **Nombre:** Simply Apps
- **Servidor:** Express en puerto 1717 (Servicio Systemd)
- **Servicio:** `simply-apps.service` (Nivel usuario)

## Gestión del Servidor (Systemd)
Ahora la app corre como un servicio de fondo:
- **Iniciar:** `systemctl --user start simply-apps.service`
- **Detener:** `systemctl --user stop simply-apps.service`
- **Reiniciar:** `systemctl --user restart simply-apps.service`
- **Ver Logs:** `tail -f simply.log` o `journalctl --user -u simply-apps.service -f`
- **Estado:** `systemctl --user status simply-apps.service`


## Stack Tecnológico
- **Backend:** Node.js + Express (`server.js`)
- **Frontend:** HTML/CSS/JS vanilla (`index.html`, `style.css`, `script.js`)
- **Editor:** EasyMDE / CodeMirror (panel izquierdo)
- **Preview:** Panel derecho con vista formateada (`output`)
- **IA API:** DeepInfra (key en `.env` como `DEEPINFRA_API_KEY`)
- **IA Local:** **aichat** (CLI en Rust) para pulido de texto y **sugerencia de ideas**
- **Análisis:** **simply-analyzer** (Rust nativo) para métricas avanzadas
- **Python:** `researcher.py` (Scrapling), `exporter.py` (docx/xlsx/html)

## Configuración de Timeout
- `server.timeout = 120000` (120s)
- `server.keepAliveTimeout = 125000`
- Frontend usa `AbortController` con límite de 120s

## Archivos Clave
| Archivo | Propósito |
|---|---|
| `server.js` | Backend Express, proxy IA, endpoints `/ask-ai`, `/research`, `/export`, `/save-to-vault`, `/ai-polish`, `/ai-suggest`, `/ai-analyze` |
| `script.js` | Lógica frontend completa (editor, IA, pulido, sugerencias, análisis Rust, modales) |
| `simply-analyzer/` | Proyecto Rust para análisis de texto de alto rendimiento |
| `editor.js` | Legacy (Tiptap) — NO se usa, el editor activo es EasyMDE en `script.js` |
| `index.html` | Estructura, modales, toolbar |
| `style.css` | Estilos, temas, animaciones modal |
| `.env` | Variables de entorno (DEEPINFRA_API_KEY) |
| `iniciar.sh` | Mata servidor anterior, arranca Express en 1717, abre navegador |

## Lecciones Aprendidas
1. **IA cleanup:** La IA siempre incluye bloques ` ```markdown ` — limpiar con regex antes de mostrar/inyectar.
2. **Timeouts:** Síntesis largas (12KB+) requieren 120s mínimo en servidor y frontend.
3. **Seguridad:** API keys en `.env` + `dotenv` + `.gitignore`, nunca hardcodeadas.
4. **Cierre de Modales:** Evitar lógica de negocio crítica (como actualizaciones de editor) en eventos `hidden.bs.modal`. Usar los disparadores de acción (`onclick`) para asegurar el contexto.
5. **Fuentes:** `archive.org` es una fuente prioritaria configurada en `archivos/fuentes.md`.
6. **Robustez UI:** Siempre verificar que los elementos del DOM existen antes de asignar eventos (evitar `TypeError: null`).

## Problemas Resueltos: Inyección del modal al editor
- **Estado:** ✅ SOLUCIONADO (Definitivo)
- **Causa:** El evento `hidden.bs.modal` de Bootstrap ocurre en una fase de transición donde el editor CodeMirror puede tener el foco suspendido o el estado inestable. `easyMDE.value()` es una abstracción que a veces falla en estos estados.
- **Solución:** 
  1. Inyectar el contenido usando la API directa de CodeMirror: `easyMDE.codemirror.getDoc().setValue()`.
  2. Ejecutar la inyección en el handler `onclick` del botón, **antes** de disparar el cierre del modal.
  3. Llamar a `cm.refresh()` y `cm.focus()` inmediatamente después.
- **Resultado:** Actualización instantánea, scroll automático al final y estabilidad garantizada.


## Persistencia
- Editor: `localStorage` → `simply-editor-content`
- Tono: `localStorage` → `simply-tone`
- Tema: `localStorage` → `simply-theme`
- Prompts: `localStorage` → `p_fb_col`, `p_fb_com`, `p_fb_neu`, `p_x`, `p_li`
- X/LI generados: `localStorage` → `simply-x-content`, `simply-li-content`
- Síntesis pendiente: `localStorage` → `simply-pending-research`

## Archivos Ignorados por Git
- `.env`, `venv/`, `node_modules/`, `__pycache__/`, `simply.log`
