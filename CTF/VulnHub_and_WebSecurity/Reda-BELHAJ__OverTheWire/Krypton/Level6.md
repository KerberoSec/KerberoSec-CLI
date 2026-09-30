# Krypton Level 6
## Part I
Enter the following command in your Terminal :

```bash
find / -name krypton6 -type f
cd /krypton/krypton5/
cat /krypton/krypton5/krypton6
# BELOS Z
# the key length is unknown
```
I'll try to decode with [Vigenere Cipher Decoder](https://www.dcode.fr/vigenere-cipher) the Ciphertext in found1, found2 and found3.
![Capture](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Krypton/Captures/Capture2.PNG)
```
KEY : KEYLENGTH
```
![Capture](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Krypton/Captures/Capture3.PNG)
```
CIPHERTEXT : BELOS Z
KEY        : KEYLE N
	         ----------
PLAINTEXT  : RANDO M
```

## Part II
The ***host*** to which you need to connect is *krypton.labs.overthewire.org*, on ***port*** 2231. The ***username*** is *krypton6* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/edit/main/Krypton/Level6.md#part-i).
```bash
ssh krypton.labs.overthewire.org -p 2231 -l krypton6
# OR ssh krypton6@krypton.labs.overthewire.org -p 2231
# password: RANDOM
```
