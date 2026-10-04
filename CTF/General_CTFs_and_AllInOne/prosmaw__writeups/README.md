# writeups

This repo list some of my security-related writeups covering blue team work (SIEM lab, Incident response, forensics) and Red Team (Web exploitation and more).

Source for [prosmaw.github.io/writeups](https://prosmaw.github.io/writeups/), built with [MkDocs Material](https://squidfunk.github.io/mkdocs-material/) and deployed via GitHub Pages.

## What You'll Find

- A growing list of security labs and CTF writeups, each walking through the environment, the attack simulation, and the investigation.
- Screenshots throughout, so you can follow each step alongside the writeup.

## Writeups

- **[SOC Detection Lab](https://prosmaw.github.io/writeups/soc-detection-lab/)**: Simulation and detection of real-world attack techniques (Kerberoasting, Credential Dumping) in a self-built Active Directory environment with a Splunk SIEM.
- **[Insider Threat IR Lab](https://prosmaw.github.io/writeups/insider-threat-ir/)**: Following the NIST Incident Response process to investigate a simulated insider-threat data leak, from AD audit policy setup and a honey file, through log analysis, to containment and lessons learned.
- **[SANS Holiday Hack Challenge 2025 ↗](https://prosmaw.github.io/sans-holiday-hack-challenge2025/)**: Write-up of the SANS Holiday Hack Challenge 2025 (hosted in a separate repo).

## Local development

```bash
pip install mkdocs-material
mkdocs serve
```
