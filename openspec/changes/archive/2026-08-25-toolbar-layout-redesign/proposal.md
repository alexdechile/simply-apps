## Why

Mejorar la interfaz gráfica de Simply Apps rediseñando la barra de herramientas (toolbar) para agrupar los botones según su uso y especificidad, dividiendo el espacio en 3 columnas funcionales claras y aplicando un código de colores moderno (tonos inteligentes para IA y tonos amables para utilidades/archivos).

## What Changes

- **Layout en 3 Columnas:** Reestructurar la cabecera en tres contenedores diferenciados:
  - **Sección 1 (Izquierda):** Operaciones de Archivo y Utilidades de Limpieza (Tono Amable).
  - **Sección 2 (Centro):** Configuración y Estado (Tono Neutro).
  - **Sección 3 (Derecha):** Acciones e Investigaciones Inteligentes de IA (Color Inteligente).
- **Estilos CSS Nuevos:**
  - Agregar variables de color para los botones amables (`--friendly-from`, `--friendly-to`, `--friendly-glow`).
  - Aplicar la clase `.friendly-btn` a los botones de archivos y limpiadores.
  - Ajustar márgenes, paddings y flexbox para lograr un alineamiento balanceado y estéticamente superior.

## Capabilities

### New Capabilities
- `toolbar-redesign`: Rediseño estructural y estético de la toolbar de Simply Apps en tres grupos funcionales con código de color diferenciado.

### Modified Capabilities

## Impact

- **Frontend (`index.html`):** Modificación del orden de los botones en el markup de la cabecera.
- **Estilos (`style.css`):** Nuevas clases y estilos para botones amables, rediseño del header.
