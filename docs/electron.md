# Electron classroom app

Downloadable desktop build of ClassClarus for teachers. It runs the **same self-host mode** as [SELF_HOSTING.md](./SELF_HOSTING.md) (password auth, Polar off, local Convex), without Docker.

Students join from a normal browser on the **same Wi‑Fi**. They do not install Electron.

## Downloads

Billing Free card → [`APP_CONFIG.downloadUrl`](../convex/appConfig.ts) → GitHub **Releases / latest**:

`https://github.com/mjf1406/vctr/releases/latest`

CI (`.github/workflows/electron-release.yml`) builds Windows, macOS (Apple Silicon), and Linux on version tags `v*` and publishes installers with stable names:

| Platform | Artifact                        |
| -------- | ------------------------------- |
| Windows  | `ClassClarus-Setup-Windows.exe` |
| macOS    | `ClassClarus-macOS.dmg`         |
| Linux    | `ClassClarus-Linux.AppImage`    |

Direct latest asset URLs (optional):

`https://github.com/mjf1406/vctr/releases/latest/download/<artifact-name>`

## Teacher flow

1. Install and open the app (allows Windows Firewall prompts for the app / ports).
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

```bash
git tag v0.1.0
git push origin v0.1.0
```

Or run the **Electron Release** workflow manually. macOS builds are unsigned unless you add Apple notarization secrets (`CSC_*`); users may need to bypass Gatekeeper once.
