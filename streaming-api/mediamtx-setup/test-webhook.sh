#!/bin/bash
# Test the stream-ended webhook
curl -s -X POST http://127.0.0.1:3001/webhooks/stream-ended \
  -H "Content-Type: application/json" \
  -d '{"path":"live/test","secret":"mtx_webhook_ViSmart2026"}'
echo ""
echo "---"
# Test the stream-started webhook
curl -s -X POST http://127.0.0.1:3001/webhooks/stream-started \
  -H "Content-Type: application/json" \
  -d '{"path":"live/test","secret":"mtx_webhook_ViSmart2026"}'
echo ""
