# Root-me: Javascript Source

## Contexte
- **Catégorie :** Web Client
- **Difficulté :** Très facile
- **Date :** 2026-04-09
- **Lien :** https://www.root-me.org/fr/Challenges/Web-Client/Javascript-Source

## Objectif
La challenge consiste à trouver un mot de passe caché en validant un formulaire dans un message d'alerte.

## Analyse
En ouvrant la page, un message d'alerte apparaît demandant de rentrer un mot de passe que je ne possède pas.
Comme il s'agit d'un challenge Web Client et ayant comme sujet Javascript, je suppose que le mot de passe peut être trouvé dans le code JS de la page.

## Démarche
1. J'ouvre la page du challenge et ferme la pop-up d'alerte
2. J'inspecte le code JS avec l'inspecteur
3. Je trouve le mot de passe dans le code JS en clair
4. Je le copie et recharge la page pour le coller dans la pop-up
5. J'obtiens le mot de passe en validant la pop-up

## Résolution
La protection reposait sur une pop-up à valider à l'aide d'un mot de passe stocké en clair dans le code JS. 
Analyser le code JS permet de trouver le code, de valider la pop-up et d'obtenir le mot de passe du challenge.

## Difficultés rencontrées
Pas de difficulté particulière rencontrée pour ce challenge.

## Apprentissage
- une pop-up peut être fermé et réouverte en rechargeant la page
- un mot de passe stocké côté client ne constitue pas une protection

## Résumé
Challenge introductif utile pour comprendre les risques de sécurité liés au stockage de données sensibles en clair côté client.
La résolution reposait sur l'inspection du code JavaScript via les DevTools et l'extraction du mot de passe directement accessible dans le fichier source.
