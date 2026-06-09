# Bitácora de Alex - Simply Apps

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
