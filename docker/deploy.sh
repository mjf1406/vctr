#!/usr/bin/env bash
set -euo pipefail

ADMIN_KEY_FILE="/convex/data/admin_key"
AUTH_KEYS_FILE="/convex/data/auth_keys.json"
MARKER_FILE="/convex/data/.deploy_complete"

PUBLIC_HOST="${PUBLIC_HOST:-localhost}"
WEB_PORT="${WEB_PORT:-8088}"
SITE_URL="http://${PUBLIC_HOST}:${WEB_PORT}"

if [ ! -s "${ADMIN_KEY_FILE}" ]; then
  echo "Missing admin key at ${ADMIN_KEY_FILE}" >&2
  exit 1
fi

export CONVEX_SELF_HOSTED_URL="${CONVEX_SELF_HOSTED_URL:-http://backend:3210}"
export CONVEX_SELF_HOSTED_ADMIN_KEY
CONVEX_SELF_HOSTED_ADMIN_KEY="$(tr -d '\r\n' < "${ADMIN_KEY_FILE}")"

wait_for_backend() {
  echo "Waiting for Convex backend at ${CONVEX_SELF_HOSTED_URL}..."
  for _ in $(seq 1 60); do
    if bun -e "const r=await fetch('${CONVEX_SELF_HOSTED_URL}/version'); if(!r.ok) process.exit(1)" 2>/dev/null; then
      return 0
    fi
    sleep 2
  done
  echo "Backend did not become ready" >&2
  exit 1
}

set_env() {
  local key="$1"
  local value="$2"
  # stdin keeps secrets / long JWKS out of process listings
  printf '%s' "${value}" | bunx convex env set "${key}"
}

wait_for_backend
cd /app

# Non-interactive (Portainer / compose one-shot)
export CI=true

echo "Deploying Convex functions..."
bunx convex deploy --typecheck try

echo "Setting self-host Convex env..."
set_env SELF_HOSTED true
set_env SITE_URL "${SITE_URL}"

if [ ! -s "${AUTH_KEYS_FILE}" ]; then
  echo "Generating auth JWT keys..."
  bun docker/generate-auth-keys.mjs > "${AUTH_KEYS_FILE}"
  chmod 600 "${AUTH_KEYS_FILE}"
fi

JWT_PRIVATE_KEY="$(bun -e "const k=await Bun.file('${AUTH_KEYS_FILE}').json(); process.stdout.write(k.jwtPrivateKey)")"
JWKS="$(bun -e "const k=await Bun.file('${AUTH_KEYS_FILE}').json(); process.stdout.write(k.jwks)")"

set_env JWT_PRIVATE_KEY "${JWT_PRIVATE_KEY}"
set_env JWKS "${JWKS}"

touch "${MARKER_FILE}"
echo "Self-host deploy complete. App: ${SITE_URL}"
