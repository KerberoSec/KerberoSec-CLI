# TryHackMe Crack the hash Writeup

https://hashcat.net/wiki/doku.php?id=example_hashes

<details>
  <summary>Level 1</summary>

``md5``

```
48bb6e862e54f2a795ffc4e541caed4d
```

``output``

```
easy
```

> used ``https://10015.io/tools/md5-encrypt-decrypt``

---
---

``SHA 1``

> know used ``hashid`` on linux or ``https://hashes.com/en/tools/hash_identifier``

```
CBFDAC6008F9CAB4083784CBD1874F76618D2A97 
```

``output``

```
password123
```

> used ``https://10015.io/tools/sha1-encrypt-decrypt``

---
---

``SHA 256``

```
1C8BFE8F801D79745C4631D09FFF36C82AA37FC4CCE4FC946683D7B336B63032
```

``output``

```
letmein
```

> ``https://10015.io/tools/sha256-encrypt-decrypt``

----
----

``bcrypt $2*$, Blowfish (Unix)``

```
$2y$12$Dwt1BZj6pcyc3Dy1FWZ5ieeUznr71EeNkJkUlypTsgbX1H68wsRom
```

``output``

```

```

> ``hashcat -m 3200 -a 0 hash.txt passwords_list.txt --force``
> ``hashcat -m 3200 -a 0 hash.txt passwords_list.txt --show ``

![image](https://github.com/user-attachments/assets/d870887a-fb50-44d4-8944-710c08ee2997)

![image](https://github.com/user-attachments/assets/81962211-52b5-4aab-93d2-8d59f7ff5327)

```
$2y$12$Dwt1BZj6pcyc3Dy1FWZ5ieeUznr71EeNkJkUlypTsgbX1H68wsRom:bleh
```

----
----

``md4``

> ``279412f945939ba78ce0758d3fd83daa:457465726e6974793232:MD4``

```
279412f945939ba78ce0758d3fd83daa
```

``output``

```
Eternity22
```

> used ``https://md5decrypt.net/en/Md4/``

</details>

<details>
  <summary>level2</summary>

``SHA256``

```
F09EDCB1FCEFC6DFB23DC3505A882655FF77375ED8AA2D1C13F640FCCC2D0C85
```

``OUTput``

```
paule
```

> used ``https://crackstation.net/``

---
---

``NTLM``

```
1DFECA0C002AE40B8619ECF94819CC1B
```

``output``

```
n63umy8lkf4i
```

> used ``https://crackstation.net/``

-----
-----

``sha512crypt $6$, SHA512 (Unix) 2``

> used to know type ``https://hashcat.net/wiki/doku.php?id=example_hashes``

```
$6$aReallyHardSalt$6WKUTqzq.UQQmrm0p/T7MPpMbGNnzXPMAXi4bJMl9be.cfi3/qxIf.hsGpS41BqMhSrHVXgMpdjS6xeKZAs02
```

![image](https://github.com/user-attachments/assets/351d4ec3-8320-47da-a7a5-ed54f95a3794)

```
waka99
```

----
----

``hmac-sha1``

```
e5d8870e5bdd26602cab8dbe07a942c8669e56d6
```

```
481616481616
```

> ``hashcat -a 0 -m 160 hash.txt /usr/share/wordlists/rockyou.txt --force ``

![image](https://github.com/user-attachments/assets/02f6567c-4e81-454c-82ff-a1a49a2f0ace)

  
</details>

