TryHackMe | DNS in Detail | Writeup
---
TryHackMe: DNS in Detail: Writeup
[DNS in Detail](https://tryhackme.com/room/dnsindetail) est une room crée par [adamtlangley](https://tryhackme.com/p/adamtlangley).

Réponse/Flags :
---
### Qu'est-ce qu'un DNS ?

| Question | Answer |
|----------|---------|
|Que signifie DNS ?|Domain Name System|

### Hiérarchie des domaines :

| Question | Answer |
|----------|---------|
|Quelle est la longueur maximale d'un sous-domaine ?|63|
|Lequel des caractères suivants ne peut pas être utilisé dans un sous-domaine ( 3 b _: ) ?|_ |
|Quelle est la longueur maximale d'un nom de domaine ?|253|
|Quel type de TLD est .co.uk ?|ccTLD|

### Record Types :

| Question | Answer |
|----------|---------|
|Quel type d'enregistrement serait utilisé pour indiquer où envoyer un e-mail ?|MX|
|Quel type d'enregistrement gère les adresses IPv6 ?|AAAA|

### Faire une requête :

| Question | Answer |
|----------|---------|
|Quel champ spécifie combien de temps un enregistrement DNS doit être mis en cache ?|TTL|
|Quel type de serveur DNS est généralement fourni par votre FAI ?|Recursive|
|Quel type de serveur détient tous les enregistrements d'un domaine ?|authoritative|

### Pratique

| Question | Answer |
|----------|---------|
|Quel est le CNAME de shop.website.thm ?|shops.myshopify.com|
|Quelle est la valeur de l'enregistrement TXT de website.thm ?|THM{7012BBA60997F35A9516C2E16D2944FF}|
|Quelle est la valeur de priorité numérique de l'enregistrement MX ?|30|
|Quelle est l'adresse IP de l'enregistrement A de www.website.thm ?|10.10.10.10|

Walkthrough
---

### Quel est le CNAME de shop.website.thm ?

```sh
user@thm:~$ nslookup --type=CNAME shop.website.thm
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
shop.website.thm canonical name = shops.myshopify.com
```

### Quelle est la valeur de l'enregistrement TXT de website.thm ?

```sh
user@thm:~$ nslookup --type=TXT website.thm
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
website.thm text = "THM{7012BBA60997F35A9516C2E16D2944FF}"
```

### Quelle est la valeur de priorité numérique de l'enregistrement MX ?

```sh
user@thm:~$ nslookup --type=MX website.thm
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
website.thm mail exchanger = 30 alt4.aspmx.l.google.com
```

### Quelle est l'adresse IP de l'enregistrement A de www.website.thm ?

```sh
user@thm:~$ nslookup --type=A www.website.thm
Server: 127.0.0.53
Address: 127.0.0.53#53

Non-authoritative answer:
Name: www.website.thm
Address: 10.10.10.10
```
Credits : Oxe
