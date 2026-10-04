# Root-me: HTML/Code Source

## Contexte
- **Catégorie :** Web Server
- **Difficulté :** Très facile
- **Date :** 2026-04-28
- **Lien :** https://www.root-me.org/fr/Challenges/Web-Serveur/HTML-Code-source

## Objectif
L'objectif est de trouver un moyen d'accéder à un mot de passe caché.

## Analyse
En ouvrant la page du challenge, je tombe sur un formulaire qui me demande un mot de passe que je ne connais pas. 
Le titre du challenge étant HTML: Code Source, je suppose que le mot de passe doit être inscrit dans le code HTML de la page.

## Démarche
1. J'ouvre la page et remarque le formulaire
2. J'inspecte la page avec les DevTools
3. Je repère le mot de passe dans un commentaire
4. Je l'utilise pour valider le challenge

## Résolution
Le mot de passe était stocké en clair dans les commentaires du code HTML de la page.

## Difficultés rencontrées

## Apprentissage
- même en commentaire, les identifiants stockés en clair restent une faille de sécurité

## Résumé
Challenge Web Server simple : le mot de passe était présent en clair dans un commentaire HTML, utilisé pour valider le formulaire. Montre que stocker des secrets côté client est une mauvaise pratique.

