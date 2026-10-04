# Surveillance

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Medium |
| **IP Address** | 10.10.11.245 |
| **Status** | Retired |

## Overview
Surveillance is a Craft CMS-based target. According to the official machine description, the box is compromised by abusing **CVE-2023-41892**: a PHP object-injection flaw in Craft CMS that allows an attacker to inject PHP into the CMS's web log files and achieve remote code execution. Privilege escalation pivots through ZoneMinder, exploiting an authenticated remote code injection in `HostController.php` to obtain a shell as the `zoneminder` user, and finally abuses a `sudo` entry that allows setting the `LD_PRELOAD` environment variable through the ZoneMinder admin panel to load a malicious shared library as root.

Note: the archived material for this machine is limited to the initial `nmap` scans; no further enumeration/exploitation notes, scripts, or loot were preserved locally, so this write-up focuses on the recon phase and the publicly documented attack chain rather than a full step-by-step walkthrough.

## Reconnaissance
Two scans were preserved under `nmap/`.

`nmap/initial` (`-sC -sV`):
```
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.4 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to http://surveillance.htb/
```

`nmap/allports` (`-p- -T4`):
```
22/tcp   open  ssh
80/tcp   open  http
1212/tcp open  lupa
```

The web root redirected to the virtual host `surveillance.htb`, and an additional service was found listening on port 1212 (identified by nmap only generically as `lupa`).

## Enumeration
No local enumeration artifacts (gobuster output, application screenshots, or notes) were preserved for this machine beyond the port scans above. Based on the official Hack The Box synopsis, the `surveillance.htb` vhost hosts a Craft CMS instance, which is the entry point for the rest of the chain.

## Foothold
Per the public machine description, the foothold is obtained by exploiting **CVE-2023-41892**, a PHP object-injection vulnerability in Craft CMS. The vulnerability is abused to inject PHP payloads into Craft's own web request log files, which are then included/executed by the application to achieve remote code execution as the web-server user.

## Privilege Escalation
The documented privilege-escalation path pivots through **ZoneMinder** (a video surveillance management suite, consistent with the port 1212 service and the box's name/theme):
1. An authenticated remote code injection vulnerability in ZoneMinder's `HostController.php` is used to get a shell as the `zoneminder` user.
2. The `zoneminder` user has a `sudo` rule allowing configuration of an `LD_PRELOAD` environment variable through the ZoneMinder web admin panel.
3. Setting `LD_PRELOAD` to a malicious shared library and triggering the sudo-permitted command loads attacker-controlled code in a root-owned process, yielding a root shell.

## Lessons Learned
- Content-management systems that store or replay user-controlled log data are prone to log-poisoning RCE if PHP objects/tags can be injected into the log stream.
- Niche, specialized web applications (e.g. NVR/surveillance dashboards like ZoneMinder) are frequently the "second" internal application discovered during CTF-style engagements and can carry authenticated RCE bugs of their own.
- Overly permissive `sudo` rules that let a low-privileged service account control environment variables like `LD_PRELOAD` are equivalent to full code execution as the target user.

## Tools & References
- CVE-2023-41892: Craft CMS PHP object injection / RCE.
- ZoneMinder `HostController.php` authenticated RCE (used for lateral movement to the `zoneminder` user).
- No local loot files, scripts, or additional notes were available for this machine to include or omit: the original `notes` file was empty.
