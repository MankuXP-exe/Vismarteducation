#!/bin/bash
# Fix MediaMTX - kill all old processes, remove old script, start via systemd

echo "Stopping mediamtx service..."
systemctl stop mediamtx

echo "Killing all mediamtx processes..."
for pid in $(ps aux | awk '/mediamtx/ && !/awk/ && !/fix-mediamtx/ {print $2}'); do
  kill -9 "$pid" 2>/dev/null
done

echo "Killing old start-mediamtx.sh..."
for pid in $(ps aux | awk '/start-mediamtx/ && !/awk/ {print $2}'); do
  kill -9 "$pid" 2>/dev/null
done

sleep 3

echo "Removing old script..."
rm -f /opt/vi-smart/start-mediamtx.sh
rm -f /opt/vi-smart/start-mediamtx.sh.disabled

echo "Resetting systemd..."
systemctl reset-failed mediamtx 2>/dev/null
systemctl daemon-reload

echo "Verifying ports are free..."
ss -ulnp | grep 8890 && echo "WARNING: 8890 still in use!" || echo "Port 8890 is free"
ss -tlnp | grep 8889 && echo "WARNING: 8889 still in use!" || echo "Port 8889 is free"

echo "Starting mediamtx..."
systemctl start mediamtx
sleep 3

echo "Status:"
systemctl is-active mediamtx
echo "Ports:"
ss -ulnp | grep mediamtx
ss -tlnp | grep mediamtx
