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
| Motor de Búsqueda | DuckDuckGo HTML + Scrapling (Python) |
| Exportación | Python (markdown, python-docx, pandas) |
| Bootstrap | 5.3.2 (CDN) |

## Arquitectura

### Servidor (Express - Puerto 1717)
```
server.js
├── GET /                    → Sirve frontend estático
├── POST /ask-ai             → Proxy a DeepInfra API
├── POST /research           → Ejecuta researcher.py (Scrapling)
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
├── Modal de Investigación (3 pasos: Plan → Scrape → Síntesis)
├── Persistencia (localStorage)
├── Exportación (cliente → servidor → descarga)
├── Emoji Picker (emoji-picker-element)
└── Sincronización scroll editor ↔ preview
```

### Python Scripts
```
researcher.py
├── Búsqueda DuckDuckGo (sencilla 3 links / profunda 5 links)
├── Extracción con Scrapling (--ai-targeted)
└── Filtro por dominios prioritarios desde archivos/fuentes.md

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
├── researcher.py        # Investigación web (Scrapling)
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
