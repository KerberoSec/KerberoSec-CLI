# CISCO: mot de passe

## Challenge

Find the "Enable" password.

## Solution

On extrait le mot de passe encrypté avec un algorithme MD5 : $1$p8Y6$MCdRLBzuGlfOs9S.hXOp0

Sur Kali, on utilise John The Ripper pour le décrypter avec la commande $john --format=md5crypt passwd.txt

En fait non, la brute force a l'air trop longue

Avec le site https://www.ifm.net.nz/cookbooks/passwordcracker.html, on peut cracker les 3 mots de passe type 7 présents aus lignes 17 à 19
On obtient les mots de passe suivants :

- 6sK0_hub
- 6sK0_admin
- 6sK0_guest

Malheureusement aucun d'entre eux n'est la solution à notre problème.

On remarque que les 3 mots de passe type 7 ont la même structure (6sKo suivi du nom de username)

On peut supposer que le mot de passe type 5 sera dans le même format.

Comme l'énoncé demande de trouver le mot de passe "Enable", on peut penser que enable est le username utilisé dans le mot de passe

## Flag

6sK0_enable
