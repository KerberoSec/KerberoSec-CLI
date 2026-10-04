# Mind your Ps and Qs

# Descripción
In RSA, a small `e` value can be problematic, but what about `N`? Can you decrypt this? [values](https://mercury.picoctf.net/static/b9ddda080c56fb421bf30409bec3460d/values)
# Pistas
Bits are expensive, I used only a little bit over 100 to save money
# Solución

```bash
adalh4ck1ng-picoctf@webshell:~$ wget https://mercury.picoctf.net/static/b9ddda080c56fb421bf30409bec3460d/values
--2023-04-27 02:15:52--  https://mercury.picoctf.net/static/b9ddda080c56fb421bf30409bec3460d/values
Resolving mercury.picoctf.net (mercury.picoctf.net)... 18.189.209.142
Connecting to mercury.picoctf.net (mercury.picoctf.net)|18.189.209.142|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 206 [application/octet-stream]
Saving to: 'values'

values                                          100%[======================================================================================================>]     206  --.-KB/s    in 0s      

2023-04-27 02:15:52 (110 MB/s) - 'values' saved [206/206]

adalh4ck1ng-picoctf@webshell:~$ cat values 
Decrypt my super sick RSA:
c: 964354128913912393938480857590969826308054462950561875638492039363373779803642185
n: 1584586296183412107468474423529992275940096154074798537916936609523894209759157543
e: 65537

Python 3.9.6 (tags/v3.9.6:db3ff76, Jun 28 2021, 15:26:21) [MSC v.1929 64 bit (AMD64)] on win32
Type "help", "copyright", "credits" or "license" for more information.
>>> from Crypto.Util.number import long_to_bytes
>>> c=964354128913912393938480857590969826308054462950561875638492039363373779803642185
>>> n=1584586296183412107468474423529992275940096154074798537916936609523894209759157543
>>> e=65537

# Necesitamos factorizar el numero n para poder obtener los valores de p y q originales, para esto usamos una herramienta llamada factordb

n= 2434792384523484381583634042478415057961 * 650809615742055581459820253356987396346063

>>> p=2434792384523484381583634042478415057961
>>> q=650809615742055581459820253356987396346063
>>> r = (p-1)*(q-1)
>>> d= inverse(e,r)
>>> m = pow(c,d,n)
>>> print(long_to_bytes(m))
b'picoCTF{sma11_N_n0_g0od_73918962}'

```

# Bandera
picoCTF{sma11_N_n0_g0od_73918962}