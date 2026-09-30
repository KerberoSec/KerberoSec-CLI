# IP: Time To Live

## Challenge

Find the TTL used to reach the targeted host in this ICMP exchange.

## Solution

En utilisant Wireshark, on observe que les premières requêtes de 24.6.126.218 vers 24.6.126.218 échouent toutes avec une erreur TTL exceeded. La requête du paquet 71 est la première à réussir (pas d'erreur TTL exceeded)

## Flag

13
