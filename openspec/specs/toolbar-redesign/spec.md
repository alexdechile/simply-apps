# toolbar-redesign Specification

## Purpose
Esta capability define la reestructuración visual y la colorimetría de la barra de herramientas principal de la aplicación, mejorando la usabilidad y legibilidad para el usuario final.
## Requirements
### Requirement: Layout en Tres Columnas
El sistema SHALL presentar la cabecera (toolbar) distribuida en tres grupos funcionales bien identificados: utilidades a la izquierda, configuración básica al centro, y capacidades inteligentes a la derecha.

#### Scenario: Visualización del nuevo layout
- **WHEN** el usuario ingresa a la aplicación.
- **THEN** la barra de herramientas se muestra dividida en tres columnas alineadas, agrupando los botones según su especificidad de uso.

### Requirement: Código de Colores Semántico
El sistema SHALL aplicar colores diferenciados según el tipo de acción: degradados violeta/azul con glow (Clase AI) para funciones inteligentes, y degradados turquesa/celeste pastel suave (Clase Friendly) para acciones de archivo y utilidades.

#### Scenario: Colores aplicados correctamente
- **WHEN** se renderizan los botones en la interfaz.
- **THEN** los botones inteligentes (ej. Pulir, Sugerir, Recetas) se muestran en tono IA, y los de guardar, cargar, limpiar se muestran en tono amable.

