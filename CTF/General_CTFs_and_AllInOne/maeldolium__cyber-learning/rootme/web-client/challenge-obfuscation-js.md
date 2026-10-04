# Root-me: Obfuscation JS

## Contexte
- **Catégorie :** Web Client
- **Difficulté :** Très facile
- **Date :** 2026-04-09
- **Lien :** https://www.root-me.org/fr/Challenges/Web-Client/Javascript-Obfuscation-1

## Objectif
Le challenge consiste à trouver un moyen d'accéder à un mot de passe caché via un formulaire JS dont on ne connait pas les accès et dont le mot de passe est obfusqué.

## Analyse
En ouvrant la page, je remarque une pop-up me demandant un mot de passe que je n'ai pas.
Comme le challenge est un challenge Web Client, je suppose que le mot de passe doit se trouver quelque part dans le code JS.

## Démarche
1. J'ouvre la page et remarque la pop-up
2. Je ferme la pop-up et ouvre l'inspecteur
3. Je remarque que le script du formulaire est visible dans l'en-tête de la page
4. Je trouve le mot de passe, celui-ci est obfusqué donc inutilisable en l'état
5. A l'aide de la console, j'affiche le mot de passe déobfusqué
6. Je valide la pop-up et obtiens le mot de passe du challenge

## Difficultés rencontrées
Il m'a fallu trouver comment déobfusquer le mot de passe pour le rendre utilisable. Pour cela, j'ai analysé le code JS de la pop-up afin de trouver la fonction qui permettait de le faire.

## Apprentissage
- désobfusquer des données en JS
- même obfusqué les données stockées côté client ne sont pas sécurisée

## Résumé
Challenge simple mais utile pour comprendre qu'un mot de passe obfusqué côté client reste accessible si l'on analyse le JavaScript.
La résolution reposait sur l'inspection du code source et l'utilisation de la console pour déobfusquer la valeur cachée puis valider la pop-up.

