(function() {
  // --- ELEMENTOS DOM ---
  const el = {
    outFB: document.getElementById('output'),
    outX: document.getElementById('outputX'),
    outLI: document.getElementById('outputLI'),
    xCounter: document.getElementById('x-counter'),
    copyFB: document.getElementById('copyBtn'),
    copyX: document.getElementById('copyXBtn'),
    copyLI: document.getElementById('copyLIBtn'),
    vault: document.getElementById('vaultBtn'),
    editor: document.getElementById('editor'),
    pensar: document.getElementById('pensarBtn'),
    genX: document.getElementById('genXBtn'),
    genLI: document.getElementById('genLIBtn'),
    formatMenu: document.getElementById('format-menu'),
    cargarArchivoBtn: document.getElementById('cargarArchivoBtn'),
    guardarArchivoBtn: document.getElementById('guardarArchivoBtn'),
    archivoInput: document.getElementById('archivoInput'),
    limpiarGatosBtn: document.getElementById('limpiarGatosBtn'),
    borrarComentariosBtn: document.getElementById('borrarComentariosBtn'),
    emojiBtn: document.getElementById('emojiBtn'),
    investigar: document.getElementById('investigarBtn'),
    exportWord: document.getElementById('exportWordBtn'),
    exportExcel: document.getElementById('exportExcelBtn'),
    exportHtml: document.getElementById('exportHtmlBtn'),
    toneOptions: document.querySelectorAll('.tone-option'),
    currentToneLabel: document.getElementById('currentToneLabel'),
    charCount: document.getElementById('char-count'),
    prompts: {
      fb_col: document.getElementById('promptFB_col'),
      fb_com: document.getElementById('promptFB_com'),
      fb_neu: document.getElementById('promptFB_neu'),
      x: document.getElementById('promptX'),
      li: document.getElementById('promptLI'),
      save: document.getElementById('saveConfigBtn'),
      reset: document.getElementById('resetPromptsBtn')
    }
  };

  // --- ESTADO INICIAL ---
  let state = {
    activeChannel: 'fb',
    currentTone: 'fb_col',
    contents: {
      fb: '',
      x: '',
      li: ''
    },
    isThinking: false
  };

  // --- PROMPTS POR DEFECTO ---
  const defaultPrompts = {
    fb_col: `Eres un escritor latinoamericano que publica reflexiones personales en redes sociales. 
Escribe en primera persona con estas características:

TONO Y VOZ:
- Conversacional y cercano, como si hablaras con amigos de confianza
- Honesto y directo, sin rodeos ni artificios
- Ligeramente opinático, no temes dar tu punto de vista
- Informal pero no vulgar

ESTILO:
- Oraciones cortas o medias, nunca rebuscadas
- Puedes romper reglas gramaticales menores si suena más natural (ej: iniciar con "Pero", "Y", puntuación imperfecta)
- Nada de listas, títulos ni estructura de blog
- Cierra siempre de forma humana y cálida (ej: "Un fuerte abrazo")

EVITAR:
- Vocabulario demasiado formal o técnico
- Frases que suenen a marketing o a post optimizado
- Exceso de signos de puntuación o emojis

Tu tarea es leer el texto propuesto, verificar si cumple con estas reglas, corregir la ortografía y adaptarlo para que fluya con esta personalidad natural.`,
    fb_com: `Eres un estratega de contenido comercial disruptivo. Tu objetivo es vender sin parecer un vendedor, usando el 'Storyselling'.

Tus mandatos de estilo:
1. El Gancho: Un problema doloroso o un beneficio masivo.
2. Valor Real: Explica el 'por qué' con profundidad.
3. Urgencia Elegante: Crea deseo sin desesperación.

Regla de Estructura:
- Mantén el flujo narrativo del texto original.
- Optimiza la legibilidad dividiendo bloques densos de información comercial.`,
    fb_neu: `Eres un analista de datos objetivo y equilibrado. Tu misión es la claridad absoluta y el rigor informativo.

Tus mandatos de estilo:
1. Objetividad: Hechos antes que opiniones.
2. Desglose: Divide las ideas complejas en partes digeribles.
3. Perspectiva: Presenta los pros y contras de forma pragmática.

Regla de Estructura:
- Respeta la organización lógica del texto original.
- Separa las ideas en párrafos distintos si detectas que el análisis técnico se vuelve denso.`,
    x: "Eres donalex:1717. Basándote en el post de Facebook proporcionado, genera un tweet punzante y sintetizado (máx 280 caracteres). Sin Markdown.",
    li: "Eres donalex:1717. Basándote en el post de Facebook proporcionado, genera una versión profesional, técnica y disruptiva para LinkedIn (Thought Leadership)."
  };

  // Cargar prompts guardados
  function loadPrompts() {
    // --- MIGRACIÓN DE PROMPTS ANTIGUOS ---
    const oldFB = localStorage.getItem('p_fb');
    if (oldFB && !localStorage.getItem('p_fb_col')) {
      localStorage.setItem('p_fb_col', oldFB);
      // Opcional: limpiar el antiguo para no repetir migración
      // localStorage.removeItem('p_fb'); 
    }

    if (el.prompts.fb_col) el.prompts.fb_col.value = localStorage.getItem('p_fb_col') || defaultPrompts.fb_col;
    if (el.prompts.fb_com) el.prompts.fb_com.value = localStorage.getItem('p_fb_com') || defaultPrompts.fb_com;
    if (el.prompts.fb_neu) el.prompts.fb_neu.value = localStorage.getItem('p_fb_neu') || defaultPrompts.fb_neu;
    if (el.prompts.x) el.prompts.x.value = localStorage.getItem('p_x') || defaultPrompts.x;
    if (el.prompts.li) el.prompts.li.value = localStorage.getItem('p_li') || defaultPrompts.li;
    
    // Cargar tono guardado
    const savedTone = localStorage.getItem('simply-tone') || 'fb_col';
    state.currentTone = savedTone;
    actualizarLabelTono(savedTone);
  }

  function actualizarLabelTono(val) {
    if (!el.currentToneLabel) return;
    const map = { 'fb_col': 'Coloquial', 'fb_com': 'Comercial', 'fb_neu': 'Neutro' };
    el.currentToneLabel.textContent = map[val] || 'Coloquial';
  }

  el.toneOptions.forEach(opt => {
    opt.onclick = (e) => {
      e.preventDefault();
      const val = opt.getAttribute('data-value');
      state.currentTone = val;
      localStorage.setItem('simply-tone', val);
      actualizarLabelTono(val);
    };
  });

  el.prompts.save.onclick = () => {
    if (el.prompts.fb_col) localStorage.setItem('p_fb_col', el.prompts.fb_col.value);
    if (el.prompts.fb_com) localStorage.setItem('p_fb_com', el.prompts.fb_com.value);
    if (el.prompts.fb_neu) localStorage.setItem('p_fb_neu', el.prompts.fb_neu.value);
    if (el.prompts.x) localStorage.setItem('p_x', el.prompts.x.value);
    if (el.prompts.li) localStorage.setItem('p_li', el.prompts.li.value);
    alert('Prompts guardados con éxito.');
  };
  el.prompts.reset.onclick = () => {
    if (confirm('¿Quieres volver a los prompts de fábrica?')) {
      localStorage.removeItem('p_fb_col');
      localStorage.removeItem('p_fb_com');
      localStorage.removeItem('p_fb_neu');
      localStorage.removeItem('p_x');
      localStorage.removeItem('p_li');
      loadPrompts();
      alert('Prompts restablecidos.');
    }
  };
  // --- EVENTOS DE TONO ---
  if (el.tones) {
    el.tones.forEach(radio => {
      radio.onchange = () => {
        state.currentTone = radio.value;
        localStorage.setItem('simply-tone', radio.value);
      };
    });
  }

  // --- EDITOR ---
  const easyMDE = new EasyMDE({
    element: el.editor,
    autofocus: true,
    spellChecker: false,
    toolbar: false,
    status: false,
    placeholder: 'Escribe aquí, librepensador...',
    initialValue: localStorage.getItem('simply-editor-content') || '',
    theme: 'dark'
  });

  // --- LÓGICA DE PESTAÑAS ---
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.onclick = () => {
      const targetId = btn.getAttribute('data-target');
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      tabContents.forEach(content => content.classList.toggle('active', content.id === targetId));
      state.activeChannel = targetId.split('-')[1] || 'fb';
      actualizarVistas(); // Refrescar contenido al cambiar
    };
  });

  // --- ACTUALIZACIÓN DE VISTAS ---
  function actualizarVistas() {
    try {
      const md = easyMDE.value();
      
      // Si no es un resultado de IA, actualizamos en vivo el espejo
      if (!state.isThinking && el.outFB) {
        el.outFB.textContent = markdownToFacebookUnicode(md);
      }

      if (el.charCount) el.charCount.textContent = md.length;
      const wordCountEl = document.getElementById('word-count');
      if (wordCountEl) {
        const words = md.trim() ? md.trim().split(/\s+/).length : 0;
        wordCountEl.textContent = words;
      }
      
      localStorage.setItem('simply-editor-content', md);
    } catch (err) {
      console.error("Error en actualizarVistas:", err);
    }
  }

  easyMDE.codemirror.on('change', actualizarVistas);

  // --- SCROLL SINCRONIZADO ---
  easyMDE.codemirror.on('scroll', (cm) => {
    try {
      const scrollInfo = cm.getScrollInfo();
      const denominator = scrollInfo.height - scrollInfo.clientHeight;
      if (denominator <= 0) return;

      const scrollPercent = scrollInfo.top / denominator;
      
      let activeOutput;
      if (state.activeChannel === 'fb') activeOutput = el.outFB;
      else if (state.activeChannel === 'x') activeOutput = el.outX;
      else if (state.activeChannel === 'li') activeOutput = el.outLI;

      if (activeOutput) {
        const targetDenominator = activeOutput.scrollHeight - activeOutput.clientHeight;
        if (targetDenominator > 0) {
          activeOutput.scrollTop = scrollPercent * targetDenominator;
        }
      }
    } catch (err) {
      // Fallar silenciosamente en el scroll para no bloquear el editor
    }
  });

  // --- IA donalex:1717 ---
  async function callAI(systemPrompt, userContent) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000); // 120 segundos de gracia

    try {
      const response = await fetch('ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          userContent,
          model: "nvidia/NVIDIA-Nemotron-3-Super-120B-A12B"
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Error del servidor (1717): ${errText}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(`Servidor dice: ${data.error.message || JSON.stringify(data.error)}`);
      }

      if (!data.choices || !data.choices[0]) {
        throw new Error("La IA no devolvió una respuesta válida.");
      }

      return data.choices[0].message.content.trim();
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error("La IA tardó demasiado en responder (Timeout 120s).");
      }
      throw err;
    }
  }
  async function consultarIA() {
    const text = easyMDE.value();
    if (!text.trim()) return;

    state.isThinking = true;
    el.pensar.textContent = '🤔 Pensando FB...';

    try {
      // Obtener prompt según tono
      const tonePromptEl = el.prompts[state.currentTone];
      const systemPrompt = tonePromptEl ? tonePromptEl.value : defaultPrompts[state.currentTone];
      
      // Instrucción de usuario para edición y corrección de estilo
      const userInstruction = `Analiza el siguiente texto y asegúrate de que cumpla estrictamente con tu personalidad y reglas de estilo definidas. 
Corrige la ortografía y gramática, y adapta el tono según sea necesario para que suene natural y profesional dentro de tu rol.

Entrega solo el resultado final, sin introducciones ni comentarios adicionales.

TEXTO A PROCESAR:
${text}`;

      // Generar Facebook Post
      let fbPost = await callAI(systemPrompt, userInstruction);
      
      // Limpiar posibles bloques de código markdown que la IA a veces añade
      fbPost = fbPost.replace(/^```markdown\n?/g, '').replace(/```$/g, '').trim();
      
      console.log("Respuesta procesada de la IA lista para inyectar:", fbPost);

      if (confirm(`🧠 La IA ha procesado el texto con éxito.\n\n¿Quieres inyectar el resultado en el editor?`)) {
        const cm = easyMDE.codemirror;
        
        // Guardar posición de scroll actual
        const scrollInfo = cm.getScrollInfo();
        
        // Inyectar directamente usando la API de CodeMirror para mayor robustez
        cm.getDoc().setValue(fbPost);
        
        // Forzar repintado visual y actualización de alturas
        cm.refresh();
        
        // Restaurar scroll al inicio para el nuevo contenido
        cm.scrollTo(scrollInfo.left, 0);

        // Actualizar manualmente la vista de previsualización
        el.outFB.textContent = markdownToFacebookUnicode(fbPost);
        
        // Asegurar que el contador de caracteres se actualice
        if (el.charCount) el.charCount.textContent = fbPost.length;
      }
    } catch (e) { 
      console.error(e);
      alert('Error en la IA: ' + e.message); 
    }
    finally { 
      state.isThinking = false; 
      el.pensar.textContent = '🧠 Pensar'; 
    }
  }
  el.pensar.onclick = consultarIA;

  // Elementos del Modal
  const researchModal = new bootstrap.Modal(document.getElementById('researchModal'));
  const searchQueryInput = document.getElementById('searchQueryInput');
  const trendsInput = document.getElementById('trendsInput');
  const startResearchBtn = document.getElementById('startResearchBtn');
  const researchStatus = document.getElementById('researchStatus');

  el.investigar.onclick = async () => {
    const rawTopic = prompt('¿Qué tema quieres investigar con Scrapling?');
    if (!rawTopic) return;

    let apiKey = localStorage.getItem('deepinfra-api-key');
    if (!apiKey) {
      apiKey = prompt('API Key de DeepInfra:');
      if (apiKey) localStorage.setItem('deepinfra-api-key', apiKey);
      else return;
    }

    const originalText = el.investigar.textContent;
    el.investigar.textContent = '🧠 Planificando...';
    el.investigar.disabled = true;

    try {
      // PASO 1: Planificación (Pedimos Query + Dominios)
      const planPrompt = `Eres un estratega de investigación. Analiza el tema: "${rawTopic}". 
Responde con un objeto JSON (solo el JSON) con este formato:
{
  "query": "texto de búsqueda simple para google",
  "tendencias": "3 dominios relevantes separados por comas (ej: Neurociencia, Nutrición, Psicología)"
}`;
      
      const planRaw = await callAI("Estratega de Investigación", planPrompt, apiKey);
      let plan;
      try {
        plan = JSON.parse(planRaw.replace(/```json|```/g, ''));
      } catch (e) {
        plan = { query: rawTopic, tendencias: "General, Ciencia, Tendencias" };
      }

      // PASO 2: Mostrar Modal
      searchQueryInput.value = plan.query;
      trendsInput.value = plan.tendencias;
      researchStatus.classList.add('d-none');
      startResearchBtn.disabled = false;
      researchModal.show();

      // Manejador del botón del modal
      startResearchBtn.onclick = async () => {
        const finalQuery = searchQueryInput.value;
        const finalTrends = trendsInput.value;
        const depth = document.querySelector('input[name="researchDepth"]:checked').value;
        if (!finalQuery) return;

        startResearchBtn.disabled = true;
        researchStatus.classList.remove('d-none');

        try {
          // PASO 3: Investigación técnica
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000);

          const response = await fetch('research', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: finalQuery, depth: depth }),
            signal: controller.signal
          });
          clearTimeout(timeoutId);

          if (!response.ok) throw new Error('La investigación técnica falló.');

          const data = await response.json();
          console.log("Datos recibidos para síntesis. Tamaño:", data.content ? data.content.length : 0);

          // PASO 4: Síntesis adaptativa
          researchStatus.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sintetizando reporte final...';
          
          const synthesizePrompt = `Eres donalex:1717, un adulto con visión crítica, buen lector, políglota y estudioso constante de la realidad. Escribes con una voz humana, informada y consciente del mundo.
Investigación: "${rawTopic}". 
ENFOQUE REQUERIDO: ${finalTrends}.
DATOS:
---
${data.content ? data.content.substring(0, 7000) : 'Sin datos'}
---
Genera un reporte "Simply Style" con esta estructura:

1. INTRODUCCIÓN COLOQUIAL: Empieza con un párrafo cercano que invite al lector al tema. Explícalo en tu voz, conectándolo con la realidad actual o la curiosidad intelectual.
2. CUERPO DEL REPORTE: Título provocador y 3-5 insights profundos.
3. REGLAS CRÍTICAS:
   - Usa los dominios de ENFOQUE REQUERIDO para estructurar.
   - NO USES TABLAS DE MARKDOWN. Usa listas con viñetas (bullet points).
   - No menciones que eres una IA.
4. NARRATIVA DE FUENTES: Al final, redacta un pequeño párrafo narrativo (estilo bibliográfico) mencionando las fuentes y sitios web consultados basándote en los DATOS proporcionados. Sin enlaces crudos.`;

          console.log("Llamando a IA para síntesis...");
          researchStatus.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sintetizando con IA...';
          
          const finalReport = await callAI("Analista Estratégico", synthesizePrompt);
          console.log("Respuesta de IA recibida. Longitud:", finalReport ? finalReport.length : 0);

          if (!finalReport || finalReport.length < 10) {
            throw new Error('La IA devolvió un reporte demasiado corto o vacío.');
          }

          console.log("Inyectando contenido en el editor...");
          const cm = easyMDE.codemirror;
          const currentContent = easyMDE.value();
          const separator = currentContent ? '\n\n---\n\n' : '';
          
          // Limpiar bloques de código markdown si la IA los incluyó por error
          const cleanReport = finalReport.replace(/^```markdown\n?/g, '').replace(/```$/g, '').trim();
          
          // Inyectar usando la API directa para asegurar el renderizado
          cm.getDoc().setValue(currentContent + separator + cleanReport);
          
          // Refrescar y actualizar vistas
          cm.refresh();
          actualizarVistas();
          
          researchModal.hide();
          console.log("Inyección completada con éxito.");
          
          setTimeout(() => {
            alert('¡Investigación completada!');
          }, 500);
        } catch (e) {
          alert('Error: ' + e.message);
        } finally {
          startResearchBtn.disabled = false;
          researchStatus.classList.add('d-none');
        }
      };

    } catch (err) {
      alert('Error en planificación: ' + err.message);
    } finally {
      el.investigar.textContent = originalText;
      el.investigar.disabled = false;
    }
  };

  function planTopicTemplate(topic) {
    return `Crea una búsqueda de Google/DuckDuckGo simple y directa para investigar tendencias actuales sobre: "${topic}". 
Enfócate en encontrar datos sobre neurociencia, economía o filosofía relacionados.
Responde SOLO con el texto de la búsqueda, sin comillas ni operadores complejos como (+, OR, paréntesis). 
Ejemplo: Tendencias en neurociencia y salud cerebral 2024`;
  }

  async function generarDerivado(tipo) {
    let apiKey = localStorage.getItem('deepinfra-api-key');
    if (!apiKey) {
      apiKey = prompt('API Key de DeepInfra:');
      if (apiKey) localStorage.setItem('deepinfra-api-key', apiKey);
      else return;
    }

    // Usamos el contenido actual de Facebook como base
    const fbContent = el.outFB.textContent;
    if (!fbContent.trim()) {
      alert('Primero debes tener contenido en Facebook para derivar.');
      return;
    }

    const btn = tipo === 'x' ? el.genX : el.genLI;
    const originalText = btn.textContent;
    btn.textContent = '🤔 Generando...';
    btn.disabled = true;

    try {
      const prompt = tipo === 'x' ? el.prompts.x.value : el.prompts.li.value;
      const derivado = await callAI(prompt, fbContent, apiKey);
      
      if (tipo === 'x') {
        el.outX.textContent = derivado;
        if (el.xCounter) el.xCounter.textContent = 280 - derivado.length;
        localStorage.setItem('simply-x-content', derivado);
      } else {
        el.outLI.textContent = derivado;
        localStorage.setItem('simply-li-content', derivado);
      }
    } catch (e) {
      console.error(e);
      alert('Error en la IA: ' + e.message);
    } finally {
      btn.textContent = originalText;
      btn.disabled = false;
    }
  }

  el.genX.onclick = () => generarDerivado('x');
  el.genLI.onclick = () => generarDerivado('li');

  // --- MENÚ DE FORMATO ---
  easyMDE.codemirror.on('cursorActivity', () => {
    if (easyMDE.codemirror.somethingSelected()) {
      const coords = easyMDE.codemirror.charCoords(easyMDE.codemirror.getCursor('start'), 'page');
      el.formatMenu.classList.add('visible');
      let left = coords.left - (el.formatMenu.offsetWidth / 2);
      if (left < 10) left = 10;
      if (left + el.formatMenu.offsetWidth > window.innerWidth - 10) left = window.innerWidth - el.formatMenu.offsetWidth - 10;
      el.formatMenu.style.left = left + 'px';
      el.formatMenu.style.top = (coords.top - el.formatMenu.offsetHeight - 15) + 'px';
    } else {
      el.formatMenu.classList.remove('visible');
    }
  });

  el.formatMenu.querySelectorAll('.menu-btn').forEach(btn => {
    btn.onmousedown = (e) => {
      e.preventDefault();
      const style = btn.getAttribute('data-style');
      const selection = easyMDE.codemirror.getSelection();
      let wrapped;
      switch(style) {
        case 'bold': wrapped = `**${selection}**`; break;
        case 'italic': wrapped = `*${selection}*`; break;
        case 'script': wrapped = `{s}${selection}{/s}`; break;
        case 'fraktur': wrapped = `{f}${selection}{/f}`; break;
        case 'double': wrapped = `{d}${selection}{/d}`; break;
        case 'sansbold': wrapped = `{sb}${selection}{/sb}`; break;
        case 'circled': wrapped = `{c}${selection}{/c}`; break;
        case 'squared': wrapped = `{sq}${selection}{/sq}`; break;
        case 'fullwidth': wrapped = `{fw}${selection}{/fw}`; break;
      }
      easyMDE.codemirror.replaceSelection(wrapped);
    };
  });

  // --- UNICODE ---
  function markdownToFacebookUnicode(md) {
    md = md.replace(/(\*\*\*|___)(.*?)\1/g, (_, __, t) => toBoldItalic(t));
    md = md.replace(/(\*\*|__)(.*?)\1/g, (_, __, t) => toBold(t));
    md = md.replace(/(\*|_)(.*?)\1/g, (_, __, t) => toItalic(t));
    md = md.replace(/\{s\}(.*?)\{\/s\}/g, (_, t) => toScript(t));
    md = md.replace(/\{f\}(.*?)\{\/f\}/g, (_, t) => toFraktur(t));
    md = md.replace(/\{d\}(.*?)\{\/d\}/g, (_, t) => toDoubleStruck(t));
    md = md.replace(/\{sb\}(.*?)\{\/sb\}/g, (_, t) => toSansBold(t));
    md = md.replace(/\{c\}(.*?)\{\/c\}/g, (_, t) => toCircled(t));
    md = md.replace(/\{sq\}(.*?)\{\/sq\}/g, (_, t) => toSquared(t));
    md = md.replace(/\{fw\}(.*?)\{\/fw\}/g, (_, t) => toFullwidth(t));
    md = md.replace(/`([^`]+)`/g, (_, t) => toMonospace(t));
    return md.replace(/\r\n|\r|\n/g, '\n');
  }

  // Funciones de mapeo matemático corregidas
  function toBold(s) { return s.replace(/[A-Za-z0-9]/g, c => { let code = c.charCodeAt(0); if (code>=65 && code<=90) return String.fromCodePoint(code+119743); if (code>=97 && code<=122) return String.fromCodePoint(code+119737); if (code>=48 && code<=57) return String.fromCodePoint(code+120734); return c; }); }
  function toItalic(s) { return s.replace(/[A-Za-z]/g, c => { if (c==='h') return 'ℎ'; let code = c.charCodeAt(0); if (code>=65 && code<=90) return String.fromCodePoint(code+119795); if (code>=97 && code<=122) return String.fromCodePoint(code+119789); return c; }); }
  function toBoldItalic(s) { return s.replace(/[A-Za-z]/g, c => { let code = c.charCodeAt(0); if (code>=65 && code<=90) return String.fromCodePoint(code+119847); if (code>=97 && code<=122) return String.fromCodePoint(code+119841); return c; }); }
  function toMonospace(s) { return s.replace(/[A-Za-z0-9]/g, c => { let code = c.charCodeAt(0); if (code>=65 && code<=90) return String.fromCodePoint(code+120367); if (code>=97 && code<=122) return String.fromCodePoint(code+120361); if (code>=48 && code<=57) return String.fromCodePoint(code+120734); return c; }); }
  function toScript(s) { const map = {'B':'ℬ','E':'ℰ','F':'ℱ','H':'ℋ','I':'ℐ','L':'ℒ','M':'ℳ','R':'ℛ','e':'ℯ','g':'ℊ','o':'ℴ'}; return s.replace(/[A-Za-z]/g, c => map[c] || (c.charCodeAt(0)>=65 && c.charCodeAt(0)<=90 ? String.fromCodePoint(c.charCodeAt(0)+119899) : String.fromCodePoint(c.charCodeAt(0)+119893))); }
  function toFraktur(s) { const map = {'C':'ℭ','H':'ℌ','I':'ℑ','R':'ℜ','Z':'ℨ'}; return s.replace(/[A-Za-z]/g, c => map[c] || (c.charCodeAt(0)>=65 && c.charCodeAt(0)<=90 ? String.fromCodePoint(c.charCodeAt(0)+120003) : String.fromCodePoint(c.charCodeAt(0)+119997))); }
  function toDoubleStruck(s) { const map = {'C':'ℂ','H':'ℍ','N':'ℕ','P':'ℙ','Q':'ℚ','R':'ℝ','Z':'ℤ'}; return s.replace(/[A-Za-z0-9]/g, c => map[c] || (c.charCodeAt(0)>=65 && c.charCodeAt(0)<=90 ? String.fromCodePoint(c.charCodeAt(0)+120055) : (c.charCodeAt(0)>=48 && c.charCodeAt(0)<=57 ? String.fromCodePoint(c.charCodeAt(0)+120744) : String.fromCodePoint(c.charCodeAt(0)+120049)))); }
  function toSansBold(s) { return s.replace(/[A-Za-z0-9]/g, c => { let code = c.charCodeAt(0); if (code>=65 && code<=90) return String.fromCodePoint(code+120211); if (code>=97 && code<=122) return String.fromCodePoint(code+120205); if (code>=48 && code<=57) return String.fromCodePoint(code+120764); return c; }); }
  function toCircled(s) { return s.replace(/[A-Za-z0-9]/g, c => { let code = c.charCodeAt(0); if (code>=65 && code<=90) return String.fromCodePoint(code+9333); if (code>=97 && code<=122) return String.fromCodePoint(code+9327); if (code>=49 && code<=57) return String.fromCodePoint(code+9263); if (c==='0') return '⓪'; return c; }); }
  function toSquared(s) { return s.replace(/[A-Za-z]/g, c => { let code = c.charCodeAt(0); return String.fromCodePoint(code + (code>=65 && code<=90 ? 127215 : 127215)); }); }
  function toFullwidth(s) { return s.replace(/[!-~]/g, c => String.fromCodePoint(c.charCodeAt(0)+65248)); }

  function copyToClipboard(text, btn) {
    if (!text) return;
    
    const fallbackCopy = (t) => {
      const textArea = document.createElement("textarea");
      textArea.value = t;
      // Asegurar que no sea visible pero esté en el DOM
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        confirmCopy(btn);
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
      document.body.removeChild(textArea);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text)
        .then(() => confirmCopy(btn))
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function confirmCopy(btn) {
    const originalText = btn.textContent;
    btn.textContent = '✅';
    setTimeout(() => btn.textContent = originalText, 1000);
  }

  // --- BOTONES EXTRAS ---
  el.copyFB.onclick = () => copyToClipboard(el.outFB.textContent, el.copyFB);
  el.copyX.onclick = () => copyToClipboard(el.outX.textContent, el.copyX);
  el.copyLI.onclick = () => copyToClipboard(el.outLI.textContent, el.copyLI);
  el.vault.onclick = async () => {
      const content = easyMDE.value();
      const filename = `post_${new Date().toISOString().split('T')[0]}.md`;
      
      const originalText = el.vault.innerText;
      el.vault.innerText = '⌛ Guardando...';
      el.vault.disabled = true;

      try {
          const response = await fetch('save-to-vault', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ content, filename })
          });
          if (response.ok) {
              el.vault.innerText = '✅ Guardado!';
              setTimeout(() => { 
                  el.vault.innerText = originalText;
                  el.vault.disabled = false;
              }, 2000);
          } else { throw new Error('Error al guardar'); }
      } catch (err) {
          console.error(err);
          el.vault.innerText = '❌ Error';
          setTimeout(() => { 
              el.vault.innerText = originalText;
              el.vault.disabled = false;
          }, 2000);
      }
  };
  
  // --- OPERACIONES DE ARCHIVO ---
  el.cargarArchivoBtn.onclick = () => el.archivoInput.click();
  el.archivoInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { 
      easyMDE.value(ev.target.result); 
      easyMDE.codemirror.focus(); 
      actualizarVistas();
    };
    reader.readAsText(file, 'UTF-8');
    el.archivoInput.value = '';
  };
  
  el.guardarArchivoBtn.onclick = () => {
    const content = easyMDE.value();
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simply_post_${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  async function exportContent(format) {
    const content = easyMDE.value();
    if (!content.trim()) return alert('No hay contenido para exportar.');

    try {
      const response = await fetch('export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, format })
      });

      if (!response.ok) throw new Error('Error en la exportación');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `simply_export_${new Date().toISOString().split('T')[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Error al exportar: ' + err.message);
    }
  }

  el.exportWord.onclick = (e) => { e.preventDefault(); exportContent('docx'); };
  el.exportExcel.onclick = (e) => { e.preventDefault(); exportContent('xlsx'); };
  el.exportHtml.onclick = (e) => { e.preventDefault(); exportContent('html'); };

  // --- HERRAMIENTAS DE LIMPIEZA ---
  el.limpiarGatosBtn.onclick = () => {
    const text = easyMDE.value();
    const cleaned = text.split('\n').map(line => {
      // 1. Quitar los # al inicio
      let l = line.replace(/^#+\s?/, '');
      // 2. Quitar los pipes | (tablas)
      l = l.replace(/\|/g, ' ');
      // 3. Quitar líneas de separadores de tabla |---|
      if (/^[-\s|:]+$/.test(l.trim())) return '';
      // 4. Limpiar espacios extra
      return l.replace(/\s+/g, ' ').trim();
    }).filter(line => line !== '').join('\n\n'); // Unimos con doble salto para legibilidad

    easyMDE.value(cleaned);
    actualizarVistas();
  };

  el.borrarComentariosBtn.onclick = () => {
    const text = easyMDE.value();
    const filtered = text.split('\n').filter(line => !line.trim().startsWith('#')).join('\n');
    easyMDE.value(filtered);
    actualizarVistas();
  };

  // --- EMOJI PICKER ---
  const emojiPickerContainer = document.createElement('div');
  emojiPickerContainer.id = 'emoji-picker-container';
  emojiPickerContainer.style.cssText = 'position: absolute; z-index: 3000; display: none; background: #1E1E1E; border: 1px solid #3c3c3c; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);';
  document.body.appendChild(emojiPickerContainer);

  let emojiPicker = null, pickerVisible = false;
  function toggleEmojiPicker() {
    if (pickerVisible) { hideEmojiPicker(); return; }
    const rect = el.emojiBtn.getBoundingClientRect();
    emojiPickerContainer.style.left = (rect.left - 150) + 'px';
    emojiPickerContainer.style.top = (rect.bottom + 10) + 'px';
    emojiPickerContainer.style.display = 'block';
    pickerVisible = true;
    if (!emojiPicker) {
      emojiPicker = document.createElement('emoji-picker');
      emojiPicker.addEventListener('emoji-click', ev => {
        const cm = easyMDE.codemirror;
        cm.getDoc().replaceRange(ev.detail.unicode, cm.getDoc().getCursor());
        cm.focus(); hideEmojiPicker();
        actualizarVistas();
      });
      emojiPickerContainer.appendChild(emojiPicker);
    }
    setTimeout(() => document.addEventListener('click', closeEmojiPickerOnClickOutside), 100);
  }
  function hideEmojiPicker() { emojiPickerContainer.style.display = 'none'; pickerVisible = false; document.removeEventListener('click', closeEmojiPickerOnClickOutside); }
  function closeEmojiPickerOnClickOutside(ev) {
    if (!emojiPickerContainer.contains(ev.target) && ev.target.id !== 'emojiBtn') hideEmojiPicker();
  }
  el.emojiBtn.onclick = toggleEmojiPicker;

  document.getElementById('limpiarBtn').onclick = () => { 
    if (confirm('¿Estás seguro de que quieres limpiar todo el contenido?')) {
      easyMDE.value(''); 
      el.outX.textContent = '';
      el.outLI.textContent = '';
      if (el.xCounter) el.xCounter.textContent = '280';
      actualizarVistas();
      localStorage.removeItem('simply-editor-content'); 
      localStorage.removeItem('simply-x-content');
      localStorage.removeItem('simply-li-content');
    }
  };

  // --- CARGAR CONTENIDO PERSISTENTE ---
  function cargarContenidoPersistente() {
    const savedX = localStorage.getItem('simply-x-content');
    const savedLI = localStorage.getItem('simply-li-content');
    
    if (savedX) {
      el.outX.textContent = savedX;
      if (el.xCounter) el.xCounter.textContent = 280 - savedX.length;
    }
    if (savedLI) {
      el.outLI.textContent = savedLI;
    }
  }
  cargarContenidoPersistente();

  document.getElementById('pegarBtn').onclick = async () => { 
    try {
      const text = await navigator.clipboard.readText();
      easyMDE.value(text); 
      actualizarVistas();
    } catch (e) { alert('No se pudo acceder al portapapeles'); }
  };
  document.getElementById('themeToggle').onclick = () => { 
    document.body.classList.toggle('theme-sketch'); 
    localStorage.setItem('simply-theme', document.body.classList.contains('theme-sketch') ? 'sketch' : 'dark'); 
  };
  if (localStorage.getItem('simply-theme') === 'sketch') document.body.classList.add('theme-sketch');

  loadPrompts();
  actualizarVistas();
})();
