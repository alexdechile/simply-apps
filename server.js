const express = require('express');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const app = express();
const port = 1717;

const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Simply Apps running at http://0.0.0.0:${port}`);
});
server.timeout = 120000; // 120 segundos
server.keepAliveTimeout = 125000;

app.use(express.json());
app.use(express.static(__dirname));

const { exec } = require('child_process');

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

app.post('/research', (req, res) => {
    const { topic, depth } = req.body;
    if (!topic) return res.status(400).send('No topic provided');

    const pythonBin = path.join(__dirname, 'venv', 'bin', 'python3');
    const scriptPath = path.join(__dirname, 'researcher.py');
    
    console.log(`Researching topic: ${topic} (Depth: ${depth || 'sencilla'})`);
    
    const command = `${pythonBin} "${scriptPath}" "${topic.replace(/"/g, '\\"')}" "${depth || 'sencilla'}"`;
    
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Exec error: ${error}`);
            console.error(`Stderr: ${stderr}`);
            return res.status(500).send(stderr || 'Error during research');
        }
        if (stderr) console.log(`Python Logs: ${stderr}`);
        
        console.log(`Research completed for: ${topic}`);
        res.send({ content: stdout });
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
                    max_tokens: 4096
                })
            });

            const data = await aiResponse.json();
            if (!aiResponse.ok) {
                return res.status(500).send(data.error ? data.error.message : 'Error de IA');
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

        let researchData;
        try {
            researchData = JSON.parse(stdout);
        } catch (e) {
            return res.status(500).send('Error parsing news research data');
        }

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
            if (!aiResponse.ok) return res.status(500).send('Error de IA en News');

            res.send({ content: data.choices[0].message.content.trim() });
        } catch (aiErr) {
            res.status(500).send('Error al generar análisis de noticias');
        }
    });
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
