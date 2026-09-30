# Docker deployment

The included Compose stack is the simplest persistent deployment. It separates collection from the public web process and keeps the last-good snapshot in a named volume.

## Start

```sh
cp .env.example .env
docker compose up -d --build
docker compose ps
curl --fail http://127.0.0.1:8080/healthz
```

The calendar is available at `http://127.0.0.1:8080`. `/api/events` serves the current public snapshot.

## Services

- `sync` refreshes immediately, then every `FLAGWATCH_SYNC_INTERVAL_SECONDS`. The default is 21,600 seconds, or six hours.
- `web` serves the static calendar and read-only event JSON through Caddy.
- `litellm` is optional and starts only with the `litellm` profile.

The `flagwatch_state` volume contains SQLite state. The `flagwatch_public` volume contains the public `events.json` snapshot. Keep both volumes when recreating containers.

## Last-good behavior

The refresh command writes a candidate file beside the active snapshot, flushes it, and atomically replaces the active file only after a usable source run completes. If every configured source fails, the command exits with status 2 and leaves the prior snapshot byte-for-byte intact.

The web response includes `stale-if-error=86400`, so a reverse proxy can keep serving cached data during a short outage.

## Put a domain in front of it

Create an A or AAAA record for your hostname that points to the Docker host, or use a tunnel provider and its CNAME. Terminate HTTPS at your existing reverse proxy and send traffic to `127.0.0.1:8080`.

Example external Caddy route:

```caddyfile
calendar.example.org {
    reverse_proxy 127.0.0.1:8080
}
```

Do not publish the `sync` container. Only the `web` port should be reachable. The KernelKittens deployment uses `https://calendar.kernelkittens.team` as its public hostname.

## Update

```sh
git pull --ff-only
docker compose up -d --build
docker compose ps
```

Compose restarts only the containers whose image or configuration changed. Verify both health checks and `/api/events` after an update.

## Security defaults

- Non-root users in both application images
- Read-only container filesystems
- All Linux capabilities dropped
- `no-new-privileges` enabled
- Bounded HTTP response sizes and timeouts
- Public-IP validation before source requests
- Same-origin limits for organizer-page discovery
- No outbound alerts unless explicitly enabled
- Secrets supplied by environment variables, never source JSON
