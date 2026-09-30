# TryHackMe: Google Dorking

**Objectif :** comprendre le fonctionnement des moteurs de recherche, des crawlers, de `robots.txt` et des `sitemaps`, puis utiliser des operateurs Google pour construire des recherches precises et repondre a toutes les questions de la room.

---

## Introduction

La room **Google Dorking** ne demande pas d'exploitation active d'une machine. Ici, le travail consiste a apprendre a mieux **interroger les donnees deja indexees** par un moteur de recherche.

Pour un pentester, c'est tres important, parce que la phase de reconnaissance ne commence pas toujours avec Nmap. Souvent, elle commence beaucoup plus tot :

- un document PDF retrouve via Google
- une page d'administration indexee par erreur
- un fichier de configuration expose
- un `robots.txt` trop bavard
- un `sitemap.xml` qui cartographie trop bien un site

La room est theorique, mais elle est utile parce qu'elle donne une vraie base pour la recon passive.

---

## Task 1: Ye Ol' Search Engine

Cette premiere tache sert surtout d'introduction. Le point central est simple :

- un moteur de recherche n'est pas seulement une barre de recherche
- c'est une base de donnees geante construite a partir du contenu collecte sur le web

### Question: Roger dodger!

### Reponse

`Done`

---

## Task 2: Let's Learn About Crawlers

Cette tache explique comment un moteur de recherche collecte les informations sur les sites.

### Raisonnement

Les crawlers, parfois appeles spiders, parcourent les ressources du web. Ils suivent les liens, recuperent les pages et en extraient differents elements utiles :

- mots-cles
- URL
- types de fichiers
- titres
- metadonnees

Le moteur stocke ensuite ces informations dans un **index**.

### Question 1: Name the key term of what a "Crawler" is used to do. This is known as a collection of resources and their locations

Le terme cle ici est :

```text
Index
```

Le crawler construit ou alimente cet index.

### Reponse

**Key term:** `Index`

### Question 2: What is the name of the technique that "Search Engines" use to retrieve this information about websites?

Le mecanisme par lequel le moteur parcourt les pages s'appelle :

```text
Crawling
```

### Reponse

**Technique name:** `Crawling`

### Question 3: What is an example of the type of contents that could be gathered from a website?

L'exemple mis en avant dans la room est :

```text
Keywords
```

### Reponse

**Example of gathered content:** `Keywords`

---

## Ce qu'il fallait comprendre dans cette tache

Cette partie parait simple, mais elle est fondamentale.

Si un moteur de recherche indexe un contenu, cela signifie souvent qu'un utilisateur externe peut aussi le retrouver, a condition de poser la bonne requete.

Pour un test d'intrusion, cela veut dire qu'on peut parfois identifier sans scanner :

- des documents internes
- des sauvegardes
- des pages d'admin
- des repertoires listes
- des applications secondaires

---

## Task 3: Enter: Search Engine Optimisation

La room presente ici les mecanismes de **SEO**. Pour un defensif, c'est une question de visibilite. Pour un offensif, c'est surtout une question de **surface indexee**.

Une ressource bien indexee devient plus facile a retrouver :

- par les clients legitimes
- mais aussi par un attaquant

Les taches de cette section demandent surtout de lire et comparer le resultat de plusieurs outils SEO.

### Question: Use the same SEO checkup tool and other online alternatives to see how their results compare for https://tryhackme.com and http://googledorking.cmnatic.co.uk

Il s'agit d'une validation de lecture et d'observation, sans valeur technique specifique a renseigner.

### Reponse

`Done`

---

## Task 4: Beepboop: Robots.txt

`robots.txt` est un des premiers fichiers a verifier en phase de recon passive. Il ne donne pas un acces, mais il revele souvent :

- des chemins sensibles
- des repertoires caches
- des sections que le site prefere ne pas voir indexees

### Question 1: Where would "robots.txt" be located on the domain "ablog.com"

Le fichier se trouve a la racine du domaine :

```text
ablog.com/robots.txt
```

### Reponse

**robots.txt location:** `ablog.com/robots.txt`

### Question 2: If a website was to have a sitemap, where would that be located?

La convention standard est :

```text
/sitemap.xml
```

### Reponse

**Sitemap location:** `/sitemap.xml`

### Question 3: How would we only allow "Bingbot" to index the website?

Dans `robots.txt`, on designe le crawler avec la directive :

```text
User-agent: Bingbot
```

### Reponse

**Allow only Bingbot:** `User-agent: Bingbot`

### Question 4: How would we prevent a "Crawler" from indexing the directory "/dont-index-me/"?

On interdit l'indexation avec :

```text
Disallow: /dont-index-me/
```

### Reponse

**Block crawler from directory:** `Disallow: /dont-index-me/`

### Question 5: What is the extension of a Unix/Linux system configuration file that we might want to hide from "Crawlers"?

Le format attendu par la room est :

```text
.conf
```

### Reponse

**Sensitive Unix/Linux config extension:** `.conf`

---

## Pourquoi `robots.txt` est utile en pentest

`robots.txt` n'est pas un mecanisme de securite. Au contraire, c'est souvent une mine d'informations.

Exemples de repertoires qu'on peut y voir :

- `/admin/`
- `/backup/`
- `/old-site/`
- `/dev/`
- `/private/`

Ces chemins ne sont pas forcement accessibles anonymement, mais ils donnent des pistes tres fortes pour la suite.

---

## Task 5: Sitemaps

Cette section explique le role des `sitemaps`.

Un `sitemap` aide les crawlers a comprendre la structure du site et a decouvrir plus facilement ses contenus. Pour un attaquant, c'est un plan partiel de la cible.

### Question 1: What is the typical file structure of a "Sitemap"?

La reponse est :

```text
XML
```

### Reponse

**Sitemap file structure:** `XML`

### Question 2: What real life example can "Sitemaps" be compared to?

Le parallele voulu est :

```text
Map
```

### Reponse

**Real life comparison:** `Map`

### Question 3: Name the keyword for the path taken for content on a website

Le mot attendu dans la room est :

```text
Route
```

### Reponse

**Keyword for path taken for content:** `Route`

---

## Ce qu'apporte un sitemap en phase d'investigation

Un sitemap peut reveler :

- des sections rarement visibles dans la navigation principale
- des URL profondes
- la logique de categories d'un site
- des noms de pages ou de services

En pratique, c'est une excellente source pour :

- faire une cartographie rapide
- alimenter un wordlist cible
- identifier des endpoints interessants

---

## Task 6: What is Google Dorking?

Cette derniere partie passe a la pratique. Le principe est de combiner des operateurs Google pour reduire le bruit et cibler un type de contenu bien precis.

Les operateurs essentiels cites dans la room sont :

- `site:`
- `filetype:`
- `intitle:`
- `cache:`

### Question 1: What would be the format used to query the site bbc.co.uk about flood defences

La syntaxe attendue est :

```text
site:bbc.co.uk flood defences
```

### Reponse

**Query format:** `site:bbc.co.uk flood defences`

### Question 2: What term would you use to search by file type?

La reponse est l'operateur :

```text
filetype:
```

### Reponse

**Term for file type search:** `filetype:`

### Question 3: What term can we use to look for login pages?

La reponse est :

```text
intitle: login
```

### Reponse

**Term to look for login pages:** `intitle: login`

---

## Exemples utiles de dorks

Sans sortir du cadre legal, ces requetes sont de bons exemples pedagogiques :

```text
site:example.com filetype:pdf
site:example.com intitle:login
site:example.com confidential
site:example.com filetype:xls
site:example.com inurl:admin
```

Chaque operateur resserre le scope :

- `site:` borne la cible
- `filetype:` cible un format
- `intitle:` filtre sur le titre
- `inurl:` vise les chemins

---

## Resume des reponses de la room

- Roger dodger! `Done`
- Name the key term of what a "Crawler" is used to do `Index`
- What is the name of the technique that "Search Engines" use to retrieve this information about websites? `Crawling`
- What is an example of the type of contents that could be gathered from a website? `Keywords`
- Use the same SEO checkup tool... `Done`
- Where would "robots.txt" be located on the domain "ablog.com" `ablog.com/robots.txt`
- If a website was to have a sitemap, where would that be located? `/sitemap.xml`
- How would we only allow "Bingbot" to index the website? `User-agent: Bingbot`
- How would we prevent a "Crawler" from indexing the directory "/dont-index-me/"? `Disallow: /dont-index-me/`
- What is the extension of a Unix/Linux system configuration file that we might want to hide from "Crawlers"? `.conf`
- What is the typical file structure of a "Sitemap"? `XML`
- What real life example can "Sitemaps" be compared to? `Map`
- Name the keyword for the path taken for content on a website `Route`
- What would be the format used to query the site bbc.co.uk about flood defences `site:bbc.co.uk flood defences`
- What term would you use to search by file type? `filetype:`
- What term can we use to look for login pages? `intitle: login`

---

## Methodologie retenue

Pour resoudre cette room proprement, j'ai garde une progression simple :

1. comprendre comment Google collecte l'information
2. comprendre comment un site influence cette collecte
3. lire ce que `robots.txt` et `sitemap.xml` exposent
4. transformer cette comprehension en requetes precises

Ce n'est pas une room d'exploitation, mais c'est une vraie room de **preparation offensive**.

---

## Conclusion

**Google Dorking** rappelle une chose essentielle : beaucoup d'informations sensibles sont decouvrables sans jamais toucher directement a la cible. Savoir construire une bonne requete Google fait gagner du temps, reduit le bruit et peut parfois donner plus qu'un scan large et mal cible.

***Auteur*** *: Saad Idrissi*
