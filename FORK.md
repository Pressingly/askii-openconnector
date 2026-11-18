# askii-openconnector

This is Pressingly's fork of [oomol-lab/open-connector](https://github.com/oomol-lab/open-connector).
Askii runs OpenConnector as its connector backend for per-user credentials and actions. The fork
carries the few changes Askii needs that upstream does not have yet. Why each patch exists is
explained in the Askii spec `docs/superpowers/specs/2026-11-12-openconnector-integration-design.md`
(section "Fork patches"), in the Askii repository.

- Base: upstream tag `v1.10.0`. The patches live on `main` of this fork (built on branch `askii/v1.10.0`); upstream is synced into it from time to time.
- Releases: `v<upstream>-askii.<n>`, for example `v1.10.0-askii.1`.
- Every behavior patch is one commit with its tests, and is opt-in by env var (patch 6 is catalog data only). With the var unset the
  fork behaves like upstream and the upstream tests pass with only test-store additions (patch 2
  adds `create` to the test connection stores).
- Generic patches (1, 2, maybe 4) are offered upstream. When upstream accepts one, it leaves the
  fork.

## Patches

| #   | Patch                                                                                                                                                                                                                                                                                                                                                                  | Status                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| 1   | Empty connection grant denies: with `OOMOL_CONNECT_REQUIRE_CONNECTION_GRANT=true`, a stored runtime token whose `allowedConnections` is empty can reach no credential connection. Such tokens can still be minted, and no-auth actions still run. Requests without a stored runtime token (admin, static or JWT auth) stay unrestricted.                               | Since `v1.9.9-askii.1`                         |
| 2   | `connectionName` on programmatic connect: the OAuth, API-key and custom connection inputs accept an optional `connectionName` (regex `^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$`). A name that already exists answers `409` and never overwrites.                                                                                                                               | Since `v1.9.9-askii.1`                         |
| 3   | Signed, short-lived file URLs: when `OOMOL_CONNECT_FILE_URL_SECRET` is set, every `downloadUrl` carries `exp` and an HMAC `sig`, and `GET /api/files/:id` rejects unsigned, tampered or expired requests with `403`.                                                                                                                                                   | Since `v1.9.9-askii.1`                         |
| 4   | Grant-filtered connection listing in SQL (`WHERE id IN (...)`, decrypt only what is returned), SQLite and Postgres stores.                                                                                                                                                                                                                                             | Planned: before Askii ships the discovery mode |
| 5   | Cross-replica refresh lock (`pg_advisory_xact_lock` on the connection id around token refresh).                                                                                                                                                                                                                                                                        | Planned: when Askii runs 2 or more replicas    |
| 6   | Provider icon links: each provider definition without its own `iconUrl` gets the link from oomol's public app list (`https://connector.oomol.com/public/v1/apps?locale=en`), images on `static.oomol.com`. 1,710 of 1,715 providers have an icon (own or linked); 5 have none there. To refresh, re-read that list and add `iconUrl` to definitions still missing one. | Since `v1.10.0-askii.1`                        |

Rate limiting is not in the fork; Askii does it.

## Environment variables

| Variable                                 | Default     | Meaning                                                                                                                                                                                                   |
| ---------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OOMOL_CONNECT_REQUIRE_CONNECTION_GRANT` | unset (off) | Boolean. When true, an empty `allowedConnections` on a stored runtime token denies every credential connection instead of allowing all, and `/v1` + `/mcp` always require a runtime credential (patch 1). |
| `OOMOL_CONNECT_FILE_URL_SECRET`          | unset (off) | HMAC secret that signs file download URLs; use at least 32 random bytes (`openssl rand -base64 32`). When set, `GET /api/files/:id` requires a valid, unexpired signature (patch 3).                      |
| `OOMOL_CONNECT_FILE_URL_TTL_SECONDS`     | `300`       | How long a signed file URL stays valid, in seconds (patch 3).                                                                                                                                             |

Each variable is read by both hosts: Node (`src/server/index.ts`) and Cloudflare
(`src/server/cloudflare.ts`, `src/server/cloudflare/cloudflare-env.ts`).

## Known side effects

- With patch 1 on, OpenConnector's own MCP-OAuth backing tokens
  (`src/server/oauth/authorize-endpoint.ts`, `src/server/cloudflare/mcp-oauth.ts`) are minted with
  `allowedConnections: []`, so they can no longer reach any credential connection. Askii never uses
  that path, so this is documented, not fixed.
- With patch 1 on, `/v1` and `/mcp` always require a credential (static runtime token, JWT or a stored
  runtime token), even before any runtime token is minted or after every one is revoked. Upstream
  leaves them open while the token table is empty; a deployment that demands grants must demand a
  token, so this patch closes that gap on both hosts.
- With patch 1 on, a token with an empty grant is also denied trigger subscriptions, including those
  of no-auth triggers. Triggers are outside Askii's scope.
- With patch 3 on, a signed file URL expires after `OOMOL_CONNECT_FILE_URL_TTL_SECONDS` (default 300) while the file itself lives for `OOMOL_CONNECT_TRANSIT_FILE_TTL_SECONDS`. Clients must fetch
  a file promptly after they receive its URL.

## Rebasing onto a new upstream tag

```bash
git fetch upstream --tags
git push origin vX.Y.Z                       # keep the upstream base tag in the fork
git rebase --onto vX.Y.Z v1.10.0 askii/v1.10.0
npm ci && npm run typecheck && npm run lint && npm test
git tag vX.Y.Z-askii.1
```

Then rename the branch to `askii/vX.Y.Z`, update the base in this file, and drop any patch
upstream has accepted.
