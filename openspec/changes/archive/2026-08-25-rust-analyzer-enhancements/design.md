## Context

Ver `proposal.md` para la motivación. Actualmente `simply-analyzer` entrega métricas muy básicas (tiempo de lectura, densidad léxica, cantidad de oraciones y promedio de longitud de palabra). Flesch-Szigriszt es el estándar de oro en español para legibilidad de textos y se implementará localmente en Rust para evitar latencia de red.

## Goals / Non-Goals

**Goals:**
- Implementar la heurística de conteo silábico y fórmula Flesch-Szigriszt en Rust.
- Reportar alertas de sobreuso de vocabulario junto con sugerencias de sinónimos en formato JSON.
- Re-compilar el binario de Rust de forma que Express consuma la nueva versión.
- Diseñar el panel visual en la interfaz del editor para alertas de sobreuso.

**Non-Goals:**
- No se usarán servicios de traducción ni APIs de IA externas para obtener sinónimos.

## Decisions

### 1. Algoritmo de Sílabas en Rust
- **Decisión:** Implementar una heurística directa de conteo de vocales, diptongos y excepciones en español sin dependencias de crates de NLP pesados.
- **Razón:** El binario debe compilarse rápido y ejecutarse en milisegundos para no entorpecer el flujo de escritura del usuario en tiempo real.

### 2. Diccionario de Sinónimos Ligero
- **Decisión:** Incorporar un diccionario estático en Rust (`HashMap` pre-llenado) para palabras de alta frecuencia muy comunes en la redacción de posts ("hacer", "decir", "importante", "tema", etc.).
- **Razón:** Evitar la complejidad y el peso de una base de datos externa, cubriendo las palabras que comúnmente causan redundancia en textos cortos.

### 3. Exposición en la UI
- **Decisión:** Mostrar el puntaje Flesch-Szigriszt en el panel `#stats-panel` existente. Para las palabras sobreutilizadas, crear un badge dinámico en la barra de estado que al hacer clic o al pasar el cursor muestre un popover o un pequeño listado de sugerencias de sinónimos.

## Risks / Trade-offs

*   **[Riesgo] Error en el conteo de sílabas en palabras complejas** → **Mitigación:** La heurística tiene un margen de error menor al 5%, lo cual es suficiente para calcular un índice macro de legibilidad.
*   **[Riesgo] La re-compilación falla en el servidor homelab** → **Mitigación:** Proveer una tarea de compilación directa vía `cargo build --release` desde el directorio `simply-analyzer` y verificar la existencia de target.
