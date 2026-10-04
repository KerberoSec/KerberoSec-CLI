# Krypton Level 5
## Part I
Enter the following command in your Terminal :

```bash
find / -name krypton5 -type f
cd /krypton/krypton4/
cat /krypton/krypton4/krypton5
# HCIKV RJOX
cat HINT
# So we have a key with 6 letters
```
I'll try to decode with [Vigenere Cipher Decoder](https://www.dcode.fr/vigenere-cipher) the Ciphertext in found1 and found2.
![Capture](https://github.com/Reda-BELHAJ/OverTheWire/blob/main/Krypton/Captures/Capture1.PNG)
```
KEY : FREKEY
```
![Vigenere Tableau](https://lh3.googleusercontent.com/proxy/V-dednrZkj8x3gXleQ4vZeQbF2E9GdwdhPDullckxhHSA1ELATqNVvQn84b9x9iXSfZpGQdltEsA-suEWkS9KDj_x4B5zrMw7RGAS4bK)
```
# We are using the table to decode the ciphertext : we use the keyword letter to find the corresponding row, and the letter heading of the column that contains the ciphertext letter is the needed plaintext letter. 
CIPHERTEXT : HCIKV RJOX
KEY        : FREKE YFRE
	         ----------
PLAINTEXT  : CLEAR TEXT
```
## Part II
The ***host*** to which you need to connect is *krypton.labs.overthewire.org*, on ***port*** 2231. The ***username*** is *krypton5* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/edit/main/Krypton/Level5.md#part-i).
```bash
ssh krypton.labs.overthewire.org -p 2231 -l krypton5
# OR ssh krypton5@krypton.labs.overthewire.org -p 2231
# password: CLEARTEXT
```
