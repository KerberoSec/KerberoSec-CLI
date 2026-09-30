# TryHackMe: Geolocating Images

**Objectif :** apprendre a geolocaliser des images a partir de details visuels, de la recherche d'image inverse, de cartes et de Street View, puis repondre aux differents exercices de la room sans s'appuyer sur des suppositions gratuites.

---

## Introduction

La room **Geolocating Images** est une room OSINT tres utile, parce qu'elle muscle un reflexe essentiel : **observer avant de chercher**.

Ici, on ne compromettait rien. On reconstitue simplement un lieu a partir d'indices :

- forme d'un batiment
- carrefours et noms de rue
- monuments
- sens de circulation
- mobilier urbain
- indices culturels

L'usage de **Yandex** est tres utile pour la recherche inverse d'image : sur ce type d'exercice, il est souvent plus efficace que Google.

---

## Task 1: Getting Started

Je pars d'un zip d'images qu'il faut telecharger puis analyser localement.

### Question: Download the zip file

### Reponse

`Done`

---

## Task 2: Getting our feet wet: where is this?

Cette premiere image sert surtout a comparer les resultats de Google Images et Yandex.

### Question: Where in the world is image 1? The answer is the country name.

Une recherche inverse Yandex renvoie vers une sculpture situee a **Karamay**.

Apres verification, cela mene au pays :

```text
China
```

### Reponse

**Image 1 country:** `China`

### Raisonnement

Le bon reflexe ici n'est pas juste "cliquer sur le premier resultat". Il faut :

1. faire une recherche inverse
2. comparer les correspondances
3. verifier que le lieu correspond visuellement
4. remonter du lieu au pays si la room ne demande que le pays

---

## Task 3: Geolocating Images 101

Cette tache est une demonstration. La room decompose une webcam reliee a l'universite de Liverpool et montre comment repérer :

- le logo Kaplan
- l'environnement routier
- les volumes du batiment
- le contexte institutionnel

Le texte aboutit a **Liverpool International College** et montre l'importance de :

- recouper l'image avec des articles publics
- verifier l'orientation du point de vue
- tenir compte de l'anciennete des images Street View / Google Maps

### Question: Read the above text

### Reponse

`Done`

---

## Task 4: Now your turn

La room retire la recherche inverse et force a regarder l'image.

### Question: Where was image 2 taken?

La methode la plus efficace ici est la suivante :

1. identifier l'intersection visible
2. relever les noms de rues
3. verifier le decor sur Google Maps
4. trouver l'etablissement depuis lequel la photo a probablement ete prise

Les rues visibles sont :

- `N Sheffield Ave`
- `W Addison St`

En allant a cette intersection a Chicago puis en basculant en Street View, on retrouve **Wrigley Field** dans le decor. Le point de prise de vue correspond a :

```text
Wrigleyville Sports
```

### Reponse

**Image 2 location:** `Wrigleyville Sports`

### Ce qu'il fallait regarder

Ici, la room recompense une lecture tres simple de l'environnement :

- panneaux de rue
- croisement exact
- batiment massif en arriere-plan
- logique commerciale du lieu

Ce n'est pas une "magie OSINT". C'est surtout de l'observation methodique.

---

## Task 5: Helpful tips for geolocating

Cette partie donne les grands principes :

- langue
- plaques
- position des vehicules sur la route
- signalisations
- style architectural
- vetements
- religion dominante probable dans la zone
- EXIF eventuel

### Question: Read the above material

### Reponse

`Done`

---

## Task 6: Your turn, again!

Cette image est plus difficile et demande un raisonnement geographique plus fin.

### Question: Where was image 3 taken?

Le parcours logique est le suivant :

1. identifier la **Tour Eiffel**
2. reconnaitre la **Seine**
3. exploiter l'orientation relative du fleuve et de la tour
4. remarquer un dôme d'observatoire au premier plan
5. comparer plusieurs observatoires parisiens
6. verifier la perspective sur carte et sur imagerie satellite

Le site retenu est :

```text
Meudon Observatory
```

### Reponse

**Image 3 location:** `Meudon Observatory`

### Raisonnement detaille

Cette image montre bien pourquoi la geolocalisation n'est pas juste une recherche d'image inverse.

Le detail cle n'est pas la Tour Eiffel seule, car elle ne donne pas le point de vue precis. Le vrai pivot est l'observatoire visible au premier plan. En combinant :

- l'orientation du fleuve
- la position relative de la tour
- la presence d'un dome
- les zones vertes autour de Paris

on aboutit au site de Meudon.

---

## Task 7: Your turn, what can you see?

Cette derniere image cumule plusieurs indices faibles, mais convergents.

### Question: Where is image 4 taken?

Plusieurs indices ressortent nettement :

- circulation a gauche
- ambiance tres britannique
- presence de **Belisha beacons**
- resultat Yandex pointant vers un lieu extremement connu

Le lieu retrouve est celui de la celebre photo des Beatles :

```text
Abbey Street
```

### Reponse

**Image 4 location:** `Abbey Street`

### Pourquoi ce n'est pas trivial

Le nom Google Maps le plus generique n'est pas la bonne reponse. Il faut donc aller chercher une denomination suffisamment specifique pour identifier le lieu sans ambiguite.

L'interet de cet exercice est de montrer que :

- le sens de circulation reduit deja beaucoup l'espace de recherche
- certains mobiliers urbains sont extremement regionaux
- la recherche inverse peut valider une intuition nee de l'observation

---

## Task 8: You're done!

La room recommande ensuite des ressources externes comme Bellingcat et GeoGuessr pour continuer a s'entrainer.

### Question: Check out the links above!

### Reponse

`Done`

---

## Resume des reponses de la room

- Download the zip file `Done`
- Where in the world is image 1? `China`
- Read the above text `Done`
- Where was image 2 taken? `Wrigleyville Sports`
- Read the above material `Done`
- Where was image 3 taken? `Meudon Observatory`
- Where is image 4 taken? `Abbey Street`
- Check out the links above! `Done`

---

## Methodologie employee

La room suit une logique que je garde telle quelle pour les autres rooms OSINT :

1. commencer par la recherche inverse si elle a du sens
2. relever tous les indices visuels explicites
3. travailler par pivots :
   - noms de rue
   - monuments
   - enseignes
   - structure routiere
   - contexte culturel
4. verifier sur carte
5. confirmer avec Street View ou imagerie

Le point essentiel est de **ne jamais valider sur un seul indice**.

---

## Outils utiles dans ce type de room

### Recherche inverse

- Yandex
- Google Images

### Verification cartographique

- Google Maps
- Street View
- Google Earth

### Analyse de metadonnees

```bash
exiftool image.jpg
```

Quand l'image n'a pas ete nettoyee, cela peut donner :

- GPS
- modele d'appareil
- date
- logiciel de traitement

### Recoupement OSINT

- recherches web simples
- pages institutionnelles
- articles locaux

---

## Ce qu'il fallait retenir

**Geolocating Images** apprend trois choses tres importantes :

1. les details banals sont souvent les plus exploitables
2. une geolocalisation fiable repose sur des indices convergents
3. l'observation humaine reste au centre, meme avec de bons outils

Pour un profil offensif, c'est utile au-dela de l'OSINT pur :

- verification de publications employees
- contextualisation de photos exposees
- correlation entre assets et localisation
- analyse d'environnements visibles sur des images publiques

---

## Conclusion

Cette room est une tres bonne base de geolocalisation visuelle. Elle montre qu'une image ne dit pas seulement "ce qu'on voit", mais aussi souvent **ou** on est, a condition d'observer les bons details et de verifier chaque hypothese proprement.

***Auteur*** *: Saad Idrissi*
