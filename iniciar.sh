#!/bin/bash

# Script para iniciar el servidor y abrir el navegador
# Guardar como: iniciar.sh

PORT=1717

# Cambiar al directorio donde está el script
cd "$(dirname "$0")"

# Matar cualquier servidor anterior en el mismo puerto (forma agresiva para asegurar actualización)
echo "Limpiando procesos anteriores..."
fuser -k $PORT/tcp 2>/dev/null
pkill -9 -f "node server.js" 2>/dev/null
sleep 2

echo "Iniciando servidor Express en puerto $PORT..."
node server.js &
SERVER_PID=$!

# Esperar a que el servidor esté listo
echo "Esperando que el servidor esté listo..."
sleep 3

# Abrir el navegador
echo "Abriendo navegador..."
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:$PORT"
elif command -v gnome-open &> /dev/null; then
    gnome-open "http://localhost:$PORT"
elif command -v kde-open &> /dev/null; then
    kde-open "http://localhost:$PORT"
else
    echo "No se pudo detectar el comando para abrir el navegador."
    echo "Por favor abre manualmente: http://localhost:$PORT"
fi

echo ""
echo "Servidor corriendo en http://localhost:$PORT"
echo "Presiona Ctrl+C para detener el servidor"
echo ""

# Mantener el script corriendo para que el servidor siga activo
wait $SERVER_PID
