# Crack the hash

<img align="right" src="https://github.com/matthernet/Writeups/blob/main/TryHackMe/Room/images/crackthehash01.jpeg" width="150" height="150">

Cracking hashes challenges.

LINK = [https://tryhackme.com/room/crackthehash](https://tryhackme.com/room/crackthehash)

### FYI
This writeup don't include any passwords/cracked hashes/flags

# Description

Cracking hashes challenges.

# Level 1

48bb6e862e54f2a795ffc4e541caed4d
* Use ```hash-identifier``` to get the hash type, it's an ```MD5``` hash
* ```hashcat -m 0 {hash-value} /usr/share/wordlists/rockyou.txt```

CBFDAC6008F9CAB4083784CBD1874F76618D2A97
* Use ```hash-identifier``` to get the hash type, it's an ```SHA-1``` hash
* ```hashcat -m 100 {hash-value} /usr/share/wordlists/rockyou.txt```

1C8BFE8F801D79745C4631D09FFF36C82AA37FC4CCE4FC946683D7B336B63032
* Use ```hash-identifier``` to get the hash type, it's an ```SHA-256``` hash
* ```hashcat -m 1400 {hash-value} /usr/share/wordlists/rockyou.txt```

$2y$12$Dwt1BZj6pcyc3Dy1FWZ5ieeUznr71EeNkJkUlypTsgbX1H68wsRom
* In this case hash-identifier wont be able to identyfy this but if you search ```$2y$``` you will find that is a hash type used by bcrypt
* Using hashcat normali will take lot of time due the complexity of the hash, but since we know that the answer is 4 character length we can short the password list to try
* ```cat /usr/share/wordlists/rockyou.txt | awk 'length($0) <= 4' > list4.txt```
* ```hashcat -m 3200 hash.txt list4.txt --force```

279412f945939ba78ce0758d3fd83daa
* This password is not in any default rockyou wordlist so you can use [Crackstation](https://crackstation.net/)

# Level 2

F09EDCB1FCEFC6DFB23DC3505A882655FF77375ED8AA2D1C13F640FCCC2D0C85
* Use ```hash-identifier``` to get the hash type, it's an ```SHA-256``` hash
* ```hashcat -m 1400 {hash-value} /usr/share/wordlists/rockyou.txt```

1DFECA0C002AE40B8619ECF94819CC1B
* Use ```hash-identifier``` to get the hash type, it's an ```NTLM``` hash
* ```hashcat -m 1000 {hash-value} /usr/share/wordlists/rockyou.txt```

Hash: $6$aReallyHardSalt$6WKUTqzq.UQQmrm0p/T7MPpMbGNnzXPMAXi4bJMl9be.cfi3/qxIf.hsGpS41BqMhSrHVXgMpdjS6xeKZAs02.
Salt: aReallyHardSalt
* Use ```hash-identifier``` to get the hash type, it's an ```SHA-512``` hash
* ```hashcat -m 1800 hash.txt /usr/share/wordlists/rockyou.txt``` (be patient, cracking this hash will take a lot of time)

Hash: e5d8870e5bdd26602cab8dbe07a942c8669e56d6
Salt: tryhackme
* Use ```hash-identifier``` to get the hash type, it's an ```SHA-1``` hash
* In this case we have to add the salt since is not include in the hash
* ```hashcat -m 160 {hash}:{salt} /usr/share/wordlists/rockyou.txt```

Get the all the flags!! 😎
