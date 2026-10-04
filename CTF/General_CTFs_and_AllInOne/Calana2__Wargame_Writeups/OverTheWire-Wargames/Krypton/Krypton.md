# Krypton
Link: https://overthewire.org/wargames/krypton/

The Krypton wargame.

## Level 0

Base64
```
$ echo "S1JZUFRPTklTR1JFQVQ="|base64 -d
KRYPTONISGREAT
```

## Level 1
ROT13
```
krypton1@krypton:~$ cat /krypton/krypton1/krypton2 | tr 'A-Za-z' 'N-ZA-Mn-za-m'
LEVEL TWO PASSWORD ROTTEN
```

## Level 2
Cesar (rot12)
```
$ echo "OMQEMDUEQMEK"|tr 'A-Z' 'O-ZA-N'
CAESARISEASY
```

## Level 3
Cifrado por sustitucion monoalfabetica: https://www.dcode.fr/monoalphabetic-substitution
IMAGEN 1
IMAGEN 2
```
WELLD ONETH ELEZE LFOUR PASSW ORDIS BRUTE
```

## Level 4
Cifrado Vigenere: https://www.dcode.fr/vigenere-cipher
```
CLEAR TEXT
```

## Level 5
Cifrado Vigenere (fuerza bruta del tamaño de clave): https://www.dcode.fr/vigenere-cipher
```
RANDO M
```

## Level 6
Cifrado de flujo
```
krypton6@krypton:~$ python -c "print('A'*100)" > /tmp/plain.txt
Command 'python' not found, did you mean:
  command 'python3' from deb python3
  command 'python' from deb python-is-python3
krypton6@krypton:~$ python3 -c "print('A'*100)" > /tmp/plain.txt
krypton6@krypton:~$ cd /krypton/krypton
krypton1/ krypton2/ krypton3/ krypton4/ krypton5/ krypton6/ krypton7/
krypton6@krypton:~$ cd /krypton/krypton6/
krypton6@krypton:/krypton/krypton6$ ls
encrypt6  HINT1  HINT2  keyfile.dat  krypton7  onetime  README
krypton6@krypton:/krypton/krypton6$ ./encrypt6 /tmp/plain.txt /tmp/cipher.txt
failed to create cipher file
krypton6@krypton:/krypton/krypton6$ ls
encrypt6  HINT1  HINT2  keyfile.dat  krypton7  onetime  README
krypton6@krypton:/krypton/krypton6$ ./encrypt6 /tmp/plain.txt /tmp/cipher2.txt
krypton6@krypton:/krypton/krypton6$ cat /tmp/cipher2.txt
EICTDGYIYZKTHNSIRFXYCPFUEOCKRNEICTDGYIYZKTHNSIRFXYCPFUEOCKRNEICTDGYIYZKTHkrypton6@krypton:/krypton/krypton6$ python3 -c "print('B'*100)" > /tmp/plain.txt           
krypton6@krypton:/krypton/krypton6$ ./encrypt6 /tmp/plain.txt /tmp/cipher2.txt
krypton6@krypton:/krypton/krypton6$ cat /tmp/cipher2.txt
FJDUEHZJZALUIOTJSGYZDQGVFPDLSOFJDUEHZJZALUIOTJSGYZDQGVFPDLSOFJDUEHZJZALUIOTJSGYZDQ
```

El resultado es texto ASCII imprimible (mayísculas siempre) y la clave se repite cada 30 bytes. Esto es una especie de Vigeniere?
```py
keystream = "EICTDGYIYZKTHNSIRFXYCPFUEOCKRNEICTDGYIYZKTHNSIRFXYCPFUEOCKRNEICTDGYI"
target = "PNUKLYLWRQKGKBE"

plain = []
for i in range(len(target)):
    # Convert to an alphabet number
    key_byte = ord(keystream[i]) - ord('A') 
    target_byte = ord(target[i]) - ord('A') 

    # Calculate
    # p = (target_byte - key_byte) % 26
    p = (target_byte - key_byte) % 26
    plain.append(chr(p + ord('A')))

print("".join(plain))
# LFSRISNOTRANDOM
```

## Level 7
`Congratulations on beating Krypton!`
