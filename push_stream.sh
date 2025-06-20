#!/bin/bash

SERVER_IP="100.73.246.9"
LOG_FILE="srt_stream_$(date +%Y%m%d_%H%M%S).log"

# Function to log messages with timestamp
log_message() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Create log file and write header
log_message "Starting SRT stream forwarding"
log_message "Server IP: $SERVER_IP"

CAMERAS=(
  "192.168.0.101 5001 6001 1234567890"
  "192.168.0.102 5002 6002 1234567890"
  "192.168.0.103 5003 6003 1234567890"
  "192.168.0.104 5004 6004 1234567890"
  "192.168.0.105 5005 6005 1234567890"
  "192.168.0.106 5006 6006 1234567890"
  "192.168.0.107 5007 6007 no"
  "192.168.0.108 5008 6008 no"
  "192.168.0.109 5009 6009 no"
  "192.168.0.110 5010 6010 no"
)

for cam in "${CAMERAS[@]}"; do
  read -r LOCAL_IP LOCAL_PORT SERVER_PORT PASSPHRASE <<< "$cam"

  if [[ "$PASSPHRASE" == "no" ]]; then
    SRC="srt://$LOCAL_IP:$LOCAL_PORT"
  else
    SRC="srt://$LOCAL_IP:$LOCAL_PORT?passphrase=$PASSPHRASE"
  fi

  DST="srt://$SERVER_IP:$SERVER_PORT"

  log_message "Starting stream: $SRC → $DST"
  
  # Run srt-live-transmit with error logging
  srt-live-transmit "$SRC" "$DST" 2> >(while read -r line; do
    log_message "[$LOCAL_IP:$LOCAL_PORT] $line"
  done) &
  
  # Store the PID for later use
  PIDS+=($!)
done

# Function to handle cleanup
cleanup() {
    log_message "Received termination signal. Cleaning up..."
    for pid in "${PIDS[@]}"; do
        kill $pid 2>/dev/null
    done
    log_message "Cleanup complete"
    exit 0
}

# Set up trap for cleanup
trap cleanup SIGINT SIGTERM

# Wait for all background processes
wait

log_message "All streams completed"
