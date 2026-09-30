# Krypton

## Level 0

* Goal: Welcome to Krypton! The first level is easy. The following string encodes the password using Base64: S1JZUFRPTklTR1JFQVQ=. Use this password to log in to krypton.labs.overthewire.org with username krypton1 using SSH on port 2231. You can find the files for other levels in /krypton/

* Solution -

```shell
base64 --help

echo S1JZUFRPTklTR1JFQVQ= > decode.txt

base64 -d decode.txt
#password (KRYPTONISGREAT)

ssh krypton.labs.overthewire.org -p 2231 -l krypton1
```

## Level 1

* Goal: The password for level 2 is in the file ‘krypton2’. It is ‘encrypted’ using a simple rotation. It is also in non-standard ciphertext format. When using alpha characters for cipher text it is normal to group the letters into 5 letter clusters, regardless of word boundaries. This helps obfuscate any patterns. This file has kept the plain text word boundaries and carried them to the cipher text. Enjoy!

* Solution -

```shell
ls -la
#no files

ls -la /krypton/
#contains files for levels

ls -la /krypton/krypton1/
#contains 2 files

cat /krypton/krypton1/README
#instructions

cat /krypton/krypton1/krypton2
#contains ROT13 encrypted text
#YRIRY GJB CNFFJBEQ EBGGRA

tr 'A-Z' 'N-ZA-M'
#enter encrypted text
#LEVEL TWO PASSWORD ROTTEN
#password (ROTTEN)

exit
```

## Level 2

* Goal: The password for level 3 is in the file krypton3. It is in 5 letter group ciphertext. It is encrypted with a Caesar Cipher. Without any further information, this cipher text may be difficult to break. You do not have direct access to the key, however you do have access to a program that will encrypt anything you wish to give it using the key. If you think logically, this is completely easy.

* Solution -

```shell
ssh krypton.labs.overthewire.org -p 2231 -l krypton2

ls -la /krypton/krypton2
#shows files

cat /krypton/krypton2/README

cat /krypton/krypton2/krypton3
#contains encrypted password OMQEMDUEQMEK

mktemp -d

cd /tmp/tmp.RWWXXJoIOv

ln -s /krypton/krypton2/keyfile.dat
#creates symbolic link, for encrypt to run

ls -la

chmod 777 .
#full permission

/krypton/krypton2/encrypt
#use to encrypt file containing plaintext

/krypton/krypton2/encrypt /etc/issue
#trial, as given in README
#creates ciphertext file

ls -la

cat ciphertext
#has plaintext converted to ciphertext

touch testfile

vim testfile
#we can add alphabets A-Z here to see how the encrypt function works

/krypton/krypton2/encrypt testfile

cat ciphertext
#contains text from M-Z and A-L
#we can use tr to decode ciphertext

tr 'M-ZA-L' 'A-Z' < /krypton/krypton2/krypton3
#password (CAESARISEASY)

exit
```

## Level 3

* Goal: The password to the next level is found in the file ‘krypton4’. You have also found 3 other files. (found1, found2, found3) You know the following important details: The message plaintexts are in English: They were produced from the same key.

* Solution -

```shell
ssh krypton.labs.overthewire.org -p 2231 -l krypton3

ls -la /krypton/krypton3
#shows multiple files

cat /krypton/krypton3/README

cat /krypton/krypton3/krypton4
#contains encrypted password

cat /krypton/krypton3/HINT1
#some letters are more prevalent in English than others

cat /krypton/krypton3/HINT2
#frequency analysis is your friend

cat /krypton/krypton3/found1
#contains more encrypted text
#found2 and found3 also have encrypted text
#all of them from the same key

grep -o . /krypton/krypton3/found1 | sort | uniq -c | sort -rn
#for letter frequency analysis
#grep -o for only matching input, sort and uniq combined for counting all characters
#sort -rn for sorting numerically in reverse
#this gives a letter count

grep -o . /krypton/krypton3/found2 | sort | uniq -c | sort -rn

grep -o . /krypton/krypton3/found3 | sort | uniq -c | sort -rn
#all three files gives S,Q,J,N,U,B,C as most common characters
#in English language we can check which characters are most common
#E,A,R,I,O,T,N are most common
#so we can use tr to attempt cracking of krypton4 cipher

tr 'S-ZA-R' 'E-ZA-D' < /krypton/krypton3/krypton4
#did not work
#try replacing letter by letter now

tr '[S]' '[E]' < /krypton/krypton3/krypton4
#replaces S by E in cipher text
#by increasing one character at a time, we can try to crack cipher

tr '[JDS]' '[THE]' < /krypton/krypton3/krypton4
#JDS is a common string, so it can be THE in plaintext

tr '[JDSQ]' '[THEA]' < /krypton/krypton3/krypton4

tr '[JDSQN]' '[THEAO]' < /krypton/krypton3/krypton4
#we can notice some words, based on that trial and error can work

tr '[JDSQNVI]' '[THEAOLV]' < /krypton/krypton3/krypton4

tr '[JDSQNVIK]' '[THEAOLVW]' < /krypton/krypton3/krypton4

tr '[JDSQBVIKWG]' '[THEAOLVWDN]' < /krypton/krypton3/krypton4
#we can see that WELL DONE is the first part, so we can carry on

tr '[JDSQBVIKWGU]' '[THEAOLVWDNS]' < /krypton/krypton3/krypton4
#we can see the letters for the word PASSWORD, so we will guess more

tr '[JDSQBVIKWGUYN]' '[THEAOLVWDNSPR]' < /krypton/krypton3/krypton4
#the word before PASSWORD can be FOUR

tr '[JDSQBVIKWGUYNXMCA]' '[THEAOLVWDNSPRFUIB]' < /krypton/krypton3/krypton4
#WELL DONE THE LEVEL FOUR PASSWORD IS BRUTE
#we can confirm this by using same key for found files
#password (BRUTE)

exit
```

## Level 4

* Goal: This level is a Vigenère Cipher. You have intercepted two longer, english language messages. You also have a key piece of information. You know the key length! For this exercise, the key length is 6. The password to level five is in the usual place, encrypted with the 6 letter key.

* Solution -

```shell
ssh krypton.labs.overthewire.org -p 2231 -l krypton4

cd /krypton/krypton4

ls -la
#contains files, password in krypton5

cat found1

cat found2

cat HINT
#FA (Frequency Analysis) by keylength
#we have to analyze cipher texts at position 1,6,12,.. to reveal first letter, for example

mktemp -d

cd /tmp/tmp.7KeX4jePyK

vim trial.sh
: '
#!/bin/sh

cat < /krypton/krypton4/found1 | grep [A-Z] | sed 's: ::g' | sed -E 's/(.).{0,5}/\1/g' > found1_shift
grep -o . found1_shift | sort | uniq -c | sort -rn

#stores all characters at every 6 indices in a file
#tail -c +1 for telling it to start from 1st character, as we will change it later
#for printing frequency of every character related to first letter of key
#so this is frequency analysis for first character of key
#we can do the same for different files and different indices
'

chmod 777 trial.sh
#keep editing the script, running it for different files and noting down the outputs in a file
#we know E,A,R,I,O,T,N are most common English characters
#so we can apply the same logic here and use trial-and-error
#we can also use [A-Z] mapped to [0-25] as a range to refer

#so, if J is most common in found1, that means it is mapped to E
#so first letter of key could be 9 - 4 = 5, that is, F

#similarly, we have to find all characters of the keytext

#modified script for other indices
: '
#!/bin/sh

cat < /krypton/krypton4/found1 | grep [A-Z] | sed 's: ::g' | tail -c +2  | sed -E 's/(.).{1,5}/\1/g' > found1_shift1
grep -o . found1_shift1 | sort | uniq -c | sort -rn

#tail -c +2 used for reading from second character onwards
'

#for characters 1,7,13,.. most common is V(21)
#so second possible character for keytext is 21 - 4 = 17
#for characters 2,8,14,.. most common is I(8)
#so third character is 8 - 4 = 4
#possible keytext - FREKEY

cat /krypton/krypton4/krypton5
#HCIKV RJOX
#now we need to use this keytext to decode the password (plaintext)
#using the logic of Plaintext + Keytext = Ciphertext

#password (CLEARTEXT)
```

## Level 5

* Goal: FA can break a known key length as well. Lets try one last polyalphabetic cipher, but this time the key length is unknown.

* Solution -

```shell
ssh krypton.labs.overthewire.org -p 2231 -l krypton5

cd /krypton/krypton5

ls -la
#contains multiple files, encrypted using same key as password file

cat krypton6
#BELOS Z
#encrypted password using key of unknown length

mktemp -d

cd /tmp/tmp.2E6AhPCldN

vim trial.sh
#as key length is unknown, we will do FA like previous example
: '
#!/bin/bash

cat < /krypton/krypton5/found1 | grep [A-Z] | sed 's: ::g' | tail -c +1 | sed -E 's/(.).{1,2}/\1/g' > found1-shift0
grep -o . found1-shift0 | sort | uniq -c | sort -rn

'

chmod 777 trial.sh

./trial.sh
#similar to previous problem, we have to keep doing FA
#by shifting one letter at a time
#for all three found files
#we can try for keysize = 3
#upto keysize = 12
#and accordingly decode the password

#we can edit tail -c +x, where x is the number less than or equal to key size, and greater than 1

#after trying, we got results for keysize = 9
#key - XEYLENBTH
#after doing the same for the other two files
#we got key - KEYLENGTH
#now we can decode the password

#password (RANDOM)
```

## Level 6

* Goal: In this example, the keyfile is in your directory, however it is not readable by you. The binary ‘encrypt6’ is also available. It will read the keyfile and encrypt any message you desire, using the key AND a ‘random’ number. You get to perform a ‘known ciphertext’ attack by introducing plaintext of your choice. The challenge here is not simple, but the ‘random’ number generator is weak.

* Solution -

```shell
ssh krypton.labs.overthewire.org -p 2231 -l krypton6

cd /krypton/krypton6

ls -la

cd onetime/

ls -la
#contains plaintext, keytext and ciphertext, as examples

cd ..

cat README
#go through all given files

cat HINT1
#random generator has limited, periodic number of bits
#entropy analysis and hex editor can help

mktemp -d

cd /tmp/tmp.hZbRDFqDu3

ln -s /krypton/krypton6/keyfile.dat

chmod 777 .

vim sample.txt
#create a text file and add some sample text to it
#ONCEUPONATIMETHERELIVEDABOY

/krypton/krypton6/encrypt6 sample.txt samplecipher.txt
#encrypt sample text file to see how encryption works here

cat samplecipher.txt

xxd -b sample.txt
#hexdump in binary

xxd -b samplecipher.txt
#now we can XOR the both of them to obtain keytext

#Alternatively, we can create a textfile containing base values only (A in this case)
#And encrypt it so that the ciphertext obtained is same as key

vim atext.txt

/krypton/krypton6/encrypt6 atext.txt cipher.txt

cat cipher.txt
#shows ciphertext, which contains repeated keytext
#keytext is EICTDGYIYZKTHNSIRFXYCPFUEOCKRN

cat /krypton/krypton6/krypton7
#PNUKLYLWRQKGKBE

#we can now use tools to decode the password cipher
#password (LFSRISNOTRANDOM)

exit
```
