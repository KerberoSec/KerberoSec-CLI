# [Crack the hash: Easy][1]

Table of Contents
=================
* [Tools](#tools)
* [Level 1](#level-1)
  * [Hash 1: MD5](#hash-1---md5)
  * [Hash 2: SHA1](#hash-2---ntlm)
  * [Hash 3: SHA256](#hash-3---sha256)
  * [Hash 4: bcrypt $2*$, Blowfish (Unix)](#hash-4---bcrypt--blowfish-unix)
  * [Hash 5: MD4](#hash-5---md4)
* [Level 2](#level-2)
  * [Hash 1: SHA256](#hash-1---sha256)
  * [Hash 2: NTLM](#hash-2---sha1)
  * [Hash 3: sha512crypt $6$, SHA512 (Unix)](#hash-3---sha512crypt--sha512-unix)
  * [Hash 4: SHA1](#hash-4---sha1)

## Tools
in this room i have used [hashes.com hash identifier][2] and [hashcat examples][3] to identify the hashing algorithm with hashcat and [hashes.com Decrypt Tool][4] to crack the hashes<br>
to install hashcat  on Debain based distros run the following command:

```bash
sudo apt-get update && sudo apt-get install hashcat
```

## Level 1

### Hash 1: MD5
Hash: 48bb6e862e54f2a795ffc4e541caed4d

First use [Hash Identifier][2] site to identify the hashing algorithm:<br>
`48bb6e862e54f2a795ffc4e541caed4d - easy - Possible algorithms: MD5`<br>
After knowing the algorithm i will use [hashes decrypt tool][4] to decrypt the hash:<br>
`48bb6e862e54f2a795ffc4e541caed4d:easy`

### Hash 2: SHA1
Hash: CBFDAC6008F9CAB4083784CBD1874F76618D2A97<br>

Same steps as [Hash 1: MD5](#hash-1---md5)<br>
[Hash Identifier:][2]<br>
`CBFDAC6008F9CAB4083784CBD1874F76618D2A97 - Possible algorithms: SHA1`

[Hashes Decrypt:][4]<br>
`CBFDAC6008F9CAB4083784CBD1874F76618D2A97:password123`

### Hash 3: SHA256
Hash: 1C8BFE8F801D79745C4631D09FFF36C82AA37FC4CCE4FC946683D7B336B63032

Same steps as [Hash 1: MD5](#hash-1---md5)<br>
[Hash Identifier:][2]<br>
`1C8BFE8F801D79745C4631D09FFF36C82AA37FC4CCE4FC946683D7B336B63032 - Possible algorithms: SHA256`

[Hashes Decrypt:][4]<br>
`1C8BFE8F801D79745C4631D09FFF36C82AA37FC4CCE4FC946683D7B336B63032:letmein`

### Hash 4: bcrypt $2*$, Blowfish (Unix)
Hash: $2y$12$Dwt1BZj6pcyc3Dy1FWZ5ieeUznr71EeNkJkUlypTsgbX1H68wsRom
Same steps as [Hash 1: MD5](#hash-1---md5)<br>
[Hash Identifier:][2]<br>
`$2y$12$Dwt1BZj6pcyc3Dy1FWZ5ieeUznr71EeNkJkUlypTsgbX1H68wsRom - Possible algorithms: bcrypt $2*$, Blowfish (Unix)`

[Hashes Decrypt:][4]<br>
`$2y$12$Dwt1BZj6pcyc3Dy1FWZ5ieeUznr71EeNkJkUlypTsgbX1H68wsRom:bleh`

### Hash 5: MD4
Hash: 279412f945939ba78ce0758d3fd83daa

Same steps as [Hash 1: MD5](#hash-1---md5)<br>
[Hash Identifier:][2]<br>
`279412f945939ba78ce0758d3fd83daa - Possible algorithms: MD4`

[Hashes Decrypt:][4]<br>
`279412f945939ba78ce0758d3fd83daa:Eternity22`

## Level 2

### Hash 1: SHA256
Hash: F09EDCB1FCEFC6DFB23DC3505A882655FF77375ED8AA2D1C13F640FCCC2D0C85

Same steps as [Hash 1: MD5](#hash-1---md5)<br>
[Hash Identifier:][2]<br>
`F09EDCB1FCEFC6DFB23DC3505A882655FF77375ED8AA2D1C13F640FCCC2D0C85 - Possible algorithms: SHA256`

[Hashes Decrypt:][4]<br>
`F09EDCB1FCEFC6DFB23DC3505A882655FF77375ED8AA2D1C13F640FCCC2D0C85:paule`

### Hash 2: NTLM
Hash: 1DFECA0C002AE40B8619ECF94819CC1B

Same steps as [Hash 1: MD5](#hash-1---md5)<br>
[Hash Identifier:][2]<br>
`1DFECA0C002AE40B8619ECF94819CC1B - Possible algorithms: NTLM`

[Hashes Decrypt:][4]<br>
`1DFECA0C002AE40B8619ECF94819CC1B:n63umy8lkf4i`

### Hash 3: sha512crypt $6$, SHA512 (Unix)
Hash: $6$aReallyHardSalt$6WKUTqzq.UQQmrm0p/T7MPpMbGNnzXPMAXi4bJMl9be.cfi3/qxIf.hsGpS41BqMhSrHVXgMpdjS6xeKZAs02.<br>
Salt: aReallyHardSalt

[Hash Identifier:][2]<br>
`$6$aReallyHardSalt$6WKUTqzq.UQQmrm0p/T7MPpMbGNnzXPMAXi4bJMl9be.cfi3/qxIf.hsGpS41BqMhSrHVXgMpdjS6xeKZAs02. - Possible algorithms: sha512crypt $6$, SHA512 (Unix)`

```bash
hashcat -m 1800 sha512.hash rockyou.txt
```
`$6$aReallyHardSalt$6WKUTqzq.UQQmrm0p/T7MPpMbGNnzXPMAXi4bJMl9be.cfi3/qxIf.hsGpS41BqMhSrHVXgMpdjS6xeKZAs02.:waka99`

### Hash 4: SHA1
Hash: e5d8870e5bdd26602cab8dbe07a942c8669e56d6<br>
Salt: tryhackme

Same steps as [Hash 1: MD5](#hash-1---md5)<br>
[Hash Identifier:][2]<br>
`e5d8870e5bdd26602cab8dbe07a942c8669e56d6 - Possible algorithms: SHA1`

[Hashes Decrypt:][4]<br>
`e5d8870e5bdd26602cab8dbe07a942c8669e56d6:tryhackme:481616481616`

[1]: https://tryhackme.com/room/crackthehash
[2]: https://hashes.com/en/tools/hash_identifier
[3]: https://hashcat.net/wiki/doku.php?id=example_hashes
[4]: https://hashes.com/en/decrypt/hash/
