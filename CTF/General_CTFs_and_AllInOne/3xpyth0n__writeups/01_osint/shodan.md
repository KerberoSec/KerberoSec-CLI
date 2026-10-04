# TryHackMe: Shodan.io

**Objectif :** comprendre la logique de Shodan, utiliser ses filtres pour retrouver des services et des systemes exposes, repondre aux questions de la room sur les recherches, les dorks et les fonctions de monitoring, puis formaliser une methode exploitable en phase de reconnaissance offensive.

---

## Introduction

La room **Shodan.io** n'est pas une machine a compromettre. C'est une room de **reconnaissance passive** orientee recherche de services exposes sur Internet.

Ce qui la rend utile pour un profil pentest ou red team, c'est qu'elle apprend a :

- raisonner en termes de bannieres et de metadonnees
- manipuler les filtres Shodan
- croiser ASN, produit, ville, pays et OS
- reutiliser des dorks pour prioriser une surface d'attaque

Le writeup ci-dessous suit la structure de la room et reprend chaque question avec le raisonnement associe.

---

## Task 1: Introduction

### Perimetre

Cette premiere partie explique le positionnement de Shodan :

- moteur de recherche pour les services exposes
- indexation des bannieres reseau
- usage courant pour l'IoT, les services admin exposes et les technologies specifques

La room rappelle aussi qu'il existe une difference importante entre :

- consulter une ressource publiquement exposee
- tenter d'acceder illegalement a un systeme protege

### Question: Go to Shodan.io

Il s'agit simplement d'ouvrir le site.

### Reponse

`Done`

---

## Task 2: Filters

La room introduit les filtres de recherche Shodan, qui sont au coeur de l'outil. L'idee cle est qu'on ne cherche pas seulement "des IP", mais des combinaisons de proprietes :

- `asn:`
- `product:`
- `country:`
- `city:`
- `port:`
- `os:`
- `vuln:`

### Question: What command is used to find Eternal Blue exploits on Shodan using the vuln filter?

L'exemple donne dans la room est explicite : pour cibler les machines exposees et marquees comme vulnerables a EternalBlue, on utilise :

```text
vuln:ms17-010
```

### Reponse

**EternalBlue filter:** `vuln:ms17-010`

---

## Task 3: Google & Filtering

Cette partie est la plus interessante, car elle force a lire les facettes renvoyees par Shodan plutot qu'a se contenter d'une seule requete brute.

La room prend l'ASN de Google :

```text
AS15169
```

puis demande plusieurs observations a partir de recherches ciblees.

### Question 1: What is the top operating system for MYSQL servers in Google's ASN?

Je pars de la recherche :

```text
asn:AS15169 product:MySQL
```

Dans les resultats publics recoupes par les writeups, l'OS / version la plus frequente remontee dans les facettes est :

```text
5.6.40-84.0-log
```

Ce n'est pas un OS au sens "Ubuntu / Debian", mais bien la valeur telle qu'elle ressort dans l'interface Shodan pour cette question.

### Reponse

**Top operating system for MySQL:** `5.6.40-84.0-log`

### Question 2: What is the 2nd most popular country for MYSQL servers in Google's ASN?

En observant la facette "Country" sur cette meme recherche, la deuxieme entree la plus frequente est :

```text
Netherlands
```

### Reponse

**2nd most popular country:** `Netherlands`

### Question 3: Under Google's ASN, which is more popular for nginx, Hypertext Transfer Protocol or Hypertext Transfer Protocol with SSL?

Je change la recherche pour :

```text
asn:AS15169 product:nginx
```

Puis je compare les facettes de protocoles. La bonne reponse ici est :

```text
Hypertext Transfer Protocol
```

### Reponse

**Most popular for nginx:** `Hypertext Transfer Protocol`

### Question 4: Under Google's ASN, what is the most popular city?

La facette ville la plus frequente ressort comme :

```text
Mountain View
```

### Reponse

**Most popular city:** `Mountain View`

### Question 5: Under Google's ASN in Los Angeles, what is the top operating system according to Shodan?

Je raffine avec :

```text
asn:AS15169 city:"Los Angeles"
```

La valeur dominante remontee est :

```text
PAN-OS
```

### Reponse

**Top operating system in Los Angeles:** `PAN-OS`

### Question 6: Using the top Webcam search from the explore page, does Google's ASN have any webcams? Yay / nay.

En combinant la recherche webcam avec l'ASN Google, j'obtiens :

```text
Nay
```

### Reponse

**Any webcams?** `Nay`

---

## Raisonnement OSINT derriere les requetes

Cette tache montre plusieurs lecons utiles :

1. une requete Shodan n'est presque jamais suffisante seule
2. les facettes donnent souvent plus d'information utile que la liste brute des resultats
3. les ASN servent a raisonner par "propriete reseau" plutot que par domaine
4. le couplage `product:` + `asn:` permet de retrouver une technologie sur un perimetre donne

En pentest, cette approche sert a :

- estimer une exposition
- prioriser les piles technologiques
- chercher des services inattendus
- identifier des poches geographiques ou operatives interessantes

---

## Task 4: Shodan Monitor

Cette partie presente la fonctionnalite de suivi en continu des actifs exposes.

L'idee n'est plus seulement de rechercher ponctuellement, mais de surveiller un perimetre pour etre alerte :

- des nouveaux services ouverts
- des vulnerabilites detectees
- des ports inhabituels
- des hots ou IP notables

### Question: What URL takes you to Shodan Monitor?

La room donne directement le lien :

```text
https://monitor.shodan.io/dashboard
```

### Reponse

**Shodan Monitor URL:** `https://monitor.shodan.io/dashboard`

---

## Task 5: Shodan Dorking

Cette partie s'attarde sur des requetes plus "opinionated", presque des dorks, qui permettent de chercher des classes d'exposition ou de compromission.

Un exemple donne dans la room vise des ecrans de rancon :

```text
has_screenshot:true encrypted attention
```

Le raisonnement est simple :

- `has_screenshot:true` limite aux services dont Shodan a capture un rendu visuel
- `encrypted attention` exploite l'OCR applique a ce screenshot

### Question: What dork lets us find PCs infected by Ransomware?

### Reponse

**Ransomware dork:** `has_screenshot:true encrypted attention`

---

## Task 6: Shodan Extension

Cette partie de la room est surtout informative. L'extension Shodan permet d'obtenir rapidement, depuis le navigateur :

- l'IP du serveur
- les ports exposes
- la localisation
- les problemes de securite visibles

### Question: This will be nice for bug bounties!

Il s'agit d'une validation de lecture, sans reponse technique complexe.

### Reponse

`Done`

---

## Task 7: Exploring the API & Conclusion

La room rappelle que l'API Shodan permet :

- d'automatiser les recherches
- d'integrer Shodan dans des scripts de veille
- d'appliquer des controles reguliers sur un perimetre propre

### Question: Read the blog post above!

### Reponse

`Done`

---

## Resume des reponses de la room

- Go to Shodan.io `Done`
- What command is used to find Eternal Blue exploits on Shodan using the vuln filter? `vuln:ms17-010`
- What is the top operating system for MYSQL servers in Google's ASN? `5.6.40-84.0-log`
- What is the 2nd most popular country for MYSQL servers in Google's ASN? `Netherlands`
- Under Google's ASN, which is more popular for nginx, Hypertext Transfer Protocol or Hypertext Transfer Protocol with SSL? `Hypertext Transfer Protocol`
- Under Google's ASN, what is the most popular city? `Mountain View`
- Under Google's ASN in Los Angeles, what is the top operating system according to Shodan? `PAN-OS`
- Using the top Webcam search from the explore page, does Google's ASN have any webcams? `Nay`
- What URL takes you to Shodan Monitor? `https://monitor.shodan.io/dashboard`
- What dork lets us find PCs infected by Ransomware? `has_screenshot:true encrypted attention`
- This will be nice for bug bounties! `Done`
- Read the blog post above! `Done`

---

## Methodologie retenue

Pour resoudre la room proprement, la sequence est la suivante :

1. comprendre ce qu'est une banniere Shodan
2. apprendre les filtres de base
3. raisonner par ASN
4. lire les facettes plutot que la simple liste des hots
5. manipuler des dorks specialises
6. relier le tout a un usage offensif ou defensif realiste

---

## Ce qu'il faut retenir pour un profil offensif

Shodan est utile en pre-engagement et en reconnaissance passive parce qu'il permet de :

- cartographier une exposition externe
- confirmer la presence d'une techno sans scanner soi-meme
- trouver des interfaces admin, VPN, cameras, panels et services exotiques
- reduire rapidement une surface d'attaque a un sous-ensemble pertinent

Il ne remplace pas les autres phases de recon, mais il accelere fortement l'orientation initiale.

---

## Conclusion

**Shodan.io** est une room courte, mais tres rentable. Elle ne donne pas un shell, mais elle apprend a poser les bonnes questions avant meme d'interagir avec une cible. Pour un writeup offensif serieux, c'est exactement le type de competence qu'il faut documenter.

***Auteur*** *: Saad Idrissi*
