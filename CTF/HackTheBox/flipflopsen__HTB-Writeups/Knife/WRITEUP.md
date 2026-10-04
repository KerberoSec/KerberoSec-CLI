# Knife

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Easy |
| **IP Address** | 10.10.10.242 |
| **Status** | Retired |

## Overview
Knife is an easy-rated Linux machine running a PHP-based "Emergent Medical Idea" web application. The web server discloses that it is running an extremely rare, backdoored development build of PHP (8.1.0-dev), which contains a publicly known unauthenticated remote code execution backdoor triggered via a malformed HTTP header. Exploiting this backdoor provides a shell as the web-server user (`james`), and a subsequent `sudo` misconfiguration allowing an unrestricted `knife` (Chef) command to run as root is used to fully escalate privileges.

## Reconnaissance
`nmap -sC -sV` against `10.10.10.242` found only two open ports:

```
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    Apache httpd 2.4.41 (Ubuntu)
|_http-title:  Emergent Medical Idea
```

A full-port scan (`nmap -p-`) confirmed no additional services beyond SSH (22) and HTTP (80).

## Enumeration
Inspecting the HTTP response headers from the web application revealed the exact PHP version in use: **PHP 8.1.0-dev**. This specific pre-release build was briefly distributed in March 2021 with a supply-chain backdoor planted in its source (a malicious commit later reverted), which allows arbitrary PHP code execution by supplying a crafted `User-Agentt` (note the extra "t") HTTP header containing a `zerodiumsystem(...)` call.

## Foothold
The backdoor was exploited with the public PoC (`files/php-8.1.0-dev-backdoor-rce.py`), which opens a pseudo-interactive shell by repeatedly sending the malicious header:

```python
headers = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:78.0) Gecko/20100101 Firefox/78.0",
    "User-Agentt": "zerodiumsystem('" + cmd + "');"
}
response = request.get(host, headers=headers, allow_redirects=False)
```

Running the script against the target and issuing shell commands returned command execution as the low-privileged web user `james`, providing the initial foothold and access to `user.txt`. For a more stable shell during the engagement, an attacker-generated SSH key (comment `james@localhost`) was appended to `james`'s `authorized_keys` to allow direct SSH access going forward.

## Privilege Escalation
Checking `sudo -l` as `james` revealed permission to run the **Chef `knife`** command-line tool as root without a password:

```
(root) NOPASSWD: /usr/bin/knife
```

`knife` supports an `exec` subcommand that evaluates arbitrary Ruby code, and since it was runnable via `sudo` as root, this was abused directly to obtain a root shell:

```
sudo /usr/bin/knife exec -E 'exec "/bin/sh"'
```

This provided a fully privileged root shell and access to `/root/root.txt`.

## Lessons Learned
- Running unvetted/pre-release software versions (such as the backdoored PHP 8.1.0-dev build) in production is extremely dangerous: always pin and verify dependencies from trusted, official releases.
- HTTP response headers can leak precise software version information that materially aids exploitation; version disclosure should be minimized on production servers.
- `sudo` rules granting unrestricted access to multi-purpose administrative tools (Chef `knife`, and similarly `pip`, `perl`, `find`, etc.) are a common and easily-abused privilege escalation vector: check GTFOBins-style behavior before granting broad `sudo` rights to such tools.

## Tools & References
- `nmap` for service/version discovery.
- PHP 8.1.0-dev backdoor RCE PoC (kept in `files/php-8.1.0-dev-backdoor-rce.py`), originally by flast101: `https://github.com/flast101/php-8.1.0-dev-backdoor-rce`.
- `sudo -l` for privilege enumeration; Chef `knife exec` for the sudo-based root escalation (see GTFOBins entry for `knife`).
- `id_rsa`: an attacker-generated SSH keypair (comment `james@localhost`) added to `james`'s `authorized_keys` for shell stability; omitted from this repository per key-hygiene policy, as it is not a secret recovered from the target but a self-issued persistence key.
