# XMPP: authentication

## Challenge

Spying the user during a authentication phase, it seems he reused a part of his login as part of his password. Find the user password in this XMPP session capture. The flag is the SHA1 hash of the password.

## Solution

Dans Wireshark, on fait clic-droit --> Follow TCP Stream
On obtient le username de la réponse à l'authentification : `biwsbj1rb21hX3Rlc3Qscj1oeWRyYQ==`

En le décodant depuis base64 (https://www.base64decode.org/), on obtient `n,,n=koma_test,r=hydra`. Cela correspond au nom d'utilisateur et au nonce client utilisé pour le SCRAM-SHA-1

Même chose pour le challenge serveur : `cj1oeWRyYTRPam9GQkdGSnl6VGFCV0tpR2Z1cU5NK3Y5ckRBMHduLHM9cWdpSklKUXNRUGh2QW90SldWTkhQUT09LGk9NDA5Ng==`
==> `r=hydra4OjoFBGFIyzTaBWK iGfuqNM+v9rDA0wn,s=qgiJIJQsQPhvAotJWVNHPQ==,i=4096`
On obtient donc le nonce complet (r=) (client+serveur), le salt encodé en base64 (s=) et le nombre d'itérations pour le SCRAM (i=)

On décode le salt ==>  ,@oIYSG= (on a des charactères inconnus, ce ne doit pas être bon)

## Flag
