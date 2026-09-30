# HTB Cyberpsychosis: Rootkit Analysis Writeup

## Overview

Cyberpsychosis is an Easy reverse engineering challenge focused on analyzing a Linux kernel rootkit. The objective is to identify the rootkit's hidden functionality, uncover its command-and-control mechanisms, and retrieve the hidden flag.

---

## Initial Analysis

The provided file was a Linux kernel object (`diamorphine.ko`). Opening the module in Ghidra immediately revealed several suspicious functions:

* `diamorphine_init`
* `hacked_kill`
* `give_root`
* `module_hide`
* `module_show`
* `is_invisible`
* `hacked_getdents`
* `hacked_getdents64`

The presence of functions such as `give_root` and `module_hide` strongly suggested that the module implemented privilege escalation and stealth capabilities.

---

## Rootkit Initialization

Analysis of `diamorphine_init()` showed that the rootkit hooks several system calls:

```c
orig_getdents = sys_call_table[0x4e];
orig_getdents64 = sys_call_table[0xd9];
orig_kill = sys_call_table[0x3e];

sys_call_table[0x4e] = hacked_getdents;
sys_call_table[0xd9] = hacked_getdents64;
sys_call_table[0x3e] = hacked_kill;
```

The rootkit also immediately hides itself during initialization:

```c
module_hide();
```

This explains why the module does not appear in normal `lsmod` output after being loaded.

---
<img width="959" height="505" alt="diamorphine_init" src="https://github.com/user-attachments/assets/8df32d17-3072-4d7d-9cd1-aeaab0258475" />

## Signal-Based Backdoor Functionality

The most important functionality was implemented inside `hacked_kill()`.

### Signal 46: Module Hide/Show

<img width="959" height="502" alt="Hacked_kill_1" src="https://github.com/user-attachments/assets/968849c1-e661-49ff-b9c4-8d75f351c4e8" />

The function checks whether the received signal is `0x2e` (46 decimal).

When signal 46 is received, the module toggles its visibility by manipulating the kernel module linked list.

```c
if (signal == 0x2e)
{
    module_show();
}
else
{
    module_hide();
}
```

This provides a covert mechanism for hiding and revealing the rootkit.

---

### Signal 64: Privilege Escalation

<img width="959" height="503" alt="Hacked_kill_2" src="https://github.com/user-attachments/assets/29be67ba-1730-480a-8929-65cae561ad37" />

Another branch inside `hacked_kill()` handles signal `0x40` (64 decimal).

```c
prepare_creds();
commit_creds();
```

The rootkit overwrites credential structures and commits them back to the current process, effectively granting root privileges.

---

## Privilege Escalation Function

<img width="958" height="502" alt="give_root" src="https://github.com/user-attachments/assets/88c87f42-55ad-470d-8d9f-95a6ea04a978" />

The standalone function `give_root()` confirms the rootkit's privilege escalation mechanism.

```c
prepare_creds();

cred->uid = 0;
cred->gid = 0;
cred->euid = 0;
cred->egid = 0;

commit_creds(cred);
```

This is a classic Linux kernel rootkit technique used to convert the current process into root.

---

## Runtime Verification

After booting into the challenge environment:

<img width="751" height="256" alt="id_signals" src="https://github.com/user-attachments/assets/617ea082-5f47-4cd3-af24-3b7db41d2f50" />

### Verify Current Privileges

```bash
id
```

Output:

```text
uid=1000 gid=1000 groups=1000
```

The shell initially runs as an unprivileged user.

---

### Check for Hidden Module

```bash
lsmod | grep diamorphine
```

No output is returned because the rootkit hides itself during initialization.

---

### Reveal the Hidden Module

Using the functionality discovered in `hacked_kill()`:

```bash
kill -46 1
```

Checking again:

```bash
lsmod | grep diamorphine
```

Output:

```text
diamorphine 16384 0 - Live
```

The module becomes visible, confirming the behavior identified during static analysis.

---

### Trigger Privilege Escalation

<img width="751" height="78" alt="root_signal" src="https://github.com/user-attachments/assets/dbf52be4-f4aa-4264-8a07-b34720b34274" />

The privilege escalation signal can be sent to the current shell:

```bash
kill -64 $$
```

Verifying privileges:

```bash
id
```

Output:

```text
uid=0(root) gid=0(root)
```

The shell is now running as root.

---

## Flag Retrieval

After obtaining root privileges:

<img width="452" height="466" alt="rmmod" src="https://github.com/user-attachments/assets/c10538b6-04cc-4d7b-8cdf-42fb1c77e95d" />

```bash
find / -name "*flag*" 2>/dev/null
```

This revealed:

<img width="589" height="119" alt="flag" src="https://github.com/user-attachments/assets/0f5db571-872d-4f21-b1c9-cfc5de12d539" />

```text
/opt/psychosis/flag.txt
```

Reading the file:

```bash
cat /opt/psychosis/flag.txt
```

Flag:

```text
HTB{N0w_Y0u_C4n_S33_m3_4nd_th3_r00tk1t_h4s_b33n_sUcc3ssfully_d3f34t3d!!}
```

---

## In The End

This challenge demonstrates several common Linux kernel rootkit techniques:

* System call table hooking
* Module hiding through linked-list manipulation
* Process hiding support
* Signal-triggered backdoors
* Kernel-level privilege escalation via credential modification

By reversing the `diamorphine.ko` module in Ghidra and analyzing the hooked `kill()` syscall, it was possible to identify the rootkit's hidden commands, reveal the concealed module, gain root privileges, and retrieve the flag.
