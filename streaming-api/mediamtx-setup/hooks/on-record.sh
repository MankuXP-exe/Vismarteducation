#!/bin/bash
# /opt/vi-smart/hooks/on-record.sh
# Called when a recording segment is created

PATH_NAME="$MTX_PATH"
RECORD_FILE="$MTX_RECORD_PATH"
echo "[$(date)] OnRecord: Recorded segment for $PATH_NAME -> $RECORD_FILE" >> /opt/vi-smart/logs/hooks.log
