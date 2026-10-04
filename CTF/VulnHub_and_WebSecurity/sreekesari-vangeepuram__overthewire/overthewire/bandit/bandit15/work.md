Another simple challenge!
![Bandit15](https://github.com/sreekesari-vangeepuram/overthewire/blob/master/overthewire/bandit/bandit15/level15-%3Elevel16.png)

Let's see what we should do here!
```
bandit15@bandit:~$ openssl s_client -connect localhost:30001 -ign_eof
CONNECTED(00000003)
depth=0 CN = localhost
verify error:num=18:self signed certificate
verify return:1
depth=0 CN = localhost
verify return:1
---
Certificate chain
 0 s:/CN=localhost
   i:/CN=localhost
---
Server certificate
-----BEGIN CERTIFICATE-----
MIICBjCCAW+gAwIBAgIEDU18oTANBgkqhkiG9w0BAQUFADAUMRIwEAYDVQQDDAls
b2NhbGhvc3QwHhcNMjAwNTA3MTgxNTQzWhcNMjEwNTA3MTgxNTQzWjAUMRIwEAYD
VQQDDAlsb2NhbGhvc3QwgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBAK3CPNFR
FEypcqUa8NslmIMWl9xq53Cwhs/fvYHAvauyfE3uDVyyX79Z34Tkot6YflAoufnS
+puh2Kgq7aDaF+xhE+FPcz1JE0C2bflGfEtx4l3qy79SRpLiZ7eio8NPasvduG5e
pkuHefwI4c7GS6Y7OTz/6IpxqXBzv3c+x93TAgMBAAGjZTBjMBQGA1UdEQQNMAuC
CWxvY2FsaG9zdDBLBglghkgBhvhCAQ0EPhY8QXV0b21hdGljYWxseSBnZW5lcmF0
ZWQgYnkgTmNhdC4gU2VlIGh0dHBzOi8vbm1hcC5vcmcvbmNhdC8uMA0GCSqGSIb3
DQEBBQUAA4GBAC9uy1rF2U/OSBXbQJYuPuzT5mYwcjEEV0XwyiX1MFZbKUlyFZUw
rq+P1HfFp+BSODtk6tHM9bTz+p2OJRXuELG0ly8+Nf/hO/mYS1i5Ekzv4PL9hO8q
PfmDXTHs23Tc7ctLqPRj4/4qxw6RF4SM+uxkAuHgT/NDW1LphxkJlKGn
-----END CERTIFICATE-----
subject=/CN=localhost
issuer=/CN=localhost
---
No client certificate CA names sent
Peer signing digest: SHA512
Server Temp Key: X25519, 253 bits
---
SSL handshake has read 1019 bytes and written 269 bytes
Verification error: self signed certificate
---
New, TLSv1.2, Cipher is ECDHE-RSA-AES256-GCM-SHA384
Server public key is 1024 bit
Secure Renegotiation IS supported
Compression: NONE
Expansion: NONE
No ALPN negotiated
SSL-Session:
    Protocol  : TLSv1.2
    Cipher    : ECDHE-RSA-AES256-GCM-SHA384
    Session-ID: EAA72E969B7D237508C856905392C8A74A932390335E40344B7CE66011BDDE0C
    Session-ID-ctx: 
    Master-Key: 73EBD52AC2C0E48C35D8F25571EC5169E97AC1A2A4B2E9830EE2C13416B544D3EBBF525C79796FAE9A31CC002315BBAC
    PSK identity: None
    PSK identity hint: None
    SRP username: None
    TLS session ticket lifetime hint: 7200 (seconds)
    TLS session ticket:
    0000 - aa 02 e6 3a 2e 0b c8 5d-6f 54 4a 1b 5a e0 2c 0e   ...:...]oTJ.Z.,.
    0010 - 03 59 3b c9 59 0c 16 cf-ef a1 88 29 0c 55 64 c5   .Y;.Y......).Ud.
    0020 - 12 c4 69 74 0e 32 f9 e3-ea e6 85 96 f4 61 98 8a   ..it.2.......a..
    0030 - 18 1c 87 f7 ff 0d 30 1e-5e 70 7e df 79 87 ca 79   ......0.^p~.y..y
    0040 - d8 5e fa ff f0 63 67 12-3d 22 b9 26 40 84 29 b0   .^...cg.=".&@.).
    0050 - 06 74 8a ba a2 44 2c 93-f3 0f 10 f6 75 49 f5 64   .t...D,.....uI.d
    0060 - 2f af 08 9b 63 71 e8 4a-71 ce 15 29 33 00 39 7c   /...cq.Jq..)3.9|
    0070 - 00 98 e6 9f e1 e2 03 ce-57 33 7e 05 6b ef 14 f2   ........W3~.k...
    0080 - 07 9a ab fa f0 cf b1 5a-e4 75 fc 93 32 a1 30 86   .......Z.u..2.0.
    0090 - a8 e5 3c 44 79 25 10 e8-83 ca 39 66 e2 a2 8a 51   ..<Dy%....9f...Q

    Start Time: 1598987432
    Timeout   : 7200 (sec)
    Verify return code: 18 (self signed certificate)
    Extended master secret: yes
---
BfMYroe26WYalil77FoDi9qh59eK5xNr
Correct!
cluFn7wTiGryunymYOu4RcffSxQluehd

closed
bandit15@bandit:~$
```

If you are somewhat familiar with SSL/TLS this is a simple challenge for you!
Read more about the tool `openssl`.

See the description in its manual page:
```
DESCRIPTION
       OpenSSL is a cryptography toolkit implementing the Secure Sockets Layer (SSL v2/v3) and Transport Layer Security (TLS v1)
       network protocols and related cryptography standards required by them.

       The openssl program is a command line tool for using the various cryptography functions of OpenSSL's crypto library from the
       shell.  It can be used for
```

Hope you've learnt something new from this [if you don't know this before/didn't strike to you during the start].

Now, let's use the password `cluFn7wTiGryunymYOu4RcffSxQluehd` to log into the remote-machine as `bandit15`.

**Warning: Please, first try Level 16 -> Level 17! Otherwise it's useless to simply cpy-pst the command[s]/password[s].
