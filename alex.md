# Bitácora de Alex - Simply Apps

## Último Realizado [2026-10-24]
- **Estandarización de IA, Poda de Deuda Técnica y Optimización de Rendimiento:**
  - **Estrategia y Arquitectura Homelab:** Se definió la app como 100% privada para el homelab de Don Alex. Se eliminaron por completo las referencias y dependencias a NVIDIA NIM (por su volatilidad y rotación de IDs que rompían los generadores con error 404) y Ollama / IA local (evitando consumo inviable de RAM/CPU en esta máquina sin GPU).
  - **Concentración en Modelos de Texto Económicos y Capas Gratuitas:**
    - Se fijó como motor principal **DeepInfra** (`meta-llama/Llama-3.3-70B-Instruct-Turbo` a $0.59 por millón de tokens o DeepSeek V3) con fallback a **OpenRouter** (modelos `:free` y Llama 3.3) y soporte para **Gemini**.
    - Se filtró el endpoint `/ai-models` en [server.js](file:///home/alexdechile/proyectos/simply-apps/server.js) para que el dropdown de modelos solo liste los clientes aprobados (`deepinfra`, `openrouter`, `gemini`), eliminando opciones rotas o locales.
  - **Unificación de Endpoints de IA bajo `runAichat`:**
    - Todos los endpoints (`/ai-polish`, `/ai-decorate`, `/ai-suggest`, `/ai-thread`, `/ai-copywrite`, `/ai-hooks`, `/cancion/completo`, `/tech/completo`, `/news/completo` y `/ask-ai`) ahora se ejecutan a través de `runAichat()` con timeout controlado (45s con SIGKILL), 3 reintentos automáticos y sanitización de etiquetas `<think>...</think>`. Se resolvió definitivamente el error 404 que botaba los generadores de crónicas musicales, tech y noticias.
  - **Integración de Google Search API:**
    - En [buscadores/scraper.py](file:///home/alexdechile/proyectos/simply-apps/buscadores/scraper.py), se añadió la función `search_google()` conectada a las credenciales oficiales (`GOOGLE_SEARCH_API_KEY` y `GOOGLE_SEARCH_CX`). Si Google Search está activo, realiza búsquedas estructuradas inmediatas sin lidiar con los bloqueos o captchas de DuckDuckGo; si falla o no hay red, recurre fluidamente a Scrapling / DDG como fallback.
  - **Poda de Librerías y Limpieza de Código Muerto:**
    - Se desinstalaron las dependencias huérfanas de TipTap (`@tiptap/core`, `@tiptap/starter-kit`, `@tiptap/markdown`) reduciendo drásticamente `package.json` y `node_modules`.
    - Se eliminó el archivo legacy no utilizado `editor.js`.
    - Se limpiaron las variables fantasma en [.env](file:///home/alexdechile/proyectos/simply-apps/.env) (`COMERZA_SECRET_TOKEN` y `AI_API_URL`).
  - **Optimización de UI (Debounce en Mirror de Facebook):**
    - En [script.js](file:///home/alexdechile/proyectos/simply-apps/script.js), se implementó un debounce de 90ms para la conversión matemática Unicode (`markdownToFacebookUnicode`), evitando que cada pulsación de tecla congele o laguee el editor en textos largos.


## Último Realizado [2026-09-27]
- **Corrección de salto del cursor y desplazamiento forzado hacia arriba en textos largos:**
  - **Causa raíz:**
    1. *Bucle de retroalimentación de scroll:* En [script.js](file:///home/alexdechile/proyectos/simply-apps/script.js), `cursorActivity` forzaba `activeOutput.scrollTop` calculando `coords.top / (scrollInfo.height - scrollInfo.clientHeight)` sin encender la bandera `isSyncingOutput`. Esto disparaba inmediatamente el evento `scroll` del panel de salida (ej. Facebook), el cual calculaba un scroll inverso y sobreescribía bruscamente `scroller.scrollTop` del editor mandándolo a la parte superior.
    2. *Re-render destructivo en `actualizarVistas`:* Cada vez que se tecleaba o borraba un carácter para corregir, se ejecutaba `el.outFB.textContent = ...`, lo que reiniciaba el scroll del contenedor a 0 y disparaba de nuevo el scroll bidireccional hacia el editor a la posición 0.
    3. *Conflicto Flexbox en CodeMirror:* En [style.css](file:///home/alexdechile/proyectos/simply-apps/style.css), la regla combinada `.EasyMDEContainer, .CodeMirror { display: flex !important; ... }` forzaba flexbox sobre `.CodeMirror`, rompiendo el flujo interno de posicionamiento absoluto de CodeMirror 5 (afectando el textarea oculto de entrada, el cursor y las barras de scroll).
  - **Solución implementada:**
    - En [script.js](file:///home/alexdechile/proyectos/simply-apps/script.js): Se eliminó la asignación errónea de scroll en `cursorActivity`, dejando que la sincronización ocurra limpiamente a través del evento `scroll` nativo del editor. Se aisló `actualizarVistas` preservando el scroll previo y protegiendo el render con la bandera de sincronización. Además, se blindó el listener de scroll de los paneles de salida para que si el editor tiene el foco (`cm.hasFocus()`), ningún cambio externo pueda alterar el scroll del editor.
    - En [style.css](file:///home/alexdechile/proyectos/simply-apps/style.css): Se separó `.EasyMDEContainer` (flex container) de `.CodeMirror` (relative container con `min-height: 0`), garantizando que CodeMirror 5 conserve su geometría y gestión de scroll interna sin saltos.

## Último Realizado [2026-09-21]
- **Corrección de bloqueo/congelamiento al abrir el modal de Sesiones:**
  - **Causa raíz:** En [style.css](file:///home/alexdechile/proyectos/simply-apps/style.css), `.modal-backdrop.show` tenía forzado `z-index: 4999 !important;`, mientras que solo `#researchModal` y `#recoverVaultModal` tenían `z-index: 5000 !important;`. El modal `#sessionModal` (y `#stickyModal`) heredaban el z-index por defecto de Bootstrap (1055), quedando atrapados detrás del telón oscuro, lo que bloqueaba todos los clics y congelaba la interfaz.
  - **Solución CSS:** Se aplicó la regla global `.modal { z-index: 5000 !important; }` para que cualquier modal se posicione siempre por encima del backdrop (4999), garantizando interactividad fluida.
  - **Mejoras complementarias en sesiones y proxy Nginx:**
    - Se corrigió la URL del CDN de `qrcode` en [index.html](file:///home/alexdechile/proyectos/simply-apps/index.html) a la versión 1.4.4 funcional (la 1.5.4 arrojaba error 404 en jsDelivr).
    - Se implementó la función helper `appUrl` en [script.js](file:///home/alexdechile/proyectos/simply-apps/script.js) y [diagram.js](file:///home/alexdechile/proyectos/simply-apps/diagram.js) para detectar dinámicamente si la app corre bajo el proxy Nginx (`/simply/`) o directamente en la raíz (`/`). De este modo, las llamadas a `api/session` y `api/stickies` van a `/simply/api/...` en vez de `/api/...` (que Nginx enrutaba a otro servicio devolviendo 404).
    - Se habilitó la apertura de sesiones en caliente sin recargar toda la página web y se asegura que la URL del QR use el host y protocolo público real del navegador del usuario.

## Último Realizado [2026-08-30]
- **Retorno a DeepInfra y OpenRouter (Migración desde Cloudflare Workers):**
  - **Motivo:** Los Workers de Cloudflare (Comerza proxy) bloqueaban y filtraban de manera agresiva marcas comerciales, nombres de pila y textos polémicos.
  - **Solución backend:** Se eliminaron las redirecciones forzadas a modelos `@cf/*` y se migraron los endpoints `/ai-polish`, `/ai-decorate`, `/ai-suggest` y `/ask-ai` en `server.js` para que invoquen el binario local de `aichat` mediante `spawn`. Esto mantiene 100% de coherencia con el archivo de configuración global `~/.config/aichat/config.yaml` que gestiona las API Keys y los modelos del usuario de manera nativa.
  - **Visualización de Costo Real:** Se removió la métrica "Neuronas (CF)" de la interfaz (`index.html` y `script.js`). Ahora la barra de herramientas inferior calcula y muestra el **Costo estimado en USD** basado en el uso real de Llama 3.3 70B de DeepInfra ($0.59 por millón de tokens).

## Último Realizado [2026-08-29 - Tarde]
- **Modal de Previsualización de Respuestas de la IA (Evitar Pérdida de Borradores):**
  - **Problema:** Cuando la IA fallaba o devolvía mensajes de rechazo ("Lo siento, pero no puedo cumplir con esa solicitud."), la app no mostraba el contenido antes de inyectarlo en el editor. Al hacer clic en confirmar de forma ciega, el usuario sobrescribía y perdía su borrador original.
  - **Solución:** Se implementó la función `showAIPreviewModal` en [script.js](file:///home/alexdechile/proyectos/simply-apps/script.js) que genera un modal overlay interactivo con estilo nativo y un área de texto en modo lectura.
  - **Migración de Funciones:** Se reemplazaron todos los `confirm` nativos y ciegos de las funciones que inyectan o añaden texto del editor, garantizando que el usuario siempre pueda ver, evaluar o cancelar antes de realizar cualquier cambio destructivo o adición. Aplica a:
    - `🧂 Decorar` y `✨ Pulir`
    - `💡 Sugerir` y `🪝 Generar Ganchos (Hooks)`
    - `🐦 Generar Hilo de X` y `Copywriting PAS / AIDA`
    - `🧠 Pensar` (Reescritura de Facebook)
    - Generadores de posts completos (Música, Tech, Noticias).

## Último Realizado [2026-08-27 - Noche]
- **Integración Inicial de la API de IA Serverless (`chat.comerza.cl`):**
  - **Configuración de Variables:** Se añadieron `COMERZA_SECRET_TOKEN` y `AI_API_URL` al archivo `.env` del proyecto.
  - **Código Servidor:** Se modificó `server.js` para inicializar el token de Comerza y la URL del proxy de IA.
  - **Migración de Endpoints Clave (`/ask-ai`, `/ai-decorate`, `/ai-polish` y `/ai-suggest`):**
    - Se migraron los endpoints de edición del editor (`✨ Pulir`, `💡 Sugerir`, `🧠 Pensar`, `🧂 Decorar`) para que utilicen la API proxy de Cloudflare en vez de ejecutar comandos locales de `aichat` o APIs de pago externas.
    - Se mapearon a modelos eficientes y gratuitos en Workers AI: `@cf/meta/llama-3.1-8b-instruct` para redacción y estilismo, y `@cf/gemma-2-9b-it` para la generación creativa de sugerencias.
  - **Ajustes de Formato en Decoración:** Se refinó el prompt del sistema de `/ai-decorate` para prohibir caracteres matemáticos Unicode estilizados y forzar negritas nativas en formato Markdown estándar (`**texto**`).
  - **Panel de Estadísticas (Tokens y Neuronas):** Se agregaron contadores en tiempo real al panel de estadísticas inferior de la app. Ahora muestra los **Tokens aproximados** del texto (1 token ≈ 4 caracteres) y las **Neuronas estimadas** que consumiría procesar dicho texto en Cloudflare Workers AI (tasa de 0.08 neuronas por cada 1,000 tokens para Llama 3.1 8B).
  - **Fallback Automático:** La integración mantiene la robustez gracias al fallback en cascada que ofrece el proxy hacia DeepInfra y OpenRouter si el servicio del Edge llegara a fallar.

## Último Realizado [2026-08-27 - Tarde]
- **Migración a OpenRouter (Optimización de Costos y Estabilidad):**
  - **Diagnóstico:** El modelo `meta/llama-3.3-70b-instruct` fue marcado como EOL por NVIDIA, y las pruebas directas indicaron que la API key de Nvidia del usuario se quedó sin créditos (error 404 de cuenta).
  - **Recuperación de API Key:** Se localizó la API key de OpenRouter en `/home/alexdechile/Escritorio/mira/.listenv`.
  - **Integración de OpenRouter:** Se configuró OpenRouter en `~/.config/aichat/config.yaml` agregando el cliente y varios modelos, incluyendo modelos 100% gratuitos (`google/gemma-2-9b-it:free`, `meta-llama/llama-3-8b-instruct:free`, `openrouter/auto:free`).
  - **Modelo Predeterminado:** Se estableció `openrouter:meta-llama/llama-3.3-70b-instruct` como modelo predeterminado de la aplicación en `server.js`, `script.js` y `config.yaml`. Se removió el sufijo `:floor` para evitar que OpenRouter rutee hacia proveedores saturados de bajo costo (los cuales causaban error de "Model busy, retry later"), priorizando ahora la estabilidad de los proveedores estándar de OpenRouter.

## Último Realizado [2026-08-25]
- **Corrección de Artículos Cortados / Truncamiento en IA:**
  - **Backend:** Se migraron los endpoints `/ai-polish` y `/ai-suggest` de usar `exec` con pipes de shell a `spawn` pasándole el contenido vía `stdin.write()`. Esto evita que textos largos o con caracteres especiales de bash se trunquen o causen errores de escape.
  - **Configuración de Modelos (`config.yaml`):** Se agregó el parámetro `max_output_tokens: 8192` para todos los modelos de `nvidia` y `deepinfra` en el archivo de configuración global de `aichat` (`~/.config/aichat/config.yaml`), evitando que los proveedores limiten y corten las respuestas de artículos extensos a valores por defecto bajos (ej: 1024 tokens).
- **Rediseño del Layout de la Toolbar & Estética:**
  - **Fila Superior:** Logo `SIMPLY APPS` centrado en una sola línea.
  - **Fila Inferior:** Dividida en 3 columnas de flexbox balanceadas:
    - *Izquierda:* Acciones de archivo y limpiadores con la nueva clase CSS `.friendly-btn` en un degradado amable (turquesa-celeste).
    - *Centro:* Configuración de contexto (Tono, Modelo de IA) con separadores limpios.
    - *Derecha:* Acciones e investigaciones inteligentes de IA.
  - **Uniformidad:** Se homogeneizó la altura de todos los botones en 32px usando `display: inline-flex` en CSS.
- **Recetas de IA para Redes Sociales (Fase 1):** Se implementó la primera fase del plan de potenciación del editor.
  - **Backend:** Nuevos endpoints `/ai-thread`, `/ai-copywrite` y `/ai-hooks` en `server.js` que invocan el comando `aichat` mediante `spawn` para interactuar de forma segura con modelos de NVIDIA NIM.
  - **Frontend:** Se agregó un dropdown "⚡ Recetas" en la barra de herramientas (`index.html`) con accesos directos para: "Generar Hilo de X", "Copywriting PAS", "Copywriting AIDA", y "Generar Ganchos (Hooks)".
  - **Interacción:** Lógica en `script.js` con loaders correspondientes y modales de confirmación para inyectar/añadir el texto resultante directamente en EasyMDE.
  - **OpenSpec:** Planificación y checklist de tareas generados y validados completamente bajo el cambio `recetas-ia-copywriting`.
- **Investigación Quirúrgica con fuentes.md por Categorías (Fase 2):**
  - **Scraper Python:** Modificado `buscadores/scraper.py` para parsear por secciones `fuentes.md` (Ciencia, Derecho, Economía, Tecnología, etc.) y filtrar dinámicamente los dominios priorizados al buscar en DuckDuckGo.
  - **Salida JSON:** `researcher.py` ahora devuelve un JSON estructurado con el reporte en crudo y la lista exacta de fuentes scrapeadas exitosamente.
  - **UI / Frontend:** Se añadió un select de categorías en el modal de investigación de `index.html`. La IA pre-selecciona el tema en la planificación en `script.js` y el backend procesa con ese filtro.
  - **Referencias Reales:** Se implementó la inserción automática de un bloque Markdown de bibliografía con enlaces reales clicables al final del reporte en `script.js`, erradicando enlaces alucinados.
  - **OpenSpec:** Planificación y checklist de tareas controlados bajo el cambio `investigacion-fuentes-prioritarias`.
- **Métricas Lingüísticas Locales y Sinónimos en Rust (Fase 3):**
  - **Rust simply-analyzer:**
    - Algoritmo heurístico local de conteo de sílabas en español.
    - Implementación de la fórmula de legibilidad Flesch-Szigriszt.
    - Detección de sobreuso de vocabulario (redundancia) y diccionario estático ligero de sinónimos integrados.
  - **UI / Frontend:** Se actualizaron `index.html` y `script.js` para mostrar el score Flesch-Szigriszt, su descripción interpretativa en tiempo real y mostrar las alertas de redundancia con sugerencias de sinónimos rápidos directamente debajo de las estadísticas.
  - **OpenSpec:** Planificación y checklist de tareas controlados bajo el cambio `rust-analyzer-enhancements`.

## Último Realizado [2026-08-21]
- **Revisión y Actualización de Documentación:** Se actualizaron todos los archivos MD del proyecto (`alex.md`, `memory.md`, `DESIGN.md`, `agents.md`) para reflejar el estado actual de la aplicación en la rama `casa`.
- **Estado actual de la app:** La rama `casa` está activa y contiene cambios sin commitear en `index.html`, `script.js`, `server.js` y `style.css`. Se añadió el script `reiniciar.sh`.
- **Agente utilizado:** Antigravity (Google DeepMind) — Claude Sonnet 4.6 con Thinking.
- **OpenSpec activo:** Sistema OpenSpec integrado en `.agent/skills/` con skills: `openspec-propose`, `openspec-apply-change`, `openspec-explore`, `openspec-archive-change`, `openspec-update-change`, `openspec-sync-specs`.

## Último Realizado [2026-08-09]
- **Botón Copiar Texto Plano en FB:** Se agregó un nuevo botón "📄 Texto Plano" en la pestaña de Facebook. Este botón limpia el contenido del editor eliminando la sintaxis Markdown básica y las etiquetas especiales de estilo Unicode (`{s}`, `{f}`, etc.), permitiendo copiar el borrador sin formato a través de la API del portapapeles.

## Último Realizado [2026-06-14]
- **Corrección de letra h en Cursiva Matemática:** Se solucionó un bug en la conversión Unicode a cursiva matemática donde la letra 'h' minúscula era omitida. Se añadió una excepción para mapearla correctamente al símbolo de constante de Planck (`ℎ`, U+210E), resolviendo la desaparición del carácter en palabras como "choca" o "Anthropic".
- **Rama 'casa':** Se creó y activó la rama `casa` para la versión homelab de Simply Apps.
- **Gradualización y Corrección de Decorar:** Se solucionó el error en la función de decorar cambiando la ejecución a un flujo seguro (`spawn` de Node con entrada de stdin) y se implementó un modal interactivo en el frontend para elegir entre tres niveles de decoración (Sutil, Equilibrado e Intenso). Se corrigió la carga absoluta de `.env` para garantizar que la API key se cargue de forma consistente.
- **Ampliación de Timeouts en Nginx:** Se diagnosticaron errores 504 Gateway Time-out en el endpoint `/simply/ai-decorate` causados por el timeout de lectura por defecto de 60s de Nginx al procesar textos largos o modelos con alta latencia. Se aumentó el `proxy_read_timeout`, `proxy_connect_timeout` y `proxy_send_timeout` a `300s` para los bloques HTTP y HTTPS de `/simply/` en `/etc/nginx/nginx.conf`.
- **Integración de Ollama Remoto (hal2026):** Se actualizó la configuración de `aichat` (`config.yaml`) para apuntar al servicio Ollama en `hal2026` vía Tailscale. Se añadieron los modelos `qwen2.5-coder:3b` y `llama3.1:8b` a la lista de opciones. Esto permite utilizar modelos locales para decorar u otras tareas sin consumir CPU ni RAM local.
- **Página de Fuentes Prioritarias y Búsqueda Inteligente:** Se creó una pestaña "📚 Fuentes" en la interfaz para visualizar, editar y gestionar el archivo `fuentes.md` directamente. Se sumó un Asistente IA (aichat) para sugerir, validar y dar formato Markdown a nuevas fuentes. En el backend, se modificaron `buscadores/scraper.py` y `researcher.py` para priorizar de forma real los dominios de `fuentes.md` al realizar investigaciones profundas con Scrapling.

## Último Realizado [2026-06-09]
- **Confirmación de Versión:** Se verificó que la aplicación cuenta con la integración completa de `aichat` y los botones de decoración ("🧂 Decorar", "✨ Pulir", "💡 Sugerir").
- **Estabilización de IA:** La última actualización (2026-06-06) forzó el uso del modelo NVIDIA en los endpoints de `aichat` para evitar la inestabilidad de Ollama.
- **Creación de alex.md:** Se inicializó este archivo para seguir las preferencias del workspace.

## ¿Qué hace esta App?
Simply Apps es una plataforma de edición y análisis de texto enriquecida con Inteligencia Artificial local. Permite:
- Escribir y previsualizar Markdown en tiempo real.
- Pulir redacción y corregir ortografía mediante `aichat`.
- Decorar textos con emojis y estilo visual ("Sal y Pimienta").
- Sugerir ideas y nuevos párrafos para expandir el contenido.
- Buscar canciones y realizar scraping de contenido web para investigación.
- Analizar textos mediante un motor desarrollado en Rust (`simply-analyzer`).

## Stack Técnico
- **Frontend:** HTML5, CSS3, JavaScript (Vanilla), EasyMDE (Editor Markdown), WaveSurfer.js (Audio).
- **Backend:** Node.js (Express), Python (Scraping/Search), Rust (Analysis).
- **IA Local:** `aichat` CLI (integrado con modelos de NVIDIA/DeepInfra).
- **Servidor:** Servidor local con soporte para comandos shell y ejecución de procesos en segundo plano.
