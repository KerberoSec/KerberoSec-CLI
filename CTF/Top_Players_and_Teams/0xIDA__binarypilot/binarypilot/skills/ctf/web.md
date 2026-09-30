---
name: web
description: Web CTF challenges: injection, auth bypass, SSRF, SSTI, IDOR, logic, client-side, APIs
---

# Web CTF

Recon first, but stay bounded. Understand the app (working model: what stores state, what holds the flag), then attack the highest-value surfaces.

## Recon (bounded)

- `curl -sk https://target/`: read the response, not just status. Follow redirects manually.
- `ffuf -u https://target/FUZZ -w /usr/share/wordlists/dirb/common.txt` (or dirsearch): find the hidden endpoints; CTFs hide everything.
- JS files: download all; `cat *.js | grep -Eo '(/api/[a-zA-Z0-9_/-]+)' | sort -u`, look for debug flags, API keys, websocket URLs.
- `httpx` for fingerprinting; `whatweb` if available; `wafw00f` for WAF.
- Map auth surfaces: register/login/forgot-password, OAuth, sessions, JWTs.

## Vectors (pick by challenge shape)

- **IDOR / access control**: numeric IDs in URLs/JSON → swap to adjacent values; `admin=1`, `role=admin` on self-update.
- **Authentication / JWT**: `jwt_tool <token>` or manual decode → try `alg=none`, weak HMAC secret crack (john), kid injection, jwks confusion, claim mut (`role=user→admin`).
- **SQLi**: `sqlmap -u https://target/item?id=1 --batch --level=2 --risk=2 --dump` when it's a straightforward case; otherwise custom Python: boolean `' OR '1'='1`, time-based `IF(... ,SLEEP(3),0)`, UNION-based with `ORDER BY N--+` enumeration.
- **SSTI**: probe `{{7*7}}`, `{{config}}`, `{{ ''.__class__.__mro__[1].__subclasses__() }}` (Jinja2), `${7*7}` (Freemarker), `<%= 7*7 %>` (ERB).  GET to /flag via RCE gadget once confirmed.
- **SSRF**: point user-controllable URL at `http://127.0.0.1/` or `http://169.254.169.254/latest/meta-data/`; chain into internal admin endpoints. Note the sandbox cannot reach external metadata; the TARGET can.
- **Command injection**: `;id`, `$(id)`, backticks in parameters that pass to shell: test with a time delay: `$(sleep 3)`.
- **File upload**: extension bypass (`.php.jpg`), content-type spoof, magic bytes (GIF89a prefix + PHP web shell), SVG XSS, upload + LFI chain.
- **XXE**: classic OOB exfil; try with parameter entities; or convert JSON to XML if the server accepts it.
- **Prototype pollution (client-side)**: `__proto__` in JSON bodies or query; then look for gadget sinks in existing JS.
- **Race**: condition on TOCTOU; Python asyncio with N parallel requests; look for single-use tokens/idempotency.
- **Caching**: cache poisoning via X-Forwarded-Host / duplicate headers.
- **WebSockets**: connect with Python `websockets`; replay messages without auth checks; enumerate message types.

## Flag extraction paths

- Admin panel after privesc: look for the flag in rendered HTML, config dump, or backup file.
- Database dump via SQLi: list schemas, find `flags`/`secrets` tables, dump them directly.
- RCE → `cat /flag*`, `find / -name flag\* 2>/dev/null`, env vars (`printenv`).
- File read (LFI/XXE/SSTI) → `/flag`, `/flag.txt`, `/proc/self/environ`, config files.

## Toolkit

- Browser automation: agent-browser (login flows, client-side JS, CSRF).
- Fuzzing: ffuf, dirsearch, arjun (param discovery).
- Injection: sqlmap; wsleep/time-based via Python.
- Proxy: Caido via `caido_api` from sandbox Python for captured requests and replays.
- Wordlists: /usr/share/wordlists/ (download rockyou/seclists when needed into /home/pentester/tools/wordlists).

## Deep dives (load on demand)

`web-auth-access`, `web-auth-infra` (OAuth/OIDC), `web-client-side` (XSS/DOMPurify/DOM), `web-server-side` (PHP juggle/LFI/SQLi), `web-server-side-advanced`, `web-server-deser` (Java ysoserial), `web-server-exec` (PHP webshell/eval bypass), `web-node-prototype` (prototype pollution/VM escape), `web-web3`, `wasm`.

## Discipline

- Save payloads and responses to /workspace/solve; logs are the writeup.
- Any candidate flag: regex-verify format (`FlagY{...}` / `HTB{...}`), re-play the extraction once to confirm determinism, then platform submit tool.
