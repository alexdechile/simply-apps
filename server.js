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
const DEEPINFRA_API_KEY = process.env.DEEPINFRA_API_KEY;

app.post('/save-to-vault', (req, res) => {
    const { content, filename } = req.body;
    if (!content) {
        return res.status(400).send('No content provided');
    }

    const vaultPath = '/home/alexdechile/vault';
    const postsPath = path.join(vaultPath, 'posts');
    const date = new Date().toISOString().split('T')[0];
    const name = filename || `post_${date}.md`;
    
    // Asegurar que la carpeta 'posts' existe
    if (!fs.existsSync(postsPath)) {
        fs.mkdirSync(postsPath, { recursive: true });
    }

    const fullPath = path.join(postsPath, name);
    const sidebarPath = path.join(vaultPath, '_sidebar.md');

    fs.writeFile(fullPath, content, (err) => {
        if (err) {
            console.error('Error saving to vault:', err);
            return res.status(500).send('Error saving to vault');
        }
        
        console.log(`Saved ${name} to vault/posts`);

        // Actualizar _sidebar.md automáticamente
        try {
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
    console.log(`Executing: ${command}`);
    
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
    
    try {
        const response = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Authorization': `Bearer ${DEEPINFRA_API_KEY}` 
            },
            body: JSON.stringify({
                model: model || "nvidia/NVIDIA-Nemotron-3-Super-120B-A12B",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userContent }
                ],
                temperature: 0.7,
                max_tokens: 2048
            })
        });

        const data = await response.json();
        if (data.error) {
            return res.status(500).send(data.error.message || 'Error from DeepInfra');
        }
        res.send(data);
    } catch (error) {
        console.error('AI Proxy Error:', error);
        res.status(500).send('Internal Server Error calling IA');
    }
});
