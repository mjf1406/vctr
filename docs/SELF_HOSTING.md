# Self-hosting (local Docker)

Run the app on your machine with **no Convex Cloud, Polar, or Google OAuth**. Auth is email/password only. Billing is disabled.

Clone-and-run and Portainer both use the same root [`docker-compose.yml`](../docker-compose.yml). Images for `web` and `deploy` are **built on the host**.

## Defaults

| Service             | URL                         |
| ------------------- | --------------------------- |
| App                 | http://`<PUBLIC_HOST>`:8088 |
| Convex API          | http://`<PUBLIC_HOST>`:3210 |
| Convex HTTP actions | http://`<PUBLIC_HOST>`:3211 |
| Convex dashboard    | http://`<PUBLIC_HOST>`:6791 |

Data persists in the Docker volume `convex-data`.

## `PUBLIC_HOST`

Hostname or LAN IP that **browsers** use to reach the server (not a Docker service name).

| Where you open the app    | `PUBLIC_HOST`       |
| ------------------------- | ------------------- |
| Same machine as Docker    | `localhost`         |
| Other devices on your LAN | e.g. `192.168.1.50` |

## Option A — Clone and run

Requires Docker Compose v2 and enough RAM to build (see below).

```bash
git clone <your-fork-or-repo-url>
cd <repo>
cp .env.docker.example .env   # set PUBLIC_HOST if needed
docker compose up -d --build
```

```bash
docker compose logs -f deploy
docker compose logs -f web
docker compose down             # stop (keeps volume)
docker compose down -v          # stop and wipe data
```

## Option B — Portainer

1. Stacks → **Add stack** → **Repository**
2. Repository URL: `https://github.com/mjf1406/vctr`
3. Repository Reference: `refs/heads/master`
4. Compose path: `docker-compose.yml`
5. Environment variables — at least `PUBLIC_HOST` if not using localhost only (see [`.env.docker.example`](../.env.docker.example))
6. Deploy and wait for the `web` **build** and `deploy` one-shot to finish
7. Open `http://<PUBLIC_HOST>:8088` and create an email/password account

Default app port is **8088** (8080 is often used by qBittorrent and similar). Override with `WEB_PORT` if needed.

### Clean rebuild after compose/Dockerfile changes

Portainer often reuses old layers/images. If a deploy fails or you pulled new git commits:

1. Remove the stack (keep the volume if you want data).
2. Optionally prune unused build cache/images on the host:

   ```bash
   docker builder prune -f
   docker image prune -f
   ```

3. Redeploy the stack so `web` / `deploy` rebuild from the current Dockerfile.

Deleting unused images frees **disk** and forces a clean rebuild — do that after Dockerfile changes.

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

Portainer names the project from the stack name (e.g. `classclarus`), so plain `docker compose exec` from your home directory often fails with “no configuration file provided”. Prefer the container name:

```bash
sudo docker exec classclarus-backend-1 cat /convex/data/admin_key
```

Or pass the Portainer project/stack name:

```bash
sudo docker compose -p classclarus exec backend cat /convex/data/admin_key
```

(If you used `docker compose` from a local clone, `docker compose exec backend cat /convex/data/admin_key` works inside that directory.)

Paste that key into http://`<PUBLIC_HOST>`:6791 when prompted.
