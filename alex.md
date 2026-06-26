# Bitácora de Alex - Simply Apps

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
