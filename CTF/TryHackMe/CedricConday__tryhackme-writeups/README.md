# TryHackMe Writeups: concode

Technique-first writeups from my TryHackMe work, as **[concode](https://tryhackme.com/p/concode)** (Top 1%). Each one shows *what* was done, *how*, and *why*: the reusable method, not a flag dump. Flags, passwords, and cracked hashes are redacted per TryHackMe's writeup policy; every writeup links back to its room.

Rendered with a bit more polish at **[condaydigital.com](https://condaydigital.com/writeups.html)**.

## Writeups

| Room | Domain | Difficulty | Writeup |
|---|---|---|---|
| [Smol](https://tryhackme.com/room/smol) | Web / Priv-Esc | Medium | [read](writeups/smol.md) |
| [PWN101](https://tryhackme.com/room/pwn101) | Binary Exploitation | Medium | [read](writeups/pwn101.md) |
| [Corp Website: React2Shell](https://tryhackme.com/room/lafb2026e7) | Web / RCE (CVE-2025-55182) | Medium | [read](writeups/corp-website-react2shell.md) |
| [Volt Typhoon](https://tryhackme.com/room/volttyphoon) | Blue Team / SIEM | Medium | [read](writeups/volt-typhoon.md) |
| [Mayhem](https://tryhackme.com/room/mayhemroom) | DFIR / Forensics | Medium | [read](writeups/mayhem.md) |
| [Missing Person](https://tryhackme.com/room/missingperson) | OSINT | Easy | [read](writeups/missing-person-osint.md) |

## Coverage

Deliberately spread across the offensive **and** defensive spectrum, not just box-hacking:

- **Offensive**: web app exploitation (LFI→RCE chains, a 2025 RSC CVE), binary exploitation (stack overflows, format strings, ret2win, integer overflow)
- **Defensive**: APT threat-hunting in Splunk, C2 traffic reconstruction from PCAP
- **Investigative**: OSINT geolocation from image metadata

More rooms added over time.

## About

I'm Cedric Conday: I build and break software. Open-source contributor (32+ merged PRs across production projects), and I document my security work the way I'd want to read it: concise, reproducible, honest about method.

- Site: [condaydigital.com](https://condaydigital.com)
- GitHub: [@CedricConday](https://github.com/CedricConday)
