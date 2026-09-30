# Root-me: HTML Boutons désactivés

## Contexte
- **Catégorie :** Web Client
- **Difficulté :** Très facile
- **Date :** 2026-04-07
- **Lien :** https://www.root-me.org/fr/Challenges/Web-Client/HTML-boutons-desactives

## Objectif
Le challenge consiste à trouver un moyen d'accéder à une fonctionnalité bloquée côté client afin de récupérer le mot de passe.

## Analyse
En ouvrant la page, je remarque que les champs du formulaire sont grisés, ils sont donc désactivés.
Comme il s'agit d'un challenge Web Client, je suppose que la protection est uniquement faite du côté client.

## Démarche
1. J'ouvre la page du challenge et j'observe les champs grisés
2. J'inspecte le code HTML avec l'inspecteur du navigateur
3. Je remarque la présence de l'attribut disabled sur les champs du formulaire
4. Je supprime cet attribut dans l'inspecteur
5. Les champs sont maintenant utilisables
6. En utilisant le formulaire, j'obtiens le mot de passe

## Résolution
La protection reposait uniquement sur le front-end.
Le fait de modifier le code HTML dans l'inspecteur suffit à contourner la protection et de révéler les données cachées.

## Difficultés rencontrées
Pas de difficulté particulière de par mon expérience dans le web.

## Apprentissage
- une restriction côté client ne constitue pas une vraie mesure de sécurité
- penser à inspecter le code HTML lorsqu'un élément semble bloqué
- utiliser les DevTools comme premier réflexe pour les challenges Web Client

## Résumé
Challenge introductif utile pour comprendre qu'un contrôle côté client peut être contourné facilement.
La résolution reposait sur l'inspection du code HTML et la suppression d'un attribut bloquant.
