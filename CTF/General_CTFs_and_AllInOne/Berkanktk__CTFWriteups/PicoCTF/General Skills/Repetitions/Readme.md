# Repetitions
## Description
Can you make sense of this file?

## Solution
Lets start by looking at the file:
```bash
$ cat repetitions
VmpGU1EyRXlUWGxTYmxKVVYwZFNWbGxyV21GV1JteDBUbFpPYWxKdFVsaFpWVlUxWVZaS1ZWWnVh
RmRXZWtab1dWWmtSMk5yTlZWWApiVVpUVm10d1VWZFdVa2RpYlZaWFZtNVdVZ3BpU0VKeldWUkNk
MlZXVlhoWGJYQk9VbFJXU0ZkcVRuTldaM0JZVWpGS2VWWkdaSGRXCk1sWnpWV3hhVm1KRk5XOVVW
VkpEVGxaYVdFMVhSbFZrTTBKVVZXMTRWMDVHV2toalJYUlhDazFyV25sVVZXaHpWakpHZEdWRlZs
aGkKYlRrelZERldUMkpzUWxWTlJYTkxDZz09Cg==
```

It looks like a base64 encoded string. Lets decode it:
```bash
$ base64 -d enc_flag > decoded
$ cat decoded
VjFSQ2EyTXlSblJUV0dSVllrWmFWRmx0TlZOalJtUlhZVVU1YVZKVVZuaFdWekZoWVZkR2NrNVVX
bUZTVmtwUVdWUkdibVZXVm5WUgpiSEJzWVRCd2VWVXhXbXBOUlRWSFdqTnNWZ3BYUjFKeVZGZHdW
MlZzVWxaVmJFNW9UVVJDTlZaWE1XRlVkM0JUVW14V05GWkhjRXRXCk1rWnlUVWhzVjJGdGVFVlhi
bTkzVDFWT2JsQlVNRXNLCg==
```
As expected based on the task name, we have nested base64 encoded strings. 

To get past this, we can write a script to decode the string until it is no longer base64 encoded:
```python
import base64

with open('enc_flag', 'r') as f:
    enc = f.read()

def nested_bas64_decode(enc):
    while True:
        enc = base64.b64decode(enc).decode()

        if 'pico' in enc:
            print(enc)
            break

nested_bas64_decode(enc)

# Output
# picoCTF{flag_is_shown_here}
```

That's it! Just like that, we got the flag!
