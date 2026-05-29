#!/bin/bash
# Vi Smart Health Check & Auto-Heal
LOG_FILE=/var/log/vi-smart-health.log
log() { echo "$(date '+%Y-%m-%d %H:%M:%S') $1" >> "$LOG_FILE"; }

# Check vi-smart-api (systemd)
if ! systemctl is-active --quiet vi-smart-api; then
  log 'vi-smart-api DOWN - restarting via systemd'
  systemctl restart vi-smart-api 2>&1 >> "$LOG_FILE"
fi

# Check MediaMTX (systemd)
if ! systemctl is-active --quiet mediamtx; then
  log 'mediamtx DOWN - restarting via systemd'
  systemctl restart mediamtx 2>&1 >> "$LOG_FILE"
fi

# Check nginx
if ! systemctl is-active --quiet nginx; then
  log 'nginx DOWN - restarting'
  systemctl restart nginx 2>&1 >> "$LOG_FILE"
fi

# Check disk space (warn if >85%)
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | tr -d '%')
if [ "$DISK_USAGE" -gt 85 ]; then
  log "WARNING: Disk at ${DISK_USAGE}%"
fi

log 'Health check completed'
