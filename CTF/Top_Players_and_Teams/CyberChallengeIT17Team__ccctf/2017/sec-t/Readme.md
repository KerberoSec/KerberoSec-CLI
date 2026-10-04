# [SEC-T CTF 2017](http://sect.ctf.rocks)
## Pwn
### Date
We have to write on a global variable at address 0x6012A8 where is stored the address to the shell command that must be executed by system().
The default value is "date" and it is checked with strstr() before the system() call.
But strstr() return true also if there are bytes after "date", so we can set the string to "date;/bin/sh".
Using the scanf buffer overflow we write "date;/bin/sh\0" in the data section and we rewrite the global variable with the address of our buffer.

The exploit is Date/date_exploit.py
## The gibson
TODO

## Crypto
### BadAes
We have an AES-CBC encrypted file and we are given
- the key
- the initialization vector
- most of the [substitution box](https://en.wikipedia.org/wiki/Advanced_Encryption_Standard#The_SubBytes_step)

Each of the values of the substitution box has to be unique and in the range [0, 255], so the 8 missing values can only be a permutaion of {4, 198, 168, 137, 49, 105, 188, 62}.

We just need to try 8! = 40320 combinations and check which of them contains the string `SECT`.

We need to find the source code of an implementation of aes-cbc and substitute the sbox with our own values and each permutation of the missing values and then compute the reverse sbox.  
https://github.com/CyberChallengeIT17Team/tiny-AES-c  
http://www.geeksforgeeks.org/write-a-c-program-to-print-all-permutations-of-a-given-string/
