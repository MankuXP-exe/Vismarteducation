#!/bin/bash
# /opt/vi-smart/hooks/on-not-ready.sh
# Called when a stream stops

PATH_NAME="$MTX_PATH"
echo "[$(date)] OnNotReady: Stream ended: $PATH_NAME" >> /opt/vi-smart/logs/hooks.log
