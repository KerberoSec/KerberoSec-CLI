## Finding Flags

### Problem
> Each challenge is designed to help introduce you to a new piece of cryptography. Solving a challenge will require you to find a "flag".
> 
> These flags will usually be in the format `crypto{y0ur_f1rst_fl4g}`. The flag format helps you verify that you found the correct solution.
> 
> Try submitting this flag into the form below to solve your first challenge.

### Solution

Simply submit `crypto{y0ur_f1rst_fl4g}`

## Great Snakes

### Problem
> Modern cryptography involves code, and code involves coding. CryptoHack provides a good opportunity to sharpen your skills.
> 
> Of all modern programming languages, Python 3 stands out as ideal for quickly writing cryptographic scripts and attacks. For more information about why we think Python is so great for this, please see the [FAQ](https://cryptohack.org/faq#python3).
> 
> Run the attached Python script and it will output your flag.
> 
> **Challenge files**:
>: [great_snakes.py](https://cryptohack.org/static/challenges/great_snakes_35381fca29d68d8f3f25c9fa0a9026fb.py)

### Solution 
Download `great_snakes.py` file and run it with Python 3.

```shell
python3 great_snakes.py
```
## Network Attacks
### Problem
> Several of the challenges are dynamic and require you to talk to our challenge servers over the network. This allows you to perform man-in-the-middle attacks on people trying to communicate, or directly attack a vulnerable service. To keep things consistent, our interactive servers always send and receive JSON objects.
> 
> Python makes such network communication easy with the telnetlib module. Conveniently, it's part of Python's standard library, so let's use it for now.
> 
> For this challenge, connect to `socket.cryptohack.org` on port `11112`. Send a JSON object with the key buy and value flag.

> The example script below contains the beginnings of a solution for you to modify, and you can reuse it for later challenges.

> Connect at `nc socket.cryptohack.org 11112`

> **Challenge files:**
>: [telnetlib_example.py](https://cryptohack.org/static/challenges/telnetlib_example_dbc6ff5dc4dcfac568d7978a801d3ead.py)

### Solution
Download `telnetlib_example.py` and change "clothes" in line 31 to "flag"

```shell!
b"Welcome to netcat's flag shop!\n"
b'What would you like to buy?\n'
b"I only speak JSON, I hope that's ok.\n"
b'\n'
{'flag': 'crypto{sh0pp1ng_f0r_fl4g5}'}
```