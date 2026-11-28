# 🌺 Hibiscus

A modern, self-hostable manga reader built with Fastify, React, Radix UI, and [Heliotrope](https://github.com/Saebasol/Heliotrope).

**Runtime requirement:** Node.js 22 or later and `pnpm` (Docker uses `node:22-slim`).

## ✨ Features

- 🚀 **Modern UI**: Clean dark interface built with Radix UI Themes, responsive across desktop and mobile
- 📖 **Reader & Lazy Thumbnails**: Integrated reader with page controls, webtoon/page tracking, and intersection-observer thumbnail loading
- 🔎 **Tag-Based Search**: Autocomplete tag search powered by Heliotrope
- 🙈 **Thumbnail Blur & Blocked Tags**: Blur all thumbnails or works matching configured tags with hover/focus preview; rules are saved in the browser and can optionally sync to your OIDC account
- 🔖 **Bookmarks & JSON Export**: Works locally in the browser when signed out, syncs to SQLite when signed in with OIDC, and exports bookmarks as JSON with full work `info` metadata (client-side rate-limited fetching and progress indicator for 100+ items)
- 🔐 **Optional OIDC Authentication & Account Management**: Bring any standards-compliant OIDC provider (Okta, Authentik, Keycloak, Ory Hydra, Google, Entra ID, etc.) with Authorization Code + PKCE, plus self-service **Clear saved data** and **Delete account** actions on `/login`

## 🚀 Getting Started

```bash
pnpm install
pnpm dev
```

For production builds:

```bash
pnpm build
pnpm start
```

### Available Scripts

| Script | Description |
| --- | --- |
| `pnpm dev` | Start the Fastify + Vite development server |
| `pnpm build` | Build both client/SSR bundles (`build:client`) and server (`build:server`) |
| `pnpm start` | Run the built production server (`NODE_ENV=production node dist/server.js`) |
| `pnpm lint` | Run `oxlint` across the repository |
| `pnpm test:server` | Run server database and OIDC/bookmark integration tests |
| `pnpm mock:oidc` | Start the local-development-only mock OIDC provider on `http://127.0.0.1:4100` |
| `pnpm clean` | Remove build outputs (`dist`, `tsconfig.tsbuildinfo`) |

## ⚙️ Configuration

Copy `.env.example` to `.env` (or pass environment variables directly). Register Hibiscus as a confidential web client with the authorization code flow and set its redirect URI to `PUBLIC_URL/auth/callback`.

| Variable | Default | Description |
| --- | --- | --- |
| `HOST` | `0.0.0.0` | Bind address for the HTTP server |
| `PORT` | `3000` | Port for the HTTP server |
| `PUBLIC_URL` | `http://localhost:3000` | Public application origin, for example `https://hibiscus.example.com` |
| `DATABASE_PATH` | `./data/hibiscus.db` | SQLite file path used when OIDC is enabled |
| `TRUST_PROXY` | `false` | Set to `true` only when running behind a trusted reverse proxy |
| `OIDC_ISSUER_URL` | *(empty)* | Provider issuer URL used for OIDC Discovery |
| `OIDC_CLIENT_ID` | *(empty)* | OAuth/OIDC client ID |
| `OIDC_CLIENT_SECRET` | *(empty)* | OAuth/OIDC client secret |
| `OIDC_CLIENT_AUTH_METHOD` | `client_secret_basic` | `client_secret_basic` or `client_secret_post`, matching the provider's token endpoint authentication method |
| `OIDC_PROVIDER_NAME` | `Identity provider` | Display name shown in the sign-in and account UI |
| `OIDC_SCOPES` | `openid profile email` | Space-separated OIDC scopes requested during sign-in |
| `OIDC_ALLOW_INSECURE` | `false` | Set to `true` only for local HTTP OIDC providers during development |

The three required OIDC connection values (`OIDC_ISSUER_URL`, `OIDC_CLIENT_ID`, and `OIDC_CLIENT_SECRET`) must be configured together. Leave all three empty to run without authentication: public browsing, local browser bookmarks, and local thumbnail blur rules work normally, and **no SQLite database is created or required**, so Hibiscus can run on read-only deployments without persistent storage.

When OIDC is enabled, SQLite stores local user mappings, hashed session tokens, one-time OIDC request state, bookmarks, and synced blurred tag rules; passwords and OIDC access tokens are not stored. Because SQLite runs in WAL mode (`journal_mode = WAL`), back up safely using SQLite's online backup (`sqlite3 ./data/hibiscus.db ".backup '/path/to/backup.db'"` or `VACUUM INTO`) or stop the server before copying the database files (including `-wal` and `-shm` if present).

## 🧪 Local OIDC Development

Run the built-in local mock OIDC provider (`scripts/mock-oidc.mjs`) and start Hibiscus against it:

```bash
pnpm mock:oidc
```

```bash
OIDC_PROVIDER_NAME="Local Mock OIDC" \
OIDC_ISSUER_URL=http://127.0.0.1:4100 \
OIDC_CLIENT_ID=hibiscus-local \
OIDC_CLIENT_SECRET=hibiscus-local-secret \
OIDC_ALLOW_INSECURE=true \
pnpm dev
```

## 🐳 Docker

Build and run the container image:

```bash
docker build -t hibiscus .
docker run -d -p 3000:3000 hibiscus
```

When OIDC is enabled, mount `/app/data` (or the directory of `DATABASE_PATH`) as a persistent volume and pass your OIDC environment variables:

```bash
docker run -d \
  -p 3000:3000 \
  -v hibiscus-data:/app/data \
  -e PUBLIC_URL=https://hibiscus.example.com \
  -e TRUST_PROXY=true \
  -e OIDC_PROVIDER_NAME=Authentik \
  -e OIDC_ISSUER_URL=https://auth.example.com/application/o/hibiscus/ \
  -e OIDC_CLIENT_ID=your-client-id \
  -e OIDC_CLIENT_SECRET=your-client-secret \
  hibiscus
```
