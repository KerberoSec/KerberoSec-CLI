# Root-me: Contournement de filtrage IP

## Contexte
- **Catégorie :** Web Server
- **Difficulté :** Très Facile
- **Date :** 2026-04-28
- **Lien :** https://www.root-me.org/en/Challenges/Web-Server/HTTP-IP-restriction-bypass

## Objectif
L'objectif est de contourner le filtrage IP afin d'obtenir le mot de passe de validation du challenge.

## Analyse
En arrivant sur la page, je remarque une phrase qui me dit que mon adresse IP n'appartient pas au réseau LAN, et donc que je dois m'identifier. Je suppose qu'il doit exister une requête qui vérifie que l'adresse IP correspond à une adresse LAN.

## Démarche
1. Je remarque que l'adresse IP ne fait pas partie du LAN
2. J'ouvre Networks dans DevTools et je recharge la page pour afficher les requêtes
3. Je trouve la requête qui me donne en réponse le formulaire d'authentification
4. Je fais une requête en spoofant mon adresse IP
5. J'obtiens le code de validation du challenge

## Résolution
La résolution reposait sur l'insertion d'une adresse IP appartenant au réseau LAN dans la requête.

## Difficultés rencontrées
Je ne savais pas comment insérer une adresse IP dans la requête. Pour cela, j'ai utilisé un terminal avec la commande `curl -H` et en utilisant X-Forwarded-For. Il m'a aussi fallu déterminer quelles adresses IP correspondaient à des adresses privées.

## Apprentissage
- Utilisation de l'en-tête HTTP `X-Forwarded-For` pour simuler une adresse IP différente
- Compréhension des plages d'adresses IP privées (LAN)
- Utilisation de curl pour manipuler les requêtes HTTP

## Résumé
Challenge web côté serveur qui demande de contourner le filtrage IP en ajoutant un en-tête HTTP `X-Forwarded-For` avec une adresse privée. Cela montre l'importance de ne pas se fier uniquement à cet en-tête côté serveur pour la sécurité.

