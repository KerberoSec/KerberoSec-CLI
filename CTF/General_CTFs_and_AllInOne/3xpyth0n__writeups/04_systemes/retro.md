# TryHackMe: Retro

**Objectif :** decouvrir le repertoire cache du site, recuperer des identifiants a partir d'un blog WordPress, obtenir un acces RDP sur la machine Windows, puis elever les privileges pour lire `user.txt` et `root.txt`.

---

## Introduction

La room **Retro** est une machine Windows qui melange enumeration web, reutilisation de credentials et privilege escalation locale. Elle est interessante parce qu'elle propose plusieurs chemins, mais la voie la plus directe reste tres coherente :

1. trouver le blog cache
2. recuperer un couple utilisateur / mot de passe
3. se connecter en RDP
4. exploiter la faiblesse locale pour devenir SYSTEM

Le tout se fait avec des outils tres classiques. La vraie difficulte consiste surtout a bien lire ce que le site nous donne deja.

---

## Task 1: Pwn

La room pose seulement trois questions, mais pour faire un vrai writeup, il faut reconstituer toute la chaine d'attaque.

### Question 1: A web server is running on the target. What is the hidden directory which the website lives on?

Je commence par un scan reseau :

```bash
nmap -Pn -sV <IP>
```

Je retrouve deux ports utiles :

- `80/tcp` pour le site web
- `3389/tcp` pour RDP

La page d'accueil sur le port 80 ne donne pas grand-chose. Je passe donc a l'enumeration de repertoires :

```bash
gobuster dir -u http://<IP>/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt
```

Ou avec `ffuf` si prefere :

```bash
ffuf -u http://<IP>/FUZZ -w /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt
```

Le repertoire cache qui ressort est :

```text
/retro
```

### Reponse

**Hidden directory:** `/retro`

---

## Enumeration du blog WordPress

En visitant `http://<IP>/retro/`, je tombe sur un blog WordPress au look retro, exactement dans le theme de la machine.

Tous les billets sont signes par le meme auteur :

```text
Wade
```

Ce detail compte, car il fournit un premier nom d'utilisateur plausible pour la suite.

En parcourant les commentaires, notamment sur le billet **Ready Player One**, je trouve un message laisse par Wade pour lui-meme. C'est typiquement le genre d'indice tres realiste qu'on retrouve sur des environnements mal tenus.

Le commentaire contient :

```text
parzival
```

Le raisonnement devient alors simple :

- auteur du blog : `Wade`
- mot de passe probable : `parzival`

Ces identifiants fonctionnent au minimum sur WordPress, et surtout sur RDP.

---

## Acces initial via RDP

Je teste la connexion distante :

```bash
xfreerdp /u:Wade /p:parzival /v:<IP>
```

La connexion reussit. J'entre sur le bureau de l'utilisateur `Wade`.

Le premier flag se trouve sur son bureau. Selon l'affichage des extensions, le fichier peut apparaitre comme `user.txt` ou `user.txt.txt`, mais la valeur reste la meme.

```cmd
type C:\Users\Wade\Desktop\user.txt.txt
```

### Reponse

**user.txt:** `3b99fbdc6d430bfb51c72c651a261927`

---

## Enumeration locale

Une fois dans la session graphique, je prends quelques minutes pour regarder ce que l'utilisateur faisait avant nous. C'est souvent un excellent raccourci sur Windows.

Deux indices tres importants apparaissent a ce stade :

- un historique navigateur pointant vers **CVE-2019-1388**
- un binaire `hhupd.exe` retrouve dans la corbeille ou dans les fichiers locaux

Cette combinaison n'est pas anodine. Le poste a clairement deja ete utilise pour tester un contournement UAC base sur la boite de dialogue de certificat Windows.

Selon les sources, une seconde voie existe egalement via **CVE-2017-0213**, mais pour cette room, la piste **CVE-2019-1388** est la plus naturelle a suivre.

---

## Identification de la vulnerabilite

**CVE-2019-1388** est une elevation de privileges Windows dans la boite de dialogue de certificat. Sur les systemes vulnerables, en ouvrant un executable en elevation, puis en naviguant dans les informations de certificat, on peut arriver a ouvrir un navigateur ou une fenetre systeme dans un contexte privilegie. Ensuite, il devient possible de lancer `cmd.exe` depuis `System32`.

Le fichier `hhupd.exe` joue ici le role de programme declencheur.

---

## Exploitation: elevation vers SYSTEM

Je restaure `hhupd.exe` si necessaire, puis je lance les etapes suivantes :

1. clic droit sur `hhupd.exe`
2. `Run as Administrator`
3. `Show more details`
4. `Show information about the publisher's certificate`
5. clic sur le lien editeur / autorite de certification
6. ouverture du navigateur
7. `Save As`
8. navigation vers `C:\Windows\System32`
9. lancement de `cmd.exe`

Le shell obtenu s'ouvre alors avec des privileges systeme eleves. Je confirme avec :

```cmd
whoami
```

Le resultat attendu est :

```text
nt authority\system
```

---

## Recuperation du flag root

Une fois le terminal eleve obtenu, je lis le flag administrateur :

```cmd
type C:\Users\Administrator\Desktop\root.txt.txt
```

### Reponse

**root.txt:** `7958b569565d7bd88d10c6f22d1c4063`

---

## Resume des reponses de la room

- A web server is running on the target. What is the hidden directory which the website lives on? `/retro`
- user.txt `3b99fbdc6d430bfb51c72c651a261927`
- root.txt `7958b569565d7bd88d10c6f22d1c4063`

---

## Commandes et actions importantes

### Scan initial

```bash
nmap -Pn -sV <IP>
```

Confirme la presence de `80` et `3389`, ce qui oriente tout de suite vers une combinaison web + RDP.

### Enumeration web

```bash
gobuster dir -u http://<IP>/ -w /usr/share/wordlists/dirbuster/directory-list-2.3-small.txt
```

Permet de trouver le repertoire cache `/retro`.

### Connexion RDP

```bash
xfreerdp /u:Wade /p:parzival /v:<IP>
```

Transforme directement l'indice du blog en acces interactif sur la machine.

### Verification du contexte

```cmd
whoami
```

Indispensable pour confirmer que le terminal final tourne bien comme `nt authority\system`.

### Lecture des flags

```cmd
type C:\Users\Wade\Desktop\user.txt.txt
type C:\Users\Administrator\Desktop\root.txt.txt
```

Simple, mais necessaire pour ne pas se tromper a cause des extensions masquees.

---

## Raisonnement complet

Ce qui fait la force de la room, c'est que tout s'enchaine logiquement :

1. le scan montre un site et un service RDP
2. le brute force de repertoires revele le blog cache
3. le blog donne un nom d'utilisateur
4. un commentaire fournit un mot de passe plausible
5. le mot de passe est reutilise pour RDP
6. l'historique local oriente vers la bonne CVE
7. le binaire laisse sur place permet l'escalade

Autrement dit, la room ne demande pas de "deviner". Elle demande surtout de ne pas ignorer les petits indices.

---

## Note sur le second chemin

Plusieurs sources rappellent qu'il existe une autre voie d'elevation, souvent via **CVE-2017-0213** apres une enumeration locale plus poussee. C'est coherent avec la description officielle de la room qui mentionne plusieurs chemins possibles.

Pour ce writeup, j'ai volontairement retenu la voie **CVE-2019-1388** parce que :

- elle colle le mieux aux indices laisses sur le poste
- elle correspond aux indices laisses sur le poste
- elle s'inscrit le mieux dans la narration de la room

---

## Conclusion

**Retro** est une excellente machine Windows pour debuter sur des chaines d'attaque credibles : fuite d'identifiants dans un contenu web, reutilisation de mot de passe, puis privilege escalation locale appuyee sur les traces laissees par l'utilisateur. Rien n'est gratuit, mais rien n'est arbitraire non plus.

***Auteur*** *: Saad Idrissi*
