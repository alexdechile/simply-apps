---
name: simply-stickies
description: Lee los stickies pendientes del diagrama de arquitectura de Simply Apps y trabaja en ellos como tareas. Usar cuando el usuario quiere revisar o implementar mejoras anotadas visualmente en el diagrama.
---

# Simply Stickies — Tareas desde el Diagrama

Los **stickies** son notas de mejora que el usuario pega visualmente sobre el diagrama de arquitectura de Simply Apps (pestaña 📐 Diagrama en `http://localhost:1717`). Cada sticky está asociado a un nodo específico del diagrama (ej: "🔍 Investigar", "✨ Pulir", "DeepInfra API") y contiene una idea o tarea concreta.

## Archivo de datos

Los stickies se persisten en:
```
archivos/stickies.json
```

Formato de cada sticky:
```json
{
  "id": "sticky_1234567890",
  "nodeId": "RESEARCH",
  "nodeLabel": "🔍 Investigar",
  "text": "mejorar el prompt con esto: 'buscar solo en fuentes .cl'",
  "color": "#fef08a",
  "resolved": false,
  "createdAt": "2026-08-21T10:00:00.000Z",
  "updatedAt": "2026-08-21T10:00:00.000Z"
}
```

- `nodeId`: ID del nodo en el diagrama Mermaid (ej: `RESEARCH`, `POLISH`, `DEEPINFRA`, `EDITOR`)
- `nodeLabel`: Etiqueta legible del nodo
- `text`: La idea o tarea anotada por el usuario
- `resolved`: `false` = pendiente, `true` = completado
- `color`: Color del sticky (solo visual, no tiene significado semántico)

## Nodos del diagrama y su código fuente

| nodeId | Archivo | Descripción |
|--------|---------|-------------|
| `RESEARCH` | `server.js` endpoint `/research`, `researcher.py` | Investigación web con Scrapling |
| `POLISH` | `server.js` endpoint `/ai-polish` | Pulido de texto con aichat |
| `DECORATE` | `server.js` endpoint `/ai-decorate` | Decoración con emojis |
| `SUGGEST` | `server.js` endpoint `/ai-suggest` | Sugerencia de ideas |
| `ASKIA` | `server.js` endpoint `/ask-ai` | Proxy a DeepInfra |
| `CANCION` | `server.js` endpoint `/cancion/completo`, `buscadores/cancion.py` | Post musical |
| `TECH` | `server.js` endpoint `/tech/completo` | Post tecnológico |
| `NEWS` | `server.js` endpoint `/news/completo` | Post de noticias |
| `EDITOR` | `script.js` (EasyMDE) | Editor principal |
| `TOOLBAR` | `script.js` (botones IA) | Toolbar con botones |
| `DEEPINFRA` | `server.js` (fetch a API) | Integración con DeepInfra |
| `AICHAT` | `server.js` (spawn aichat) | CLI aichat local |
| `RUST` | `simply-analyzer/` | Analizador en Rust |
| `VAULT` | `server.js` endpoint `/save-to-vault` | Guardado en vault |
| `FUENTES` | `archivos/fuentes.md`, `buscadores/scraper.py` | Fuentes prioritarias |
| `STICKIES` | `server.js` endpoints `/api/stickies`, `archivos/stickies.json` | Este mismo sistema |

## Pasos para trabajar con esta skill

### 1. Leer los stickies pendientes

```bash
cat archivos/stickies.json
```

O via API (si el servidor está corriendo):
```bash
curl http://localhost:1717/api/stickies
```

### 2. Filtrar solo los pendientes

Solo trabajar en stickies con `"resolved": false`.

### 3. Presentar al usuario

Mostrar un resumen claro:
```
## 📌 Stickies Pendientes (N tareas)

### 1. [nodeLabel] — sticky_id
> texto del sticky
Nodo afectado: nodeId → archivo(s) relevante(s)

### 2. ...
```

### 4. Priorizar y elegir

Preguntar al usuario cuál sticky quiere atacar primero, o proceder en orden si el usuario dijo "trabaja en todos".

### 5. Implementar

- Leer el archivo de código relevante según la tabla de nodos
- Implementar el cambio descrito en el `text` del sticky
- Ser literal con la instrucción del usuario (si dice "mejorar el prompt con esto: '...'", modificar exactamente ese prompt)
- Hacer cambios mínimos y enfocados

### 6. Marcar como resuelto

Después de implementar exitosamente, actualizar el sticky:

```bash
# Leer stickies actuales
STICKIES=$(cat archivos/stickies.json)
# Actualizar resolved=true para el sticky_id correspondiente via API:
curl -s -X POST http://localhost:1717/api/stickies \
  -H "Content-Type: application/json" \
  -d '<array actualizado con resolved:true>'
```

O editar directamente `archivos/stickies.json` cambiando `"resolved": false` a `"resolved": true` y actualizando `"updatedAt"`.

### 7. Reiniciar el servidor si hubo cambios en server.js

```bash
systemctl --user restart simply-apps.service
```

### 8. Reportar progreso

```
## ✅ Sticky resuelto: [nodeLabel]

**Tarea:** <texto del sticky>
**Cambios:** <descripción de lo que se hizo>
**Archivo:** <archivo modificado>

Quedan N stickies pendientes.
```

## Guardrails

- **NUNCA** marcar un sticky como resuelto si no se implementó el cambio
- Si el texto del sticky es ambiguo, preguntar al usuario antes de implementar
- Si el cambio requiere conocimiento que no está en el código, decirlo
- Respetar el stack: Node.js + Express + Vanilla JS + Python + Rust
- Los cambios en `server.js` requieren reinicio del servicio
- Los cambios en `script.js`, `index.html`, `style.css` se ven inmediatamente (sin reinicio)
- Siempre verificar que el servidor sigue corriendo después de cambios: `systemctl --user status simply-apps.service`
- Hablar siempre en chileno con el usuario
