# Event source connectors

Flagwatch combines independent sources into one event record while preserving provenance. Configure sources in `sources.json`, through `FLAGWATCH_SOURCES_PATH`, or as an inline `FLAGWATCH_SOURCES_JSON` value. Do not set both path and inline JSON.

## Available connectors

| Kind | Reads | Default precedence |
| --- | --- | ---: |
| `watch` | Official organizer page, schema.org Event JSON-LD, and bounded same-origin event links | 10 |
| `ctfd` | `/api/v1/challenges` and `/api/v1/scoreboard` | 20 |
| `rctf` | `/api/v2/challs` and `/api/v2/leaderboard/now` | 20 |
| `ics` | iCalendar `VEVENT` records | 40 |
| `json` | A normalized JSON event feed | 45 |
| CTFtime | Official CTFtime API when explicitly enabled | 100 |

Lower numbers win when two high-confidence records describe the same event. Flagwatch merges records only when their official URLs match or when title, organizer, and overlapping time all agree. Similar titles alone never merge.

## Configuration

[`examples/sources.example.json`](../examples/sources.example.json) contains every connector type. A compact example:

```json
{
  "sources": [
    {
      "kind": "watch",
      "name": "hack-the-box-events",
      "url": "https://www.hackthebox.com/events?hsLang=en",
      "organizers": ["Hack The Box"],
      "max_event_pages": 12,
      "ai_discovery": true
    },
    {
      "kind": "ics",
      "name": "organizer-calendar",
      "url": "https://events.example/calendar.ics"
    },
    {
      "kind": "json",
      "name": "organizer-feed",
      "url": "https://events.example/events.json"
    }
  ]
}
```

Set `"enabled": false` to keep a prepared source without querying it.

## JSON feed shape

The root can be an array or an object with an `events` array. Each record needs a title, start, and finish. ISO 8601 timestamps should include a timezone.

```json
{
  "events": [
    {
      "id": "example-2026",
      "title": "Example CTF 2026",
      "starts_at": "2026-09-05T12:00:00Z",
      "finishes_at": "2026-09-06T12:00:00Z",
      "official_url": "https://ctf.example/",
      "registration_url": "https://ctf.example/register",
      "online": true,
      "organizers": ["Example Org"],
      "description": "Jeopardy-style CTF",
      "prizes": "$500"
    }
  ]
}
```

Accepted aliases are `name` for title, `start` for `starts_at`, `finish` for `finishes_at`, and `url` for `official_url`.

## CTFd and rCTF

Platform APIs usually do not expose the parent event schedule, so the connector requires an `event` block with the event ID, title, official URL, start, finish, and location mode. The API adds platform analytics to that event.

```json
{
  "kind": "ctfd",
  "name": "example-ctfd",
  "base_url": "https://ctf.example/",
  "token_env": "FLAGWATCH_CTFD_READ_TOKEN",
  "event": {
    "id": "example-2026",
    "title": "Example CTF 2026",
    "official_url": "https://ctf.example/",
    "starts_at": "2026-09-05T12:00:00Z",
    "finishes_at": "2026-09-06T12:00:00Z",
    "online": true,
    "organizers": ["Example Org"]
  }
}
```

Omit `token_env` for public endpoints. When a token is needed, only its environment variable name belongs in source configuration. Inline tokens are rejected by the schema.

The public connector publishes aggregate counts such as challenge total, visible solves, scoreboard entries, participant total, and categories. Private player records, private solves, team membership, flags, challenge secrets, and administration data do not belong in the public repository or snapshot.

## Conflict handling

Every merged event keeps `source_refs` with the source kind, URL, record ID, and collection time. Disagreements become `conflicts` with both values and both URLs. Timing and team-size conflicts suppress alerting until a higher-confidence source resolves them.
