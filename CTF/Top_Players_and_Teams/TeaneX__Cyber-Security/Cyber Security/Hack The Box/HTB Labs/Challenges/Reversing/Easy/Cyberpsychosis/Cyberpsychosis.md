# 🧠 HTB: Challenge: Cyberpsychosis Write-up

**Category:** Reversing  
**Difficulty:** EASY
**File provided:** `Cyberpsychosis.zip`  
**Platform:** Hack The Box
**Flag:** `HTB{N0w_Y0u_C4n_S33_m3_4nd_th3_r00tk1t_h4s_b33n_sUcc3ssfully_d3f34t3d!!}`

---
### 📁 Files

After unzipping the provided archive:

**Input**
```bash
unzip Cyberpsychosis.zip
```

Contents:

- `diamorphine.ko`: kernel module (rootkit)
    
- `LICENSE.txt`: reveals the name "Diamorphine", a known open-source rootkit
    

---

### 🔍 Analysis

We begin by analyzing the module:

**Input**
```bash
file diamorphine.ko
```

> ELF 64-bit relocatable, x86-64, with debug_info, not stripped

This tells us we have a 64-bit kernel object file with symbols intact. Next, we inspect symbols to find the initialization routine:

**Input**
```bash
readelf -s diamorphine.ko | grep init
```

Key output:

>61: 0000000000000000   232 FUNC    GLOBAL DEFAULT    5 init_module

This confirms that `init_module` is the entry point.

We also see function and object names indicating syscall hooks:

**Input**
```bash
readelf -s diamorphine.ko | grep hack
```

Results include:

- `hacked_getdents`
    
- `hacked_getdents64`
    
- `hacked_kill`
    

These names strongly suggest syscall hooking to **hide processes or files**: classic rootkit behavior.

---

### 🕹Remote Shell Access

We’re given access to a running system via Netcat:

**Input**
```bash
nc 94.237.58.135 36839
```

We confirm root access:

**Input:**
```bash
whoami
```
**Output:**
>whoami
>root

**Input:**
```bash
id
```
**Output**
>id
>uid=0(root) gid=0(root) groups=1000

**Input**
```bash
ps aux
```
**Output**
>ps aux
>PID   USER     TIME  COMMAND
    1 root      0:01 {init} /bin/sh /init
    2 root      0:00 [kthreadd]
    3 root      0:00 [rcu_gp]
    4 root      0:00 [rcu_par_gp]

**Input**
```bash
 kill -46 0
```
**Output**
>kill -46 0

**Input**
```bash
lsmod
```
**Output**
>lsmod
>diamorphine 16384 0: Live 0xffffffffc03a1000 (OE)

**Input**
```bash
rmmod diamorphine
```
**Output**
>cd /opt/psychosis

---

### 🎯 Getting the Flag

We navigate to `/opt/psychosis`, which was hidden earlier:

**Input**
```bash
ls
```

**Output**
>ls
>diamorphine.ko  flag.txt

Finally, we retrieve the flag:
**Input**
```bash
cat flag.txt
```

### ✅ Flag
```
HTB{N0w_Y0u_C4n_S33_m3_4nd_th3_r00tk1t_h4s_b33n_sUcc3ssfully_d3f34t3d!!}
```

---
### 📝 Summary

In the _Cyberpsychosis_ challenge, we were given a suspicious kernel module (`diamorphine.ko`) known to be a rootkit. After analyzing the symbols using `readelf`, we identified hooked syscall functions like `hacked_getdents` and `hacked_kill`, which indicated hidden behavior.

By connecting to the remote system via Netcat, we confirmed root access and observed that the `diamorphine` module was actively loaded. Using `rmmod`, we removed the rootkit, which revealed the previously hidden `/opt/psychosis` directory. Inside, we found `flag.txt` 

## 🏷️ Tags

#ReverseEngineering #Cyberpsychosis #HackTheBox #CTF 

[[Reverse Engineering]]