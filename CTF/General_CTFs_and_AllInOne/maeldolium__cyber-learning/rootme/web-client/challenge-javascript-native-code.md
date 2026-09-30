# Root-me: Javascript: Native Code

## Context
- **Catégorie :** Web Client
- **Difficulté :** Très facile
- **Date :** 2026-04-10
- **Lien :** https://www.root-me.org/fr/Challenges/Web-Client/Javascript-Native-code

## Objectif
Le challenge consiste à trouver une donnée cachée dans le code JS obfusqué de la page.

## Analyse
La page du challenge est une page blanche avec une pop-up demandant un mot de passe.
Comme il s'agit d'un challenge Web Client portant sur JS, je suppose que je vais trouver le mot de passe dans le script JS de la page.

## Démarche
1. J'ouvre la page et remarque la pop-up
2. Avec l'inspecteur, j'analyse le code de la page
3. Je remarque que me script JS est obfusqué
4. Je remarque dans le code quelque chose qui ressemble à une affectation et une fonction s'appelant elle même
5. J'utilise un console.log de la fonction appelé avec ses données
6. J'obtiens le mot de passe

## Difficultés rencontrées
Il m'a fallu comprendre pourquoi le code JS était non-lisible par l'homme et comprendre comment le déobfusqué afin d'obtenir le mot de passe.

## Apprentissage
- exploité du code JS obfusqué
- même un script obfusqué ne permet pas de sécurisée une donnée stockée côté client

## Résumé
Challenge introductif utile pour comprendre que l'obfuscation n'est pas une protection de sécurité.
La résolution reposait sur l'inspection du code JavaScript via les DevTools et l'analyse du script obfusqué pour extraire le mot de passe.
Même si le code est rendu non-lisible par l'obfuscation, les données sensibles restent accessibles côté client et ne doivent jamais être stockées de cette manière.
