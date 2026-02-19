#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_DIR="$ROOT_DIR/.run"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

API_PORT="${API_PORT:-5050}"
WEB_PORT="${WEB_PORT:-5173}"
DB_NAME="${DB_NAME:-civic_issues}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-$USER}"
JWT_SECRET="${JWT_SECRET:-replace-with-strong-secret}"

mkdir -p "$RUN_DIR"

info() {
  printf '[start-all] %s\n' "$*"
}

fail() {
  printf '[start-all] %s\n' "$*" >&2
  exit 1
}

is_pid_running() {
  local pid="$1"
  kill -0 "$pid" >/dev/null 2>&1
}

find_psql_bin() {
  if [[ -n "${PSQL_BIN:-}" && -x "${PSQL_BIN}" ]]; then
    printf '%s\n' "$PSQL_BIN"
    return
  fi

  if [[ -x "/opt/homebrew/opt/postgresql@16/bin/psql" ]]; then
    printf '%s\n' "/opt/homebrew/opt/postgresql@16/bin/psql"
    return
  fi

  if command -v psql >/dev/null 2>&1; then
    command -v psql
    return
  fi

  fail "psql not found. Install PostgreSQL (for example: brew install postgresql@16)."
}

upsert_env() {
  local file="$1"
  local key="$2"
  local value="$3"
  local temp

  touch "$file"

  if grep -q "^${key}=" "$file"; then
    temp="$(mktemp)"
    awk -F= -v k="$key" -v v="$value" 'BEGIN { OFS="=" } $1 == k { $0 = k OFS v } { print }' "$file" > "$temp"
    mv "$temp" "$file"
  else
    printf '%s=%s\n' "$key" "$value" >> "$file"
  fi
}

wait_for_http() {
  local url="$1"
  local attempts="${2:-40}"

  for ((i=1; i<=attempts; i++)); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done

  return 1
}

ensure_postgres() {
  local psql_bin="$1"
  local createdb_bin="${psql_bin%/psql}/createdb"

  if ! "$psql_bin" -h "$DB_HOST" -p "$DB_PORT" -d postgres -tAc "SELECT 1" >/dev/null 2>&1; then
    if command -v brew >/dev/null 2>&1; then
      info "Starting postgresql@16 via brew services"
      brew services start postgresql@16 >/dev/null 2>&1 || true
      sleep 2
    fi
  fi

  "$psql_bin" -h "$DB_HOST" -p "$DB_PORT" -d postgres -tAc "SELECT 1" >/dev/null 2>&1 || fail "PostgreSQL is not reachable on ${DB_HOST}:${DB_PORT}."

  local db_exists
  db_exists="$($psql_bin -h "$DB_HOST" -p "$DB_PORT" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | tr -d '[:space:]')"

  if [[ "$db_exists" != "1" ]]; then
    info "Creating database ${DB_NAME}"
    if [[ -x "$createdb_bin" ]]; then
      "$createdb_bin" -h "$DB_HOST" -p "$DB_PORT" "$DB_NAME"
    elif command -v createdb >/dev/null 2>&1; then
      createdb -h "$DB_HOST" -p "$DB_PORT" "$DB_NAME"
    else
      "$psql_bin" -h "$DB_HOST" -p "$DB_PORT" -d postgres -c "CREATE DATABASE \"${DB_NAME}\";"
    fi
  fi

  info "Applying schema and seed"
  "$psql_bin" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -f "$BACKEND_DIR/sql/schema.sql" >/dev/null
  "$psql_bin" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -f "$BACKEND_DIR/sql/seed.sql" >/dev/null
}

ensure_env_files() {
  local db_url="postgresql://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

  if [[ ! -f "$BACKEND_DIR/.env" ]]; then
    cp "$BACKEND_DIR/.env.example" "$BACKEND_DIR/.env"
  fi

  upsert_env "$BACKEND_DIR/.env" "PORT" "$API_PORT"
  upsert_env "$BACKEND_DIR/.env" "DATABASE_URL" "$db_url"
  upsert_env "$BACKEND_DIR/.env" "JWT_SECRET" "$JWT_SECRET"
  upsert_env "$BACKEND_DIR/.env" "CLIENT_ORIGIN" "http://localhost:${WEB_PORT}"

  if [[ ! -f "$FRONTEND_DIR/.env" ]]; then
    cp "$FRONTEND_DIR/.env.example" "$FRONTEND_DIR/.env"
  fi

  upsert_env "$FRONTEND_DIR/.env" "VITE_API_URL" "http://localhost:${API_PORT}"
  upsert_env "$FRONTEND_DIR/.env" "VITE_SOCKET_URL" "http://localhost:${API_PORT}"
}

ensure_dependencies() {
  if [[ ! -d "$BACKEND_DIR/node_modules" ]]; then
    info "Installing backend dependencies"
    (cd "$BACKEND_DIR" && npm install)
  fi

  if [[ ! -d "$FRONTEND_DIR/node_modules" ]]; then
    info "Installing frontend dependencies"
    (cd "$FRONTEND_DIR" && npm install)
  fi
}

start_process() {
  local name="$1"
  local workdir="$2"
  local command="$3"
  local pid_file="$4"
  local log_file="$5"

  if [[ -f "$pid_file" ]]; then
    local existing_pid
    existing_pid="$(cat "$pid_file")"
    if is_pid_running "$existing_pid"; then
      info "${name} already running (pid ${existing_pid})"
      return 0
    fi
    rm -f "$pid_file"
  fi

  info "Starting ${name}"
  (
    cd "$workdir"
    nohup bash -lc "$command" > "$log_file" 2>&1 &
    echo $! > "$pid_file"
  )

  sleep 1

  local started_pid
  started_pid="$(cat "$pid_file")"

  if ! is_pid_running "$started_pid"; then
    tail -n 60 "$log_file" >&2 || true
    fail "Failed to start ${name}."
  fi

  info "${name} started (pid ${started_pid})"
}

main() {
  local psql_bin
  psql_bin="$(find_psql_bin)"

  ensure_postgres "$psql_bin"
  ensure_env_files
  ensure_dependencies

  start_process "backend" "$BACKEND_DIR" "npm run dev" "$RUN_DIR/backend.pid" "$RUN_DIR/backend.log"
  wait_for_http "http://127.0.0.1:${API_PORT}/health" 50 || fail "Backend did not become healthy."

  start_process "frontend" "$FRONTEND_DIR" "npm run dev -- --host 0.0.0.0 --port ${WEB_PORT}" "$RUN_DIR/frontend.pid" "$RUN_DIR/frontend.log"
  wait_for_http "http://127.0.0.1:${WEB_PORT}" 50 || fail "Frontend did not become reachable."

  info "All services are running"
  info "Frontend: http://localhost:${WEB_PORT}"
  info "Backend:  http://localhost:${API_PORT}"
  info "Logs:     $RUN_DIR/backend.log, $RUN_DIR/frontend.log"
}

main "$@"
