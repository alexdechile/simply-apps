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
    limpiarBtn: document.getElementById('limpiarBtn'),
    limpiarGatosBtn: document.getElementById('limpiarGatosBtn'),
    borrarComentariosBtn: document.getElementById('borrarComentariosBtn'),
    emojiBtn: document.getElementById('emojiBtn'),
    investigar: document.getElementById('investigarBtn'),
    pulir: document.getElementById('pulirBtn'),
    decorar: document.getElementById('decorarBtn'),
    sugerir: document.getElementById('sugerirBtn'),
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
    fb_col: `Eres un escritor latinoamericano que publica reflexiones personales en Facebook. Tu voz es auténtica, cercana y natural.

TONO Y VOZ:
- Conversacional y directo, como si hablaras con amigos de confianza
- Honesto y con opinión propia, no temes mostrar vulnerabilidad
- Informal pero nunca vulgar ni agresivo

ESTRUCTURA DEL POST:
- Gancho inicial: una frase que atrape (pregunta, confesión, observación cotidiana)
- Desarrollo narrativo fluido, como contando una historia sin rodeos
- Cierre cálido y humano (reflexión personal, saludo, invitación a conversar)

FORMATO FACEBOOK:
- Párrafos de 1-3 líneas máximo para legibilidad en mobile
- Oraciones cortas o medias, naturales, nunca rebuscadas
- Sin listas, títulos, markdown ni estructura de blog
- Saltos de línea generosos entre párrafos
- Máximo 1 emoji, solo si es natural

REGLAS DE PRESERVACIÓN:
- Mantén el mensaje principal y los puntos clave del texto original
- NO agregues información, datos, anécdotas o experiencias que no estén en el original
- NO uses jerga, tecnicismos, frases de marketing o vocabulario forzado
- NO empieces con frases cliché ("En el mundo actual...", "Es importante destacar...")
- NO uses puntuación exagerada (!!!, ???, ....)

Tu tarea: reescribe el borrador aplicando estas reglas. Devuelve solo el post final.`,
    fb_com: `Eres un estratega de contenido y copywriter que publica en Facebook. Tu objetivo es vender sin parecer un vendedor, usando storytelling auténtico.

TONO Y VOZ:
- Profesional pero accesible, nunca corporativo ni frío
- Persuasivo sin ser manipulador
- Muestra autoridad sin arrogancia

ESTRUCTURA DEL POST:
- El Gancho: un problema real, un beneficio concreto o una historia que conecta emocionalmente
- Valor Real: explica el "por qué" con profundidad, sin quedarte en la superficie
- Urgencia Elegante: crea deseo sin desesperación, muestra el costo de no actuar
- Cierre con propósito: invitación sutil, nunca un llamado agresivo

FORMATO FACEBOOK:
- Párrafos cortos de 1-3 líneas
- Evita jerga técnica a menos que sea necesaria para el público
- Sin markdown, sin formato especial, sin listas numeradas
- Mantén el flujo narrativo del texto original

REGLAS DE PRESERVACIÓN:
- Preserva el mensaje principal y los argumentos clave del original
- NO agregues afirmaciones, datos o testimonios inventados
- NO uses urgencia falsa ("por tiempo limitado", "últimos días", "oportunidad única")
- NO caigas en clichés de ventas ("haz clic ahora", "no te lo pierdas")

Tu tarea: reescribe el borrador con esta personalidad comercial. Devuelve solo el post final.`,
    fb_neu: `Eres un comunicador analítico que publica en Facebook. Tu misión es la claridad absoluta y el rigor informativo, sin perder cercanía con tu audiencia.

TONO Y VOZ:
- Objetivo y equilibrado: hechos antes que opiniones
- Claro y accesible: ideas complejas explicadas de forma simple
- Respetuoso de todas las perspectivas, presentando pros y contras

ESTRUCTURA DEL POST:
- Contexto inicial: establece el tema y por qué importa
- Desarrollo ordenado: desglosa ideas complejas en partes digeribles
- Perspectiva balanceada: presenta ángulos distintos del mismo tema
- Cierre reflexivo: conclusión abierta o pregunta para pensar

FORMATO FACEBOOK:
- Párrafos de 2-4 líneas para mantener legibilidad en temas densos
- Separa ideas distintas en párrafos claros y bien diferenciados
- Vocabulario preciso pero accesible para el público general
- Sin markdown, sin formato especial

REGLAS DE PRESERVACIÓN:
- Mantén los hechos y datos del texto original sin distorsión
- NO inventes estadísticas, citas o referencias
- NO tomes partido ni impongas una narrativa única
- NO simplifiques en exceso ideas que requieren matices

Tu tarea: reescribe el borrador con esta objetividad analítica. Devuelve solo el post final.`,
    x: "Eres donalex:1717. Basándote en el post de Facebook proporcionado, genera un tweet punzante y sintetizado (máx 280 caracteres). Sin Markdown.",
    li: "Eres donalex:1717. Basándote en el post de Facebook proporcionado, genera una versión profesional, técnica y disruptiva para LinkedIn (Thought Leadership)."
  };

  // Cargar prompts guardados
  function loadPrompts() {
    // --- MIGRACIÓN DE PROMPTS ANTIGUOS ---
    const oldFB = localStorage.getItem('p_fb');
    if (oldFB && !localStorage.getItem('p_fb_col')) {
      localStorage.setItem('p_fb_col', oldFB);
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

  // Corrección: Event delegation para tonos (evita interferencia con Bootstrap)
  const toneDropdown = document.getElementById('toneDropdown');
  if (toneDropdown) {
    const toneMenu = toneDropdown.nextElementSibling;
    if (toneMenu) {
      toneMenu.addEventListener('click', (e) => {
        const opt = e.target.closest('.tone-option');
        if (!opt) return;
        e.preventDefault();
        const val = opt.dataset.value;
        state.currentTone = val;
        localStorage.setItem('simply-tone', val);
        actualizarLabelTono(val);
      });
    }
  }

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
  let analyzeTimeout = null;

  async function analizarConRust(text) {
    if (!text.trim() || text.length < 5) {
      const rustPanel = document.getElementById('rust-stats');
      if (rustPanel) rustPanel.classList.add('d-none');
      return;
    }

    try {
      const response = await fetch('ai-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text })
      });

      if (!response.ok) return;

      const data = await response.json();
      
      const elRT = document.getElementById('reading-time');
      const elLD = document.getElementById('lexical-density');
      const elSC = document.getElementById('sentence-count');
      const elTW = document.getElementById('top-words');
      const rustPanel = document.getElementById('rust-stats');

      if (elRT) elRT.textContent = data.reading_time_mins;
      if (elLD) elLD.textContent = data.lexical_density;
      if (elSC) elSC.textContent = data.sentence_count;
      if (elTW) {
        elTW.textContent = data.top_words.map(w => w[0]).join(', ');
      }
      
      if (rustPanel) rustPanel.classList.remove('d-none');
    } catch (err) {
      console.error("Error en análisis Rust:", err);
    }
  }

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

      // Debounce para el análisis pesado en Rust
      clearTimeout(analyzeTimeout);
      analyzeTimeout = setTimeout(() => analizarConRust(md), 500);

      localStorage.setItem('simply-editor-content', md);
    } catch (err) {
      console.error("Error en actualizarVistas:", err);
    }
  }

  easyMDE.codemirror.on('change', actualizarVistas);

  // --- SINCRONIZACIÓN Y UI ---
  let isSyncingEditor = false;
  let isSyncingOutput = false;

  function getActiveOutput() {
    if (state.activeChannel === 'fb') return el.outFB;
    if (state.activeChannel === 'x') return el.outX;
    if (state.activeChannel === 'li') return el.outLI;
    return null;
  }

  function syncScroll(source, target) {
    if (!source || !target) return;
    const sourceHeight = source.scrollHeight - source.clientHeight;
    if (sourceHeight <= 0) return;
    const scrollPercent = source.scrollTop / sourceHeight;
    target.scrollTop = scrollPercent * (target.scrollHeight - target.clientHeight);
  }

  // Evento unificado para cursor y barra flotante
  easyMDE.codemirror.on('cursorActivity', (cm) => {
    const menu = el.formatMenu;
    if (!menu) return;

    // 1. Barra Flotante
    if (cm.somethingSelected()) {
      const cursor = cm.cursorCoords(false, 'window');
      menu.classList.add('visible');
      
      const menuWidth = menu.offsetWidth || 340;
      const menuHeight = menu.offsetHeight || 45;
      
      let left = cursor.left + (cursor.right - cursor.left) / 2 - menuWidth / 2;
      let top = cursor.top - menuHeight - 15;
      
      // Ajuste para posición fixed (coordenadas de ventana)
      if (left < 10) left = 10;
      if (left + menuWidth > window.innerWidth - 10) left = window.innerWidth - menuWidth - 10;
      if (top < 10) top = cursor.bottom + 15;
      
      menu.style.left = left + 'px';
      menu.style.top = top + 'px';
      menu.style.transform = 'none'; // Eliminar transform para evitar desvíos en fixed
    } else {
      menu.classList.remove('visible');
    }

    // 2. Sincronización de scroll al mover el cursor (hacia abajo)
    const activeOutput = getActiveOutput();
    if (activeOutput) {
      const cursor = cm.getCursor();
      const coords = cm.charCoords(cursor, 'local');
      const scrollInfo = cm.getScrollInfo();
      const scrollPercent = coords.top / (scrollInfo.height - scrollInfo.clientHeight);
      
      if (!isNaN(scrollPercent)) {
        activeOutput.scrollTop = scrollPercent * (activeOutput.scrollHeight - activeOutput.clientHeight);
      }
    }
  });

  easyMDE.codemirror.on('scroll', (cm) => {
    if (isSyncingEditor) {
      isSyncingEditor = false;
      return;
    }
    isSyncingOutput = true;
    syncScroll(cm.getScrollerElement(), getActiveOutput());
  });

  // Permitir scroll desde el output hacia el editor
  [el.outFB, el.outX, el.outLI].forEach(output => {
    if (!output) return;
    output.addEventListener('scroll', () => {
      if (isSyncingOutput) {
        isSyncingOutput = false;
        return;
      }
      isSyncingEditor = true;
      const cm = easyMDE.codemirror;
      const scroller = cm.getScrollerElement();
      const outputHeight = output.scrollHeight - output.clientHeight;
      if (outputHeight > 0) {
        const scrollPercent = output.scrollTop / outputHeight;
        scroller.scrollTop = scrollPercent * (scroller.scrollHeight - scroller.clientHeight);
      }
    });
  });

  // --- SELECCION DE MODELO IA ---
  function getSelectedModel() {
    return localStorage.getItem('simply-ai-model') || 'nvidia:meta/llama-3.3-70b-instruct';
  }

  async function initModelSelector() {
    const menu = document.getElementById('aiModelMenu');
    const label = document.getElementById('currentModelLabel');
    if (!menu || !label) return;

    // Cargar modelo guardado
    const savedModel = getSelectedModel();
    const savedClient = savedModel.split(':')[0];
    label.textContent = savedClient.charAt(0).toUpperCase() + savedClient.slice(1);

    try {
      const res = await fetch('ai-models');
      if (!res.ok) throw new Error('Error al cargar modelos');
      const { models } = await res.json();

      // Agrupar por cliente
      const groups = {};
      for (const m of models) {
        if (!groups[m.client]) groups[m.client] = [];
        groups[m.client].push(m);
      }

      // Construir dropdown
      menu.innerHTML = '<li><h6 class="dropdown-header">Modelo de IA</h6></li>';
      for (const [client, clientModels] of Object.entries(groups)) {
        const header = document.createElement('li');
        header.innerHTML = `<h6 class="dropdown-header text-capitalize">${client}</h6>`;
        menu.appendChild(header);

        for (const m of clientModels) {
          const item = document.createElement('li');
          const a = document.createElement('a');
          a.className = 'dropdown-item' + (m.fullId === savedModel ? ' active' : '');
          a.href = '#';
          a.dataset.model = m.fullId;
          a.textContent = m.name;
          a.onclick = (e) => {
            e.preventDefault();
            localStorage.setItem('simply-ai-model', m.fullId);
            label.textContent = client.charAt(0).toUpperCase() + client.slice(1);
            // Actualizar active
            menu.querySelectorAll('.dropdown-item.active').forEach(el => el.classList.remove('active'));
            a.classList.add('active');
          };
          item.appendChild(a);
          menu.appendChild(item);
        }
      }
    } catch (e) {
      console.error('Error loading models:', e);
      menu.innerHTML = '<li><h6 class="dropdown-header">Modelo de IA</h6></li><li><span class="dropdown-item-text text-danger">Error al cargar modelos</span></li>';
    }
  }
  initModelSelector();

  // --- PULIR TEXTO CON aichat ---
  if (el.pulir) {
    el.pulir.onclick = async () => {
      const content = easyMDE.value();
      if (!content.trim()) return;

      const originalText = el.pulir.textContent;
      el.pulir.textContent = '✨ Puliendo...';
      el.pulir.disabled = true;

      try {
        const response = await fetch('ai-polish', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, model: getSelectedModel() })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || 'Error al pulir el texto');
        }

        const data = await response.json();

        if (data.content && data.content !== content) {
          if (confirm(`✨ El texto ha sido pulido y corregido.\n\n¿Quieres inyectar el resultado en el editor?`)) {
            const cm = easyMDE.codemirror;
            cm.getDoc().setValue(data.content);
            cm.refresh();
            cm.scrollTo(0, 0);
            actualizarVistas();
          }
        } else {
          alert('✨ El texto ya está impecable (o no se sugirieron cambios).');
        }
      } catch (e) {
        console.error(e);
        alert('Error al pulir: ' + e.message);
      } finally {
        el.pulir.textContent = originalText;
        el.pulir.disabled = false;
      }
    };
  }

  // --- DECORAR TEXTO CON aichat ---
  if (el.decorar) {
    el.decorar.onclick = async () => {
      const content = easyMDE.value();
      if (!content.trim()) return;

      const originalText = el.decorar.textContent;
      el.decorar.textContent = '🧂 Decorando...';
      el.decorar.disabled = true;

      try {
        const response = await fetch('ai-decorate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, model: getSelectedModel() })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || 'Error al decorar el texto');
        }

        const data = await response.json();

        if (data.content && data.content !== content) {
          if (confirm(`🧂 El texto ha sido decorado con sal y pimienta.\n\n¿Quieres inyectar el resultado en el editor?`)) {
            const cm = easyMDE.codemirror;
            cm.getDoc().setValue(data.content);
            cm.refresh();
            cm.scrollTo(0, 0);
            actualizarVistas();
          }
        } else {
          alert('🧂 No se sugirieron decoraciones adicionales.');
        }
      } catch (e) {
        console.error(e);
        alert('Error al decorar: ' + e.message);
      } finally {
        el.decorar.textContent = originalText;
        el.decorar.disabled = false;
      }
    };
  }

  // --- SUGERIR IDEAS CON aichat ---
  if (el.sugerir) {
    el.sugerir.onclick = async () => {
      const content = easyMDE.value();
      if (!content.trim()) return;

      const originalText = el.sugerir.textContent;
      el.sugerir.textContent = '💡 Sugiriendo...';
      el.sugerir.disabled = true;

      try {
        const response = await fetch('ai-suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content, model: getSelectedModel() })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || 'Error al obtener sugerencias');
        }

        const data = await response.json();

        if (data.content) {
          if (confirm(`💡 Sugerencias de la IA:\n\n${data.content}\n\n¿Quieres añadir estas ideas al final del editor?`)) {
            const cm = easyMDE.codemirror;
            const currentVal = cm.getValue();
            const newVal = currentVal + '\n\n---\n\n💡 **Sugerencias:**\n' + data.content;
            cm.getDoc().setValue(newVal);
            cm.refresh();
            // Scroll al final para ver las sugerencias
            cm.scrollTo(0, cm.getScrollInfo().height);
            actualizarVistas();
          }
        } else {
          alert('💡 La IA no tiene sugerencias adicionales por ahora.');
        }
      } catch (e) {
        console.error(e);
        alert('Error al sugerir: ' + e.message);
      } finally {
        el.sugerir.textContent = originalText;
        el.sugerir.disabled = false;
      }
    };
  }

  // --- IA donalex:1717 ---
  async function callAI(systemPrompt, userContent) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    try {
      const response = await fetch('ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemPrompt,
          userContent
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
      
      const userInstruction = `Reescribe el siguiente borrador para Facebook aplicando tu personalidad y reglas de estilo. Preserva el mensaje principal, los argumentos clave y la intención del original. No agregues información nueva.

BORRADOR:
${text}`;

      let fbPost = await callAI(systemPrompt, userInstruction);
      fbPost = fbPost.replace(/^```markdown\n?/g, '').replace(/```$/g, '').trim();
      
      if (confirm(`🧠 La IA ha procesado el texto con éxito.\n\n¿Quieres inyectar el resultado en el editor?`)) {
        const cm = easyMDE.codemirror;
        const scrollInfo = cm.getScrollInfo();
        cm.getDoc().setValue(fbPost);
        cm.refresh();
        cm.scrollTo(scrollInfo.left, 0);
        el.outFB.textContent = markdownToFacebookUnicode(fbPost);
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


  // --- POST MUSICAL COMPLETO CON IA ---
  el.cancionBtn = document.getElementById('cancionBtn');
  if (el.cancionBtn) {
    el.cancionBtn.onclick = async () => {
      const query = prompt('¿Qué canción? (ej: "Queen - Bohemian Rhapsody" o "artista - tema")');
      if (!query) return;

      const originalText = el.cancionBtn.textContent;
      el.cancionBtn.textContent = '🎵 Recopilando datos...';
      el.cancionBtn.disabled = true;

      try {
        const response = await fetch('cancion/completo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || 'Error al generar post musical');
        }

        const data = await response.json();

        if (confirm(`🎵 Post generado por IA.\n\n¿Inyectar en el editor?`)) {
          const cm = easyMDE.codemirror;
          cm.getDoc().setValue(data.content);
          cm.refresh();
          cm.scrollTo(0, 0);
          actualizarVistas();
        }
      } catch (e) {
        console.error(e);
        alert('Error: ' + e.message);
      } finally {
        el.cancionBtn.textContent = originalText;
        el.cancionBtn.disabled = false;
      }
    };
  }

  // --- POST TECNOLÓGICO CON IA ---
  el.techBtn = document.getElementById('techBtn');
  if (el.techBtn) {
    el.techBtn.onclick = async () => {
      const query = prompt('¿Sobre qué tecnología o app quieres escribir? (ej: "Docker", "IA en la medicina", "Raycast")');
      if (!query) return;

      const originalText = el.techBtn.textContent;
      el.techBtn.textContent = '💻 Analizando tech...';
      el.techBtn.disabled = true;

      try {
        const response = await fetch('tech/completo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || 'Error al generar crónica tech');
        }

        const data = await response.json();

        if (confirm(`💻 Crónica tecnológica generada.\n\n¿Inyectar en el editor?`)) {
          const cm = easyMDE.codemirror;
          cm.getDoc().setValue(data.content);
          cm.refresh();
          cm.scrollTo(0, 0);
          actualizarVistas();
        }
      } catch (e) {
        console.error(e);
        alert('Error: ' + e.message);
      } finally {
        el.techBtn.textContent = originalText;
        el.techBtn.disabled = false;
      }
    };
  }

  // --- POST DE NOTICIAS CON IA ---
  el.newsBtn = document.getElementById('newsBtn');
  if (el.newsBtn) {
    el.newsBtn.onclick = async () => {
      const query = prompt('¿Qué noticia o tema de actualidad quieres analizar profundamente?');
      if (!query) return;

      const originalText = el.newsBtn.textContent;
      el.newsBtn.textContent = '📰 Analizando trasfondo...';
      el.newsBtn.disabled = true;

      try {
        const response = await fetch('news/completo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(errText || 'Error al generar análisis de noticias');
        }

        const data = await response.json();

        if (confirm(`📰 Análisis de noticias generado.\n\n¿Inyectar en el editor?`)) {
          const cm = easyMDE.codemirror;
          cm.getDoc().setValue(data.content);
          cm.refresh();
          cm.scrollTo(0, 0);
          actualizarVistas();
        }
      } catch (e) {
        console.error(e);
        alert('Error: ' + e.message);
      } finally {
        el.newsBtn.textContent = originalText;
        el.newsBtn.disabled = false;
      }
    };
  }

  // Elementos del Modal
  const researchModalEl = document.getElementById('researchModal');
  const researchModal = new bootstrap.Modal(researchModalEl);
  const researchConfig = document.getElementById('researchConfig');
  const researchConfigFooter = document.getElementById('researchConfigFooter');
  const researchResults = document.getElementById('researchResults');
  const researchResultsFooter = document.getElementById('researchResultsFooter');
  const researchSynthesis = document.getElementById('researchSynthesis');
  const researchStatus = document.getElementById('researchStatus');
  const researchStatusText = document.getElementById('researchStatusText');
  const searchQueryInput = document.getElementById('searchQueryInput');
  const trendsInput = document.getElementById('trendsInput');
  const startResearchBtn = document.getElementById('startResearchBtn');
  const researchInjectBtn = document.getElementById('researchInjectBtn');
  const researchCopyBtn = document.getElementById('researchCopyBtn');
  const researchDiscardBtn = document.getElementById('researchDiscardBtn');
  const researchCloseBtn = document.getElementById('researchCloseBtn');
  let pendingSynthesis = localStorage.getItem('simply-pending-research') || '';
  let slideTimeout = null;

  function showModalSlide() {
    clearTimeout(slideTimeout);
    researchModalEl.classList.remove('closing');
    researchModal.show();
  }

  function hideModalSlide() {
    researchModalEl.classList.add('closing');
    clearTimeout(slideTimeout);
    slideTimeout = setTimeout(() => {
      researchModalEl.classList.remove('closing');
      researchModal.hide();
    }, 300);
  }

  function showResearchConfig() {
    researchConfig.classList.remove('d-none');
    researchConfigFooter.classList.remove('d-none');
    researchResults.classList.add('d-none');
    researchResultsFooter.classList.add('d-none');
    researchStatus.classList.add('d-none');
  }

  function showResearchResults() {
    researchConfig.classList.add('d-none');
    researchConfigFooter.classList.add('d-none');
    researchResults.classList.remove('d-none');
    researchResultsFooter.classList.remove('d-none');
    researchStatus.classList.add('d-none');
  }

  function showResearchLoading(text) {
    researchStatusText.textContent = text;
    researchStatus.classList.remove('d-none');
  }

  function resetResearchModal() {
    pendingSynthesis = '';
    researchSynthesis.textContent = '';
    localStorage.removeItem('simply-pending-research');
    showResearchConfig();
  }

  researchModalEl.addEventListener('hidden.bs.modal', () => {
    localStorage.removeItem('simply-pending-research');
    resetResearchModal();
  });

  researchDiscardBtn.onclick = () => {
    hideModalSlide();
  };

  researchCloseBtn.onclick = () => {
    hideModalSlide();
  };

  researchInjectBtn.onclick = () => {
    if (!pendingSynthesis) return;

    const cm = easyMDE.codemirror;
    cm.getDoc().setValue(pendingSynthesis);
    cm.refresh();
    cm.scrollTo(0, 0);
    actualizarVistas();
    hideModalSlide();

    setTimeout(() => {
      cm.focus();
      alert('¡Investigación inyectada (contenido anterior reemplazado)!');
    }, 500);
  };

  researchCopyBtn.onclick = () => copyToClipboard(pendingSynthesis, researchCopyBtn);

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
    showResearchConfig();

    try {
      // PASO 1: Planificación (Pedimos Query + Dominios)
      const planPrompt = `Eres un estratega de investigación. Analiza el tema: "${rawTopic}". 
Responde con un objeto JSON (solo el JSON) con este formato:
{
  "query": "texto de búsqueda simple para google",
  "tendencias": "3 dominios relevantes separados por comas (ej: Neurociencia, Nutrición, Psicología)"
}`;
      
      const planRaw = await callAI("Estratega de Investigación", planPrompt);
      let plan;
      try {
        plan = JSON.parse(planRaw.replace(/```json|```/g, ''));
      } catch (e) {
        plan = { query: rawTopic, tendencias: "General, Ciencia, Tendencias" };
      }

      // PASO 2: Mostrar Modal con configuración
      searchQueryInput.value = plan.query;
      trendsInput.value = plan.tendencias;
      showModalSlide();

      // Manejador del botón del modal
      startResearchBtn.onclick = async () => {
        const finalQuery = searchQueryInput.value;
        const finalTrends = trendsInput.value;
        const depth = document.querySelector('input[name="researchDepth"]:checked').value;
        if (!finalQuery) return;

        startResearchBtn.disabled = true;
        showResearchLoading('Investigando con Scrapling... por favor espera.');

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

          // PASO 4: Síntesis adaptativa
          showResearchLoading('Sintetizando reporte final con IA...');
          
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

          const finalReport = await callAI("Analista Estratégico", synthesizePrompt);

          if (!finalReport || finalReport.length < 10) {
            throw new Error('La IA devolvió un reporte demasiado corto o vacío.');
          }

          // Limpiar bloques de código markdown
          pendingSynthesis = finalReport.replace(/^```markdown\n?/g, '').replace(/```$/g, '').trim();
          localStorage.setItem('simply-pending-research', pendingSynthesis);

          // Mostrar resultados en el modal
          researchSynthesis.textContent = pendingSynthesis;
          showResearchResults();

        } catch (e) {
          alert('Error: ' + e.message);
          showResearchConfig();
        } finally {
          startResearchBtn.disabled = false;
        }
      };

    } catch (err) {
      alert('Error en planificación: ' + err.message);
    } finally {
      el.investigar.textContent = originalText;
      el.investigar.disabled = false;
    }
  };

  async function generarDerivado(tipo) {
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
      const derivado = await callAI(prompt, fbContent);

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

  // --- BOTONES DE COPIA ROBUSTOS ---
  function setupCopyButton(btnId, targetEl) {
    const btn = document.getElementById(btnId);
    if (!btn || !targetEl) return;
    
    btn.onclick = () => {
      const text = targetEl.textContent;
      copyToClipboard(text, btn);
    };
  }

  setupCopyButton('copyBtn', el.outFB);
  setupCopyButton('copyXBtn', el.outX);
  setupCopyButton('copyLIBtn', el.outLI);

  // --- HERRAMIENTAS DE TEXTO ---
  if (el.limpiarBtn) {
    el.limpiarBtn.onclick = () => {
      if (confirm('¿Quieres limpiar todo el editor?')) {
        easyMDE.value('');
        actualizarVistas();
      }
    };
  }

  // Barra de formato aparece al seleccionar texto en el editor
  if (el.formatMenu && easyMDE) {
    const cm = easyMDE.codemirror;
    cm.on('cursorActivity', () => {
      const selection = cm.getSelection();
      if (selection) {
        const coords = cm.cursorCoords(true, 'page');
        const menu = el.formatMenu;
        menu.style.left = Math.max(10, coords.left - 20) + 'px';
        menu.style.top = (coords.bottom + 8) + 'px';
        menu.classList.add('visible');
      } else {
        el.formatMenu.classList.remove('visible');
      }
    });

    document.addEventListener('click', (e) => {
      if (!el.formatMenu.contains(e.target)) {
        el.formatMenu.classList.remove('visible');
      }
    });
  }

  // Click fuera del menú lo cierra

  document.querySelectorAll('.menu-btn').forEach(btn => {
    btn.onclick = () => {
      const style = btn.getAttribute('data-style');
      const cm = easyMDE.codemirror;
      const selection = cm.getSelection();
      if (!selection) return;

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
        case 'upper': wrapped = selection.toUpperCase(); break;
        default: wrapped = selection;
      }
      
      cm.replaceSelection(wrapped);
      el.formatMenu.classList.remove('visible');
      actualizarVistas();
    };
  });

  document.getElementById('limpiarGatosBtn').onclick = () => {
    const cm = easyMDE.codemirror;
    const text = cm.getValue();
    const cleaned = text.replace(/#/g, '').trim();
    cm.getDoc().setValue(cleaned);
    cm.refresh();
    actualizarVistas();
  };

  document.getElementById('borrarComentariosBtn').onclick = () => {
    const cm = easyMDE.codemirror;
    const text = cm.getValue();
    const filtered = text.split('\n').filter(line => !line.trim().startsWith('>')).join('\n').trim();
    cm.getDoc().setValue(filtered);
    cm.refresh();
    actualizarVistas();
  };

  // --- EMOJIS ---
  const picker = document.querySelector('emoji-picker');
  if (el.emojiBtn && picker) {
    el.emojiBtn.onclick = () => {
      const rect = el.emojiBtn.getBoundingClientRect();
      const isVisible = picker.style.display === 'block';
      picker.style.display = isVisible ? 'none' : 'block';
      if (!isVisible) {
        picker.style.top = (rect.bottom + 5) + 'px';
        picker.style.left = (rect.left - 100) + 'px';
      }
    };
    // Cerrar picker al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!picker.contains(e.target) && e.target !== el.emojiBtn) {
        picker.style.display = 'none';
      }
    });
    picker.addEventListener('emoji-click', (event) => {
      const cm = easyMDE.codemirror;
      cm.replaceSelection(event.detail.unicode);
      picker.style.display = 'none';
      cm.focus();
    });
  }

  // --- EXPORTACIÓN ---
  async function exportContent(format) {
    const content = easyMDE.value();
    if (!content) return;
    try {
      const response = await fetch('export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, format })
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `simply_export.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (e) { alert('Error al exportar'); }
  }
  el.exportWord.onclick = () => exportContent('docx');
  el.exportExcel.onclick = () => exportContent('xlsx');
  el.exportHtml.onclick = () => exportContent('html');

  // --- VAULT ---
  el.vault.onclick = async () => {
    const content = easyMDE.value();
    if (!content) return;
    const filename = prompt('Nombre del archivo (ej: post.md):', `post_${new Date().toISOString().split('T')[0]}.md`);
    if (!filename) return;
    try {
      const response = await fetch('save-to-vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, filename })
      });
      const result = await response.json();
      if (response.ok) {
        alert(`Guardado en el Vault: ${filename}`);
      } else {
        alert('Error: ' + JSON.stringify(result));
      }
    } catch (e) {
      alert('Error al guardar en Vault: ' + e.message);
    }
  };

  // --- CARGAR/GUARDAR LOCAL ---
  el.guardarArchivoBtn.onclick = () => {
    const content = easyMDE.value();
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'simply_post.md';
    a.click();
  };
  el.cargarArchivoBtn.onclick = () => el.archivoInput.click();
  el.archivoInput.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      easyMDE.value(ev.target.result);
      actualizarVistas();
    };
    reader.readAsText(file);
  };

  const boldExceptions = {
    'h': '𝐡'
  };

  // --- FUNCIONES DE UTILIDAD (UNICODE & CLIPBOARD) ---
  function toBold(str) {
    return str.replace(/[A-Za-z0-9]/g, c => {
      if (boldExceptions[c]) return boldExceptions[c];
      if ('A' <= c && c <= 'Z') return String.fromCodePoint(c.charCodeAt(0) + 0x1d400 - 0x41);
      if ('a' <= c && c <= 'z') return String.fromCodePoint(c.charCodeAt(0) + 0x1d41a - 0x61);
      if ('0' <= c && c <= '9') return String.fromCodePoint(c.charCodeAt(0) + 0x1d7ce - 0x30);
      return c;
    });
  }

  function toItalic(str) {
    return str.replace(/[A-Za-z]/g, c => {
      if ('A' <= c && c <= 'Z') return String.fromCodePoint(c.charCodeAt(0) + 0x1d434 - 0x41);
      if ('a' <= c && c <= 'z') return String.fromCodePoint(c.charCodeAt(0) + 0x1d44e - 0x61);
      return c;
    });
  }

  function markdownToFacebookUnicode(md) {
    if (!md) return '';
    let processed = md;
    
    // Negritas y Cursivas Estándar
    processed = processed.replace(/(\*\*\*|___)(.*?)\1/g, (_, __, text) => toBold(toItalic(text)));
    processed = processed.replace(/(\*\*|__)(.*?)\1/g, (_, __, text) => toBold(text));
    processed = processed.replace(/(\*|_)(.*?)\1/g, (_, __, text) => toItalic(text));
    
    // Etiquetas Especiales Unicode
    processed = processed.replace(/\{s\}(.*?)\{\/s\}/g, (_, text) => applyStyle(text, 'script'));
    processed = processed.replace(/\{f\}(.*?)\{\/f\}/g, (_, text) => applyStyle(text, 'fraktur'));
    processed = processed.replace(/\{d\}(.*?)\{\/d\}/g, (_, text) => applyStyle(text, 'double'));
    processed = processed.replace(/\{sb\}(.*?)\{\/sb\}/g, (_, text) => applyStyle(text, 'sansbold'));
    processed = processed.replace(/\{c\}(.*?)\{\/c\}/g, (_, text) => applyStyle(text, 'circled'));
    processed = processed.replace(/\{sq\}(.*?)\{\/sq\}/g, (_, text) => applyStyle(text, 'squared'));
    processed = processed.replace(/\{fw\}(.*?)\{\/fw\}/g, (_, text) => applyStyle(text, 'fullwidth'));
    
    // Tachado (Facebook usa ~texto~)
    processed = processed.replace(/~~(.*?)~~/g, (_, text) => `~${text}~`);
    
    return processed;
  }

  function applyStyle(text, style) {
    const map = unicodeMaps[style];
    if (!map) return text;
    return text.split('').map(c => map[c] || c).join('');
  }

  const unicodeMaps = {
    script: { A: '𝒜', B: 'ℬ', C: '𝒞', D: '𝒟', E: 'ℰ', F: 'ℱ', G: '𝒢', H: 'ℋ', I: 'ℐ', J: '𝒥', K: '𝒦', L: 'ℒ', M: 'ℳ', N: '𝒩', O: '𝒪', P: '𝒫', Q: '𝒬', R: 'ℛ', S: '𝒮', T: '𝒯', U: '𝒰', V: '𝒱', W: '𝒲', X: '𝒳', Y: '𝒴', Z: '𝒵', a: '𝒶', b: '𝒷', c: '𝒸', d: '𝒹', e: 'ℯ', f: '𝒻', g: 'ℊ', h: '𝒽', i: '𝒾', j: '𝒿', k: '𝓀', l: '𝓁', m: '𝓂', n: '𝓃', o: 'ℴ', p: '𝓅', q: '𝓆', r: '𝓇', s: '𝓈', t: '𝓉', u: '𝓊', v: '𝓋', w: '𝓌', x: '𝓍', y: '𝓎', z: '𝓏' },
    fraktur: { A: '𝔄', B: '𝔅', C: 'ℭ', D: '𝔇', E: '𝔈', F: '𝔉', G: '𝔊', H: 'ℌ', I: 'ℑ', J: '𝔍', K: '𝔎', L: '𝔏', M: '𝔐', N: '𝔑', O: '𝔒', P: '𝔓', Q: '𝔔', R: 'ℜ', S: '𝔖', T: '𝔗', U: 'backU', V: '𝔙', W: '𝔚', X: '𝔛', Y: '𝔜', Z: 'ℨ', a: '𝔞', b: '𝔟', c: '𝔠', d: '𝔡', e: '𝔢', f: '𝔣', g: '𝔤', h: '𝔥', i: '𝔦', j: '𝔧', k: '𝔨', l: '𝔩', m: '𝔪', n: '𝔫', o: '𝔬', p: '𝔭', q: '𝔮', r: '𝔯', s: '𝔰', t: '𝔱', u: '𝔲', v: '𝔳', w: '𝔴', x: '𝔵', y: '𝔶', z: '𝔷' },
    double: { A: '𝔸', B: '𝔹', C: 'ℂ', D: '𝔻', E: '𝔼', F: '𝔽', G: '𝔾', H: 'ℍ', I: '𝕀', J: '𝕁', K: '𝕂', L: '𝕃', M: '𝕄', N: 'ℕ', O: '𝕆', P: 'ℙ', Q: 'ℚ', R: 'ℝ', S: '𝕊', T: '𝕋', U: '𝕌', V: '', W: '𝕎', X: '𝕏', Y: '𝕐', Z: 'ℤ', a: '𝕒', b: '𝕓', c: '𝕔', d: '𝕕', e: '𝕖', f: '𝕗', g: '𝕘', h: '𝕙', i: '𝕚', j: '𝕛', k: '𝕜', l: '𝕝', m: '𝕞', n: '𝕟', o: '𝕠', p: '𝕡', q: '𝕢', r: '𝕣', s: '𝕤', t: '𝕥', u: '𝕦', v: '𝕧', w: '𝕨', x: '𝕩', y: '𝕪', z: '𝕫' },
    sansbold: { A: '𝗔', B: '𝗕', C: '𝗖', D: '𝗗', E: '𝗘', F: '𝗙', G: '𝗚', H: '𝗛', I: '𝗜', J: '𝗝', K: '𝗞', L: '𝗟', M: '𝗠', N: '𝗡', O: '𝗢', P: '𝗣', Q: '𝗤', R: '𝗥', S: '𝗦', T: '𝗧', U: '𝗨', V: '𝗩', W: '𝗪', X: '𝗫', Y: '𝗬', Z: '𝗭', a: '𝗮', b: '𝗯', c: '𝗰', d: 'ｄ', e: 'ｅ', f: 'ｆ', g: 'ｇ', h: 'ｈ', i: 'ｉ', j: 'ｊ', k: 'ｋ', l: 'ｌ', m: 'ｍ', n: 'ｎ', o: 'ｏ', p: 'ｐ', q: 'ｑ', r: 'ｒ', s: 'ｓ', t: 'ｔ', u: 'ｕ', v: '𝘃', w: '𝓌', x: '𝓍', y: '𝓎', z: '𝓏' },
    circled: { A: 'Ⓐ', B: 'Ⓑ', C: 'Ⓒ', D: 'Ⓓ', E: 'Ⓔ', F: 'Ⓕ', G: 'Ⓖ', H: 'Ⓗ', I: 'Ⓘ', J: 'Ⓙ', K: 'Ⓚ', L: 'Ⓛ', M: 'Ⓜ', N: 'Ⓝ', O: 'Ⓞ', P: 'Ⓟ', Q: 'Ⓠ', R: 'Ⓡ', S: 'Ⓢ', T: 'Ⓣ', U: 'Ⓤ', V: 'Ⓥ', W: 'Ⓦ', X: 'Ⓧ', Y: 'Ⓨ', Z: 'Ⓩ', a: 'ⓐ', b: 'ⓑ', c: 'ⓒ', d: 'ⓓ', e: 'ⓔ', f: 'ⓕ', g: 'ⓖ', h: 'ⓗ', i: 'ⓘ', j: 'ⓙ', k: 'ⓚ', l: 'ⓛ', m: 'ⓜ', n: 'ⓝ', o: 'ⓞ', p: 'ⓟ', q: 'ⓠ', r: 'ⓡ', s: 'ⓢ', t: 'ⓣ', u: 'ⓤ', v: 'Ⓥ', w: 'ⓦ', x: 'ⓧ', y: 'ⓨ', z: 'ⓩ' },
    squared: { A: '🄰', B: '🄱', C: '🄲', D: '🄳', E: '🄴', F: '🄵', G: '🄶', H: '🄷', I: '🄸', J: '🄹', K: '🄺', L: '🄻', M: '🄼', N: '🄽', O: '🄾', P: '🄿', Q: '🅀', R: '🅁', S: '🅂', T: '🅃', U: '🅄', V: '🅅', W: '🅆', X: '🅇', Y: '🅈', Z: '🅉', a: '🄰', b: '🄱', c: '🄲', d: '🄳', e: '🄴', f: '🄵', g: '🄶', h: '🄷', i: '🄸', j: '🄹', k: '🄺', l: '🄻', m: '🄼', n: '🄽', o: '🄾', p: '🄿', q: '🅀', r: '🅁', s: '🅂', t: '🅃', u: '🅄', v: '🅅', w: '🅆', x: '🅇', y: '🅈', z: '🅉' },
    fullwidth: { A: 'Ａ', B: 'Ｂ', C: 'Ｃ', D: 'Ｄ', E: 'Ｅ', F: 'Ｆ', G: 'Ｇ', H: 'Ｈ', I: 'Ｉ', J: 'Ｊ', K: 'Ｋ', L: 'Ｌ', M: 'Ｍ', N: 'Ｎ', O: 'Ｏ', P: 'Ｐ', Q: 'Ｑ', R: 'Ｒ', S: 'Ｓ', T: 'Ｔ', U: 'Ｕ', V: 'Ｖ', W: 'Ｗ', X: 'Ｘ', Y: 'Ｙ', Z: 'Ｚ', a: 'ａ', b: 'ｂ', c: 'ｃ', d: 'ｄ', e: 'ｅ', f: 'ｆ', g: 'ｇ', h: 'ｈ', i: 'ｉ', j: 'ｊ', k: 'ｋ', l: 'ｌ', m: 'ｍ', n: 'ｎ', o: 'ｏ', p: 'ｐ', q: 'ｑ', r: 'ｒ', s: 'ｓ', t: 'ｔ', u: 'ｕ', v: 'ｖ', w: 'ｗ', x: 'ｘ', y: 'ｙ', z: 'ｚ' }
  };

  async function copyToClipboard(text, btn) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      const originalText = btn.textContent;
      btn.textContent = 'Copiado ✔';
      btn.classList.add('btn-success');
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('btn-success');
      }, 2000);
    } catch (err) {
      alert('Error al copiar al portapapeles');
    }
  }

  // --- PERSISTENCIA AL CARGAR ---
  function cargarContenidoPersistente() {
    const savedX = localStorage.getItem('simply-x-content');
    if (savedX) {
      el.outX.textContent = savedX;
      if (el.xCounter) el.xCounter.textContent = 280 - savedX.length;
    }
    const savedLI = localStorage.getItem('simply-li-content');
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

  document.getElementById('limpiarBtn').onclick = () => {
    if (confirm('¿Quieres limpiar todo el editor?')) {
      easyMDE.value('');
      actualizarVistas();
    }
  };

  document.getElementById('themeToggle').onclick = () => { 
    document.body.classList.toggle('theme-sketch'); 
    localStorage.setItem('simply-theme', document.body.classList.contains('theme-sketch') ? 'sketch' : 'dark'); 
  };
  if (localStorage.getItem('simply-theme') === 'sketch') document.body.classList.add('theme-sketch');

  loadPrompts();
  actualizarVistas();

  })();
