# Root-me: Obfuscation JS 2

## Contexte
- **Catégorie :** Web Client
- **Difficulté :** Très facile
- **Date :** 2026-04-09
- **Lien :** https://www.root-me.org/fr/Challenges/Web-Client/Javascript-Obfuscation-2

## Objectif
Le challenge consiste à trouver un moyen d'accéder à des données cachées en analysant le code de la page.

## Analyse
La page du challenge est une page blanche.
Comme il s'agit d'un challenge Web Client, je suppose qu'il doit y avoir des données cachées dans le code de la page.

## Démarche
1. J'ouvre la page et constate qu'elle est vide
2. Avec l'inspecteur j'analyse le code de la page
3. Je trouve dans le header un script avec une donnée obfusquée
4. Je déobfusque la donnée et je me retrouve avec une list de numéro
5. Je transforme cette liste en caractère ASCII pour obtenir le mot de passe

## Difficultés rencontrées
Il m'a fallu trouver comment passer une liste de décimaux en caractère ASCII pour obtenir le mot de passe caché.

## Apprentissage
- transformer une liste de décimaux en caractère ASCII
- même en ajoutant un traitement sur une donnée obfusqué, en étant stockée côté client, elle n'est pas sécurisée

## Résumé
Ce challenge montre qu'une page apparemment vide peut quand même contenir des informations sensibles côté client. En inspectant le code source, j'ai trouvé un script obfusqué contenant une suite de nombres. Après déobfuscation, j'ai converti ces valeurs décimales en caractères ASCII pour reconstruire le mot de passe. L'exercice rappelle qu'aucune donnée stockée ou transformée uniquement en JavaScript côté navigateur ne doit être considérée comme protégée.