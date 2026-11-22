#!/usr/bin/env bash
# Проверка ответов сервера сайта (спека 0002): fallback, кэш, 503 на /api/, заголовки безопасности.
# Одна и та же для CI (локальный контейнер) и после выкатки (снаружи, через Traefik):
#   deploy/smoke.sh http://localhost:8080 --version 0.0.0-ci
#   deploy/smoke.sh https://atomic.example.com --version 0.2.0 --behind-backend
# --behind-backend — /api/ отдаёт бэкенд, проверка 503 пропускается.
set -euo pipefail

usage() { echo "usage: $0 <base-url> [--version X.Y.Z] [--behind-backend]" >&2; exit 2; }

base="${1:-}"; [[ -n "$base" ]] || usage; shift
base="${base%/}"
version=""
behind_backend=0
while (($#)); do
  case "$1" in
    --version) version="${2:-}"; [[ -n "$version" ]] || usage; shift 2 ;;
    --behind-backend) behind_backend=1; shift ;;
    *) usage ;;
  esac
done

failures=0
fail() { echo "FAIL: $*" >&2; failures=$((failures + 1)); }
ok() { echo "ok:   $*"; }

tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

# fetch <path> — заголовки в $tmp/h (имена в нижнем регистре), тело в $tmp/b, код в $code
fetch() {
  code="$(curl -sS -o "$tmp/b" -D "$tmp/h.raw" -w '%{http_code}' "$base$1")"
  tr -d '\r' < "$tmp/h.raw" | awk -F': ' 'NF>1 { $1 = tolower($1) } 1' OFS=': ' > "$tmp/h"
}
header() { grep -i "^$1: " "$tmp/h" | head -1 | cut -d' ' -f2- || true; }

expect_code() {
  if [[ "$code" == "$2" ]]; then ok "$1 → $code"; else fail "$1 → $code, ожидался $2"; fi
}
expect_header() { # path name substring
  local v; v="$(header "$2")"
  if [[ "$v" == *"$3"* ]]; then ok "$1: $2 содержит «$3»"; else fail "$1: $2 = «$v», ожидалось «$3»"; fi
}
expect_security_headers() {
  expect_header "$1" content-security-policy "default-src 'none'"
  expect_header "$1" content-security-policy "script-src 'self'"
  expect_header "$1" content-security-policy "frame-ancestors 'none'"
  expect_header "$1" x-content-type-options nosniff
  expect_header "$1" referrer-policy same-origin
  expect_header "$1" permissions-policy "camera=()"
  local server; server="$(header server)"
  if [[ "$server" =~ [0-9] ]]; then fail "$1: Server раскрывает версию: «$server»"; else ok "$1: Server без версии"; fi
}

# Сервер поднимается — ждём до 30 с. Дальше без повторов: curl --retry повторял бы и ожидаемый 503.
for _ in $(seq 30); do
  curl -fsS -o /dev/null "$base/" 2>/dev/null && break
  sleep 1
done

# Главная и неизвестный адрес — index.html без кэша
for path in / /nope /folders/123; do
  fetch "$path"
  expect_code "$path" 200
  expect_header "$path" content-type text/html
  expect_header "$path" cache-control no-cache
  if grep -q '<div id="root">' "$tmp/b"; then ok "$path: это index.html"; else fail "$path: в ответе нет #root"; fi
  expect_security_headers "$path"
done

# Файл бандла — из ответа /, кэш на год
fetch /
asset="$(grep -oE '/assets/[^"]+\.js' "$tmp/b" | head -1 || true)"
if [[ -z "$asset" ]]; then
  fail "в index.html нет ссылки на /assets/*.js"
else
  fetch "$asset"
  expect_code "$asset" 200
  expect_header "$asset" cache-control immutable
  expect_header "$asset" content-type javascript
  expect_security_headers "$asset"
fi

# Иконка вкладки — файл, а не index.html (без файла fallback отдал бы index.html с кодом 200)
fetch /favicon-light.svg
expect_code /favicon-light.svg 200
expect_header /favicon-light.svg content-type image/svg+xml
if grep -q '<svg' "$tmp/b"; then ok "/favicon-light.svg: это SVG"; else fail "/favicon-light.svg: в ответе нет <svg"; fi

# Несуществующий файл бандла — 404, не index.html
fetch /assets/nope.js
expect_code /assets/nope.js 404
expect_security_headers /assets/nope.js

# /api/ без бэкенда — 503
if ((behind_backend)); then
  echo "skip: /api/ отдаёт бэкенд (--behind-backend)"
else
  fetch /api/v1/me
  expect_code /api/v1/me 503
  expect_security_headers /api/v1/me
fi

if [[ -n "$version" ]]; then
  fetch /version.txt
  expect_code /version.txt 200
  running="$(tr -d '[:space:]' < "$tmp/b")"
  if [[ "$running" == "$version" ]]; then ok "версия $running"; else fail "версия «$running», ожидалась $version"; fi
fi

if ((failures)); then
  echo "smoke: не прошло проверок: $failures" >&2
  exit 1
fi
echo "smoke: всё в порядке"
