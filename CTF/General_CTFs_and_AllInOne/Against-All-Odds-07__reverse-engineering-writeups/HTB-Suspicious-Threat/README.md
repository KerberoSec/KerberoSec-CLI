# HTB Suspicious Threat: Userland Rootkit Analysis

## Overview

Suspicious Threat is a Linux forensics challenge focused on identifying and bypassing a userland rootkit. The challenge description mentions unusual library linking behavior and missing filesystem entries despite their confirmed existence.

The objective is to investigate the system, identify the rootkit mechanism, uncover the hidden files, and retrieve the flag.

---

## Initial Enumeration

After gaining access to the target system, basic enumeration was performed to understand the environment.

```bash
pwd
ls
ls -a

cd /
ls
```

### Observations

* The current working directory was `/root`.
* No obvious suspicious files were visible.
* The filesystem structure appeared normal.
* Several common utilities such as `file`, `strings`, and `lsmod` were unavailable.

<img width="926" height="196" alt="initial_enum" src="https://github.com/user-attachments/assets/8f35ead1-9297-4351-93ed-6955218609da" />

The challenge description specifically referenced library loading anomalies, so the investigation shifted toward the dynamic linker configuration.

---

## Investigating Library Preloading

The first step was checking whether the `LD_PRELOAD` environment variable was set.

```bash
echo $LD_PRELOAD
```

No preload library was configured through the environment.

The system-wide preload configuration was then inspected:

```bash
cat /etc/ld.so.preload
```

Output:

```text
/lib/x86_64-linux-gnu/libc.hook.so.6
```

<img width="684" height="58" alt="check_so" src="https://github.com/user-attachments/assets/cfa71114-23d4-4c05-90e8-46ebda26bcd2" />

### Analysis

The presence of a custom shared library inside `/etc/ld.so.preload` is highly suspicious.

Unlike the `LD_PRELOAD` environment variable, `/etc/ld.so.preload` forces the specified library to be loaded into nearly every dynamically linked process on the system.

This mechanism is commonly abused by userland rootkits to intercept and manipulate libc functions.

---

## Investigating the Suspicious Library

The referenced shared object was inspected directly:

```bash
cat /lib/x86_64-linux-gnu/libc.hook.so.6
```

Although the output was mostly binary data, several interesting strings were visible:

```text
orig_readdir
orig_readdir64
orig_fopen
readdir
readdir64
fopen
pr3l04d_
ld.so.preload
```

<img width="947" height="470" alt="reading_str" src="https://github.com/user-attachments/assets/05a7aad6-ec57-4b87-8656-b4de48008129" />

### Analysis

These strings strongly suggest that the library hooks filesystem-related libc functions:

* `readdir()`
* `readdir64()`
* `fopen()`

A likely objective of the rootkit is to hide files or directories by intercepting directory enumeration requests and filtering specific entries before they are displayed to the user.

The embedded string `pr3l04d_` appeared particularly suspicious and was noted for later investigation.

---
Based on the evidence collected so far, the following hypothesis was formed:

> The shared object `libc.hook.so.6` is a userland rootkit loaded globally through `/etc/ld.so.preload`. The library hooks functions such as `readdir()` and `fopen()` to hide files or directories from userland utilities.

The next step was to disable the preload mechanism and verify whether hidden filesystem entries became visible.

---

## Disabling the Rootkit

Rather than deleting the preload configuration, it was renamed to preserve evidence.

```bash
mv /etc/ld.so.preload /tmp/preload.bak
```

<img width="890" height="348" alt="mv_rootki" src="https://github.com/user-attachments/assets/deede692-6486-422e-b612-f0382dfc9f6a" />

### Why Rename Instead of Delete?

Renaming preserves the original artifact for future analysis while preventing newly spawned processes from loading the malicious shared object.

This follows a more forensic-friendly methodology than simply deleting evidence.

---

## Searching for Hidden Files

With the preload mechanism disabled, filesystem enumeration was repeated.

```bash
find / -name "*flag*" 2>/dev/null
```

Output:

```text
/var/pr3l04d_/flag.txt
```

<img width="789" height="329" alt="find" src="https://github.com/user-attachments/assets/848dcbcd-5e0f-4b81-ba18-7737ba9b4b1e" />

### Analysis

The previously observed string:

```text
pr3l04d_
```

was revealed to be the name of a hidden directory:

```text
/var/pr3l04d_
```

This confirms that the rootkit was actively concealing filesystem entries associated with that directory.

Once the preload library was disabled, the hidden content became visible to standard userland tools.

---

## Flag Retrieval

The flag file was accessed directly:

```bash
cat /var/pr3l04d_/flag.txt
```

Output:

```text
HTB{Us3rL4nd_R00tK1t_R3m0v3dd!}
```
<img width="751" height="104" alt="flag" src="https://github.com/user-attachments/assets/828695b1-6f1b-4e9f-b6cb-c47baab545a0" />

---

## Root Cause Analysis

The rootkit operated entirely in user space using the Linux preload mechanism.

### Indicators of Compromise

* Presence of `/etc/ld.so.preload`
* Suspicious library `libc.hook.so.6`
* Hooked filesystem functions:

  * `readdir()`
  * `readdir64()`
  * `fopen()`
* Hidden directory:

  * `/var/pr3l04d_`

---

## Lessons Learned

* Userland rootkits commonly abuse `LD_PRELOAD` and `/etc/ld.so.preload`.
* Hooking libc functions is sufficient to hide files and directories from most userland utilities.
* Hidden files may still exist even when standard tools cannot display them.
* Preserving evidence is important during forensic investigations.
* The Linux dynamic linker is a common persistence and stealth mechanism used by malware.

