# Platforms

BinaryPilot targets two CTF platforms out of the box. Both integrations call the vendor's HTTP API directly under `binarypilot/tools/{flagyard,htb}/`; there is no MCP layer.

## HackTheBox

### Auth

`HTB_TOKEN`: App Token from [Profile → Settings → App Tokens](https://app.hackthebox.com/profile/settings). JWT format; lives in the Authorization Bearer header of every v4/v5 API call.

### API surface

- Challenges: list → `/challenge/list(/retired)`, info → `/challenge/info/<id>`, download → `/challenges/<id>/download_link`, container lifecycle → `POST /container/{start,stop}` with `{challenge_id}`, flag submit → `POST /challenge/own` with `{challenge_id, flag}`.
- Search: `/search/fetch?query=` over challenges + machines.
- Machines: profile → `/machine/profile/<id-or-name>`, spawn/reset/terminate → `POST /vm/{spawn,reset,terminate}` (v5) with `{machine_id}`, assigned-IP polling → `GET /virtual_machine/active` (v5, carries `expires_at`/`vpn_server_type`), flag submit → `POST /machine/own` (v5) with `{id, flag}`.

Machines are reachable only over the HTB VPN, brought up inside the sandbox from the profile in `HTB_VPN_OVPN` (see [`integrations.md`](integrations.md#htb-vpn)); challenge Docker instances do **not** need it. A machine yields two flags: `user.txt` on foothold, `root.txt` after privilege escalation: submit each as soon as it's recovered.

### Tools exposed to the agent

- `htb_list_challenges`, `htb_search_content`, `htb_get_challenge_info`
- `htb_spawn_challenge_container`, `htb_stop_challenge_container`
- `htb_download_challenge`
- `htb_submit_challenge_flag`, `htb_submit_machine_flag`
- `htb_get_machine_info`, `htb_spawn_machine`, `htb_stop_machine`, `htb_reset_machine`

## FlagYard

### Auth

Keycloak password grant against `https://sso.tuwaiq.edu.sa/auth/realms/main/protocol/openid-connect/token` (configurable via `FLAGYARD_SSO_TOKEN`). Either:
- `FLAGYARD_USERNAME` + `FLAGYARD_PASSWORD`, or
- `FLAGYARD_ACCESS_TOKEN` (+ optional `FLAGYARD_REFRESH_TOKEN`): used directly, no grant call.

The client refreshes on expiry and retries once on 401.

### API surface

Base: `https://api.flagyard.com/api`. Every endpoint needs the Bearer header.

- Labs: list → `/labs/public?type={training|competitive}`, details → `/labs/<id>/public`.
- Challenge: details → `/labs/<lab>/challenges/<id>`, files → `.../challenge-files`, instance → `POST|DELETE .../instance`, flag submit → `POST .../flag` with `{flag}`.
- Search: `/users/current/status`, `/dashboard/latest-challenges`, plus a client-side `search_challenges` that paginates the labs endpoints.

Instance spawn/stop is idempotent per user: the API returns the currently-running instance if one exists, plus `instanceAddress` once ready.

### Tools exposed to the agent

- `flagyard_list_labs`, `flagyard_get_lab`, `flagyard_get_challenge`
- `flagyard_start_instance`, `flagyard_stop_instance`
- `flagyard_search_challenges`
- `flagyard_download_files`
- `flagyard_submit_flag`

## Flag discipline

- **HTB challenges:** `HTB{...}`: case-sensitive.
- **HTB machines:** bare 32-char hex hash from `user.txt`/`root.txt` (no wrapper) on regular machines; `HTB{...}` on some products (starting-point). Both shapes accepted by the submit tool.
- **FlagYard:** `FlagY{...}`: case-sensitive.
The submit tools validate format before calling out. Platforms rate-limit submissions: BinaryPilot replays once on acceptance failure only.

## Changing endpoints

- FlagYard API base: `FLAGYARD_API_BASE` (default `https://api.flagyard.com/api`).
- HTB: hardcoded to `labs.hackthebox.com/api/v{4,5}`: patch `binarypilot/tools/htb/tool.py` (two constants).
