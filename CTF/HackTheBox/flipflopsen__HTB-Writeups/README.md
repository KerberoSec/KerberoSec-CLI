# CTF-Writeups: Hack The Box Machines

This repository contains my personal writeups for **retired** [Hack The Box](https://www.hackthebox.com/) (HTB) machines, compiled for portfolio purposes.

Hack The Box is a legal, gamified platform for practicing offensive security skills in isolated, purpose-built lab environments. All machines documented here have been **retired** by HTB, meaning their intended solutions are public knowledge and may already be covered by numerous community writeups, official HTB solution guides, and public exploit-database entries. Nothing in this repository targets systems outside of the HTB lab environment.

Each writeup follows a consistent structure covering reconnaissance, enumeration, initial foothold, and privilege escalation, along with lessons learned. Supporting material (nmap scans, small PoC/exploit scripts) is kept alongside each writeup where relevant; large binaries, private keys, packet captures, and other loot have been intentionally omitted or trimmed for repository hygiene: where removed, a short note indicates what existed and its role in the attack chain.

## Table of Contents

| Machine | OS | Difficulty | Writeup |
|---|---|---|---|
| Active | Windows | Easy | [Active/WRITEUP.md](Active/WRITEUP.md) |
| Anubis | Windows | Insane | [Anubis/WRITEUP.md](Anubis/WRITEUP.md) |
| Armageddon | Linux | Easy | [Armageddon/WRITEUP.md](Armageddon/WRITEUP.md) |
| Backdoor | Linux | Easy | [Backdoor/WRITEUP.md](Backdoor/WRITEUP.md) |
| Bolt | Linux | Medium | [Bolt/WRITEUP.md](Bolt/WRITEUP.md) |
| BountyHunter | Linux | Easy | [BountyHunter/WRITEUP.md](BountyHunter/WRITEUP.md) |
| Bucket | Linux | Medium | [Bucket/WRITEUP.md](Bucket/WRITEUP.md) |
| Cap | Linux | Easy | [Cap/WRITEUP.md](Cap/WRITEUP.md) |
| Clicker | Linux | Medium | [Clicker/WRITEUP.md](Clicker/WRITEUP.md) |
| CozyHosting | Linux | Easy | [CozyHosting/WRITEUP.md](CozyHosting/WRITEUP.md) |
| Delivery | Linux | Easy | [Delivery/WRITEUP.md](Delivery/WRITEUP.md) |
| Developer | Linux | Hard | [Developer/WRITEUP.md](Developer/WRITEUP.md) |
| Driver | Windows | Easy | [Driver/WRITEUP.md](Driver/WRITEUP.md) |
| Dynstr | Linux | Medium | [dynstr/WRITEUP.md](dynstr/WRITEUP.md) |
| Explore | Android | Easy | [Explore/WRITEUP.md](Explore/WRITEUP.md) |
| Forge | Linux | Medium | [Forge/WRITEUP.md](Forge/WRITEUP.md) |
| Horizontall | Linux | Easy | [Horizontall/WRITEUP.md](Horizontall/WRITEUP.md) |
| Intelligence | Windows | Medium | [Intelligence/WRITEUP.md](Intelligence/WRITEUP.md) |
| Knife | Linux | Easy | [Knife/WRITEUP.md](Knife/WRITEUP.md) |
| Laboratory | Linux | Easy | [Laboratory/WRITEUP.md](Laboratory/WRITEUP.md) |
| Love | Windows | Easy | [Love/WRITEUP.md](Love/WRITEUP.md) |
| Monitors | Linux | Hard | [Monitors/WRITEUP.md](Monitors/WRITEUP.md) |
| MonitorsTwo | Linux | Easy | [MonitorsTwo/WRITEUP.md](MonitorsTwo/WRITEUP.md) |
| OpenAdmin | Linux | Easy | [OpenAdmin/WRITEUP.md](OpenAdmin/WRITEUP.md) |
| Ophiuchi | Linux | Medium | [Ophiuchi/WRITEUP.md](Ophiuchi/WRITEUP.md) |
| Pandora | Linux | Easy | [Pandora/WRITEUP.md](Pandora/WRITEUP.md) |
| Paper | Linux | Easy | [Paper/WRITEUP.md](Paper/WRITEUP.md) |
| PC | Linux | Easy | [PC/WRITEUP.md](PC/WRITEUP.md) |
| Perfection | Linux | Easy | [Perfection/WRITEUP.md](Perfection/WRITEUP.md) |
| Pikaboo | Linux | Hard | [Pikaboo/WRITEUP.md](Pikaboo/WRITEUP.md) |
| Pilgrimage | Linux | Easy | [Pilgrimage/WRITEUP.md](Pilgrimage/WRITEUP.md) |
| Pit | Linux | Medium | [Pit/WRITEUP.md](Pit/WRITEUP.md) |
| Previse | Linux | Easy | [Previse/WRITEUP.md](Previse/WRITEUP.md) |
| Ready | Linux | Medium | [Ready/WRITEUP.md](Ready/WRITEUP.md) |
| RedPanda | Linux | Easy | [RedPanda/WRITEUP.md](RedPanda/WRITEUP.md) |
| Sau | Linux | Easy | [Sau/WRITEUP.md](Sau/WRITEUP.md) |
| Schooled | FreeBSD | Medium | [Schooled/WRITEUP.md](Schooled/WRITEUP.md) |
| ScriptKiddie | Linux | Easy | [ScriptKiddie/WRITEUP.md](ScriptKiddie/WRITEUP.md) |
| Seal | Linux | Medium | [Seal/WRITEUP.md](Seal/WRITEUP.md) |
| Secret | Linux | Easy | [Secret/WRITEUP.md](Secret/WRITEUP.md) |
| Shibboleth | Linux | Medium | [Shibboleth/WRITEUP.md](Shibboleth/WRITEUP.md) |
| Shocker | Linux | Easy | [Shocker/WRITEUP.md](Shocker/WRITEUP.md) |
| Sink | Linux | Insane | [Sink/WRITEUP.md](Sink/WRITEUP.md) |
| Skyfall | Linux | Insane | [Skyfall/WRITEUP.md](Skyfall/WRITEUP.md) |
| Spectra | Linux | Easy | [Spectra/WRITEUP.md](Spectra/WRITEUP.md) |
| Spider | Linux | Hard | [Spider/WRITEUP.md](Spider/WRITEUP.md) |
| Stacked | Linux | Insane | [Stacked/WRITEUP.md](Stacked/WRITEUP.md) |
| Static | Linux | Hard | [Static/WRITEUP.md](Static/WRITEUP.md) |
| Surveillance | Linux | Medium | [Surveillance/WRITEUP.md](Surveillance/WRITEUP.md) |
| Tenet | Linux | Medium | [Tenet/WRITEUP.md](Tenet/WRITEUP.md) |
| Tentacle | Linux | Hard | [Tentacle/WRITEUP.md](Tentacle/WRITEUP.md) |
| TheNotebook | Linux | Medium | [TheNotebook/WRITEUP.md](TheNotebook/WRITEUP.md) |
| Time | Linux | Medium | [Time/WRITEUP.md](Time/WRITEUP.md) |
| Unicode | Linux | Medium | [Unicode/WRITEUP.md](Unicode/WRITEUP.md) |
| Unobtainium | Linux | Hard | [Unobtainium/WRITEUP.md](Unobtainium/WRITEUP.md) |
| Writer | Linux | Medium | [Writer/WRITEUP.md](Writer/WRITEUP.md) |

## Repository Structure

Each machine folder generally contains:
- `WRITEUP.md`: the structured writeup (recon, enumeration, foothold, privilege escalation, lessons learned).
- `nmap/`: raw nmap scan output collected during the assessment.
- `files/`: small, text-based exploit/PoC scripts referenced in the writeup (where applicable).

Large binaries, compiled tools, private keys, packet captures, and other loot generated during these engagements have been deliberately omitted from this repository. Where relevant, each writeup notes what was removed for reference.

## Disclaimer

All content in this repository pertains exclusively to **retired** HTB machines and is shared strictly for educational and portfolio purposes. No content here targets live/active machines, and no proprietary or confidential HTB material (challenge files, flags belonging to others, etc.) is included.
