# Everyone's Favorite Employee: DFIR Lab Report

## Overview

This repository contains a digital forensics investigation report for the **"Everyone's Favorite Employee"** lab scenario.

The case involved analyzing a Linux disk image belonging to Karen, a junior employee at TAAUSAI, who was suspected of performing off-policy and potentially malicious activity inside the company environment.

## Scenario

After Karen started working for **TAAUSAI**, she began doing illegal or unauthorized activities inside the company. A disk image of her workstation was acquired for investigation. The machine was found to be running Kali Linux.

## Tools Used

- FTK Imager
- File system analysis
- Bash history review
- Hash analysis
- Log review
- Manual artifact correlation

## Key Findings

- The workstation was running **Kali Linux**.
- A credential dumping tool archive, `mimikatz_trunk.zip`, was found in `/root/Downloads`.
- Apache log files appeared empty, which may suggest no Apache activity or possible log tampering.
- A suspicious JPG-labeled file, `didyouthinkwedmakeiteasy.jpg`, did not behave as a valid image file.
- Bash history showed the file was analyzed with `binwalk`.
- A checklist found on the Desktop suggested possible intent:
  - Gain Bob's Trust
  - Learn how to hack
  - Profit
- Evidence of network attack simulation was identified through `irZLAohL.jpeg`.
- Logs showed successful `su` activity involving the `postgres` account at 11:26 on March 20.

## Repository Structure

```text
everyones-favorite-employee-dfir/
├── README.md
├── reports/
│   └── investigation-report.md
├── evidence/
│   └── evidence-summary.md
└── notes/
    └── analyst-notes.md
```

## Disclaimer

This project is based on a cybersecurity training lab. No real company, employee, or production system was investigated.
