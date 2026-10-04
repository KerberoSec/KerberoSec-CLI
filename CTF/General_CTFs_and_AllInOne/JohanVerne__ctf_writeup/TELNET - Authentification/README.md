# TELNET: Authentification

## Challenge

Find the user password in this TELNET session capture.

## Solution

Le protocol TELNET envoie les informations importantes un octet par paquet, on peut donc, dans Wireshark, faire clic droit --> Follow TCP Stream pour faire apparaitre le mot de passe en clair, en recharchant le texte "password" (source : https://osqa-ask.wireshark.org/questions/166/capture-telnet-username-and-password/)

## Flag

user
