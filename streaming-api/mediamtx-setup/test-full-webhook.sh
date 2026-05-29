#!/bin/bash
# Full end-to-end webhook test
echo "Testing stream-ended webhook..."
RESULT=$(curl -s -X POST http://127.0.0.1:3001/webhooks/stream-ended \
  -H "Content-Type: application/json" \
  -d '{"path":"live/class-683999c3-4512-4981-b4a4-b5c28786bdfc","secret":"mtx_webhook_ViSmart2026"}')
echo "Webhook response: $RESULT"

echo ""
echo "Waiting for recording processing..."
sleep 10

echo ""
echo "=== Latest API logs ==="
journalctl -u vi-smart-api --since '20 sec ago' --no-pager 2>/dev/null | grep -i 'MediaMTX\|record\|lecture\|chapter' | tail -10

echo ""
echo "=== Recording files ==="
ls -la /opt/vi-smart/recordings/live/live/class-683999c3-4512-4981-b4a4-b5c28786bdfc/
