# Bitácora de Alex - Simply Apps

## Último Realizado [2026-08-27 - Noche]
- **Integración Inicial de la API de IA Serverless (`chat.comerza.cl`):**
  - **Configuración de Variables:** Se añadieron `COMERZA_SECRET_TOKEN` y `AI_API_URL` al archivo `.env` del proyecto.
  - **Código Servidor:** Se modificó `server.js` para inicializar el token de Comerza y la URL del proxy de IA.
  - **Prueba Tangible (`/ask-ai`):** Se actualizó la ruta `/ask-ai` para redirigir las peticiones directamente a `chat.comerza.cl` usando el modelo gratuito y eficiente de Cloudflare Workers AI (`@cf/meta/llama-3.1-8b-instruct`), reduciendo a cero el costo operativo.
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
