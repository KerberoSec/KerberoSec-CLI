# TryHackMe: Searchlight

**Objectif :** Exploiter des techniques OSINT pour extraire, analyser et géolocaliser de manière précise des informations à partir d’images et de vidéos, en documentant chaque étape pour garantir la reproductibilité de la méthode.

---

## Introduction

Le challenge **Searchlight: IMINT** (créé par zewen) se concentre sur l’analyse d’images et de vidéos pour en extraire des indices géographiques, visuels et contextuels. Ce write‑up vous guidera à travers huit défis progressifs, en mêlant inspection visuelle, Google Dorking, recherche inversée et géolocalisation.

---

## Défi 1 : Rue mystère

![Tache 1](https://miro.medium.com/v2/resize:fit:828/format:webp/1*Raw4nTPFZpiveB1oFmbrgA.png)

**Enoncé :** À partir de la photo fournie, identifiez la rue.

**Étape 1 : Observation**

- Zoom sur le panneau d’accueil.

**Étape 2 : Extraction de l’indice**

- Le mot **Carnaby Street** ressort très clairement.

**Étape 3 : Validation rapide**

- Une recherche Google sur **"Carnaby Street"** confirme l’existence de cette rue piétonne du quartier de Soho à Londres.

> **Note pédagogique :** Toujours vérifier via une source fiable (Wikipedia, guide touristique officiel) pour s’assurer de l’exactitude.

**Réponse :** Carnaby Street.

---

## Défi 2 : Station de métro à Londres

![Tache 2](https://miro.medium.com/v2/resize:fit:1100/format:webp/1*u-Q4nJbUy4RIZ6iXONplhg.png)

**Enoncé :** Répondez aux questions suivantes à partir de l’image de l’entrée de métro.

1. Ville ?
2. Station ?
3. Année d’ouverture ?
4. Nombre de quais ?

| **Question**        | **Raisonnement**                                                                            | **Réponse**       |
| ------------------- | ------------------------------------------------------------------------------------------- | ----------------- |
| Ville ?             | Le logo rouge et bleu est celui du **London Underground**, réseau métropolitain de Londres. | Londres           |
| Station ?           | Lecture partielle du mot **"Circus"** sur la façade : orienté vers **Piccadilly Circus**.   | Piccadilly Circus |
| Année d’ouverture ? | Recherche rapide : « Piccadilly Circus station opening » → **1906**.                        | 1906              |
| Nombre de quais ?   | Informations officielles du site TfL (Transport for London) → **4 plateformes**.            | 4                 |

> **Astuce :** Pour des informations de transport, privilégiez les sites officiels ou des bases de données dédiées (TfL, SNCF Data, etc.).

---

## Défi 3 : Google Dorking et aéroport

![Tache 3](https://miro.medium.com/v2/resize:fit:640/format:webp/1*DGt4lvd3DbQCLXLB-GiVVg.png)

**Enoncé :** À partir d’un panneau publicitaire sur une image d’aéroport, identifiez le lieu exact.

**Étape 1 : Repérer l’indice**

- Le domaine **yvr.ca** est visible sur le billboard.

**Étape 2 : Déchiffrage**

- **yvr.ca** est le site officiel de l’aéroport international de Vancouver (code YVR).

**Étape 3 : Recherche Google Dorking**

- Utilisez la requête avancée : `site:yvr.ca`
- Vous confirmez le nom complet et son emplacement.

**Étape 4 : Détail des réponses**

- **Bâtiment :** Vancouver International Airport
- **Pays :** Canada
- **Ville :** Richmond, en Colombie‑Britannique

> **Zoom méthodologique :** Le Google Dorking consiste à ajouter des opérateurs avancés (site:, inurl:, filetype:) pour cibler précisément des informations.

---

## Défi 4 : Le coffee shop écossais

![Tache 4](https://miro.medium.com/v2/resize:fit:828/format:webp/1*HAydeXPIfQuI2H-1gfvkVQ.png)

Pour ce défi, les explications suivent un déroulé finement détaillé, avec captures mentales claires, pour ne rien laisser à l’interprétation.

### Question 1 : Ville ?

1. **Observation** : Sur la façade derrière le coffee shop, on distingue l’enseigne **The Edinburgh Woolen Mill**.
2. **Hypothèse** : Comme le nom le suggère, il peut exister plusieurs points de vente en Écosse, dont un à Blairgowrie.
3. **Recherche Google** : `"The Edinburgh Woolen Mill"`.
4. **Résultat** : La boutique se trouve à **Blairgowrie**, une petite ville du Perthshire.

### Question 2 : Rue ?

1. **Première action** : Ouvrir Google Maps à l’adresse mentionnée.
2. **Street View** : Cliquez sur l’icône Street View en face de la boutique.
3. **Analyse du décor** : Le coffee shop se trouve en face, sur la rue **Allan Street**.
4. **Confirmation** : Le nom de la rue est clairement affiché sur le panneau de rue de l’image.

### Question 3 : Téléphone ?

1. **Fiche Google Maps** : Sélectionnez **The Wee Coffee Shop** parmi les résultats.
2. **Section Coordonnées** : Le numéro de téléphone est listé sous la forme **+44 1296 868008**.
3. **Conseil** : Notez toujours le format international (+44 pour le Royaume‑Uni) pour garantir la validité à l’étranger.

### Question 4 : Email ?

1. **Source TripAdvisor** : Tapez **"The Wee Coffee Shop Blairgowrie TripAdvisor"** dans Google.
2. **Fiche de l’établissement** : La page TripAdvisor affiche l’adresse e-mail **[info@weecoffee.co.uk](mailto\:info@weecoffee.co.uk)**.
3. **Vérification croisée** : Un second site (par exemple, Yelp) peut confirmer cette adresse.

### Question 5 : Nom de famille des propriétaires ?

1. **Section Q&A TripAdvisor** : Cherchez la question « Qui est le propriétaire ? ».
2. **Indice** : Le prénom **David** apparaît dans la réponse.
3. **Recherche complémentaire** : `"The Wee Coffee Shop Blairgowrie David"` sur Google.
4. **Résultat** : Un blog dédié aux petites entreprises mentionne le nom de famille "Debbie and David **Cochrane"**.

> **Astuce :** Pour trouver des noms de famille, privilégiez les blogs locaux, annuaires d’entreprises et sites d’avis spécialisés.

---

## Défi 5 : Recherche inversée et Katz’s Deli

![Tache 5](https://miro.medium.com/v2/resize:fit:640/format:webp/0*4ziR7ppv_TYqcX1a.jpg)

**Étapes détaillées :**

1. **Téléchargement de l’image** : Ouvrez la fonction de recherche inversée d’image de votre navigateur (clic droit → "Rechercher l’image avec Google").
2. **Analyser les résultats** : Google affiche des correspondances avec **Katz’s Deli**, un célèbre restaurant de New York.
3. **Confirmation** : Vérifiez sur le site officiel de Katz’s Deli que la façade correspond à l’image.

**Question subsidiaire :** Nom de l’éditeur Bon Appétit ayant travaillé 24 h ?

- Recherche simple : `Katz’s Deli Bon Appetit 24 hours`.
- L’article **What It’s Like to Work at Katz’s Deli for 24 Hours Straight** nomme **Andrew Knowlton** comme éditeur ayant relevé ce défi.

---

## Défi 6 : Statue de Renne à Oslo

![Tache 6](https://miro.medium.com/v2/resize:fit:1100/format:webp/1*-J-juYpwRNsWrPcV2UpVLA.png)

**Enoncé :** Identifier le nom de la statue et son photographe.

### Partie 1 : Nom de la statue ?

1. **Observation initiale** : L’œuvre représente un renne chromé monté sur une moto.
2. **Google Dorking** : `"Reindeer Motorcycle Statue Oslo"`.
3. **Résultat** : Le nom exact : **Rudolph the Chrome Nosed Reindeer**.

### Partie 2 : Photographe ?

1. **Source VisitOSLO** : Le site municipal de tourisme propose une carte interactive des sculptures en plein air.
2. **Sélection de la sculpture** : Cliquez sur l’icône correspondant à **Tjuvholmen**.
3. **Information affichée** : Le nom du photographe est indiqué dans la légende de l’image.

> **Conseil :** Les sites officiels de tourisme regorgent souvent de métadonnées utiles (auteur, date, auteur de la photo).

---

## Défi 7 : Lady Justice et le Courthouse

![Tache 7](https://miro.medium.com/v2/resize:fit:1100/format:webp/1*FurfYAjQYL_ASNZYuR_PgQ.png)

**Enoncé :** Déterminez le personnage, le lieu et le bâtiment opposé.

1. **Analyse visuelle** : Statue d’une femme aveuglée, tenant une balance et une épée → iconographie de **Lady Justice**.
2. **Recherche inversée** : Outil Google Images → images similaires montrant cette statue devant un bâtiment gouvernemental.
3. **Article American Progress** : L’article mentionne la statue devant le **Albert V. Bryan United States Courthouse**.
4. **Vérification sur Google Maps** : Street View confirme que la statue fait face au bâtiment.

**Réponses :**

- Personnage : Lady Justice
- Lieu : Devant l’Albert V. Bryan United States Courthouse, **Alexandrie, Virginie** (États-Unis)
- Bâtiment opposé : Albert V. Bryan United States Courthouse

---

## Défi 8 : Analyse vidéo à Singapour

![Tache 8](https://miro.medium.com/v2/resize:fit:1100/format:webp/1*qYeaWk0Xz8heC_mYAPkD2Q.png)
> Riverside Point à Singapour (capturé depuis la vidéo).

**Enoncé :** Identifier l’hôtel où séjourne l’ami.

### Étape 1 : Repérage des points de repère

- **Riverside Point :** immeuble en bord de fleuve.
- **Clarke Quay Central :** centre commercial adjacent.
- **Marina Bay Sands :** silhouette reconnaissable des trois tours.

### Étape 2 : Géolocalisation

1. **Google Maps** : repérez Clarke Quay Central.
2. **Street View** : placez-vous devant ce centre commercial.
3. **Panoramique :** regardez vers la rivière : l’hôtel en face est un **Novotel**.

### Étape 3 : Nom complet de l’hôtel

- Recherche Google : `"Novotel Clarke Quay"`.
- **Réponse :** Novotel Singapore Clarke Quay .

> **Retour d’expérience :** L’association de plusieurs repères architecturaux accélère considérablement la localisation.

---

## Points clés et recommandations

- **Observer avant de rechercher :** Prenez le temps d’identifier chaque indice visuel, textuel et contextuel.
- **Varier les méthodes :** combinez Google Dorking, recherche inversée et analyse des métadonnées.
- **Valider vos résultats :** toujours vérifier via plusieurs sources (officielles, spécialisées, locales).
- **Documenter votre chaîne de pensée :** notez chaque requête et chaque résultat pour assurer la traçabilité.

**Recommandations pour aller plus loin :**

1. Utilisez des outils d’automatisation (scripts Python ou modules OSINT comme `exiftool`) pour extraire plus rapidement les métadonnées des images.
2. Intégrez des captures d’écran annotées pour chaque indice crucial.
3. Partagez votre write‑up dans la communauté pour bénéficier de retours et suggestions.

---

***Auteur*** *: Saad Idrissi*

