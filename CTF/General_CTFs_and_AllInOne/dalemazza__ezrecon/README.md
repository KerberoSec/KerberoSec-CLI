
# ezrecon

 > This tool performs basic recon used for HTB/vulnhub. This tool is easy to use and just requires an input of an IP or hostname.
 The results are stored in easy to read formats in a single location.

**ezrecon**

<a href="https://imgur.com/9cO4xn9.png">
  <img src="https://imgur.com/9cO4xn9.png" />
</a>

---

## Table of Contents 

- [Installation](#installation)
- [Requirements](#requirements)
- [Features](#features)
- [Future Updates](#future-updates)
---

## Installation

- git clone `https://github.com/dalemazza/ezrecon.git` 
- run `chmod +x ezrecon`
- run `./ezrecon`
If you want to run this script globally you can add it your $PATH

## Requirements

- nmap
- ffuf
- nikto

## Features

- Performs a basic nmap scan against a target IP or hostname
- Performs an OS & version detection,Script Scanning and Traceroute scan for the open ports
- If port 80 is found open
  - Runs a Nikto scan
  - Runs a ffuf scan
- Runs a full port scan to check for missed ports
- Conducts VHOST fuzzing
- Compares the ports found in the full and basic scan and outputs any new ports found
- All scan results are placed into a single folder in the recon dir `$homedir/reports/`
- Lastly it outputs the time taken for the scan

---

## Future-Updates
