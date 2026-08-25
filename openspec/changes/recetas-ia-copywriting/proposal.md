## Why

Potenciar el editor de Simply Apps agregando recetas de IA predefinidas y metodologías de copywriting para que el usuario pueda formatear y optimizar sus textos para redes sociales de manera rápida e inteligente sin depender de prompts manuales complejos.

## What Changes

- **Generador de Hilos de X (Twitter):** Dividir automáticamente el texto del editor en un hilo coherente y numerado adaptado al límite de 280 caracteres.
- **Estructuración Copywriting (AIDA/PAS):** Botones en el editor para reformatear el texto usando las fórmulas de persuasión PAS (Problema, Agitación, Solución) y AIDA (Atención, Interés, Deseo, Acción).
- **Generador de Ganchos (Hooks):** Sugerir 3 variantes atractivas para iniciar el post.
- **Nuevos Endpoints en Express:** Implementar `/ai-thread`, `/ai-copywrite` y `/ai-hooks` en `server.js` llamando a `aichat`.
- **Integración UI:** Agregar botones dedicados y dropdowns en la barra de herramientas de Simply Apps.

## Capabilities

### New Capabilities
- `recipes-ia`: Integración de recetas de IA en Simply Apps para copywriting, generación de hilos de X y optimización de ganchos (hooks) mediante aichat.

### Modified Capabilities

## Impact

- **Backend (`server.js`):** Nuevas rutas HTTP POST para delegar a `aichat`.
- **Frontend (`script.js` e `index.html`):** Controles de interfaz gráfica y eventos fetch asociados.
