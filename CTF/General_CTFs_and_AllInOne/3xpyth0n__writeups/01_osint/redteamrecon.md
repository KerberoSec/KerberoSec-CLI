# TryHackMe: Red Team Recon

**Objectif :** structurer une demarche de reconnaissance ouverte sur un domaine cible, utiliser les outils integres du systeme, des operateurs Google, des moteurs specialises, Recon-ng et Maltego, puis repondre a toutes les questions de la room avec une logique exploitable en contexte red team.

---

## Introduction

La room **Red Team Recon** est une room OSINT / recon qui s'inscrit parfaitement dans une logique offensive. Elle ne consiste pas a "trouver un flag cache" au hasard, mais a pratiquer des gestes concrets :

- WHOIS
- resolution DNS
- recherche Google avancee
- usage de Shodan
- decouverte de modules Recon-ng
- exploration de transforms Maltego

Pour un profil penetration tester ou red team, c'est une room importante parce qu'elle formalise les etapes qui precedent tout engagement technique.

---

## Task 1: Introduction

Cette premiere tache pose le contexte : la reconnaissance consiste a accumuler un maximum d'informations utiles avant toute interaction intrusive.

### Reponse

`Done`

---

## Task 2: Taxonomy of Reconnaissance

La room rappelle la distinction entre :

- reconnaissance passive
- reconnaissance active

Le point important pour un writeup offensif est le suivant :

- **passive** : on collecte sans interagir directement avec la cible
- **active** : on provoque une reponse de la cible

Sur cette room, la majorite des techniques restent du cote passif ou tres legerement actives.

### Reponse

`Done`

---

## Task 3: Built-in Tools

Cette partie montre que des outils tres simples suffisent souvent a etablir une premiere base de connaissance.

### Question 1: When was thmredteam.com created (registered)? (YYYY-MM-DD)

Je pars de `whois` :

```bash
whois thmredteam.com
```

Dans les resultats, la date d'enregistrement qui ressort est :

```text
2021-09-24
```

### Reponse

**Creation date:** `2021-09-24`

### Question 2: To how many IPv4 addresses does clinic.thmredteam.com resolve?

J'utilise un outil DNS simple :

```bash
host clinic.thmredteam.com
```

Je retrouve **2 adresses IPv4**.

### Reponse

**IPv4 addresses:** `2`

### Question 3: To how many IPv6 addresses does clinic.thmredteam.com resolve?

La meme commande, ou `dig AAAA`, permet de compter les enregistrements IPv6.

Le resultat attendu par la room est :

```text
2
```

### Reponse

**IPv6 addresses:** `2`

---

## Pourquoi ces outils "basiques" comptent encore

La room insiste a juste titre sur un point important : avant d'ouvrir des plateformes plus lourdes, il faut savoir tirer parti de :

- `whois`
- `host`
- `dig`
- `nslookup`

En pratique, ces commandes donnent deja :

- la chronologie d'un domaine
- ses nameservers
- sa surface DNS
- ses sous-domaines a resolution multiple

Ce sont des bases tres utiles avant de passer a des outils plus riches.

---

## Task 4: Advanced Searching

Ici, on bascule sur les operateurs Google pour la recherche avancee.

### Question 1: How would you search using Google for xls indexed for http://clinic.thmredteam.com?

La combinaison attendue est :

```text
filetype:xls site:clinic.thmredteam.com
```

Le raisonnement est simple :

- `filetype:xls` pour restreindre a un type de fichier
- `site:` pour borner au domaine cible

### Reponse

**Google query for xls files:** `filetype:xls site:clinic.thmredteam.com`

### Question 2: How would you search using Google for files with the word passwords for http://clinic.thmredteam.com?

Ici, on ne filtre pas sur le type, mais sur un mot-cle contenu dans les resultats du site cible :

```text
passwords site:clinic.thmredteam.com
```

### Reponse

**Google query for files containing passwords:** `passwords site:clinic.thmredteam.com`

---

## Ce que montre cette tache

Le but n'est pas juste de memoriser deux syntaxes. La room veut surtout montrer que Google devient un outil de recon offensif des qu'on combine :

- un mot-cle metier ou sensible
- une cible
- un type de document

Exemples tres classiques en mission :

- `filetype:pdf site:example.com`
- `site:example.com confidential`
- `site:example.com intitle:login`

Cette logique de recherche controlee est beaucoup plus efficace qu'une requete "naturelle" trop vague.

---

## Task 5: Specialized Search Engines

La room introduit ici un moteur de recherche specialise : **Shodan**.

### Question: What is the shodan command to get your Internet-facing IP address?

La commande attendue est celle du client CLI Shodan :

```text
shodan myip
```

### Reponse

**Shodan command:** `shodan myip`

---

## Task 6: Recon-ng

Recon-ng est un framework de reconnaissance modulaire. La room demande surtout de savoir s'y orienter.

### Question 1: How do you start recon-ng with the workspace clinicredteam?

La commande attendue est :

```text
recon-ng -w clinicredteam
```

### Reponse

**Start Recon-ng with workspace:** `recon-ng -w clinicredteam`

### Question 2: How many modules with the name virustotal exist?

Dans Recon-ng, la recherche :

```text
marketplace search virustotal
```

fait ressortir **2 modules**.

### Reponse

**Virustotal modules:** `2`

### Question 3: There is a single module under hosts-domains. What is its name?

La reponse attendue est :

```text
migrate_hosts
```

### Reponse

**hosts-domains module:** `migrate_hosts`

### Question 4: censys_email_address is a module that "retrieves email addresses from the TLS certificates for a company." Who is the author?

En consultant les informations du module :

```text
marketplace info censys_email_address
```

on obtient :

```text
Censys Team
```

### Reponse

**Author:** `Censys Team`

---

## Task 7: Maltego

La room termine sur Maltego et son ecosysteme de transforms.

### Question 1: What is the name of the transform that queries NIST's National Vulnerability Database?

La reponse attendue est :

```text
NIST NVD
```

### Reponse

**NIST transform:** `NIST NVD`

### Question 2: What is the name of the project that offers a transform based on ATT&CK?

La reponse obtenue est :

```text
MISP Project
```

### Reponse

**ATT&CK-based project:** `MISP Project`

---

## Task 8: Summary

Cette derniere partie ne demande qu'une validation de lecture, mais elle clot surtout un enchainement methodologique coherent.

### Reponse

`Done`

---

## Resume des reponses de la room

- Introduction `Done`
- Taxonomy of Reconnaissance `Done`
- When was thmredteam.com created (registered)? `2021-09-24`
- To how many IPv4 addresses does clinic.thmredteam.com resolve? `2`
- To how many IPv6 addresses does clinic.thmredteam.com resolve? `2`
- How would you search using Google for xls indexed for http://clinic.thmredteam.com? `filetype:xls site:clinic.thmredteam.com`
- How would you search using Google for files with the word passwords for http://clinic.thmredteam.com? `passwords site:clinic.thmredteam.com`
- What is the shodan command to get your Internet-facing IP address? `shodan myip`
- How do you start recon-ng with the workspace clinicredteam? `recon-ng -w clinicredteam`
- How many modules with the name virustotal exist? `2`
- There is a single module under hosts-domains. What is its name? `migrate_hosts`
- censys_email_address ... Who is the author? `Censys Team`
- What is the name of the transform that queries NIST's National Vulnerability Database? `NIST NVD`
- What is the name of the project that offers a transform based on ATT&CK? `MISP Project`
- Summary `Done`

---

## Methodologie employee

Pour traiter la room proprement, j'ai suivi un schema de recon simple et reutilisable :

1. etablir les metadonnees de domaine avec WHOIS
2. observer la surface DNS avec `host` et `dig`
3. raffiner les recherches web avec `site:` et `filetype:`
4. completer avec un moteur specialise comme Shodan
5. passer sur un framework de recon comme Recon-ng
6. terminer sur un outil de visualisation et de pivot comme Maltego

---

## Pourquoi cette room est utile

**Red Team Recon** a une vraie valeur pratique parce qu'elle apprend a construire une **chaine de reconnaissance** plutot qu'a empiler des commandes.

Dans un engagement reel, cette progression sert a :

- trouver des actifs oublies
- identifier des documents sensibles indexes
- cartographier une presence externe
- reperer des modules de collecte adaptes
- visualiser des relations techniques et organisationnelles

Autrement dit, ce n'est pas une room "theorique". C'est une base de travail.

---

## Conclusion

Cette room est une bonne synthese de la reconnaissance offensive moderne : un peu d'outils natifs, un peu de Google, un peu de moteurs specialises, puis des frameworks dedies. Le resultat n'est pas un shell, mais un perimetre beaucoup mieux compris, ce qui reste souvent la partie la plus rentable d'un engagement.

***Auteur*** *: Saad Idrissi*
