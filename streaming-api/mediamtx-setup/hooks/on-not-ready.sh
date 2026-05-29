#!/bin/bash
# /opt/vi-smart/hooks/on-not-ready.sh
# Called by MediaMTX when a stream ends

PATH_NAME="${1:-$MTX_PATH}"
SECRET="mtx_webhook_ViSmart2026"

curl -s -X POST http://127.0.0.1:3001/webhooks/stream-ended \
  -H "Content-Type: application/json" \
  -d "{\"path\":\"${PATH_NAME}\",\"secret\":\"${SECRET}\"}" \
  >> /opt/vi-smart/logs/hooks.log 2>&1

echo "[$(date)] on-not-ready: ${PATH_NAME}" >> /opt/vi-smart/logs/hooks.log
