# Electron classroom app

Downloadable desktop build for teachers. It runs the **same self-host mode** as [SELF_HOSTING.md](./SELF_HOSTING.md) (password auth, Polar off, local Convex), without Docker. The installer / Task Manager name comes from [`APP_CONFIG.name`](../convex/appConfig.ts) (currently **vctr**).

Students join from a normal browser on the **same Wi‑Fi**. They do not install Electron.

## Downloads

Billing Free card → [`APP_CONFIG.downloadUrl`](../convex/appConfig.ts) → GitHub **Releases / latest**:

`https://github.com/mjf1406/vctr/releases/latest`

CI (`.github/workflows/electron-release.yml`) builds Windows, macOS (Apple Silicon), and Linux on version tags `v*` and publishes installers. Artifact names are `${APP_CONFIG.name}-…` via [`electron-builder.config.mjs`](../electron-builder.config.mjs):

| Platform | Artifact (with current `APP_CONFIG.name`)                   |
| -------- | ----------------------------------------------------------- |
| Windows  | `vctr-Setup-Windows.exe`                                    |
| macOS    | `vctr-macOS.dmg` (install) / `vctr-macOS.zip` (auto-update) |
| Linux    | `vctr-Linux.AppImage`                                       |

Each release also attaches electron-updater feed files (`latest.yml`, `latest-mac.yml`, `latest-linux.yml`) and `.blockmap` files so installed apps can check for updates.

Direct latest asset URLs (optional):

`https://github.com/mjf1406/vctr/releases/latest/download/<artifact-name>`

## Auto-updates

Packaged builds use `electron-updater` against GitHub Releases:

1. Shortly after the classroom server is running, the app checks for a newer release.
2. If found, it downloads in the background.
3. When ready, teachers get a restart dialog (also **Settings → Updates**).

Dev (`electron:dev`) does not check the network for updates.

**macOS:** auto-update requires a **code-signed** build (`CSC_*` secrets). Unsigned mac builds still install from the DMG, but in-app updates will fail until signing is configured. Windows (NSIS) and Linux (AppImage) update from the public release feed without signing.

## Teacher flow

1. Install and open the app (allows Windows Firewall prompts for the app / ports). A splash window appears while the local Convex backend starts and deploys (first launch can take a minute).
2. Wait until the classroom banner shows **running** and a LAN URL.
3. Create an account (email/password).
4. Create a class and a join code; open the projector display or share the QR (uses the LAN URL).
5. Students on the same Wi‑Fi open that URL, create accounts, and redeem the code.

## Network notes

- Guest Wi‑Fi / client isolation blocks student join.
- If DHCP changes the teacher IP, refresh the join link / QR from the banner.
- Use only trusted school or home networks.

## Local development

```bash
bun scripts/download-convex-backend.mjs
bun run electron:dev
```

`electron:dev` starts Vite on **`0.0.0.0:8088`** (LAN-reachable) and the Electron shell. The shell spawns `convex-local-backend` on **3210/3211**, runs the shared bootstrap (`scripts/self-host-bootstrap.mjs`), and exposes `window.classroom` IPC for LAN join URLs.

Allow Windows Firewall prompts for Bun/Node on ports **8088**, **3210**, and **3211** (or add inbound rules). Guest Wi‑Fi / client isolation will still block phones.

## Release

The first downloadable build requires creating a GitHub Release via CI (there are no pre-built binaries until you do this once). Tag the commit that contains the release workflow (current `master`), not an older SHA:

```bash
git checkout master
git pull
git tag -f v0.1.0
git push origin v0.1.0 --force
```

Or Actions → **Electron Release** → Run workflow → version `0.1.0` (no leading `v`). That builds Windows, macOS (Apple Silicon), and Linux, then attaches the installers to the release.

macOS builds are unsigned unless you add Apple notarization secrets (`CSC_*`); users may need to bypass Gatekeeper once. Auto-update on macOS also requires those signing secrets.
