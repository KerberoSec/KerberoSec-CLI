# DNS: Transfert de zone

## Challenge

A not really dutiful administrator has set up a DNS service for the "ch11.challenge01.root-me.org" domain...

## Solution

On utilise la commande Linux `dig` afin d'obtenir les informations du DNS, avec les options suivantes : `dig @challenge01.root-me.org -p 54011 ch11.challenge01.root-me.org ANY`

Le flag est dans le retour de cette commande, section DNS transfer secret key

## Flag

CBkFRwfNMMtRjHY
