#!/bin/bash
# /opt/vi-smart/hooks/on-ready.sh
# Called by MediaMTX when a stream is published

PATH_NAME="${1:-$MTX_PATH}"
SECRET="mtx_webhook_ViSmart2026"

curl -s -X POST http://127.0.0.1:3001/webhooks/stream-started \
  -H "Content-Type: application/json" \
  -d "{\"path\":\"${PATH_NAME}\",\"secret\":\"${SECRET}\"}" \
  >> /opt/vi-smart/logs/hooks.log 2>&1

echo "[$(date)] on-ready: ${PATH_NAME}" >> /opt/vi-smart/logs/hooks.log
