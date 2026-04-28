import sys
import os
import json
import markdown
from docx import Document
from docx.shared import Pt
import pandas as pd

def export_to_docx(content, output_path):
    doc = Document()
    # Simple formatting: just add text. 
    # Unicode characters are handled by python-docx if the font supports them.
    p = doc.add_paragraph(content)
    doc.save(output_path)

def export_to_xlsx(content, output_path):
    # Split by lines for Excel
    lines = content.split('\n')
    df = pd.DataFrame(lines, columns=["Contenido"])
    df.to_excel(output_path, index=False)

def export_to_html(content, output_path):
    # Convert markdown to HTML
    html_content = markdown.markdown(content)
    full_html = f"""<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Exportado desde Simply Apps</title>
    <style>
        body {{ font-family: sans-serif; line-height: 1.6; padding: 2em; max-width: 800px; margin: auto; }}
        pre {{ background: #f4f4f4; padding: 1em; overflow-x: auto; }}
    </style>
</head>
<body>
    {html_content}
</body>
</html>"""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(full_html)

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Uso: python exporter.py <formato> <input_file> <output_file>")
        sys.exit(1)

    format_type = sys.argv[1]
    input_file = sys.argv[2]
    output_file = sys.argv[3]

    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()

    try:
        if format_type == 'docx':
            export_to_docx(content, output_file)
        elif format_type == 'xlsx':
            export_to_xlsx(content, output_file)
        elif format_type == 'html':
            export_to_html(content, output_file)
        else:
            print(f"Formato no soportado: {format_type}")
            sys.exit(1)
        print(f"Exportación exitosa a {output_file}")
    except Exception as e:
        print(f"Error en exportación: {str(e)}")
        sys.exit(1)
