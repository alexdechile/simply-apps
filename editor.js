import { Editor } from 'https://esm.sh/@tiptap/core@2.11.5';
import StarterKit from 'https://esm.sh/@tiptap/starter-kit@2.11.5';
import { Markdown } from 'https://esm.sh/@tiptap/markdown@2.11.5';

const outputDiv = document.getElementById('output');
const copyBtn = document.getElementById('copyBtn');
const pegarBtn = document.getElementById('pegarBtn');
const limpiarBtn = document.getElementById('limpiarBtn');
const editorElement = document.getElementById('editor');

console.log('Cargando Tiptap desde ESM...');

const editor = new Editor({
  element: editorElement,
  extensions: [
    StarterKit.configure({
      paragraph: true,
      bold: true,
      italic: true,
      strike: true,
      code: true
    }),
    Markdown
  ],
  content: '',
  editorProps: {
    attributes: {
      placeholder: 'Escribe o pega tu texto aquí...',
    },
  },
  onUpdate: ({ editor }) => {
    const markdown = editor.getMarkdown();
    outputDiv.textContent = markdownToFacebookUnicode(markdown);
  }
});

console.log('Tiptap inicializado');

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

function limpiarEditor() {
  editor.commands.clearContent();
  editor.commands.focus();
  outputDiv.textContent = '';
}

async function pegarDesdePortapapeles() {
  try {
    const text = await navigator.clipboard.readText();
    editor.commands.setContent(text, { contentType: 'markdown' });
    editor.commands.focus();
  } catch (err) {
    console.error('No se pudo pegar el texto: ', err);
    alert('No se pudo acceder al portapapeles. Asegúrate de haber dado permisos.');
  }
}

copyBtn.addEventListener('click', () => {
  const text = outputDiv.textContent;
  if (!text) return;
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

outputDiv.textContent = '';
