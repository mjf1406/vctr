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

# --- Web: build SPA then serve with nginx ------------------------------
FROM oven/bun:1.3.14 AS web-build

WORKDIR /app

COPY package.json bun.lock ./
COPY patches ./patches
RUN bun install --frozen-lockfile --ignore-scripts

COPY . .

ARG VITE_CONVEX_URL=http://localhost:3210
ARG VITE_CONVEX_SITE_URL=http://localhost:3211
ARG VITE_AUTH_PASSWORD_ENABLED=true
ARG VITE_SELF_HOSTED=true

ENV VITE_CONVEX_URL=$VITE_CONVEX_URL \
    VITE_CONVEX_SITE_URL=$VITE_CONVEX_SITE_URL \
    VITE_AUTH_PASSWORD_ENABLED=$VITE_AUTH_PASSWORD_ENABLED \
    VITE_SELF_HOSTED=$VITE_SELF_HOSTED

RUN bunx tsc -b && bunx vite build

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
