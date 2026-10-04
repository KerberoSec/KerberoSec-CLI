# Challenge Name:
 [*Hash3rror*](https://cybertalents.com/challenges/cryptography/hash3rror)
 
# Challenge Description
we got this corrupted hash password from a Pcap file with a note (password = sha-1(hash-result)).

HASH:77be5d24ed2e3e590045e1d6o7e84i50d2799c19f48ede46804a8734e287df120f 

## Answer
* We have hash code and note tell us that password = sha1(hash-result), so we need to decrypt hash code
* Remove "i" and "o" from hash (becouse hash must contain only hexa char 0 -> f) now we have
> 77be5d24ed2e3e590045e1d67e8450d2799c19f48ede46804a8734e287df120f 
* Use hash-identifier in linux to know algorithm used to hash
```bash
hash-identifier
HASH: 77be5d24ed2e3e590045e1d67e8450d2799c19f48ede46804a8734e287df120f

Possible Hashs:
[+] SHA-256
[+] Haval-256
```
* Decrypt hash code using this [website](https://md5decrypt.net/en/Sha256/)
> 77be5d24ed2e3e590045e1d67e8450d2799c19f48ede46804a8734e287df120f : s3cr3tpassword
> Found in 0.053s
* According to the note our password generated from hash this result using sha1 algorithm so hash it with linux terminal
```bash
echo -n s3cr3tpassword | sha1sum
```
* You got the password!!

 ## The Flag
 > 83874343435092cb681c0d558a84bfeb389c32ed  
