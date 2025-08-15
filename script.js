(() => {
  const markdownInput = document.getElementById('markdown');
  const outputDiv = document.getElementById('output');
  const formatButtons = document.getElementById('formatButtons');
  const copyBtn = document.getElementById('copyBtn');
  const pegarBtn = document.getElementById('pegarBtn');
  const limpiarBtn = document.getElementById('limpiarBtn');
  const boldBtn = document.getElementById('boldBtn');
  const italicBtn = document.getElementById('italicBtn');
  const highlighter = document.getElementById('highlighter');

  function escapeHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function updateHighlighter() {
    let text = markdownInput.value;
    // Append a newline to the end of the text if it's not empty.
    // This is a common trick to make sure the last line is highlighted
    // even if it doesn't end with a newline.
    if (text.endsWith('\n')) {
      text += ' ';
    }
    let highlightedText = escapeHtml(text);

    // Simple regex to highlight markdown-like tokens
    highlightedText = highlightedText.replace(/(\*\*|__|\*|_|~~|`)/g, (match) => {
        if (match === '**' || match === '__') {
            return `<span class="token-bold">${match}</span>`;
        }
        if (match === '*' || match === '_') {
            return `<span class="token-italic">${match}</span>`;
        }
        return match;
    });

    highlighter.innerHTML = highlightedText;
  }

  function limpiarEditor() {
    markdownInput.value = '';
    markdownInput.dispatchEvent(new Event('input'));
    markdownInput.focus();
  }

  async function pegarDesdePortapapeles() {
    try {
      const text = await navigator.clipboard.readText();
      markdownInput.value = text;
      markdownInput.dispatchEvent(new Event('input'));
      markdownInput.focus();
    } catch (err) {
      console.error('No se pudo pegar el texto: ', err);
    }
  }

  function wrapSelectionWith(startTag, endTag) {
      const start = markdownInput.selectionStart;
      const end = markdownInput.selectionEnd;
      if (start === end) return;
      const before = markdownInput.value.substring(0, start);
      const selected = markdownInput.value.substring(start, end);
      const after = markdownInput.value.substring(end);
      markdownInput.value = before + startTag + selected + endTag + after;
      markdownInput.selectionStart = start + startTag.length;
      markdownInput.selectionEnd = end + startTag.length;
      markdownInput.focus();
      markdownInput.dispatchEvent(new Event('input'));
  }

  function wrapSelectionWithBold() {
    wrapSelectionWith('**', '**');
  }

  function wrapSelectionWithItalic() {
    wrapSelectionWith('*', '*');
  }

  function markdownToFacebookUnicode(md) {
    md = md.replace(/(\*\*|__)(.*?)\1/g, (_, __, text) => toBold(text));
    md = md.replace(/(\*|_)(.*?)\1/g, (_, __, text) => toItalic(text));
    md = md.replace(/~~(.*?)~~/g, (_, text) => `~${text}~`);
    md = md.replace(/`([^`]+)`/g, (_, text) => '`' + text + '`');
    md = md.replace(/\r\n|\r|\n/g, '\n');
    return md;
  }

  function toBold(str) {
    return str.replace(/[A-Za-z0-9]/g, c => {
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

  markdownInput.addEventListener('input', () => {
    updateHighlighter();
    outputDiv.textContent = markdownToFacebookUnicode(markdownInput.value);
  });

  markdownInput.addEventListener('scroll', () => {
    highlighter.scrollTop = markdownInput.scrollTop;
    highlighter.scrollLeft = markdownInput.scrollLeft;
  });

  markdownInput.addEventListener('select', () => {
    const hasSelection = markdownInput.selectionStart !== markdownInput.selectionEnd;
    formatButtons.style.display = hasSelection ? 'inline-block' : 'none';
  });

  markdownInput.addEventListener('blur', () => {
    setTimeout(() => {
      const active = document.activeElement;
      if (!formatButtons.contains(active)) {
        formatButtons.style.display = 'none';
      }
    }, 150);
  });

  copyBtn.addEventListener('click', () => {
    const text = outputDiv.textContent;
    if (!text) return; // Do nothing if there is no text

    navigator.clipboard.writeText(text).then(() => {
      const originalText = copyBtn.textContent;
      copyBtn.textContent = 'Copiado ✔';
      copyBtn.classList.add('copied');

      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.classList.remove('copied');
      }, 1500);
    });
  });

  pegarBtn.addEventListener('click', pegarDesdePortapapeles);
  limpiarBtn.addEventListener('click', limpiarEditor);
  boldBtn.addEventListener('click', wrapSelectionWithBold);
  italicBtn.addEventListener('click', wrapSelectionWithItalic);

  outputDiv.textContent = '';
  updateHighlighter(); // Initial call
})();
