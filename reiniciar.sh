#!/bin/bash

# Script para reiniciar el servidor de Simply Apps sin abrir el navegador de nuevo
# Creado para hacer la pega más rápida

PORT=1717

# Asegurarse de estar en el directorio correcto
cd "$(dirname "$0")"

echo "Limpiando procesos anteriores..."
fuser -k $PORT/tcp 2>/dev/null
pkill -9 -f "node server.js" 2>/dev/null
sleep 2

echo "Iniciando servidor Express en puerto $PORT..."
node server.js &
SERVER_PID=$!

echo ""
echo "¡Servidor reiniciado con éxito!"
echo "Corriendo en http://localhost:$PORT"
echo "Presiona Ctrl+C para detener el servidor"
echo ""

# Mantener el script corriendo para ver los logs en la terminal
wait $SERVER_PID
