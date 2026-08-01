# vctr

[![AI Level 3](https://ai-level.dev/badge/standard/3.svg)](https://ai-level.dev/level-3)

Vite+ / React / Convex app **template**. Package manager is **bun** only.

**ClassClarus** (classroom CRUD, members, join codes, teacher/student roles) is a **worked example**, not the product. Keep the platform patterns; replace the nouns when cloning for another domain.

| Keep (platform)                                      | Example domain (replace)                                     |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| Auth, theme, toasts, forms, empty/error/pending      | `classes`, members, join codes, class sidebar                |
| i18n plumbing + `common` / `auth` namespaces         | Classroom copy (`footerTagline`, invite/member strings)      |
| Optimistic hooks, rate limiter, authz wiring         | `convex/lib/authzModel.ts` resources/roles                   |
| `convex/appConfig.ts` + `public/brand/`              | Schema tables tied to classes; feature routes under `_class` |
| UI kit under `src/components/ui/` + `/ui` playground | Role badges / people pages for classroom roles               |

> **Convention for agents:** anything named `class` / classroom roles is sample product code. Keep the _patterns_ (scoped authz, optimistic hooks, invite codes); replace the _nouns_.

**Fork intent:** a ClassClarus-style product can keep most of step 9 (classroom domain). Other products (e.g. a hexcrawl manager) should smoke-test auth on the example UI first, then reshape or remove that domain.

Toolchain notes also live in [`AGENTS.md`](./AGENTS.md) (`vp install`, `vp check`, `vp test`).

**Self-host (local Docker, no cloud):** end-user runbook is [`docs/SELF_HOSTING.md`](./docs/SELF_HOSTING.md). When cloning this template, rewrite the VCTR-specific bits there — see clone checklist **step 10**.

**Electron (downloadable classroom host):** [`docs/electron.md`](./docs/electron.md) — same self-host mode, bundled Convex, LAN join for students. Releases from tags `v*` via `.github/workflows/electron-release.yml`.

---

## Prerequisites

- [Bun](https://bun.sh) — this repo pins Bun via `package.json` → `devEngines.packageManager` (currently `1.3.14`; `onFail: "download"` will fetch a matching Bun when the engine check runs).
- [Vite+](https://viteplus.dev/guide/) CLI (`vp`) — install globally if `vp` is missing (`bun install -g vite-plus` or follow the Vite+ docs). `prepare` runs `vp config` after install.
- Convex account ([dashboard](https://dashboard.convex.dev))
- Google Cloud project (if keeping Google sign-in)
- Polar account ([polar.sh](https://polar.sh)) if keeping billing (sandbox for local/dev)

---

## Clone checklist (do in order)

Copy this into a PR/issue and check items off. Paths are relative to the repo root.

### 1. Create the repo

- [ ] Clone or fork this template into a **new** git remote (do not share the template’s Convex deployment).
- [ ] Do **not** copy `.env`, `.env.local`, or any real secrets from another machine.
- [ ] Rename the package: set `"name"` in [`package.json`](./package.json) (currently `"vctr"`).
- [ ] This template is **MIT** licensed ([`LICENSE.md`](./LICENSE.md)). If you want a different license for your clone, update `LICENSE.md` (and any package/`APP_CONFIG` legal links that still assume MIT).
- [ ] Optional: update the placeholder `<title>` in [`index.html`](./index.html) (currently `vctr`) — or leave it until branding (step 7) if you set titles from `APP_CONFIG` later.

### 2. Install dependencies

```bash
vp install
# or: bun install
```

- [ ] `vp install` / `bun install` completed with no errors.

### 3. Create a **new** Convex project (required)

This template already has Convex functions under [`convex/`](./convex/). You still need a **fresh** deployment for the clone.

```bash
bunx convex dev
```

- [ ] Logged into Convex when prompted.
- [ ] Chose **create a new project** (not the template’s existing deployment).
- [ ] Confirmed [`.env.local`](./.env.local) was written/updated with at least:
  - `CONVEX_DEPLOYMENT=…`
  - `VITE_CONVEX_URL=https://….convex.cloud`
  - `VITE_CONVEX_SITE_URL=https://….convex.site`
- [ ] Left `bunx convex dev` running (or use `vp run ds` which starts web + Convex via [`vite.config.ts`](./vite.config.ts) tasks `dev:web` / `dev:convex`).

Schema and components are already wired:

- Schema: [`convex/schema.ts`](./convex/schema.ts) (includes `authTables`)
- Components: [`convex/convex.config.ts`](./convex/convex.config.ts) (`@djpanda/convex-authz`, `@convex-dev/rate-limiter`, `@convex-dev/polar`)
- HTTP auth + Polar webhook routes: [`convex/http.ts`](./convex/http.ts) → `auth.addHttpRoutes` + `polar.registerRoutes` (`/polar/events`)
- Client: [`src/main.tsx`](./src/main.tsx) (`VITE_CONVEX_URL`, `ConvexAuthProvider`)

### 4. Initialize Convex Auth on **this** deployment

Auth source files already exist ([`convex/auth.ts`](./convex/auth.ts), [`convex/auth.config.ts`](./convex/auth.config.ts)). The new deployment still needs signing keys and `SITE_URL`.

```bash
bunx @convex-dev/auth
```

When prompted:

- [ ] Set **`SITE_URL`** to your local Vite origin (usually `http://localhost:5173`). This is the SPA URL users return to after OAuth — **not** the Convex `.cloud` / `.site` URL.
- [ ] Allow generation of **`JWT_PRIVATE_KEY`** and **`JWKS`** on the new deployment (overwrite if the CLI asks and this deployment is brand new).
- [ ] Skip regenerating auth source files if the CLI detects existing `convex/auth.ts` / `auth.config.ts` (keep this template’s versions).

Verify on the Convex dashboard → **Settings → Environment Variables** (or `bunx convex env list`):

| Variable          | Where             | Purpose                                                                                        |
| ----------------- | ----------------- | ---------------------------------------------------------------------------------------------- |
| `SITE_URL`        | Convex deployment | Post-auth redirect base for the SPA                                                            |
| `JWT_PRIVATE_KEY` | Convex deployment | Token signing (from `@convex-dev/auth`)                                                        |
| `JWKS`            | Convex deployment | Public JWKS (from `@convex-dev/auth`)                                                          |
| `CONVEX_SITE_URL` | Convex (auto)     | HTTP Actions / OAuth callback host; used in [`convex/auth.config.ts`](./convex/auth.config.ts) |

Production later: `bunx @convex-dev/auth --prod` and set provider secrets on the **prod** deployment.

### 5. Google OAuth (Convex deployment + Google Cloud)

Provider is already registered in [`convex/auth.ts`](./convex/auth.ts) (`providers: [Google]`). Secrets are read by Auth.js as **`AUTH_GOOGLE_ID`** / **`AUTH_GOOGLE_SECRET`** — not `GOOGLE_CLIENT` / `GOOGLE_SECRET`.

1. Google Cloud Console → APIs & Services → **OAuth consent screen** (configure app name/logo to match the new brand).
2. **Credentials** → Create **OAuth client ID** (Web application).
3. **Authorized JavaScript origins** (examples):
   - `http://localhost:5173`
   - production SPA origin (same as `APP_CONFIG.appUrl` later)
4. **Authorized redirect URIs** — must be exactly:

   ```text
   {CONVEX_SITE_URL}/api/auth/callback/google
   ```

   Use the value of `VITE_CONVEX_SITE_URL` from `.env.local` (same host Convex uses as `CONVEX_SITE_URL`), e.g. `https://happy-animal-123.convex.site/api/auth/callback/google`.

5. Push credentials to the **Convex deployment** (not Vite):

```bash
bunx convex env set AUTH_GOOGLE_ID "<client-id>.apps.googleusercontent.com"
bunx convex env set AUTH_GOOGLE_SECRET "<client-secret>"
```

- [ ] `AUTH_GOOGLE_ID` set on this deployment
- [ ] `AUTH_GOOGLE_SECRET` set on this deployment
- [ ] Redirect URI matches `{CONVEX_SITE_URL}/api/auth/callback/google`
- [ ] Optional local notes only: copy key **names** into [`.env.example`](./.env.example) / your private `.env` — Vite does not need the secret. Optional public client id label vars (`VITE_GOOGLE_CLIENT_ID`, …) are unused by Convex Auth.

UI entry points:

- Button: [`src/components/auth/SignInWithGoogle.tsx`](./src/components/auth/SignInWithGoogle.tsx)
- Assets: [`public/google/light_sign_in.png`](./public/google/light_sign_in.png), [`public/google/dark_sign_in.png`](./public/google/dark_sign_in.png) (Google brand buttons — usually leave as-is)
- Login route: [`src/routes/_public/login.tsx`](./src/routes/_public/login.tsx)

#### Optional: password auth (cloud)

Password is registered in [`convex/auth.ts`](./convex/auth.ts). To show the UI in cloud/dev:

- [ ] Set `VITE_AUTH_PASSWORD_ENABLED=true` in `.env.local`.

Self-host Docker enables password auth automatically (Google/Polar off). See [`docs/SELF_HOSTING.md`](./docs/SELF_HOSTING.md).

### 6. Billing (Polar)

Subscriptions use [`@convex-dev/polar`](https://www.npmjs.com/package/@convex-dev/polar). The billing UI is [`src/routes/_authenticated/_app/billing.tsx`](./src/routes/_authenticated/_app/billing.tsx). Trial length is app-managed (card-less) via [`convex/appConfig.ts`](./convex/appConfig.ts) `trial` — Polar checkout has **no** Polar-native trial.

1. Create a [Polar](https://polar.sh) organization (use **sandbox** while developing).
2. Create two **subscription** products (no trial on the product). Example amounts used by this template’s billing copy:
   - Monthly: **USD 3** / month
   - Yearly: **USD 30** / year

   If you choose different prices, update Polar **and** the display strings `billing.monthlyPrice` / `billing.yearlyPrice` in **every** locale under [`src/i18n/resources/`](./src/i18n/resources/) (prices are not read from Polar for the UI cards).

3. Create an organization access token with at least: `products:read/write`, `subscriptions:read/write`, `customers:read/write`, `checkouts:read/write`, `checkout_links:read/write`, `customer_portal:read/write`, `customer_sessions:write`.
4. Create a webhook pointing at your **Convex HTTP Actions** host (not your SPA):

   ```text
   {CONVEX_SITE_URL}/polar/events
   ```

   Example: `https://happy-animal-123.convex.site/polar/events`

   Enable events: `product.created`, `product.updated`, `subscription.created`, `subscription.updated`.

5. Push secrets to the **Convex deployment** (selected by `POLAR_SERVER` in [`convex/lib/polarEnv.ts`](./convex/lib/polarEnv.ts)):

```bash
bunx convex env set POLAR_SERVER sandbox
bunx convex env set POLAR_SANDBOX_ACCESS_TOKEN "<sandbox-org-token>"
bunx convex env set POLAR_SANDBOX_WEBHOOK_SECRET "<sandbox-webhook-secret>"
bunx convex env set POLAR_PRODUCT_MONTHLY_ID "<polar-monthly-product-id>"
bunx convex env set POLAR_PRODUCT_YEARLY_ID "<polar-yearly-product-id>"
```

For production later, set `POLAR_SERVER=production` and `POLAR_ACCESS_TOKEN` / `POLAR_WEBHOOK_SECRET` (same product ID vars, or separate products).

6. Grant yourself the global `app_admin` role (needed for `polar:syncProducts` / billing health). Sign in once, copy your `users._id` from the Convex dashboard, then run:

   ```powershell
   # PowerShell (escape inner quotes)
   bunx convex run lib/admin:grantAppAdmin '{\"userId\":\"<convex-user-id>\"}'
   ```

   ```bash
   # bash / zsh
   bunx convex run lib/admin:grantAppAdmin '{"userId":"<convex-user-id>"}'
   ```

7. Sync products and confirm health (run as the signed-in `app_admin` user — Dashboard → Functions with that identity, or CLI if your auth context is set):

   ```bash
   bunx convex run polar:syncProducts
   bunx convex run polar:billingHealth
   ```

   Expect `billingHealth` presence flags for access token, webhook secret, and both product IDs to be `true`, and `server` to match `POLAR_SERVER` (`sandbox` while developing).

8. Checkout success / portal return URLs are built server-side from `SITE_URL` + `/billing` — **do not** pass client URLs.

- [ ] Sandbox products created (template example: $3/mo, $30/yr, no Polar trial — or your prices + matching i18n)
- [ ] If prices differ from $3/$30: updated `billing.monthlyPrice` / `billing.yearlyPrice` in all locales
- [ ] Webhook → `{CONVEX_SITE_URL}/polar/events` with the four events above
- [ ] Convex env vars set (`POLAR_SERVER`, sandbox token/secret, both product IDs)
- [ ] Optional: adjust trial length in `APP_CONFIG.trial` (`days`, `warnWithinDays`, `forceWithinDays`)
- [ ] Granted `app_admin` via `lib/admin:grantAppAdmin`
- [ ] Ran `polar:syncProducts` and verified `polar:billingHealth`

### 7. Branding (`APP_CONFIG` + assets)

Canonical config (imported by the SPA via [`src/config/app.ts`](./src/config/app.ts)):

**Edit every field in [`convex/appConfig.ts`](./convex/appConfig.ts):**

| Field                                   | Used for                                                                                                                                                                                                                                                                     |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                                  | Display name; i18n `{{appName}}` via [`src/i18n/index.ts`](./src/i18n/index.ts) `defaultVariables`                                                                                                                                                                           |
| `slug`                                  | Product id for browser storage keys via [`src/lib/storageKeys.ts`](./src/lib/storageKeys.ts) (`${slug}-language`, `${slug}-ui-theme`, …); comment also mentions package-name check                                                                                           |
| `titleSuffix`                           | Intended document title suffix (`Name \| suffix`) — keep in sync if you wire titles to config                                                                                                                                                                                |
| `appUrl`                                | Canonical app origin (share/deep links; join URLs also use `window.location` in [`src/lib/invitations/joinCodes.ts`](./src/lib/invitations/joinCodes.ts))                                                                                                                    |
| `marketingUrl`                          | Footer / login / unauthorized “learn more” links                                                                                                                                                                                                                             |
| `privacyUrl` / `termsUrl` / `cookieUrl` | Legal links on login + footer                                                                                                                                                                                                                                                |
| `changeLog` / `roadMap` / `github`      | Footer product links ([`src/components/navigation/AppFooter.tsx`](./src/components/navigation/AppFooter.tsx))                                                                                                                                                                |
| `downloadUrl` / `selfHostUrl`           | Billing Free card links. Prefer `downloadUrl` → `…/releases/latest` (Electron CI). **Change `selfHostUrl` when cloning** — default [`docs/SELF_HOSTING.md`](https://github.com/mjf1406/vctr/blob/master/docs/SELF_HOSTING.md). See [`docs/electron.md`](./docs/electron.md). |
| `authzTenantId`                         | Authz tenant in [`convex/authz.ts`](./convex/authz.ts) — **set before first real authz data**; changing later requires rematerializing                                                                                                                                       |
| `themeColors` / `backgroundColors`      | Hex browser-chrome targets (keep aligned with CSS `--background` in [`src/style.css`](./src/style.css))                                                                                                                                                                      |
| `trial`                                 | App-managed card-less trial: `days`, `warnWithinDays`, `forceWithinDays` (banner timing; not a Polar product trial)                                                                                                                                                          |
| `uploads`                               | Per-user `quotaBytes` and per-preset `maxSizeBytes` (images / documents / audio)                                                                                                                                                                                             |

- [ ] All `APP_CONFIG` fields updated for the new product (including `downloadUrl`, `selfHostUrl`, `trial`, `uploads`)
- [ ] `authzTenantId` is a stable new id (not `classclarus`)

**Replace brand image files** (paths are hard-coded in [`src/components/brand/Logo.tsx`](./src/components/brand/Logo.tsx) and error routes — keep filenames or update imports):

| File                                                                                                   | Used by                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`public/brand/logo/icon-and-text-horizontal.webp`](./public/brand/logo/icon-and-text-horizontal.webp) | `Logo`, `LogoBig`                                                                                                                                          |
| [`public/brand/logo/icon-above-text.webp`](./public/brand/logo/icon-above-text.webp)                   | `LogoAboveText` (footer)                                                                                                                                   |
| [`public/brand/logo/icon-688.webp`](./public/brand/logo/icon-688.webp)                                 | `Icon`                                                                                                                                                     |
| [`public/brand/logo/icon-86.webp`](./public/brand/logo/icon-86.webp)                                   | `LogoXS`                                                                                                                                                   |
| [`public/brand/logo/text.webp`](./public/brand/logo/text.webp)                                         | `TextLogo`                                                                                                                                                 |
| [`public/brand/error/404.webp`](./public/brand/error/404.webp)                                         | [`src/routes/_public/$.tsx`](./src/routes/_public/$.tsx), [`src/components/errors/RootErrorComponent.tsx`](./src/components/errors/RootErrorComponent.tsx) |
| [`public/brand/error/403.webp`](./public/brand/error/403.webp)                                         | [`src/routes/_public/unauthorized.tsx`](./src/routes/_public/unauthorized.tsx)                                                                             |
| [`public/favicon.svg`](./public/favicon.svg)                                                           | [`index.html`](./index.html) `<link rel="icon">`                                                                                                           |

- [ ] All brand assets replaced (or intentionally kept)
- [ ] Favicon updated

**Product voice (i18n)** — start in [`src/i18n/resources/en.ts`](./src/i18n/resources/en.ts), then **every** locale under [`src/i18n/resources/`](./src/i18n/resources/) (`de`, `es`, `fr`, `it`, `ja`, `ko`, `nl`, `pt`, `ru`, `th`, `uk`, `zhs`, `zht`). `engb` reuses `en`.

Minimum branding strings:

- [ ] `common.footerTagline` (ClassClarus classroom line today)
- [ ] Any other product-specific keys you introduce (catalog is enforced by [`src/i18n/entityNoun.test.ts`](./src/i18n/entityNoun.test.ts))

**Browser storage keys** — derived automatically from `APP_CONFIG.slug` in [`src/lib/storageKeys.ts`](./src/lib/storageKeys.ts) (language, theme, pending join code, trial-banner dismiss). The FOUC theme bootstrap in [`index.html`](./index.html) is filled by Vite from the same slug (`%APP_THEME_STORAGE_KEY%` → `${slug}-ui-theme`). Changing `slug` is enough; old keys (`vite-ui-theme`, `vctr:…`) are not migrated.

- [ ] `APP_CONFIG.slug` set for the new product (storage keys follow)

### 8. Theme (shadcn)

This project already has shadcn configured:

- Config: [`components.json`](./components.json) (`style`: `base-maia`, CSS: `src/style.css`, `baseColor`: `neutral`)
- Tokens: [`src/style.css`](./src/style.css) (`:root` / `.dark` CSS variables, Inter / JetBrains Mono imports)
- Agent skill: [`.agents/skills/shadcn/SKILL.md`](./.agents/skills/shadcn/SKILL.md)

Apply a new preset **without** blowing away custom UI components:

```bash
# Inspect current preset
bunx --bun shadcn@latest preset resolve

# Theme + fonts only (recommended when cloning)
bunx --bun shadcn@latest apply <preset-code> --only theme,font

# Or full apply (overwrites detected components — review diffs carefully)
# bunx --bun shadcn@latest apply <preset-code>
```

- [ ] New theme/font applied (or confirmed keeping current tokens)
- [ ] [`src/style.css`](./src/style.css) light/dark `--background` still matches `APP_CONFIG.themeColors` / `backgroundColors` hex values
- [ ] Spot-check primary / sidebar tokens in light and dark mode

Adding components later: `bunx --bun shadcn@latest add <component>` (aliases already match [`components.json`](./components.json)).

### 9. Reshape the example domain

Do this **after** auth + branding. Recommended order:

1. Finish steps 3–8 and smoke-test Google sign-in on the **ClassClarus example** UI (step 11 checklist for login/brand/theme).
2. Only then reshape or remove the classroom domain for a different product.
3. ClassClarus-style clones can **keep** most of this step and only retarget brand/URLs/prices.

**Authz model (example roles):** [`convex/lib/authzModel.ts`](./convex/lib/authzModel.ts)  
Frontend permission helpers: [`src/lib/permissions/classPermissions.ts`](./src/lib/permissions/classPermissions.ts)  
Authz client: [`convex/authz.ts`](./convex/authz.ts) (`tenantId: APP_CONFIG.authzTenantId`)

**Uploads / files**

- Enabled presets today: **images** and **audio** only ([`convex/lib/uploadPresets.ts`](./convex/lib/uploadPresets.ts)). The `documents` preset definitions and PDF/OLE/txt sniffers remain in code but are **rejected server-side** until OOXML validation (e.g. `[Content_Types].xml` inside ZIP) is solid; bare ZIP/`PK` magic is rejected.
- Class library: `files:create` = **owner / teacher** (not assistant_teacher); `files:read` = all class members (role-scoped, so students can load banners); rename/delete stay **uploader ownership**. After changing the role catalog, rematerialize via [`convex/authzBackfill.ts`](./convex/authzBackfill.ts).

**Backend example modules:**

- [`convex/schema.ts`](./convex/schema.ts) — `classes`, `joinCodes`, `userSettings`
- [`convex/classes.ts`](./convex/classes.ts)
- [`convex/members.ts`](./convex/members.ts)
- [`convex/joinCodes.ts`](./convex/joinCodes.ts)
- [`convex/lib/joinCodesCleanup.ts`](./convex/lib/joinCodesCleanup.ts)
- [`convex/lib/rateLimiter.ts`](./convex/lib/rateLimiter.ts) (class/join-code limit names)
- [`convex/authzBackfill.ts`](./convex/authzBackfill.ts) (class-owner backfill)

**Frontend example surface:**

- Routes under [`src/routes/_authenticated/_class/`](./src/routes/_authenticated/_class/) and home/join under [`src/routes/_authenticated/_app/`](./src/routes/_authenticated/_app/)
- Components: `src/components/classes/`, `src/components/members/`, `src/components/invitations/`, class sidebar under `src/components/navigation/class-sidebar/`
- Hooks: `src/hooks/classes/`, `src/hooks/members/`, `src/hooks/invitations/`
- Libs: `src/lib/classes/`, `src/lib/members/`, `src/lib/invitations/`, `src/lib/auth/pendingJoinCode.ts`
- i18n feature namespaces in `src/i18n/resources/*.ts` (`classes`, invitations, etc.)

Checklist:

- [ ] Redefined permissions/roles in `authzModel.ts` for the new domain
- [ ] Replaced or removed example tables/functions/routes/components
- [ ] Updated rate-limit names and any CRON/cleanup jobs
- [ ] Trimmed or rewrote feature i18n keys in **all** locales + `REQUIRED_KEYS` coverage via tests
- [ ] Removed ClassClarus-specific footer/legal URLs if not applicable

### 10. Self-hosting docs (update when cloning)

Operators follow [`docs/SELF_HOSTING.md`](./docs/SELF_HOSTING.md). That file currently names **this** template’s GitHub remote and uses **ClassClarus**-style Portainer examples — change them for your product so forks are not pointed at `mjf1406/vctr`.

**In [`docs/SELF_HOSTING.md`](./docs/SELF_HOSTING.md), replace:**

| What                                         | Template today                            | Your clone                                                                  |
| -------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------- |
| Portainer **Repository URL**                 | `https://github.com/mjf1406/vctr`         | Your fork/remote HTTPS URL                                                  |
| Portainer **Repository reference**           | `refs/heads/master`                       | Your default branch (e.g. `refs/heads/main`)                                |
| Admin-key examples (`docker exec …`, `-p …`) | `classclarus-backend-1`, `-p classclarus` | Names from **your** Portainer stack (stack name → project/container prefix) |

Keep the rest of the runbook (ports, `PUBLIC_HOST`, prune/rebuild, instance secret) unless you change compose defaults.

**Related files (not in that doc, but match your brand/repo):**

| File                                           | Change                                                                      |
| ---------------------------------------------- | --------------------------------------------------------------------------- |
| [`docker-compose.yml`](./docker-compose.yml)   | Top-level `name:` (currently `vctr`) — local Compose project name           |
| [`example.env`](./example.env)                 | `PUBLIC_HOST`, `INSTANCE_NAME` (new `INSTANCE_SECRET` for non-toy installs) |
| [`convex/appConfig.ts`](./convex/appConfig.ts) | `selfHostUrl` / `downloadUrl` / `github` → your repo or docs                |

**Alert — change `APP_CONFIG.selfHostUrl` when cloning.** The billing “Self-host” button currently points at this template’s docs:

`https://github.com/mjf1406/vctr/blob/master/docs/SELF_HOSTING.md`

Point it at **your** fork’s `docs/SELF_HOSTING.md` (or equivalent) so users are not sent to `mjf1406/vctr`.

- [ ] `docs/SELF_HOSTING.md` Portainer URL + branch updated for this remote
- [ ] Admin-key examples use your stack/project name (or a clear `<stack>` placeholder)
- [ ] Compose `name:` / `INSTANCE_NAME` match the new product (or left intentional)
- [ ] `APP_CONFIG.selfHostUrl` updated to your clone’s self-host docs URL (not `mjf1406/vctr`)

### 11. Run and verify

Prefer verifying login/brand/theme on the example app **before** a large step-9 domain rewrite.

```bash
# Terminal A — Convex (if not already running)
bunx convex dev

# Terminal B — web
vp dev
# or both via: vp run ds
```

- [ ] App loads against the **new** `VITE_CONVEX_URL`
- [ ] Google sign-in completes (consent → redirect → authenticated shell)
- [ ] Brand name/logo/favicon/tagline look correct
- [ ] Theme looks correct in light and dark
- [ ] Billing page loads products after `polar:syncProducts` (signed-in `app_admin` can re-check `polar:billingHealth`)
- [ ] Spot-check UI primitives at `/ui` (auth required) — [`src/routes/_authenticated/_app/ui.tsx`](./src/routes/_authenticated/_app/ui.tsx)
- [ ] `vp check` and `vp test` pass after your domain edits

```bash
vp check
vp test
```

### 12. Production (when ready)

- [ ] Deploy Convex prod (`bunx convex deploy` — **production only**, never for day-to-day template work)
- [ ] `bunx @convex-dev/auth --prod`
- [ ] Set `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` on **prod**
- [ ] Google OAuth origins + redirect URI for prod SPA + prod `{CONVEX_SITE_URL}/api/auth/callback/google`
- [ ] **Polar (required — empty credentials now throw):** set `POLAR_SERVER=production` explicitly (do not omit; omitted defaults to sandbox)
- [ ] Set `POLAR_ACCESS_TOKEN`, `POLAR_WEBHOOK_SECRET`, `POLAR_PRODUCT_MONTHLY_ID`, `POLAR_PRODUCT_YEARLY_ID` on prod
- [ ] Point a Polar **production** webhook at prod `{CONVEX_SITE_URL}/polar/events`
- [ ] Confirm via admin `polar:billingHealth` that all presence flags are `true` and `server` is `production`
- [ ] After first deploy with trial expiry jobs: `bunx convex run trialBackfill:scheduleExpiryJobs`
- [ ] `APP_CONFIG.appUrl` / marketing / legal / download / self-host URLs point at production
- [ ] Build SPA with **prod** `VITE_CONVEX_URL` / `VITE_CONVEX_SITE_URL` injected at **build** time (Vite bakes these in)

**SPA host (Cloudflare Pages example — any static host works):**

| Setting       | Value                                                                                                             |
| ------------- | ----------------------------------------------------------------------------------------------------------------- |
| Build command | `bun run build` (or `vp install && bun run build` if the host doesn’t restore `node_modules` the way Bun expects) |
| Output dir    | `dist`                                                                                                            |
| Env (build)   | `VITE_CONVEX_URL`, `VITE_CONVEX_SITE_URL` for the **prod** Convex deployment                                      |

- [ ] Host build uses prod Convex Vite env vars
- [ ] Confirm the host serves [`public/_headers`](./public/_headers) (CSP, HSTS, frame deny). Cloudflare Pages picks this up from `public/` → `dist/` automatically.
- [ ] If you add new third-party origins (analytics, embeds, APIs), extend `connect-src` / `frame-src` (and related directives) in `public/_headers` — Polar + Convex + Google avatar hosts are already allowed.

---

## Day-to-day commands

| Command                      | Purpose                                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| `vp install`                 | Install deps after pull                                                                       |
| `vp dev`                     | Vite+ web dev server                                                                          |
| `bunx convex dev`            | Convex codegen + push (keep running while developing)                                         |
| `vp run ds`                  | Web + Convex together ([`vite.config.ts`](./vite.config.ts))                                  |
| `vp check`                   | Format / Oxlint (this repo also runs ESLint via `bun run lint:fix` in `package.json` `check`) |
| `vp test`                    | Tests                                                                                         |
| `vp run check`               | Runs `vp check` and `bun run lint`                                                            |
| `bun run typecheck`          | `tsc --noEmit`                                                                                |
| `bunx --bun shadcn@latest …` | Theme / UI components                                                                         |

---

## Env reference

See [`.env.example`](./.env.example). Summary:

| Variable                                | Location                         | Required                                   |
| --------------------------------------- | -------------------------------- | ------------------------------------------ |
| `CONVEX_DEPLOYMENT`                     | `.env.local` (from `convex dev`) | Yes (dev)                                  |
| `VITE_CONVEX_URL`                       | `.env.local`                     | Yes                                        |
| `VITE_CONVEX_SITE_URL`                  | `.env.local`                     | Yes (handy mirror of HTTP Actions URL)     |
| `SITE_URL`                              | Convex env                       | Yes (SPA origin)                           |
| `JWT_PRIVATE_KEY` / `JWKS`              | Convex env                       | Yes                                        |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Convex env                       | Yes if using Google                        |
| `VITE_AUTH_PASSWORD_ENABLED`            | `.env.local`                     | Optional (password UI; on for self-host)   |
| `VITE_SELF_HOSTED`                      | SPA build / Docker               | Self-host builds only                      |
| `SELF_HOSTED`                           | Convex env                       | Self-host Docker (`true`)                  |
| `POLAR_SERVER`                          | Convex env                       | Yes for billing (`sandbox` / `production`) |
| `POLAR_SANDBOX_ACCESS_TOKEN`            | Convex env                       | Yes when `POLAR_SERVER=sandbox`            |
| `POLAR_ACCESS_TOKEN`                    | Convex env                       | Yes when `POLAR_SERVER=production`         |
| `POLAR_SANDBOX_WEBHOOK_SECRET`          | Convex env                       | Yes when sandbox                           |
| `POLAR_WEBHOOK_SECRET`                  | Convex env                       | Yes when production                        |
| `POLAR_PRODUCT_MONTHLY_ID`              | Convex env                       | Yes for billing                            |
| `POLAR_PRODUCT_YEARLY_ID`               | Convex env                       | Yes for billing                            |

Polar secrets belong on the **Convex deployment** (`bunx convex env set`), not in Vite. See clone step **6. Billing (Polar)**.

---

## Stack pointers

- React 19 + Vite+ ([`vite.config.ts`](./vite.config.ts), React Compiler)
- TanStack Router / Query / Form / Table
- Convex + `@convex-dev/auth` + `@djpanda/convex-authz` + `@convex-dev/rate-limiter` + `@convex-dev/polar`
- shadcn (Base UI) + Tailwind v4
- i18n: `react-i18next` ([`src/i18n/`](./src/i18n/))

---

## License

This template is released under the [MIT License](./LICENSE.md). If you clone it and want a different license for your project, update [`LICENSE.md`](./LICENSE.md).
