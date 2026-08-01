# Self-hosting (local Docker)

Run the app on your machine with **no Convex Cloud, Polar, or Google OAuth**. Auth is email/password only. Billing is disabled.

Clone-and-run and Portainer both use the same root [`docker-compose.yml`](../docker-compose.yml).

## Defaults

| Service             | URL                   |
| ------------------- | --------------------- |
| App                 | http://localhost:8080 |
| Convex API          | http://localhost:3210 |
| Convex HTTP actions | http://localhost:3211 |
| Convex dashboard    | http://localhost:6791 |

Data persists in the Docker volume `convex-data`.

## Option A — Clone and run

Requires [Docker](https://docs.docker.com/get-docker/) with Compose v2.

```bash
git clone <your-fork-or-repo-url>
cd <repo>
# optional: cp .env.docker.example .env
docker compose up -d --build
```

First boot builds images, starts Convex, deploys functions, then serves the SPA. Open http://localhost:8080 and create an account.

Useful commands:

```bash
docker compose logs -f deploy   # function deploy
docker compose logs -f backend
docker compose down             # stop (keeps volume)
docker compose down -v          # stop and wipe data
```

## Option B — Portainer

1. Environments → **local** → **Stacks** → **Add stack**
2. Build method: **Repository**
3. **Repository URL**: your GitHub clone URL (public → leave Authentication off)
4. **Repository reference**: `refs/heads/main` (or a release tag)
5. **Compose path**: `docker-compose.yml`
6. Optional: paste variables from [`.env.docker.example`](../.env.docker.example) into **Environment variables**
7. Deploy the stack

Wait until the `deploy` service finishes successfully, then open http://localhost:8080.

`pull_policy: build` is set on buildable services so Portainer rebuilds images when the stack updates.

If a previous deploy failed mid-build, remove the stack (keep the volume if you want data) and redeploy so `web`/`deploy` rebuild cleanly.

### Build fails with exit code 134

Not an `.env` problem. Exit 134 means the SPA build was killed (usually low Docker RAM). Defaults in compose are enough for localhost.

1. Confirm Portainer **Repository reference** is the branch that has these Docker files (e.g. `refs/heads/docker`), not `main`/`master` if the stack only lives on a feature branch.
2. Push the latest commit, then redeploy so Portainer rebuilds (not a cached failed layer).
3. Give Docker Desktop (or the engine) at least **6–8 GB RAM**, then redeploy.

The image build disables React Compiler and runs Vite+ under Node with an 8 GB heap cap.

## Changing host or ports

Vite bakes Convex URLs at **image build** time. After changing `PUBLIC_HOST` or ports in `.env` / Portainer:

```bash
docker compose up -d --build
```

`PUBLIC_HOST` must be the hostname your **browser** uses (usually `localhost`), not a Docker service name.

## Instance secret

`INSTANCE_NAME` and `INSTANCE_SECRET` identify the Convex instance. Changing them after the first start invalidates the admin key and can strand data. The compose default secret is for **local-only** use. For any shared or exposed host, set a fresh secret (`openssl rand -hex 32`) before the first start.

## What differs from cloud

|          | Cloud                      | Self-host                   |
| -------- | -------------------------- | --------------------------- |
| Backend  | Convex Cloud               | Convex in Docker            |
| Auth     | Google (optional password) | Password only               |
| Billing  | Polar + trial              | Always entitled / Polar off |
| SPA host | e.g. Cloudflare Pages      | nginx in Compose            |

## Dashboard admin key

```bash
docker compose exec backend cat /convex/data/admin_key
```

Paste that key into http://localhost:6791 when prompted.
