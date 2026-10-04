# Monoalphabetic substitution: Caesar

## Challenge

We just caught the messenger of the Emperor. He transmitted a coded message to his son. This could be an important message. You’ve to decrypt it ! To validate, you must enter the concatenation of the first letters of each line followed by the concatenation of the last letters of each line (for example : tfhqdlhfpkmeokgq).

## Solution

Le fichier est encodé avec un chiffrement César dont on ne connait pas le décalage.
Pour ne pas avoir à tester toutes les possibilités manuellement sur DCode, j'ai créé un script Python `decypherCaesar.py` pour tester les 25 décalages possibles et trouver rapidement le bon décalage

En testant avec certaines valeurs, on remarque que chaque mot est décalé de sa place dans le fichier (1er mot décalé de +1, 2e de +2 ...)

## Flag

ujqcsddessxsffes
