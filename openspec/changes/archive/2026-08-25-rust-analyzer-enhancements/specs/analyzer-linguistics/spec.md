## Purpose

Esta capability añade análisis métrico avanzado y optimizado para idioma español a la utilidad local de análisis de texto, arrojando índices de legibilidad y sugerencias de sinónimos directamente en la interfaz.

## ADDED Requirements

### Requirement: Cálculo del Índice Flesch-Szigriszt
El sistema SHALL calcular localmente el índice Flesch-Szigriszt de legibilidad en español utilizando el conteo de sílabas, palabras y oraciones.

#### Scenario: Evaluación de legibilidad exitosa
- **WHEN** el usuario escribe en el editor y se lanza el análisis.
- **THEN** el sistema calcula el score numérico Flesch-Szigriszt y retorna su respectiva interpretación ("Muy fácil", "Fácil", "Bastante fácil", etc.).

### Requirement: Alerta de Sobreuso y Sugerencia de Sinónimos
El sistema SHALL identificar palabras de más de 3 caracteres que se repitan de forma desproporcionada (por ejemplo, con una frecuencia relativa superior al 3.5% del total del texto o con más de 3 apariciones) y ofrecer sinónimos equivalentes.

#### Scenario: Sugerencia de sinónimos para palabra repetida
- **WHEN** la palabra "hacer" se repite 5 veces en un post de 50 palabras.
- **THEN** el análisis reporta la palabra en el listado de sobreuso y sugiere los sinónimos "realizar, elaborar, crear, ejecutar" en el panel visual.
