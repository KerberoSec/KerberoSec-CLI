<p align="center">
  *[Image: Kernel Kittens banner.]*
</p>

# Flagwatch

<p align="center">
  A white-label CTF calendar that keeps schedules, rules, AI policy, and source evidence in one place.
</p>

<p align="center">
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/badge/license-MIT-e95420.svg"></a>
  <img alt="Python 3.13 or newer" src="https://img.shields.io/badge/python-3.13%2B-3776AB.svg">
  <img alt="Docker Compose" src="https://img.shields.io/badge/deploy-Docker%20Compose-2496ED.svg">
  <a href="https://calendar.kernelkittens.team/"><img alt="Live Flagwatch calendar" src="https://img.shields.io/badge/live-calendar.kernelkittens.team-198754.svg"></a>
</p>

CTF details are scattered across calendars, platform pages, rule documents, and organizer posts. Flagwatch collects those public facts, keeps the exact evidence behind them, and shows conflicts instead of quietly guessing. The default view covers events from the previous 31 days through the next 90 days.

**[Open the live Kernel Kittens calendar](https://calendar.kernelkittens.team/)**

*[Image: Flagwatch public August 2026 month calendar with CTF events and source status]*

## Project status

As checked on September 6, 2026, the package version is `0.1.0` and no versioned GitHub release has been published. The repository includes the calendar, collectors, Docker setup, and local quality checks described below. No GitHub Actions workflow is merged on `main` yet; use the documented local checks when contributing.

## What Flagwatch does

| Capability | What you get |
| --- | --- |
| Multi-source calendar | Official organizer pages, ICS, JSON, CTFd, rCTF, and optional CTFtime ingestion |
| Cited rules intelligence | Exact quotes, source URLs, collection time, and visible freshness |
| AI policy tracking | Evidence-backed `ai_native`, `ai_assisted`, prohibited, or unknown status |
| Conflict handling | Both values and both sources are retained when facts disagree |
| Safe refreshes | A failed collection never replaces the last-good public snapshot |
| Public platform context | Aggregate challenge, category, participant, scoreboard, and visible solve counts when exposed |
| White-label frontend | Product name, organization, mark, accent, logo, favicon, time zone, and footer links |
| Provider-neutral enrichment | OpenAI, Azure OpenAI, Anthropic, DeepSeek, LiteLLM, or a local OpenAI-compatible endpoint |

Flagwatch is useful without a model. The deterministic parser handles ordinary event pages and feeds first. Model enrichment is an optional fallback for public event discovery and rules text.

## How it works

```mermaid
flowchart LR
    A[Official pages] --> C[Bounded collectors]
    B[ICS, JSON, CTFd, rCTF, optional CTFtime] --> C
    C --> D[Normalize and attribute]
    M[Optional model connector] --> E[Evidence gate]
    D --> E
    E --> F[Conflict and freshness policy]
    F --> G[Atomic last-good snapshot]
    G --> H[Calendar and read-only API]
```

Every displayed fact keeps its source reference. A model-derived rule is accepted only when its exact evidence quote exists in the fetched page text. Safety-relevant conflicts and stale or incomplete evidence suppress alerts.

## Quick start with Docker

Requirements: Docker with the Compose plugin, plus Git and curl.

```sh
git clone https://github.com/KernelKittens/ctf-event-watch.git
cd ctf-event-watch
cp .env.example .env
docker compose up -d --build
curl --fail http://127.0.0.1:8080/healthz
```

Open [http://localhost:8080](http://localhost:8080).

The default source file includes the official Hack The Box events page. Edit [`sources.json`](sources.json) to add feeds or public event platforms. CTFtime stays disabled until `FLAGWATCH_CTFTIME_ENABLED=true` is set in `.env`.

The default stack runs two hardened containers:

- `sync` refreshes sources every six hours and publishes the snapshot atomically.
- `web` serves the public calendar, health endpoint, and read-only API.

Both run as non-root users with read-only filesystems, dropped Linux capabilities, health checks, and restart policies. See the [Docker deployment guide](docs/docker.md) for volumes, reverse proxy examples, domains, and the optional LiteLLM sidecar.

## Connectors and precedence

Official page watch has the highest default precedence. CTFd and rCTF follow, then organizer feeds and optional CTFtime discovery.

The page watcher follows only a bounded number of same-origin links from an operator-configured public URL. It rejects private destinations, embedded credentials, cross-origin crawl expansion, oversized responses, and redirect chains that leave the approved public origin. It does not solve CAPTCHAs, use authenticated browser sessions, or bypass access controls.

Connector tokens are referenced by environment variable name in `sources.json`. Token values never belong in that file. Full setup details are in [Event source connectors](docs/connectors.md).

## Models and LiteLLM

The model layer is a connector. It supports OpenAI, Azure OpenAI, Anthropic, DeepSeek, LiteLLM, and local OpenAI-compatible endpoints.

Model requests receive bounded public text. They do not receive browser tools, credentials, private CTF data, or write access. Returned evidence is checked against the source page before it can appear in the snapshot. See [Model providers](docs/providers.md) for environment variables and sidecar routing.

## White-label configuration

Edit `site/config.js`:

```js
window.FLAGWATCH_CONFIG = {
  productName: "My CTF Calendar",
  organizationName: "My Security Club",
  shortDescription: "CTF schedules, rules, and cited source intelligence.",
  mark: "M",
  accentColor: "#006c7a",
  defaultTimeZone: "America/Chicago",
  logoUrl: "/logo.svg",
  faviconUrl: "/favicon.svg",
  footerLinks: [
    {label: "Source policy", url: "/source-policy"},
  ],
};
```

Brand URLs must be safe public or same-site URLs. Custom accent colors are applied only when white text meets the required contrast.

## Read-only API

```sh
curl --fail http://127.0.0.1:8080/api/events
curl --fail http://127.0.0.1:8080/healthz
```

The public snapshot can contain schedules, public rules, source citations, challenge counts, visible solve totals, public scoreboard size, participant totals, and category counts. It must not contain player identities, private solves, team membership, flags, credentials, or private Discord telemetry.

## Native development

Flagwatch requires Python 3.13 and [uv](https://docs.astral.sh/uv/).

```sh
uv sync
uv run playwright install chromium
uv run flagwatch sync
uv run flagwatch serve
```

The private operator view binds to `127.0.0.1:4814`. Syncing can create local alert previews, but it cannot send them unless `FLAGWATCH_SEND_ENABLED=true` and a complete Discord webhook or SMTP destination is configured.

Run the complete local quality gate with:

```sh
uv run pytest
uv run ruff check .
uv run ruff format --check .
uv run mypy src
```

Browser coverage includes Axe checks, full keyboard operation, and the 320 pixel layout.

## Documentation

- [Docker deployment and domains](docs/docker.md)
- [Event source connectors](docs/connectors.md)
- [Model providers and LiteLLM](docs/providers.md)
- [Collection, attribution, and privacy policy](docs/source-policy.md)

## Contributing

Issues and pull requests are welcome. Keep changes focused, add or update tests for behavior changes, and run the quality gate before opening a pull request. New connectors must preserve source attribution, bounded collection, and the public/private data boundary.

For vulnerabilities in Flagwatch itself, use [GitHub private vulnerability reporting](https://github.com/KernelKittens/ctf-event-watch/security/advisories/new). Do not put credentials, private CTF data, live flags, or exploit details in a public issue.

## License

Built by [Kernel Kittens](https://github.com/KernelKittens). Licensed under the [MIT License](LICENSE).
