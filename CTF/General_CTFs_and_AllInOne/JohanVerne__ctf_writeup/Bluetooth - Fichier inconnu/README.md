# Bluetooth: Fichier inconnu

## Challenge

Your friend working at NSA recovered an unreadable file from a hacker’s computer. The only thing he knows is that it comes from a communication between a computer and a phone.

The answer is the sha-1 hash of the concatenation of the MAC address (uppercase) and the name of the phone.

## Solution

J'ai utilisé Wireshark pour obtenir l'adresse MAC du téléphone, dans le champ BD_ADDR : 0C:B3:19:B9:4F:C6

J'ai ensuite trouvé le nom du téléphone en inspectant le retour de cat `ch18.bin | xxd : GT-S7390G`

En faisant la contaténation des deux et en utilisant le site sha1.fr pour calculer le SHA1, on obtient le résultat

## Flag

c1d0349c153ed96fe2fadf44e880aef9e69c122b
