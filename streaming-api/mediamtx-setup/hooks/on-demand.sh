#!/bin/bash
# /opt/vi-smart/hooks/on-demand.sh
# Called when a subscriber connects to a path

PATH_NAME="$MTX_PATH"
echo "[$(date)] OnDemand: Client connected to $PATH_NAME" >> /opt/vi-smart/logs/hooks.log
