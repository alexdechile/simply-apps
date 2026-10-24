/**
 * diagram.js — Simply Apps Architecture Diagram + Sticky Notes
 * Mermaid.js + Zoom/Pan con rueda + arrastrar + botones
 */

// Escapa texto controlado por el usuario antes de insertarlo con innerHTML.
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));
}

// Resuelve endpoints bajo la raíz o bajo /simply/ cuando pasa por Nginx
function appUrl(endpoint) {
  const clean = String(endpoint ?? '').replace(/^\/+/, '');
  if (window.location.pathname.startsWith('/simply')) {
    return '/simply/' + clean;
  }
  return '/' + clean;
}
window.appUrl = appUrl;

// =============================================
// DEFINICIONES DE DIAGRAMAS
// =============================================
const DIAGRAMS = {
  general: `flowchart TD
    USER(["👤 Usuario"]):::user

    subgraph FRONTEND["🖥️ Frontend"]
      direction TB
      EDITOR["✏️ Editor EasyMDE"]:::fe
      TOOLBAR["🔧 Toolbar Botones IA"]:::fe
      TABS["📑 Tabs FB / X / LI"]:::fe
      OUTPUT["📄 Preview Markdown"]:::fe
      DIAGRAMA["📐 Diagrama + Stickies"]:::fe
    end

    subgraph BACKEND["⚙️ Backend Puerto 1717"]
      direction TB
      POLISH["/ai-polish ✨ Pulir"]:::ep
      DECORATE["/ai-decorate 🧂 Decorar"]:::ep
      SUGGEST["/ai-suggest 💡 Sugerir"]:::ep
      RESEARCH["/research 🔍 Investigar"]:::ep
      CANCION["/cancion 🎵 Musical"]:::ep
      TECH["/tech 💻 Tech"]:::ep
      NEWS["/news 📰 News"]:::ep
      ASKIA["/ask-ai 🧠 Pensar"]:::ep
      EXPORT["/export 💾 Exportar"]:::ep
      VAULT["/vault 🗄️ Vault"]:::ep
      STICKIES["/api/stickies 📌"]:::ep
    end

    subgraph EXTERNO["🌐 Servicios"]
      DEEPINFRA["DeepInfra API"]:::ext
      SCRAPING["🐍 Scrapling DDG"]:::ext
      AICHAT["🦀 aichat Rust"]:::ext
      RUST["🦀 simply-analyzer"]:::ext
    end

    USER --> FRONTEND
    TOOLBAR -->|POST| POLISH & DECORATE & SUGGEST & RESEARCH
    TOOLBAR -->|POST| CANCION & TECH & NEWS & ASKIA
    EDITOR -->|POST| EXPORT & VAULT
    DIAGRAMA <-->|GET/POST| STICKIES
    POLISH & DECORATE & SUGGEST --> AICHAT
    RESEARCH --> SCRAPING
    CANCION & TECH & NEWS & ASKIA --> DEEPINFRA
    EDITOR -.->|debounce| RUST

    classDef user fill:#7c3aed,stroke:#a78bfa,color:#fff
    classDef fe fill:#1e3a5f,stroke:#3b82f6,color:#93c5fd
    classDef ep fill:#14532d,stroke:#22c55e,color:#86efac
    classDef ext fill:#3b1f5e,stroke:#a855f7,color:#d8b4fe`,

  frontend: `flowchart TD
    LOAD["🚀 Carga Inicial"]:::start
    EASYMDE["EasyMDE Editor"]:::comp
    PREVIEW["Preview HTML"]:::comp
    UNICODE["Barra Unicode"]:::comp
    TABS["Tabs FB / X / LI"]:::comp
    LOCAL["💾 localStorage"]:::store
    MODAL_INV["Modal Investigación"]:::modal
    MODAL_DEC["Modal Decoration"]:::modal
    MODAL_AI["Modal Sugerencias"]:::modal
    EMOJI["Emoji Picker"]:::comp
    FIND["Buscar/Reemplazar"]:::comp
    STATS["Stats Panel Rust"]:::comp

    LOAD --> EASYMDE
    EASYMDE -->|onChange 500ms| PREVIEW
    EASYMDE -->|onSelect| UNICODE
    EASYMDE -->|onChange| LOCAL
    EASYMDE -->|debounce| STATS
    TABS --> PREVIEW
    EASYMDE --> FIND

    EASYMDE -->|Investigar| MODAL_INV
    EASYMDE -->|Decorar| MODAL_DEC
    EASYMDE -->|Sugerir| MODAL_AI
    EASYMDE -->|Emoji| EMOJI

    MODAL_INV -->|cm.setValue| EASYMDE
    MODAL_DEC -->|replace| EASYMDE
    MODAL_AI -->|append| EASYMDE

    classDef start fill:#7c3aed,stroke:#a78bfa,color:#fff
    classDef comp fill:#1e3a5f,stroke:#3b82f6,color:#93c5fd
    classDef store fill:#14532d,stroke:#22c55e,color:#86efac
    classDef modal fill:#3b1f5e,stroke:#a855f7,color:#d8b4fe`,

  ia: `flowchart LR
    INPUT(["📝 Texto"]):::input

    subgraph AICHAT_GROUP["🦀 aichat CLI"]
      POLISH["✨ Pulir"]:::aichat
      DECORATE["🧂 Decorar"]:::aichat
      SUGGEST["💡 Sugerir"]:::aichat
    end

    subgraph DEEPINFRA_GROUP["☁️ DeepInfra"]
      PENSAR["🧠 Pensar"]:::deep
      GENX["🐦 Generar X"]:::deep
      GENLI["💼 Generar LI"]:::deep
      CANCION["🎵 Musical"]:::deep
      TECH["💻 Tech"]:::deep
      NEWS["📰 News"]:::deep
    end

    subgraph RUST_GROUP["🦀 Rust"]
      ANALYZER["📊 Metricas"]:::rust
    end

    INPUT --> POLISH --> OP(["📋 Pulido"]):::out
    INPUT --> DECORATE --> OD(["📋 Decorado"]):::out
    INPUT --> SUGGEST --> OS(["💡 Ideas"]):::out
    INPUT --> PENSAR --> OA(["🧠 Sintesis"]):::out
    INPUT --> GENX --> OX(["🐦 Post X"]):::out
    INPUT --> GENLI --> OL(["💼 Post LI"]):::out
    INPUT --> ANALYZER --> OR(["📊 Stats"]):::out
    CANCION --> OM(["🎵 Musical"]):::out
    TECH --> OT(["💻 Tech"]):::out
    NEWS --> ON(["📰 News"]):::out

    classDef input fill:#7c3aed,stroke:#a78bfa,color:#fff
    classDef aichat fill:#78350f,stroke:#f59e0b,color:#fef3c7
    classDef deep fill:#1e3a5f,stroke:#3b82f6,color:#93c5fd
    classDef rust fill:#3b1f00,stroke:#f97316,color:#fed7aa
    classDef out fill:#14532d,stroke:#22c55e,color:#86efac`,

  data: `flowchart TD
    EDITOR(["✏️ Editor"]):::node
    VAULT["🗄️ Vault posts"]:::store
    FUENTES["📚 fuentes.md"]:::store
    STICKIES_FILE["📌 stickies.json"]:::store
    LOCAL["💾 localStorage"]:::store

    EDITOR -->|Archivar| VAULT
    VAULT -->|Recuperar| EDITOR
    EDITOR -->|Prompts| LOCAL
    LOCAL -->|Inicio| EDITOR
    FUENTES -->|Dominios| RESEARCH["🔍 Scrapling"]:::proc
    RESEARCH -->|Sintesis| EDITOR
    STICKIES_FILE <-->|API| DIAGRAM["📐 Diagrama"]:::proc

    subgraph EXPORT_GROUP["Exportacion"]
      DOCX["📄 .docx"]:::exp
      XLSX["📊 .xlsx"]:::exp
      HTML["🌐 .html"]:::exp
    end
    EDITOR --> EXPORT_GROUP

    classDef node fill:#7c3aed,stroke:#a78bfa,color:#fff
    classDef store fill:#14532d,stroke:#22c55e,color:#86efac
    classDef proc fill:#1e3a5f,stroke:#3b82f6,color:#93c5fd
    classDef exp fill:#3b1f5e,stroke:#a855f7,color:#d8b4fe`
};

// =============================================
// ESTADO GLOBAL
// =============================================
let currentStickies = [];
let currentNodeId = null;
let editingStickyId = null;
let selectedColor = '#fef08a';
let diagramReady = false;

// Estado del zoom/pan
const zoomState = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
  isDragging: false,
  lastX: 0,
  lastY: 0,
  MIN: 0.25,
  MAX: 4,
  STEP: 0.15
};

// =============================================
// INICIALIZACIÓN
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  if (typeof mermaid !== 'undefined') {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'dark',
      themeVariables: {
        darkMode: true,
        background: '#0d0d1a',
        primaryColor: '#1e3a5f',
        primaryTextColor: '#93c5fd',
        primaryBorderColor: '#3b82f6',
        lineColor: '#a78bfa',
        secondaryColor: '#14532d',
        tertiaryColor: '#3b1f5e'
      },
      flowchart: { htmlLabels: true, curve: 'basis' }
    });
  }

  // Tab Diagrama
  const tabBtn = document.getElementById('tabDiagrama');
  if (tabBtn) {
    tabBtn.addEventListener('click', () => {
      setTimeout(() => {
        if (!diagramReady) {
          initZoomPan();
          renderDiagram('general');
          loadStickies();
          diagramReady = true;
        }
      }, 150);
    });
  }

  // Cambio de vista
  const viewSelect = document.getElementById('diagramViewSelect');
  if (viewSelect) {
    viewSelect.addEventListener('change', (e) => {
      diagramReady = false;
      renderDiagram(e.target.value);
      setTimeout(() => {
        fitDiagram();
        renderStickies();
        diagramReady = true;
      }, 700);
    });
  }

  // Botones de zoom
  document.getElementById('diagramZoomIn')?.addEventListener('click', () => applyZoom(zoomState.STEP));
  document.getElementById('diagramZoomOut')?.addEventListener('click', () => applyZoom(-zoomState.STEP));
  document.getElementById('diagramZoomReset')?.addEventListener('click', resetZoom);
  document.getElementById('diagramZoomFit')?.addEventListener('click', fitDiagram);

  // Colores del modal
  document.querySelectorAll('.sticky-color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedColor = btn.dataset.color;
      const p = document.getElementById('stickyColorPreview');
      if (p) p.style.background = selectedColor;
    });
  });

  // Modal botones
  document.getElementById('stickySaveBtn')?.addEventListener('click', saveSticky);
  document.getElementById('stickyDeleteBtn')?.addEventListener('click', deleteSticky);
  document.getElementById('stickyResolveBtn')?.addEventListener('click', resolveSticky);
});

// =============================================
// ZOOM / PAN
// =============================================
function initZoomPan() {
  const canvas = document.getElementById('diagram-canvas');
  if (!canvas || canvas._zoomInit) return;
  canvas._zoomInit = true;

  // Rueda del mouse → zoom centrado en cursor
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const delta = e.deltaY < 0 ? zoomState.STEP : -zoomState.STEP;
    const newScale = Math.min(zoomState.MAX, Math.max(zoomState.MIN, zoomState.scale + delta));
    const scaleRatio = newScale / zoomState.scale;

    // Ajusta offset para que el zoom sea centrado en el cursor
    zoomState.offsetX = mouseX - scaleRatio * (mouseX - zoomState.offsetX);
    zoomState.offsetY = mouseY - scaleRatio * (mouseY - zoomState.offsetY);
    zoomState.scale = newScale;

    applyTransform();
  }, { passive: false });

  // Arrastrar para mover (pan)
  canvas.addEventListener('mousedown', (e) => {
    // Solo pan con botón izquierdo, y no si clickeamos un nodo
    if (e.button !== 0) return;
    zoomState.isDragging = true;
    zoomState.lastX = e.clientX;
    zoomState.lastY = e.clientY;
    canvas.style.cursor = 'grabbing';
  });

  window.addEventListener('mousemove', (e) => {
    if (!zoomState.isDragging) return;
    const dx = e.clientX - zoomState.lastX;
    const dy = e.clientY - zoomState.lastY;
    zoomState.offsetX += dx;
    zoomState.offsetY += dy;
    zoomState.lastX = e.clientX;
    zoomState.lastY = e.clientY;
    applyTransform();
  });

  window.addEventListener('mouseup', () => {
    if (zoomState.isDragging) {
      zoomState.isDragging = false;
      const canvas = document.getElementById('diagram-canvas');
      if (canvas) canvas.style.cursor = 'grab';
    }
  });

  // Touch: zoom con dos dedos + pan con uno
  let lastTouchDist = null;
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      zoomState.isDragging = true;
      zoomState.lastX = e.touches[0].clientX;
      zoomState.lastY = e.touches[0].clientY;
    }
    if (e.touches.length === 2) {
      zoomState.isDragging = false;
      lastTouchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: true });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (e.touches.length === 1 && zoomState.isDragging) {
      const dx = e.touches[0].clientX - zoomState.lastX;
      const dy = e.touches[0].clientY - zoomState.lastY;
      zoomState.offsetX += dx;
      zoomState.offsetY += dy;
      zoomState.lastX = e.touches[0].clientX;
      zoomState.lastY = e.touches[0].clientY;
      applyTransform();
    }
    if (e.touches.length === 2 && lastTouchDist !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const delta = (dist - lastTouchDist) * 0.005;
      lastTouchDist = dist;
      applyZoom(delta);
    }
  }, { passive: false });

  canvas.addEventListener('touchend', () => {
    zoomState.isDragging = false;
    lastTouchDist = null;
  }, { passive: true });
}

function applyTransform() {
  const panLayer = document.getElementById('diagram-pan-layer');
  const stickyLayer = document.getElementById('stickies-layer');
  if (!panLayer) return;

  const t = `translate(${zoomState.offsetX}px, ${zoomState.offsetY}px) scale(${zoomState.scale})`;
  panLayer.style.transform = t;
  if (stickyLayer) stickyLayer.style.transform = t;

  // Actualiza indicador de porcentaje
  const lvl = document.getElementById('diagramZoomLevel');
  if (lvl) lvl.textContent = Math.round(zoomState.scale * 100) + '%';
}

function applyZoom(delta) {
  const canvas = document.getElementById('diagram-canvas');
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const cx = rect.width / 2;
  const cy = rect.height / 2;

  const newScale = Math.min(zoomState.MAX, Math.max(zoomState.MIN, zoomState.scale + delta));
  const ratio = newScale / zoomState.scale;
  zoomState.offsetX = cx - ratio * (cx - zoomState.offsetX);
  zoomState.offsetY = cy - ratio * (cy - zoomState.offsetY);
  zoomState.scale = newScale;
  applyTransform();
}

function resetZoom() {
  zoomState.scale = 1;
  zoomState.offsetX = 0;
  zoomState.offsetY = 0;
  applyTransform();
}

function fitDiagram() {
  const canvas = document.getElementById('diagram-canvas');
  const panLayer = document.getElementById('diagram-pan-layer');
  if (!canvas || !panLayer) return;

  // Reset transform para medir tamaño real
  panLayer.style.transform = 'translate(0,0) scale(1)';
  const contentW = panLayer.scrollWidth;
  const contentH = panLayer.scrollHeight;
  const canvasW = canvas.clientWidth;
  const canvasH = canvas.clientHeight;

  if (contentW === 0 || contentH === 0) return;

  const scaleX = (canvasW - 40) / contentW;
  const scaleY = (canvasH - 40) / contentH;
  const newScale = Math.min(scaleX, scaleY, 1); // nunca mayor a 100%

  // Centrar
  const offsetX = (canvasW - contentW * newScale) / 2;
  const offsetY = (canvasH - contentH * newScale) / 2;

  zoomState.scale = newScale;
  zoomState.offsetX = offsetX;
  zoomState.offsetY = offsetY;
  applyTransform();
}

// =============================================
// RENDER DEL DIAGRAMA
// =============================================
async function renderDiagram(view) {
  const container = document.getElementById('diagram-mermaid');
  if (!container || typeof mermaid === 'undefined') return;

  const definition = DIAGRAMS[view] || DIAGRAMS.general;

  try {
    container.removeAttribute('data-processed');
    container.className = 'mermaid';
    container.innerHTML = definition;

    await mermaid.run({ nodes: [container] });

    setTimeout(() => {
      attachNodeClickHandlers();
      renderStickies();
      // Vistas complejas: auto-ajustar
      if (view === 'general' || view === 'frontend') {
        fitDiagram();
      } else {
        resetZoom();
      }
    }, 400);
  } catch (err) {
    console.error('[Diagram] Error:', err);
    container.innerHTML = `<p style="color:#f87171; padding:1rem;">❌ Error: ${err.message}</p>`;
  }
}

// =============================================
// INTERACTIVIDAD EN NODOS SVG
// =============================================
function attachNodeClickHandlers() {
  const svg = document.querySelector('#diagram-mermaid svg');
  if (!svg) return;

  const nodes = svg.querySelectorAll('.node, .cluster');
  nodes.forEach(node => {
    node.style.cursor = 'pointer';
    node.style.transition = 'filter 0.15s ease';

    node.addEventListener('mouseenter', () => {
      node.style.filter = 'drop-shadow(0 0 8px rgba(167,139,250,0.8))';
    });
    node.addEventListener('mouseleave', () => {
      node.style.filter = '';
    });

    node.addEventListener('click', (e) => {
      // Evitar que el click en un nodo dispare el pan
      e.stopPropagation();
      // Solo abrir modal si no se estaba arrastrando
      if (zoomState.isDragging) return;
      const labelEl = node.querySelector('.nodeLabel, .label, foreignObject p, text');
      const rawLabel = labelEl ? labelEl.textContent.trim().split('\n')[0] : node.id;
      const nodeId = node.id || 'node_' + rawLabel.replace(/\W+/g, '_');
      openStickyModal(nodeId, rawLabel);
    });
  });
}

// =============================================
// MODAL DE STICKY
// =============================================
function openStickyModal(nodeId, nodeLabel) {
  currentNodeId = nodeId;
  editingStickyId = null;

  const existing = currentStickies.find(s => s.nodeId === nodeId && !s.resolved);

  const labelEl = document.getElementById('stickyNodeLabel');
  const textInput = document.getElementById('stickyTextInput');
  const deleteBtn = document.getElementById('stickyDeleteBtn');
  const resolveBtn = document.getElementById('stickyResolveBtn');
  const colorPreview = document.getElementById('stickyColorPreview');

  if (labelEl) labelEl.textContent = nodeLabel;

  if (existing) {
    editingStickyId = existing.id;
    if (textInput) textInput.value = existing.text;
    selectedColor = existing.color || '#fef08a';
    if (colorPreview) colorPreview.style.background = selectedColor;
    if (deleteBtn) deleteBtn.classList.remove('d-none');
    if (resolveBtn) resolveBtn.classList.remove('d-none');
  } else {
    if (textInput) textInput.value = '';
    selectedColor = '#fef08a';
    if (colorPreview) colorPreview.style.background = '#fef08a';
    if (deleteBtn) deleteBtn.classList.add('d-none');
    if (resolveBtn) resolveBtn.classList.add('d-none');
  }

  const modal = new bootstrap.Modal(document.getElementById('stickyModal'));
  modal.show();
  setTimeout(() => { if (textInput) textInput.focus(); }, 300);
}

// =============================================
// CRUD STICKIES
// =============================================
async function saveSticky() {
  const textInput = document.getElementById('stickyTextInput');
  const text = textInput ? textInput.value.trim() : '';
  if (!text) return;
  const nodeLabel = document.getElementById('stickyNodeLabel')?.textContent || currentNodeId;

  if (editingStickyId) {
    const idx = currentStickies.findIndex(s => s.id === editingStickyId);
    if (idx !== -1) {
      currentStickies[idx].text = text;
      currentStickies[idx].color = selectedColor;
      currentStickies[idx].updatedAt = new Date().toISOString();
    }
  } else {
    currentStickies.push({
      id: 'sticky_' + Date.now(),
      nodeId: currentNodeId,
      nodeLabel,
      text,
      color: selectedColor,
      resolved: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  await persistStickies();
  closeModalAndRefresh();
}

async function deleteSticky() {
  if (!editingStickyId) return;
  currentStickies = currentStickies.filter(s => s.id !== editingStickyId);
  await persistStickies();
  closeModalAndRefresh();
}

async function resolveSticky() {
  if (!editingStickyId) return;
  const idx = currentStickies.findIndex(s => s.id === editingStickyId);
  if (idx !== -1) {
    currentStickies[idx].resolved = true;
    currentStickies[idx].updatedAt = new Date().toISOString();
  }
  await persistStickies();
  closeModalAndRefresh();
}

function closeModalAndRefresh() {
  const modalEl = document.getElementById('stickyModal');
  if (modalEl) {
    const inst = bootstrap.Modal.getInstance(modalEl);
    if (inst) inst.hide();
  }
  renderStickies();
  updateStickyCount();
}

// =============================================
// PERSISTENCIA
// =============================================
async function loadStickies() {
  try {
    const res = await fetch(appUrl('api/stickies'));
    currentStickies = res.ok ? (await res.json() || []) : [];
  } catch (e) {
    currentStickies = [];
  }
  updateStickyCount();
}

async function persistStickies() {
  try {
    await fetch(appUrl('api/stickies'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentStickies)
    });
  } catch (e) {
    console.error('[Stickies] Error al guardar:', e.message);
  }
}

// =============================================
// RENDER DE STICKIES
// =============================================
function renderStickies() {
  const layer = document.getElementById('stickies-layer');
  const svg = document.querySelector('#diagram-mermaid svg');
  if (!layer) return;

  layer.innerHTML = '';
  const pending = currentStickies.filter(s => !s.resolved);

  pending.forEach((sticky, i) => {
    let x = 20 + i * 12;
    let y = 20 + i * 12;

    // Intentar posicionar junto al nodo
    if (svg) {
      const svgNode = svg.getElementById(sticky.nodeId);
      if (svgNode) {
        const svgRect = svg.getBoundingClientRect();
        const nodeRect = svgNode.getBoundingClientRect();
        const wrap = document.getElementById('diagram-mermaid-wrap');
        const wrapRect = wrap ? wrap.getBoundingClientRect() : svgRect;
        x = (nodeRect.left - wrapRect.left) + nodeRect.width + 4;
        y = (nodeRect.top - wrapRect.top);
      }
    }

    const el = document.createElement('div');
    el.dataset.id = sticky.id;
    const safeColor = /^#[0-9a-fA-F]{3,8}$/.test(sticky.color || '') ? sticky.color : '#fef08a';
    el.style.cssText = `
      position: absolute;
      left: ${x + 32}px;
      top: ${y}px;
      background: ${safeColor};
      color: #1a1a1a;
      border-radius: 4px;
      padding: 5px 9px;
      font-size: 0.7rem;
      font-family: monospace;
      max-width: 160px;
      box-shadow: 2px 3px 10px rgba(0,0,0,0.55);
      pointer-events: all;
      cursor: pointer;
      z-index: 200;
      line-height: 1.4;
      border-left: 3px solid rgba(0,0,0,0.2);
      word-break: break-word;
      animation: stickyAppear 0.2s ease-out;
    `;
    el.innerHTML = `
      <div style="font-weight:700;font-size:0.6rem;opacity:0.5;text-transform:uppercase;margin-bottom:2px;">
        📌 ${escapeHtml(String(sticky.nodeLabel || '').substring(0, 18))}
      </div>
      <div>${escapeHtml(sticky.text)}</div>
    `;

    el.addEventListener('mouseenter', () => el.style.boxShadow = '3px 5px 16px rgba(0,0,0,0.7)');
    el.addEventListener('mouseleave', () => el.style.boxShadow = '2px 3px 10px rgba(0,0,0,0.55)');

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      currentNodeId = sticky.nodeId;
      editingStickyId = sticky.id;
      const labelEl = document.getElementById('stickyNodeLabel');
      const textInput = document.getElementById('stickyTextInput');
      const deleteBtn = document.getElementById('stickyDeleteBtn');
      const resolveBtn = document.getElementById('stickyResolveBtn');
      const colorPreview = document.getElementById('stickyColorPreview');
      if (labelEl) labelEl.textContent = sticky.nodeLabel;
      if (textInput) textInput.value = sticky.text;
      selectedColor = /^#[0-9a-fA-F]{3,8}$/.test(sticky.color || '') ? sticky.color : '#fef08a';
      if (colorPreview) colorPreview.style.background = selectedColor;
      if (deleteBtn) deleteBtn.classList.remove('d-none');
      if (resolveBtn) resolveBtn.classList.remove('d-none');
      const modal = new bootstrap.Modal(document.getElementById('stickyModal'));
      modal.show();
    });

    layer.appendChild(el);
  });
}

function updateStickyCount() {
  const badge = document.getElementById('stickyCount');
  if (!badge) return;
  const n = currentStickies.filter(s => !s.resolved).length;
  badge.textContent = n === 0 ? '✅ listo' : `${n} idea${n !== 1 ? 's' : ''}`;
  badge.className = n === 0 ? 'badge bg-success text-white' : 'badge bg-warning text-dark';
}
