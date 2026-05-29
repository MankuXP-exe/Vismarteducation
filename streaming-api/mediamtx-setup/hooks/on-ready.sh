#!/bin/bash
# /opt/vi-smart/hooks/on-ready.sh
# Called when a stream is published and ready

PATH_NAME="$MTX_PATH"
echo "[$(date)] OnReady: Stream ready: $PATH_NAME" >> /opt/vi-smart/logs/hooks.log

# Notify the streaming API that a live class has started streaming
curl -s -X POST http://127.0.0.1:3001/record/start \
  -H "Content-Type: application/json" \
  -H "x-api-secret: ${VPS_API_SECRET:-replace_with_long_random_secret}" \
  -d "{\"roomName\":\"$PATH_NAME\",\"liveClassId\":\"\",\"batchId\":\"\"}" \
  >> /opt/vi-smart/logs/hooks.log 2>&1 || true
