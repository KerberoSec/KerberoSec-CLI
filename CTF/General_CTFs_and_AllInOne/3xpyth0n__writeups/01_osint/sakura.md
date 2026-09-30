# TryHackMe: Sakura

**Objectif :** reconstituer l'identite numerique d'une cible en partant d'une image SVG, puis pivoter vers GitHub, PGP, Twitter, blockchain, Wi-Fi geolocalise et indices de voyage, jusqu'a relier alias, e-mail, nom reel, portefeuille crypto et localisation probable.

---

## Introduction

La room **Sakura** est une room OSINT plus dense que la moyenne. Contrairement a une room purement "Q/R", elle demande de construire une enquete progressive :

- partir d'un support initial
- identifier un alias
- recouper cet alias sur plusieurs plateformes
- extraire des traces techniques ou sociales
- verifier systematiquement chaque hypothese

Ce type de room est tres utile pour apprendre a ne pas s'arreter au premier pseudo retrouve. L'interet n'est pas seulement l'information finale, mais la **chaine de pivots**.

---

## Point de depart: le SVG

Le point de depart est une image SVG. Premier reflexe : ne pas la regarder comme un simple visuel, mais comme un fichier texte potentiellement bavard.

Je commence par :

```bash
exiftool sakurapwnedletter.svg
```

Je peux aussi lire directement le contenu du SVG dans un editeur de texte.

Les metadonnees montrent un chemin d'export de type :

```text
/home/SakuraSnowAngelAiko/Desktop/...
```

Cela donne le premier pivot fiable :

```text
SakuraSnowAngelAiko
```

### Reponse cle

**Username / alias initial:** `SakuraSnowAngelAiko`

---

## Pivot vers les plateformes publiques

Avec un alias suffisamment distinctif, je passe a une recherche web large puis a une recherche ciblee sur :

- GitHub
- réseaux sociaux
- moteurs classiques

Le profil GitHub associe a cet alias expose plusieurs depots, dont un lie a **PGP**.

---

## PGP: recuperation de l'e-mail

Dans le depot PGP, une cle publique est disponible. Je la recupere puis je l'inspecte :

```bash
gpg --import sakura.asc
gpg --list-keys
gpg --fingerprint
```

Le champ `uid` permet d'extraire l'adresse e-mail :

```text
SakuraSnowAngel83@protonmail.com
```

### Reponse cle

**Adresse e-mail:** `SakuraSnowAngel83@protonmail.com`

---

## Recoupement social: nom reel

A partir de l'alias, puis de l'e-mail et des plateformes recoupees, on aboutit au nom reel suivant :

```text
Aiko Abe
```

Le point important ici est la methode :

1. partir d'un pseudonyme
2. verifier la coherence sur plusieurs profils
3. ne retenir un nom reel que lorsqu'il apparait de facon convergente

### Reponse cle

**Nom reel:** `Aiko Abe`

---

## Pivot crypto: depot GitHub et wallet Ethereum

En parcourant les depots GitHub, il ne faut pas se limiter aux fichiers courants. Les historiques de commit et les scripts sont souvent plus parlants.

Dans un depot relie a du minage Ethereum, un script ou un commit expose une adresse wallet.

La room conduit a une adresse Ethereum associee a la cible. Je la verifie ensuite sur **Etherscan**.

Ce recoupement permet d'identifier :

- l'adresse
- le pool de minage
- les tokens manipules

L'activite du wallet montre notamment une utilisation de :

```text
Ethermine
```

et des traces sur :

- Ethereum
- Tether

L'interet ici n'est pas la speculation, mais la **traçabilité** de l'activite.

---

## Pivot Twitter puis DeepPaste

En recherchant le compte Twitter rattache a l'alias, on retrouve un handle du type :

```text
@Sakura...Aiko
```

Dans les tweets, deux mots ecrits en majuscules orientent vers **DEEP** et **PASTE**, soit un hint vers une plateforme onion de type **DeepPaste**.

En suivant cette piste via Tor, on retrouve une page contenant des informations reliees a des SSID et mots de passe Wi-Fi.

La room ne cherche pas a faire "du dark web" pour le principe. Elle veut surtout montrer qu'un indice social peut orienter vers une ressource plus technique.

---

## WiGLE: BSSID et geolocalisation Wi-Fi

Parmi les donnees retrouvees, un SSID peut etre recoupe avec **WiGLE** pour obtenir :

- un ou plusieurs BSSID
- une zone geographique probable

Le BSSID associe au Wi-Fi "Home" est le suivant :

```text
84:AF:EC:34:FC:F8
```

### Reponse cle

**BSSID du Wi-Fi Home:** `84:AF:EC:34:FC:F8`

Cette etape est interessante parce qu'elle fait le lien entre :

- une fuite d'information applicative ou paste
- et une geolocalisation physique probable

---

## Geolocalisation et deplacements

Plusieurs indices visuels et contextuels dans les publications permettent de reconstituer des deplacements.

Les deplacements reconstitues pointent notamment vers :

- l'aeroport **DCA** comme aeroport proche d'un spot photo lie a Washington
- une escale a **HND** (Tokyo Haneda)
- la presence de **Lake Inawashiro** sur une carte en vol
- une ville de rattachement probable : **Hirosaki**

Le point important ici est de ne jamais valider un lieu sur un seul indice :

- monument
- orientation
- carte de vol
- service Wi-Fi local

Ce sont les recoupements qui rendent la conclusion credible.

---

## Methodologie complete employee

Sur cette room, la sequence gagnante est la suivante :

1. analyser la metadonnee du fichier source
2. extraire un alias fiable
3. pivoter vers GitHub
4. exploiter PGP pour obtenir un e-mail
5. recouper l'identite via reseaux sociaux
6. fouiller les commits et scripts
7. suivre les traces crypto
8. exploiter les indices sociaux vers des ressources profondes
9. geolocaliser via WiGLE, cartes et indices de voyage

Autrement dit, on ne "trouve pas Sakura" d'un coup. On assemble peu a peu des morceaux d'identite numerique.

---

## Ce qu'il fallait retenir

La force de **Sakura**, c'est qu'elle apprend a faire des pivots propres :

- pseudo -> depot
- depot -> cle PGP
- PGP -> e-mail
- e-mail / alias -> reseaux sociaux
- social -> onion hint
- onion -> SSID
- SSID -> BSSID / zone
- scripts -> wallet
- wallet -> activite publique

Chaque pivot est raisonnable, reproductible et surtout verifiable.

---

## Conclusion

**Sakura** est une tres bonne room d'OSINT avancée parce qu'elle montre qu'une identite numerique ne fuit presque jamais par un seul canal. C'est l'accumulation de petits indices techniques, sociaux et geographiques qui finit par produire un profil coherent.

***Auteur*** *: Saad Idrissi*
