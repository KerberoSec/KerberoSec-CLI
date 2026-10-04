# Root-me: Javascript Authentification 2

## Contexte
- **Catégorie :** Web Client
- **Difficulté :** Très facile
- **Date :** 2026-04-09
- **Lien :** https://www.root-me.org/fr/Challenges/Web-Client/Javascript-Authentification-2

## Objectif
Le challenge consiste à trouver un moyen d'accéder à des données cachées en utilisant un formulaire d'authentification dont on ne connait pas les accès.

## Analyse
En ouvrant la page, je remarque un bouton "login". Quand je clique dessus, ça ouvre une pop-up qui demande identifiant et mot de passe. 
Comme c'est un challenge Web Client et que j'ai déjà fait la première partie du challenge, je suppose que les identifiants sont stockés en clair dans le code JS.

## Démarche
1. J'ouvre la page et remarque le formulaire
2. J'inspecte le code JS pour trouver les identifiants
3. Je rouvre le formulaire et utilise les identifiants
4. J'obtiens le mot de passe pour valider le challenge

## Difficultés rencontrées
Les identifiants étaient stockés dans une liste. Il m'a fallu comprendre comment la liste était faite et comment les identifiants étaient extrait pour pouvoir les utiliser.

## Apprentissage
- retrouver des identifiants dans une liste divisée
- les identifiants stockés en clair côté client restent une faille de sécurité même s'ils sont retravaillés

## Résumé
Challenge variante du premier qui consolide les risques de sécurité liés au stockage de données sensibles côté client.
La résolution reposait sur l'inspection du code JavaScript via les DevTools et l'extraction des identifiants stockés en clair dans une liste, même s'ils étaient légèrement obfusqués.