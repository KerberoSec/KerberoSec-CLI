# Integrations

BinaryPilot integrates with your workflow through env-var credentials and on-disk artifacts. There's no MCP server hop: the platform REST shims live inside `binarypilot/tools/{flagyard,htb}/` and are invoked as function-tools by the solving agents.

## Environment integration

Platform credentials live in env (or `~/.binarypilot/cli-config.json`); they're forwarded into the sandbox container so in-sandbox tooling sees them too:

- `HTB_TOKEN` → HackTheBox API v4/v5 Bearer.
- `FLAGYARD_USERNAME` / `FLAGYARD_PASSWORD`, or `FLAGYARD_ACCESS_TOKEN` (+ optional `FLAGYARD_REFRESH_TOKEN`).

Set these through your shell, a `.env` file (process env only: BinaryPilot does not parse `.env` itself), or `~/.binarypilot/cli-config.json`.

## CI/CD

Headless mode (`-n`) runs in any CI runner with Docker. Standard pattern:

```yaml
- env:
    BINARYPILOT_LLM: ${{ secrets.BINARYPILOT_LLM }}
    LLM_API_KEY: ${{ secrets.LLM_API_KEY }}
    HTB_TOKEN: ${{ secrets.HTB_TOKEN }}
  run: binarypilot -n --challenge <url>
```

See [`README.md`](../README.md#cicd) for a working workflow snippet.

## Local viewer

`binarypilot view` (or a specific run name) binds the local dashboard at `127.0.0.1` on a random port with a URL token. Nothing leaves your machine.

## Caido proxy

Web traffic in the sandbox flows through a Caido MITM proxy by default. For CTF-web challenges you generally don't notice it, but it's available to the agents via `caido_api` in sandbox Python. CA materials live under `/app/certs`.

## HTB VPN

Machines (and some Fortress/Endgame targets) are reachable only over the HTB OpenVPN network. Point BinaryPilot at your downloaded profile: the sandbox container runs its own OpenVPN client; the host itself does not need to be attached:

```bash
export HTB_VPN_OVPN=/abs/path/to/machines_eu-release-1.ovpn
binarypilot --challenge https://app.hackthebox.com/machines/Lame
```

What happens: the profile is bind-mounted **read-only** into the container at `/vpn/<name>.ovpn`, `/dev/net/tun` is passed through, and the image entrypoint auto-starts `openvpn --daemon`, waits up to 30 s for `tun0`, and sets `BINARYPILOT_VPN_PROFILE` so agents know the tunnel is up (log at `/tmp/openvpn.log` inside the sandbox). Docker-instance challenges don't need any of this.

HTB issues a **separate `.ovpn` per VPN product**: `machines`, `starting-point`, `sherlocks`, `fortresses`, `seasonal`, and they are NOT interchangeable. Download the one matching your target from the HTB site (VPN page), or the 10.x target won't answer ping.

The path can also live in `~/.binarypilot/cli-config.json` under `"HTB_VPN_OVPN"` (it's a first-class setting; `persist_current` picks it up from the environment). It is consumed host-side only: never injected into the container env beyond the in-container `/vpn/...` profile path.
