# Smoke Test Report (Production Mode)

Target: http://localhost:8000  
Date: 2026-01-13

## Commands used

```bash
# Start server (production)
PORT=8000 NODE_ENV=production node backend/server.js

# 1) Health
curl -sS -D - http://localhost:8000/healthz -o /tmp/healthz.json

# 2) Homepage
curl -sS -D - http://localhost:8000/ -o /tmp/home.html

# 3) Create session
curl -sS -D - -X POST http://localhost:8000/api/sessions -o /tmp/session_create.json

# 4) Valid move
SID=$(python - <<'PY'
import json
print(json.load(open('/tmp/session_create.json'))['id'])
PY
)
curl -sS -D - -X POST "http://localhost:8000/api/sessions/$SID/moves" \
  -H 'Content-Type: application/json' \
  --data '{"index":0}' \
  -o /tmp/move1.json

# 5) Invalid move (same cell twice)
curl -sS -D - -X POST "http://localhost:8000/api/sessions/$SID/moves" \
  -H 'Content-Type: application/json' \
  --data '{"index":0}' \
  -o /tmp/move_invalid.json
```

## Results (Checklist)

- [PASS] Health endpoint returns `ok:true` (`GET /healthz` -> `200`, `{"ok":true,"env":"production"}`)
- [PASS] Homepage loads (`GET /` -> `200`) and contains `<div id="root"></div>`
- [PASS] Create session works (`POST /api/sessions` -> `201`) and returns an `id`
- [PASS] Valid first move accepted (`POST /api/sessions/:id/moves` with `{"index":0}` -> `200`) and returns updated state (`moveCount: 1`, `board[0] = "X"`)
- [PASS] Invalid move rejected (same cell twice) (`POST /moves` with `{"index":0}` again -> `400`) with `{"error":"Cell is already taken","code":"CELL_TAKEN"}`
