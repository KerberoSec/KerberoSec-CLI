# PW Crack 5

**Points:** 100

**Description:** Can you crack the password to get the flag?
Download the password checker here and you'll need the encrypted flag and the hash in the same directory too. Here's a dictionary with all possible passwords based on the password conventions we've seen so far.

## Solution 

### Step 1

After downloading the two files, run the `cat level5.py` command to read the Python script. 

![Screenshot from 2023-07-16 21-14-38](https://github.com/HelsNetwork/CTF-writeups/assets/87879515/bb605989-e05a-4823-a9a2-9cd54d03f236)

We have a dictionary with possible passwords, and our objective is to identify the correct one. For this, we will modify the Python script to iterate through the list dictionary and find the correct password.

```python
import hashlib
def hash_pw(pw_str):
    pw_bytes = bytearray()
    pw_bytes.extend(pw_str.encode())
    m = hashlib.md5()
    m.update(pw_bytes)
    return m.digest()
correct_pw_hash = open('level5.hash.bin', 'rb').read()
dic = open('dictionary.txt', 'r').readlines()

for i in dic:
    i = i.strip()

    if (hash_pw(i) == correct_pw_hash):
        print(i)
```

`password = eee0`
