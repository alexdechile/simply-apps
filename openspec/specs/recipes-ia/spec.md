# recipes-ia Specification

## Purpose
Esta capability permite a los usuarios optimizar y adaptar sus textos para redes sociales utilizando recetas estructuradas de IA (como generación de hilos de X, técnicas de copywriting PAS y AIDA, y hooks de enganche) mediante integraciones backend directas con el comando local aichat.
## Requirements
### Requirement: Generación de Hilos de X
El sistema SHALL permitir al usuario convertir el texto activo del editor en un hilo numerado coherente de X (Twitter), asegurando que ningún segmento supere los 280 caracteres y conservando el orden de las ideas.

#### Scenario: Convertir texto a hilo exitosamente
- **WHEN** el usuario selecciona la opción "Generar Hilo de X" en la UI de Simply Apps y confirma la acción.
- **THEN** el sistema envía el texto al backend, procesa la división usando aichat, y reemplaza o inserta en el editor los tweets numerados con separadores.

### Requirement: Estructuración por Copywriting PAS y AIDA
El sistema SHALL ofrecer opciones para reescribir o estructurar el texto activo del editor usando las fórmulas de persuasión PAS (Problema, Agitación, Solución) y AIDA (Atención, Interés, Deseo, Acción).

#### Scenario: Estructuración PAS exitosa
- **WHEN** el usuario solicita reformatear el texto usando la fórmula PAS.
- **THEN** el sistema devuelve el texto estructurado en tres secciones claramente diferenciadas (Problema, Agitación, Solución) y ofrece inyectarlo en el editor.

#### Scenario: Estructuración AIDA exitosa
- **WHEN** el usuario solicita reformatear el texto usando la fórmula AIDA.
- **THEN** el sistema devuelve el texto estructurado con las secciones de Atención, Interés, Deseo y Acción.

### Requirement: Generación de Ganchos (Hooks)
El sistema SHALL permitir al usuario generar tres opciones de ganchos o frases de apertura atractivas basadas en el texto activo del editor.

#### Scenario: Obtener sugerencias de ganchos exitosamente
- **WHEN** el usuario hace clic en el botón "Generar Ganchos".
- **THEN** el sistema despliega las tres propuestas de enganche en pantalla, permitiendo copiar o inyectar la preferida.

