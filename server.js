const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const fs = require('fs');
const app = express();
const port = 1717;

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Simply Apps running at http://0.0.0.0:${port}`);
});
server.timeout = 120000; // 120 segundos
server.keepAliveTimeout = 125000;

app.use(express.json());
app.use(express.static(__dirname));

const { exec, spawn } = require('child_process');
const yaml = require('js-yaml');

// Configuración de IA (DeepInfra) desde variable de entorno
const DEEPINFRA_API_KEY = (process.env.DEEPINFRA_API_KEY || '').trim();
const logMsg = `[Config] API Key: ${DEEPINFRA_API_KEY ? 'Cargada (L:' + DEEPINFRA_API_KEY.length + ', ' + DEEPINFRA_API_KEY.substring(0,3) + '...' + DEEPINFRA_API_KEY.slice(-3) + ')' : 'NO CARGADA'}\n`;
fs.appendFileSync(path.join(__dirname, 'simply.log'), logMsg);
console.log(logMsg.trim());

app.post('/save-to-vault', (req, res) => {
    const { content, filename } = req.body;
    console.log(`[Vault] Solicitud recibida - filename: ${filename}, content length: ${content ? content.length : 0}`);
    
    if (!content) {
        console.log('[Vault] Error: No content provided');
        return res.status(400).json({ error: 'No content provided' });
    }

    const vaultPath = '/home/alexdechile/vault';
    const postsPath = path.join(vaultPath, 'posts');
    const date = new Date().toISOString().split('T')[0];
    const name = filename || `post_${date}.md`;
    
    console.log(`[Vault] Guardando como: ${name} en ${postsPath}`);
    
    // Asegurar que la carpeta 'posts' existe
    if (!fs.existsSync(postsPath)) {
        fs.mkdirSync(postsPath, { recursive: true });
        console.log(`[Vault] Creada carpeta posts`);
    }

    const fullPath = path.join(postsPath, name);
    const sidebarPath = path.join(vaultPath, '_sidebar.md');

    fs.writeFile(fullPath, content, (err) => {
        if (err) {
            console.error('[Vault] Error saving to vault:', err);
            return res.status(500).json({ error: 'Error saving to vault', details: err.message });
        }
        
        console.log(`[Vault] Success: Saved ${name} to vault/posts`);

        // Actualizar _sidebar.md automáticamente
        try {
            if (fs.existsSync(sidebarPath)) {
                let sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
                const linkText = `* [${name.replace('.md', '')}](/posts/${name})`;
                
                if (!sidebarContent.includes(linkText)) {
                    // Si no existe la sección Simply Posts, crearla
                    if (!sidebarContent.includes('**Simply Posts**')) {
                        sidebarContent += '\n\n* ✍️ **Simply Posts**';
                    }
                    
                    // Añadir el link bajo la sección (o al final si es más simple)
                    sidebarContent += `\n  ${linkText}`;
                    fs.writeFileSync(sidebarPath, sidebarContent);
                    console.log(`Updated _sidebar.md with ${name}`);
                }
            }
        } catch (sidebarErr) {
            console.error('Error updating sidebar:', sidebarErr);
            // No fallamos la request principal si el sidebar falla
        }

        res.send({ message: 'Saved successfully', path: fullPath });
    });
});

// Endpoint para listar posts del Vault
app.get('/vault/posts', (req, res) => {
    const vaultPath = '/home/alexdechile/vault';
    const postsPath = path.join(vaultPath, 'posts');
    
    try {
        if (!fs.existsSync(postsPath)) {
            return res.status(404).json({ error: 'Posts directory not found' });
        }
        
        const files = fs.readdirSync(postsPath)
            .filter(file => file.endsWith('.md'))
            .map(file => {
                const filePath = path.join(postsPath, file);
                const stat = fs.statSync(filePath);
                return {
                    name: file,
                    path: `/posts/${file}`,
                    size: stat.size,
                    mtime: stat.mtime
                };
            })
            .sort((a, b) => b.mtime - a.mtime);
        
        res.json({ posts: files });
    } catch (e) {
        console.error('[Vault] Error listing posts:', e.message);
        res.status(500).json({ error: 'Error listing posts' });
    }
});

// Endpoint para obtener contenido de un post específico del Vault
app.get('/vault/post/:filename', (req, res) => {
    const { filename } = req.params;
    const vaultPath = '/home/alexdechile/vault';
    const postPath = path.join(vaultPath, 'posts', filename);
    
    try {
        if (!fs.existsSync(postPath)) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        const content = fs.readFileSync(postPath, 'utf8');
        res.json({ content, path: postPath });
    } catch (e) {
        console.error('[Vault] Error reading post:', e.message);
        res.status(500).json({ error: 'Error reading post' });
    }
});

// Endpoint para obtener el contenido de fuentes.md
app.get('/api/fuentes', (req, res) => {
    const fuentesPath = path.join(__dirname, 'archivos', 'fuentes.md');
    try {
        if (!fs.existsSync(fuentesPath)) {
            return res.status(404).send('Archivo fuentes.md no encontrado.');
        }
        const content = fs.readFileSync(fuentesPath, 'utf8');
        res.send({ content });
    } catch (e) {
        console.error('[Fuentes] Error al leer:', e.message);
        res.status(500).send('Error al leer fuentes.md');
    }
});

// Endpoint para guardar el contenido de fuentes.md
app.post('/api/fuentes', (req, res) => {
    const { content } = req.body;
    if (content === undefined) return res.status(400).send('No content provided');

    const fuentesPath = path.join(__dirname, 'archivos', 'fuentes.md');
    try {
        fs.writeFileSync(fuentesPath, content, 'utf8');
        console.log('[Fuentes] fuentes.md guardado correctamente');
        res.send({ message: 'Saved successfully' });
    } catch (e) {
        console.error('[Fuentes] Error al guardar:', e.message);
        res.status(500).send('Error al guardar fuentes.md');
    }
});

// ── STICKIES (Notas de mejora sobre el diagrama) ──────────────────────────
const STICKIES_PATH = path.join(__dirname, 'archivos', 'stickies.json');

app.get('/api/stickies', (req, res) => {
    try {
        if (!fs.existsSync(STICKIES_PATH)) {
            return res.json([]);
        }
        const data = JSON.parse(fs.readFileSync(STICKIES_PATH, 'utf8'));
        res.json(data);
    } catch (e) {
        console.error('[Stickies] Error al leer:', e.message);
        res.json([]);
    }
});

app.post('/api/stickies', (req, res) => {
    try {
        const stickies = req.body;
        if (!Array.isArray(stickies)) return res.status(400).json({ error: 'Se esperaba un array' });
        fs.writeFileSync(STICKIES_PATH, JSON.stringify(stickies, null, 2), 'utf8');
        console.log(`[Stickies] Guardados ${stickies.length} stickies`);
        res.json({ ok: true, count: stickies.length });
    } catch (e) {
        console.error('[Stickies] Error al guardar:', e.message);
        res.status(500).json({ error: e.message });
    }
});

app.post('/research', (req, res) => {
    const { topic, depth, category } = req.body;
    if (!topic) return res.status(400).send('No topic provided');

    const pythonBin = path.join(__dirname, 'venv', 'bin', 'python3');
    const scriptPath = path.join(__dirname, 'researcher.py');
    
    console.log(`Researching topic: ${topic} (Depth: ${depth || 'sencilla'}, Category: ${category || 'general'})`);
    
    const safeCategory = category ? category.replace(/"/g, '\\"') : '';
    const command = `${pythonBin} "${scriptPath}" "${topic.replace(/"/g, '\\"')}" "${depth || 'sencilla'}" "${safeCategory}"`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Exec error: ${error}`);
            console.error(`Stderr: ${stderr}`);
            return res.status(500).send(stderr || 'Error during research');
        }
        if (stderr) console.log(`Python Logs: ${stderr}`);
        
        console.log(`Research completed for: ${topic}`);
        
        let resultData;
        try {
            resultData = JSON.parse(stdout);
        } catch (e) {
            console.error(`Error parsing python json output: ${e}`);
            resultData = { full_report: stdout, links: [] };
        }
        res.send(resultData);
    });
});

app.post('/cancion/completo', async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).send('No query provided');

    const pythonBin = path.join(__dirname, 'venv', 'bin', 'python3');
    const scriptPath = path.join(__dirname, 'buscadores', 'cancion.py');

    console.log(`[Cancion] Buscando datos para: ${query}`);

    const command = `${pythonBin} "${scriptPath}" "${query.replace(/"/g, '\\"')}"`;

    exec(command, { maxBuffer: 1024 * 1024 }, async (error, stdout, stderr) => {
        if (error) {
            console.error(`[Cancion] Error: ${error}`);
            return res.status(500).send(stderr || 'Error al buscar datos de la canción');
        }
        if (stderr) console.log(`[Cancion] Logs: ${stderr}`);

        let rawData;
        try {
            rawData = JSON.parse(stdout);
        } catch (e) {
            return res.status(500).send('Error parsing song data');
        }

        if (rawData.error) {
            return res.status(500).send(rawData.error);
        }

        const systemPrompt = `Eres donalex:1717, un melómano con criterio y alma de cronista que escribe posts musicales vibrantes en redes sociales (Facebook/LinkedIn). Tu estilo no es solo informar, es CONTAR LA HISTORIA detrás de la música. Te inspiras en las grandes anécdotas de la industria: el miedo de un joven compositor, la llamada inesperada a medianoche, la presión de crear un clásico.

Tu voz es culta, apasionada, ligeramente nostálgica pero con la energía de quien descubre un secreto hoy mismo. El texto debe tener VITALIDAD — usa markdown (**negritas**, *cursivas*) y emojis donde aporten. Generas posts basados ÚNICAMENTE en los datos proporcionados.

ESTRUCTURA DEL POST (Narrativa y fluida):
- **TÍTULO**: Nombre de la canción y artista.
- **LA CHISPA / EL ALMA**: Aquí es donde sucede la magia. Si hay entrevistas, narra el "momento de creación". ¿Había presión? ¿Fue una llamada a las 1 a.m.? ¿Quién desafió a quién? Usa citas textuales entre comillas ("...") para darle voz al artista. Transforma los datos en una pequeña crónica.
- **EL ORIGEN Y EL AUTOR**: Sé extremadamente cuidadoso aquí. **NO inventes autores.** Si los datos mencionan varios nombres, distingue entre compositores originales y adaptadores (especialmente en el pop español de los 90). Si el tema es de un artista español y hay nombres extranjeros, menciona también al autor de la letra en español (como Carlos Toro, etc.) si aparece. **Si no estás seguro del autor, OMITE la sección.**
- **EL SONIDO (ESTUDIO Y PRODUCCIÓN)**: Detalles de las sesiones, músicos que dejaron su huella, el estudio o el álbum que lo cambió todo.
- **ECOS Y VERSIONES**: Si es cover o tiene versiones icónicas, menciónalo como parte del legado. "Original de [artista], inmortalizada por [intérprete]".
- **SENTIDO**: Si no es en español, explica la historia que cuenta la letra o su significado profundo.
- **EL DATO INESPERADO**: Esa curiosidad que hace que el lector se detenga.
- **MINUTA DE FUENTES**: Una lista breve y elegante de dónde se extrajo la información.
- 🎵 **Escúchala en YouTube Music**: [URL]

REGLAS DE ORO:
- **PROHIBIDO ALUCINAR**: No inventes datos biográficos ni autorías. Si los datos son contradictorios o insuficientes, prioriza la omisión.
- **CONTEXTO CULTURAL**: Si el artista es hispano, busca y resalta el aporte de los autores hispanos involucrados.
- NO hagas listas de puntos; prefiere párrafos cortos y fluidos.
- Prioriza las entrevistas: son el corazón del relato.
- Si un dato no está, OMITE la sección. No digas "no disponible".
- Mantén un tono de "pequeña crónica musical" íntima y profesional.
- NO menciones que eres una IA ni uses etiquetas <think>.`;

        const wikipediaSection = rawData.wikipedia && rawData.wikipedia.extract
            ? `\n--- DATOS DE WIKIPEDIA ---\n${rawData.wikipedia.extract}\nURL: ${rawData.wikipedia.url || ''}`
            : '';

        const archiveSection = rawData.internet_archive && rawData.internet_archive.length > 0
            ? `\n--- DATOS DE INTERNET ARCHIVE ---\n${JSON.stringify(rawData.internet_archive, null, 2)}`
            : '';

        const entrevistasSection = rawData.entrevistas && rawData.entrevistas.length > 0
            ? `\n--- ENTREVISTAS / FUENTES CON EL ARTISTA HABLANDO DE LA CANCIÓN ---\n${rawData.entrevistas.map(e => `Fuente: ${e.title}\nURL: ${e.url}\n${e.snippet}`).join('\n\n')}`
            : '';

        const userContent = `Canción: ${rawData.query}
${wikipediaSection}
${archiveSection}
${entrevistasSection}
YouTube Music: ${rawData.youtube_music || ''}`;

        try {
            const aiResponse = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPINFRA_API_KEY}`
                },
                body: JSON.stringify({
                    model: "nvidia/Llama-3.1-Nemotron-70B-Instruct",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userContent }
                    ],
                    temperature: 0.7,
                    max_tokens: 8192
                })
            });

            const data = await aiResponse.json();
            if (!aiResponse.ok) {
                return res.status(500).send(data.error ? data.error.message : 'Error de IA');
            }

            // Verificar si la respuesta se truncó por límite de tokens
            const finishReason = data.choices?.[0]?.finish_reason;
            if (finishReason === 'length') {
                console.warn(`[Cancion] Respuesta truncada por max_tokens para: ${query}`);
            }

            const post = data.choices[0].message.content.trim();
            const cleanPost = post
                .replace(/^<\|start_header_id\|>assistant<\|end_header_id\|>\n?/g, '')
                .replace(/^```markdown\n?/g, '')
                .replace(/```$/g, '')
                .replace(/<think>[\s\S]*?<\/think>/g, '')
                .replace(/^.*?no (hay |est.+n |se encuentran ).*?datos.*?\n/gim, '')
                .replace(/^.*?datos (no |no hay |no est.+n ).*?\n/gim, '')
                .replace(/\n{3,}/g, '\n\n')
                .trim();
            res.send({ content: cleanPost });
        } catch (aiErr) {
            console.error('[Cancion] AI Error:', aiErr);
            res.status(500).send('Error al generar el post con IA');
        }
    });
});

app.post('/tech/completo', async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).send('No query provided');

    const pythonBin = path.join(__dirname, 'venv', 'bin', 'python3');
    const scriptPath = path.join(__dirname, 'researcher.py');

    console.log(`[Tech] Investigando: ${query}`);

    const command = `${pythonBin} "${scriptPath}" "${query.replace(/"/g, '\\"')}" --depth 1`;

    exec(command, { maxBuffer: 1024 * 1024 * 5 }, async (error, stdout, stderr) => {
        if (error) {
            console.error(`[Tech] Error: ${error}`);
            return res.status(500).send(stderr || 'Error al investigar tecnología');
        }

        let researchData;
        try {
            researchData = JSON.parse(stdout);
        } catch (e) {
            return res.status(500).send('Error parsing tech research data');
        }

        const systemPrompt = `Eres donalex:1717, un experto en tecnología con alma de docente y cronista. Tu misión es explicar el mundo digital (apps, lenguajes, workflows, gadgets) a personas que no nacieron con un smartphone en la mano (adultos y "migrantes digitales").

Tu estilo es:
- **Cercano y paciente**: Explicas conceptos complejos (como Docker, APIs o LLMs) usando analogías de la vida real.
- **Técnico pero accesible**: No tienes miedo de hablar de "stacks" o "workflows", pero siempre explicas *por qué* son importantes.
- **Narrativo**: Cuentas la historia de cómo esta tecnología cambia el día a día.

ESTRUCTURA DEL POST:
- **TÍTULO**: El nombre de la tecnología o app.
- **EL CONCEPTO**: ¿Qué es esto en palabras simples? Usa una analogía potente.
- **EL WORKFLOW (CÓMO SE USA)**: Explica el proceso o flujo de trabajo. Haz que se sienta útil y no aterrador.
- **EL STACK (LO QUE HAY DETRÁS)**: Menciona las tripas (lenguajes, herramientas) pero explicando su función.
- **¿POR QUÉ TE IMPORTA?**: El impacto real en la vida o el trabajo del lector.
- **EL DATO PARA IMPRESIONAR**: Un detalle curioso verificado.
- **MINUTA DE FUENTES**: Lista de sitios donde se extrajo la info.
- **DESCARGA / WEB**: Enlace directo oficial.

REGLAS DE ORO:
- **PROHIBIDO ALUCINAR**: No inventes funciones, precios o especificaciones técnicas. Si el dato no está en la investigación, OMITE la sección.
- **VERIFICACIÓN PRIMERO**: Prioriza siempre la web oficial del producto para datos técnicos.
- Evita el lenguaje condescendiente.
- NO menciones que eres una IA.`;

        const userContent = `Tecnología: ${query}
Datos encontrados:
${JSON.stringify(researchData, null, 2)}`;

        try {
            const aiResponse = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPINFRA_API_KEY}`
                },
                body: JSON.stringify({
                    model: "nvidia/Llama-3.1-Nemotron-70B-Instruct",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userContent }
                    ],
                    temperature: 0.7,
                    max_tokens: 4096
                })
            });

            const data = await aiResponse.json();
            if (!aiResponse.ok) return res.status(500).send('Error de IA en Tech');

            res.send({ content: data.choices[0].message.content.trim() });
        } catch (aiErr) {
            res.status(500).send('Error al generar crónica tech');
        }
    });
});

app.post('/news/completo', async (req, res) => {
    const { query } = req.body;
    if (!query) return res.status(400).send('No query provided');

    const pythonBin = path.join(__dirname, 'venv', 'bin', 'python3');
    const scriptPath = path.join(__dirname, 'researcher.py');

    console.log(`[News] Investigando trasfondo: ${query}`);

    const command = `${pythonBin} "${scriptPath}" "${query.replace(/"/g, '\\"')}" --depth 1`;

    exec(command, { maxBuffer: 1024 * 1024 * 5 }, async (error, stdout, stderr) => {
        if (error) {
            console.error(`[News] Error: ${error}`);
            return res.status(500).send(stderr || 'Error al investigar noticia');
        }
        if (stderr) console.log(`[News] Logs: ${stderr}`);

        const researchData = stdout;

        const systemPrompt = `Eres donalex:1717, un analista geopolítico y de actualidad con una pluma afilada y alma de cronista. Tu especialidad no es repetir la noticia, sino explicar QUÉ HAY DETRÁS del anuncio oficial. Buscas las segundas lecturas, los intereses ocultos y el contexto histórico.

Tu estilo es:
- **Analítico e incisivo**: Vas directo al grano. ¿Quién gana? ¿Quién pierde? ¿Qué no nos están diciendo?
- **Narrativo y envolvente**: Cuentas la noticia como un tablero de ajedrez en movimiento.
- **Sin miedo a la verdad**: Hablas de geopolítica, política nacional e internacional con el criterio de quien ha visto pasar muchas "noticias de última hora".
- **Visual**: Usa markdown (**negritas**, *cursivas*) y emojis que subrayen la tensión o el impacto del tema.

ESTRUCTURA DEL POST:
- **TÍTULO**: Un titular que capture el trasfondo (no solo el hecho).
- **EL ANUNCIO (LA SUPERFICIE)**: Resume brevemente qué se dijo oficialmente.
- **EL TRASFONDO (LO QUE NO DICEN)**: Esta es tu sección estrella. Analiza las intenciones, los juegos de poder y el contexto que la prensa rápida ignora.
- **EL TABLERO (GANADORES Y PERDEDORES)**: ¿A quién beneficia esta noticia y a quién pone en jaque?
- **PERSPECTIVA HISTÓRICA**: ¿Ha pasado esto antes? ¿Es un patrón o una anomalía?
- **EL PRONÓSTICO (LO QUE VIENE)**: Tu apuesta sobre cómo evolucionará esto.
- **MINUTA DE FUENTES**: Lista de medios y agencias donde se extrajo la info.

REGLAS DE ORO:
- **PROHIBIDO ALUCINAR**: No inventes citas, eventos o datos estadísticos. Si una parte de la noticia no está clara en la investigación, analízala como "incógnita" o simplemente OMITE la sección.
- **CRITERIO BASADO EN DATOS**: Tu análisis debe derivar de los hechos encontrados, no de prejuicios sin sustento.
- No seas neutral si los datos muestran una dirección clara; ten criterio profesional.
- Evita el sensacionalismo barato; prefiere el análisis profundo.
- NO menciones que eres una IA.`;

        const userContent = `Noticia/Tema: ${query}
Datos encontrados:
${researchData}`;

        try {
            const aiResponse = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${DEEPINFRA_API_KEY}`
                },
                body: JSON.stringify({
                    model: "nvidia/Llama-3.1-Nemotron-70B-Instruct",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: userContent }
                    ],
                    temperature: 0.7,
                    max_tokens: 4096
                })
            });

            const data = await aiResponse.json();
            if (!aiResponse.ok) return res.status(500).send('Error de IA en News');

            res.send({ content: data.choices[0].message.content.trim() });
        } catch (aiErr) {
            res.status(500).send('Error al generar análisis de noticias');
        }
    });
});

app.post('/ai-analyze', (req, res) => {
    const { content } = req.body;
    if (!content) return res.status(400).send('No content provided');

    const analyzerBin = path.join(__dirname, 'simply-analyzer', 'target', 'release', 'simply-analyzer');
    
    // Escapar para shell
    const escapedContent = content.replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$');
    const command = `"${analyzerBin}" "${escapedContent}"`;

    exec(command, { maxBuffer: 1024 * 1024 * 5 }, (error, stdout, stderr) => {
        if (error) {
            console.error(`[Rust Analyze] Error: ${error}`);
            return res.status(500).send(stderr || 'Error al analizar texto con Rust');
        }
        try {
            const results = JSON.parse(stdout);
            res.send(results);
        } catch (e) {
            res.status(500).send('Error parsing Rust output');
        }
    });
});

// Endpoint para listar modelos disponibles desde config.yaml de aichat
app.get('/ai-models', (req, res) => {
    const configPath = path.join(process.env.HOME || '/home/alexdechile', '.config/aichat/config.yaml');
    try {
        const config = yaml.load(fs.readFileSync(configPath, 'utf8'));
        const models = [];
        if (config.clients) {
            for (const client of config.clients) {
                if (client.models) {
                    for (const model of client.models) {
                        if (model.type !== 'embedding') {
                            models.push({
                                client: client.name,
                                name: model.name,
                                fullId: `${client.name}:${model.name}`
                            });
                        }
                    }
                }
            }
        }
        res.json({ models });
    } catch (e) {
        console.error('[AI Models] Error:', e.message);
        res.status(500).json({ error: 'Error al leer configuración de modelos' });
    }
});

app.post('/ai-polish', (req, res) => {
    const { content, model } = req.body;
    if (!content) return res.status(400).send('No content provided');

    console.log(`[AI Polish] Polishing text (length: ${content.length})`);

    const escapedContent = content.replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$');
    
    const systemPrompt = "Actúa como un editor experto y corrector de estilo. Tu misión es corregir la ortografía, gramática y mejorar la redacción del texto proporcionado, manteniendo estrictamente el estilo original (no cambies el tono ni la intención). Devuelve ÚNICAMENTE el texto corregido, sin explicaciones ni preámbulos.";

    const aichatBin = '/home/alexdechile/.cargo/bin/aichat';
    const aichatModel = model || 'nvidia:meta/llama-3.3-70b-instruct';
    const command = `echo "${escapedContent}" | ${aichatBin} -S --model ${aichatModel} --prompt "${systemPrompt}"`;

    exec(command, { maxBuffer: 1024 * 1024 * 2 }, (error, stdout, stderr) => {
        if (error) {
            console.error(`[AI Polish] Error: ${error}`);
            return res.status(500).send(stderr || 'Error al pulir el texto con aichat');
        }
        
        let polishedText = stdout.trim();
        if (polishedText.startsWith('```')) {
            polishedText = polishedText.replace(/^```[a-z]*\n/i, '').replace(/\n```$/g, '');
        }

        console.log(`[AI Polish] Success: Text polished`);
        res.send({ content: polishedText });
    });
});

app.post('/ai-decorate', (req, res) => {
    const { content, model, level } = req.body;
    if (!content) return res.status(400).send('No content provided');

    console.log(`[AI Decorate] Adding salt and pepper (length: ${content.length}), level: ${level}`);

    let levelPrompt = "";
    if (level === 1 || level === '1') {
        levelPrompt = "NIVEL DE DECORACIÓN: SUAVE. Añade emojis de manera muy sutil (máximo 1 o 2 en todo el texto) y solo unas pocas negritas estratégicas. El texto debe verse formal, profesional y limpio, sin saturación visual.";
    } else if (level === 3 || level === '3') {
        levelPrompt = "NIVEL DE DECORACIÓN: INTENSO (Sal y Pimienta total). Añade emojis abundantes e ilustrativos para casi cada idea/párrafo, negritas estratégicas, listas si aplica y algún separador sutil si es necesario. Debe ser altamente llamativo y dinámico, ideal para captar la atención en redes sociales.";
    } else {
        // Por defecto / Nivel 2 (Medio)
        levelPrompt = "NIVEL DE DECORACIÓN: MEDIO. Añade emojis relevantes (moderados, sin saturar) y negritas estratégicas para destacar las ideas clave del texto. Debe ser amigable y estructurado de forma atractiva pero equilibrada.";
    }

    const systemPrompt = `Actúa como un experto en estilismo de redes sociales. Tu misión es añadir 'sal y pimienta' (estilo y decoración visual) al texto proporcionado.
${levelPrompt}

IMPORTANTE: NO cambies el significado, ni la estructura base, ni el mensaje del texto original. Solo añade la capa visual y decorativa (emojis, negritas, etc.). Devuelve ÚNICAMENTE el texto decorado, sin ningún comentario, preámbulo ni bloque de código markdown.`;

    const aichatBin = '/home/alexdechile/.cargo/bin/aichat';
    const aichatModel = model || 'nvidia:meta/llama-3.3-70b-instruct';

    // Ejecución segura usando spawn para evitar errores de escape de bash
    const child = spawn(aichatBin, ['-S', '--model', aichatModel, '--prompt', systemPrompt]);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
        stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
        stderr += data.toString();
    });

    child.on('close', (code) => {
        if (code !== 0) {
            console.error(`[AI Decorate] Error code ${code}: ${stderr}`);
            return res.status(500).send(stderr || 'Error al decorar el texto con aichat');
        }

        let decoratedText = stdout.trim();
        if (decoratedText.startsWith('```')) {
            decoratedText = decoratedText.replace(/^```[a-z]*\n/i, '').replace(/\n```$/g, '');
        }

        console.log(`[AI Decorate] Success: Text decorated`);
        res.send({ content: decoratedText });
    });

    // Escribir el contenido en stdin del proceso aichat
    child.stdin.write(content);
    child.stdin.end();
});

app.post('/ai-suggest', (req, res) => {
    const { content, model } = req.body;
    if (!content) return res.status(400).send('No content provided');

    console.log(`[AI Suggest] Generating suggestions (length: ${content.length})`);

    const escapedContent = content.replace(/"/g, '\\"').replace(/`/g, '\\`').replace(/\$/g, '\\$');
    
    const systemPrompt = "Eres un asistente creativo y estratega de contenido. Lee el texto que el usuario ha escrito y sugiere 2 o 3 ideas adicionales, ángulos nuevos o párrafos que podrían continuar o enriquecer el post. Mantén el tono y estilo detectado. Sé breve y directo. Devuelve solo las sugerencias en formato markdown, usando viñetas si es necesario.";

    const aichatBin = '/home/alexdechile/.cargo/bin/aichat';
    const aichatModel = model || 'nvidia:meta/llama-3.3-70b-instruct';
    const command = `echo "${escapedContent}" | ${aichatBin} -S --model ${aichatModel} --prompt "${systemPrompt}"`;

    exec(command, { maxBuffer: 1024 * 1024 * 2 }, (error, stdout, stderr) => {
        if (error) {
            console.error(`[AI Suggest] Error: ${error}`);
            return res.status(500).send(stderr || 'Error al obtener sugerencias con aichat');
        }
        
        let suggestion = stdout.trim();
        if (suggestion.startsWith('```')) {
            suggestion = suggestion.replace(/^```[a-z]*\n/i, '').replace(/\n```$/g, '');
        }

        console.log(`[AI Suggest] Success: Suggestions generated`);
        res.send({ content: suggestion });
    });
});

app.post('/ai-thread', (req, res) => {
    const { content, model } = req.body;
    if (!content) return res.status(400).send('No content provided');

    console.log(`[AI Thread] Splitting text into thread (length: ${content.length})`);

    const systemPrompt = "Actúa como un redactor experto en hilos de X (Twitter). Tu misión es fragmentar el texto proporcionado en un hilo ordenado y coherente de tweets numerados (por ejemplo: '1/', '2/', etc.). Cada fragmento DEBE tener un máximo de 280 caracteres y representar una idea completa y fácil de leer. No resumas el texto completo en un solo tweet, divídelo fluidamente. Devuelve ÚNICAMENTE los tweets numerados, separados entre sí por una línea en blanco, sin comentarios ni explicaciones adicionales.";

    const aichatBin = '/home/alexdechile/.cargo/bin/aichat';
    const aichatModel = model || 'nvidia:meta/llama-3.3-70b-instruct';

    const child = spawn(aichatBin, ['-S', '--model', aichatModel, '--prompt', systemPrompt]);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('close', (code) => {
        if (code !== 0) {
            console.error(`[AI Thread] Error code ${code}: ${stderr}`);
            return res.status(500).send(stderr || 'Error al generar hilo con aichat');
        }

        let threadText = stdout.trim();
        if (threadText.startsWith('```')) {
            threadText = threadText.replace(/^```[a-z]*\n/i, '').replace(/\n```$/g, '');
        }

        console.log(`[AI Thread] Success: Thread generated`);
        res.send({ content: threadText });
    });

    child.stdin.write(content);
    child.stdin.end();
});

app.post('/ai-copywrite', (req, res) => {
    const { content, model, formula } = req.body;
    if (!content) return res.status(400).send('No content provided');
    if (!formula) return res.status(400).send('No formula provided');

    console.log(`[AI Copywrite] Applying formula ${formula} (length: ${content.length})`);

    let formulaPrompt = "";
    if (formula === 'pas') {
        formulaPrompt = "Reescribe el texto usando la estructura PAS (Problema, Agitación, Solución). Usa encabezados claros en Markdown (por ejemplo, '### Problema', '### Agitación', '### Solución') para cada sección.";
    } else {
        formulaPrompt = "Reescribe el texto usando la estructura AIDA (Atención, Interés, Deseo, Acción). Usa encabezados claros en Markdown (por ejemplo, '### Atención', '### Interés', '### Deseo', '### Acción') para cada sección.";
    }

    const systemPrompt = `Actúa como un copywriter profesional de alta conversión. Tu misión es reescribir el texto proporcionado.
${formulaPrompt}
Devuelve ÚNICAMENTE el texto reescrito estructurado, sin introducciones, saludos ni comentarios adicionales, y sin envolverlo en bloques de código markdown.`;

    const aichatBin = '/home/alexdechile/.cargo/bin/aichat';
    const aichatModel = model || 'nvidia:meta/llama-3.3-70b-instruct';

    const child = spawn(aichatBin, ['-S', '--model', aichatModel, '--prompt', systemPrompt]);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('close', (code) => {
        if (code !== 0) {
            console.error(`[AI Copywrite] Error code ${code}: ${stderr}`);
            return res.status(500).send(stderr || 'Error al aplicar copywriting con aichat');
        }

        let copyText = stdout.trim();
        if (copyText.startsWith('```')) {
            copyText = copyText.replace(/^```[a-z]*\n/i, '').replace(/\n```$/g, '');
        }

        console.log(`[AI Copywrite] Success: Copywriting applied`);
        res.send({ content: copyText });
    });

    child.stdin.write(content);
    child.stdin.end();
});

app.post('/ai-hooks', (req, res) => {
    const { content, model } = req.body;
    if (!content) return res.status(400).send('No content provided');

    console.log(`[AI Hooks] Generating hooks (length: ${content.length})`);

    const systemPrompt = "Actúa como un estratega de contenido viral y copywriter. Tu misión es leer el texto provisto y proponer 3 ganchos (hooks) o líneas de apertura sumamente llamativas y optimizadas para redes sociales basadas en el contenido. Enuméralas del 1 al 3. Devuelve ÚNICAMENTE las 3 propuestas numeradas en formato de lista Markdown, sin preámbulos, notas ni comentarios adicionales.";

    const aichatBin = '/home/alexdechile/.cargo/bin/aichat';
    const aichatModel = model || 'nvidia:meta/llama-3.3-70b-instruct';

    const child = spawn(aichatBin, ['-S', '--model', aichatModel, '--prompt', systemPrompt]);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => { stdout += data.toString(); });
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    child.on('close', (code) => {
        if (code !== 0) {
            console.error(`[AI Hooks] Error code ${code}: ${stderr}`);
            return res.status(500).send(stderr || 'Error al generar hooks con aichat');
        }

        let hooksText = stdout.trim();
        if (hooksText.startsWith('```')) {
            hooksText = hooksText.replace(/^```[a-z]*\n/i, '').replace(/\n```$/g, '');
        }

        console.log(`[AI Hooks] Success: Hooks generated`);
        res.send({ content: hooksText });
    });

    child.stdin.write(content);
    child.stdin.end();
});

app.post('/export', (req, res) => {
    const { content, format } = req.body;
    if (!content || !format) return res.status(400).send('Missing content or format');

    const pythonBin = path.join(__dirname, 'venv', 'bin', 'python3');
    const scriptPath = path.join(__dirname, 'exporter.py');
    const tempIn = path.join(__dirname, `temp_in_${Date.now()}.txt`);
    const tempOut = path.join(__dirname, `temp_out_${Date.now()}.${format}`);

    fs.writeFileSync(tempIn, content);

    const command = `${pythonBin} "${scriptPath}" "${format}" "${tempIn}" "${tempOut}"`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Export error: ${error}`);
            return res.status(500).send('Error during export');
        }

        res.download(tempOut, `simply_export.${format}`, (err) => {
            // Cleanup
            if (fs.existsSync(tempIn)) fs.unlinkSync(tempIn);
            if (fs.existsSync(tempOut)) fs.unlinkSync(tempOut);
        });
    });
});

app.post('/ask-ai', async (req, res) => {
    const { systemPrompt, userContent, model } = req.body;
    const selectedModel = model || "nvidia/Llama-3.1-Nemotron-70B-Instruct";
    
    try {
        console.log(`[AI Request] Model: ${selectedModel}`);
        const response = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${DEEPINFRA_API_KEY}` 
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userContent }
                ],
                temperature: 0.7,
                max_tokens: 2048
            })
        });

        const data = await response.json();
        if (!response.ok) {
            const errorLog = `[AI Error] Status: ${response.status}, Data: ${JSON.stringify(data)}\n`;
            fs.appendFileSync(path.join(__dirname, 'simply.log'), errorLog);
            console.error(errorLog.trim());
            return res.status(response.status).send(data.error ? data.error.message : 'Error from IA');
        }
        res.send(data);
    } catch (error) {
        console.error('AI Proxy Error:', error);
        res.status(500).send('Internal Server Error calling IA');
    }
});
