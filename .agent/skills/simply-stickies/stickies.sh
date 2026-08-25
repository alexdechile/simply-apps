#!/bin/bash
# stickies.sh — Helper CLI para gestionar stickies de Simply Apps
# Uso: ./stickies.sh [list|resolve <id>|show <id>]

STICKIES_FILE="archivos/stickies.json"
API_URL="http://localhost:1717/api/stickies"

if [ ! -f "$STICKIES_FILE" ]; then
  echo "[]" > "$STICKIES_FILE"
fi

case "${1:-list}" in
  list)
    echo ""
    echo "📌 STICKIES PENDIENTES — Simply Apps"
    echo "====================================="
    python3 -c "
import json, sys
with open('$STICKIES_FILE') as f:
    stickies = json.load(f)
pending = [s for s in stickies if not s.get('resolved', False)]
if not pending:
    print('✅ No hay stickies pendientes.')
else:
    for i, s in enumerate(pending, 1):
        print(f\"\\n{i}. [{s['nodeLabel']}] — {s['id']}\")
        print(f\"   📝 {s['text']}\")
        print(f\"   🕐 {s.get('createdAt','?')[:10]}\")
print(f'\\nTotal: {len(pending)} pendiente(s)')
"
    ;;

  show)
    ID="${2:-}"
    if [ -z "$ID" ]; then echo "Uso: $0 show <sticky_id>"; exit 1; fi
    python3 -c "
import json
with open('$STICKIES_FILE') as f:
    stickies = json.load(f)
s = next((x for x in stickies if x['id'] == '$ID'), None)
if not s:
    print('❌ Sticky no encontrado: $ID')
else:
    print(json.dumps(s, indent=2, ensure_ascii=False))
"
    ;;

  resolve)
    ID="${2:-}"
    if [ -z "$ID" ]; then echo "Uso: $0 resolve <sticky_id>"; exit 1; fi
    python3 -c "
import json
from datetime import datetime, timezone
with open('$STICKIES_FILE') as f:
    stickies = json.load(f)
found = False
for s in stickies:
    if s['id'] == '$ID':
        s['resolved'] = True
        s['updatedAt'] = datetime.now(timezone.utc).isoformat()
        found = True
        break
if not found:
    print('❌ Sticky no encontrado: $ID')
    exit(1)
with open('$STICKIES_FILE', 'w') as f:
    json.dump(stickies, f, indent=2, ensure_ascii=False)
print('✅ Sticky marcado como resuelto: $ID')
"
    ;;

  unresolve)
    ID="${2:-}"
    if [ -z "$ID" ]; then echo "Uso: $0 unresolve <sticky_id>"; exit 1; fi
    python3 -c "
import json
from datetime import datetime, timezone
with open('$STICKIES_FILE') as f:
    stickies = json.load(f)
for s in stickies:
    if s['id'] == '$ID':
        s['resolved'] = False
        s['updatedAt'] = datetime.now(timezone.utc).isoformat()
        break
with open('$STICKIES_FILE', 'w') as f:
    json.dump(stickies, f, indent=2, ensure_ascii=False)
print('🔄 Sticky reabierto: $ID')
"
    ;;

  all)
    python3 -c "
import json
with open('$STICKIES_FILE') as f:
    stickies = json.load(f)
print(json.dumps(stickies, indent=2, ensure_ascii=False))
"
    ;;

  *)
    echo "Uso: $0 [list|show <id>|resolve <id>|unresolve <id>|all]"
    ;;
esac
