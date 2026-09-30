# Root-me: Javascript Authentification

## Contexte
- **Catégorie :** Web Client
- **Difficulté :** Très facile
- **Date :** 2026-04-08
- **Lien :** https://www.root-me.org/fr/Challenges/Web-Client/Javascript-Authentification

## Objectif
Le challenge consiste à trouver un moyen d'accéder à des données cachées en utilisant un formulaire d'authentification dont on ne connait pas les accès.

## Analyse
En ouvrant la page, je remarque un formualire de connexion qui demande le nom d'utilisateur et le mot de passe. 
Comme il s'agit d'un challenge Web Client et que c'est son nom, je suppose que le formulaire ne fonctionne que côté client avec du Javascript.

## Démarche
1. J'ouvre la page du challenge et j'obeserve les champs nécessaires au formulaire
2. J'ouvre l'inspecteur pour analyser le code de la page
3. Je vais dans l'onglet Source et dans le fichier login.js car je suppose que c'est lui qui gère la connexion
4. Dans la boucle de validation du formulaire, je trouve l'identifiant et le mot de passe nécessaire
5. Je les utilise dans le formulaire et obtiens le mot de passe

## Difficultés rencontrées
Il m'a fallu trouver comment analyser le code Javascript pour trouver les informations nécessaires à la réalisation du challenge.

## Résolution
Les données nécessaires pour valider le formulaire et obtenir le mot de passe était stockées en claire dans le fichier Javascript.
Le fait de lire ce fichier permet de résoudre le challenge.

## Apprentissage
- stocker des données sensibles en clair côté client n'assure pas la sécurité
- pour analyser un fichier JS il faut utiliser l'onglet Source de l'inspecteur

## Résumé
Challenge introductif utile pour comprendre les risques de sécurité liés au stockage de données en clair côté client.
La résolution reposait sur l'inspection du code JavaScript via les DevTools et l'extraction des identifiants non chiffrés directement accessibles dans le fichier source.