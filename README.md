# 🌺 Hibiscus

A modern, self-hostable manga reader with a beautiful interface built on top of [Heliotrope](https://github.com/Saebasol/Heliotrope).

**Runtime requirement: Node.js 22 or later.** The Docker image uses Node.js 22.

## ✨ Features

- 🚀 **Modern UI**: Clean and intuitive interface built with Radix UI
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🖼️ **Lazy Loading**: Efficient image loading with intersection observer
- 🎯 **Self-Hostable**: Deploy your own instance easily
- ⚡ **Fast Performance**: Optimized for speed and smooth scrolling
- 🔐 **Optional OIDC**: Bring your own identity provider without provider-specific code
- 🔖 **Bookmarks**: Store per-user bookmarks in SQLite when authentication is enabled

## Optional OIDC authentication and bookmarks

Hibiscus can delegate sign-in to a standards-compliant OIDC provider such as Okta, Authentik, Keycloak, Ory Hydra, Google, or Entra ID. Register Hibiscus as a confidential web client with the authorization code flow and set its redirect URI to `PUBLIC_URL/auth/callback`.

| Variable | Description |
| --- | --- |
| `OIDC_ISSUER_URL` | Provider issuer URL used for OIDC Discovery |
| `OIDC_CLIENT_ID` | OAuth/OIDC client ID |
| `OIDC_CLIENT_SECRET` | OAuth/OIDC client secret |
| `OIDC_CLIENT_AUTH_METHOD` | `client_secret_basic` (default) or `client_secret_post`, according to the provider's supported token endpoint authentication methods |
| `OIDC_PROVIDER_NAME` | Display name used by the sign-in UI; defaults to `Identity provider` |
| `OIDC_SCOPES` | Optional scopes; defaults to `openid profile email` |
| `PUBLIC_URL` | Public application origin, for example `https://hibiscus.example.com` |
| `DATABASE_PATH` | SQLite file path; defaults to `./data/hibiscus.db` |
| `TRUST_PROXY` | Set to `true` only when running behind a trusted reverse proxy |
| `OIDC_ALLOW_INSECURE` | Set to `true` only for a local HTTP provider during development |

The three required `OIDC_*` connection values (`OIDC_ISSUER_URL`, `OIDC_CLIENT_ID`, and `OIDC_CLIENT_SECRET`) must be configured together. Leave all three empty to keep authentication disabled: public browsing works normally and **no SQLite database is created or required**, so Hibiscus can run on read-only deployments without persistent storage.

When OIDC is enabled, the SQLite database stores local user mappings, hashed session tokens, one-time OIDC request state, and bookmarks; passwords and OIDC access tokens are not stored. In Docker, mount a persistent volume at `/app/data` (or the directory of `DATABASE_PATH`). Because SQLite runs in WAL mode (`journal_mode = WAL`), back up safely using SQLite's online backup (`sqlite3 ./data/hibiscus.db ".backup '/path/to/backup.db'"` or `VACUUM INTO`) or stop the server before copying the database files (including `-wal` and `-shm` if present).

### Local OIDC development

Run the built-in local mock OIDC provider and start Hibiscus against it:

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
