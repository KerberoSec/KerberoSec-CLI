# [The Krypton wargame](https://overthewire.org/wargames/krypton/)
host: [krypton.labs.overthewire.org](krypton.labs.overthewire.org)  
port: 2231  
username: krypton<level>  
start password: bandit0  
### login via ssh
```
ssh krypton<level>@krypton.labs.overthewire.org -p 2231
```

### level 0 -> 1
S1JZUFRPTklTR1JFQVQ= -> [decode from base64] -> KRYPTONISGREAT  
**password:**  
KRYPTONISGREAT

### level 1 -> 2
YRIRY GJB CNFFJBEQ EBGGRA -> [Decode from ROT13] -> LEVEL TWO PASSWORD ROTTEN  
**password:**  
ROTTEN

### level 2 -> 3
OMQEMDUEQMEK -> [Decode from Caesar Cipher(+12 shift)] -> CAESARISEASY  
**password:**  
CAESARISEASY

### level 3 -> 4
Use [frequency analysis tool online](https://math.dartmouth.edu/~awilson/tools/frequency_analysis.html) to find the substitution
```shell
cd /krypton/krypton3
cat krypton4 | tr ABCDEFGHIJKLMNOPQRSTUVWXYZ BOIHGKNQVTWYURXZAJEMSLDFPC
```
**password:**  
WELL DONE THE LEVEL FOUR PASSWORD IS **BRUTE**

### level 4 -> 5
Use [Vigenere dechiper](https://www.boxentriq.com/code-breaking/vigenere-cipher) on found1  
-> key = 'frekey'  
-> krypton5 = 'CLEAR TEXT'  
**password:**  
CLEARTEXT

### level 5 -> 6
Use [Vigenere dechiper](https://www.boxentriq.com/code-breaking/vigenere-cipher) on found1  
```shell
-> key = 'keylength'  
-> krypton6 = 'RANDO M'  
```
**password:**  
RANDOM

### level 6 -> 7
"known ciphertext attack"
```shell
krypton6@krypton:~$ mkdir /tmp/asdf
krypton6@krypton:~$ cd /tmp/asdf
krypton6@krypton:/tmp/asdf$ ln -s /krypton/krypton6/keyfile.dat
krypton6@krypton:/tmp/asdf$ ln -s /krypton/krypton6/encrypt6
krypton6@krypton:/tmp/asdf$ python -c "print('A'*1000)" > t1
krypton6@krypton:/tmp/asdf$ ./encrypt6 t1 t2
krypton6@krypton:/tmp/asdf$ cat t2
EICTDGYIYZKTHNSIRFXYCPFUEOCKRNEICTDGYIYZKTHNSIRFXYCPFUEOCKRNEICTDGYIYZKTHNSIRFXYCPFUEOCKRNEICTDGYIYZKTHNSIRFXYCPFUEOCKRN.....
....
```
its the key 'EICTDGYIYZKTHNSIRFXYCPFUEOCKRN' that repeat itself.  
now lets get the chiper
```shell
krypton6@krypton:/tmp/asdf$ cat /krypton/krypton6/krypton7
PNUKLYLWRQKGKBE
```
create python script to dechiper the chiper:
```python
key = "EICTDGYIYZKTHNSIRFXYCPFUEOCKRN"
chp = "PNUKLYLWRQKGKBE"
res = ''
for i in range(len(chp)):
    t = ord(chp[i]) - ord(key[i])
    if t < 0:
        t += 26
    res += chr(t+ord('A'))
print(res)
```
run the script and get the password
```shell
krypton6@krypton:/tmp/asdf$ python script.py
LFSRISNOTRANDOM
```
**password:**  
LFSRISNOTRANDOM
