#!/bin/bash
###############################################
# Quick MediaMTX Health Check
# Run: bash check-mediamtx.sh
###############################################

echo "=== MediaMTX Status ==="
systemctl status mediamtx --no-pager 2>/dev/null || echo "MediaMTX not running as service"

echo ""
echo "=== MediaMTX Version ==="
/usr/local/bin/mediamtx --version 2>/dev/null || echo "MediaMTX not found"

echo ""
echo "=== Listening Ports ==="
ss -tlnp | grep -E '(8554|1935|8888|8889|9997)' || echo "No MediaMTX ports listening"

echo ""
echo "=== Nginx Status ==="
systemctl status nginx --no-pager 2>/dev/null | head -5

echo ""
echo "=== Nginx Test ==="
nginx -t 2>&1

echo ""
echo "=== SSL Certs ==="
ls -la /etc/letsencrypt/live/ 2>/dev/null || echo "No SSL certs found"

echo ""
echo "=== Recording Directory ==="
du -sh /opt/vi-smart/recordings/ 2>/dev/null || echo "No recordings directory"
ls /opt/vi-smart/recordings/ 2>/dev/null | head -10 || echo "(empty)"

echo ""
echo "=== Hook Logs ==="
tail -10 /opt/vi-smart/logs/hooks.log 2>/dev/null || echo "No hook logs"

echo ""
echo "=== UFW Status ==="
ufw status 2>/dev/null || echo "UFW not available"

echo ""
echo "=== Disk Space ==="
df -h / | tail -1
