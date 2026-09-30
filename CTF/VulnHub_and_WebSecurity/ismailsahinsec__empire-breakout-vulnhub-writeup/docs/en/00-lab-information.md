# 00: Lab Information

| Field | Status |
| --- | --- |
| Lab | Empire: Breakout / VulnHub |
| Target IP | `10.158.174.179` |
| Verified tools | `nmap`, `netdiscover`, `curl`, `gobuster`, `smbclient`, `enum4linux`, browser |
| Verified services | HTTP, SMB, panel checks on `10000` and `20000` |
| Not verified | Exact Apache version, Hydra use, user/root flag, privilege escalation chain |

## Evidence Inventory

- `assets/screenshots/01-discovery/01-target-overview.png`
- `assets/screenshots/02-enumeration/02-html-comment.png`
- `assets/screenshots/03-initial-access/04-panel-login.png`
- `evidence/sanitized-output/sanitized-notes.txt`
- `evidence/enumeration/03-smb-enum-needed.txt`

Each technical section uses purpose, command, parameters, finding, analysis and defense. Unsupported claims are not presented as fact.