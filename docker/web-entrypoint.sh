#!/bin/sh
set -eu

PUBLIC_HOST="${PUBLIC_HOST:-localhost}"
PORT="${PORT:-3210}"
SITE_PROXY_PORT="${SITE_PROXY_PORT:-3211}"

export PUBLIC_HOST PORT SITE_PROXY_PORT
export VITE_CONVEX_URL="http://${PUBLIC_HOST}:${PORT}"
export VITE_CONVEX_SITE_URL="http://${PUBLIC_HOST}:${SITE_PROXY_PORT}"
export VITE_AUTH_PASSWORD_ENABLED="${VITE_AUTH_PASSWORD_ENABLED:-true}"
export VITE_SELF_HOSTED="${VITE_SELF_HOSTED:-true}"

envsubst '${VITE_CONVEX_URL} ${VITE_CONVEX_SITE_URL} ${VITE_AUTH_PASSWORD_ENABLED} ${VITE_SELF_HOSTED}' \
  < /self-host-env.template.js \
  > /usr/share/nginx/html/self-host-env.js

exec /docker-entrypoint.sh "$@"
