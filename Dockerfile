# syntax=docker/dockerfile:1

# --- Deploy: push Convex functions + set self-host env -----------------
FROM oven/bun:1.3.14 AS deploy

WORKDIR /app

COPY package.json bun.lock ./
COPY patches ./patches
RUN bun install --frozen-lockfile --ignore-scripts

COPY convex ./convex
COPY tsconfig.json tsconfig.app.json tsconfig.node.json ./
COPY docker/deploy.sh docker/generate-auth-keys.mjs ./docker/
RUN chmod +x /app/docker/deploy.sh

ENTRYPOINT ["/app/docker/deploy.sh"]

# --- Web deps (bun lockfile) -------------------------------------------
FROM oven/bun:1.3.14 AS web-deps

WORKDIR /app

COPY package.json bun.lock ./
COPY patches ./patches
RUN bun install --frozen-lockfile --ignore-scripts

# --- Web build under real Node so --max-old-space-size applies ---------
# bunx in the bun image often runs the Vite+ CLI via Bun, which ignores
# NODE_OPTIONS and aborts with exit 134 (SIGABRT) under low Docker RAM.
FROM node:22-bookworm-slim AS web-build

WORKDIR /app

COPY --from=web-deps /app/node_modules ./node_modules
COPY package.json bun.lock ./
COPY . .

ARG VITE_CONVEX_URL=http://localhost:3210
ARG VITE_CONVEX_SITE_URL=http://localhost:3211
ARG VITE_AUTH_PASSWORD_ENABLED=true
ARG VITE_SELF_HOSTED=true

ENV VITE_CONVEX_URL=$VITE_CONVEX_URL \
    VITE_CONVEX_SITE_URL=$VITE_CONVEX_SITE_URL \
    VITE_AUTH_PASSWORD_ENABLED=$VITE_AUTH_PASSWORD_ENABLED \
    VITE_SELF_HOSTED=$VITE_SELF_HOSTED \
    NODE_ENV=production \
    DISABLE_REACT_COMPILER=true \
    NODE_OPTIONS=--max-old-space-size=8192 \
    UV_THREADPOOL_SIZE=2

RUN node node_modules/vite-plus/bin/vp build

FROM nginx:1.27-alpine AS web

ARG PUBLIC_HOST=localhost
ARG PORT=3210
ARG SITE_PROXY_PORT=3211

COPY docker/nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=web-build /app/dist /usr/share/nginx/html

ENV PUBLIC_HOST=$PUBLIC_HOST \
    PORT=$PORT \
    SITE_PROXY_PORT=$SITE_PROXY_PORT \
    NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d

EXPOSE 80
