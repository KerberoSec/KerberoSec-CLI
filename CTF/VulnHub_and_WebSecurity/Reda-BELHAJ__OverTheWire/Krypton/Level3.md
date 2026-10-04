# Krypton Level 3
## Part I
Enter the following command in your Terminal :

```bash
find / -name krypton3 -type f
cd /krypton/krypton2/
cat /krypton/krypton2/krypton3
# OMQEMDUEQMEK
```
```bash
mkdir /tmp/reda
cd /tmp/reda
ln -s /krypton/krypton2/keyfile.dat
chmod 777 .
# Lets test the key
echo "ABCD" > test.txt
/krypton/krypton2/encrypt test.txt
cat ciphertext
# 'ABCD' = "MNOP"
```

```bash
cat /krypton/krypton2/krypton3 | tr "[m-za-lM-ZA-L]" "[a-zA-Z]"
```

## Part II
The ***host*** to which you need to connect is *krypton.labs.overthewire.org*, on ***port*** 2231. The ***username*** is *krypton3* and the ***password*** is the text from your clipboard [Part 1](https://github.com/Reda-BELHAJ/OverTheWire/edit/main/Krypton/Level3.md#part-i).
```bash
ssh krypton.labs.overthewire.org -p 2231 -l krypton3
# OR ssh krypton3@krypton.labs.overthewire.org -p 2231
# password: CAESARISEASY
```
