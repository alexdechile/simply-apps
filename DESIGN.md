# Design Document - Simply Apps

## Overview
Aplicación web para creación y adaptación de contenido multiplataforma (Facebook, X, LinkedIn) con asistencia de IA, formato Unicode, investigación web y exportación.

## Stack Tecnológico
| Componente | Tecnología |
|---|---|
| Backend | Node.js + Express 5.x (`server.js`) |
| Frontend | HTML5 + CSS3 + Vanilla JS (`index.html`, `style.css`, `script.js`) |
| Editor | EasyMDE (CodeMirror) con tema oscuro |
| Editor Legacy | Tiptap (`editor.js`) — no utilizado actualmente |
| IA API | DeepInfra (OpenAI-compatible endpoint) |
| IA Local | **aichat** (Rust-based CLI) para pulido de texto |
| Analizador | **simply-analyzer** (Rust nativo) para métricas avanzadas |
| Motor de Búsqueda | DuckDuckGo HTML + Scrapling (Python) |
| Exportación | Python (markdown, python-docx, pandas) |
| Buscadores | Sistema modular en `buscadores/` (DDG + Scrapling) |
| Bootstrap | 5.3.2 (CDN) |

## Arquitectura

### Servidor (Express - Puerto 1717)
```
server.js
├── GET /                    → Sirve frontend estático
├── POST /ask-ai             → Proxy a DeepInfra API
├── POST /research           → Ejecuta researcher.py (Scrapling)
├── POST /cancion/completo   → Ejecuta buscadores/cancion.py (post musical)
├── POST /ai-polish          → Ejecuta aichat CLI (pulido de texto)
├── POST /ai-suggest         → Ejecuta aichat CLI (sugerencia de ideas/párrafos)
├── POST /ai-analyze         → Ejecuta simply-analyzer (Rust) para métricas
├── POST /export             → Ejecuta exporter.py (docx/xlsx/html)
└── POST /save-to-vault      → Guarda en /home/alexdechile/vault/posts/
```

### Frontend
```
script.js
├── Editor (EasyMDE/CodeMirror)
├── Sistema de Tono (Coloquial / Comercial / Neutro)
├── Tabs (FB / X / LI / Config)
├── Barra de formato flotante (Unicode)
├── Pulido de Texto (botón ✨ Pulir → aichat → inyección)
├── Sugerir Ideas (botón 💡 Sugerir → aichat → apéndice)
├── Análisis Real-time (Rust → lectura, densidad, keywords)
├── Modal de Investigación (3 pasos: Plan → Scrape → Síntesis)
├── Persistencia (localStorage)
├── Exportación (cliente → servidor → descarga)
├── Emoji Picker (emoji-picker-element)
├── Sincronización scroll editor ↔ preview
└── Post Musical IA (botón 🎵 Post Musical → cancion.py → DeepInfra → inyección)
```

### Python Scripts
```
buscadores/
├── scraper.py        # Módulo compartido: search_ddg(), scrape_url()
├── cancion.py        # Buscador multi-fuente: Wikipedia + YouTube Music
└── __init__.py       # Export público

researcher.py         # Ahora importa desde buscadores.scraper

exporter.py
├── docx  → python-docx
├── xlsx  → pandas
└── html  → markdown library
```

## Configuración de IA

| Parámetro | Valor |
|---|---|
| Provider | DeepInfra |
| Endpoint | `https://api.deepinfra.com/v1/openai/chat/completions` |
| Modelo default | `nvidia/Llama-3.1-Nemotron-70B-Instruct` |
| Max tokens | 2048 |
| Temperature | 0.7 |
| API Key | `DEEPINFRA_API_KEY` (`.env`) |

## Timeouts
| Capa | Timeout |
|---|---|
| Servidor Express | 120s (`server.timeout`) |
| Keep-Alive | 125s (`server.keepAliveTimeout`) |
| Frontend fetch (IA) | 120s (AbortController) |
| Frontend fetch (Research) | 60s (AbortController) |
| Scrapling extract | 20s por URL |

## Sistema de Canales y Tonos
```
FB (Facebook) → Tonos: Coloquial / Comercial / Neutro
X  (Twitter)  → Derivado automático desde FB (max 280 chars)
LI (LinkedIn) → Derivado automático desde FB (formato profesional)
```

## Persistencia (localStorage)
| Key | Propósito |
|---|---|
| `simply-editor-content` | Contenido del editor |
| `simply-tone` | Tono seleccionado |
| `simply-theme` | Tema visual (dark/sketch) |
| `p_fb_col`, `p_fb_com`, `p_fb_neu` | Prompts FB personalizados |
| `p_x`, `p_li` | Prompts X y LI personalizados |
| `simply-x-content`, `simply-li-content` | Outputs generados |
| `simply-pending-research` | Síntesis de investigación pendiente |
| `deepinfra-api-key` | API key (fallback cliente) |

## Temas
| Tema | Descripción |
|---|---|
| Dark (default) | Fondo oscuro, acento púrpura (#BB86FC) |
| Sketch | Fondo blanco, acento azul (#1a73e8), fuente Architects Daughter |

## Sistema de Formato Unicode
Etiquetas markdown personalizadas para texto estilizado:
- `{s}...{/s}` → Script (𝒮)
- `{f}...{/f}` → Fraktur (𝔊)
- `{d}...{/d}` → Double (𝔻)
- `{sb}...{/sb}` → Sans Bold (𝗦)
- `{c}...{/c}` → Circled (Ⓐ)
- `{sq}...{/sq}` → Squared (🄰)
- `{fw}...{/fw}` → Fullwidth (Ｗ)

## Vault
- **Ruta:** `/home/alexdechile/vault/posts/`
- **Formato:** Markdown (.md)
- **Sidebar:** Actualiza `_sidebar.md` automáticamente con sección `Simply Posts`

## Infraestructura
- **Servicio Systemd** (usuario): `simply-apps.service`
- **Puerto:** 1717
- **Bind:** `0.0.0.0`
- **Gestión:** `systemctl --user [start|stop|restart|status] simply-apps.service`
- **Logs:** `simply.log` + `journalctl --user -u simply-apps.service -f`

## Buscadores Modulares (`buscadores/`)

Sistema de scripts especializados que comparten utilidades vía `scraper.py`:

### Módulo compartido (`scraper.py`)
| Función | Descripción |
|---|---|
| `search_ddg(query, max_links=3)` | Busca en DuckDuckGo HTML, devuelve `[{title, url}]` |
| `scrape_url(url, char_limit=4000)` | Extrae contenido vía `scrapling extract` |
| `get_prioritized_domains()` | Lee `archivos/fuentes.md` para filtrar dominios |

### Buscador de Canciones (`cancion.py`)
- **Endpoint:** `POST /cancion/completo` → ejecuta `cancion.py` + síntesis DeepInfra
- **Input:** Consulta libre (`"Queen - Bohemian Rhapsody"`)
- **Pipeline:**
  1. Busca Wikipedia via REST API (`/api/rest_v1/page/summary/`)
  2. Genera URL de YouTube Music
  3. **Servidor** envía todos los datos a DeepInfra con system prompt especializado
  4. La IA sintetiza un post con: introducción, datos de producción, curiosidades y enlace a YouTube Music
- **Frontend:** Botón "🎵 Post" en toolbar → prompt → llama endpoint → IA → inyección

## Investigación (Research)
Flujo de 4 pasos:
1. **Planificación** — IA genera query y dominios de enfoque
2. **Configuración** — Modal permite ajustar query, tendencias y profundidad
3. **Scraping** — `researcher.py` busca en DuckDuckGo y extrae con Scrapling
4. **Síntesis** — IA genera reporte estilo Simply con insights y fuentes

## Estructura del Proyecto
```
simply-apps/
├── server.js            # Backend Express
├── script.js            # Lógica frontend
├── editor.js            # Editor Tiptap (legacy, no usado)
├── index.html           # Página principal
├── style.css            # Estilos y temas
├── package.json         # Dependencias Node
├── iniciar.sh           # Script de inicio local
├── buscadores/
│   ├── __init__.py      # Export público
│   ├── scraper.py       # Módulo compartido (DDG + Scrapling)
│   ├── cancion.py       # Buscador multi-fuente (wiki + YT Music)
├── researcher.py        # Investigación web (usa buscadores.scraper)
├── exporter.py          # Exportación (docx/xlsx/html)
├── archivos/
│   └── fuentes.md       # Fuentes prioritarias de investigación
├── .env                 # Variables de entorno (no trackeado)
├── .gitignore
├── agents.md            # Bitácora de agentes
├── memory.md            # Memoria del proyecto
├── gemini.md            # Bitácora Gemini CLI
└── DESIGN.md            # Este archivo
```

## Notas Técnicas
- La IA frecuentemente envuelve respuestas en bloques ` ```markdown ` — se limpian con regex antes de inyectar.
- El modal de investigación usa animación slide (slideIn/slideOut) con z-index 5000.
- La inyección al editor usa API directa de CodeMirror (`getDoc().setValue()`) para evitar problemas con eventos Bootstrap.
- EasyMDE en script.js es el editor activo. editor.js (Tiptap) es legacy y no se usa.
- `researcher.py` fue refactorizado para importar `search_ddg`, `scrape_url` y `get_prioritized_domains` desde `buscadores.scraper`.
