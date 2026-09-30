# Level 15 -> 16

# Descripción
The password for the next level can be retrieved by submitting the password of the current level to **port 30001 on localhost** using SSL encryption.

**Helpful note: Getting “HEARTBEATING” and “Read R BLOCK”? Use -ign_eof and read the “CONNECTED COMMANDS” section in the manpage. Next to ‘R’ and ‘Q’, the ‘B’ command also works in this version of that command…**
# Datos de acceso
bandit15
jN2kgmIXJ6fShzhT2avhotn4Zcka6tnt
# Solución
```bash
bandit15@bandit:~$ openssl s_client -connect localhost:30001
CONNECTED(00000003)
Can't use SSL_get_servername
depth=0 CN = localhost
verify error:num=18:self-signed certificate
verify return:1
depth=0 CN = localhost
verify error:num=10:certificate has expired
notAfter=Feb 21 06:20:29 2023 GMT
verify return:1
depth=0 CN = localhost
notAfter=Feb 21 06:20:29 2023 GMT
verify return:1
---
Certificate chain
 0 s:CN = localhost
   i:CN = localhost
   a:PKEY: rsaEncryption, 2048 (bit); sigalg: RSA-SHA1
   v:NotBefore: Feb 21 06:19:29 2023 GMT; NotAfter: Feb 21 06:20:29 2023 GMT
---
Server certificate
-----BEGIN CERTIFICATE-----
MIIDCzCCAfOgAwIBAgIEA7qUdzANBgkqhkiG9w0BAQUFADAUMRIwEAYDVQQDDAls
b2NhbGhvc3QwHhcNMjMwMjIxMDYxOTI5WhcNMjMwMjIxMDYyMDI5WjAUMRIwEAYD
VQQDDAlsb2NhbGhvc3QwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDL
vM0gZzAHdXTeD5t4ruUJo/kRs4UAodA9XcqDhNtW464W0c55RqKLp921syy3Lvjr
8Q9WkqvCFX+efShMd8XnzbT/dyRrD+cZQnSiPJ3bwDdpwqfkl9h3mb609Kb5HI6R
JgogEyuRLJI+HKtr/wXHwo1vBZ0+yaPMX6sdkd6Hu5Ra0L5Q5+E5+3F/8QgvCeVE
hDRIOrh2a7jxykb8G6+xVC6jIZY0YfrZz6LrESyQau256pqyaQPqQoUWTlitxIql
Ym2Baw7vYDxmFZrvj0FkumC6NokX6K2G9bZ0DaKR/DspPdAC4oT81SawJvsBibdN
51VI6dxBn412ZS8bS155AgMBAAGjZTBjMBQGA1UdEQQNMAuCCWxvY2FsaG9zdDBL
BglghkgBhvhCAQ0EPhY8QXV0b21hdGljYWxseSBnZW5lcmF0ZWQgYnkgTmNhdC4g
U2VlIGh0dHBzOi8vbm1hcC5vcmcvbmNhdC8uMA0GCSqGSIb3DQEBBQUAA4IBAQA9
skxWNwZbedjaVTa5yMPUZQ4Nf5/LAAMtS5Q7mzGH5tdQsTGR0Z4n4eA4hzrmzHBF
MVRL5mR9n+sM5pIrKDa6f4zIc5ObxDyN19ie+3SFASCPz9tihK8Js2V8qsR6LHV1
pfD8DSG0hZPtUuK3Mfi+nWqQUFiiTGj30mb9vlS1sSWv5PGznou1gQ3ZfrDs7B4K
ZKZrllPIVV1CrlDw2Bv8Dc432LQuZAmKAjBd6FG0OAboU/WJMTwAfVjlKMtvC8tg
DZ3djSTprq6PrXlI0utw/MsMIh69b61BRXUuDvRxhU11SNmSI8aegjVL8KuK+Euh
sSLPTocV29SY1YXOwEQi
-----END CERTIFICATE-----
subject=CN = localhost
issuer=CN = localhost
---
No client certificate CA names sent
Peer signing digest: SHA256
Peer signature type: RSA-PSS
Server Temp Key: X25519, 253 bits
---
SSL handshake has read 1339 bytes and written 373 bytes
Verification error: certificate has expired
---
New, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384
Server public key is 2048 bit
Secure Renegotiation IS NOT supported
Compression: NONE
Expansion: NONE
No ALPN negotiated
Early data was not sent
Verify return code: 10 (certificate has expired)
---
---
Post-Handshake New Session Ticket arrived:
SSL-Session:
    Protocol  : TLSv1.3
    Cipher    : TLS_AES_256_GCM_SHA384
    Session-ID: 482843717DB28E5B4112B08C4EC94ABB3A3CCC523733AD71B512F9D229347DC9
    Session-ID-ctx:
    Resumption PSK: 953508674133E52C6CCA923EC7D61E753FA54A243DFE15289DB34B7F87EEB5A41D4BB9F8B79F520FD673563CFB3864A1
    PSK identity: None
    PSK identity hint: None
    SRP username: None
    TLS session ticket lifetime hint: 7200 (seconds)
    TLS session ticket:
    0000 - ee ae 09 e4 56 06 6c 9e-c9 80 86 77 50 83 15 59   ....V.l....wP..Y
    0010 - 20 e8 1c 19 40 5b 30 ed-0e 59 69 ce c3 2d a1 ae    ...@[0..Yi..-..
    0020 - 61 a2 af 58 49 78 81 9d-7b fc f1 ba 04 2e 4a 1c   a..XIx..{.....J.
    0030 - 4f 02 e9 12 34 11 e2 9f-b9 5a a6 8e 0b 42 aa 0b   O...4....Z...B..
    0040 - 4d 8d cc aa 14 84 8a 71-62 1f 66 67 e3 2c 28 4c   M......qb.fg.,(L
    0050 - 39 53 8d 3a 6f cb 7b 70-e4 1a 6b 62 5e c9 d8 ec   9S.:o.{p..kb^...
    0060 - b9 74 f5 11 d7 c4 14 14-a8 64 d5 d5 da 60 de d0   .t.......d...`..
    0070 - 53 c0 23 20 4c 25 57 bb-d0 b4 60 e7 b1 1e 08 57   S.# L%W...`....W
    0080 - a8 f5 98 6a d9 a3 55 c7-53 76 9e c5 61 a8 c8 ee   ...j..U.Sv..a...
    0090 - 5e 77 8e 09 b2 b5 65 ab-00 9c a7 2f 4f 1b 70 de   ^w....e..../O.p.
    00a0 - d1 d9 47 8a 02 23 5c 1b-24 5b 34 7f 87 78 35 1b   ..G..#\.$[4..x5.
    00b0 - eb 36 5b bb cc 90 21 68-f3 48 a5 4e 8c c8 c5 1d   .6[...!h.H.N....
    00c0 - 82 d0 a1 e1 29 f5 e5 67-a2 95 0d c7 d6 62 01 44   ....)..g.....b.D

    Start Time: 1677007716
    Timeout   : 7200 (sec)
    Verify return code: 10 (certificate has expired)
    Extended master secret: no
    Max Early Data: 0
---
read R BLOCK
---
Post-Handshake New Session Ticket arrived:
SSL-Session:
    Protocol  : TLSv1.3
    Cipher    : TLS_AES_256_GCM_SHA384
    Session-ID: 5595C212915BAC56BED0229884220D47324ECA16CE884CC4F02F27F6B753F10B
    Session-ID-ctx:
    Resumption PSK: DA10DDEAB69B096BD62692C5B8DAE6FBAD1C474CDA9E9B5DEE2A93976A0C595E54FAA7B20C4A9DC60C94ED59A9B01456
    PSK identity: None
    PSK identity hint: None
    SRP username: None
    TLS session ticket lifetime hint: 7200 (seconds)
    TLS session ticket:
    0000 - ee ae 09 e4 56 06 6c 9e-c9 80 86 77 50 83 15 59   ....V.l....wP..Y
    0010 - eb ce 90 06 ea b6 bb 4a-37 da 60 e0 ea e9 1a 70   .......J7.`....p
    0020 - 4a c8 e9 7a bf ed 9d d3-34 df d1 cc 0a 8f 5e 52   J..z....4.....^R
    0030 - 25 3c 09 e1 89 70 f5 16-44 65 8b f5 8a 57 d3 49   %<...p..De...W.I
    0040 - 28 97 15 3d 4b bd 92 b2-00 4d 0a b5 15 c2 27 01   (..=K....M....'.
    0050 - 69 b6 22 a1 8b c5 49 ec-3e ce 14 b5 1c 12 6d ff   i."...I.>.....m.
    0060 - 08 ed 41 61 0f a1 17 d7-ff 79 62 b0 9c bf b8 e6   ..Aa.....yb.....
    0070 - 13 cc 65 43 b6 be b0 a5-a2 3a ef 2e d5 ea 42 ea   ..eC.....:....B.
    0080 - c7 f3 1e ff 6d 7f 70 62-47 5f 33 d8 cc ea bc dc   ....m.pbG_3.....
    0090 - 17 33 65 ce 02 f3 0f 30-e2 79 38 b0 90 61 d7 b4   .3e....0.y8..a..
    00a0 - 62 51 69 0d 1c a0 e6 a0-97 c9 c8 4d 8d 0e 9e 87   bQi........M....
    00b0 - 5d af db 26 cb 7a f6 d2-d6 38 20 56 ea a4 60 e3   ]..&.z...8 V..`.
    00c0 - 18 62 4a 63 dd 01 af 08-12 0f 04 70 f6 f4 e9 51   .bJc.......p...Q

    Start Time: 1677007716
    Timeout   : 7200 (sec)
    Verify return code: 10 (certificate has expired)
    Extended master secret: no
    Max Early Data: 0
---
read R BLOCK
jN2kgmIXJ6fShzhT2avhotn4Zcka6tnt
Correct!
JQttfApK4SeyHwDlI9SXGR50qclOAil1

closed

```

# Referencias
https://en.wikipedia.org/wiki/Secure_Socket_Layer
https://www.feistyduck.com/library/openssl-cookbook/online/ch-testing-with-openssl.html