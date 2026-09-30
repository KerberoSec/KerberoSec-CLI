# Employés malveillants d’une entreprise

## Challenge

Vous travaillez dans le SI d’une entreprise. Apparament, deux employés échangent des flags. On a pu capturer une partie de leur trafic réseau (capture exercice2.pcap). Cette capture contient plusieurs flags, trouvez-en au moins 2.

## Solution

J'ai commencé à filtrer par communication http avec wireshark pour obtenir des infos rapidement.
Aux paquets 57675 et 57686, on peut voir une requete/réponse d'image PNG. En faisant file-->export Object-->http, on peut obtenir l'image transférée (https://osqa-ask.wireshark.org/questions/35123/fastest-way-to-display-a-png-file/)
*[Image: flag image]*

Au paquet 57065, on a une clé privée :
```
-----BEGIN PRIVATE KEY-----
%%%
-----END PRIVATE KEY-----
```

Mais on n'a pas grand chose d'autre pour l'utiliser

## Flags

dc3c3497d445ff873ae51fc550f5b0b5
