# Known plaintext: XOR

## Challenge

This BMP picture was mistakenly encrypted. Can you recover it ?

## Solution

On peut obtenir les clés probables du XOR avec le site https://wiremask.eu/tools/xor-cracker/.

Le download d'images déchiffrées par clés ne marchant pas sur ce site, il faut le décripter.

J'ai utilisé le dépot https://github.com/apemax/XORCrypt et les commandes

```bash
cd XORCrypt
make
cd build
echo fallen > keyfile #En faisant varier la clé dans le fichier avec celles obtenues par xor-cracker
./XORCrypt -i ../../ch3.bmp -k keyfile
```

L'image obtenue avec la clé "fallen" nous donne le mot de passe

## Flag

ICONOCLASTE
