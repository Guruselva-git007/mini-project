#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_DIR="$ROOT_DIR/.run"

info() {
  printf '[stop-all] %s\n' "$*"
}

is_pid_running() {
  local pid="$1"
  kill -0 "$pid" >/dev/null 2>&1
}

stop_process() {
  local name="$1"
  local pid_file="$2"

  if [[ ! -f "$pid_file" ]]; then
    info "${name} not running (no pid file)"
    return 0
  fi

  local pid
  pid="$(cat "$pid_file")"

  if ! is_pid_running "$pid"; then
    info "${name} already stopped"
    rm -f "$pid_file"
    return 0
  fi

  info "Stopping ${name} (pid ${pid})"
  kill "$pid" >/dev/null 2>&1 || true

  for _ in {1..40}; do
    if ! is_pid_running "$pid"; then
      rm -f "$pid_file"
      info "${name} stopped"
      return 0
    fi
    sleep 0.25
  done

  info "Force killing ${name} (pid ${pid})"
  kill -9 "$pid" >/dev/null 2>&1 || true
  rm -f "$pid_file"
}

main() {
  stop_process "frontend" "$RUN_DIR/frontend.pid"
  stop_process "backend" "$RUN_DIR/backend.pid"
}

main "$@"
