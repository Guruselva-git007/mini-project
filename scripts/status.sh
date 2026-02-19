#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_DIR="$ROOT_DIR/.run"

API_PORT="${API_PORT:-5050}"
WEB_PORT="${WEB_PORT:-5173}"

service_state() {
  local name="$1"
  local pid_file="$2"
  local port="$3"

  if [[ -f "$pid_file" ]]; then
    local pid
    pid="$(cat "$pid_file")"
    if kill -0 "$pid" >/dev/null 2>&1; then
      printf '%s: running (pid %s, port %s)\n' "$name" "$pid" "$port"
      return 0
    fi
    printf '%s: stale pid file (%s), process not running\n' "$name" "$pid"
    return 0
  fi

  local owner
  owner="$(lsof -iTCP:"$port" -sTCP:LISTEN -n -P 2>/dev/null | awk 'NR==2 {print $1" pid=" $2}' || true)"
  if [[ -n "$owner" ]]; then
    printf '%s: listening on port %s by %s (not script-managed)\n' "$name" "$port" "$owner"
  else
    printf '%s: stopped\n' "$name"
  fi
}

postgres_state() {
  local psql_bin=""

  if [[ -x "/opt/homebrew/opt/postgresql@16/bin/psql" ]]; then
    psql_bin="/opt/homebrew/opt/postgresql@16/bin/psql"
  elif command -v psql >/dev/null 2>&1; then
    psql_bin="$(command -v psql)"
  fi

  if [[ -z "$psql_bin" ]]; then
    printf 'postgres: psql not found\n'
    return 0
  fi

  if "$psql_bin" -h 127.0.0.1 -p 5432 -d postgres -tAc "SELECT 1" >/dev/null 2>&1; then
    printf 'postgres: running on 127.0.0.1:5432\n'
  else
    printf 'postgres: not reachable\n'
  fi
}

main() {
  postgres_state
  service_state "backend" "$RUN_DIR/backend.pid" "$API_PORT"
  service_state "frontend" "$RUN_DIR/frontend.pid" "$WEB_PORT"
}

main "$@"
