#!/bin/bash
# Watchdog for the realtime service — restarts it if it dies
cd /home/z/my-project/mini-services/realtime

while true; do
  if ! curl -s http://localhost:3003/health > /dev/null 2>&1; then
    echo "[$(date)] Realtime service down — restarting..."
    pkill -f "bun.*realtime/index" 2>/dev/null
    sleep 1
    nohup bun index.ts < /dev/null > /tmp/realtime.log 2>&1 &
    disown
    sleep 3
    if curl -s http://localhost:3003/health > /dev/null 2>&1; then
      echo "[$(date)] Realtime service restarted successfully"
    else
      echo "[$(date)] Realtime service failed to start"
    fi
  fi
  sleep 10
done
