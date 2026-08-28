# Simply Apps

## Overview
Simply Apps es una plataforma de edición y análisis de texto enriquecida con Inteligencia Artificial local. Permite escribir, previsualizar Markdown en tiempo real, pulir redacción, decorar textos con emojis y estilos Unicode, investigar en la web y exportar contenido adaptado para redes sociales (Facebook, X, LinkedIn).

## Arquitectura
El sistema consta de:
- **Frontend**: Aplicación web de una sola página (SPA) con Vanilla JS, EasyMDE para edición Markdown y WaveSurfer.js para audio.
- **Backend (Express)**: Servidor Node.js (Puerto 1717) que sirve el frontend y expone endpoints (`/ask-ai`, `/research`, `/ai-polish`, etc.).
- **Procesamiento AI**: 
  - Consultas a LLMs a través de Cloudflare Workers AI Proxy (`chat.comerza.cl` / `workers.dev` con fallback en cascada a DeepInfra/OpenRouter).
  - Modelos eficientes y gratuitos en el Edge: `@cf/meta/llama-3.1-8b-instruct` (Pulido/Adorno/Pensar) y `@cf/gemma-2-9b-it` (Sugerir).
  - Conexión a modelo remoto con Ollama (hal2026).
- **Análisis y Scraping**:
  - `simply-analyzer`: Motor en Rust para análisis de métricas avanzadas de texto.
  - Scripts en Python (`buscadores/scraper.py`, `researcher.py`) para búsqueda con DuckDuckGo y web scraping con Scrapling.

## Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JS, Bootstrap 5.3.2, EasyMDE (CodeMirror).
- **Backend**: Node.js, Express 5.x.
- **Python**: Scrapling, python-docx, pandas (para exportación y scraping).
- **Rust**: `simply-analyzer`, `aichat` CLI.

## Funcionalidades Principales
- **Editor Markdown en tiempo real**: Con previsualización.
- **Barra de formato Unicode**: Botones para aplicar estilos (Fraktur, Script, Double, etc.) con etiquetas personalizadas (`{f}...{/f}`).
- **Asistencia IA (Pulir y Sugerir)**: A través del proxy de Workers AI en Cloudflare, permitiendo corregir ortografía y sugerir ideas/párrafos de forma rápida y gratuita.
- **Decoración (Sal y Pimienta)**: Decoración de textos con emojis con tres niveles interactivos en frontend (Sutil, Equilibrado e Intenso).
- **Motor de Investigación Inteligente (Research)**: Flujo de 4 pasos (Planificación, Configuración, Scraping, Síntesis) con validación de fuentes desde `fuentes.md`.
- **Post Musical**: Buscador de canciones integrando Wikipedia y YouTube Music para armar posteos automatizados.
- **Adaptación Multiplataforma**: A partir de un borrador general o de Facebook (FB), adapta textos automáticamente a Twitter (X) y LinkedIn (LI).
- **Exportación**: Formatos HTML, DOCX, XLSX (a través de Python).
- **Gestión del Portapapeles**: Posibilidad de copiar "Texto Plano" sin formato especial (sintaxis markdown ni etiquetas Unicode).

## Estructura de Directorios Clave
- `index.html`, `style.css`, `script.js`: Archivos del frontend principal.
- `server.js`: API backend con Express.
- `buscadores/`: Scripts modulares en Python (`scraper.py`, `cancion.py`) para interactuar con búsquedas web.
- `researcher.py`: Ejecutor de investigación usando el módulo de `buscadores`.
- `exporter.py`: Lógica de exportación de documentos.
- `simply-analyzer/`: Motor en Rust para analizar textos.
- `archivos/fuentes.md`: Listado gestionable de fuentes prioritarias para el scraper.

## Convenciones y Persistencia
- **Almacenamiento Local**: Se usa `localStorage` para el contenido del editor, el tono seleccionado, temas (Dark/Sketch) y prompts personalizados.
- **Vault Local**: El servidor guarda posts (markdown) en `/home/alexdechile/vault/posts/`.
- **Timeouts**: Tiempos de espera amplios (`120s` a `300s`) para procesar consultas complejas de IA, tanto a nivel backend (`server.js`) como proxy proxy_read_timeout.
