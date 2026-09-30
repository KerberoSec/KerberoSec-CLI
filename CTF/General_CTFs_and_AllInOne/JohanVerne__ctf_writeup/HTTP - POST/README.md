# HTTP: POST

## Challenge

Find a way to beat the top score!

## Solution

En inspectant le contenu de la page web, on trouve le code du bouton pour jouer l'action a effectuer quand l'utilisateur le clique :

```
onsubmit="document.getElementsByName('score')[0].value =Math.floor(Math.random() \* 1000001)
```

En rajoutant quelques zéros dans la requête pour améliorer nos chances et en cliquant sur le bouton, on obtient le mdp

## Flag

H7tp_h4s_N0_s3Cr37S_F0r_y0U
