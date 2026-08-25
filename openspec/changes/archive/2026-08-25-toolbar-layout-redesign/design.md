## Context

Ver `proposal.md` para la motivación. Actualmente, la cabecera se organiza mediante flexbox clásico con clases `.header-left`, `.header-center`, `.header-right` con un layout que no distribuye los botones uniformemente ni ofrece una distinción de colores por tipo de operación.

## Goals / Non-Goals

**Goals:**
- Estructurar el header en tres secciones bien equilibradas: Izquierda (Archivos y Limpieza), Centro (Configuración), Derecha (IA).
- Implementar la clase `.friendly-btn` en el CSS y asignarla a los botones tradicionales de archivo y herramientas de limpieza.
- Lograr que el header sea responsivo y no colapse en resoluciones estándar.

**Non-Goals:**
- No se agregará ni removerá ningún botón funcional existente.

## Decisions

### 1. Reestructuración del markup en `index.html`
- **Decisión:** Agrupar todos los botones dentro de tres contenedores con las clases `.toolbar-section.section-left`, `.toolbar-section.section-center` y `.toolbar-section.section-right`.
- **Organización de botones:**
  - **Izquierda:** Logo `SIMPLY APPS`, Cargar, Recuperar, Archivar, Guardar (dropdown), Pegar, Limpiar (soft-danger), Buscar, Emoji, Limpiar #, Borrar #, Cambiar Tema.
  - **Centro:** Selector de Tono, Selector de Modelo de IA.
  - **Derecha:** Pulir, Decorar, Sugerir, Pensar, Investigar, Post (canción), Tech, News, Recetas.

### 2. Estilos de Botones Amables
- **Decisión:** Definir colores amables para utilidades tradicionales usando un degradado turquesa-celeste pastel:
  ```css
  --friendly-from: #0d9488;
  --friendly-to: #0284c7;
  --friendly-glow: rgba(13, 148, 136, 0.3);
  ```
  La clase `.friendly-btn` heredará esta paleta con un hover brillante para dar un aspecto fresco y moderno que no compita visualmente con la IA pero sea amigable al usuario.

## Risks / Trade-offs

*   **[Riesgo] Saturación de espacio en pantallas pequeñas** → **Mitigación:** Usar `flex-wrap: wrap;` en el contenedor principal `.app-header` y permitir que las secciones bajen a otra línea fluidamente si el ancho de pantalla es inferior a 1200px.
